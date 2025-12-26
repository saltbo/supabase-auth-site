import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { isUserAdmin } from '@/lib/config-service'
import { AdminPanel } from '@/components/admin/AdminPanel'

export const Route = createFileRoute('/admin/')({
  beforeLoad: async () => {
    // 1. Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw redirect({
        to: '/signin',
        search: { redirect: '/admin' },
      })
    }

    // 2. Check if user is admin
    const user = session.user
    if (!user || !isUserAdmin(user.email)) {
      throw redirect({
        to: '/',
        search: { error: 'unauthorized' },
      })
    }
  },
  component: AdminPage,
})

function AdminPage() {
  return <AdminPanel />
}
