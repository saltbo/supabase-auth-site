import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Mail, ArrowLeft } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/check-email')({
  component: CheckEmailPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: search.email as string | undefined,
    }
  },
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: '/',
      })
    }
  },
})

function CheckEmailPage() {
  const { email } = Route.useSearch()

  return (
    <AuthLayout>
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
          <p className="text-muted-foreground">
            We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Click the link in the email to sign in. <br />
          If you don't see it, check your spam folder.
        </p>

        <div className="flex flex-col gap-2 w-full pt-4">
          <Button variant="outline" asChild className="w-full">
            <Link to="/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
