import type { SiteConfig } from '../../../../site.config.types'
import { usePreviewStore } from '@/lib/preview-store'

/**
 * Hook to use PreviewConfig from the decoupled store
 */
export function usePreviewConfig(): SiteConfig | null {
  return usePreviewStore((state) => state.previewConfig)
}
