import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { oauthApi } from '@/lib/oauth-api'
import { requireAuth } from '@/lib/route-guards'
import {
  AuthorizationError,
  AuthorizationLoading,
  AuthorizationSuccess,
  ConsentForm,
} from '@/components/oauth'
import { AuthLayout } from '@/layouts/AuthLayout'

export const Route = createFileRoute('/oauth/consent')({
  component: OAuthConsentPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      authorization_id: search.authorization_id as string | undefined,
    }
  },
  // Route guard: require authentication before loading
  beforeLoad: ({ context, search }) => {
    // Require authorization_id parameter
    if (!search.authorization_id) {
      throw new Error('Missing authorization_id parameter')
    }

    const redirectTo = `/oauth/consent?authorization_id=${search.authorization_id}`
    return requireAuth(context, { redirectTo })
  },
})

function OAuthConsentPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { authorization_id } = Route.useSearch()

  // Fetch authorization details using TanStack Query
  const {
    data: authDetails,
    error: fetchError,
    isLoading,
  } = useQuery({
    queryKey: ['oauth-authorization', authorization_id],
    queryFn: () => oauthApi.getAuthorizationDetails(authorization_id!),
    enabled: !!authorization_id,
    retry: false,
  })

  // Handle approve/deny actions using mutation
  const {
    mutate: handleAuthAction,
    isPending,
    error: mutationError,
    data: mutationData,
  } = useMutation({
    mutationFn: async (action: 'approve' | 'deny') => {
      return action === 'approve'
        ? oauthApi.approveAuthorization(authorization_id!)
        : oauthApi.denyAuthorization(authorization_id!)
    },
  })

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate({ to: '/oauth/session-ended' })
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  // Determine error state
  const error = mutationError || fetchError
  const redirectUrl = mutationData?.redirect_url || authDetails?.redirect_url

  // Render content based on state
  const renderContent = () => {
    // Missing authorization ID
    if (!authorization_id) {
      return (
        <AuthorizationError
          error="Missing authorization ID parameter"
          onSignOut={handleSignOut}
        />
      )
    }

    // Loading state
    if (isLoading) {
      return <AuthorizationLoading message="Loading authorization details..." />
    }

    // Error state
    if (error) {
      return (
        <AuthorizationError error={error.message} onSignOut={handleSignOut} />
      )
    }

    // Success - redirect after mutation or if already authorized
    if (redirectUrl) {
      return (
        <>
          <AuthorizationSuccess
            redirectUrl={redirectUrl}
            userEmail={user?.email || ''}
            userAvatarUrl={user?.user_metadata.avatar_url}
            onSignOut={handleSignOut}
          />
          <p className="text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-4 sm:mt-6 leading-tight">
            By continuing, you agree to share your information with this application.
          </p>
        </>
      )
    }

    // Consent form (authDetails must exist at this point)
    if (!authDetails) {
      return <AuthorizationLoading message="Loading authorization details..." />
    }

    return (
      <>
        <ConsentForm
          authDetails={authDetails}
          userEmail={user?.email || ''}
          onApprove={() => handleAuthAction('approve')}
          onDeny={() => handleAuthAction('deny')}
          processing={isPending}
        />
        <p className="text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-4 sm:mt-6 leading-tight">
          By continuing, you agree to share your information with this application.
        </p>
      </>
    )
  }

  return <AuthLayout>{renderContent()}</AuthLayout>
}
