# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Supabase Auth Site is a production-ready, fully configurable authentication portal powered by Supabase. It's a drop-in SSO solution that provides branded login pages with zero code changes required - all configuration is managed through a built-in Admin Panel that stores settings in Supabase Storage.

**Key Distinguishing Feature:** Unlike typical auth templates, this project is runtime-configurable via an Admin UI at `/console`. Configuration is stored in Supabase Storage (`auth-site` bucket) as `config.json` and propagates immediately to all users without requiring code changes or redeployment.

## Development Commands

### Build & Development
```bash
npm run dev              # Start dev server on port 3000
npm run build            # Production build
npm run build:check      # Build + TypeScript check (no emit)
npm run preview          # Preview production build
npm test                 # Run vitest tests
```

### Adding UI Components
Use shadcn for new components:
```bash
pnpm dlx shadcn@latest add <component-name>
```

## Architecture

### Tech Stack
- **React 19** + **TypeScript** + **Vite**
- **TanStack Router** - File-based routing with auto code-splitting
- **TanStack Query** - Server state management
- **Supabase** - Authentication backend
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components

### Core Architecture Patterns

#### 1. Configuration System (Runtime Configuration)
The entire app is configurable without code changes through a centralized configuration system:

**Configuration Storage:**
- `site.config.types.ts` - TypeScript types for SiteConfig
- `site.config.default.ts` - Default configuration values
- `src/lib/config-service.ts` - CRUD operations for config in Supabase Storage
- `src/lib/config.ts` - React hooks and helpers for accessing config

**Configuration Flow:**
1. Config is fetched from Supabase Storage bucket `auth-site` (file: `config.json`)
2. If not found, falls back to `defaultConfig` from `site.config.default.ts`
3. `useSiteConfig()` hook provides config to components via TanStack Query
4. Admin panel at `/console` allows real-time updates
5. Optimistic concurrency control via `revision` field prevents conflicts

**Important:** When adding new configurable features:
- Update `SiteConfig` interface in `site.config.types.ts`
- Update `defaultConfig` in `site.config.default.ts`
- Update `mergeWithDefaultConfig()` in `config-service.ts` to handle partial configs
- Add UI controls in appropriate console form component

#### 2. Authentication Architecture
**Session Storage:**
- Uses **cookie storage** (not localStorage) via `src/lib/cookieStorage.ts`
- Enables **cross-subdomain SSO** (e.g., session from `auth.example.com` works on `console.example.com`)
- Cookie domain is configured via Admin Panel (`config.auth.cookieDomain`)
- See `docs/CROSS_DOMAIN_AUTH.md` for detailed SSO implementation guide

**Auth Flow:**
- `src/lib/auth.tsx` - AuthProvider context wrapping the app
- `src/lib/supabase.ts` - Supabase client with PKCE flow + cookie storage
- `useAuth()` hook provides: `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`, `signInWithOAuth`, `signInWithOtp`, `verifyOtp`

**Supported Auth Methods:**
- Email/Password
- Magic Link (OTP)
- OAuth providers (Google, GitHub, etc.) - configurable via Admin Panel
- Cloudflare Turnstile CAPTCHA (optional)

#### 3. Routing Structure (TanStack Router)
File-based routing with automatic route tree generation:

**Public Routes:**
- `/` - Redirects to `/signin` or target app
- `/signin` - Login page (email/password or OTP)
- `/verify-otp` - OTP verification page
- `/callback` - OAuth callback handler
- `/oauth/consent` - OAuth consent screen
- `/oauth/session-ended` - OAuth session ended page

**Protected Routes (Admin Panel):**
- `/console` - Admin dashboard (route guard via `beforeLoad`)
- `/console/site` - Site info configuration
- `/console/branding` - Logo/favicon upload
- `/console/theme` - Color customization
- `/console/auth` - Auth provider settings
- `/console/integration` - Integration code examples

**Route Guards:**
- Admin routes check `isUserAdmin()` based on `VITE_ADMIN_EMAILS` env var
- Non-admins are redirected with error message
- See `src/lib/route-guards.ts` for reusable guard logic

#### 4. Dynamic Theme System
Theme colors are injected dynamically into CSS variables at runtime:

**How It Works:**
1. `useSiteConfig()` loads config from Storage
2. `src/lib/theme.ts` exports `applyThemeColors()` function
3. Components like `Logo` and `AuthLayout` call `applyThemeColors(config.theme)`
4. CSS variables (`--brand-color`, `--gradient-from`, etc.) are updated
5. Tailwind classes reference these variables (e.g., `bg-[var(--brand-color)]`)

**Key Files:**
- `src/lib/theme.ts` - Theme application logic
- `src/layouts/AuthLayout.tsx` - Applies theme on mount
- `src/components/Logo.tsx` - Applies theme for logo rendering

#### 5. Admin Panel Context
Admin panel uses a dedicated context for state management:

**Structure:**
- `src/components/console/AdminContext.tsx` - Context definition
- `src/routes/console/route.tsx` - Root console route providing AdminContext
- `src/components/console/AdminLayout.tsx` - Shared layout with navigation
- Individual form components (SiteInfoForm, BrandingForm, ThemeForm, AuthConfigForm)

**Pattern:**
```tsx
// In console route.tsx
<AdminContext.Provider value={{ config, updateConfig, isLoading, isAdmin }}>
  <Outlet />
</AdminContext.Provider>

// In any admin component
const { config, updateConfig } = useAdmin()
```

## Important Patterns & Conventions

### Environment Variables
Required environment variables (set in deployment platform):
```bash
VITE_SUPABASE_URL          # Supabase project URL
VITE_SUPABASE_ANON_KEY     # Supabase anon/public key
VITE_ADMIN_EMAILS          # Comma-separated admin emails
```

### Configuration vs Environment Variables
**Use Environment Variables for:**
- Supabase credentials (URL, anon key)
- Admin access control (VITE_ADMIN_EMAILS)
- Build-time values that differ per environment

**Use Runtime Config (site.config) for:**
- Everything the user should control without redeploying
- Branding (logo, colors, site name)
- Auth provider selection
- Feature toggles (allowSignup, allowPassword)
- SSO domain settings

### File Upload Pattern
Logo/favicon uploads in Admin Panel:
1. Upload to Supabase Storage (`auth-site` bucket)
2. Get public URL
3. Store URL in config.json
4. Update config via `uploadConfigToStorage()`

See `src/components/console/BrandingForm.tsx` for reference implementation.

### Working with OAuth Providers
**Adding a New Provider:**
1. Add metadata to `src/lib/auth-providers.ts` (icon, display name, default scopes)
2. No other code changes needed - Admin Panel will auto-detect it
3. User enables it via `/console/auth`

**Provider Metadata Structure:**
```typescript
export const PROVIDER_METADATA = {
  'provider-name': {
    displayName: 'Display Name',
    icon: IconComponent,
    defaultScopes: 'scope1 scope2'
  }
}
```

### Route Organization
- `src/routes/*.tsx` - Top-level routes
- `src/routes/console/*.tsx` - Admin panel routes (nested under /console)
- `src/routes/oauth/*.tsx` - OAuth flow routes
- `src/routes/__root.tsx` - Root layout with providers
- `src/routeTree.gen.ts` - Auto-generated by TanStack Router (don't edit)

### Component Organization
- `src/components/ui/*` - shadcn UI components (don't edit manually)
- `src/components/auth/*` - Auth-related components (login forms, social buttons)
- `src/components/console/*` - Admin panel components
- `src/components/oauth/*` - OAuth flow components
- `src/layouts/*` - Layout components
- `src/lib/*` - Utilities, hooks, services

## Critical Implementation Details

### Config Concurrency Control
**Problem:** Multiple admins editing config simultaneously could cause conflicts.

**Solution:** Optimistic concurrency via `revision` field
```typescript
// In uploadConfigToStorage()
const latestConfig = await fetchConfigFromStorage()
if (latestConfig.revision > config.revision) {
  throw new Error('Conflict detected...')
}
const updatedConfig = { ...config, revision: config.revision + 1 }
```

Always use `uploadConfigToStorage()` - never upload config manually.

### Cookie Storage for SSO
**Key Implementation:**
- `src/lib/cookieStorage.ts` implements Supabase `SupportedStorage` interface
- Uses `js-cookie` library
- Domain is dynamically resolved from config via `getCachedConfig()`
- Cookie options (expires, sameSite) come from `config.auth.cookieOptions`

**Important:** The cached config must be available before cookie operations. Config is cached on first fetch in `fetchConfigFromStorage()`.

### Theme Color Injection
Theme colors must be applied **after** config is loaded:
```typescript
const config = useSiteConfig()
useEffect(() => {
  applyThemeColors(config.theme)
}, [config.theme])
```

Don't apply theme colors in static CSS - they must be dynamic.

### Admin Access Control
```typescript
// Check if user is admin
const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean) || []
const isAdmin = adminEmails.includes(userEmail.toLowerCase())
```

Admin check happens at **route level** (beforeLoad) and in **components** (for conditional rendering).

## Testing

Tests use Vitest + React Testing Library:
```bash
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- <file>       # Run specific test file
```

Test files should be colocated with source files (currently none exist - add as needed).

## Common Development Tasks

### Adding a New Configuration Field
1. Add to `SiteConfig` interface in `site.config.types.ts`
2. Add default value to `defaultConfig` in `site.config.default.ts`
3. Update `mergeWithDefaultConfig()` in `config-service.ts`
4. Add UI control in appropriate console form
5. Use via `useSiteConfig()` hook in components

### Adding a New Admin Panel Page
1. Create route file: `src/routes/console/your-page.tsx`
2. Import `useAdmin()` to access config
3. Add navigation link in `AdminLayout.tsx`
4. Route will auto-register with TanStack Router

### Adding a New Auth Provider
1. Add metadata to `PROVIDER_METADATA` in `src/lib/auth-providers.ts`
2. Enable in Admin Panel UI (no code changes needed)
3. Configure in Supabase Dashboard (Auth > Providers)

### Customizing Email Templates
Email templates (OTP codes, magic links) are configurable via:
- Supabase Dashboard > Authentication > Email Templates
- Custom SMTP settings can be configured in Supabase
- Template variables available: `{{ .ConfirmationURL }}`, `{{ .Token }}`, etc.

## Cross-Domain SSO Integration

This project supports cross-subdomain Single Sign-On. For detailed integration guide, see `docs/CROSS_DOMAIN_AUTH.md`.

**Quick Summary:**
1. Deploy this app to `auth.yourdomain.com`
2. Set cookie domain to `.yourdomain.com` via Admin Panel
3. In business apps, copy `cookieStorage.ts` and `supabase.ts`
4. Business apps at `app.yourdomain.com` automatically share the session
5. Extract JWT from session for backend API calls

## Deployment

**Recommended Platform:** Cloudflare Pages (supports static site + edge functions)

**Build Settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

**Environment Variables:** Set in platform dashboard (see Environment Variables section above)

**Post-Deploy:**
1. Create Supabase Storage bucket named `auth-site` (public)
2. Set Site URL in Supabase Dashboard to deployed domain
3. Add deployed domain to Redirect URLs allowlist
4. Navigate to `/console` and initialize config
5. Customize branding via Admin Panel

## Important Notes

- **Never commit** `.env` files with real credentials
- **Never expose** `SUPABASE_JWT_SECRET` in frontend code (backend only)
- **Always use** `uploadConfigToStorage()` for config updates (handles revision control)
- **Always use** `useSiteConfig()` hook (don't fetch config manually)
- **Don't edit** `src/routeTree.gen.ts` (auto-generated by TanStack Router)
- **Don't edit** `src/components/ui/*` directly (managed by shadcn CLI)
- **Version increments** happen automatically in `uploadConfigToStorage()` via revision field
