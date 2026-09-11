import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAccess } from "@/hooks/useAccess";
import { requiredPermissionFor, roleLabel } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Garde-fou de navigation : bloque l'accès direct par URL à un écran
 * dont le profil n'a pas la permission. La base (RLS) reste la sécurité réelle.
 */
export function AccessGuard({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { can, isLoading, primaryRole } = useAccess();
  const permission = requiredPermissionFor(pathname);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (permission && !can(permission)) {
    return (
      <div className="flex justify-center py-16">
        <Card className="max-w-md border-destructive/30">
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle className="font-sans text-base">Accès non autorisé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-sans text-sm text-muted-foreground">
            <p>
              Votre profil ({roleLabel(primaryRole)}) n'a pas accès à cet écran.
            </p>
            <p className="text-xs">
              Contactez la direction si vous pensez qu'il s'agit d'une erreur.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
