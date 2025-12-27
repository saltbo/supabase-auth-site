import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdmin } from './AdminContext'
import { usePreviewStore } from '@/lib/preview-store'
import { supabase } from '@/lib/supabase'
import { CONFIG_BUCKET } from '@/lib/config-service'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import type { SiteConfig } from '../../../site.config.types'

const schema = z.object({
  name: z.string().min(1, 'Site name is required'),
  slogan: z.string().optional(),
  copyright: z.string().min(1, 'Copyright text is required'),
  termsUrl: z.string().optional(),
  privacyUrl: z.string().optional(),
  logoUrl: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface SiteInfoFormProps {
  config: SiteConfig
  onSave: (data: Partial<SiteConfig>) => void
  isLoading: boolean
}

export function SiteInfoForm({ config, onSave, isLoading }: SiteInfoFormProps) {
  const { isAdmin } = useAdmin()
  const updateSection = usePreviewStore(state => state.updateSection)
  const [isUploading, setIsUploading] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...config.site,
      logoUrl: config.branding.logoUrl || '',
    },
  })

  const values = watch()
  const logoUrl = watch('logoUrl')

  useEffect(() => {
    // Split the values back into site and branding for preview
    const { logoUrl, ...siteValues } = values
    updateSection('site', siteValues)
    updateSection('branding', { logoUrl })
  }, [values, updateSection])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `assets/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(CONFIG_BUCKET)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(CONFIG_BUCKET)
        .getPublicUrl(filePath)

      setValue('logoUrl', publicUrl, { shouldDirty: true })
      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast.error(error.message || 'Failed to upload logo')
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = (data: FormData) => {
    const { logoUrl, ...siteData } = data
    onSave({
      site: siteData,
      branding: { logoUrl: logoUrl || undefined }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Site Information</h3>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
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
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Logo Configuration</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            {logoUrl && (
              <div className="relative w-fit p-2 border rounded-lg bg-muted/50">
                <img src={logoUrl} alt="Logo preview" className="h-12 w-auto object-contain" />
              </div>
            )}
            
            {isAdmin && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="logo-upload">Upload Logo Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isUploading}
                    className="w-full md:w-auto"
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {logoUrl ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {logoUrl && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setValue('logoUrl', '', { shouldDirty: true })}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or SVG. Max size 2MB. <br />
                  If no logo is uploaded, the site name and its first letter will be used.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-lg font-medium">Legal Information</h3>
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

        <div className="space-y-2">
          <Label htmlFor="termsUrl">Terms of Service URL</Label>
          <Input
            id="termsUrl"
            placeholder="https://example.com/terms"
            {...register('termsUrl')}
            readOnly={!isAdmin}
          />
          {errors.termsUrl && (
            <p className="text-sm text-destructive">{errors.termsUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
          <Input
            id="privacyUrl"
            placeholder="https://example.com/privacy"
            {...register('privacyUrl')}
            readOnly={!isAdmin}
          />
          {errors.privacyUrl && (
            <p className="text-sm text-destructive">{errors.privacyUrl.message}</p>
          )}
        </div>
      </div>

      {isAdmin && (
        <Button type="submit" disabled={isLoading || !isDirty || isUploading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </form>
  )
}
