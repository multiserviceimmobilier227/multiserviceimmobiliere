import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSales } from '@/lib/sales.functions';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  User, 
  MapPin, 
  Clock,
  ChevronRight,
  TrendingUp
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatFCFA } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/crm/ventes')({
  component: SalesListPage,
});

const statusStyles: Record<string, { label: string, color: string }> = {
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  termine: { label: 'Terminée', color: 'bg-green-100 text-green-800 border-green-200' },
  reservation: { label: 'Réservation', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  annule: { label: 'Annulée', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

function SalesListPage() {
  const { data: sales } = useSuspenseQuery({
    queryKey: ['sales'],
    queryFn: () => getSales(),
  });

  const totalSalesValue = sales?.reduce((acc: number, s: any) => acc + (s.total_price || 0), 0) || 0;
  const activeSalesCount = sales?.filter((s: any) => s.status === 'en_cours').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Gestion des Ventes</h1>
          <p className="text-muted-foreground font-sans">
            Suivi des contrats, attributions et paiements échelonnés.
          </p>
        </div>
        <Link to="/crm/ventes/nouveau">
          <Button className="gap-2 font-sans">
            <Plus className="h-4 w-4" />
            Nouvelle Vente
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Total Ventes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{formatFCFA(totalSalesValue)}</div>
            <p className="text-xs text-muted-foreground font-sans">Valeur contractuelle totale</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Dossiers Actifs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{activeSalesCount}</div>
            <p className="text-xs text-muted-foreground font-sans">En cours de paiement</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Taux de Recouvrement</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">-- %</div>
            <p className="text-xs text-muted-foreground font-sans">Phase 10 (Finance) à venir</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par client, parcelle, contrat..." 
            className="pl-9 font-sans w-full"
          />
        </div>
        <Button variant="outline" className="gap-2 font-sans">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-sans">Client</TableHead>
              <TableHead className="font-sans">Parcelle / Lotissement</TableHead>
              <TableHead className="font-sans">Date Vente</TableHead>
              <TableHead className="font-sans">Montant Total</TableHead>
              <TableHead className="font-sans">Reste à payer</TableHead>
              <TableHead className="font-sans">Statut</TableHead>
              <TableHead className="font-sans text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales?.map((sale: any) => {
              const style = statusStyles[sale.status as string] || statusStyles.en_cours;
              
              return (
                <TableRow key={sale.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium font-sans text-sm">{sale.client?.first_name} {sale.client?.last_name}</span>
                      <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">{sale.client?.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-sans text-sm">Lot {sale.plot?.plot_number}</span>
                      <span className="text-xs text-muted-foreground font-sans">
                        {sale.plot?.ilot?.zone?.lotissement?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    {format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-sans font-medium text-sm">
                    {formatFCFA(sale.total_price)}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-destructive font-medium">
                    {formatFCFA(sale.balance)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-sans text-[10px] uppercase tracking-tighter ${style.color}`}>
                      {style.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to="/crm/ventes/$saleId" params={{ saleId: sale.id }}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {sales?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-sans">
                  Aucune vente enregistrée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
