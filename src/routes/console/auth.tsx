import { createFileRoute } from '@tanstack/react-router'
import { useAdmin } from '@/components/console/AdminContext'
import { AuthConfigForm } from '@/components/console/AuthConfigForm'

export const Route = createFileRoute('/console/auth')({
  component: AdminAuthPage,
})

function AdminAuthPage() {
  const { config, updateConfig, isLoading } = useAdmin()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Configure authentication providers, sign-up settings, and security options.
        </p>
      </div>
      <AuthConfigForm 
        key={config.revision}
        initialData={config.auth} 
        onSave={(data) => updateConfig({ auth: data })}
        isLoading={isLoading}
      />
    </div>
  )
}
