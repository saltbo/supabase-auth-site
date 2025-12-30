import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { performPostLoginRedirect } from '@/lib/redirect'
import { ErrorPage } from '@/components/ErrorPage'

export const Route = createFileRoute('/callback')({
  component: OAuthCallbackPage,
})

/**
 * OAuth Callback Page
 *
 * This page handles the redirect after OAuth authentication.
 * Note: The actual OAuth code exchange is handled in auth-init.ts
 * before the router even starts, so by the time this component
 * renders, the session should already be established.
 */
function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Wait for auth state to be ready
    if (loading) return

    if (user) {
      // Session is established, redirect to destination
      performPostLoginRedirect(navigate)
    }
    // If no user after loading completes, show error (handled in render)
  }, [user, loading, navigate])

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Completing authentication...
          </p>
        </div>
      </div>
    )
  }

  // No session after loading - show error
  if (!user) {
    return (
      <ErrorPage
        type="auth"
        message="No session found. Please try signing in again."
        actionLabel="Return to sign in"
        onAction={() => navigate({ to: '/signin' })}
      />
    )
  }

  // User exists, waiting for redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          Redirecting...
        </p>
      </div>
    </div>
  )
}
