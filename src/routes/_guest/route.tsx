/**
 * Guest Routes Layout
 *
 * All routes under /_guest/ are for unauthenticated users only.
 * Authenticated users are redirected to the redirect param or home page.
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireGuest } from '@/lib/route-guards'

export const Route = createFileRoute('/_guest')({
  beforeLoad: ({ context, location }) => {
    requireGuest(context, location)
  },
  component: () => <Outlet />,
})
