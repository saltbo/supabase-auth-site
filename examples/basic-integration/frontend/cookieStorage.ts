import Cookies from 'js-cookie'
import type { SupportedStorage } from '@supabase/supabase-js'

/**
 * Custom Cookie Storage Adapter
 * Used to share sessions across subdomains by setting the 'domain' attribute.
 */
export const cookieStorage: SupportedStorage = {
  getItem: (key) => {
    return Cookies.get(key) ?? null
  },
  setItem: (key, value) => {
    Cookies.set(key, value, {
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.example.com',
      path: '/',
      sameSite: 'Lax',
      secure: true, // Requires HTTPS
      expires: 365,
    })
  },
  removeItem: (key) => {
    Cookies.remove(key, {
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.example.com',
      path: '/',
    })
  },
}
