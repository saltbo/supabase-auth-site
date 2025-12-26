import { useEffect } from 'react'
import { useSiteConfig } from '@/lib/config'

/**
 * Component to dynamically update page title, meta tags, and favicon
 * based on site configuration
 */
export function PageHead() {
  const config = useSiteConfig()

  useEffect(() => {
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
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.setAttribute('rel', 'icon')
      document.head.appendChild(favicon)
    }
    favicon.href = config.branding.favicon

    // Also update apple-touch-icon if it exists
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
    if (appleTouchIcon) {
      appleTouchIcon.href = config.branding.favicon
    }
  }, [config.site.name, config.site.description, config.branding.favicon])

  // This component doesn't render anything
  return null
}
