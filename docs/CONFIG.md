# Configuration Reference

This document provides a comprehensive guide to all configuration options available in `site.config.ts`.

## Table of Contents

- [Overview](#overview)
- [Site Information](#site-information)
- [Branding](#branding)
- [Theme Colors](#theme-colors)
- [Authentication](#authentication)
- [Features](#features)
- [Redirects](#redirects)
- [Examples](#examples)

## Overview

The `site.config.ts` file is the central configuration point for your auth site. All customization is done through this single TypeScript file, which provides:

- Type safety and autocomplete in your IDE
- Validation at build time
- No need to modify source code
- Easy version control of your branding

### Getting Started

1. Copy the default config as a starting point:
   ```bash
   cp site.config.default.ts site.config.ts
   ```

2. Edit `site.config.ts` to customize your site

3. The config is imported automatically - no additional setup needed

## Site Information

Basic information about your site.

### `site.name`
- **Type**: `string`
- **Required**: Yes
- **Description**: The name of your application
- **Usage**: Used in page titles, logo fallback, and meta tags
- **Example**: `"My Awesome App"`

### `site.slogan`
- **Type**: `string`
- **Required**: Yes
- **Description**: Main tagline displayed on the auth sidebar
- **Usage**: Prominently shown on desktop sidebar
- **Example**: `"Secure Authentication Made Simple"`

### `site.description`
- **Type**: `string`
- **Required**: Yes
- **Description**: Short description of your auth service
- **Usage**: Shown below the slogan, used in meta descriptions
- **Example**: `"Sign in to access your account securely"`

### `site.copyright`
- **Type**: `string`
- **Required**: Yes
- **Description**: Copyright text shown in sidebar footer
- **Usage**: Displayed at bottom of desktop sidebar
- **Example**: `"© 2025 My Company, Inc."`

## Branding

Visual branding and assets.

### `branding.logo`

Logo configuration with multiple options:

#### `branding.logo.url`
- **Type**: `string | undefined`
- **Required**: No
- **Description**: Path to custom logo image
- **Usage**: If provided, renders as `<img>` tag; overrides text/icon logo
- **Example**: `"/logo.png"` or `"https://cdn.example.com/logo.svg"`
- **Recommended**: SVG or PNG, transparent background, ~200px width

#### `branding.logo.text`
- **Type**: `string | undefined`
- **Required**: No (if `url` is provided)
- **Description**: Text-based logo
- **Usage**: Shown next to logo icon; falls back to `site.name` if not provided
- **Example**: `"MyApp"`

#### `branding.logo.icon`
- **Type**: `string | undefined`
- **Required**: No
- **Description**: Single character or emoji for logo icon
- **Usage**: Shown in colored circle; falls back to first letter of `site.name`
- **Example**: `"M"` or `"🚀"`

**Logo Priority**:
1. If `url` is set → renders image
2. Else → renders `icon` + `text`

### `branding.favicon`
- **Type**: `string`
- **Required**: Yes
- **Description**: Path to favicon file
- **Usage**: Browser tab icon
- **Example**: `"/favicon.ico"`
- **Recommended**: `.ico` format, 32×32px or larger

## Theme Colors

All colors accept any valid CSS color format (hex, rgb, hsl, named colors).

### `theme.brandColor`
- **Type**: `string`
- **Required**: Yes
- **Description**: Primary brand color
- **Usage**: Logo background (default variant), primary buttons, accents
- **Example**: `"#10b981"` (emerald) or `"rgb(16, 185, 129)"`
- **Recommended**: Use your brand's primary color

### `theme.accentColor`
- **Type**: `string`
- **Required**: Yes
- **Description**: Secondary accent color
- **Usage**: Secondary UI elements, hover states
- **Example**: `"#3b82f6"` (blue)

### `theme.gradientFrom`
- **Type**: `string`
- **Required**: Yes
- **Description**: Sidebar gradient start color
- **Usage**: Top-left of auth sidebar background
- **Example**: `"#10b981"`

### `theme.gradientVia`
- **Type**: `string`
- **Required**: Yes
- **Description**: Sidebar gradient middle color
- **Usage**: Middle of auth sidebar background
- **Example**: `"#059669"`

### `theme.gradientTo`
- **Type**: `string`
- **Required**: Yes
- **Description**: Sidebar gradient end color
- **Usage**: Bottom-right of auth sidebar background
- **Example**: `"#3b82f6"`

**Gradient Tips**:
- Use 2-3 complementary colors
- Ensure sufficient contrast with white text
- Test in both light and dark modes

## Authentication

Configure authentication methods and security.

### `auth.providers`

OAuth provider configuration.

#### `auth.providers.google.enabled`
- **Type**: `boolean`
- **Required**: Yes
- **Description**: Enable/disable Google OAuth sign-in
- **Default**: `true`
- **Prerequisites**: Configure in Supabase Dashboard → Authentication → Providers

#### `auth.providers.github.enabled`
- **Type**: `boolean`
- **Required**: Yes
- **Description**: Enable/disable GitHub OAuth sign-in
- **Default**: `true`
- **Prerequisites**: Configure in Supabase Dashboard → Authentication → Providers

### `auth.turnstile`

Cloudflare Turnstile CAPTCHA configuration.

#### `auth.turnstile.enabled`
- **Type**: `boolean`
- **Required**: Yes
- **Description**: Enable/disable Cloudflare Turnstile CAPTCHA
- **Default**: `false`
- **Prerequisites**:
  - Enable Turnstile in Admin Panel -> Authentication
- Set `Site Key` in Admin Panel
  - Sign up at https://www.cloudflare.com/products/turnstile/
- **Usage**: When enabled, shows CAPTCHA on login forms to prevent bot attacks

## Features

Toggle and configure optional features.

### `features.sidebar`

Desktop sidebar configuration.

#### `features.sidebar.enabled`
- **Type**: `boolean`
- **Required**: Yes
- **Description**: Show/hide the branded sidebar on desktop
- **Default**: `true`
- **Usage**:
  - When `true`: Two-column layout on desktop (sidebar + form)
  - When `false`: Single-column layout (form only)
- **Note**: Sidebar is always hidden on mobile

#### `features.sidebar.features`
- **Type**: `Array<{ title: string; description: string }>`
- **Required**: Yes (if sidebar enabled)
- **Description**: Feature highlights to display in sidebar
- **Min Items**: 0
- **Max Items**: Recommended 3-4
- **Example**:
  ```typescript
  features: [
    {
      title: "Secure & Reliable",
      description: "Enterprise-grade security powered by Supabase"
    },
    {
      title: "Fast Authentication",
      description: "Sign in quickly with your preferred method"
    }
  ]
  ```

## Redirects

Configure post-authentication redirect behavior.

### `redirects.afterSignIn`
- **Type**: `string`
- **Required**: Yes
- **Description**: Where to redirect users after successful sign-in
- **Default**: `"/"`
- **Usage**: Absolute path or full URL
- **Examples**:
  - `"/"` - Root page (default, shows user info)
  - `"/app"`
  - `"https://app.example.com/home"`

**Note**: If a `redirect` query parameter is present in the sign-in URL (e.g., `/signin?redirect=/profile`), it will override this default.

### `redirects.afterSignOut`
- **Type**: `string`
- **Required**: Yes
- **Description**: Where to redirect users after signing out
- **Default**: `"/signin"`
- **Usage**: Typically the sign-in page
- **Example**: `"/signin"` or `"/"`

## Examples

### Minimal Configuration

Simplest setup with defaults:

```typescript
import { defaultConfig } from './site.config.default'
import type { SiteConfig } from './site.config.types'

export const siteConfig: SiteConfig = {
  ...defaultConfig,
  site: {
    name: 'My App',
    slogan: 'Welcome Back',
    description: 'Sign in to continue',
    copyright: '© 2025 My App',
  },
  redirects: {
    afterSignIn: '/',  // Root page shows user info
    afterSignOut: '/signin',
  },
}
```

### Custom Branding

Full branding customization:

```typescript
export const siteConfig: SiteConfig = {
  site: {
    name: 'Acme Corp',
    slogan: 'Innovation at Scale',
    description: 'Access your workspace securely',
    copyright: '© 2025 Acme Corporation',
  },
  branding: {
    logo: {
      url: '/acme-logo.svg',  // Custom logo image
    },
    favicon: '/acme-favicon.ico',
  },
  theme: {
    brandColor: '#FF6B35',      // Acme orange
    accentColor: '#004E89',     // Acme blue
    gradientFrom: '#FF6B35',
    gradientVia: '#F77F00',
    gradientTo: '#004E89',
  },
  // ... rest of config
}
```

### Google-Only Auth

Enable only Google OAuth:

```typescript
export const siteConfig: SiteConfig = {
  // ... other config
  auth: {
    providers: {
      google: { enabled: true },
      github: { enabled: false },  // Disable GitHub
    },
    turnstile: { enabled: false },
  },
}
```

### With CAPTCHA Protection

Enable Turnstile CAPTCHA:

```typescript
export const siteConfig: SiteConfig = {
  // ... other config
  auth: {
    providers: {
      google: { enabled: true },
      github: { enabled: true },
    },
    turnstile: { enabled: true },  // Enable CAPTCHA
  },
}
```

Don't forget to set in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Minimal UI (No Sidebar)

Simplified single-column layout:

```typescript
export const siteConfig: SiteConfig = {
  // ... other config
  features: {
    sidebar: {
      enabled: false,  // Hide sidebar
      features: [],
    },
  },
}
```

### Custom Feature List

Highlight your app's unique features:

```typescript
export const siteConfig: SiteConfig = {
  // ... other config
  features: {
    sidebar: {
      enabled: true,
      features: [
        {
          title: "AI-Powered Insights",
          description: "Get intelligent recommendations powered by machine learning"
        },
        {
          title: "Real-Time Collaboration",
          description: "Work together with your team in real-time"
        },
        {
          title: "99.9% Uptime SLA",
          description: "Enterprise-grade reliability you can count on"
        },
        {
          title: "GDPR Compliant",
          description: "Your data is protected with industry-leading security"
        }
      ],
    },
  },
}
```

## TypeScript Support

The configuration is fully typed. Your IDE will provide:

- **Autocomplete**: See all available options as you type
- **Type Checking**: Catch errors before runtime
- **Documentation**: Hover over fields to see descriptions
- **Validation**: Ensure required fields are present

Import the type for reference:

```typescript
import type { SiteConfig } from './site.config.types'
```

## Best Practices

1. **Version Control**: Commit `site.config.ts` to track branding changes
2. **Test Changes**: Run `npm run dev` to see config changes immediately
3. **Color Contrast**: Ensure text remains readable with your color choices
4. **Logo Formats**: Use SVG for best quality at all sizes
5. **Feature Count**: Keep sidebar features to 3-4 for best visual hierarchy
6. **Consistent Branding**: Use colors from your brand guidelines
7. **Security**: Never commit `.env` with real credentials

## Troubleshooting

### Changes not appearing

- Restart dev server: `Ctrl+C` then `npm run dev`
- Clear browser cache: Hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)
- Check for TypeScript errors in console

### Type errors

- Ensure all required fields are provided
- Check field types match the interface
- Import types: `import type { SiteConfig } from './site.config.types'`

### Logo not showing

- Check file path is correct (relative to `public/` directory)
- Verify image file exists
- Check image format is supported (PNG, SVG, JPG)
- Look for 404 errors in browser console

### Colors not applying

- Verify color format is valid CSS (hex, rgb, hsl)
- Check spelling of color property names
- Restart dev server for theme changes

## Need Help?

- Check [README.md](./README.md) for general setup
- Review [site.config.default.ts](./site.config.default.ts) for complete example
- Inspect types in [site.config.types.ts](./site.config.types.ts)
