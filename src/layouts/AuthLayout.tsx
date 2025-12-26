import { useEffect, type ReactNode } from 'react'
import { useSiteConfig } from '@/lib/config'
import { injectThemeColors } from '@/lib/theme'
import { Logo } from '@/components/Logo'
import { Card, CardContent } from '@/components/ui/card'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const config = useSiteConfig()

  // Inject theme colors when config changes
  useEffect(() => {
    injectThemeColors(config.theme)
  }, [config.theme])

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/80 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-400/10 to-cyan-400/10 dark:from-emerald-500/5 dark:to-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-400/5 to-pink-400/5 dark:from-violet-500/3 dark:to-pink-500/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
        {/* Main card */}
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-8 pb-8 px-6 sm:px-8">
            {/* Logo - small and centered */}
            <div className="flex justify-center mb-6">
              <Logo className="h-8 sm:h-10" />
            </div>

            {/* Slogan */}
            {config.site.slogan && (
              <div className="text-center mb-8">
                <p className="text-sm sm:text-base text-muted-foreground">
                  {config.site.slogan}
                </p>
              </div>
            )}

            {/* Main content */}
            {children}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {config.site.copyright}
          </p>
        </div>
      </div>
    </div>
  )
}
