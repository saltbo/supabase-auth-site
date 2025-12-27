import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { getProviderMetadata } from '@/lib/auth-providers'

interface ProviderCardProps {
  provider: string
  enabled: boolean
  onToggle: (provider: string) => void
  disabled?: boolean
}

export function ProviderCard({ provider, enabled, onToggle, disabled = false }: ProviderCardProps) {
  const metadata = getProviderMetadata(provider)
  const Icon = metadata.icon

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md border transition-all cursor-pointer",
        enabled && "border-primary bg-primary/5",
        !disabled && "hover:bg-accent/50",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={() => !disabled && onToggle(provider)}
    >
      {/* Provider Icon */}
      <Icon className={cn(
        "h-4 w-4 flex-shrink-0",
        enabled ? "text-primary" : "text-muted-foreground"
      )} />

      {/* Provider Name */}
      <span className="flex-1 text-sm font-medium leading-none">{metadata.displayName}</span>

      {/* Switch */}
      <Switch
        checked={enabled}
        onCheckedChange={() => onToggle(provider)}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
        className="scale-90"
      />
    </div>
  )
}
