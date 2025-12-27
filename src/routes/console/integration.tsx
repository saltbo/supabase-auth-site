import { createFileRoute } from '@tanstack/react-router'
import { useAdmin } from '@/components/console/AdminContext'
import { IntegrationGuide } from '@/components/console/IntegrationGuide'

export const Route = createFileRoute('/console/integration')({
  component: AdminIntegrationPage,
})

function AdminIntegrationPage() {
  const { config } = useAdmin()

  return (
    <div className="max-w-4xl">
       <div className="mb-6">
        <p className="text-muted-foreground">
          Guides and examples for integrating your application with the authentication system.
        </p>
      </div>
      <IntegrationGuide config={config} />
    </div>
  )
}
