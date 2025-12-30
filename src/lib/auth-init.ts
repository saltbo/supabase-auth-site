/**
 * Auth Initialization Module
 *
 * This module handles the initial auth state before the router starts.
 * It ensures that:
 * 1. Any pending OAuth code exchange is completed
 * 2. The session is properly loaded from storage
 * 3. The auth state is stable before route guards run
 */

import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
}

/**
 * Initialize auth state by:
 * 1. Checking for OAuth code in URL and exchanging it for session
 * 2. Loading existing session from storage
 *
 * This should be called once before creating the router.
 */
export async function initializeAuth(): Promise<AuthState> {
  // Check if this is an OAuth callback with a code parameter
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')

  if (code) {
    // This is an OAuth callback - exchange the code for a session
    // The code_verifier should already be in cookie storage from the initial OAuth request
    console.log('[auth-init] Exchanging code for session...')

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth-init] Code exchange failed:', error.message)
      // Clear the code from URL to prevent retry loops
      url.searchParams.delete('code')
      window.history.replaceState({}, '', url.toString())

      return {
        user: null,
        session: null,
        isAuthenticated: false,
      }
    }

    console.log('[auth-init] Code exchange successful')

    // Clear the code from URL after successful exchange
    url.searchParams.delete('code')
    window.history.replaceState({}, '', url.toString())

    return {
      user: data.session?.user ?? null,
      session: data.session,
      isAuthenticated: !!data.session,
    }
  }

  // No OAuth code - just load existing session from storage
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return {
    user: session?.user ?? null,
    session,
    isAuthenticated: !!session,
  }
}

/**
 * Router context type for auth state
 * Used by TanStack Router's context mechanism
 */
export interface RouterContext {
  auth: AuthState
}
