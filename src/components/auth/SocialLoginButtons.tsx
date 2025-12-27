import { useState } from 'react'
import type { Provider } from '@/lib/auth'
import { useAuth } from '@/lib/auth'
import { getProviderDisplayName, useSiteConfig } from '@/lib/config'
import { getProviderIcon } from '@/lib/auth-providers'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import type { SiteConfig } from '@/../site.config.types'

interface SocialLoginButtonsProps {
  primaryProvider?: Provider
  showHint?: boolean
  config?: SiteConfig
}

export function SocialLoginButtons({
  primaryProvider,
  showHint = false,
  config: propConfig,
}: SocialLoginButtonsProps) {
  const { signInWithOAuth } = useAuth()
  const siteConfig = useSiteConfig()
  
  // Use passed config (e.g. for preview) or fallback to global config
  const config = propConfig || siteConfig
  
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const enabledProviders = (config.auth?.enabledProviders || []) as Provider[]
  const providers = primaryProvider
    ? [...enabledProviders].sort((a, b) => {
        if (a === primaryProvider) return -1
        if (b === primaryProvider) return 1
        return 0
      })
    : enabledProviders

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

  return (
    <div className="space-y-4">
      {showHint && (
        <div className="text-center text-xs text-muted-foreground">
          Or sign in with
        </div>
      )}

      <ErrorAlert message={error || ''} />

      <div className="grid gap-3">
        {providers.map((provider) => {
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
