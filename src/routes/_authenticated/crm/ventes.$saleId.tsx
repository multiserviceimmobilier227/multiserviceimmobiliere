import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSaleById } from '@/lib/sales.functions';
import { getContractBySaleId, generateContract, signContract } from '@/lib/contracts.functions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  Printer
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
  const { data: sale } = useSuspenseQuery({
    queryKey: ['sale', saleId],
    queryFn: () => (getSaleById as any)(saleId),
  });

  const { data: contract } = useSuspenseQuery({
    queryKey: ['contract', saleId],
    queryFn: () => (getContractBySaleId as any)(saleId),
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

  if (!sale) return null;

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
                  Transfert de Parcelle
                </CardTitle>
                <CardDescription>Changer la parcelle A pour une parcelle B</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full font-sans">Initier un transfert</Button>
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
                <Button variant="outline" className="w-full font-sans">Ajuster le prix</Button>
              </CardContent>
            </Card>
          </div>
          
          {(sale as any).adjustments && (sale as any).adjustments.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm font-sans uppercase text-muted-foreground">Historique des Ajustements</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Liste des ajustements ici */}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="historique" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="p-6 text-center text-muted-foreground font-sans italic">
                Journal d'audit détaillé pour ce contrat (en cours de liaison).
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
