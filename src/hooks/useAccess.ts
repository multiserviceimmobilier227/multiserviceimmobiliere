import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccess, type AccessProfile } from "@/lib/access.functions";

const EMPTY: AccessProfile = { authenticated: false, roles: [], permissions: [] };

export function useAccess() {
  const fetchAccess = useServerFn(getMyAccess);

  const query = useQuery({
    queryKey: ["my-access"],
    queryFn: () => fetchAccess(),
    staleTime: 5 * 60 * 1000,
  });

  const access = (query.data as AccessProfile | undefined) ?? EMPTY;
  const permissions = access.permissions ?? [];
  const roles = access.roles ?? [];

  return {
    ...query,
    access,
    roles,
    permissions,
    agency: access.agency ?? null,
    isSuperAdmin: !!access.is_super_admin,
    primaryRole: roles.includes("super_admin")
      ? "super_admin"
      : (roles[0] ?? null),
    can: (permission?: string | null) =>
      !permission || !!access.is_super_admin || permissions.includes(permission),
  };
}
