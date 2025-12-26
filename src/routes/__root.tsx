import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { PageHead } from '@/components/PageHead'
import { useSiteConfigQuery } from '@/lib/config'

// Generic error component for route-level errors
function DefaultErrorComponent({ error }: { error: Error }) {
  return (
    <AuthLayout>
      <Alert variant="destructive" className="w-full">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-sm sm:text-base">Error</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          {error.message || 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>
    </AuthLayout>
  )
}

function RootComponent() {
  const { isLoading } = useSiteConfigQuery()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <PageHead />
      <Outlet />
      {/* Dev tools only in development */}
      {import.meta.env.DEV && (
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: DefaultErrorComponent,
})
