import { StrictMode, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Import auth modules
import { AuthProvider, useAuth } from './lib/auth'
import { initializeAuth, type RouterContext } from './lib/auth-init'
import { ErrorBoundary } from './components/ErrorBoundary'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

// Create a query client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Note: Theme colors are injected dynamically by Logo and AuthLayout components
// when the config is loaded from Storage

// Create router factory - router needs auth context at creation time
function createAppRouter(context: RouterContext) {
  return createRouter({
    routeTree,
    context,
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })
}

// Type for router instance
type AppRouter = ReturnType<typeof createAppRouter>

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter
  }
}

function InnerApp({ router }: { router: AppRouter }) {
  const auth = useAuth()
  
  // Memoize auth state to prevent unnecessary re-renders
  // This passes the latest auth state to the router context
  const authState = useMemo(() => ({
    user: auth.user,
    session: auth.session,
    isAuthenticated: !!auth.session,
  }), [auth.user, auth.session])

  return <RouterProvider router={router} context={{ auth: authState }} />
}

// Bootstrap the application
async function bootstrap() {
  const rootElement = document.getElementById('app')
  if (!rootElement || rootElement.innerHTML) return

  // Show loading state while initializing auth
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fafafa;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 16px; color: #6b7280; font-family: system-ui, sans-serif;">Initializing...</p>
      </div>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `

  // Initialize auth state before creating router
  // This handles OAuth code exchange if present in URL
  const authState = await initializeAuth()

  // Create router with auth context
  const router = createAppRouter({ auth: authState })

  // Clear loading state and render app
  rootElement.innerHTML = ''
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthProvider initialState={authState}>
            <InnerApp router={router} />
          </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()