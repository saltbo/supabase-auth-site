import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, AlertCircle } from 'lucide-react'

interface ConfigInitializerProps {
  onInitialize: () => void
  isLoading: boolean
  error?: Error | null
}

export function ConfigInitializer({ onInitialize, isLoading, error }: ConfigInitializerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Admin Panel</CardTitle>
          <CardDescription className="text-base">
            No configuration found. Let's set up your site configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to initialize configuration: {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">What happens next:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  We'll create a configuration file with default settings
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  You can customize site info, branding, theme, and auth settings
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Changes will be saved to Supabase Storage and take effect immediately
                </span>
              </li>
            </ul>
          </div>

          <Button
            onClick={onInitialize}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Initializing...
              </>
            ) : (
              'Initialize Configuration'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
