import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { isUserAdmin } from '@/lib/config-service'
import { getProviderMetadata } from '@/lib/auth-providers'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Clock, 
  Fingerprint, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  Wifi,
  Cpu,
  Mail
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({
        to: '/signin',
      })
    }
  },
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const { user, session, loading, signOut } = useAuth()
  const [showDevInfo, setShowDevInfo] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/signin' })
  }

  // Show loading state while AuthProvider initializes
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium">Initializing...</p>
        </div>
      </div>
    )
  }

  const isAdmin = isUserAdmin(user?.email)

  const getUserInitials = (email: string): string => {
    return email.split('@')[0]?.substring(0, 2).toUpperCase() || 'U'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getSystemInfo = () => {
    if (typeof navigator === 'undefined') return { os: 'Unknown', browser: 'Unknown' }
    
    const ua = navigator.userAgent
    let os = 'Unknown OS'
    if (ua.indexOf('Win') !== -1) os = 'Windows'
    if (ua.indexOf('Mac') !== -1) os = 'macOS'
    if (ua.indexOf('Linux') !== -1) os = 'Linux'
    if (ua.indexOf('Android') !== -1) os = 'Android'
    if (ua.indexOf('like Mac') !== -1) os = 'iOS'

    let browser = 'Unknown Browser'
    if (ua.indexOf('Chrome') !== -1) browser = 'Chrome'
    if (ua.indexOf('Firefox') !== -1) browser = 'Firefox'
    if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari'
    if (ua.indexOf('Edg') !== -1) browser = 'Edge'

    return { os, browser }
  }

  const systemInfo = getSystemInfo()
  const providerName = user.app_metadata?.provider || 'email'
  const provider = getProviderMetadata(providerName)
  const ProviderIcon = providerName === 'email' ? Mail : provider.icon

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 -z-10" />
      
      <div className="container max-w-5xl mx-auto px-4 py-12 md:py-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              {getGreeting()}, <br className="hidden md:block" />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {user.user_metadata?.full_name?.split(' ')[0] || 'Traveler'}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome to your personal identity hub.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <Button asChild className="gap-2 shadow-lg shadow-primary/20">
              <Link to="/console">
                <Settings className="h-4 w-4" />
                Console
              </Link>
            </Button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Main Profile Card - Spans 2 cols */}
          <Card className="md:col-span-2 p-8 relative overflow-hidden group border-muted/60 bg-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Fingerprint className="h-32 w-32" />
             </div>

             <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {getUserInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  {user.email_confirmed_at && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-4 border-background" title="Verified Email">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {user.user_metadata?.full_name || user.email}
                    </h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isAdmin ? (
                      <Badge variant="secondary" className="px-3 py-1 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
                        Admin
                      </Badge>
                    ) : user?.is_anonymous ? (
                      <Badge variant="secondary" className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">
                        Anonymous
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        Member
                      </Badge>
                    )}
                    <Badge variant="outline" className="px-3 py-1 gap-1">
                      <Clock className="h-3 w-3" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
             </div>
          </Card>

          {/* Connection Status Card */}
          <Card className="p-6 flex flex-col justify-between border-muted/60 bg-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
             <div>
               <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                 <Wifi className="h-5 w-5" />
               </div>
               <h3 className="font-semibold text-lg mb-1">Connection</h3>
               <p className="text-sm text-muted-foreground">Securely connected via</p>
             </div>
             
             <div className="mt-4">
               <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-muted">
                 <span className="font-medium capitalize flex items-center gap-2">
                   <ProviderIcon className="h-4 w-4 opacity-70" />
                   {provider.displayName}
                 </span>
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
               </div>
             </div>
          </Card>
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <Card className="p-5 border-muted/60 hover:border-primary/50 transition-colors cursor-default">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span className="font-medium">Security</span>
              </div>
              <p className="text-2xl font-bold">{user.factors?.length ? 'Enhanced' : 'Standard'}</p>
              <p className="text-xs text-muted-foreground mt-1">MFA is {user.factors?.length ? 'enabled' : 'not enabled'}</p>
           </Card>

           <Card className="p-5 border-muted/60 hover:border-primary/50 transition-colors cursor-default">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Session</span>
              </div>
              <p className="text-2xl font-bold">Active</p>
              <p className="text-xs text-muted-foreground mt-1">Expires {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}</p>
           </Card>

           <Card className="p-5 border-muted/60 hover:border-primary/50 transition-colors cursor-default">
              <div className="flex items-center gap-3 mb-2">
                <Fingerprint className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Identity</span>
              </div>
              <p className="text-2xl font-bold">{user.identities?.length || 1}</p>
              <p className="text-xs text-muted-foreground mt-1">Linked accounts</p>
           </Card>

           <Card className="p-5 border-muted/60 hover:border-primary/50 transition-colors cursor-default">
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="h-5 w-5 text-slate-500" />
                <span className="font-medium">System</span>
              </div>
              <p className="text-2xl font-bold">v{import.meta.env.APP_VERSION}</p>
              <p className="text-xs text-muted-foreground mt-1">{systemInfo.os} • {systemInfo.browser}</p>
           </Card>
        </div>

        {/* Developer Mode Section */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Developer Mode
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDevInfo(!showDevInfo)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showDevInfo ? 'Hide Details' : 'View Details'}
                {showDevInfo ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
              </Button>
           </div>
           
           {showDevInfo && (
             <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <Card className="bg-slate-950 border-slate-800 text-slate-300 overflow-hidden shadow-2xl">
                  <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-400">user_metadata.json</span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-auto max-h-[300px] custom-scrollbar">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                </Card>

                <Card className="bg-slate-950 border-slate-800 text-slate-300 overflow-hidden shadow-2xl">
                  <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-400">app_metadata.json</span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    </div>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-auto max-h-[300px] custom-scrollbar">
                    {JSON.stringify(user.app_metadata, null, 2)}
                  </pre>
                </Card>
             </div>
           )}
        </div>

      </div>
    </div>
  )
}