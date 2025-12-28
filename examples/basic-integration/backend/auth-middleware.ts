import * as jose from 'jose'

/**
 * Supabase JWT Verification using JWKS
 * No Supabase SDK required.
 */
export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Missing token' })

  try {
    // 1. Define the JWKS URL for your Supabase project
    // You can find your Project ID in the Supabase Dashboard
    const JWKS = jose.createRemoteJWKSet(
      new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
    )

    // 2. Verify the JWT
    // This checks the signature, expiration, and issuer
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `${process.env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated', // Default for Supabase
    })

    // 3. Attach user info to request
    // Payload contains 'sub' (User ID), 'email', etc.
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}