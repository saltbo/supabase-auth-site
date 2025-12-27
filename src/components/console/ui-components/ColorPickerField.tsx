import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function ColorPickerField({ label, value, onChange, error, disabled }: ColorPickerFieldProps) {
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
