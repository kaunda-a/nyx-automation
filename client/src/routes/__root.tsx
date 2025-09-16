
import { useEffect } from 'react'
import { createRootRouteWithContext, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/auth/api/stores/authStore'
import { Toaster } from '@/components/ui/toaster'
import { supabase } from '@/lib/supabase'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useLoading } from '@/provider/loading-context'

// Add NotFound component
function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-lg">Page not found</p>
    </div>
  )
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/') {
      throw redirect({
        to: '/admin',
      })
    }
  }
})

function RootComponent() {
  const { user, setUser } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()
  const { setIsLoading } = useLoading()

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)

        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          navigate({ to: '/logout-success' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate, setUser, setIsLoading])

  return (
    <>
      <Outlet />
      <Toaster />
      {import.meta.env.MODE === 'development' && (
        <>
          <ReactQueryDevtools buttonPosition='bottom-left' />
          <TanStackRouterDevtools position='bottom-right' />
        </>
      )}
    </>
  )
}
