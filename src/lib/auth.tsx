import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import type { AuthError as SupabaseAuthError, Session, User, Provider, AuthChangeEvent } from '@supabase/supabase-js'
import {
  useSiteConfig,
  getEnabledProviders as getConfiguredProviders,
  isSignupAllowed
} from './config'
import { getProviderMetadata } from './auth-providers'
import type { AuthState, AuthError } from './auth-init'

export type { Provider }

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  /** OAuth initialization error (e.g., user denied access) */
  initError?: AuthError
  signIn: (
    email: string,
    password: string,
    captchaToken?: string,
  ) => Promise<{ error: SupabaseAuthError | null }>
  signUp: (
    email: string,
    password: string,
    captchaToken?: string,
    inviteCode?: string,
  ) => Promise<{ error: SupabaseAuthError | null }>
  resetPasswordForEmail: (
    email: string,
    captchaToken?: string,
  ) => Promise<{ error: SupabaseAuthError | null }>
  signOut: () => Promise<{ error: SupabaseAuthError | null }>
  signInWithOAuth: (
    provider: Provider,
  ) => Promise<{ error: SupabaseAuthError | null }>
  signInWithOtp: (
    email: string,
    captchaToken?: string,
    flow?: 'otp' | 'magiclink',
  ) => Promise<{ error: SupabaseAuthError | null }>
  verifyOtp: (
    email: string,
    token: string,
    captchaToken?: string,
  ) => Promise<{ error: SupabaseAuthError | null }>
  /** Get enabled OAuth providers (synchronous) */
  getEnabledProviders: () => Provider[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  initialState?: AuthState
}

export function AuthProvider({ children, initialState }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialState?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialState?.session ?? null)
  const [loading, setLoading] = useState(!initialState)
  const config = useSiteConfig()

  // Store init error from OAuth flow
  const initError = initialState?.error

  // Track if we have initialState to skip INITIAL_SESSION event
  const hasInitialState = useRef(!!initialState)

  useEffect(() => {
    // If no initial state, fetch session
    if (!hasInitialState.current) {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s)
        setUser(s?.user ?? null)
        setLoading(false)
      })
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, nextSession) => {
        // Skip INITIAL_SESSION if we already have initialState
        if (event === 'INITIAL_SESSION' && hasInitialState.current) {
          return
        }

        setSession(nextSession)
        setUser(nextSession?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, []) // Remove initialState dependency to avoid re-subscription

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
      // Use /callback, then redirect logic handles the rest
      redirectTo: new URL('/callback', window.location.origin).toString(),
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

  // Synchronous - no need for async
  const getEnabledProviders = (): Provider[] => {
    return getConfiguredProviders(config) as Provider[]
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    initError,
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