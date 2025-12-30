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
  const url = new URL(window.location.href)

  // Check for OAuth error in URL (e.g., user denied access)
  const oauthError = url.searchParams.get('error')
  const oauthErrorDescription = url.searchParams.get('error_description')
  if (oauthError) {
    console.error('[auth-init] OAuth error:', oauthError, oauthErrorDescription)
    // Clear error params from URL
    url.searchParams.delete('error')
    url.searchParams.delete('error_description')
    window.history.replaceState({}, '', url.toString())

    return {
      user: null,
      session: null,
      isAuthenticated: false,
    }
  }

  // Check for hash fragment (some OAuth providers return tokens in hash)
  // Format: #access_token=xxx&refresh_token=xxx&...
  if (url.hash && url.hash.length > 1) {
    const hashParams = new URLSearchParams(url.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken) {
      console.log('[auth-init] Found tokens in hash fragment, setting session...')

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      })

      // Clear hash from URL
      window.history.replaceState({}, '', url.pathname + url.search)

      if (error) {
        console.error('[auth-init] Set session from hash failed:', error.message)
        return {
          user: null,
          session: null,
          isAuthenticated: false,
        }
      }

      console.log('[auth-init] Session set from hash, user:', data.session?.user?.email || 'no user')

      return {
        user: data.session?.user ?? null,
        session: data.session,
        isAuthenticated: !!data.session,
      }
    }
  }

  // Check for authorization code (PKCE flow)
  const code = url.searchParams.get('code')
  if (code) {
    // This is an OAuth callback - exchange the code for a session
    // The code_verifier should already be in cookie storage from the initial OAuth request
    console.log('[auth-init] Found authorization code, exchanging for session...')

    // Debug: Check if code_verifier exists in storage
    // Supabase stores it with a key like 'sb-<project-ref>-auth-token-code-verifier'
    const allCookies = document.cookie
    const hasCodeVerifier = allCookies.includes('code-verifier') || allCookies.includes('code_verifier')
    console.log('[auth-init] Cookies contain code_verifier:', hasCodeVerifier)
    console.log('[auth-init] All cookies:', allCookies.substring(0, 500))

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

    console.log('[auth-init] Code exchange successful, session:', data.session ? 'exists' : 'null')
    console.log('[auth-init] User:', data.session?.user?.email || 'no user')

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
  console.log('[auth-init] No OAuth code, loading session from storage...')
  console.log('[auth-init] Current cookies:', document.cookie.substring(0, 500))

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('[auth-init] getSession result:', session ? 'session exists' : 'null')
  console.log('[auth-init] User from storage:', session?.user?.email || 'no user')

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
