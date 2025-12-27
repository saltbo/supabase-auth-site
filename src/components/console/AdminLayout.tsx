import { useState } from 'react'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { 
  LayoutDashboard, 
  Palette, 
  Globe, 
  Lock, 
  ArrowLeft,
  Code2,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAdmin } from './AdminContext'

import { Logo } from '@/components/Logo'
import { useAuth } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { config } = useAdmin()
  const { user } = useAuth()
  const location = useLocation()

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin'
  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = displayName.slice(0, 2).toUpperCase()

  const menuItems = [
    { to: '/console/site', label: 'Site Info', icon: Globe },
    { to: '/console/branding', label: 'Branding', icon: LayoutDashboard },
    { to: '/console/theme', label: 'Theme', icon: Palette },
    { to: '/console/auth', label: 'Authentication', icon: Lock },
    { to: '/console/integration', label: 'Integration', icon: Code2 },
  ] as const

  const activeItem = menuItems.find(item => location.pathname.startsWith(item.to))

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background z-40 px-4 flex items-center justify-between">
        <Logo config={config} className="h-8" />
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r bg-muted/10 transition-transform duration-200 lg:translate-x-0 bg-background lg:bg-muted/10 flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3 border-b lg:border-none">
          <Logo config={config} className="h-8" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4">
          {menuItems.map((item) => (
            <Button
              key={item.to}
              asChild
              variant={location.pathname === item.to ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left",
                location.pathname === item.to && "bg-secondary font-medium"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link to={item.to}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t bg-background/50 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-1">
            <Avatar className="h-9 w-9 border cursor-default">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 lg:p-10 pt-20 lg:pt-10">
        <div className="max-w-5xl space-y-8 mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            {activeItem && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {activeItem.label}
              </h1>
            )}
          </div>

          <Separator />

          <div className="mt-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
