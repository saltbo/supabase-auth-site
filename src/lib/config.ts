import { useQuery } from '@tanstack/react-query'
import { fetchConfigFromStorage, mergeWithDefaultConfig } from './config-service'
import { defaultConfig } from '@/../site.config.default'
import { getProviderMetadata } from './auth-providers'
import type { SiteConfig } from '@/../site.config'

export type { SiteConfig }

/**
 * React hook to access the raw site configuration query
 * Useful for checking loading state or error state
 */
export function useSiteConfigQuery() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: fetchConfigFromStorage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

/**
 * React hook to access site configuration
 * Loads from Storage with fallback to default config
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const config = useSiteConfig()
 *   return <h1>{config.site.name}</h1>
 * }
 * ```
 */
export function useSiteConfig(): SiteConfig {
  const { data: storageConfig, isLoading, error } = useSiteConfigQuery()

  // If loading or error, use default config
  if (isLoading || error || !storageConfig) {
    return defaultConfig
  }

  // Merge storage config with default config to ensure all fields exist
  // This handles partial configs or missing fields (e.g. after update)
  return mergeWithDefaultConfig(storageConfig)
}

/**
 * Get list of enabled OAuth providers from config
 *
 * @param config - Site configuration object
 * @returns Array of enabled provider names
 *
 * @example
 * ```ts
 * const config = useSiteConfig()
 * const providers = getEnabledProviders(config)
 * // ['google', 'github']
 * ```
 */
export function getEnabledProviders(config: SiteConfig): string[] {
  return config.auth?.enabledProviders || []
}

/**
 * Get display name for a provider
 * Uses provider metadata from auth-providers.ts
 *
 * @param provider - Provider name
 * @returns Display name (falls back to capitalized provider name)
 *
 * @example
 * ```ts
 * getProviderDisplayName('google') // 'Google'
 * getProviderDisplayName('github') // 'GitHub'
 * ```
 */
export function getProviderDisplayName(provider: string): string {
  return getProviderMetadata(provider).displayName
}

/**
 * Check if Turnstile CAPTCHA is enabled
 *
 * @param config - Site configuration object
 * @returns true if Turnstile is enabled and site key is set
 */
export function isTurnstileEnabled(config: SiteConfig): boolean {
  return config.auth?.turnstile?.enabled && !!config.auth?.turnstile?.siteKey
}

/**
 * Check if user signup is allowed
 *
 * @param config - Site configuration object
 * @returns true if signup is allowed
 */
export function isSignupAllowed(config: SiteConfig): boolean {
  return config.auth?.allowSignup ?? true
}

/**
 * Check if password login is allowed
 *
 * @param config - Site configuration object
 * @returns true if password login is allowed
 */
export function isPasswordAllowed(config: SiteConfig): boolean {
  return config.auth?.allowPassword ?? true
}

// Deprecated: Keep for backward compatibility
export function getProviderConfig(provider: string) {
  console.warn('getProviderConfig is deprecated. Use getProviderMetadata from auth-providers.ts instead')
  return getProviderMetadata(provider)
}
