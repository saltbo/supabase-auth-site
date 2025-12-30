import type { SiteConfig } from '@/../site.config.types'

/**
 * React component to inject theme colors into CSS custom properties.
 * This replaces the imperative `injectThemeColors` function.
 * 
 * It renders a <style> tag that React manages, ensuring updates 
 * happen automatically when the theme prop changes.
 */
export function ThemeStyles({ 
  theme, 
  id = 'config-theme-colors' 
}: { 
  theme: SiteConfig['theme']
  id?: string 
}) {
  const css = `
    :root {
      --config-brand-color: ${theme.brandColor};
      --config-accent-color: ${theme.accentColor};
      --config-gradient-from: ${theme.gradientFrom};
      --config-gradient-via: ${theme.gradientVia};
      --config-gradient-to: ${theme.gradientTo};

      /* Shadcn UI Overrides */
      --primary: ${theme.brandColor};
      --primary-foreground: #ffffff;
      --ring: ${theme.brandColor};
      
      --secondary: ${theme.accentColor};
      --secondary-foreground: #ffffff;
    }

    .dark {
      --primary: ${theme.brandColor};
      --primary-foreground: #ffffff;
      --ring: ${theme.brandColor};
      
      --secondary: ${theme.accentColor};
      --secondary-foreground: #ffffff;
    }
  `.trim()

  return (
    <style 
      id={id}
      dangerouslySetInnerHTML={{ __html: css }} 
    />
  )
}

/**
 * @deprecated Use <ThemeStyles /> component instead
 */
export function injectThemeColors(theme: SiteConfig['theme']): void {
  // Keep for backward compatibility during refactor, but it's a no-op 
  // if we move to the component approach.
  if (typeof document === 'undefined') return

  const styleId = 'config-theme-colors-legacy'
  let style = document.getElementById(styleId) as HTMLStyleElement
  
  if (!style) {
    style = document.createElement('style')
    style.id = styleId
    document.head.appendChild(style)
  }

  style.textContent = `
    :root {
      --config-brand-color: ${theme.brandColor};
      --config-accent-color: ${theme.accentColor};
      --config-gradient-from: ${theme.gradientFrom};
      --config-gradient-via: ${theme.gradientVia};
      --config-gradient-to: ${theme.gradientTo};
    }
  `
}
