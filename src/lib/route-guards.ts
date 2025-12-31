/**
 * Route Guards - Pure authentication checks
 *
 * Design principle: Guards only check and throw redirects.
 * They don't handle redirect targets or storage - that's the page's job.
 */

import { redirect } from '@tanstack/react-router'
import type { RouterContext } from './auth-init'
import { isValidRedirectUrl } from './redirect-manager'

/**
 * Require Authentication
 *
 * Use in beforeLoad to protect routes that require login.
 * Redirects to /signin with the current path as redirect parameter.
 *
 * @example
 * beforeLoad: ({ context, location }) => {
 *   requireAuth(context, { redirectTo: location.pathname })
 * }
 */
export function requireAuth(
  context: RouterContext,
  options?: { redirectTo?: string }
): { session: NonNullable<typeof context.auth.session> } {
  if (!context.auth.isAuthenticated || !context.auth.session) {
    const signInUrl = options?.redirectTo
      ? `/signin?redirect=${encodeURIComponent(options.redirectTo)}`
      : '/signin'

    throw redirect({ to: signInUrl })
  }

  return { session: context.auth.session }
}

/**
 * Require Guest (Not Authenticated)
 *
 * Use in beforeLoad to redirect authenticated users away.
 * Reads redirect target from URL search params if present.
 *
 * @example
 * beforeLoad: ({ context, location }) => {
 *   requireGuest(context, location)
 * }
 */
export function requireGuest(
  context: RouterContext,
  location: { search: { redirect?: string } },
  fallbackRedirect: string = '/'
): void {
  if (context.auth.isAuthenticated) {
    // Read redirect param from parsed search object
    const redirectParam = location.search.redirect

    // Use redirect param if valid, otherwise fallback
    let redirectTo = fallbackRedirect
    if (redirectParam && isValidRedirectUrl(redirectParam)) {
      redirectTo = redirectParam
    }

    throw redirect({ to: redirectTo })
  }
}
