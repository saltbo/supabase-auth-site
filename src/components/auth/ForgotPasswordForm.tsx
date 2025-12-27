import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { useSiteConfig, isTurnstileEnabled } from '@/lib/config'
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/auth/TurnstileWidget'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  const config = useSiteConfig()
  const { resetPasswordForEmail } = useAuth()
  const turnstileRef = useRef<TurnstileWidgetRef>(null)
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [showTurnstile, setShowTurnstile] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError('')
    setSuccess(false)

    const { error: authError } = await resetPasswordForEmail(email, turnstileToken || undefined)

    if (authError) {
      setError(authError.message)
      setLoading(false)
      turnstileRef.current?.reset()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleEmailFocus = () => {
    if (isTurnstileEnabled(config) && !showTurnstile) {
      setShowTurnstile(true)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900">
          <AlertDescription>
            Check your email for the password reset link.
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Link to="/signin" className="text-sm font-medium hover:underline">
            Back to Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <ErrorAlert message={error} />

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={handleEmailFocus}
              disabled={loading}
              required
            />
          </div>

          {showTurnstile && (
            <TurnstileWidget
              ref={turnstileRef}
              onSuccess={setTurnstileToken}
              onTokenCleared={() => setTurnstileToken(null)}
            />
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || (isTurnstileEnabled(config) && !turnstileToken)}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center text-sm">
            <Link to="/signin" className="underline underline-offset-4 hover:text-primary">
              Back to Sign in
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
