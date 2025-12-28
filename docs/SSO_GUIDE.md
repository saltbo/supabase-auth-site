# Single Sign-On (SSO) Guide

This guide explains how to share authentication sessions between your **Auth Site** (e.g., `auth.example.com`) and various application architectures.

## 1. How it Works (SSO Flow)

1.  **Shared Cookie**: The Auth Site saves the Supabase session in a cookie scoped to the root domain (`.example.com`).
2.  **Centralized Auth**: All subdomains on the same root domain can read this cookie.
3.  **Token Verification**: Any consumer (Backend, Gateway, or SSR) verifies the JWT to identify the user.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
│                                                                 │
│  Cookie: sb-xxx-auth-token (domain=.example.com)                │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         │ 1. Login                           │ 2. Request with Cookie
         ↓                                    ↓
┌──────────────────────┐          ┌──────────────────────────────────┐
│   auth.example.com   │          │      *.example.com               │
│   (Auth Site)        │          │      (Your Applications)         │
└──────────────────────┘          └──────────────────────────────────┘
                                              │
                                              │ Authorization: Bearer <JWT>
                                              ↓
                                  ┌──────────────────────┐
                                  │   Target Resource    │
                                  │ (API / Gateway / SSR)│
                                  └──────────────────────┘
```

---

## 2. Integration Patterns

### A. SPA + Backend (API-based)
The frontend retrieves the token from the Supabase client and sends it in the `Authorization` header.

- **Frontend**: `const token = (await supabase.auth.getSession()).data.session?.access_token;`
- **Backend**: Use **JWKS** to verify the JWT without an SDK.
- 👉 **Example**: [backend/auth-middleware.ts](../../examples/basic-integration/backend/auth-middleware.ts)

### B. API Gateway (Offloaded)
Centralize authentication at your gateway (e.g., Kong, Nginx, AWS API Gateway).

1.  **Gateway Verification**: Configure your gateway to verify the JWT using the JWKS endpoint: `https://<ref>.supabase.co/auth/v1/.well-known/jwks.json`.
2.  **Identity Propagation**: After verification, the gateway injects the User ID into a header (e.g., `X-User-ID`) before forwarding the request to your microservices.
3.  **Internal Trust**: Your microservices simply trust the `X-User-ID` header provided by the gateway.

### C. SSR Sites (Next.js, Nuxt, Remix)
The server reads the session cookie directly from the request headers to render pages with user data.

1.  **Cookie Access**: The server retrieves the `sb-xxx-token` cookie from the incoming request.
2.  **Server-Side Auth**: Use the `@supabase/ssr` package to create a server-side client that automatically handles cookie parsing and token refreshing.
3.  **Data Fetching**: Use the server-side Supabase client to fetch data before the page is sent to the browser.

👉 **Resource**: [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)

---

## 3. Implementation Details

### JWT Verification (Standard)
To verify a Supabase JWT manually (Backend or Gateway):
- **Algorithm**: `RS256`
- **JWKS URL**: `https://<project-id>.supabase.co/auth/v1/.well-known/jwks.json`
- **Issuer**: `https://<project-id>.supabase.co/auth/v1`
- **Audience**: `authenticated`

---

## 🔗 Resources
- [Supabase: Using JWKS for JWT Verification](https://supabase.com/docs/guides/auth/jwts#verifying-a-jwt-from-supabase)
- [Supabase: Managing Session Cookies](https://supabase.com/docs/reference/javascript/auth-set-session)
