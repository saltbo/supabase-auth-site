import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useSiteConfig, isSignupAllowed } from '@/lib/config'
import { requireGuest } from '@/lib/route-guards'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => {
    requireGuest(context)
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
