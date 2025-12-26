import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'
import { SiteInfoForm } from './SiteInfoForm'
import { BrandingForm } from './BrandingForm'
import { ThemeForm } from './ThemeForm'
import { AuthConfigForm } from './AuthConfigForm'
import type { SiteConfig } from '@/../site.config.types'

interface SiteConfigEditorProps {
  config: SiteConfig | null | undefined
  onSave: (config: SiteConfig) => void
  isLoading: boolean
}

export function SiteConfigEditor({ config, onSave, isLoading }: SiteConfigEditorProps) {
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('site')

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Manage your site's appearance and authentication settings
          </p>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Configuration saved successfully! Changes will take effect immediately.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="site">Site Info</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="site">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Basic information about your site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SiteInfoForm
                  initialData={config.site}
                  onSave={(site) => handleSave({ site })}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Customize your site's logo and favicon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrandingForm
                  initialData={config.branding}
                  onSave={(branding) => handleSave({ branding })}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle>Theme Colors</CardTitle>
                <CardDescription>
                  Customize your site's color scheme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeForm
                  initialData={config.theme}
                  onSave={(theme) => handleSave({ theme })}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>
                  Configure authentication providers and options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthConfigForm
                  initialData={config.auth}
                  onSave={(auth) => handleSave({ auth })}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
