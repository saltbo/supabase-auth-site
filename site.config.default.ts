import type { SiteConfig } from './site.config.types'

/**
 * Default configuration for the Supabase Auth Site
 *
 * Copy this file to `site.config.ts` and customize it for your deployment.
 * This is a complete example showing all available options.
 */
export const defaultConfig: SiteConfig = {
  // Version control
  revision: 1,

  // Basic site information and branding
  site: {
    name: 'My Auth App',
    slogan: 'Secure Authentication Made Simple',
    copyright: '© 2025 My Auth App',
    // Optional: Upload a custom logo in the console
    // logoUrl: '/logo.png',
    termsUrl: '',
    privacyUrl: '',
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
    providers: ['google', 'github'],

    // Email authentication methods
    email: {
      password: true,
      otp: true,
      magicLink: true,
    },

    // Registration control
    registration: {
      enabled: false,
      requireInviteCode: false,
    },

    // Security settings
    security: {
      otpLength: 8,
      turnstile: {
        enabled: false,
        siteKey: '',
      },
    },

    // Session management
    session: {
      expires: 365,
      sameSite: 'Lax',
      // Set to '.yourdomain.com' to share session across subdomains
      domain: undefined,
    },
  },
}