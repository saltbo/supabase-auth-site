import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginForm } from '@/components/login-form'
import { captureRedirectIntent } from '@/lib/redirect-manager'

export const Route = createFileRoute('/_guest/signin')({
  component: LoginPage,
})

function LoginPage() {
  const search: { redirect?: string } = Route.useSearch()

  // Capture redirect intent in useEffect (not during render)
  useEffect(() => {
    captureRedirectIntent(search.redirect)
  }, [search.redirect])

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
