import { createFileRoute } from '@tanstack/react-router'
import { useAdmin } from '@/components/console/AdminContext'
import { ThemeForm } from '@/components/console/ThemeForm'

export const Route = createFileRoute('/console/theme')({
  component: AdminThemePage,
})

function AdminThemePage() {
  const { config, updateConfig, isLoading } = useAdmin()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Customize your site color scheme and gradients.
        </p>
      </div>
      <ThemeForm 
        key={config.revision}
        initialData={config.theme} 
        onSave={(data) => updateConfig({ theme: data })}
        isLoading={isLoading}
      />
    </div>
  )
}
