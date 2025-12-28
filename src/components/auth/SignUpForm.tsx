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

export function SignUpForm() {
  const config = useSiteConfig()
  const { signUp } = useAuth()
  const turnstileRef = useRef<TurnstileWidgetRef>(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [showTurnstile, setShowTurnstile] = useState(false)

  const requireInviteCode = config.auth.registration.requireInviteCode

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (requireInviteCode && !inviteCode.trim()) {
        setError("Invite code is required")
        return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    const { error: authError } = await signUp(email, password, turnstileToken || undefined, inviteCode)

    if (authError) {
      setError(authError.message)
      setLoading(false)
      turnstileRef.current?.reset()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleInputFocus = () => {
    if (isTurnstileEnabled(config) && !showTurnstile) {
      setShowTurnstile(true)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900">
          <AlertDescription>
            Registration successful! Please check your email to activate your account.
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
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
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
              onFocus={handleInputFocus}
              disabled={loading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleInputFocus}
              disabled={loading}
              required
            />
          </div>

          {requireInviteCode && (
            <div className="grid gap-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                onFocus={handleInputFocus}
                disabled={loading}
                required
              />
            </div>
          )}

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
              'Sign up'
            )}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/signin" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
