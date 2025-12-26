import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  LayoutDashboard, 
  Palette, 
  Globe, 
  Lock, 
  ArrowLeft,
  Settings
} from 'lucide-react'
import { SiteInfoForm } from './SiteInfoForm'
import { BrandingForm } from './BrandingForm'
import { ThemeForm } from './ThemeForm'
import { AuthConfigForm } from './AuthConfigForm'
import type { SiteConfig } from '@/../site.config.types'
import { cn } from '@/lib/utils'

interface SiteConfigEditorProps {
  config: SiteConfig | null | undefined
  onSave: (config: SiteConfig) => void
  isLoading: boolean
}

export function SiteConfigEditor({ config, onSave, isLoading }: SiteConfigEditorProps) {
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'site' | 'branding' | 'theme' | 'auth'>('site')

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    )
  }

  const handleSave = (updates: Partial<SiteConfig>) => {
    const updatedConfig = { ...config, ...updates }
    onSave(updatedConfig)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const menuItems = [
    { id: 'site', label: 'Site Info', icon: Globe, description: 'Basic information about your site' },
    { id: 'branding', label: 'Branding', icon: LayoutDashboard, description: 'Customize your site logo and favicon' },
    { id: 'theme', label: 'Theme', icon: Palette, description: 'Customize your site color scheme' },
    { id: 'auth', label: 'Authentication', icon: Lock, description: 'Configure authentication providers and options' },
  ] as const

  const activeItem = menuItems.find(i => i.id === activeTab)!

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10 flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <Settings className="h-5 w-5" />
            <span>Admin Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left",
                activeTab === item.id && "bg-secondary font-medium"
              )}
              onClick={() => setActiveTab(item.id as any)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t bg-background/50">
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 lg:p-10">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {activeItem.label}
            </h1>
            <p className="text-muted-foreground mt-2">
              {activeItem.description}
            </p>
          </div>

          <Separator />

          {saveSuccess && (
            <Alert className="border-green-200 bg-green-50 text-green-900 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Configuration saved successfully! Changes will take effect immediately.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8">
            {activeTab === 'site' && (
              <SiteInfoForm
                initialData={config.site}
                onSave={(site) => handleSave({ site })}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'branding' && (
              <BrandingForm
                initialData={config.branding}
                onSave={(branding) => handleSave({ branding })}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'theme' && (
              <ThemeForm
                initialData={config.theme}
                onSave={(theme) => handleSave({ theme })}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'auth' && (
              <AuthConfigForm
                initialData={config.auth}
                onSave={(auth) => handleSave({ auth })}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}