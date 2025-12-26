import { redirect } from '@tanstack/react-router'
import { supabase } from './supabase'


/**
 * Route Guard: Require Authentication
 *
 * Use this in TanStack Router's `beforeLoad` to protect routes that require authentication.
 * Redirects unauthenticated users to the signin page with a redirect parameter.
 *
 * @param options - Configuration options
 * @param options.redirectTo - The current path to return to after signin (optional)
 * @returns Session object if authenticated
 * @throws Redirect to signin page if not authenticated
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: async ({ location }) => {
 *     return await requireAuth({ redirectTo: location.pathname })
 *   },
 * })
 * ```
 */
export async function requireAuth(options?: {
  redirectTo?: string
}): Promise<{ session: any }> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Build signin URL with redirect parameter
    const signInUrl = options?.redirectTo
      ? `/signin?redirect=${encodeURIComponent(options.redirectTo)}`
      : '/signin'

    throw redirect({ to: signInUrl })
  }

  return { session }
}

/**
 * Route Guard: Require Guest (Not Authenticated)
 *
 * Use this to redirect authenticated users away from guest-only pages (e.g., signin).
 *
 * @param redirectTo - Where to redirect authenticated users (default: '/')
 * @throws Redirect if user is authenticated
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/signin')({
 *   beforeLoad: async () => {
 *     return await requireGuest('/dashboard')
 *   },
 * })
 * ```
 */
export async function requireGuest(redirectTo: string = '/'): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    throw redirect({ to: redirectTo })
  }
}
