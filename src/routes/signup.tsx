import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/layouts/AuthLayout'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useSiteConfig, isSignupAllowed } from '@/lib/config'

export const Route = createFileRoute('/signup')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: SignupPage,
})

function SignupPage() {
  const config = useSiteConfig()
  const navigate = useNavigate()
  
  const signupAllowed = isSignupAllowed(config)

  useEffect(() => {
    if (!signupAllowed) {
      navigate({ to: '/signin' })
    }
  }, [signupAllowed, navigate])

  if (!signupAllowed) {
    return null
  }

  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  )
}
