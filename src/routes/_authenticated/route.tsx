/**
 * Authenticated Routes Layout
 *
 * All routes under /_authenticated/ require authentication.
 * The guard is applied once here, no need to repeat in child routes.
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    requireAuth(context, { redirectTo: location.pathname })
  },
  component: () => <Outlet />,
})
