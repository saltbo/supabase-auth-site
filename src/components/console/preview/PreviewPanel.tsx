import { useEffect } from 'react'
import { usePreviewConfig } from './PreviewConfig'
import { Logo } from '@/components/Logo'
import { Card, CardContent } from '@/components/ui/card'
import { injectThemeColors } from '@/lib/theme'
import { LoginForm } from '@/components/login-form'

export function PreviewPanel() {
  const previewConfig = usePreviewConfig()

  // 如果没有预览配置,不渲染
  if (!previewConfig) {
    return null
  }

  // 注入主题颜色
  useEffect(() => {
    injectThemeColors(previewConfig.theme)
  }, [previewConfig.theme])

  return (
    <div className="flex flex-col w-full h-full bg-background border-l shadow-inner overflow-hidden">
      {/* Browser Toolbar */}
      <div className="flex-shrink-0 bg-muted/40 border-b px-4 h-12 flex items-center gap-4">
        {/* Window Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="h-3 w-3 rounded-full bg-[#FF5F56] border border-black/5" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-black/5" />
          <div className="h-3 w-3 rounded-full bg-[#27C93F] border border-black/5" />
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-background rounded-md h-7 border px-3 gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-[11px] text-muted-foreground truncate font-mono opacity-70 select-none">
            {previewConfig.site.name.toLowerCase().replace(/\s+/g, '-')}.auth.supabase.com
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex-shrink-0 text-[10px] font-medium text-muted-foreground uppercase tracking-wider opacity-50 px-1 border rounded border-muted-foreground/20">
          Preview
        </div>
      </div>

      {/* Viewport Content */}
      <div className="flex-1 overflow-y-auto">
        <PreviewAuthLayout config={previewConfig}>
          <LoginForm config={previewConfig} />
        </PreviewAuthLayout>
      </div>
    </div>
  )
}

// Auth Layout for Preview (similar to AuthLayout but uses passed config)
function PreviewAuthLayout({ children, config }: { children: React.ReactNode; config: any }) {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/80 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-400/10 to-cyan-400/10 dark:from-emerald-500/5 dark:to-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-400/5 to-pink-400/5 dark:from-violet-500/3 dark:to-pink-500/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Main card */}
        <Card className="w-full max-w-sm shadow-xl border-border/50">
          <CardContent className="pt-8 pb-8 px-6">
            {/* Logo - small and centered */}
            <div className="flex justify-center mb-6">
              <Logo config={config} className="h-8" />
            </div>

            {/* Slogan */}
            {config.site.slogan && (
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">
                  {config.site.slogan}
                </p>
              </div>
            )}

            {/* Main content */}
            {children}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          {config.site.copyright && (
            <p className="text-xs text-muted-foreground/60">
              {config.site.copyright}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/40">
            Powered by{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              Supabase
            </a>
            {' '}and{' '}
            <a
              href="https://github.com/saltbo/supabase-auth-site"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              supabase-auth-site
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}