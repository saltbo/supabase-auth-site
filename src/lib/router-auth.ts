/**
 * Router Auth Bridge
 *
 * This module provides a way to dynamically update the TanStack Router's
 * auth context when the auth state changes (e.g., after login/logout).
 *
 * Problem: TanStack Router's context is a static snapshot created at router
 * initialization. When auth state changes (OTP login, password login, logout),
 * the router context doesn't automatically update, causing route guards to
 * use stale auth state.
 *
 * Solution: Use router.update() to dynamically update the context when
 * auth state changes.
 */

import type { Router } from '@tanstack/react-router'
import type { AuthState, RouterContext } from './auth-init'

// Store router reference for dynamic updates
let routerInstance: Router<any, any, any, any> | null = null

/**
 * Register the router instance for auth updates
 * Called once during app bootstrap
 */
export function registerRouter(router: Router<any, any, any, any>) {
  routerInstance = router
}

/**
 * Update router's auth context
 * Call this when auth state changes (login, logout, etc.)
 */
export function updateRouterAuthContext(authState: AuthState) {
  if (!routerInstance) {
    console.warn('[router-auth] Router not registered, cannot update context')
    return
  }

  console.log('[router-auth] Updating router auth context:', {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user?.email || 'none',
  })

  // Update router context with new auth state
  routerInstance.update({
    context: {
      auth: authState,
    } as RouterContext,
  })

  // Invalidate the router to re-run beforeLoad checks
  routerInstance.invalidate()
}

/**
 * Get current router instance (for advanced use cases)
 */
export function getRouter() {
  return routerInstance
}
