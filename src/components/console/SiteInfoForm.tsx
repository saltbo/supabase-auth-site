import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdmin } from './AdminContext'

const schema = z.object({
  name: z.string().min(1, 'Site name is required'),
  slogan: z.string().min(1, 'Slogan is required'),
  description: z.string().min(1, 'Description is required'),
  copyright: z.string().min(1, 'Copyright text is required'),
})

type FormData = z.infer<typeof schema>

interface SiteInfoFormProps {
  initialData: FormData
  onSave: (data: FormData) => void
  isLoading: boolean
}

export function SiteInfoForm({ initialData, onSave, isLoading }: SiteInfoFormProps) {
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
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Site Name</Label>
        <Input
          id="name"
          placeholder="My Awesome Site"
          {...register('name')}
          readOnly={!isAdmin}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slogan">Slogan</Label>
        <Input
          id="slogan"
          placeholder="Secure Authentication Made Simple"
          {...register('slogan')}
          readOnly={!isAdmin}
        />
        {errors.slogan && (
          <p className="text-sm text-destructive">{errors.slogan.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Sign in to access your account"
          {...register('description')}
          readOnly={!isAdmin}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="copyright">Copyright</Label>
        <Input
          id="copyright"
          placeholder="© 2025 My Company"
          {...register('copyright')}
          readOnly={!isAdmin}
        />
        {errors.copyright && (
          <p className="text-sm text-destructive">{errors.copyright.message}</p>
        )}
      </div>

      {isAdmin && (
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </form>
  )
}