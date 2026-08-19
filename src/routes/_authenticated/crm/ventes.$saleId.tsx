import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getSaleById, requestSaleAdjustment, validateSaleAdjustment } from '@/lib/sales.functions';
import { getSaleTransfers, transferSalePlot } from '@/lib/transfers.functions';
import { getContractBySaleId, generateContract, signContract } from '@/lib/contracts.functions';
import { getPlots } from '@/lib/real-estate.functions';
import { 
  FileText, 
  User, 
  MapPin, 
  Calendar,
  CreditCard,
  AlertCircle,
  ArrowRightLeft,
  Settings2,
  Download,
  CheckCircle2,
  Printer,
  History,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatFCFA } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useUserRole } from '@/routes/_authenticated';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/crm/ventes/$saleId')({
  component: SaleDetailsPage,
});

const statusStyles: Record<string, { label: string, color: string }> = {
  'en_cours': { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'termine': { label: 'Terminée', color: 'bg-green-100 text-green-800 border-green-200' },
  'annule': { label: 'Annulée', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

function SaleDetailsPage() {
  const { saleId } = Route.useParams();
  const queryClient = useQueryClient();
  const { role } = useUserRole();
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');
  const [transferReason, setTransferReason] = useState('');
  const [adjAmount, setAdjAmount] = useState<string>('0');
  const [adjReason, setAdjReason] = useState('');
  const [adjType, setAdjType] = useState<'price_adjustment' | 'change_plot'>('price_adjustment');

  const { data: sale } = useSuspenseQuery({
    queryKey: ['sale', saleId],
    queryFn: () => (getSaleById as any)(saleId),
  });

  const { data: contract } = useSuspenseQuery({
    queryKey: ['contract', saleId],
    queryFn: () => (getContractBySaleId as any)(saleId),
  });

  const { data: availablePlots } = useQuery({
    queryKey: ['available-plots'],
    queryFn: () => (getPlots as any)({ status: 'Disponible' }),
    enabled: isTransferDialogOpen
  });

  const { data: transfers } = useQuery({
    queryKey: ['sale-transfers', saleId],
    queryFn: () => (getSaleTransfers as any)(saleId),
  });

  const generateMutation = useMutation({
    mutationFn: () => (generateContract as any)(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', saleId] });
      toast.success("Brouillon de contrat généré");
    }
  });

  const signMutation = useMutation({
    mutationFn: (contractId: string) => (signContract as any)(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', saleId] });
      toast.success("Contrat signé officiellement");
    }
  });

  const transferMutation = useMutation({
    mutationFn: (variables: { saleId: string; newPlotId: string; reason: string }) => 
      (transferSalePlot as any)(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sale-transfers', saleId] });
      setIsTransferDialogOpen(false);
      setTransferReason('');
      setSelectedPlotId('');
      toast.success("Mutation de parcelle effectuée avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const requestAdjMutation = useMutation({
    mutationFn: (variables: { saleId: string; amount: number; reason: string; type: any }) => 
      (requestSaleAdjustment as any)(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      setIsAdjustmentDialogOpen(false);
      setAdjAmount('0');
      setAdjReason('');
      toast.success("Demande d'ajustement envoyée");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const validateAdjMutation = useMutation({
    mutationFn: (variables: { adjustmentId: string; approve: boolean }) => 
      (validateSaleAdjustment as any)(variables),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      toast.success(data.status === 'approved' ? "Ajustement validé et appliqué" : "Ajustement refusé");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  if (!sale) return null;

  const selectedPlot = availablePlots?.find((p: any) => p.id === selectedPlotId);
  const priceDiff = selectedPlot ? selectedPlot.base_price - sale.total_price : 0;


  const style = statusStyles[sale.status as string] || statusStyles['en_cours'];
  const totalPrice = sale.total_price || 0;
  const balance = sale.balance || 0;
  const progress = totalPrice > 0 
    ? ((totalPrice - balance) / totalPrice) * 100 
    : 0;

  const canSign = role === 'pdg' || role === 'informaticien' || role === 'admin';

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">
              Dossier Vente #{sale.id.slice(0, 8).toUpperCase()}
            </h1>
            <Badge variant="outline" className={`font-sans text-[10px] uppercase tracking-tighter ${style?.color || ''}`}>
              {style?.label || sale.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-sans">
            Enregistré le {format(new Date(sale.sale_date), 'PPP', { locale: fr })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 font-sans">
            <Download className="h-4 w-4" />
            Contrat PDF
          </Button>
          <Button className="gap-2 font-sans">
            <CreditCard className="h-4 w-4" />
            Encaisser
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-sans flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              État Financier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-sans">Prix de vente</p>
                <p className="text-xl font-bold font-sans">{formatFCFA(totalPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-sans">Déjà payé</p>
                <p className="text-xl font-bold font-sans text-green-600">
                  {formatFCFA(totalPrice - balance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-sans">Reste à payer</p>
                <p className="text-xl font-bold font-sans text-destructive">
                  {formatFCFA(balance)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-sans">
                <span>Progression du paiement</span>
                <span className="font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans flex items-center gap-2 text-muted-foreground uppercase">
                <User className="h-4 w-4" />
                Acheteur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold font-sans text-lg">
                {(sale.client as any)?.first_name} {(sale.client as any)?.last_name}
              </p>
              <p className="text-sm text-muted-foreground font-sans">
                {(sale.client as any)?.phone}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans flex items-center gap-2 text-muted-foreground uppercase">
                <MapPin className="h-4 w-4" />
                Parcelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold font-sans text-lg">Lot {(sale.plot as any)?.plot_number}</p>
              <p className="text-sm text-muted-foreground font-sans">
                {(sale.plot as any)?.ilot?.zone?.lotissement?.name}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full md:w-[500px] grid-cols-4">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="contrat">Contrat & Gel</TabsTrigger>
          <TabsTrigger value="ajustements">Ajustements</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contrat" className="mt-6">
          {!contract ? (
            <Card>
              <CardHeader>
                <CardTitle>Génération du Contrat</CardTitle>
                <CardDescription>
                  Aucun contrat n'a été généré pour cette vente. La génération figera les données actuelles (prix, parcelle, client).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateMutation.mutate()} 
                  disabled={generateMutation.isPending}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Générer le brouillon du contrat
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Contrat {contract.contract_number || '(Brouillon)'}
                      {contract.status === 'signed' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Signé</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Données gelées historiquement</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Imprimer
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-8 text-sm">
                    <div className="space-y-3">
                      <h4 className="font-bold border-b pb-1 uppercase text-[10px] text-muted-foreground">Client (Gelé)</h4>
                      <div className="space-y-1">
                        <p className="font-semibold">{(contract.frozen_client_data as any).first_name} {(contract.frozen_client_data as any).last_name}</p>
                        <p className="text-muted-foreground">Tél: {(contract.frozen_client_data as any).phone}</p>
                        <p className="text-muted-foreground">CNIB: {(contract.frozen_client_data as any).cnib || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold border-b pb-1 uppercase text-[10px] text-muted-foreground">Parcelle (Gelée)</h4>
                      <div className="space-y-1">
                        <p className="font-semibold">Lot {(contract.frozen_plot_data as any).plot_number}</p>
                        <p className="text-muted-foreground">{(contract.frozen_plot_data as any).lotissement_name}</p>
                        <p className="text-muted-foreground">{(contract.frozen_plot_data as any).surface} m²</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-bold uppercase text-[10px] text-muted-foreground mb-3">Conditions Financières (Gelées)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Prix Total</p>
                        <p className="font-bold">{formatFCFA((contract.frozen_price_data as any).total_price)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Apport Initial</p>
                        <p className="font-bold">{formatFCFA((contract.frozen_price_data as any).down_payment)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Solde Restant</p>
                        <p className="font-bold">{formatFCFA((contract.frozen_price_data as any).balance)}</p>
                      </div>
                    </div>
                  </div>

                  {contract.status === 'draft' && (
                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        variant="destructive" 
                        onClick={() => signMutation.mutate(contract.id)}
                        disabled={signMutation.isPending || !canSign}
                        className="gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Signer Officiellement
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase text-muted-foreground">Documents Scannés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-sans">
                      Glissez le contrat signé ici ou cliquez pour uploader (PDF/Image)
                    </p>
                    <Button variant="ghost" size="sm" className="mt-4 text-[10px]">Parcourir</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sans">Conditions du Contrat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground font-sans">Mode de paiement</span>
                  <p className="font-sans font-medium">
                    {(sale as any).payment_plan_type === 'comptant' ? 'Paiement Comptant' : 'Vente à tempérament (Échelonné)'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground font-sans">Apport initial (Down Payment)</span>
                  <p className="font-sans font-medium">{formatFCFA(sale.down_payment || 0)}</p>
                </div>
              </div>
              <Separator />
              <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-sans font-semibold text-sm">Règle de blocage MSI 2.0</h4>
                  <p className="text-xs text-muted-foreground font-sans mt-1">
                    Les données du contrat sont gelées historiquement. Toute modification de prix ou de parcelle doit faire l'objet d'un avenant validé par la Direction Générale.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ajustements" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-sans flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-orange-500" />
                  Mutation de Parcelle
                </CardTitle>
                <CardDescription>Transférer la vente vers une autre parc disponible</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full font-sans"
                  onClick={() => setIsTransferDialogOpen(true)}
                >
                  Initier une mutation
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-sans flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Révision de Prix
                </CardTitle>
                <CardDescription>Appliquer une remise ou ajuster le solde</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full font-sans"
                  onClick={() => setIsAdjustmentDialogOpen(true)}
                >
                  Ajuster le prix
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {(sale.adjustments && (sale.adjustments as any[]).length > 0) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm font-sans uppercase text-muted-foreground flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historique des Ajustements Financiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(sale.adjustments as any[]).map((adj: any) => (
                    <div key={adj.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-muted/20 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge 
                            variant={adj.amount < 0 ? "destructive" : "default"}
                            className="font-mono text-[10px]"
                          >
                            {adj.amount < 0 ? 'REMISE' : 'SURPLUS'}
                          </Badge>
                          <span className="font-bold">{formatFCFA(adj.amount)}</span>
                          <span className="text-muted-foreground text-xs">— {adj.reason}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-[9px] uppercase ${
                            adj.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                            adj.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-orange-100 text-orange-800 border-orange-200'
                          }`}>
                            {adj.status === 'approved' ? 'Validé' : adj.status === 'rejected' ? 'Refusé' : 'En attente PDG'}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground italic">
                            Demandé le {format(new Date(adj.created_at), 'Pp', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      
                      {adj.status === 'pending' && (role === 'pdg' || role === 'admin' || role === 'informaticien') && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-8 text-destructive"
                            onClick={() => validateAdjMutation.mutate({ adjustmentId: adj.id, approve: false })}
                            disabled={validateAdjMutation.isPending}
                          >
                            Refuser
                          </Button>
                          <Button 
                            size="sm" 
                            className="text-xs h-8 bg-green-600 hover:bg-green-700"
                            onClick={() => validateAdjMutation.mutate({ adjustmentId: adj.id, approve: true })}
                            disabled={validateAdjMutation.isPending}
                          >
                            Approuver
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {transfers && transfers.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm font-sans uppercase text-muted-foreground flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historique des Mutations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transfers.map((t: any) => (
                    <div key={t.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-muted/20 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="font-mono text-[10px]">DE</Badge>
                          <span className="font-semibold">Lot {t.old_plot?.plot_number}</span>
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">À</Badge>
                          <span className="font-semibold text-primary">Lot {t.new_plot?.plot_number}</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">"{t.reason}"</p>
                      </div>
                      <div className="text-right text-xs space-y-1">
                        <p className="font-bold">
                          {t.price_difference > 0 ? '+' : ''}{formatFCFA(t.price_difference)}
                        </p>
                        <p className="text-muted-foreground">
                          Le {format(new Date(t.created_at), 'Pp', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-sans flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Mutation vers une nouvelle parcelle
                </DialogTitle>
                <DialogDescription className="font-sans">
                  Sélectionnez une parcelle disponible. Le système calculera automatiquement l'écart de prix.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="font-sans">Nouvelle parcelle</Label>
                  <Select value={selectedPlotId} onValueChange={setSelectedPlotId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une parcelle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlots?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          Lot {p.plot_number} - {p.ilot?.zone?.lotissement?.name} ({formatFCFA(p.base_price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlot && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3 border border-border/50">
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-muted-foreground">Prix actuel :</span>
                      <span className="font-semibold">{formatFCFA(sale.total_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-muted-foreground">Nouveau prix :</span>
                      <span className="font-semibold">{formatFCFA(selectedPlot.base_price)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-sans">
                      <span className="font-bold text-sm">Différence à régulariser :</span>
                      <Badge className={priceDiff > 0 ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-green-100 text-green-800 border-green-200"}>
                        {priceDiff > 0 ? '+' : ''}{formatFCFA(priceDiff)}
                      </Badge>
                    </div>
                    {priceDiff !== 0 && (
                      <div className="flex items-start gap-2 text-[10px] text-muted-foreground mt-2 italic">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        Le solde restant du client passera de {formatFCFA(sale.balance)} à {formatFCFA(sale.balance + priceDiff)}.
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="font-sans">Motif du transfert (requis)</Label>
                  <Textarea 
                    placeholder="Ex: Demande client pour une meilleure zone..." 
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="h-24"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>Annuler</Button>
                <Button 
                  onClick={() => transferMutation.mutate({ 
                    saleId: sale.id, 
                    newPlotId: selectedPlotId, 
                    reason: transferReason 
                  })}
                  disabled={!selectedPlotId || transferReason.length < 5 || transferMutation.isPending}
                  className="gap-2"
                >
                  {transferMutation.isPending ? "Traitement..." : "Confirmer la mutation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="font-sans flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Demande d'ajustement financier
                </DialogTitle>
                <DialogDescription className="font-sans">
                  Toute modification de prix nécessite une validation de la Direction Générale.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="font-sans">Type d'ajustement</Label>
                  <Select value={adjType} onValueChange={(v: any) => setAdjType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_adjustment">Révision de prix / Remise</SelectItem>
                      <SelectItem value="change_plot">Mutation de parcelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-sans">Montant (FCFA)</Label>
                  <div className="relative">
                    <input 
                      type="number"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(e.target.value)}
                    />
                    <div className="absolute right-3 top-2.5 text-[10px] text-muted-foreground font-bold">
                      {Number(adjAmount) < 0 ? 'REMISE' : 'SURPLUS'}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Utilisez un montant négatif (ex: -50000) pour accorder une remise.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="font-sans">Justification de la demande (requis)</Label>
                  <Textarea 
                    placeholder="Détaillez le motif commercial ou l'erreur à corriger..." 
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    className="h-24"
                  />
                </div>

                <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>Nouveau prix prévisionnel :</span>
                    <span className="font-bold">{formatFCFA(sale.total_price + Number(adjAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nouveau solde prévisionnel :</span>
                    <span className="font-bold text-primary">{formatFCFA(sale.balance + Number(adjAmount))}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>Annuler</Button>
                <Button 
                  onClick={() => requestAdjMutation.mutate({ 
                    saleId: sale.id, 
                    amount: Number(adjAmount), 
                    reason: adjReason,
                    type: adjType
                  })}
                  disabled={Number(adjAmount) === 0 || adjReason.length < 5 || requestAdjMutation.isPending}
                  className="gap-2"
                >
                  {requestAdjMutation.isPending ? "Envoi..." : "Envoyer pour validation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="historique" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="p-6 text-center text-muted-foreground font-sans italic">
                Journal d'audit détaillé pour ce dossier de vente.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
