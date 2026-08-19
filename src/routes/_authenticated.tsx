import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { AppShell } from '@/components/AppShell'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    console.log('[_authenticated] beforeLoad - location:', location.href)
    const { data: { session } } = await supabase.auth.getSession()
    console.log('[_authenticated] beforeLoad - session exists:', !!session)
    if (!session) {
      console.log('[_authenticated] beforeLoad - redirecting to /auth')
      throw redirect({
        to: '/auth',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

