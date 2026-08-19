import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { AppShell } from '@/components/AppShell'
import { useEffect, useState, createContext, useContext } from 'react'
import { getCurrentUserRole } from '@/lib/auth.functions'
import { getRolePermissions } from '@/lib/permissions.functions'
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
  const [userRole, setUserRole] = useState<{ 
    role: AppRole | null; 
    agenceId: string | null; 
    isLoading: boolean;
    dynamicPermissions: any[];
  }>({
    role: null,
    agenceId: null,
    isLoading: true,
    dynamicPermissions: [],
  })
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    const fetchRoleAndPermissions = async () => {
      try {
        // Run fetches in parallel for speed
        const [roleData, permissionsData] = await Promise.all([
          getCurrentUserRole().catch(err => {
            console.error("Error fetching role:", err);
            return null;
          }),
          getRolePermissions().catch(err => {
            console.error("Error fetching permissions:", err);
            return [];
          })
        ])

        
        setUserRole({
          role: (roleData?.role as AppRole) || null,
          agenceId: roleData?.agence_id || null,
          isLoading: false,
          dynamicPermissions: Array.isArray(permissionsData) ? permissionsData : [],
        })
      } catch (error) {
        console.error("Failed to fetch user role or permissions:", error)
        // If fetch fails, we still stop loading so UI doesn't hang
        setUserRole(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    fetchRoleAndPermissions()
  }, [])

  const checkPermission = (permission: Permission) => {
    return hasPermission(userRole.role, permission, userRole.dynamicPermissions)
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


