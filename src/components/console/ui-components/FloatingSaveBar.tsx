import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatingSaveBarProps {
  hasChanges: boolean
  onSave: () => void
  onDiscard: () => void
  isLoading?: boolean
}

export function FloatingSaveBar({
  hasChanges,
  onSave,
  onDiscard,
  isLoading = false,
}: FloatingSaveBarProps) {
  if (!hasChanges) {
    return null
  }

  return (
    <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between px-4 lg:px-10 py-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span>You have unsaved changes</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDiscard} disabled={isLoading}>
            Discard
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
