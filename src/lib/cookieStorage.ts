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
import type { SupportedStorage, Session, User } from '@supabase/supabase-js'

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
 * Type guard to check if an object is a valid Supabase Session
 */
function isSession(item: unknown): item is Session {
  if (typeof item !== 'object' || item === null) {
    return false
  }

  const session = item as Partial<Session>

  return (
    typeof session.access_token === 'string' &&
    typeof session.refresh_token === 'string' &&
    typeof session.user === 'object' &&
    session.user !== null
  )
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
   * Handles split sessions and standard cookies
   */
  getItem: (key: string): string | null => {
    // 1. Try retrieving split session (semantic parts)
    const accessToken = Cookies.get(`${key}.at`)
    if (accessToken) {
      const refreshToken = Cookies.get(`${key}.rt`)
      const userStr = Cookies.get(`${key}.user`)
      const metaStr = Cookies.get(`${key}.meta`)

      if (refreshToken && userStr && metaStr) {
        try {
          const user = JSON.parse(userStr) as User
          const meta = JSON.parse(metaStr) as Partial<Session>
          
          const session: Session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            user,
            token_type: meta.token_type || 'bearer',
            expires_in: meta.expires_in || 3600,
            expires_at: meta.expires_at,
            ...meta
          }
          return JSON.stringify(session)
        } catch (e) {
          console.error('[cookieStorage] Failed to reconstruct split session', e)
        }
      }
    }

    // 2. Fallback: Standard cookie
    return Cookies.get(key) || null
  },

  /**
   * Set item to cookie storage
   * intelligently splits Supabase session JSON to avoid size limits
   */
  setItem: (key: string, value: string): void => {
    const domain = resolveCookieDomain()
    const cookieOptions = {
      expires: COOKIE_EXPIRES,
      path: '/',
      domain: domain,
      sameSite: COOKIE_SAMESITE as any,
      secure: isProduction && isSecure,
    }

    try {
      // Attempt to parse as Session JSON
      const session = JSON.parse(value) as unknown
      
      // Check if it looks like a Supabase session using type guard
      if (isSession(session)) {
        // Destructure to separate large fields
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { access_token, refresh_token, user, ...rest } = session

        // Store parts in separate cookies
        Cookies.set(`${key}.at`, access_token, cookieOptions)
        Cookies.set(`${key}.rt`, refresh_token, cookieOptions)
        Cookies.set(`${key}.user`, JSON.stringify(user), cookieOptions)
        Cookies.set(`${key}.meta`, JSON.stringify(rest), cookieOptions)
        
        // Marker to indicate split mode
        Cookies.set(key, 'split', cookieOptions)
        return
      }
    } catch (e) {
      // Not JSON or not a session object, proceed to standard storage
    }

    // Standard storage (fallback for non-session values)
    if (value.length <= 3000) {
      Cookies.set(key, value, cookieOptions)
    } else {
      console.warn('[cookieStorage] Value too large for single cookie and not a valid session JSON. Saving failed.', key)
    }
  },

  /**
   * Remove item from cookie storage
   * Cleans up all storage variants
   */
  removeItem: (key: string): void => {
    const domain = resolveCookieDomain()
    const removeOptions = {
      path: '/',
      domain: domain,
      sameSite: COOKIE_SAMESITE as any,
      secure: isProduction && isSecure,
    }

    // Remove split session parts
    Cookies.remove(`${key}.at`, removeOptions)
    Cookies.remove(`${key}.rt`, removeOptions)
    Cookies.remove(`${key}.user`, removeOptions)
    Cookies.remove(`${key}.meta`, removeOptions)

    // Remove standard/marker cookie
    Cookies.remove(key, removeOptions)
  },
}

/**
 * Get the current cookie domain
 * Useful for debugging
 */
export function getCookieDomain(): string | undefined {
  return resolveCookieDomain()
}