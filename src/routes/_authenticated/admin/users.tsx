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

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersPage,
});

function UsersPage() {
  const { data: users } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => getUsersWithRoles(),
  });

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
