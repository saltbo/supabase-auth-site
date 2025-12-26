import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AUTH_PROVIDERS, AVAILABLE_PROVIDERS } from '@/lib/auth-providers'

const schema = z.object({
  enabledProviders: z.array(z.string()),
  allowSignup: z.boolean(),
  allowPassword: z.boolean(),
  turnstile: z.object({
    enabled: z.boolean(),
    siteKey: z.string(),
  }),
})

type FormData = z.infer<typeof schema>

interface AuthConfigFormProps {
  initialData: FormData
  onSave: (data: FormData) => void
  isLoading: boolean
}

export function AuthConfigForm({ initialData, onSave, isLoading }: AuthConfigFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
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
                    className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`provider-${providerName}`}
                      checked={isChecked}
                      onCheckedChange={() => {
                        field.onChange(toggleProvider(field.value, providerName))
                      }}
                    />
                    <Label
                      htmlFor={`provider-${providerName}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
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
              />
              <div className="flex-1">
                <Label htmlFor="allowSignup" className="cursor-pointer">
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
              />
              <div className="flex-1">
                <Label htmlFor="allowPassword" className="cursor-pointer">
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
                />
                <div className="flex-1">
                  <Label htmlFor="turnstileEnabled" className="cursor-pointer">
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
                />
                <p className="text-sm text-muted-foreground">
                  Get your site key from the <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Cloudflare Dashboard</a>
                </p>
              </div>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading || !isDirty}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
