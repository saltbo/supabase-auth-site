import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  configExists,
  initializeConfig,
  fetchConfigFromStorage,
  uploadConfigToStorage,
} from '@/lib/config-service'
import { ConfigInitializer } from './ConfigInitializer'
import { SiteConfigEditor } from './SiteConfigEditor'

export function AdminPanel() {
  const queryClient = useQueryClient()

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
    onError: (error) => {
      console.error('Failed to initialize config:', error)
    },
  })

  // Update config mutation
  const { mutate: updateConfig, isPending: updating } = useMutation({
    mutationFn: uploadConfigToStorage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] })
    },
  })

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

  // If config doesn't exist, show initializer
  if (!exists) {
    return (
      <ConfigInitializer
        onInitialize={initialize}
        isLoading={initializing}
        error={initError}
      />
    )
  }

  // Show config editor
  return (
    <SiteConfigEditor
      config={config}
      onSave={updateConfig}
      isLoading={loadingConfig || updating}
    />
  )
}
