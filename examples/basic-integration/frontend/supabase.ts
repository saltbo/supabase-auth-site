import { createClient } from '@supabase/supabase-js'
import { cookieStorage } from './cookieStorage'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

/**
 * Shared Supabase Client
 * Configured with cookieStorage to enable SSO across subdomains.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
