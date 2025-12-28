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
import { getCachedConfig, mergeWithDefaultConfig } from './config-service'

/**
 * Cookie domain for cross-subdomain sharing
 * Examples:
 * - '.example.com' - shares across all subdomains (auth.example.com, console.example.com, etc.)
 * - 'localhost' - for local development
 */
function resolveCookieDomain(): string {
  const rawConfig = getCachedConfig()
  const config = mergeWithDefaultConfig(rawConfig)

  return config.auth.session.domain || window.location.hostname
}

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
    const rawConfig = getCachedConfig()
    const config = mergeWithDefaultConfig(rawConfig)
    const session = config.auth.session
    const domain = resolveCookieDomain()

    Cookies.set(key, value, {
      expires: session.expires,
      path: '/',
      domain: domain,
      sameSite: session.sameSite as any,
      secure: isProduction && isSecure, // HTTPS only in production
    })
  },

  /**
   * Remove item from cookie storage
   */
  removeItem: (key: string): void => {
    const domain = resolveCookieDomain()
    Cookies.remove(key, {
      path: '/',
      domain: domain,
    })
  },
}

/**
 * Get the current cookie domain
 * Useful for debugging
 */
export function getCookieDomain(): string {
  return resolveCookieDomain()
}