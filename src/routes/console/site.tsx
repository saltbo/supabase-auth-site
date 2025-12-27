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
      <SiteInfoForm 
        key={config.revision}
        config={config}
        onSave={(updates) => updateConfig(updates)}
        isLoading={isLoading}
      />
    </div>
  )
}
