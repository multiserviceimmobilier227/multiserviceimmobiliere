import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlotPricingHistory, preparePlotPricing, validatePlotPricing } from '@/lib/pricing.functions';
import { formatFCFA, formatDateNiamey } from '@/lib/utils';
import { 
  History, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/immobilier/parcelles/$plotId/prix')({
  component: PlotPricingPage,
});

function PlotPricingPage() {
  const { plotId } = Route.useParams();
  const queryClient = useQueryClient();
  const [newPrice, setNewPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const { data: history, isLoading } = useQuery({
    queryKey: ['plotPricing', plotId],
    queryFn: () => getPlotPricingHistory({ plotId }),
  });

  const prepareMutation = useMutation({
    mutationFn: (data: { plot_id: string; base_price: number; notes: string }) => 
      preparePlotPricing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plotPricing', plotId] });
      setNewPrice('');
      setNotes('');
      toast.success("Proposition de prix enregistrée");
    },
    onError: (error) => toast.error(error.message),
  });

  const validateMutation = useMutation({
    mutationFn: (data: { pricingId: string; plotId: string; basePrice: number }) => 
      validatePlotPricing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plotPricing', plotId] });
      toast.success("Prix validé et activé");
    },
    onError: (error) => toast.error(error.message),
  });

  const handlePrepare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice) return;
    prepareMutation.mutate({
      plot_id: plotId,
      base_price: Number(newPrice),
      notes
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/immobilier/parcelles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary font-sans">Historique des prix</h1>
          <p className="text-muted-foreground font-sans text-sm">
            Parcelle ID: {plotId.split('-')[0]}...
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-sans flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Nouveau Prix
              </CardTitle>
              <CardDescription className="font-sans">
                Proposer un changement de prix catalogue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePrepare} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium font-sans">Nouveau Prix (FCFA)</label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 5000000" 
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium font-sans">Motif du changement</label>
                  <Textarea 
                    placeholder="Justification pour l'audit..." 
                    className="min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary"
                  disabled={prepareMutation.isPending}
                >
                  {prepareMutation.isPending ? 'Enregistrement...' : 'Proposer au PDG'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200 text-orange-900 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Avertissement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-sans">
              Toute modification importante ou réduction inhabituelle doit être explicitement validée par le PDG. Le prix n'est effectif qu'après validation.
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-sans">Chronologie</CardTitle>
                <CardDescription className="font-sans">Historique complet des tarifs et validations.</CardDescription>
              </div>
              <History className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-sans">Date</TableHead>
                      <TableHead className="font-sans text-right">Montant</TableHead>
                      <TableHead className="font-sans">Statut</TableHead>
                      <TableHead className="font-sans">Auteurs</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell></TableRow>
                    ) : (
                      history?.map((entry) => (
                        <TableRow key={entry.id} className={entry.validated_by_id ? "" : "bg-orange-50/30"}>
                          <TableCell className="font-sans whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1 text-sm font-medium">
                                <Calendar className="h-3 w-3" />
                                {formatDateNiamey(entry.effective_date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-sans text-right font-bold">
                            {formatFCFA(Number(entry.base_price))}
                          </TableCell>
                          <TableCell>
                            {entry.validated_by_id ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                <ShieldCheck className="h-3 w-3" /> Validé
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-sans">
                            <div className="flex flex-col text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> Prep: {entry.preparer?.email?.split('@')[0]}
                              </span>
                              {entry.validator && (
                                <span className="flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3" /> Val: {entry.validator?.email?.split('@')[0]}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {!entry.validated_by_id && (
                              <Button 
                                size="sm" 
                                className="h-7 text-xs bg-primary hover:bg-primary/90"
                                onClick={() => validateMutation.mutate({
                                  pricingId: entry.id,
                                  plotId: plotId,
                                  basePrice: Number(entry.base_price)
                                })}
                                disabled={validateMutation.isPending}
                              >
                                Valider
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}