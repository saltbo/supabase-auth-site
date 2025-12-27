import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { useSiteConfig, isPasswordAllowed } from '@/lib/config'

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: '/',
      })
    }
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
