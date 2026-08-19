import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUsersWithRoles } from '@/lib/auth.functions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

import { useUserRole } from '@/routes/_authenticated';
import { redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/users')({
  beforeLoad: ({ context }) => {
    // Note: server-side context might not have the role yet during SSR
    // But we check client-side in the component as well
  },
  component: UsersPage,
});

function UsersPage() {
  const { role, isLoading } = useUserRole();
  const { data: users } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => getUsersWithRoles(),
  });

  if (isLoading) return null;

  if (role !== 'pdg' && role !== 'informaticien') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Accès non autorisé.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-sans">Gestion des Utilisateurs</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="font-sans">Utilisateurs Système</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans">ID Utilisateur</TableHead>
                <TableHead className="font-sans">Rôle</TableHead>
                <TableHead className="font-sans text-right">Date d'attribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-sans uppercase">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-sans text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
              {users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground font-sans">
                    Aucun utilisateur trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
