import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { isValidRedirect } from '@/lib/redirect'
import { useSiteConfig } from '@/lib/config'

export const Route = createFileRoute('/signout')({
  component: SignOutPage,
})

function SignOutPage() {
  const navigate = useNavigate()
  const { signOut, loading: authLoading } = useAuth()
  const config = useSiteConfig()
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

      // After sign out, handle redirection
      if (redirectUrl && isValidRedirect(redirectUrl, config)) {
        // If it's a relative path, use navigate. If it's absolute, window.location.href
        if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
          navigate({ to: redirectUrl })
        } else {
          window.location.href = redirectUrl
        }
      } else {
        // Default to signin page
        navigate({ to: '/signin' })
      }
    }

    performSignOut()
  }, [signOut, authLoading, navigate, redirectUrl, config])

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
