import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { useSiteConfig, isTurnstileEnabled } from '@/lib/config'
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/auth/TurnstileWidget'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EmailOtpLoginFormProps {
  onBack?: () => void
  flow?: 'otp' | 'magiclink'
}

export function EmailOtpLoginForm({
  onBack,
  flow = 'otp',
}: EmailOtpLoginFormProps) {
  const navigate = useNavigate()
  const config = useSiteConfig()
  const { signInWithOtp } = useAuth()
  const turnstileRef = useRef<TurnstileWidgetRef>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const isMagicLink = flow === 'magiclink'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isTurnstileEnabled(config) && !turnstileToken) {
      setError('Please complete the verification')
      return
    }

    setLoading(true)
    setError('')

    const { error: otpError } = await signInWithOtp(
      email,
      turnstileToken || undefined,
      flow
    )

    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      // Reset Turnstile
      turnstileRef.current?.reset()
    } else {
      if (isMagicLink) {
        navigate({
          to: '/check-email',
          search: { email },
        })
      } else {
        // Navigate to OTP verification page
        navigate({
          to: '/verify-otp',
          search: { email },
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {isMagicLink ? 'Sign in with Magic Link' : 'Sign in with Email OTP'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isMagicLink 
            ? 'We will email you a link to sign in instantly' 
            : 'We will email you a code to verify your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <ErrorAlert message={error} />

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <TurnstileWidget
            ref={turnstileRef}
            onSuccess={setTurnstileToken}
            onTokenCleared={() => setTurnstileToken(null)}
          />

          <Button
            type="submit"
            className="w-full h-11"
            disabled={loading || (isTurnstileEnabled(config) && !turnstileToken)}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              isMagicLink ? 'Send magic link' : 'Send verification code'
            )}
          </Button>

          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              ← Back to login options
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}