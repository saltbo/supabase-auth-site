import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { useSiteConfig, isPasswordAllowed } from '@/lib/config'
import { requireGuest } from '@/lib/route-guards'

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: ({ context }) => {
    requireGuest(context)
  },
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const config = useSiteConfig()
  const navigate = useNavigate()
  
  const passwordAllowed = isPasswordAllowed(config)

  useEffect(() => {
    if (!passwordAllowed) {
      navigate({ to: '/signin' })
    }
  }, [passwordAllowed, navigate])

  if (!passwordAllowed) {
    return null
  }

  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
