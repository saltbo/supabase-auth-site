import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { 
  LayoutDashboard, 
  Palette, 
  Globe, 
  Lock, 
  Code2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAdmin } from './AdminContext'

import { Logo } from '@/components/Logo'
import { useAuth } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PreviewPanel } from './preview/PreviewPanel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { config } = useAdmin()
  const { user, signOut } = useAuth()
  const location = useLocation()

  // Lock body scroll when admin layout is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin'
  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = displayName.slice(0, 2).toUpperCase()

  const menuItems = [
    { 
      to: '/console/site', 
      label: 'Site', 
      icon: Globe,
      description: 'Basic information about your site including name, slogan, description and logo.'
    },
    { 
      to: '/console/theme', 
      label: 'Theme', 
      icon: Palette,
      description: 'Customize your site color scheme and gradients.'
    },
    { 
      to: '/console/auth', 
      label: 'Authentication', 
      icon: Lock,
      description: 'Configure authentication providers, sign-up settings, and security options.'
    },
    { 
      to: '/console/integration', 
      label: 'Integration', 
      icon: Code2,
      description: 'Guides and examples for integrating your application with the authentication system.'
    },
  ] as const

  const activeItem = menuItems.find(item => location.pathname.startsWith(item.to))
  const showPreview = activeItem?.to !== '/console/integration'

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background fixed inset-0">
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
        "fixed inset-y-0 left-0 z-40 border-r bg-muted/10 transition-all duration-300 lg:relative lg:translate-x-0 bg-background lg:bg-muted/10 flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className={cn(
          "p-6 flex items-center gap-3 border-b lg:border-none h-20",
          isCollapsed ? "justify-center px-0" : "justify-between lg:justify-start"
        )}>
          <Link to="/" className="transition-opacity hover:opacity-80">
            <Logo config={config} showText={!isCollapsed} className="h-8" />
          </Link>
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
                "w-full justify-start text-left relative group",
                location.pathname === item.to && "bg-secondary font-medium",
                isCollapsed && "justify-center px-0"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link to={item.to}>
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border shadow-md">
                    {item.label}
                  </div>
                )}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t bg-background/50 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full h-auto p-2 flex items-center gap-3 hover:bg-accent group transition-all duration-200",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <Avatar className="h-9 w-9 border flex-shrink-0 transition-transform group-hover:scale-105">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="text-sm font-medium truncate text-foreground leading-none mb-1">
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate leading-none">
                      {user?.email}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side={isCollapsed ? "right" : "top"} 
              align={isCollapsed ? "end" : "start"} 
              className="w-56 mb-2"
              sideOffset={12}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  <span>返回首页</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" 
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm z-50 hover:bg-accent"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      {/* Main Container: Form + Preview */}
      <div className="flex-1 flex overflow-hidden pt-16 lg:pt-0">
        {/* Middle Column: Forms */}
        <main className={cn(
          "flex-1 overflow-y-auto p-4 lg:p-8 xl:p-10",
          showPreview && "border-r"
        )}>
          <div className={cn(
            "mx-auto space-y-8",
            showPreview ? "max-w-3xl" : "max-w-5xl"
          )}>
            {activeItem && (
              <div className="flex items-center gap-4 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
                  {activeItem.label}
                </h1>
                <p className="text-sm text-muted-foreground pt-1 truncate">
                  {activeItem.description}
                </p>
              </div>
            )}
            
            <div className="mt-8">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Right Column: Preview */}
        {showPreview && (
          <div className="hidden lg:block w-[450px] xl:w-[500px] flex-shrink-0 bg-muted/5">
            <PreviewPanel />
          </div>
        )}
      </div>
    </div>
  )
}
