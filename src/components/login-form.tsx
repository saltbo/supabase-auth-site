import { useState } from 'react'
import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
import { EmailOtpLoginForm } from '@/components/auth/EmailOtpLoginForm'
import { EmailPasswordLoginForm } from '@/components/auth/EmailPasswordLoginForm'
import { useSiteConfig, isPasswordAllowed } from '@/lib/config'

type LoginMethod = 'default' | 'email-otp'

interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('default')
  const config = useSiteConfig()
  const passwordAllowed = isPasswordAllowed(config)

  const handleBackToDefault = () => {
    setLoginMethod('default')
  }

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Page Title */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center">
        Sign in to your account
      </h2>

      {/* Login Content */}
      <div>
        {loginMethod === 'default' ? (
          <div className="grid gap-4">
            <div className="grid gap-3">
              <SocialLoginButtons />

              <Button
                type="button"
                variant="outline"
                onClick={() => setLoginMethod('email-otp')}
                className="h-11 justify-center gap-2 border-border/60 bg-background text-sm font-medium hover:bg-muted hover:border-border"
              >
                <Mail className="h-5 w-5" />
                <span>Continue with Email OTP</span>
              </Button>
            </div>

            {passwordAllowed && (
              <>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <EmailPasswordLoginForm />
              </>
            )}
          </div>
        ) : (
          <EmailOtpLoginForm onBack={handleBackToDefault} />
        )}
      </div>
    </div>
  )
}
