import { create } from 'zustand'
import type { SiteConfig } from '../../site.config.types'
import { defaultConfig } from '../../site.config.default'

interface PreviewState {
  previewConfig: SiteConfig | null
  setPreviewConfig: (config: SiteConfig) => void
  updateSection: <K extends keyof SiteConfig>(section: K, data: Partial<SiteConfig[K]>) => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  previewConfig: null,
  setPreviewConfig: (config) => set({ previewConfig: config }),
  updateSection: (section, data) => set((state) => {
    if (!state.previewConfig) return state
    
    const currentSection = state.previewConfig[section]
    if (typeof currentSection !== 'object' || currentSection === null) {
      return state
    }
    
    return {
      previewConfig: {
        ...state.previewConfig,
        [section]: {
          ...currentSection,
          ...data
        }
      }
    }
  })
}))
