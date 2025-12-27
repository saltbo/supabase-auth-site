import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const schema = z.object({
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  gradientFrom: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  gradientVia: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  gradientTo: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
})

type FormData = z.infer<typeof schema>

interface ThemeFormProps {
  initialData: FormData
  onSave: (data: FormData) => void
  isLoading: boolean
}

import { useAdmin } from './AdminContext'

interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

function ColorPickerField({ label, value, onChange, error, disabled }: ColorPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className={cn(
                "h-10 w-20 rounded-md border-2 border-input transition-colors",
                !disabled && "hover:border-primary cursor-pointer",
                disabled && "cursor-not-allowed opacity-50"
              )}
              style={{ backgroundColor: value }}
              aria-label={`Pick color for ${label}`}
              disabled={disabled}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#10b981"
          className="flex-1"
          readOnly={disabled}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export function ThemeForm({ initialData, onSave, isLoading }: ThemeFormProps) {
  const { isAdmin } = useAdmin()
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  const values = watch()

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Primary Colors</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Main colors used throughout the site
          </p>
        </div>

        <ColorPickerField
          label="Brand Color"
          value={values.brandColor}
          onChange={(color) => setValue('brandColor', color, { shouldDirty: true })}
          error={errors.brandColor?.message}
          disabled={!isAdmin}
        />

        <ColorPickerField
          label="Accent Color"
          value={values.accentColor}
          onChange={(color) => setValue('accentColor', color, { shouldDirty: true })}
          error={errors.accentColor?.message}
          disabled={!isAdmin}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Gradient Colors</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Used for background gradients and visual elements
          </p>
        </div>

        <ColorPickerField
          label="Gradient From"
          value={values.gradientFrom}
          onChange={(color) => setValue('gradientFrom', color, { shouldDirty: true })}
          error={errors.gradientFrom?.message}
          disabled={!isAdmin}
        />

        <ColorPickerField
          label="Gradient Via"
          value={values.gradientVia}
          onChange={(color) => setValue('gradientVia', color, { shouldDirty: true })}
          error={errors.gradientVia?.message}
          disabled={!isAdmin}
        />

        <ColorPickerField
          label="Gradient To"
          value={values.gradientTo}
          onChange={(color) => setValue('gradientTo', color, { shouldDirty: true })}
          error={errors.gradientTo?.message}
          disabled={!isAdmin}
        />
      </div>

      {/* Preview */}
      <div className="rounded-lg border p-4 space-y-2">
        <h4 className="font-medium text-sm">Preview</h4>
        <div
          className="h-24 rounded-md"
          style={{
            background: `linear-gradient(135deg, ${values.gradientFrom}, ${values.gradientVia}, ${values.gradientTo})`,
          }}
        />
        <div className="flex gap-2">
          <div
            className="h-10 flex-1 rounded-md flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: values.brandColor }}
          >
            Brand
          </div>
          <div
            className="h-10 flex-1 rounded-md flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: values.accentColor }}
          >
            Accent
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
