import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginForm } from '@/components/login-form'
import { resolveRedirect } from '@/lib/redirect'

export const Route = createFileRoute('/signin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const search: { redirect?: string } = Route.useSearch()
  const { redirect: redirectUrl } = search
  
  // Save redirect URL to sessionStorage
  // Priority: query parameter > referer > existing sessionStorage value
  resolveRedirect(redirectUrl)

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
