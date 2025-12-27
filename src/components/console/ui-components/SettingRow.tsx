import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ReactNode } from 'react'

interface SettingRowProps {
  icon: ReactNode
  title: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

export function SettingRow({
  icon,
  title,
  description,
  value,
  onChange,
  disabled = false,
}: SettingRowProps) {
  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-lg border transition-colors",
      !disabled && "hover:bg-accent/50",
      disabled && "opacity-60"
    )}>
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Label className={cn(
          "text-sm font-medium",
          disabled && "cursor-not-allowed"
        )}>
          {title}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>

      {/* Switch */}
      <Switch
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
