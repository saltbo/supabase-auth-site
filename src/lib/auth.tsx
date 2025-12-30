import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import type { AuthError, Session, User, Provider, AuthChangeEvent } from '@supabase/supabase-js'
import {
  useSiteConfig,
  getEnabledProviders as getConfiguredProviders,
  isSignupAllowed
} from './config'
import { getProviderMetadata } from './auth-providers'
import type { AuthState } from './auth-init'
import { updateRouterAuthContext } from './router-auth'

export type { Provider }

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (
    email: string,
    password: string,
    captchaToken?: string,
  ) => Promise<{ error: AuthError | null }>
  signUp: (
    email: string,
    password: string,
    captchaToken?: string,
    inviteCode?: string,
  ) => Promise<{ error: AuthError | null }>
  resetPasswordForEmail: (
    email: string,
    captchaToken?: string,
  ) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithOAuth: (
    provider: Provider,
  ) => Promise<{ error: AuthError | null }>
  signInWithOtp: (
    email: string,
    captchaToken?: string,
    flow?: 'otp' | 'magiclink',
  ) => Promise<{ error: AuthError | null }>
  verifyOtp: (
    email: string,
    token: string,
    captchaToken?: string,
  ) => Promise<{ error: AuthError | null }>
  getEnabledProviders: () => Promise<Array<Provider>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  initialState?: AuthState
}

export function AuthProvider({ children, initialState }: AuthProviderProps) {
  // Use initial state if provided (from auth-init), otherwise start with null
  const [user, setUser] = useState<User | null>(initialState?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialState?.session ?? null)
  // If initialState is provided, auth is already initialized
  const [loading, setLoading] = useState(!initialState)
  const config = useSiteConfig()

  // Track if we've already initialized with initialState to prevent
  // onAuthStateChange's INITIAL_SESSION event from overwriting it
  const initializedRef = useRef(!!initialState)

  useEffect(() => {
    // If no initial state was provided, fetch session (fallback for backward compatibility)
    if (!initialState) {
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        setLoading(false)
      })
    }

    // Listen for auth state changes (sign in, sign out, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      // Skip INITIAL_SESSION event if we already have initialState
      // This prevents the initial event from overwriting our pre-loaded session
      if (event === 'INITIAL_SESSION' && initializedRef.current) {
        console.log('[AuthProvider] Skipping INITIAL_SESSION event, already initialized')
        return
      }

      console.log('[AuthProvider] Auth state changed:', event, nextSession?.user?.email || 'no user')
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)

      // Update router context so route guards have fresh auth state
      // This enables SPA navigation after login without page refresh
      const newAuthState: AuthState = {
        user: nextSession?.user ?? null,
        session: nextSession,
        isAuthenticated: !!nextSession,
      }
      updateRouterAuthContext(newAuthState)
    })

    return () => subscription.unsubscribe()
  }, [initialState])

  const signIn = async (
    email: string,
    password: string,
    captchaToken?: string,
  ) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      },
    })
    return { error }
  }

  const signUp = async (
    email: string, 
    password: string, 
    captchaToken?: string,
    inviteCode?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: inviteCode ? { invite_code: inviteCode } : undefined,
      },
    })
    return { error }
  }

  const resetPasswordForEmail = async (email: string, captchaToken?: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      captchaToken,
      redirectTo: new URL('/auth/callback?next=/console/settings', window.location.origin).toString(),
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signInWithOAuth = async (provider: Provider) => {
    // OAuth 回调始终到 /auth/callback，然后由 callback 页面处理最终跳转
    const callbackUrl = new URL('/callback', window.location.origin)

    // Get provider metadata for custom scopes
    const providerMetadata = getProviderMetadata(provider as string)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: callbackUrl.toString(),
        scopes: providerMetadata?.defaultScopes,
      },
    })
    return { error }
  }

  const signInWithOtp = async (
    email: string, 
    captchaToken?: string,
    flow: 'otp' | 'magiclink' = 'otp'
  ) => {
    // Respect allowSignup config - only create new users if allowed
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: isSignupAllowed(config),
        captchaToken,
        emailRedirectTo: flow === 'magiclink' ? window.location.origin : undefined,
      },
    })
    return { error }
  }

  const verifyOtp = async (
    email: string,
    token: string,
    captchaToken?: string,
  ) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
      options: {
        captchaToken,
      },
    })
    return { error }
  }

  const getEnabledProviders = async (): Promise<Array<Provider>> => {
    // Get enabled providers from config
    return (getConfiguredProviders(config) as Provider[])
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    resetPasswordForEmail,
    signOut,
    signInWithOAuth,
    signInWithOtp,
    verifyOtp,
    getEnabledProviders,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}