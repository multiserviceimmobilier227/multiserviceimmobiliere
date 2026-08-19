import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSale } from '@/lib/sales.functions';
import { 
  FileText, 
  User, 
  MapPin, 
  CreditCard,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Calculator,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from 'react';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/_authenticated/crm/ventes/nouveau')({
  component: NewSalePage,
});

function NewSalePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for form
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');
  const [paymentPlanType, setPaymentPlanType] = useState<'comptant' | 'echelonne'>('comptant');
  const [downPayment, setDownPayment] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data using Supabase directly to avoid missing module errors
  const { data: clients } = useSuspenseQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('clients').select('*').order('last_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: plots } = useSuspenseQuery({
    queryKey: ['plots-available'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('plots')
        .select('*, ilot:ilots(*, zone:zones(*, lotissement:lotissements(*)))')
        .or('status.eq.Disponible,status.eq.Réservée')
        .order('plot_number');
      if (error) throw error;
      return data as any[];
    },
  });

  const selectedPlot = useMemo(() => 
    plots?.find(p => p.id === selectedPlotId), 
    [plots, selectedPlotId]
  );

  const totalPrice = selectedPlot?.price || 0;
  const recommendedDownPayment = Math.round(totalPrice * 0.3);

  const mutation = useMutation({
    mutationFn: (data: any) => createSale(data),
    onSuccess: (sale) => {
      toast.success("Contrat de vente créé avec succès");
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['plots'] });
      navigate({ to: '/crm/ventes/$saleId', params: { saleId: sale.id } });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création du contrat");
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedPlotId) {
      toast.error("Veuillez sélectionner un client et une parcelle");
      return;
    }

    if (paymentPlanType === 'echelonne' && downPayment < recommendedDownPayment) {
      if (!confirm(`L'apport initial est inférieur aux 30% recommandés (${formatFCFA(recommendedDownPayment)}). Souhaitez-vous continuer ?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    mutation.mutate({
      clientId: selectedClientId,
      plotId: selectedPlotId,
      agencyId: selectedPlot?.ilot?.zone?.lotissement?.agency_id || '', 
      paymentPlanType,
      totalPrice,
      downPaymentAmount: downPayment,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/crm/ventes' })} size="icon">
          <ChevronRight className="h-5 w-5 rotate-180" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Nouveau Contrat de Vente</h1>
          <p className="text-muted-foreground font-sans">Enregistrement d'une nouvelle acquisition immobilière.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-sans flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Parties au contrat
              </CardTitle>
              <CardDescription>Sélectionnez l'acheteur et la parcelle concernée.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client" className="font-sans">Acheteur (Client)</Label>
                  <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                    <SelectTrigger id="client" className="font-sans">
                      <SelectValue placeholder="Choisir un client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map(client => (
                        <SelectItem key={client.id} value={client.id} className="font-sans">
                          {client.first_name} {client.last_name} ({client.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plot" className="font-sans">Parcelle à vendre</Label>
                  <Select onValueChange={setSelectedPlotId} value={selectedPlotId}>
                    <SelectTrigger id="plot" className="font-sans">
                      <SelectValue placeholder="Choisir une parcelle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {plots?.map(plot => (
                        <SelectItem key={plot.id} value={plot.id} className="font-sans">
                          Lot {plot.plot_number} - {plot.ilot?.zone?.lotissement?.name} ({plot.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-sans flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Modalités de paiement
              </CardTitle>
              <CardDescription>Définissez le mode de règlement et l'apport initial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="font-sans">Type de contrat</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentPlanType('comptant')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentPlanType === 'comptant' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}
                  >
                    <p className="font-bold font-sans">Paiement Comptant</p>
                    <p className="text-xs text-muted-foreground font-sans">Règlement intégral immédiat</p>
                  </div>
                  <div 
                    onClick={() => setPaymentPlanType('echelonne')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentPlanType === 'echelonne' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}
                  >
                    <p className="font-bold font-sans">Vente à Tempérament</p>
                    <p className="text-xs text-muted-foreground font-sans">Échéancier de paiements</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="down-payment" className="font-sans">Apport initial (FCFA)</Label>
                  <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Conseillé (30%): {formatFCFA(recommendedDownPayment)}
                  </span>
                </div>
                <Input 
                  id="down-payment"
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  placeholder="0"
                  className="font-sans text-lg font-bold"
                />
              </div>

              <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm font-sans">
                  <p className="font-semibold">Important</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    La signature du contrat gèle définitivement le prix de la parcelle pour ce client.
                    Toute remise ultérieure nécessitera une validation de la Direction Générale.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm font-sans uppercase text-muted-foreground flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-sans">
                  <span>Prix de la parcelle</span>
                  <span className="font-bold">{formatFCFA(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans text-green-600">
                  <span>Apport initial</span>
                  <span className="font-bold">-{formatFCFA(downPayment)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-sans pt-2">
                  <span className="font-semibold">Reste à payer</span>
                  <span className="font-bold text-primary">{formatFCFA(totalPrice - downPayment)}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full gap-2 font-sans h-12 text-lg" 
                  disabled={!selectedClientId || !selectedPlotId || isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Signer le contrat"}
                  {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
