import { createFileRoute } from '@tanstack/react-router'
import { useAdmin } from '@/components/console/AdminContext'
import { SiteInfoForm } from '@/components/console/SiteInfoForm'

export const Route = createFileRoute('/console/site')({
  component: AdminSitePage,
})

function AdminSitePage() {
  const { config, updateConfig, isLoading } = useAdmin()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Basic information about your site including name, slogan, and description.
        </p>
      </div>
      <SiteInfoForm 
        key={config.revision}
        initialData={config.site} 
        onSave={(data) => updateConfig({ site: data })}
        isLoading={isLoading}
      />
    </div>
  )
}
