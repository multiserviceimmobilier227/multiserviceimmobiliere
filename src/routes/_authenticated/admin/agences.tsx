import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgences, createAgence } from '@/lib/auth.functions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, MapPin, Phone } from "lucide-react";
import { useState } from 'react';
import { toast } from "sonner";

import { useUserRole } from '@/routes/_authenticated';

export const Route = createFileRoute('/_authenticated/admin/agences')({
  component: AgencesPage,
});

function AgencesPage() {
  const { role, isLoading, checkPermission } = useUserRole();
  const queryClient = useQueryClient();
  const { data: agences } = useSuspenseQuery({
    queryKey: ['agences'],
    queryFn: () => getAgences(),
  });

  if (isLoading) return null;

  if (!checkPermission('manage_agences')) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-sans">Accès non autorisé.</p>
        </div>
      </div>
    );
  }



  const [isAdding, setIsAdding] = useState(false);
  const [newAgence, setNewAgence] = useState({ name: '', city: 'Maradi', address: '', phone: '' });

  const mutation = useMutation({
    mutationFn: createAgence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agences'] });
      setIsAdding(false);
      setNewAgence({ name: '', city: 'Maradi', address: '', phone: '' });
      toast.success("Agence créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'agence");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ data: newAgence });
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-sans">Gestion des Agences</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? "Annuler" : <><Plus className="h-4 w-4" /> Nouvelle Agence</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Ajouter une Agence</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'agence</Label>
                <Input 
                  id="name" 
                  value={newAgence.name} 
                  onChange={e => setNewAgence({...newAgence, name: e.target.value})} 
                  placeholder="ex: Agence Centrale Maradi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input 
                  id="city" 
                  value={newAgence.city} 
                  onChange={e => setNewAgence({...newAgence, city: e.target.value})} 
                  placeholder="ex: Maradi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input 
                  id="phone" 
                  value={newAgence.phone} 
                  onChange={e => setNewAgence({...newAgence, phone: e.target.value})} 
                  placeholder="+227 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input 
                  id="address" 
                  value={newAgence.address} 
                  onChange={e => setNewAgence({...newAgence, address: e.target.value})} 
                  placeholder="Quartier, Rue..."
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Création..." : "Enregistrer l'agence"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle className="font-sans">Points de Vente MSI</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans">Nom</TableHead>
                <TableHead className="font-sans text-center">Ville</TableHead>
                <TableHead className="font-sans">Adresse / Contact</TableHead>
                <TableHead className="font-sans text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agences?.map((agence) => (
                <TableRow key={agence.id}>
                  <TableCell className="font-medium font-sans">{agence.name}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-sans text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {agence.city}
                    </span>
                  </TableCell>
                  <TableCell className="font-sans text-sm text-muted-foreground">
                    <div>{agence.address}</div>
                    {agence.phone && (
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3" /> {agence.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold font-sans uppercase ${agence.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {agence.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {agences?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground font-sans">
                    Aucune agence configurée.
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
