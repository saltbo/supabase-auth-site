import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Copy, ExternalLink, Terminal, AlertCircle } from 'lucide-react'
import { integrationExamples } from './integration-examples'
import type { SiteConfig } from '@/../site.config.types'

interface IntegrationGuideProps {
  config?: SiteConfig
}

export function IntegrationGuide({ config }: IntegrationGuideProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
  const cookieDomain = config?.auth?.cookieDomain

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getInitClientCode = () => {
    let code = `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  '${supabaseUrl}',
  'YOUR_ANON_KEY',
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,`

    if (cookieDomain) {
      code += `
      // essential for cross-subdomain auth
      cookieOptions: {
        domain: '${cookieDomain}',
        path: '/',
        sameSite: 'Lax',
      },`
    }

    code += `
    },
  }
)`
    return code
  }

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative mt-2 rounded-md bg-muted group">
      <div className="overflow-x-auto p-4 pr-12">
        <pre className="text-sm font-mono text-foreground min-w-max">
          <code>{code}</code>
        </pre>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground bg-muted/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        onClick={() => copyToClipboard(code, id)}
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy code</span>
      </Button>
      {copied === id && (
        <span className="absolute right-12 top-3 text-xs text-green-600 font-medium animate-in fade-in bg-muted/80 backdrop-blur-sm px-2 py-1 rounded">
          Copied!
        </span>
      )}
    </div>
  )

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Integration Guide</h2>
        <p className="text-sm text-muted-foreground">
          Choose the best integration method for your application type.
        </p>
      </div>

      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="direct">Direct Integration</TabsTrigger>
          <TabsTrigger value="oauth">OAuth / Third-Party</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Direct Integration (Same Domain)</CardTitle>
              <CardDescription>
                Best for applications on the same domain or subdomains (e.g., app.example.com) that can share cookies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {cookieDomain && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Cross-Subdomain Configuration</AlertTitle>
                  <AlertDescription>
                    Your site is configured to share cookies on <strong>{cookieDomain}</strong>. 
                    You must configure the client SDK with the same cookie options.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary shrink-0">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 w-full min-w-0">
                    <h4 className="text-sm font-medium leading-none">1. Install Client SDK</h4>
                    <p className="text-sm text-muted-foreground">
                      Install the Supabase JavaScript client in your application.
                    </p>
                    <CodeBlock 
                      id="install-sdk"
                      code="npm install @supabase/supabase-js" 
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary shrink-0">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 w-full min-w-0">
                    <h4 className="text-sm font-medium leading-none">2. Initialize Client</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure the client to use the shared session.
                    </p>
                    <CodeBlock 
                      id="init-client"
                      code={getInitClientCode()}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary shrink-0">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 w-full min-w-0">
                    <h4 className="text-sm font-medium leading-none">3. Get User Session</h4>
                    <p className="text-sm text-muted-foreground">
                      Retrieve the current user session directly.
                    </p>
                    <CodeBlock 
                      id="get-session"
                      code={`const { data: { session } } = await supabase.auth.getSession()

if (session) {
  console.log('Logged in as:', session.user.email)
}`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth" className="space-y-4 mt-6 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Integration (Third-Party)</CardTitle>
              <CardDescription>
                Use Supabase as an OAuth 2.0 Identity Provider for your applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-6 min-w-0">
                <div className="space-y-2 min-w-0">
                  <h3 className="text-sm font-medium">1. Enable OAuth Server & Create Application</h3>
                  <p className="text-sm text-muted-foreground">
                    First, enable the OAuth 2.0 server and create an application in your Supabase project.
                  </p>
                  <div className="rounded-lg border p-4 bg-muted/50 min-w-0">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to your Supabase Project Dashboard.</li>
                      <li>Navigate to <strong>Authentication</strong> &gt; <strong>OAuth 2.0</strong> (under Configuration).</li>
                      <li>Ensure <strong>OAuth 2.0 Server</strong> is enabled for your project.</li>
                      <li>Click <strong>Add Application</strong>.</li>
                      <li>Select the <strong>Client Type</strong>:
                        <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                          <li><strong>Confidential:</strong> For server-side apps (gets a Client Secret).</li>
                          <li><strong>Public:</strong> For SPAs or Mobile apps (uses PKCE, no Secret).</li>
                        </ul>
                      </li>
                      <li>Enter your application name and callback URL (e.g., <code className="break-all">https://your-app.com/callback</code>).</li>
                      <li>Copy the generated <strong>Client ID</strong> (and <strong>Client Secret</strong> if confidential).</li>
                    </ol>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://supabase.com/dashboard/project/_/auth/oauth" target="_blank" rel="noopener noreferrer">
                          Open Supabase Dashboard <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 min-w-0">
                  <h3 className="text-sm font-medium">2. Configure OIDC Client</h3>
                  <p className="text-sm text-muted-foreground">
                    Use an OIDC-compliant library for your framework using the discovery URL below.
                  </p>

                  <div className="mt-4 rounded-md bg-secondary/50 p-3 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-full">
                    <div className="text-xs font-mono bg-background p-1.5 rounded border flex-1 min-w-0 truncate">
                      {`${supabaseUrl}/auth/v1/.well-known/openid-configuration`}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0"
                      onClick={() => copyToClipboard(`${supabaseUrl}/auth/v1/.well-known/openid-configuration`, 'discovery-url')}
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      {copied === 'discovery-url' ? 'Copied' : 'Copy Discovery URL'}
                    </Button>
                  </div>

                  <Tabs defaultValue={integrationExamples[0].id} className="w-full max-w-full">
                    <TabsList className="flex w-full justify-start overflow-x-auto h-auto p-1 gap-1 flex-nowrap">
                      {integrationExamples.map((example) => (
                        <TabsTrigger key={example.id} value={example.id} className="whitespace-nowrap flex-shrink-0">
                          {example.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {integrationExamples.map((example) => (
                      <TabsContent key={example.id} value={example.id} className="mt-4 space-y-4 min-w-0">
                        <p className="text-sm text-muted-foreground">{example.description}:</p>
                        <CodeBlock 
                          id={`${example.id}-example`}
                          code={example.code(supabaseUrl)}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}