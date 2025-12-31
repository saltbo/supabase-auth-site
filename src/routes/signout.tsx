import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { executePostLogoutRedirect } from '@/lib/redirect-manager'

export const Route = createFileRoute('/signout')({
  component: SignOutPage,
})

function SignOutPage() {
  const { signOut, loading: authLoading } = useAuth()
  const search: { redirect?: string } = Route.useSearch()

  useEffect(() => {
    if (authLoading) return

    async function performSignOut() {
      try {
        await signOut()
      } catch (error) {
        console.error('Error during sign out:', error)
      }

      executePostLogoutRedirect(search.redirect)
    }

    performSignOut()
  }, [signOut, authLoading, search.redirect])

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
