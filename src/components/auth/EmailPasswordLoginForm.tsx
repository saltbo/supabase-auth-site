import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { useSiteConfig, isTurnstileEnabled } from '@/lib/config'
import { performPostLoginRedirect } from '@/lib/redirect'
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/auth/TurnstileWidget'
import { ErrorAlert } from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EmailPasswordLoginFormProps {}

export function EmailPasswordLoginForm({}: EmailPasswordLoginFormProps) {
  const navigate = useNavigate()
  const config = useSiteConfig()
  const { signIn } = useAuth()
  const turnstileRef = useRef<TurnstileWidgetRef>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [showTurnstile, setShowTurnstile] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    const { error: authError } = await signIn(email, password, turnstileToken || undefined)

    if (authError) {
      setError(authError.message)
      setLoading(false)
      // Reset Turnstile to allow retry
      turnstileRef.current?.reset()
    } else {
      // Redirect after successful login
      performPostLoginRedirect(navigate)
    }
  }

  const handlePasswordFocus = () => {
    // Show Turnstile when user starts entering password
    if (isTurnstileEnabled(config) && !showTurnstile) {
      setShowTurnstile(true)
    }
  }

  return (
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
            disabled={loading}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handlePasswordFocus}
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
            'Sign in'
          )}
        </Button>
      </div>
    </form>
  )
}
