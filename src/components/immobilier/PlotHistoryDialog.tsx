import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getPlotHistory } from '@/lib/real-estate.functions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { History, User, Clock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlotHistoryDialogProps {
  plotId: string | null;
  plotNumber: string | null;
  onClose: () => void;
}

export function PlotHistoryDialog({ plotId, plotNumber, onClose }: PlotHistoryDialogProps) {
  const fetchHistory = useServerFn(getPlotHistory);

  const { data: history, isLoading } = useQuery({
    queryKey: ['plot-history', plotId],
    queryFn: () => fetchHistory({ data: plotId! }),
    enabled: !!plotId,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disponible':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Disponible</Badge>;
      case 'Attribuée':
      case 'Vendue':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{status}</Badge>;
      case 'Bloquée':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Bloquée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={!!plotId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#D1127B]" />
            Historique de la Parcelle {plotNumber}
          </DialogTitle>
          <DialogDescription>
            Chronologie complète des changements de statut et des événements.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
            {isLoading ? (
              <div className="text-center py-10 text-muted-foreground">Chargement de l'historique...</div>
            ) : history?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">Aucun historique disponible pour cette parcelle.</div>
            ) : (
              history?.map((event, idx) => (
                <div key={event.id} className="relative flex items-start gap-6 pl-2">
                  <div className="absolute left-0 mt-1.5 h-10 w-10 flex items-center justify-center rounded-full bg-white border-2 border-muted shadow-sm z-10">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 bg-muted/30 rounded-lg p-4 border border-muted-foreground/10 ml-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {event.old_status && (
                          <>
                            {getStatusBadge(event.old_status)}
                            <span className="text-xs text-muted-foreground">→</span>
                          </>
                        )}
                        {getStatusBadge(event.new_status)}
                      </div>
                      <time className="text-xs font-medium text-muted-foreground">
                        {format(new Date(event.created_at), 'PPP à p', { locale: fr })}
                      </time>
                    </div>

                    {event.reason && (
                      <div className="flex items-start gap-2 text-sm text-foreground bg-white/50 p-2 rounded border border-white mb-3">
                        <Info className="h-4 w-4 text-[#D1127B] mt-0.5 shrink-0" />
                        <span>{event.reason}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Action enregistrée par le système</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
