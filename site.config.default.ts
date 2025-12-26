import type { SiteConfig } from './site.config.types'

/**
 * Default configuration for the Supabase Auth Site
 *
 * Copy this file to `site.config.ts` and customize it for your deployment.
 * This is a complete example showing all available options.
 */
export const defaultConfig: SiteConfig = {
  // Basic site information
  site: {
    name: 'My Auth App',
    slogan: 'Secure Authentication Made Simple',
    description: 'Sign in to access your account',
    copyright: '© 2025 My Auth App',
  },

  // Branding assets
  branding: {
    logo: {
      // Option 1: Use a custom logo image
      // url: '/logo.png',

      // Option 2: Use text-based logo
      text: 'My Auth App',
      icon: 'M',
    },
    favicon: '/favicon.ico',
  },

  // Theme colors (use any valid CSS color format)
  theme: {
    brandColor: '#10b981',      // Emerald-600 (primary buttons, accents)
    accentColor: '#3b82f6',     // Blue-600 (secondary elements)
    gradientFrom: '#10b981',    // Sidebar gradient start (emerald)
    gradientVia: '#059669',     // Sidebar gradient middle (emerald-700)
    gradientTo: '#3b82f6',      // Sidebar gradient end (blue)
  },

  // Authentication configuration
  auth: {
    // List of enabled OAuth providers
    // Provider metadata (icons, scopes, display names) are defined in src/lib/auth-providers.ts
    enabledProviders: ['google', 'github'],

    // Allow new user registration
    allowSignup: true,

    // Allow email/password authentication
    allowPassword: true,

    // Turnstile CAPTCHA configuration
    turnstile: {
      enabled: false,
      siteKey: '',
    },

    // Cookie storage configuration
    cookieOptions: {
      expires: 365,
      sameSite: 'Lax',
    },
  },
}
