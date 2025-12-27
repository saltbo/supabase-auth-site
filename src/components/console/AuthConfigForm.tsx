import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { AUTH_PROVIDERS, AVAILABLE_PROVIDERS } from '@/lib/auth-providers'
import { useAdmin } from './AdminContext'
import { usePreviewStore } from '@/lib/preview-store'
import { Mail, KeyRound, ShieldCheck, Globe, Fingerprint, UserPlus, Ticket } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

const schema = z.object({
  enabledProviders: z.array(z.string()),
  allowSignup: z.boolean(),
  requireInviteCode: z.boolean(),
  allowPassword: z.boolean(),
  allowEmailOTP: z.boolean(),
  otpLength: z.number()
    .int('OTP length must be a whole number')
    .min(6, 'Must be at least 6 digits')
    .max(10, 'Must be 10 digits or fewer'),
  turnstile: z.object({
    enabled: z.boolean(),
    siteKey: z.string(),
  }),
  cookieOptions: z.object({
    expires: z.number().min(1, 'Must be at least 1 day'),
    sameSite: z.enum(['Lax', 'Strict', 'None']),
  }).optional(),
  cookieDomain: z.string().optional(),
}).refine((data) => {
  return data.allowPassword === true || data.allowEmailOTP === true || data.enabledProviders.length > 0
}, {
  message: "At least one login method must be enabled (Password, Email OTP, or an OAuth Provider).",
  path: ["root"], // This will attach the error to the root of the form
})

type FormData = z.infer<typeof schema>

interface AuthConfigFormProps {
  initialData: any
  onSave: (data: FormData) => void
  isLoading: boolean
}

export function AuthConfigForm({ initialData, onSave, isLoading }: AuthConfigFormProps) {
  const { isAdmin } = useAdmin()
  const updateSection = usePreviewStore(state => state.updateSection)
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { isDirty, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialData,
      requireInviteCode: initialData.requireInviteCode ?? false,
      allowEmailOTP: initialData.allowEmailOTP ?? true,
      otpLength: initialData.otpLength ?? 8,
      cookieOptions: initialData.cookieOptions || {
        expires: 365,
        sameSite: 'Lax',
      },
    },
  })

  // Subscribe to form changes to update the preview
  useEffect(() => {
    const subscription = watch((value) => {
      updateSection('auth', value as any)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateSection])

  // Get current values for conditional rendering
  const enabledProviders = watch('enabledProviders')
  const allowSignup = watch('allowSignup')
  const turnstileEnabled = watch('turnstile.enabled')
  
  const toggleProvider = (
    currentProviders: string[],
    provider: string,
  ): string[] => {
    if (currentProviders.includes(provider)) {
      return currentProviders.filter((p) => p !== provider)
    }
    return [...currentProviders, provider]
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-8">
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            {errors.root.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="methods" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="methods">Login Methods</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="security">Security & Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-6">
          {/* Email Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Authentication
              </CardTitle>
              <CardDescription>
                Configure how users sign in with their email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Controller
                name="allowPassword"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="allowPassword" className="text-base font-medium">Password Login</Label>
                      <span className="text-sm text-muted-foreground">
                        Allow users to sign in with an email and password.
                      </span>
                    </div>
                    <Switch
                      id="allowPassword"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isAdmin}
                    />
                  </div>
                )}
              />
              
              <div className="border-t pt-4">
                <Controller
                  name="allowEmailOTP"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="allowEmailOTP" className="text-base font-medium">Email OTP / Magic Link</Label>
                        <span className="text-sm text-muted-foreground">
                          Allow passwordless login via a one-time password sent to email.
                        </span>
                      </div>
                      <Switch
                        id="allowEmailOTP"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isAdmin}
                      />
                    </div>
                  )}
                />

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="otpLength">OTP Length</Label>
                    <Input
                      id="otpLength"
                      type="number"
                      min={6}
                      max={10}
                      className="max-w-[120px]"
                      {...register('otpLength', { valueAsNumber: true })}
                      readOnly={!isAdmin}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must match Supabase Auth config (default 8).
                    </p>
                    {errors.otpLength && (
                      <p className="text-sm text-destructive">{errors.otpLength.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OAuth Providers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                OAuth Providers
              </CardTitle>
              <CardDescription>
                Enable third-party providers for single sign-on.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="enabledProviders"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                    {AVAILABLE_PROVIDERS.map((providerName) => {
                      const provider = AUTH_PROVIDERS[providerName]
                      const Icon = provider.icon
                      const isChecked = field.value.includes(providerName)

                      return (
                        <div
                          key={providerName}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-2.5 transition-all relative",
                            isChecked 
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                              : "hover:border-primary/50 hover:bg-accent/50",
                            !isAdmin && "opacity-80 pointer-events-none"
                          )}
                        >
                          <Label
                            htmlFor={`provider-${providerName}`}
                            className="flex flex-1 items-center gap-3 cursor-pointer min-w-0"
                          >
                            <div className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                              isChecked ? "bg-background shadow-sm" : "bg-muted"
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-none truncate">{provider.displayName}</p>
                            </div>
                          </Label>
                          <Switch
                            id={`provider-${providerName}`}
                            checked={isChecked}
                            onCheckedChange={() => field.onChange(toggleProvider(field.value, providerName))}
                            disabled={!isAdmin}
                            className="scale-75 origin-right"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              />
              {enabledProviders.length === 0 && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-dashed text-center text-sm text-muted-foreground">
                  No OAuth providers enabled. Users can only log in via email methods.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Sign Up Settings
              </CardTitle>
              <CardDescription>
                Control how new users can create accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <Controller
                name="allowSignup"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="allowSignup" className="text-base font-medium">Allow Self-Registration</Label>
                      <span className="text-sm text-muted-foreground">
                        Let visitors create their own accounts via the sign-up page.
                      </span>
                    </div>
                    <Switch
                      id="allowSignup"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isAdmin}
                    />
                  </div>
                )}
              />
              
              <div className={cn("border-t pt-4 transition-opacity", !allowSignup && "opacity-50")}>
                 <Controller
                  name="requireInviteCode"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="requireInviteCode" className="text-base font-medium">Require Invite Code</Label>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          New users must provide a valid invite code to sign up.
                        </span>
                      </div>
                      <Switch
                        id="requireInviteCode"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isAdmin || !allowSignup}
                      />
                    </div>
                  )}
                />
              </div>

              {!allowSignup && (
                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 text-sm">
                  <strong>Note:</strong> Registration is currently disabled. You must manually create users in the Supabase dashboard.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Turnstile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Bot Protection
              </CardTitle>
              <CardDescription>
                Configure Cloudflare Turnstile to prevent spam and abuse.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Controller
                name="turnstile.enabled"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="turnstileEnabled" className="text-base font-medium">Enable Turnstile CAPTCHA</Label>
                      <span className="text-sm text-muted-foreground">
                        Require a CAPTCHA challenge for sensitive actions like sign-up.
                      </span>
                    </div>
                    <Switch
                      id="turnstileEnabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isAdmin}
                    />
                  </div>
                )}
              />

              {turnstileEnabled && (
                <div className="pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                  <Controller
                    name="turnstile.siteKey"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="turnstileSiteKey">Site Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="turnstileSiteKey"
                            placeholder="0x4AAAAAA..."
                            {...field}
                            readOnly={!isAdmin}
                            className="font-mono"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enter your Cloudflare Turnstile Site Key. <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get it here</a>.
                        </p>
                      </div>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Session Management
              </CardTitle>
              <CardDescription>
                Advanced cookie settings for cross-domain authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cookieExpires">Session Duration (Days)</Label>
                  <Input
                    id="cookieExpires"
                    type="number"
                    min="1"
                    placeholder="365"
                    {...register('cookieOptions.expires', { valueAsNumber: true })}
                    readOnly={!isAdmin}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long the user stays logged in.
                  </p>
                  {errors.cookieOptions?.expires && (
                    <p className="text-sm text-destructive">{errors.cookieOptions.expires.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookieSameSite">SameSite Policy</Label>
                  <Controller
                    name="cookieOptions.sameSite"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}>
                        <SelectTrigger id="cookieSameSite">
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lax">Lax (Recommended)</SelectItem>
                          <SelectItem value="Strict">Strict</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cross-site request behavior.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="cookieDomain" className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Cookie Domain (SSO)
                </Label>
                <Input
                  id="cookieDomain"
                  placeholder=".example.com"
                  {...register('cookieDomain')}
                  readOnly={!isAdmin}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use the current domain. Set to <code>.yourdomain.com</code> to share sessions across subdomains.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAdmin && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
           <div className="text-sm text-muted-foreground mr-auto">
            {isDirty && "You have unsaved changes"}
           </div>
          <Button type="submit" disabled={isLoading || !isDirty} size="lg">
            {isLoading ? 'Saving Changes...' : 'Save Configuration'}
          </Button>
        </div>
      )}
    </form>
  )
}