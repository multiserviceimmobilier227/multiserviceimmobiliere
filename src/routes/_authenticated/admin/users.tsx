import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { listUserAccounts, createUserAccount, setUserRole } from '@/lib/access.functions';
import { getAgences } from '@/lib/auth.functions';
import { roleLabel } from '@/lib/permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, Users } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersPage,
});

const ROLES = [
  'pdg',
  'comptable',
  'secretaire',
  'commercial',
  'responsable_agence',
  'informaticien',
  'client',
] as const;

function UsersPage() {
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(listUserAccounts);
  const fetchAgences = useServerFn(getAgences);
  const createUser = useServerFn(createUserAccount);
  const updateRole = useServerFn(setUserRole);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'commercial' as (typeof ROLES)[number],
    agenceId: '',
  });

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['user-accounts'],
    queryFn: () => fetchUsers(),
  });

  const { data: agences } = useQuery({
    queryKey: ['agences'],
    queryFn: () => fetchAgences(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createUser({
        data: {
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          role: form.role,
          agenceId: form.agenceId || null,
        },
      }),
    onSuccess: () => {
      toast.success('Compte créé avec succès');
      setOpen(false);
      setForm({ email: '', password: '', fullName: '', role: 'commercial', agenceId: '' });
      queryClient.invalidateQueries({ queryKey: ['user-accounts'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Création impossible'),
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: (typeof ROLES)[number]; agenceId: string | null }) =>
      updateRole({ data: vars }),
    onSuccess: () => {
      toast.success('Profil mis à jour');
      queryClient.invalidateQueries({ queryKey: ['user-accounts'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Mise à jour impossible'),
  });

  const agencyList = (agences as any[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">Gestion des Utilisateurs</h1>
          <p className="text-sm text-muted-foreground font-sans">
            Créez les profils métier et rattachez-les à une agence.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-sans">Créer un compte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Nom complet</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Ex. Aïcha Moussa"
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="prenom.nom@msi.ne"
                />
              </div>
              <div className="space-y-1">
                <Label>Mot de passe provisoire</Label>
                <Input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="8 caractères minimum"
                />
              </div>
              <div className="space-y-1">
                <Label>Profil</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as (typeof ROLES)[number] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Agence</Label>
                <Select
                  value={form.agenceId}
                  onValueChange={(v) => setForm({ ...form, agenceId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une agence" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencyList.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} — {a.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={
                  createMutation.isPending ||
                  !form.email ||
                  form.password.length < 8 ||
                  form.fullName.length < 2
                }
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? 'Création...' : 'Créer le compte'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="font-sans">Utilisateurs Système</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="py-8 text-center text-sm text-destructive font-sans">
              {(error as Error).message}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-sans">Utilisateur</TableHead>
                  <TableHead className="font-sans">Profil(s)</TableHead>
                  <TableHead className="font-sans">Agence</TableHead>
                  <TableHead className="font-sans text-right">Changer de profil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users as any[])?.map((u) => {
                  const mainRole = u.roles?.[0];
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-sans">
                        <div className="font-medium">{u.full_name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell className="space-x-1">
                        {u.roles?.length ? (
                          u.roles.map((r: any) => (
                            <Badge key={r.role} variant="outline" className="font-sans">
                              {roleLabel(r.role)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground font-sans">Aucun profil</span>
                        )}
                      </TableCell>
                      <TableCell className="font-sans text-sm text-muted-foreground">
                        {mainRole?.agences?.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          onValueChange={(v) =>
                            roleMutation.mutate({
                              userId: u.id,
                              role: v as (typeof ROLES)[number],
                              agenceId: mainRole?.agence_id ?? null,
                            })
                          }
                        >
                          <SelectTrigger className="ml-auto w-[190px]">
                            <SelectValue placeholder="Attribuer un profil" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {roleLabel(r)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && (users as any[])?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground font-sans">
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
