import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getAcquisitions } from '@/lib/acquisitions.functions';
import { formatFCFA, formatDateNiamey } from '@/lib/utils';
import { 
  History, 
  Plus, 
  Search, 
  TrendingUp, 
  Wallet,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';
import { AcquisitionFormDialog } from '@/components/foncier/AcquisitionFormDialog';

export const Route = createFileRoute('/_authenticated/immobilier/acquisitions')({
  component: AcquisitionsPage,
});

function AcquisitionsPage() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const { data: acquisitions, isLoading } = useQuery({
    queryKey: ['acquisitions'],
    queryFn: () => getAcquisitions(),
  });

  const totalInvested = acquisitions?.reduce((acc: number, acq: any) => {
    const costsTotal = acq.costs?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
    return acc + Number(acq.prix_principal) + costsTotal;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Acquisitions Foncières</h1>
          <p className="text-muted-foreground font-sans">
            Suivi des achats de lotissements et parcelles à l'unité.
          </p>
        </div>
        <Button 
          className="gap-2 font-sans bg-primary hover:bg-primary/90"
          onClick={() => setIsNewOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nouvelle Acquisition
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Total Investi</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{formatFCFA(totalInvested)}</div>
            <p className="text-xs text-muted-foreground font-sans">Investissement global MSI</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Dossiers en Cours</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">
              {acquisitions?.filter((a: any) => a.status === 'En attente').length || 0}
            </div>
            <p className="text-xs text-muted-foreground font-sans">En attente de validation PDG</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Rentabilité Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">24.5%</div>
            <p className="text-xs text-muted-foreground font-sans">Potentiel basé sur le stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par vendeur, lotissement..." 
            className="pl-9 font-sans"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-sans">Date</TableHead>
              <TableHead className="font-sans">Bien / Lotissement</TableHead>
              <TableHead className="font-sans">Vendeur</TableHead>
              <TableHead className="font-sans text-right">Prix Principal</TableHead>
              <TableHead className="font-sans text-right">Frais Annexes</TableHead>
              <TableHead className="font-sans">Statut</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : (
              acquisitions?.map((acq: any) => {
                const costsTotal = acq.costs?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
                return (
                  <TableRow key={acq.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-sans">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDateNiamey(acq.date_achat)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium font-sans">
                      {acq.lotissement?.name || (acq.plot?.plot_number ? `Parcelle ${acq.plot.plot_number}` : 'Lot en gros')}
                    </TableCell>
                    <TableCell className="font-sans text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {acq.vendeur}
                      </div>
                    </TableCell>
                    <TableCell className="font-sans text-right font-medium">
                      {formatFCFA(acq.prix_principal)}
                    </TableCell>
                    <TableCell className="font-sans text-right text-muted-foreground">
                      {formatFCFA(costsTotal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={acq.status === 'Validé' ? 'default' : 'outline'} className="font-sans">
                        {acq.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <History className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            
            {!isLoading && acquisitions?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-sans">
                  Aucune acquisition enregistrée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AcquisitionFormDialog open={isNewOpen} onOpenChange={setIsNewOpen} />
    </div>
  );
}
