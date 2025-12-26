/**
 * Cookie Storage Adapter for Supabase Auth
 *
 * This adapter enables cross-subdomain session sharing by storing
 * Supabase auth sessions in cookies instead of localStorage.
 *
 * Use case:
 * - SSO site: auth.example.com
 * - Business site: console.example.com or example.com
 *
 * By setting domain=.example.com, the session cookie is accessible
 * across all subdomains, enabling seamless authentication.
 */

import Cookies from 'js-cookie'
import type { SupportedStorage } from '@supabase/supabase-js'
import { getCachedConfig } from './config-service'
import { defaultConfig } from '@/../site.config.default'

/**
 * Cookie domain for cross-subdomain sharing
 * Examples:
 * - '.example.com' - shares across all subdomains (auth.example.com, console.example.com, etc.)
 * - 'localhost' - for local development
 */
const COOKIE_DOMAIN =
  import.meta.env.VITE_COOKIE_DOMAIN || window.location.hostname

/**
 * Cookie options for production
 */
const isProduction = import.meta.env.PROD
const isSecure = window.location.protocol === 'https:'

/**
 * Creates a cookie-based storage adapter for Supabase Auth
 *
 * @returns StorageAdapter compatible with Supabase createClient
 *
 * @example
 * ```typescript
 * import { createClient } from '@supabase/supabase-js'
 * import { cookieStorage } from './cookieStorage'
 *
 * const supabase = createClient(url, key, {
 *   auth: {
 *     storage: cookieStorage,
 *   }
 * })
 * ```
 */
export const cookieStorage: SupportedStorage = {
  /**
   * Get item from cookie storage
   */
  getItem: (key: string): string | null => {
    return Cookies.get(key) || null
  },

  /**
   * Set item to cookie storage with cross-subdomain support
   */
  setItem: (key: string, value: string): void => {
    // Try to get dynamic config, fallback to default
    const config = getCachedConfig() || defaultConfig
    const cookieOptions = config.auth.cookieOptions || defaultConfig.auth.cookieOptions

    Cookies.set(key, value, {
      expires: cookieOptions?.expires ?? 365,
      path: '/',
      domain: COOKIE_DOMAIN,
      sameSite: (cookieOptions?.sameSite as any) ?? 'Lax',
      secure: isProduction && isSecure, // HTTPS only in production
    })
  },

  /**
   * Remove item from cookie storage
   */
  removeItem: (key: string): void => {
    Cookies.remove(key, {
      path: '/',
      domain: COOKIE_DOMAIN,
    })
  },
}

/**
 * Get the current cookie domain
 * Useful for debugging
 */
export function getCookieDomain(): string {
  return COOKIE_DOMAIN
}
