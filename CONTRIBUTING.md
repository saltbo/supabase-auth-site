# Contributing to Supabase Auth Site

Thank you for your interest in contributing to Supabase Auth Site! This document provides information on the project structure and development workflow.

## Project Structure

```
supabase-auth-site/
├── site.config.ts              # Your customization file
├── site.config.default.ts      # Example config with all options
├── site.config.types.ts        # TypeScript type definitions
├── docs/
|   |---CROSS_DOMAIN_AUTH.md    # Cross-domain SSO setup guide
├── src/
│   ├── components/
│   │   ├── auth/               # Auth form components
│   │   ├── oauth/              # OAuth consent components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── Logo.tsx            # Configurable logo component
│   │   └── login-form.tsx      # Main login form
│   ├── layouts/
│   │   └── AuthLayout.tsx      # Two-column auth layout
│   ├── lib/
│   │   ├── auth.tsx            # Auth context provider
│   │   ├── config.ts           # Config utilities
│   │   ├── supabase.ts         # Supabase client (with cookie storage)
│   │   ├── cookieStorage.ts    # Cookie storage adapter for SSO
│   │   ├── apiClient.ts        # API client with automatic JWT
│   │   ├── theme.ts            # Theme injection
│   │   ├── redirect.ts         # Redirect handling
│   │   └── route-guards.ts     # Route protection
│   ├── routes/                 # File-based routes
│   │   ├── signin.tsx          # Sign-in page
│   │   ├── callback.tsx        # OAuth callback
│   │   ├── verify-otp.tsx      # OTP verification
│   │   └── oauth/
│   │       └── consent.tsx     # OAuth authorization
│   └── main.tsx                # App entry point
├── public/                     # Static assets
└── .env                        # Environment variables
```

## Development

### Prerequisites

- Node.js (v20 or later recommended)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd supabase-auth-site
   npm install
   ```

2. Configure Environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials.

3. Run Development Server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests

### Adding New UI Components

This project uses shadcn/ui. Add components with:

```bash
npx shadcn@latest add <component-name>
```

Example:

```bash
npx shadcn@latest add dialog
```

## Security for Developers

- **Never commit `.env`** - It contains sensitive credentials
- **Use environment variables** - Don't hardcode secrets
- **Code Review** - Ensure no secrets are leaked in PRs

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
