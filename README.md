<div align="center">
  <a href="https://github.com/saltbo/supabase-auth-site">
    <img src="public/tanstack-word-logo-white.svg" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">Supabase Auth Site</h1>

  <p align="center">
    <strong>A production-ready, fully configurable authentication portal powered by Supabase.</strong>
    <br />
    Deploy your own branded login pages in minutes. Zero code changes required.
    <br />
    <br />
    <a href="https://github.com/saltbo/supabase-auth-site/issues">Report Bug</a>
    ·
    <a href="https://github.com/saltbo/supabase-auth-site/issues">Request Feature</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/github/license/saltbo/supabase-auth-site?style=flat-square" alt="License">
    <img src="https://img.shields.io/github/v/release/saltbo/supabase-auth-site?style=flat-square" alt="Release">
    <img src="https://img.shields.io/github/stars/saltbo/supabase-auth-site?style=flat-square" alt="Stars">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome">
  </p>
</div>

---

## 🚀 Overview

**Supabase Auth Site** is a modern, drop-in authentication solution for your Supabase projects. It solves the problem of building and maintaining custom auth pages (Sign In, Sign Up, Forgot Password, OAuth) by providing a pre-built, highly polished application that you can deploy and configure instantly.

Unlike other templates, **you don't need to touch the code**. Every aspect of the site—from branding and colors to auth providers and security settings—is managed through a built-in **Admin Panel**.

## ✨ Key Features

| Feature | Description |
| ------- | ----------- |
| **🎨 No-Code Styling** | Customize logo, colors, fonts, and gradients directly via the Admin UI. |
| **🔐 Multi-Auth Support** | Email/Password, Magic Link (OTP), Google, GitHub, and more out of the box. |
| **⚙️ Console** | A secure `/console` route to manage your site configuration in real-time. |
| **🌐 Cross-Domain SSO** | Seamlessly share sessions between `auth.yourdomain.com` and `app.yourdomain.com`. |
| **📱 Mobile Responsive** | Carefully crafted UI that looks perfect on desktop, tablet, and mobile. |
| **🛡️ Enterprise Ready** | Built-in support for Cloudflare Turnstile CAPTCHA and PKCE security flow. |

## 🛠 Tech Stack

Built with the latest and greatest web technologies for performance and developer experience.

*   ![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
*   ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
*   ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
*   ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
*   ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
*   ![TanStack Router](https://img.shields.io/badge/TanStack_Router-FF4154?style=for-the-badge&logo=react-router&logoColor=white)

---

## 🏁 Getting Started

We strictly recommend the **Fork & Deploy** strategy. This keeps your deployment linked to the upstream repository, allowing you to pull updates easily.

### 1. Fork the Repository

Click the **Fork** button at the top right of this page to create your own copy of the repository.

### 2. Deploy

Connect your forked repository to your preferred hosting provider.

#### Cloudflare Pages (Recommended)
1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com/)** > **Pages** > **Connect to Git**.
2. Select your forked repository.
3. **Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Vercel / Netlify
1. Import your forked repository as a new project.
2. The platform should auto-detect the Vite settings.

### 3. Configure Environment Variables

Add the following environment variables in your deployment platform settings:

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL (e.g., `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon / Public Key |
| `VITE_ADMIN_EMAILS` | Comma-separated list of emails allowed to access the Admin Panel |

### 4. Supabase Configuration

1. **Site URL**: In Supabase Dashboard > Authentication > URL Configuration, set **Site URL** to your deployed domain (e.g., `https://auth.yourdomain.com`).
2. **Redirects**: Add `https://auth.yourdomain.com/**` to the **Redirect URLs** allowlist.
3. **Storage**: Create a new public bucket named `auth-site` (if not auto-created) to store your configuration.

---

## 🎨 Configuration & Customization

Once deployed, you don't need to commit code to change the look and feel.

1.  Navigate to `https://your-deployed-site.com/console`
2.  Login with an email address you added to `VITE_ADMIN_EMAILS`.
3.  **Initialize**: Click the button to create your first config file.
4.  **Edit**: Use the visual editor to update:
    *   **Branding**: Upload your logo and favicon.
    *   **Theme**: Pick your brand color and sidebar gradients.
    *   **Content**: Update the slogan, description, and footer.
    *   **Features**: Toggle specific auth providers or sidebar content.

> Changes are saved to your Supabase Storage and propagate immediately to all users.

---

## 🔄 Updates & Maintenance

To update your site with the latest features and security patches:

1.  Navigate to your forked repository on GitHub.
2.  Click **"Sync fork"** under the repository header.
3.  Your deployment platform will automatically trigger a new build.

---

## 📚 Documentation

*   [Cross-Domain SSO Guide](./docs/CROSS_DOMAIN_AUTH.md) - Learn how to share sessions across subdomains.
*   [Contributing Guidelines](./CONTRIBUTING.md) - Want to help improve the project?

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.