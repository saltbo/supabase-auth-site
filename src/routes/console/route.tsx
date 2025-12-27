import { useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import {
  isUserAdmin,
  configExists,
  initializeConfig,
  fetchConfigFromStorage,
  uploadConfigToStorage,
} from '@/lib/config-service'
import { AdminLayout } from '@/components/console/AdminLayout'
import { AdminContext } from '@/components/console/AdminContext'
import { ConfigInitializer } from '@/components/console/ConfigInitializer'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SiteConfig } from '../../../site.config.types'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { usePreviewStore } from '@/lib/preview-store'

export const Route = createFileRoute('/console')({
  beforeLoad: async () => {
    // 1. Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw redirect({
        to: '/signin',
        search: { redirect: '/console' },
      })
    }
  },
  component: ConsoleRouteComponent,
})

function ConsoleRouteComponent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const setPreviewConfig = usePreviewStore(state => state.setPreviewConfig)
  
  const isAdmin = isUserAdmin(user?.email)

  // Check if config exists
  const { data: exists, isLoading: checkingExists } = useQuery({
    queryKey: ['config-exists'],
    queryFn: configExists,
  })

  // Load current config
  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['site-config'],
    queryFn: fetchConfigFromStorage,
    enabled: exists === true,
  })

  // Sync with preview store when config loads
  useEffect(() => {
    if (config) {
      setPreviewConfig(config)
    }
  }, [config, setPreviewConfig])

  // Initialize config mutation
  const { mutate: initialize, isPending: initializing, error: initError } = useMutation({
    mutationFn: initializeConfig,
    onSuccess: async () => {
      // Remove all cached data
      queryClient.removeQueries({ queryKey: ['config-exists'] })
      queryClient.removeQueries({ queryKey: ['site-config'] })

      // Refetch immediately
      await queryClient.refetchQueries({ queryKey: ['config-exists'] })
      await queryClient.refetchQueries({ queryKey: ['site-config'] })
    },
  })

  // Update config mutation
  const { mutate: updateConfig, isPending: updating } = useMutation({
    mutationFn: uploadConfigToStorage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] })
      toast.success("Success", {
        description: "Configuration saved successfully! Changes will take effect immediately.",
      })
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: `Failed to save configuration: ${error.message}`,
      })
    }
  })

  const handleUpdateConfig = (updates: Partial<SiteConfig>) => {
    if (!config || !isAdmin) return
    const updatedConfig = { ...config, ...updates }
    updateConfig(updatedConfig)
    setPreviewConfig(updatedConfig)
  }

  // Loading state
  if (checkingExists) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Checking configuration...
          </p>
        </div>
      </div>
    )
  }

  // If config doesn't exist, show initializer for admins, or error for users
  if (!exists) {
    if (isAdmin) {
      return (
        <ConfigInitializer
          onInitialize={initialize}
          isLoading={initializing}
          error={initError}
        />
      )
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-bold">Configuration Required</h2>
          <p className="text-muted-foreground">
            The site configuration has not been initialized yet. Please contact an administrator to set up the system.
          </p>
        </div>
      </div>
    )
  }

  // If config is loading but exists is true
  if (!config) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Loading configuration...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminContext.Provider 
      value={{ 
        config, 
        updateConfig: handleUpdateConfig, 
        isLoading: updating || loadingConfig,
        isAdmin
      }}
    >
      <AdminLayout />
    </AdminContext.Provider>
  )
}