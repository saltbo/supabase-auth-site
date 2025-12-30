/**
 * Cookie Storage Adapter for Supabase Auth
 *
 * This adapter enables cross-subdomain session sharing by storing
 * Supabase auth sessions in cookies instead of localStorage.
 *
 * Smart Defaults (no configuration needed):
 * - auth.example.com → cookie domain: .example.com (auto SSO)
 * - example.com → cookie domain: .example.com
 * - localhost → cookie domain: (none) - current host only
 *
 * Optional environment variables (to override defaults):
 * - VITE_COOKIE_DOMAIN: Explicit cookie domain (e.g., '.example.com')
 * - VITE_COOKIE_SAMESITE: SameSite attribute ('Lax' | 'Strict' | 'None') - default: 'Lax'
 * - VITE_COOKIE_EXPIRES: Cookie expiration in days - default: 30
 */

import Cookies from 'js-cookie'
import type { SupportedStorage } from '@supabase/supabase-js'

/**
 * Cookie configuration from environment variables
 * These are static configuration that should be set at build/deploy time
 */
const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN as string | undefined
const COOKIE_SAMESITE = (import.meta.env.VITE_COOKIE_SAMESITE as 'Lax' | 'Strict' | 'None') || 'Lax'
const COOKIE_EXPIRES = Number(import.meta.env.VITE_COOKIE_EXPIRES) || 30

const isProduction = import.meta.env.PROD
const isSecure = window.location.protocol === 'https:'

/**
 * Extract root domain from hostname for cross-subdomain cookies
 * Examples:
 * - auth.example.com -> .example.com
 * - example.com -> .example.com
 * - localhost -> undefined (no domain attribute)
 * - 127.0.0.1 -> undefined (no domain attribute)
 */
function extractRootDomain(hostname: string): string | undefined {
  // Localhost or IP address - don't set domain attribute
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname) // IPv4 pattern
  ) {
    return undefined
  }

  const parts = hostname.split('.')

  // Single part hostname (unlikely but handle it)
  if (parts.length < 2) {
    return undefined
  }

  // Extract root domain (last two parts)
  // auth.example.com -> .example.com
  // example.com -> .example.com
  const rootDomain = '.' + parts.slice(-2).join('.')

  return rootDomain
}

/**
 * Resolve cookie domain with smart defaults
 * Priority:
 * 1. VITE_COOKIE_DOMAIN environment variable (explicit config)
 * 2. Auto-extracted root domain (e.g., .example.com for auth.example.com)
 * 3. undefined for localhost/IP (uses current host)
 */
function resolveCookieDomain(): string | undefined {
  // Explicit config takes priority
  if (COOKIE_DOMAIN) {
    return COOKIE_DOMAIN
  }

  // Smart default: extract root domain for cross-subdomain SSO
  return extractRootDomain(window.location.hostname)
}

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
    const domain = resolveCookieDomain()

    const cookieOptions = {
      expires: COOKIE_EXPIRES,
      path: '/',
      domain: domain,
      sameSite: COOKIE_SAMESITE as any,
      secure: isProduction && isSecure, // HTTPS only in production
    }

    console.log('[cookieStorage] Setting cookie:', {
      key,
      domain: domain || '(current hostname)',
      sameSite: COOKIE_SAMESITE,
      secure: cookieOptions.secure,
      expires: COOKIE_EXPIRES,
    })

    Cookies.set(key, value, cookieOptions)
  },

  /**
   * Remove item from cookie storage
   * IMPORTANT: Must use the exact same options as setItem for successful deletion
   */
  removeItem: (key: string): void => {
    const domain = resolveCookieDomain()

    Cookies.remove(key, {
      path: '/',
      domain: domain,
      sameSite: COOKIE_SAMESITE as any,
      secure: isProduction && isSecure,
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