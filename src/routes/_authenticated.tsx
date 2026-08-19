import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { AppShell } from '@/components/AppShell'
import { useEffect, useState, createContext, useContext } from 'react'
import { getCurrentUserRole } from '@/lib/auth.functions'
import { AppRole, Permission, hasPermission } from '@/lib/permissions'
import { toast } from 'sonner'

type UserRoleContextType = {
  role: AppRole | null;
  agenceId: string | null;
  isLoading: boolean;
  checkPermission: (permission: Permission) => boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  agenceId: null,
  isLoading: true,
  checkPermission: () => false,
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
  const [userRole, setUserRole] = useState<{ role: AppRole | null; agenceId: string | null; isLoading: boolean }>({
    role: null,
    agenceId: null,
    isLoading: true,
  })
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    const fetchRole = async () => {
      try {
        const roleData = await getCurrentUserRole()
        setUserRole({
          role: (roleData?.role as AppRole) || null,
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

  const checkPermission = (permission: Permission) => {
    return hasPermission(userRole.role, permission)
  }

  if (!mounted) {
    return null
  }

  return (
    <UserRoleContext.Provider value={{ ...userRole, checkPermission }}>
      <AppShell>
        <Outlet />
      </AppShell>
    </UserRoleContext.Provider>
  )
}


