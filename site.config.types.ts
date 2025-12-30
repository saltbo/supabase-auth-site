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

  /** Basic site information and branding */
  site: {
    /** Site name (used in titles, meta tags, logo fallback) */
    name: string
    /** Main slogan or tagline displayed on auth pages */
    slogan?: string
    /** 
     * URL to custom logo image (e.g., '/logo.png') 
     * If not provided, the site name and its first letter will be used.
     */
    logoUrl?: string
    /** Copyright text shown in footer */
    copyright: string
    /** Terms of Service URL */
    termsUrl?: string
    /** Privacy Policy URL */
    privacyUrl?: string
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
     * Provider metadata are defined in src/lib/auth-providers.ts
     */
    providers: string[]

    /** Email authentication methods */
    email: {
      /** Allow email/password authentication */
      password: boolean
      /** Allow email OTP (verification code) authentication */
      otp: boolean
      /** Allow email Magic Link (sign-in link) authentication */
      magicLink: boolean
    }

    /** Registration control */
    registration: {
      /** Allow new user registration */
      enabled: boolean
      /** Require invite code for registration */
      requireInviteCode: boolean
    }

    /** Security settings */
    security: {
      /** Length of the OTP code expected from Supabase (defaults to 8) */
      otpLength: number
      /** Turnstile CAPTCHA configuration */
      turnstile: {
        enabled: boolean
        siteKey: string
      }
    }
  }
}