# Cross-Domain Authentication Guide

This guide explains how to use this SSO site to authenticate users across multiple subdomains of your domain.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [SSO Site Setup](#sso-site-setup)
- [Business Site Integration](#business-site-integration)
- [Backend Integration](#backend-integration)
- [Local Development](#local-development)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Use Case

You have multiple sites on different subdomains that need to share authentication:

- **SSO Site**: `auth.example.com` - Centralized authentication
- **Business Sites**: `console.example.com`, `app.example.com`, `example.com` - Your applications

### How It Works

1. User logs in at `auth.example.com`
2. Session is stored in a **cookie** with `domain=.example.com`
3. All subdomains can read the session from the cookie
4. Business sites extract JWT from session and send to backend
5. Backend validates JWT and authenticates the user

### Key Features

- ✅ Single sign-on across all subdomains
- ✅ Automatic JWT extraction and header attachment
- ✅ No manual token management needed
- ✅ Secure cookie-based session sharing
- ✅ PKCE flow for OAuth security

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
│                                                                 │
│  Cookie: sb-xxx-auth-token (domain=.example.com)                │
│  {                                                              │
│    "access_token": "eyJhbGc...",  ← JWT for backend            │
│    "refresh_token": "...",                                      │
│    "user": {...}                                                │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         │ 1. Login                           │ 2. Use session
         ↓                                    ↓
┌──────────────────────┐          ┌──────────────────────┐
│   auth.example.com   │          │ console.example.com  │
│   (SSO Site)         │          │ (Business Site)      │
│                      │          │                      │
│  - Login forms       │          │  - Read cookie       │
│  - OAuth consent     │          │  - Extract JWT       │
│  - Session creation  │          │  - Call API          │
└──────────────────────┘          └──────────────────────┘
         │                                    │
         │                                    │ Authorization: Bearer <JWT>
         │                                    ↓
         │                        ┌──────────────────────┐
         │                        │   api.example.com    │
         │                        │   (Business Backend) │
         │                        │                      │
         └───────────────────────→│  - Validate JWT      │
           Shared Supabase        │  - Authenticate user │
                                  │  - Return data       │
                                  └──────────────────────┘
```

---

## Quick Start

### 1. SSO Site Setup (This Project)

**Configure environment variables:**

```bash
# .env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAILS=admin@example.com
```

**Configure via Admin UI:**

1. Navigate to `https://auth.example.com/console`
2. Go to **Auth Settings**
3. Set **Cookie Domain (SSO)** to `.example.com`

**Deploy to `auth.example.com`**

### 2. Business Site Setup

**Install dependencies:**

```bash
npm install @supabase/supabase-js js-cookie
npm install -D @types/js-cookie
```

**Copy files from this project:**

1. `src/lib/cookieStorage.ts`
2. `src/lib/supabase.ts`
3. `src/lib/apiClient.ts` (optional, for API calls)

**Configure environment:**

```bash
# .env
VITE_SUPABASE_URL=https://xxx.supabase.co  # Same as SSO site
VITE_SUPABASE_ANON_KEY=your-anon-key       # Same as SSO site
```

**Use in your app:**

```typescript
import { supabase } from './lib/supabase'
import { api } from './lib/apiClient'

// Check if user is logged in
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  console.log('User:', session.user.email)

  // Call your business API (JWT automatically attached)
  const data = await api.get('/users')
}
```

---

## SSO Site Setup

This project is already configured for cross-domain authentication. Just configure the environment variables:

### Environment Variables

```bash
# .env

# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Access (Required)
VITE_ADMIN_EMAILS=admin@example.com

# API Base URL (Optional)
VITE_API_BASE_URL=https://api.example.com
```

### SSO Configuration

Most settings, including the **Cookie Domain**, are now managed through the built-in **Admin Panel** at `/console`. This allows you to update your site configuration without redeploying.

1. Login to the Admin Panel.
2. Navigate to **Auth Settings**.
3. Update the **Cookie Domain (SSO)** (e.g., `.example.com`).

### Deployment

Deploy to your SSO subdomain (e.g., `auth.example.com`):

**Vercel:**
```bash
vercel --prod
# Set domain: auth.example.com
# Add environment variables in Vercel dashboard
```

**Netlify:**
```bash
netlify deploy --prod
# Set domain: auth.example.com
# Add environment variables in Netlify dashboard
```

**Docker:**
```bash
docker build -t sso-site .
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=https://xxx.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=xxx \
  -e VITE_ADMIN_EMAILS=admin@example.com \
  sso-site
```

---

## Business Site Integration

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js js-cookie
npm install -D @types/js-cookie
```

### Step 2: Copy Required Files

Copy these files from this project to your business site:

```
src/lib/cookieStorage.ts  → your-app/src/lib/cookieStorage.ts
src/lib/supabase.ts       → your-app/src/lib/supabase.ts
src/lib/apiClient.ts      → your-app/src/lib/apiClient.ts (optional)
```

### Step 3: Configure Environment

```bash
# your-app/.env

# Must match SSO site configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Your backend API
VITE_API_BASE_URL=https://api.example.com
```

### Step 4: Use in Your App

#### Check Authentication Status

```typescript
import { supabase } from '@/lib/supabase'

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Redirect to SSO login
    window.location.href = 'https://auth.example.com/signin?redirect=' +
      encodeURIComponent(window.location.href)
    return
  }

  console.log('Logged in as:', session.user.email)
  return session.user
}
```

#### Call Business API

```typescript
import { api } from '@/lib/apiClient'

// Method 1: Use API client (recommended)
const users = await api.get('/users')
const newUser = await api.post('/users', { name: 'John' })

// Method 2: Manual fetch
const { data: { session } } = await supabase.auth.getSession()
const response = await fetch('https://api.example.com/users', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
  }
})
```

#### React Example

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/apiClient'

function App() {
  const [user, setUser] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = 'https://auth.example.com/signin'
        return
      }
      setUser(session.user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      // Fetch data from business API
      api.get('/users').then(setData)
    }
  }, [user])

  if (!user) return <div>Loading...</div>

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

---

## Backend Integration

Your backend needs to validate the JWT sent in the `Authorization` header.

### Get JWT Secret

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **JWT Secret** (under "JWT Settings")

⚠️ **Keep this secret secure! Never commit it to version control.**

### Node.js / Express

```typescript
import express from 'express'
import jwt from 'jsonwebtoken'

const app = express()
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!

// Auth middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET, {
      audience: 'authenticated',
    })

    req.user = {
      id: payload.sub,
      email: payload.email,
      // ... other fields from JWT
    }

    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Protected route
app.get('/users', authenticateJWT, (req, res) => {
  console.log('User ID:', req.user.id)
  res.json({ users: [...] })
})

app.listen(3001)
```

### Python / Flask

```python
from flask import Flask, request, jsonify
import jwt
import os

app = Flask(__name__)
SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')

def authenticate_jwt():
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=['HS256'],
            audience='authenticated'
        )
        return {
            'id': payload['sub'],
            'email': payload['email'],
        }
    except jwt.InvalidTokenError:
        return None

@app.route('/users')
def get_users():
    user = authenticate_jwt()

    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    print(f"User ID: {user['id']}")
    return jsonify({'users': [...]})

if __name__ == '__main__':
    app.run(port=3001)
```

### Go

```go
package main

import (
    "net/http"
    "os"
    "strings"

    "github.com/golang-jwt/jwt/v5"
    "github.com/gin-gonic/gin"
)

var jwtSecret = []byte(os.Getenv("SUPABASE_JWT_SECRET"))

func authenticateJWT() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")

        if !strings.HasPrefix(authHeader, "Bearer ") {
            c.JSON(401, gin.H{"error": "Unauthorized"})
            c.Abort()
            return
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")

        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return jwtSecret, nil
        })

        if err != nil || !token.Valid {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        claims := token.Claims.(jwt.MapClaims)
        c.Set("user_id", claims["sub"])
        c.Set("email", claims["email"])

        c.Next()
    }
}

func main() {
    r := gin.Default()

    r.GET("/users", authenticateJWT(), func(c *gin.Context) {
        userID := c.GetString("user_id")
        c.JSON(200, gin.H{"user_id": userID})
    })

    r.Run(":3001")
}
```

---

## Local Development

### Challenge

Cookies with `domain=.example.com` don't work on `localhost`.

### Solution 1: Use `/etc/hosts` (Recommended)

**Edit your hosts file:**

```bash
# macOS/Linux
sudo nano /etc/hosts

# Windows
# Edit C:\Windows\System32\drivers\etc\hosts
```

**Add these lines:**

```
127.0.0.1  auth.local.dev
127.0.0.1  console.local.dev
127.0.0.1  api.local.dev
```

**Configure via Admin UI:**

1. Navigate to `http://auth.local.dev:3000/console`
2. Set **Cookie Domain (SSO)** to `.local.dev`

**Run your apps:**

```bash
# SSO site (port 3000)
npm run dev
# Visit: http://auth.local.dev:3000

# Business site (port 3001)
cd ../business-site && npm run dev
# Visit: http://console.local.dev:3001
```

### Solution 2: Don't Set Cookie Domain

If you don't set a **Cookie Domain** in the Admin Panel, it will default to the current hostname (e.g., `localhost`). This works for testing on a single domain but SSO won't work across different subdomains or ports.

This will use the current hostname (e.g., `localhost`), so SSO won't work across different ports, but you can test on a single domain.

---

## Security Considerations

### Cookie Security

The cookie storage is configured with security best practices:

```typescript
{
  domain: '.example.com',  // Cross-subdomain
  path: '/',               // All paths
  sameSite: 'Lax',        // CSRF protection
  secure: true,           // HTTPS only in production
  expires: 365            // 1 year
}
```

### Important Points

1. **HTTPS Required in Production**
   - Cookies with `secure: true` only work over HTTPS
   - Local development uses `secure: false` automatically

2. **JWT Secret Protection**
   - Never expose `SUPABASE_JWT_SECRET` in frontend code
   - Only use it in backend servers
   - Store it as an environment variable

3. **CORS Configuration**
   - Your backend API must allow requests from your domains
   - Example (Express):
   ```typescript
   app.use(cors({
     origin: [
       'https://auth.example.com',
       'https://console.example.com',
       'https://example.com'
     ],
     credentials: true
   }))
   ```

4. **Cookie Domain Best Practices**
   - Use `.example.com` (with dot) to share across subdomains
   - Don't use on `localhost` in development
   - Be aware: any subdomain can read the cookie

---

## Troubleshooting

### Session Not Shared Between Subdomains

**Problem:** User logs in at `auth.example.com` but `console.example.com` doesn't see the session.

**Solution:**
1. Check the **Cookie Domain (SSO)** in the Admin Panel is set to `.example.com` (with dot)
2. Verify both sites use the **same Supabase project**
3. Check browser DevTools → Application → Cookies
4. Ensure the cookie domain shows `.example.com`

### JWT Validation Fails on Backend

**Problem:** Backend returns `401 Unauthorized` or "Invalid token"

**Solution:**
1. Verify you're using the correct `SUPABASE_JWT_SECRET`
2. Check the JWT audience is `'authenticated'`
3. Ensure token hasn't expired
4. Debug: Decode JWT at [jwt.io](https://jwt.io) to inspect claims

### Cookie Not Set in Browser

**Problem:** No cookie appears in DevTools

**Solution:**
1. Check if **Cookie Domain** is set correctly in the Admin Panel
2. Verify you're on HTTPS in production
3. Check browser console for errors
4. Try clearing browser cache and cookies

### Login Redirect Loop

**Problem:** User keeps getting redirected to login page

**Solution:**
1. Check if `detectSessionInUrl: true` in supabase config
2. Verify callback URL is configured in Supabase Dashboard
3. Check browser allows cookies (not in incognito/private mode)

### Local Development Cookie Issues

**Problem:** Cookies don't work on `localhost`

**Solution:**
1. Use `/etc/hosts` to set up local domains (see [Local Development](#local-development))
2. Or leave the **Cookie Domain** empty in the Admin Panel for local dev

---

## Advanced Topics

### Logout Across All Subdomains

```typescript
import { supabase } from '@/lib/supabase'

async function logout() {
  await supabase.auth.signOut()

  // Optional: Redirect to SSO site
  window.location.href = 'https://auth.example.com/signin'
}
```

The session cookie is automatically removed, logging out the user from all subdomains.

### Refresh Token Handling

Supabase automatically handles token refresh with `autoRefreshToken: true`:

```typescript
// No manual refresh needed!
const { data: { session } } = await supabase.auth.getSession()

// Session is automatically refreshed if expired
```

### Custom JWT Claims

If you need custom claims in the JWT, configure them in Supabase:

1. Go to Supabase Dashboard → Authentication → Policies
2. Add custom claims to `auth.users` metadata
3. They'll automatically appear in the JWT

### Multiple Environments

Since the configuration is stored in your Supabase project's Storage, each environment (production, staging, local) will have its own configuration naturally as you connect them to different Supabase projects:

**SSO Site Environment Variables:**
```bash
# .env.production
VITE_SUPABASE_URL=https://prod.supabase.co

# .env.staging
VITE_SUPABASE_URL=https://staging.supabase.co
```

**SSO Site Admin Panel Settings:**
- Production: Set domain to `.example.com`
- Staging: Set domain to `.staging.example.com`

**Business Site Environment Variables:**
(Business sites still use environment variables to match the SSO configuration)
```bash
# your-app/.env.production
VITE_COOKIE_DOMAIN=.example.com

# your-app/.env.staging
VITE_COOKIE_DOMAIN=.staging.example.com
```

---

## Summary

**Key Files:**
- `src/lib/cookieStorage.ts` - Cookie storage adapter
- `src/lib/supabase.ts` - Supabase client with cookie storage
- `src/lib/apiClient.ts` - API client with automatic JWT

**Key Configuration:**
- **Cookie Domain** - Configured in SSO site Admin Panel (enables cross-subdomain)
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` - Same across all sites
- `SUPABASE_JWT_SECRET` - Backend validation (keep secret!)

**Flow:**
1. User logs in at `auth.example.com`
2. Session stored in cookie using domain from Admin Panel
3. Business site reads cookie via Supabase client (configured with the same domain)
4. JWT extracted and sent to backend API
5. Backend validates JWT and authenticates user

For more help, see:
- [README.md](./README.md) - General setup
- [Supabase Docs](https://supabase.com/docs/guides/auth)
