import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { AppShell } from '@/components/AppShell'
import { useEffect, useState, createContext, useContext } from 'react'
import { getCurrentUserRole } from '@/lib/auth.functions'

type UserRoleContextType = {
  role: string | null;
  agenceId: string | null;
  isLoading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  agenceId: null,
  isLoading: true,
})

export const useUserRole = () => useContext(UserRoleContext)

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
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
  const [userRole, setUserRole] = useState<{ role: string | null; agenceId: string | null; isLoading: boolean }>({
    role: null,
    agenceId: null,
    isLoading: true,
  })

  useEffect(() => {
    setMounted(true)
    
    const fetchRole = async () => {
      try {
        const roleData = await getCurrentUserRole()
        setUserRole({
          role: roleData?.role || null,
          agenceId: roleData?.agence_id || null,
          isLoading: false,
        })
      } catch (error) {
        console.error("Failed to fetch user role:", error)
        setUserRole(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    fetchRole()
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <UserRoleContext.Provider value={userRole}>
      <AppShell>
        <Outlet />
      </AppShell>
    </UserRoleContext.Provider>
  )
}

