import { createFileRoute } from '@tanstack/react-router'
import { useAdmin } from '@/components/console/AdminContext'
import { AuthConfigForm } from '@/components/console/AuthConfigForm'

export const Route = createFileRoute('/_authenticated/console/auth')({
  component: AdminAuthPage,
})

function AdminAuthPage() {
  const { config, updateConfig, isLoading } = useAdmin()

  return (
    <div className="max-w-4xl">
      <AuthConfigForm
        key={config.revision}
        initialData={config.auth}
        onSave={(data) => updateConfig({ auth: data })}
        isLoading={isLoading}
      />
    </div>
  )
}
