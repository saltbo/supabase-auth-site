import { createContext, useContext } from 'react'
import type { SiteConfig } from '@/../site.config.types'

interface AdminContextType {
  config: SiteConfig
  updateConfig: (updates: Partial<SiteConfig>) => void
  isLoading: boolean
  saveSuccess: boolean
  isAdmin: boolean
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
