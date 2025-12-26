import { useEffect, useState } from 'react'
import { KeyRound } from 'lucide-react'
import {
  SiApple,
  SiGoogle,
  SiGithub,
  SiGitlab,
  SiFacebook,
  SiX,
  SiDiscord,
  SiSlack,
  SiLinkedin,
  SiBitbucket,
  SiNotion,
  SiFigma,
  SiSpotify,
  SiTwitch,
  SiKakao,
  SiKeycloak,
  SiZoom,
  SiFlydotio,
} from 'react-icons/si'
import { FaMicrosoft } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import type { Provider } from '@/lib/auth'
import { useAuth } from '@/lib/auth'
import { getProviderConfig, getProviderDisplayName } from '@/lib/config'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'

// Icon component type that supports both lucide and react-icons
type IconComponent = IconType | React.ComponentType<{ className?: string }>

// Default icon mapping for common OAuth providers
// Using Simple Icons (si) and FontAwesome (fa6) from react-icons
// Covers all Supabase-supported OAuth providers
const DEFAULT_PROVIDER_ICONS: Record<string, IconComponent> = {
  apple: SiApple,
  google: SiGoogle,
  github: SiGithub,
  gitlab: SiGitlab,
  facebook: SiFacebook,
  twitter: SiX, // X (formerly Twitter) - OAuth 1.0a
  x: SiX, // X - OAuth 2.0
  discord: SiDiscord,
  slack: SiSlack,
  slack_oidc: SiSlack, // Slack with OIDC
  linkedin: SiLinkedin,
  linkedin_oidc: SiLinkedin, // LinkedIn with OIDC
  bitbucket: SiBitbucket,
  notion: SiNotion,
  figma: SiFigma,
  spotify: SiSpotify,
  twitch: SiTwitch,
  microsoft: FaMicrosoft,
  azure: FaMicrosoft,
  kakao: SiKakao,
  keycloak: SiKeycloak,
  zoom: SiZoom,
  fly: SiFlydotio,
  // workos: No icon available, will use KeyRound fallback
}

/**
 * Get icon component for a provider
 * Falls back to a default key icon if no specific icon is found
 */
function getProviderIcon(provider: string): IconComponent {
  const metadata = getProviderConfig(provider)

  // The provider metadata already includes the icon component
  return metadata?.icon || KeyRound
}

interface SocialLoginButtonsProps {
  primaryProvider?: Provider
  showHint?: boolean
}

export function SocialLoginButtons({
  primaryProvider,
  showHint = false,
}: SocialLoginButtonsProps) {
  const { signInWithOAuth, getEnabledProviders } = useAuth()
  const [providers, setProviders] = useState<Array<Provider>>([])
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getEnabledProviders().then(setProviders)
  }, [getEnabledProviders])

  const handleSocialLogin = async (provider: Provider) => {
    setLoading(provider)
    setError(null)

    const { error: authError } = await signInWithOAuth(provider)

    if (authError) {
      setError(authError.message)
      setLoading(null)
    }
  }

  if (providers.length === 0) return null

  const orderedProviders = primaryProvider
    ? [...providers].sort((a, b) => {
        if (a === primaryProvider) return -1
        if (b === primaryProvider) return 1
        return 0
      })
    : providers

  return (
    <div className="space-y-4">
      {showHint && (
        <div className="text-center text-xs text-muted-foreground">
          Or sign in with
        </div>
      )}

      <ErrorAlert message={error || ''} />

      <div className="grid gap-3">
        {orderedProviders.map((provider) => {
          const Icon = getProviderIcon(provider)
          const isLoading = loading === provider
          const providerName = getProviderDisplayName(provider)
          const buttonText = `Continue with ${providerName}`
          const isPrimary =
            primaryProvider !== undefined && provider === primaryProvider

          return (
            <Button
              key={provider}
              type="button"
              variant={isPrimary ? 'default' : 'outline'}
              disabled={loading !== null}
              onClick={() => handleSocialLogin(provider)}
              className={
                isPrimary
                  ? 'h-11 justify-center gap-2 text-sm font-medium shadow-sm ring-1 ring-primary/15'
                  : 'h-11 justify-center gap-2 border-border/60 bg-background text-sm font-medium hover:bg-muted hover:border-border'
              }
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span>{buttonText}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
