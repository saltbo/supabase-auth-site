import { useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { useSiteConfig, isTurnstileEnabled } from '@/lib/config'

export interface TurnstileWidgetRef {
  /**
   * Reset the Turnstile widget, forcing it to generate a new token
   */
  reset: () => void
  /**
   * Get the current token value
   */
  getToken: () => string | null
}

interface TurnstileWidgetProps {
  /**
   * Callback when Turnstile successfully generates a token
   */
  onSuccess: (token: string) => void
  /**
   * Callback when Turnstile token is cleared (error, expire, or reset)
   */
  onTokenCleared?: () => void
  /**
   * Additional CSS classes for the container
   */
  className?: string
}

/**
 * Reusable Turnstile CAPTCHA widget component
 *
 * Features:
 * - Automatic token management
 * - Force reset capability via ref
 * - Only renders when TURNSTILE_SITE_KEY is configured
 *
 * @example
 * ```tsx
 * const turnstileRef = useRef<TurnstileWidgetRef>(null)
 * const [token, setToken] = useState<string | null>(null)
 *
 * // Reset on error
 * if (error) {
 *   turnstileRef.current?.reset()
 * }
 *
 * return (
 *   <TurnstileWidget
 *     ref={turnstileRef}
 *     onSuccess={setToken}
 *     onTokenCleared={() => setToken(null)}
 *   />
 * )
 * ```
 */
export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onSuccess, onTokenCleared, className = 'flex justify-center' }, ref) => {
    const config = useSiteConfig()
    const [token, setToken] = useState<string | null>(null)
    const [resetKey, setResetKey] = useState(0)

    const handleSuccess = (newToken: string) => {
      setToken(newToken)
      onSuccess(newToken)
    }

    const handleTokenCleared = () => {
      setToken(null)
      onTokenCleared?.()
    }

    useImperativeHandle(ref, () => ({
      reset: () => {
        setResetKey((prev) => prev + 1)
        handleTokenCleared()
      },
      getToken: () => token,
    }))

    // Don't render if Turnstile is not configured
    if (!isTurnstileEnabled(config)) {
      return null
    }

    return (
      <div className={className}>
        <Turnstile
          key={resetKey}
          siteKey={config.auth.turnstile.siteKey}
          onSuccess={handleSuccess}
          onError={handleTokenCleared}
          onExpire={handleTokenCleared}
        />
      </div>
    )
  }
)

TurnstileWidget.displayName = 'TurnstileWidget'
