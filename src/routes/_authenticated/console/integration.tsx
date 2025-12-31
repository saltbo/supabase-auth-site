import { createFileRoute } from '@tanstack/react-router'
import { useAdmin } from '@/components/console/AdminContext'
import { IntegrationGuide } from '@/components/console/IntegrationGuide'

export const Route = createFileRoute('/_authenticated/console/integration')({
  component: AdminIntegrationPage,
})

function AdminIntegrationPage() {
  const { config } = useAdmin()

  return (
    <div className="max-w-4xl">
      <IntegrationGuide config={config} />
    </div>
  )
}
