import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservations, cancelReservation } from '@/lib/reservations.functions';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/immobilier/reservations')({
  component: ReservationsPage,
});

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
  active: { label: 'Active', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
  converted: { label: 'Convertie', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  expired: { label: 'Expirée', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
  cancelled: { label: 'Annulée', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
};

function ReservationsPage() {
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  
  const { data: reservations } = useSuspenseQuery({
    queryKey: ['reservations'],
    queryFn: () => getReservations(),
  });

  const cancelMutation = useMutation({
    mutationFn: (args: { reservationId: string, reason: string }) => cancelReservation({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['plots'] });
      toast.success("Réservation annulée");
      setCancelReason("");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const getTimeRemaining = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - new Date().getTime();
    if (remaining < 0) return "Expiré";
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}j restants`;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    return `${hours}h restantes`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Réservations</h1>
        <p className="text-muted-foreground font-sans">
          Gestion des options temporaires sur le foncier.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un client, une parcelle..." 
            className="pl-9 font-sans w-full"
          />
        </div>
        <Button variant="outline" className="gap-2 font-sans">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-sans">Client</TableHead>
              <TableHead className="font-sans">Parcelle</TableHead>
              <TableHead className="font-sans">Date Création</TableHead>
              <TableHead className="font-sans">Expiration</TableHead>
              <TableHead className="font-sans">Statut</TableHead>
              <TableHead className="font-sans text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations?.map((res: any) => {
              const config = statusConfig[res.status as keyof typeof statusConfig] || statusConfig['active'];
              const StatusIcon = config.icon;
              
              return (
                <TableRow key={res.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium font-sans">{res.client?.first_name} {res.client?.last_name}</span>
                      <span className="text-xs text-muted-foreground font-sans">{res.client?.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-sans">Lot {res.plot?.number}</span>
                      <span className="text-xs text-muted-foreground font-sans">{res.plot?.lotissement?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    {format(new Date(res.created_at), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-sans text-sm">
                        {format(new Date(res.expires_at), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      {res.status === 'active' && (
                        <span className={`text-xs font-medium ${
                          new Date(res.expires_at).getTime() - new Date().getTime() < 86400000 * 2 
                          ? 'text-destructive' 
                          : 'text-blue-600'
                        }`}>
                          {getTimeRemaining(res.expires_at)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-sans flex items-center gap-1 w-fit ${config.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {res.status === 'active' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 font-sans">
                            Annuler
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-sans">Annuler la réservation ?</AlertDialogTitle>
                            <AlertDialogDescription className="font-sans">
                              Cette action libérera immédiatement la parcelle. Veuillez indiquer le motif.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <Input 
                              placeholder="Motif d'annulation..." 
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="font-sans"
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-sans">Retour</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
                              disabled={!cancelReason}
                              onClick={() => cancelMutation.mutate({ reservationId: res.id, reason: cancelReason })}
                            >
                              Confirmer l'annulation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {reservations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-sans">
                  Aucune réservation en cours.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
