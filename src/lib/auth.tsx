import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { AuthError, Session, User, Provider } from '@supabase/supabase-js'
import { useSiteConfig, getEnabledProviders as getConfiguredProviders, getProviderConfig } from './config'

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
  ) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithOAuth: (
    provider: Provider,
  ) => Promise<{ error: AuthError | null }>
  signInWithOtp: (
    email: string,
    captchaToken?: string,
  ) => Promise<{ error: AuthError | null }>
  verifyOtp: (
    email: string,
    token: string,
    captchaToken?: string,
  ) => Promise<{ error: AuthError | null }>
  getEnabledProviders: () => Promise<Array<Provider>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const config = useSiteConfig()

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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

  const signUp = async (email: string, password: string, captchaToken?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
      },
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

    // Get provider config for custom scopes
    const providerConfig = getProviderConfig(provider)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: callbackUrl.toString(),
        scopes: providerConfig?.scopes,
      },
    })
    return { error }
  }

  const signInWithOtp = async (email: string, captchaToken?: string) => {
    // Respect allowSignup config - only create new users if allowed
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: config.auth?.allowSignup ?? true,
        captchaToken,
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
