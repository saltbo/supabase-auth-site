# Supabase Auth Site

A generic, fully configurable authentication site powered by Supabase. Deploy your own branded auth pages in minutes with zero code changes required.

<p align="center">
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/saltbo/supabase-auth-site">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Pages" height="32">
  </a>
  &nbsp;
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsaltbo%2Fsupabase-auth-site">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" height="32">
  </a>
  &nbsp;
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/saltbo/supabase-auth-site">
    <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" height="32">
  </a>
  &nbsp;
  <a href="https://render.com/deploy?repo=https://github.com/saltbo/supabase-auth-site">
    <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" height="32">
  </a>
</p>

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

### 1. Deployment

Click one of the buttons above to deploy to your preferred platform.

**Cloudflare Pages (Recommended):**
1. Click the "Deploy to Cloudflare Pages" button.
2. Connect your GitHub account.
3. Allow Cloudflare to access your repository.
4. Add the required environment variables during setup (see below).

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

## Deployment Platforms

### Cloudflare Pages

1. Fork this repo.
2. Log in to Cloudflare Dashboard > Pages.
3. Connect to Git and select your fork.
4. **Build Settings:**
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
5. **Environment Variables:** Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Vercel / Netlify / Render

Click the deploy buttons above for the easiest setup.
Alternatively, connect your repository manually and use these settings:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### GitHub Pages

This project includes a GitHub Action for automated deployment.

1. Go to your repository **Settings** -> **Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. Go to **Settings** -> **Secrets and variables** -> **Actions**.
4. Add repository secrets: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Push to `main` to trigger deployment.

### Docker

Build and run locally:

```bash
docker build -t supabase-auth-site .
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  supabase-auth-site
```

## Documentation

- [Configuration Guide](./docs/CONFIG.md)
- [Cross-Domain SSO](./docs/CROSS_DOMAIN_AUTH.md)

## Contributing

Want to modify the code or contribute features? See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT