import { useState, useEffect } from 'react'
import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
import { EmailOtpLoginForm } from '@/components/auth/EmailOtpLoginForm'
import { EmailPasswordLoginForm } from '@/components/auth/EmailPasswordLoginForm'
import { 
  useSiteConfig, 
  isPasswordAllowed, 
  isEmailOtpAllowed,
  getEnabledProviders 
} from '@/lib/config'
import type { SiteConfig } from '@/../site.config.types'

type LoginMethod = 'default' | 'email-otp'

interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {
  config?: SiteConfig
}

export function LoginForm({ className, config: propConfig, ...props }: LoginFormProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('default')
  const siteConfig = useSiteConfig()
  
  // Use passed config (e.g. for preview) or fallback to global config
  const config = propConfig || siteConfig
  const passwordAllowed = isPasswordAllowed(config)
  const emailOtpAllowed = isEmailOtpAllowed(config)
  const enabledProviders = getEnabledProviders(config)
  const hasSocialProviders = enabledProviders.length > 0

  // Reset to default view if Email OTP is disabled while active
  useEffect(() => {
    if (!emailOtpAllowed && loginMethod === 'email-otp') {
      setLoginMethod('default')
    }
  }, [emailOtpAllowed, loginMethod])

  const handleBackToDefault = () => {
    setLoginMethod('default')
  }

  // Only show separator if there are methods above (Social or OTP) AND password is enabled
  const showSeparator = passwordAllowed && (hasSocialProviders || emailOtpAllowed)

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Page Title */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center">
        Sign in to your account
      </h2>

      {/* Login Content */}
      <div className="space-y-6">
        {loginMethod === 'default' ? (
          <div className="grid gap-4">
            <div className="grid gap-3">
              <SocialLoginButtons config={config} />

              {emailOtpAllowed && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLoginMethod('email-otp')}
                  className="h-11 justify-center gap-2 border-border/60 bg-background text-sm font-medium hover:bg-muted hover:border-border"
                >
                  <Mail className="h-5 w-5" />
                  <span>Continue with Email OTP</span>
                </Button>
              )}
            </div>

            {showSeparator && (
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            )}

            {passwordAllowed && (
              <EmailPasswordLoginForm />
            )}
          </div>
        ) : (
          <EmailOtpLoginForm onBack={handleBackToDefault} />
        )}

        {/* Legal Disclaimer */}
        <p className="text-center text-[12px] text-muted-foreground/80 whitespace-nowrap">
          By continuing, I agree to {config.site.name}'s{' '}
          <a href={config.site.termsUrl || '#'} className="underline underline-offset-4 hover:text-primary transition-colors">
            terms
          </a>
          ,{' '}
          <a href={config.site.privacyUrl || '#'} className="underline underline-offset-4 hover:text-primary transition-colors">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
