# Supabase Auth Site

A generic, fully configurable authentication site powered by Supabase. Deploy your own branded auth pages in minutes with zero code changes required.

## Features

- **Multiple Auth Methods**
  - Email/Password authentication
  - OAuth providers (Google, GitHub)
  - Email OTP (Magic Link)
  - OAuth authorization consent flow

- **Fully Customizable**
  - No code changes needed - just update `site.config.ts`
  - Custom branding (logo, colors, slogan)
  - Theme customization with gradient support
  - Toggle features on/off via configuration

- **Modern Tech Stack**
  - React 19 + TypeScript
  - TanStack Router (file-based routing)
  - Tailwind CSS 4 + shadcn/ui components
  - Supabase Auth (PKCE flow)
  - Vite build tool

- **Cross-Domain SSO**
  - Cookie-based session sharing across subdomains
  - Automatic JWT extraction for backend APIs
  - Works seamlessly with auth.example.com, console.example.com, etc.
  - See [CROSS_DOMAIN_AUTH.md](./docs/CROSS_DOMAIN_AUTH.md) for details

## Quick Start

### 1. Deployment (Recommended Strategy)

**We strongly recommend Forking this repository first.** This allows you to easily update your site in the future by clicking "Sync fork" on GitHub.

1. **Fork** this repository to your GitHub account.
2. Choose your deployment platform below:

**Cloudflare Pages:**
1. Go to Cloudflare Dashboard > Pages > Connect to Git.
2. Select your forked repository.
3. Use Build Command: `npm run build` and Output Directory: `dist`.

**Vercel / Netlify / Render:**
1. Click the "New Project" button in your platform's dashboard.
2. Import your forked repository.
3. The build settings should auto-detect (Vite / dist).

*(Alternatively, use the deploy buttons above for a quick start, but updates will require manual git operations.)*

### 2. Configure Environment

You need to provide the following environment variables to your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Optional for SSO:**
```env
VITE_COOKIE_DOMAIN=.example.com
```

### 3. Supabase Setup

1. **Create Project**: Sign up at [supabase.com](https://supabase.com) and create a new project.
2. **Get Credentials**: Go to Project Settings -> API to find your URL and Anon Key.
3. **Configure Auth**:
   - Go to Authentication -> Providers.
   - Enable Email/Password, Google, GitHub etc.
   - Set the **Site URL** in Supabase to your deployed URL (e.g., `https://your-app.pages.dev`).
   - Add redirect URLs (e.g., `https://your-app.pages.dev/callback`).

### 4. Customization

You can customize the site **without changing code** by editing `site.config.ts` in your repository.

```typescript
export const siteConfig: SiteConfig = {
  site: {
    name: 'My App',
    slogan: 'Welcome to My App',
  },
  theme: {
    brandColor: '#10b981',
  },
  // ...
}
```

See [CONFIG.md](./docs/CONFIG.md) for the full configuration guide.

## Updates & Maintenance

### How to Update

If you **Forked** the repository:
1. Go to your repository on GitHub.
2. Click the **"Sync fork"** button under the header.
3. Your deployment platform (Vercel/Netlify/Cloudflare) will automatically detect the change and redeploy the new version.

If you used a **Deploy Button** (without forking):
You will need to manually pull changes from the original repository:
```bash
git remote add upstream https://github.com/saltbo/supabase-auth-site.git
git fetch upstream
git merge upstream/main
git push origin main
```

## Documentation

- [Configuration Guide](./docs/CONFIG.md)
- [Cross-Domain SSO](./docs/CROSS_DOMAIN_AUTH.md)

## Contributing

Want to modify the code or contribute features? See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
