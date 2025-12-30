import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginForm } from '@/components/login-form'
import { resolveRedirect } from '@/lib/redirect'
import { requireGuest } from '@/lib/route-guards'

export const Route = createFileRoute('/signin')({
  beforeLoad: ({ context }) => {
    requireGuest(context)
  },
  component: LoginPage,
})

function LoginPage() {
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
