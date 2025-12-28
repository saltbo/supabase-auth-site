import { useQuery } from '@tanstack/react-query'
import { fetchConfigFromStorage, mergeWithDefaultConfig } from './config-service'
import { defaultConfig } from '@/../site.config.default'
import { getProviderMetadata } from './auth-providers'
import type { SiteConfig } from '@/../site.config.types'

export type { SiteConfig }

/**
 * React hook to access the raw site configuration query
 */
export function useSiteConfigQuery() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: fetchConfigFromStorage,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

/**
 * React hook to access site configuration
 */
export function useSiteConfig(): SiteConfig {
  const { data: storageConfig, isLoading, error } = useSiteConfigQuery()

  if (isLoading || error || !storageConfig) {
    return defaultConfig
  }

  return mergeWithDefaultConfig(storageConfig)
}

/**
 * Configuration Accessors
 */
export const configSelectors = {
  enabledProviders: (config: SiteConfig) => config.auth.providers || [],
  
  isTurnstileEnabled: (config: SiteConfig) => 
    config.auth.security.turnstile.enabled && !!config.auth.security.turnstile.siteKey,
  
  isSignupAllowed: (config: SiteConfig) => config.auth.registration.enabled,
  
  isPasswordAllowed: (config: SiteConfig) => config.auth.email.password,
  
  isEmailOtpAllowed: (config: SiteConfig) => config.auth.email.otp,
  
  isMagicLinkAllowed: (config: SiteConfig) => config.auth.email.magicLink,
  
  getProviderDisplayName: (provider: string) => getProviderMetadata(provider).displayName,
}

// Keep these as individual exports for convenience if preferred, or just use configSelectors
export const isTurnstileEnabled = configSelectors.isTurnstileEnabled
export const isSignupAllowed = configSelectors.isSignupAllowed
export const isPasswordAllowed = configSelectors.isPasswordAllowed
export const isEmailOtpAllowed = configSelectors.isEmailOtpAllowed
export const isMagicLinkAllowed = configSelectors.isMagicLinkAllowed
export const getEnabledProviders = configSelectors.enabledProviders
export const getProviderDisplayName = configSelectors.getProviderDisplayName
