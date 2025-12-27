import { useEffect } from 'react'
import { useSiteConfig } from '@/lib/config'
import { injectThemeColors } from '@/lib/theme'
import type { SiteConfig } from '@/../site.config.types'

/**
 * Get the favicon URL based on configuration
 */
function getFaviconUrl(config: SiteConfig) {
  const { logo } = config.branding

  // 1. If it's an icon-based logo, generate an SVG favicon
  if (logo.type === 'icon') {
    const icon = logo.icon || config.site.name[0] || 'A'
    const bgColor = config.theme.brandColor || '#000000'
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="20" fill="${encodeURIComponent(bgColor)}" />
        <text x="50" y="55" dominant-baseline="central" text-anchor="middle" fill="white" font-size="60" font-family="sans-serif" font-weight="bold">${icon}</text>
      </svg>
    `.trim()
    
    return `data:image/svg+xml,${svg}`
  }

  // 2. If it's an image-based logo, use the logo URL
  if (logo.type === 'image' && logo.url) {
    // Note: We don't use Supabase's render/image API here because it requires a Pro plan.
    // Modern browsers are capable of resizing favicon images themselves.
    return logo.url
  }

  // 3. Default fallback
  return '/favicon.svg'
}

/**
 * Component to dynamically update page title, meta tags, and favicon
 * based on site configuration
 */
export function PageHead() {
  const config = useSiteConfig()

  useEffect(() => {
    // Inject theme colors
    injectThemeColors(config.theme)

    // Update page title
    document.title = config.site.name

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', config.site.description)

    // Update favicon
    const faviconUrl = getFaviconUrl(config)
    
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.setAttribute('rel', 'icon')
      document.head.appendChild(favicon)
    }
    favicon.href = faviconUrl

    // Also update apple-touch-icon if it exists
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
    if (appleTouchIcon) {
      appleTouchIcon.href = faviconUrl
    }
  }, [config.site.name, config.site.description, config.branding.logo, config.theme])

  // This component doesn't render anything
  return null
}
