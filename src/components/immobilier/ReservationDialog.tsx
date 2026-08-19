import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createReservation } from "@/lib/reservations.functions";
import { getClients } from "@/lib/crm.functions";
import { toast } from "sonner";
import { Calendar, User, Clock } from "lucide-react";

interface ReservationDialogProps {
  plotId: string;
  plotNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationDialog({ plotId, plotNumber, isOpen, onClose }: ReservationDialogProps) {
  const [clientId, setClientId] = useState<string>("");
  const [duration, setDuration] = useState<string>("15");
  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: { plotId: string; clientId: string; durationDays: number }) =>
      createReservation({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Réservation créée avec succès");
      onClose();
      setClientId("");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    mutation.mutate({
      plotId,
      clientId,
      durationDays: parseInt(duration),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-sans">
            <Calendar className="h-5 w-5 text-primary" />
            Réserver la parcelle {plotNumber}
          </DialogTitle>
          <DialogDescription className="font-sans">
            La parcelle sera bloquée temporairement pour ce client.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="font-sans flex items-center gap-2">
              <User className="h-4 w-4" /> Client
            </Label>
            <Select onValueChange={setClientId} value={clientId}>
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id} className="font-sans">
                    {client.first_name} {client.last_name} ({client.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-sans flex items-center gap-2">
              <Clock className="h-4 w-4" /> Durée de réservation
            </Label>
            <Select onValueChange={setDuration} value={duration}>
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Choisir la durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15" className="font-sans">15 jours (Standard)</SelectItem>
                <SelectItem value="30" className="font-sans">30 jours</SelectItem>
                <SelectItem value="45" className="font-sans">45 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-sans">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={mutation.isPending}
            className="font-sans bg-primary hover:bg-primary/90"
          >
            Confirmer la réservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
