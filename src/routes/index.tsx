import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LogOut, Mail, User, Clock, Shield, Key } from 'lucide-react'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({
        to: '/signin',
      })
    }
  },
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const { user, session, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/signin' })
  }

  // Show loading state while AuthProvider initializes
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const getUserInitials = (email: string): string => {
    const parts = email.split('@')
    if (parts.length > 0 && parts[0]) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            You are successfully authenticated
          </p>
        </div>

        {/* User Profile Card */}
        <Card className="mb-6 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 md:h-28 md:w-28">
              {user?.user_metadata?.avatar_url && (
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.email || 'User'}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {getUserInitials(user?.email || '')}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold mb-2">
                {user?.user_metadata?.full_name || user?.email}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  {user?.email}
                </Badge>
                {user?.email_confirmed_at && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <User className="h-4 w-4" />
                  <span>User ID: {user?.id}</span>
                </div>
                {user?.created_at && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Joined: {formatDate(user.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="md:self-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Session Info Card */}
        <Card className="mb-6 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Key className="h-5 w-5" />
            Session Information
          </h3>
          <Separator className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Access Token (JWT)</p>
              <div className="bg-muted/50 p-3 rounded-md font-mono text-xs break-all">
                {session?.access_token.substring(0, 50)}...
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Token Type</p>
              <div className="bg-muted/50 p-3 rounded-md">
                Bearer
              </div>
            </div>

            {session?.expires_at && (
              <div>
                <p className="text-muted-foreground mb-1">Expires At</p>
                <div className="bg-muted/50 p-3 rounded-md">
                  {formatDate(new Date(session.expires_at * 1000).toISOString())}
                </div>
              </div>
            )}

            <div>
              <p className="text-muted-foreground mb-1">Provider</p>
              <div className="bg-muted/50 p-3 rounded-md capitalize">
                {user?.app_metadata?.provider || 'email'}
              </div>
            </div>
          </div>
        </Card>

        {/* User Metadata Card */}
        {user?.user_metadata && Object.keys(user.user_metadata).length > 0 && (
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4">User Metadata</h3>
            <Separator className="mb-4" />
            <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(user.user_metadata, null, 2)}
            </pre>
          </Card>
        )}

        {/* App Metadata Card */}
        {user?.app_metadata && Object.keys(user.app_metadata).length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">App Metadata</h3>
            <Separator className="mb-4" />
            <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(user.app_metadata, null, 2)}
            </pre>
          </Card>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            This information is available to all subdomains via shared cookies.
          </p>
          <p className="mt-1">
            JWT can be extracted and sent to your backend API for authentication.
          </p>
        </div>
      </div>
    </div>
  )
}