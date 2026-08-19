import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersWithRoles, assignUserRole, getAgences } from '@/lib/auth.functions';
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
import { 
  Users, 
  Shield, 
  Building2, 
  MoreVertical,
  UserPlus
} from "lucide-react";
import { useUserRole } from '@/routes/_authenticated';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { AppRole } from '@/lib/permissions';

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersPage,
});

function UsersPage() {
  const { role, isLoading: isRoleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<AppRole | ''>('');
  const [editAgence, setEditAgence] = useState<string | 'none'>('none');

  const { data: users } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => getUsersWithRoles(),
  });

  const { data: agences } = useSuspenseQuery({
    queryKey: ['agences'],
    queryFn: () => getAgences(),
  });

  const mutation = useMutation({
    mutationFn: assignUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditDialogOpen(false);
      toast.success("Rôle utilisateur mis à jour avec succès");
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
          <p className="text-muted-foreground font-sans">Vous n'avez pas les permissions nécessaires pour gérer les utilisateurs.</p>
        </div>
      </div>
    );
  }

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditRole(user.role as AppRole);
    setEditAgence(user.agence_id || 'none');
    setIsEditDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!selectedUser || !editRole) return;
    mutation.mutate({
      data: {
        userId: selectedUser.user_id,
        role: editRole,
        agenceId: editAgence === 'none' ? null : editAgence
      }
    });
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string, color: string }> = {
      pdg: { label: 'PDG', color: 'bg-primary text-primary-foreground' },
      informaticien: { label: 'Informaticien', color: 'bg-blue-600 text-white' },
      secretaire: { label: 'Secrétaire', color: 'bg-purple-500 text-white' },
      commercial: { label: 'Commercial', color: 'bg-green-500 text-white' },
      comptable: { label: 'Comptable', color: 'bg-orange-500 text-white' },
      responsable_agence: { label: 'Resp. Agence', color: 'bg-indigo-500 text-white' },
      client: { label: 'Client', color: 'bg-gray-500 text-white' },
    };
    const config = roles[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={`font-sans uppercase text-[10px] ${config.color}`}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground font-sans">Assignez et modifiez les rôles et agences de vos collaborateurs.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="font-sans">Utilisateurs Système</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans">Utilisateur</TableHead>
                <TableHead className="font-sans">Rôle</TableHead>
                <TableHead className="font-sans">Agence</TableHead>
                <TableHead className="font-sans">Date d'attribution</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">{user.user_id.split('-')[0]}...</span>
                      <span className="text-xs font-sans italic text-muted-foreground truncate max-w-[150px]">{user.user_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-sans">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {user.agences?.name || <span className="text-muted-foreground italic">Non assigné</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-sans text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 font-sans">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>
                          Modifier les accès
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-sans">
                    Aucun utilisateur trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] font-sans">
          <DialogHeader>
            <DialogTitle>Modifier les accès</DialogTitle>
            <DialogDescription>
              Assignez un nouveau rôle ou changez l'agence de rattachement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Rôle utilisateur</Label>
              <Select value={editRole} onValueChange={(val) => setEditRole(val as AppRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdg">PDG</SelectItem>
                  <SelectItem value="informaticien">Informaticien</SelectItem>
                  <SelectItem value="responsable_agence">Responsable Agence</SelectItem>
                  <SelectItem value="secretaire">Secrétaire</SelectItem>
                  <SelectItem value="comptable">Comptable</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agence">Agence de rattachement</Label>
              <Select value={editAgence} onValueChange={setEditAgence}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une agence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune agence</SelectItem>
                  {agences?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveRole} disabled={mutation.isPending}>
              {mutation.isPending ? "Mise à jour..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
