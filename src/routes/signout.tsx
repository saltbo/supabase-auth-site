import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { isValidRedirect } from '@/lib/redirect'

export const Route = createFileRoute('/signout')({
  component: SignOutPage,
})

function SignOutPage() {
  const { signOut, loading: authLoading } = useAuth()
  const search: { redirect?: string } = Route.useSearch()
  const { redirect: redirectUrl } = search

  useEffect(() => {
    async function performSignOut() {
      // Wait for initial auth state if it's still loading
      if (authLoading) return

      try {
        await signOut()
      } catch (error) {
        console.error('Error during sign out:', error)
      }

      // After sign out, force a full page reload to reset router context
      // This ensures the auth state is re-initialized properly
      if (redirectUrl && isValidRedirect(redirectUrl)) {
        window.location.href = redirectUrl.startsWith('/')
          ? window.location.origin + redirectUrl
          : redirectUrl
      } else {
        window.location.href = window.location.origin + '/signin'
      }
    }

    performSignOut()
  }, [signOut, authLoading, redirectUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          Signing you out...
        </p>
      </div>
    </div>
  )
}
