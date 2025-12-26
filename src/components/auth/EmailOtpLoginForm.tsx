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
}

export function EmailOtpLoginForm({
  onBack,
}: EmailOtpLoginFormProps) {
  const navigate = useNavigate()
  const config = useSiteConfig()
  const { signInWithOtp } = useAuth()
  const turnstileRef = useRef<TurnstileWidgetRef>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

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
    )

    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      // Reset Turnstile
      turnstileRef.current?.reset()
    } else {
      // Navigate to OTP verification page
      navigate({
        to: '/verify-otp',
        search: { email },
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-fit px-0 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to options
          </Button>
        )}

        <ErrorAlert message={error} />

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
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
          className="w-full"
          disabled={loading || (isTurnstileEnabled(config) && !turnstileToken)}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            'Send verification code'
          )}
        </Button>
      </div>
    </form>
  )
}
