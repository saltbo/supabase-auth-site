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
import { Mail, KeyRound, ShieldCheck, Globe, Fingerprint, UserPlus, Ticket, Info, Hash } from 'lucide-react'
import { toast } from 'sonner'
import type { SiteConfig } from '../../../site.config.types'

const schema = z.object({
  providers: z.array(z.string()),
  email: z.object({
    password: z.boolean(),
    otp: z.boolean(),
    magicLink: z.boolean(),
  }),
  registration: z.object({
    enabled: z.boolean(),
    requireInviteCode: z.boolean(),
  }),
  security: z.object({
    otpLength: z.number()
      .int('OTP length must be a whole number')
      .min(6, 'Must be at least 6 digits')
      .max(10, 'Must be 10 digits or fewer'),
    turnstile: z.object({
      enabled: z.boolean(),
      siteKey: z.string(),
    }),
  }),
  session: z.object({
    expires: z.number().min(1, 'Must be at least 1 day'),
    sameSite: z.enum(['Lax', 'Strict', 'None']),
    domain: z.string().optional().nullable(),
  }),
})

type FormData = z.infer<typeof schema>

interface AuthConfigFormProps {
  initialData: SiteConfig['auth']
  onSave: (data: FormData) => void
  isLoading: boolean
}

function ConfigurationHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start text-sm text-muted-foreground bg-muted/50 p-3 rounded-md mt-2">
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
      <div className="flex-1">{children}</div>
    </div>
  )
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
    defaultValues: initialData,
  })

  useEffect(() => {
    const subscription = watch((value) => {
      updateSection('auth', value as any)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateSection])

  const enabledProviders = watch('providers')
  const allowSignup = watch('registration.enabled')
  const turnstileEnabled = watch('security.turnstile.enabled')
  
  const toggleProvider = (
    currentProviders: string[],
    provider: string,
  ): string[] => {
    if (currentProviders.includes(provider)) {
      return currentProviders.filter((p) => p !== provider)
    }
    return [...currentProviders, provider]
  }

  const onSubmit = (data: FormData) => {
    const hasMethods = data.email.password || data.email.otp || data.email.magicLink || data.providers.length > 0

    if (!hasMethods) {
      toast.error("Configuration Error", {
        description: "At least one login method must be enabled."
      })
      return
    }
    
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Tabs defaultValue="methods" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="methods">Login Methods</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="security">Security & Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-6">
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
                name="email.password"
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
                  name="email.otp"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col space-y-2 mb-4">
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex flex-col space-y-1">
                          <Label htmlFor="allowEmailOTP" className="text-base font-medium">Email OTP</Label>
                          <span className="text-sm text-muted-foreground">
                            Allow passwordless login via a one-time verification code.
                          </span>
                        </div>
                        <Switch
                          id="allowEmailOTP"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isAdmin}
                        />
                      </div>
                      {field.value && (
                        <ConfigurationHint>
                          Ensure <strong>Email Provider</strong> is enabled in your Supabase project.
                        </ConfigurationHint>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="email.magicLink"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col space-y-2 mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex flex-col space-y-1">
                          <Label htmlFor="allowMagicLink" className="text-base font-medium">Magic Link</Label>
                          <span className="text-sm text-muted-foreground">
                            Allow passwordless login via a sign-in link.
                          </span>
                        </div>
                        <Switch
                          id="allowMagicLink"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isAdmin}
                        />
                      </div>
                      {field.value && (
                        <ConfigurationHint>
                          Requires <strong>Email Provider</strong> and <strong>Site URL</strong> configured in Supabase.
                        </ConfigurationHint>
                      )}
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

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
              <div className="space-y-4">
                <Controller
                  name="providers"
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
                              isChecked ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-accent/50",
                              !isAdmin && "opacity-80 pointer-events-none"
                            )}
                          >
                            <Label
                              htmlFor={`provider-${providerName}`}
                              className="flex flex-1 items-center gap-3 cursor-pointer min-w-0"
                            >
                              <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                isChecked ? "bg-background shadow-sm" : "bg-muted"
                              )}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <p className="text-sm font-medium truncate">{provider.displayName}</p>
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
              </div>
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
                name="registration.enabled"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="allowSignup" className="text-base font-medium">Allow Self-Registration</Label>
                      <span className="text-sm text-muted-foreground">
                        Let visitors create their own accounts.
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
              
              <div className={cn("border-t pt-4", !allowSignup && "opacity-50")}>
                 <Controller
                  name="registration.requireInviteCode"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="requireInviteCode" className="text-base font-medium">Require Invite Code</Label>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          New users must provide a valid invite code.
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* OTP Length */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Verification Settings
              </CardTitle>
              <CardDescription>
                Configure email verification and one-time codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpLength">OTP Length</Label>
                <Input
                  id="otpLength"
                  type="number"
                  min={6}
                  max={10}
                  className="max-w-[120px]"
                  {...register('security.otpLength', { valueAsNumber: true })}
                  readOnly={!isAdmin}
                />
                <p className="text-xs text-muted-foreground">
                  The length of the verification code sent via email. Must match your Supabase Auth configuration (default 8).
                </p>
                {errors.security?.otpLength && (
                  <p className="text-sm text-destructive">{errors.security.otpLength.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Bot Protection
              </CardTitle>
              <CardDescription>
                Configure Cloudflare Turnstile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Controller
                name="security.turnstile.enabled"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="turnstileEnabled" className="text-base font-medium">Enable Turnstile</Label>
                      <span className="text-sm text-muted-foreground">
                        Require a CAPTCHA challenge for sensitive actions.
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
                <div className="pt-4 border-t">
                  <Controller
                    name="security.turnstile.siteKey"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="turnstileSiteKey">Site Key</Label>
                        <Input
                          id="turnstileSiteKey"
                          placeholder="0x4AAAAAA..."
                          {...field}
                          readOnly={!isAdmin}
                          className="font-mono"
                        />
                      </div>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Session Management
              </CardTitle>
              <CardDescription>
                Advanced cookie settings.
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
                    {...register('session.expires', { valueAsNumber: true })}
                    readOnly={!isAdmin}
                  />
                  {errors.session?.expires && (
                    <p className="text-sm text-destructive">{errors.session.expires.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookieSameSite">SameSite Policy</Label>
                  <Controller
                    name="session.sameSite"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}>
                        <SelectTrigger id="cookieSameSite">
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lax">Lax</SelectItem>
                          <SelectItem value="Strict">Strict</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
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
                  {...register('session.domain')}
                  readOnly={!isAdmin}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAdmin && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button type="submit" disabled={isLoading || !isDirty} size="lg">
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      )}
    </form>
  )
}