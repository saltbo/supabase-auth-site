/**
 * Site Configuration Type Definitions
 *
 * This file defines the structure of the site configuration.
 * All configuration options are typed for safety and autocomplete.
 */

export interface SiteConfig {
  /** 
   * Version of the configuration 
   * Used for React keys and optimistic concurrency control
   */
  revision: number

  /** Basic site information */
  site: {
    /** Site name (used in titles, meta tags, logo fallback) */
    name: string
    /** Main slogan or tagline displayed on auth pages */
    slogan: string
    /** Short description (used in sidebar and meta tags) */
    description: string
    /** Copyright text shown in footer */
    copyright: string
    /** Terms of Service URL */
    termsUrl?: string
    /** Privacy Policy URL */
    privacyUrl?: string
  }

  /** Branding and visual assets */
  branding: {
    /** Logo configuration */
    logo: {
      /** Mode of the logo */
      type: 'image' | 'icon'
      /** URL to custom logo image (e.g., '/logo.png') */
      url?: string
      /** Text-based logo (fallback if no image provided) */
      text?: string
      /** Single letter or emoji for icon */
      icon?: string
    }
  }

  /** Theme colors (CSS color values: hex, rgb, hsl, etc.) */
  theme: {
    /** Primary brand color (buttons, accents) */
    brandColor: string
    /** Secondary accent color */
    accentColor: string
    /** Sidebar gradient start color */
    gradientFrom: string
    /** Sidebar gradient middle color */
    gradientVia: string
    /** Sidebar gradient end color */
    gradientTo: string
  }

  /** Authentication configuration */
  auth: {
    /**
     * List of enabled OAuth provider names
     * Provider metadata (icons, scopes, display names) are defined in src/lib/auth-providers.ts
     * Examples: ['google', 'github', 'gitlab', 'azure', 'facebook']
     */
    enabledProviders: string[]

    /** Allow new user registration */
    allowSignup: boolean

    /** Allow email/password authentication */
    allowPassword: boolean

    /** Turnstile CAPTCHA configuration */
    turnstile: {
      /** Enable Turnstile CAPTCHA protection */
      enabled: boolean
      /** Turnstile Site Key (get from Cloudflare Dashboard) */
      siteKey: string
    }

    /** Length of the OTP code expected from Supabase (defaults to 8) */
    otpLength?: number

    /** Cookie storage configuration */
    cookieOptions?: {
      /** Cookie expiration in days */
      expires: number
      /** SameSite attribute for cookies */
      sameSite: 'Lax' | 'Strict' | 'None'
    }
    
    /** 
     * Domain for cookie storage (e.g., '.example.com') 
     * Used for cross-subdomain SSO.
     */
    cookieDomain?: string
  }
}
