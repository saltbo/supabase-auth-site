/**
 * Redirect Manager - Unified Post-Login Redirect Handling
 *
 * Design principles:
 * 1. Single write point: only capture() writes to storage
 * 2. Single execution point: only execute() performs redirect
 * 3. Pure validation: isValidUrl() has no side effects
 * 4. Clear lifecycle: capture → get → execute → (auto clear)
 */

const STORAGE_KEY = 'auth_redirect'

// ============ Validation (Pure functions, no side effects) ============

/**
 * Validate if a URL is a safe redirect target
 * - Allows relative paths (starting with single /)
 * - Allows same-origin URLs
 * - Allows cross-subdomain URLs only when VITE_COOKIE_DOMAIN is configured
 */
export function isValidRedirectUrl(url: string): boolean {
  if (!url) return false

  // Relative path: must start with single /
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true
  }

  try {
    const targetUrl = new URL(url)
    const currentHost = window.location.hostname

    // Same origin
    if (targetUrl.hostname === currentHost) {
      return true
    }

    // Cross-subdomain: only allow when SSO is configured
    return isAllowedCrossDomain(targetUrl.hostname, currentHost)
  } catch {
    return false
  }
}

/**
 * Check if cross-subdomain redirect is allowed
 * Priority:
 * 1. If VITE_COOKIE_DOMAIN is configured, use that
 * 2. Otherwise, auto-detect same root domain (e.g., auth.example.com allows app.example.com)
 */
function isAllowedCrossDomain(targetHost: string, currentHost: string): boolean {
  const cookieDomain = import.meta.env.VITE_COOKIE_DOMAIN as string | undefined

  if (cookieDomain) {
    // cookieDomain format: '.example.com'
    if (cookieDomain.startsWith('.')) {
      const rootDomain = cookieDomain.substring(1) // 'example.com'
      const targetMatches = targetHost === rootDomain || targetHost.endsWith(cookieDomain)
      const currentMatches = currentHost === rootDomain || currentHost.endsWith(cookieDomain)
      return targetMatches && currentMatches
    }

    // Exact match
    return targetHost === cookieDomain && currentHost === cookieDomain
  }

  // Auto-detect: allow same root domain (e.g., auth.example.com allows app.example.com)
  const currentParts = currentHost.split('.')
  const targetParts = targetHost.split('.')

  if (currentParts.length >= 2 && targetParts.length >= 2) {
    const currentRoot = currentParts.slice(-2).join('.')
    const targetRoot = targetParts.slice(-2).join('.')
    return currentRoot === targetRoot
  }

  return false
}

/**
 * Check if referrer is a valid redirect source
 * Excludes auth-related pages
 */
function isValidReferrer(referrer: string): boolean {
  if (!referrer || !isValidRedirectUrl(referrer)) {
    return false
  }

  try {
    const url = new URL(referrer, window.location.origin)
    const authPaths = ['/signin', '/signup', '/verify-otp', '/callback', '/signout', '/forgot-password']
    return !authPaths.some(path => url.pathname.startsWith(path))
  } catch {
    return false
  }
}

// ============ Storage Operations (Explicit side effects) ============

/**
 * Capture redirect intent and store it
 *
 * This is the ONLY place that writes to storage.
 * Priority: queryParam > referrer > (keep existing)
 *
 * @returns The captured target URL, or undefined
 */
export function captureRedirectIntent(queryParam?: string): string | undefined {
  // 1. Query parameter takes priority
  if (queryParam && isValidRedirectUrl(queryParam)) {
    sessionStorage.setItem(STORAGE_KEY, queryParam)
    return queryParam
  }

  // 2. Try referrer
  const referrer = document.referrer
  if (isValidReferrer(referrer)) {
    sessionStorage.setItem(STORAGE_KEY, referrer)
    return referrer
  }

  // 3. Don't overwrite existing value
  return getRedirectTarget()
}

/**
 * Get stored redirect target (without clearing)
 */
export function getRedirectTarget(): string | undefined {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  // Re-validate to prevent tampering
  if (stored && isValidRedirectUrl(stored)) {
    return stored
  }
  return undefined
}

/**
 * Clear stored redirect target
 */
export function clearRedirectTarget(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

// ============ Redirect Execution (Unified exit point) ============

export interface NavigateFunction {
  (opts: { to: string }): void
}

/**
 * Execute post-login redirect
 *
 * This is the ONLY place that performs redirect after login.
 * Automatically distinguishes between SPA navigation and cross-domain redirect.
 *
 * @param navigate - TanStack Router's navigate function
 * @param fallback - Default path when no stored target (default: '/')
 */
export function executePostLoginRedirect(
  navigate: NavigateFunction,
  fallback: string = '/'
): void {
  const target = getRedirectTarget()
  clearRedirectTarget()

  const destination = target || fallback

  if (destination.startsWith('http')) {
    // Cross-domain: use window.location (full page reload)
    window.location.href = destination
  } else {
    // Same-domain: use SPA navigation (no reload)
    navigate({ to: destination })
  }
}

/**
 * Execute post-logout redirect
 *
 * Logout always uses full page reload to ensure complete state reset.
 *
 * @param redirectParam - Optional redirect URL from query param
 */
export function executePostLogoutRedirect(redirectParam?: string): void {
  let destination = '/signin'

  if (redirectParam && isValidRedirectUrl(redirectParam)) {
    destination = redirectParam
  }

  // Always full page reload on logout
  if (destination.startsWith('/')) {
    window.location.href = window.location.origin + destination
  } else {
    window.location.href = destination
  }
}
