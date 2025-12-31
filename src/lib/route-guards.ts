import { redirect } from '@tanstack/react-router'
import type { RouterContext } from './auth-init'
import { getAuthRedirect, clearAuthRedirect, isValidRedirect } from './redirect'

/**
 * Route Guard: Require Authentication
 *
 * Use this in TanStack Router's `beforeLoad` to protect routes that require authentication.
 * Redirects unauthenticated users to the signin page with a redirect parameter.
 *
 * This guard uses the router context which is initialized before routing starts,
 * ensuring the auth state is always stable and consistent.
 *
 * @param context - Router context containing auth state
 * @param options - Configuration options
 * @param options.redirectTo - The current path to return to after signin (optional)
 * @returns Session object if authenticated
 * @throws Redirect to signin page if not authenticated
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: ({ context, location }) => {
 *     return requireAuth(context, { redirectTo: location.pathname })
 *   },
 * })
 * ```
 */
export function requireAuth(
  context: RouterContext,
  options?: { redirectTo?: string }
): { session: typeof context.auth.session } {
  if (!context.auth.isAuthenticated || !context.auth.session) {
    const signInUrl = options?.redirectTo
      ? `/signin?redirect=${encodeURIComponent(options.redirectTo)}`
      : '/signin'

    throw redirect({ to: signInUrl })
  }

  return { session: context.auth.session }
}

/**
 * Route Guard: Require Guest (Not Authenticated)
 *
 * Use this to redirect authenticated users away from guest-only pages (e.g., signin).
 * When a stored redirect URL exists in sessionStorage, it will be used instead of
 * the default redirect target. This enables the unified redirect flow where:
 * 1. User visits a protected page → redirected to /signin with redirect param
 * 2. Redirect URL is saved to sessionStorage
 * 3. After login, requireGuest detects auth and redirects to stored URL
 *
 * @param context - Router context containing auth state
 * @param defaultRedirectTo - Fallback redirect target if no stored redirect (default: '/')
 * @throws Redirect if user is authenticated
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/signin')({
 *   beforeLoad: ({ context }) => {
 *     return requireGuest(context)
 *   },
 * })
 * ```
 */
export function requireGuest(context: RouterContext, defaultRedirectTo: string = '/'): void {
  if (context.auth.isAuthenticated) {
    // Check for stored redirect URL (set by resolveRedirect on signin page)
    const storedRedirect = getAuthRedirect()
    if (storedRedirect && isValidRedirect(storedRedirect)) {
      clearAuthRedirect()
      throw redirect({ to: storedRedirect })
    }
    throw redirect({ to: defaultRedirectTo })
  }
}
