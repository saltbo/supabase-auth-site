import { createFileRoute } from '@tanstack/react-router'
import { useAdmin } from '@/components/console/AdminContext'
import { BrandingForm } from '@/components/console/BrandingForm'

export const Route = createFileRoute('/console/branding')({
  component: AdminBrandingPage,
})

function AdminBrandingPage() {
  const { config, updateConfig, isLoading } = useAdmin()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Customize your site logo and favicon.
        </p>
      </div>
      <BrandingForm 
        key={config.revision}
        initialData={config.branding} 
        onSave={(data) => updateConfig({ branding: data })}
        isLoading={isLoading}
      />
    </div>
  )
}
