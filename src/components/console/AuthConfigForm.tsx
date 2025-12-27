import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AUTH_PROVIDERS, AVAILABLE_PROVIDERS } from '@/lib/auth-providers'

const schema = z.object({
  enabledProviders: z.array(z.string()),
  allowSignup: z.boolean(),
  allowPassword: z.boolean(),
  turnstile: z.object({
    enabled: z.boolean(),
    siteKey: z.string(),
  }),
  cookieOptions: z.object({
    expires: z.number().min(1, 'Must be at least 1 day'),
    sameSite: z.enum(['Lax', 'Strict', 'None']),
  }).optional(),
  cookieDomain: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface AuthConfigFormProps {
  initialData: FormData
  onSave: (data: FormData) => void
  isLoading: boolean
}

import { useAdmin } from './AdminContext'

export function AuthConfigForm({ initialData, onSave, isLoading }: AuthConfigFormProps) {
  const { isAdmin } = useAdmin()
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
      cookieOptions: initialData.cookieOptions || {
        expires: 365,
        sameSite: 'Lax',
      },
    },
  })

  const enabledProviders = watch('enabledProviders')

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
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      {/* OAuth Providers */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">OAuth Providers</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select which OAuth providers to enable for sign in
          </p>
        </div>

        <Controller
          name="enabledProviders"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_PROVIDERS.map((providerName) => {
                const provider = AUTH_PROVIDERS[providerName]
                const Icon = provider.icon
                const isChecked = field.value.includes(providerName)

                return (
                  <div
                    key={providerName}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-3 transition-colors",
                      isAdmin && "hover:bg-accent/50",
                      !isAdmin && "opacity-80"
                    )}
                  >
                    <Checkbox
                      id={`provider-${providerName}`}
                      checked={isChecked}
                      onCheckedChange={() => {
                        field.onChange(toggleProvider(field.value, providerName))
                      }}
                      disabled={!isAdmin}
                    />
                    <Label
                      htmlFor={`provider-${providerName}`}
                      className={cn(
                        "flex items-center gap-2 flex-1",
                        isAdmin && "cursor-pointer"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{provider.displayName}</span>
                    </Label>
                  </div>
                )
              })}
            </div>
          )}
        />

        {enabledProviders.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No OAuth providers enabled. Users will only be able to sign in with email/password.
          </p>
        )}
      </div>

      {/* Authentication Options */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Authentication Options</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure authentication features
          </p>
        </div>

        <Controller
          name="allowSignup"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <Checkbox
                id="allowSignup"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={!isAdmin}
              />
              <div className="flex-1">
                <Label htmlFor="allowSignup" className={cn(isAdmin && "cursor-pointer")}>
                  Allow User Registration
                </Label>
                <p className="text-sm text-muted-foreground">
                  Let new users create accounts
                </p>
              </div>
            </div>
          )}
        />

        <Controller
          name="allowPassword"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <Checkbox
                id="allowPassword"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={!isAdmin}
              />
              <div className="flex-1">
                <Label htmlFor="allowPassword" className={cn(isAdmin && "cursor-pointer")}>
                  Allow Password Login
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable email/password authentication
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Turnstile Configuration */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Turnstile CAPTCHA</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Protect your site from bots and spam
          </p>
        </div>

        <div className="grid gap-4 rounded-lg border p-4">
          <Controller
            name="turnstile.enabled"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="turnstileEnabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isAdmin}
                />
                <div className="flex-1">
                  <Label htmlFor="turnstileEnabled" className={cn(isAdmin && "cursor-pointer")}>
                    Enable Turnstile
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Require CAPTCHA verification for sensitive actions
                  </p>
                </div>
              </div>
            )}
          />

          <Controller
            name="turnstile.siteKey"
            control={control}
            render={({ field }) => (
              <div className="grid gap-2">
                <Label htmlFor="turnstileSiteKey">Site Key</Label>
                <Input
                  id="turnstileSiteKey"
                  placeholder="0x4AAAAAA..."
                  {...field}
                  readOnly={!isAdmin}
                />
                <p className="text-sm text-muted-foreground">
                  Get your site key from the <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Cloudflare Dashboard</a>
                </p>
              </div>
            )}
          />
        </div>
      </div>

      {/* Cookie Configuration */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Cookie Options</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure session cookie behavior for cross-domain authentication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="cookieExpires">Session Expiration (Days)</Label>
            <Input
              id="cookieExpires"
              type="number"
              min="1"
              placeholder="365"
              {...register('cookieOptions.expires', { valueAsNumber: true })}
              readOnly={!isAdmin}
            />
            <p className="text-xs text-muted-foreground">
              How long the session cookie should persist
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
                    <SelectValue placeholder="Select SameSite policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lax">Lax (Recommended)</SelectItem>
                    <SelectItem value="Strict">Strict (More Secure)</SelectItem>
                    <SelectItem value="None">None (Cross-Site)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Controls when cookies are sent with cross-site requests
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cookieDomain">Cookie Domain (SSO)</Label>
            <Input
              id="cookieDomain"
              placeholder=".example.com"
              {...register('cookieDomain')}
              readOnly={!isAdmin}
            />
            <p className="text-xs text-muted-foreground">
              Set to your root domain (e.g., .example.com) to share sessions across subdomains. 
              Leave empty to use the current domain only.
            </p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </form>
  )
}
