import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  logo: z.object({
    url: z.string().url().optional().or(z.literal('')),
    text: z.string().optional(),
    icon: z.string().optional(),
  }),
  favicon: z.string().min(1, 'Favicon path is required'),
})

type FormData = z.infer<typeof schema>

interface BrandingFormProps {
  initialData: FormData
  onSave: (data: FormData) => void
  isLoading: boolean
}

import { useAdmin } from './AdminContext'

export function BrandingForm({ initialData, onSave, isLoading }: BrandingFormProps) {
  const { isAdmin } = useAdmin()
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      {/* Logo Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-3">Logo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You can either use a custom logo image URL or display text with an icon
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo.url">Logo Image URL (optional)</Label>
          <Input
            id="logo.url"
            placeholder="https://example.com/logo.png"
            {...register('logo.url')}
            readOnly={!isAdmin}
          />
          {errors.logo?.url && (
            <p className="text-sm text-destructive">{errors.logo.url.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            If provided, this image will be used instead of text/icon
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="logo.text">Logo Text (optional)</Label>
            <Input
              id="logo.text"
              placeholder="My Site"
              {...register('logo.text')}
              readOnly={!isAdmin}
            />
            <p className="text-xs text-muted-foreground">
              Displayed if no image URL
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo.icon">Logo Icon Letter (optional)</Label>
            <Input
              id="logo.icon"
              placeholder="M"
              maxLength={2}
              {...register('logo.icon')}
              readOnly={!isAdmin}
            />
            <p className="text-xs text-muted-foreground">
              1-2 characters for icon
            </p>
          </div>
        </div>
      </div>

      {/* Favicon Section */}
      <div className="space-y-2">
        <Label htmlFor="favicon">Favicon Path</Label>
        <Input
          id="favicon"
          placeholder="/favicon.svg"
          {...register('favicon')}
          readOnly={!isAdmin}
        />
        {errors.favicon && (
          <p className="text-sm text-destructive">{errors.favicon.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Path to your favicon file (e.g., /favicon.svg or /favicon.ico)
        </p>
      </div>

      {isAdmin && (
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </form>
  )
}
