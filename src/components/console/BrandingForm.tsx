import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { CONFIG_BUCKET } from '@/lib/config-service'
import { useAdmin } from './AdminContext'
import { usePreviewStore } from '@/lib/preview-store'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  logo: z.object({
    type: z.enum(['icon', 'image']),
    url: z.string().optional().or(z.literal('')),
    text: z.string().optional(),
    icon: z.string().optional(),
  }),
})

type FormData = z.infer<typeof schema>

interface BrandingFormProps {
  initialData: any
  onSave: (data: FormData) => void
  isLoading: boolean
}

export function BrandingForm({ initialData, onSave, isLoading }: BrandingFormProps) {
  const { isAdmin } = useAdmin()
  const updateSection = usePreviewStore(state => state.updateSection)
  const [isUploading, setIsUploading] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialData,
      logo: {
        ...initialData.logo,
        type: initialData.logo?.type || 'icon',
      },
    },
  })

  const logoType = watch('logo.type')
  const logoUrl = watch('logo.url')
  const allValues = watch()

  useEffect(() => {
    updateSection('branding', { logo: allValues.logo })
  }, [allValues.logo, updateSection])

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

      setValue('logo.url', publicUrl, { shouldDirty: true })
      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast.error(error.message || 'Failed to upload logo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      {/* Logo Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-1">Logo Configuration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Choose how you want to display your site logo
          </p>
        </div>

        <Tabs 
          value={logoType} 
          onValueChange={(v) => setValue('logo.type', v as 'icon' | 'image', { shouldDirty: true })}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="icon" disabled={!isAdmin}>Icon & Text</TabsTrigger>
            <TabsTrigger value="image" disabled={!isAdmin}>Custom Image</TabsTrigger>
          </TabsList>

          <TabsContent value="icon" className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo.icon">Icon Letter</Label>
                <Input
                  id="logo.icon"
                  placeholder="M"
                  maxLength={2}
                  {...register('logo.icon')}
                  readOnly={!isAdmin}
                />
                <p className="text-xs text-muted-foreground">
                  1-2 characters displayed in the colored box
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo.text">Logo Text</Label>
                <Input
                  id="logo.text"
                  placeholder="My Site"
                  {...register('logo.text')}
                  readOnly={!isAdmin}
                />
                <p className="text-xs text-muted-foreground">
                  The name displayed next to the icon
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4 pt-2">
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
                          onClick={() => setValue('logo.url', '', { shouldDirty: true })}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or SVG. Max size 2MB. <br />
                      <strong>Tip:</strong> Use a square image for a better favicon display.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="logo.url">Logo URL (direct link)</Label>
                  <Input
                    id="logo.url"
                    placeholder="https://example.com/logo.png"
                    {...register('logo.url')}
                    readOnly={!isAdmin}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {isAdmin && (
        <Button type="submit" disabled={isLoading || !isDirty || isUploading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </form>
  )
}
