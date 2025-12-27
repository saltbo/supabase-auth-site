import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useSiteConfig } from '@/lib/config'
import { injectThemeColors } from '@/lib/theme'
import type { SiteConfig } from '@/../site.config.types'

interface LogoProps {
  className?: string
  variant?: 'default' | 'light'
  config?: SiteConfig
}

export function Logo({ className = 'h-8', variant = 'default', config: propConfig }: LogoProps) {
  const hookConfig = useSiteConfig()
  const config = propConfig || hookConfig
  const isLight = variant === 'light'

  // Inject theme colors when config changes
  useEffect(() => {
    injectThemeColors(config.theme)
  }, [config.theme])

  // If custom logo image is selected and URL is provided, use it
  if (config.branding.logo.type === 'image' && config.branding.logo.url) {
    return (
      <img
        src={config.branding.logo.url}
        alt={config.site.name}
        className={className}
      />
    )
  }

  // Otherwise use text/icon based logo
  const logoText = config.branding.logo.text || config.site.name
  const logoIcon = config.branding.logo.icon || logoText[0] || 'A'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg',
          isLight ? 'bg-white/20' : '',
        )}
        style={
          !isLight
            ? { backgroundColor: config.theme.brandColor }
            : undefined
        }
      >
        <span className="text-white font-bold text-lg">{logoIcon}</span>
      </div>
      <span
        className={cn(
          'text-xl font-bold tracking-tight',
          isLight && 'text-white',
        )}
      >
        {logoText}
      </span>
    </div>
  )
}
