import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRolePermissions, updateRolePermission } from '@/lib/permissions.functions';
import { AppRole, Permission } from '@/lib/permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";
import { useUserRole } from '@/routes/_authenticated';
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/permissions')({
  component: PermissionsPage,
});

const ALL_ROLES: AppRole[] = [
  'pdg', 'informaticien', 'responsable_agence', 'secretaire', 'comptable', 'commercial', 'client'
];

const PERMISSION_LABELS: Record<Permission, string> = {
  view_dashboard: 'Voir Tableau de bord',
  manage_users: 'Gérer Utilisateurs',
  manage_agences: 'Gérer Agences',
  view_audit_logs: 'Voir Logs Audit',
  manage_settings: 'Gérer Paramètres',
  view_lotissements: 'Voir Lotissements',
  create_lotissement: 'Créer Lotissement',
  manage_plots: 'Gérer Parcelles',
  view_tarifs: 'Voir Tarifs',
  manage_tarifs: 'Gérer Tarifs',
  view_acquisitions: 'Voir Acquisitions',
  manage_acquisitions: 'Gérer Acquisitions',
  view_clients: 'Voir Clients',
  manage_clients: 'Gérer Clients',
  manage_sales: 'Gérer Ventes',
  view_sales: 'Voir Ventes',
  create_sale: 'Créer Vente',
  adjust_sale: 'Ajuster Vente (PDG)',
  view_finance: 'Voir Finance',
  manage_finance: 'Gérer Finance',
  view_reservations: 'Voir Réservations',
  create_reservation: 'Créer Réservation',
  manage_reservations: 'Gérer Réservations',
  manage_contracts: 'Gérer Contrats',
  sign_contract: 'Signer Contrat (Critique)'
};

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[];

function PermissionsPage() {
  const { role, isLoading: isRoleLoading } = useUserRole();
  const queryClient = useQueryClient();

  const { data: dbPermissions } = useSuspenseQuery({
    queryKey: ['role_permissions'],
    queryFn: () => getRolePermissions(),
  });

  const mutation = useMutation({
    mutationFn: (args: { role: string; permission: string; enabled: boolean }) => updateRolePermission({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role_permissions'] });
      toast.success("Permission mise à jour");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  if (isRoleLoading) return null;

  if (role !== 'pdg' && role !== 'informaticien') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-destructive mx-auto opacity-50" />
          <h2 className="text-xl font-semibold font-sans">Accès non autorisé</h2>
          <p className="text-muted-foreground font-sans">Seul le PDG ou l'Informaticien peut modifier la matrice des permissions.</p>
        </div>
      </div>
    );
  }

  const isEnabled = (role: AppRole, permission: Permission) => {
    return dbPermissions?.some((p: any) => p.role === role && p.permission === permission);
  };

  const handleToggle = (role: AppRole, permission: Permission, checked: boolean) => {
    if ((role === 'pdg' || role === 'informaticien') && !checked) {
       toast.error("Impossible de retirer des permissions aux administrateurs système.");
       return;
    }

    mutation.mutate({
      role,
      permission,
      enabled: checked
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">Matrice des Permissions</h1>
          <p className="text-muted-foreground font-sans">Contrôlez précisément les actions autorisées pour chaque rôle métier.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle className="font-sans text-lg">Configuration des Accès</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] font-sans">Action / Fonctionnalité</TableHead>
                {ALL_ROLES.map(r => (
                  <TableHead key={r} className="text-center font-sans capitalize min-w-[120px]">
                    {r.replace('_', ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_PERMISSIONS.map(permission => (
                <TableRow key={permission}>
                  <TableCell className="font-medium font-sans py-4">
                    {PERMISSION_LABELS[permission]}
                    <div className="text-[10px] text-muted-foreground font-mono">{permission}</div>
                  </TableCell>
                  {ALL_ROLES.map(r => (
                    <TableCell key={`${r}-${permission}`} className="text-center py-4">
                      <div className="flex justify-center">
                        <Switch 
                          checked={isEnabled(r, permission)}
                          onCheckedChange={(checked) => handleToggle(r, permission, checked)}
                          disabled={mutation.isPending || r === 'pdg' || r === 'informaticien'}
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
