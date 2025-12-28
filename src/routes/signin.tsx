import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginForm } from '@/components/login-form'
import { resolveRedirect } from '@/lib/redirect'
import { useSiteConfig } from '@/lib/config'

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
  const search: { redirect?: string } = Route.useSearch()
  const { redirect: redirectUrl } = search
  const config = useSiteConfig()
  
  // Save redirect URL to sessionStorage
  // Priority: query parameter > referer > existing sessionStorage value
  resolveRedirect(redirectUrl, config)

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
