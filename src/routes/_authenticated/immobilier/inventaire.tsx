import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getPlots } from '@/lib/real-estate.functions';
import { getDashboardStats } from '@/lib/acquisitions.functions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { ClipboardList, CheckCircle2, AlertTriangle, Building, User } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/immobilier/inventaire')({
  component: InventoryPage,
});

function InventoryPage() {
  const fetchPlots = useServerFn(getPlots);
  const fetchStats = useServerFn(getDashboardStats);

  const { data: plots, isLoading: plotsLoading } = useQuery({
    queryKey: ['plots', 'all'],
    queryFn: () => fetchPlots({ data: {} }),
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetchStats(),
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventaire & Stock Réel</h1>
          <p className="text-muted-foreground">Certification MSI 2.0 — État exhaustif du patrimoine foncier.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Certifié Intègre</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Capacité Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRealPlots || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Parcelles physiques dans le système</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Taux d'Occupation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats?.totalRealPlots ? Math.round(((stats.activeSalesCount || 0) / stats.totalRealPlots) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.activeSalesCount || 0} parcelles attribuées</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Stock Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.availablePlotsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Prêtes pour la vente</p>
          </CardContent>
        </Card>
      </div>

      {(stats?.activeSalesCount || 0) > (stats?.totalRealPlots || 0) && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-4 text-red-800">
          <AlertTriangle className="h-8 w-8 text-red-600 shrink-0" />
          <div>
            <h4 className="font-bold">ANOMALIE D'INVENTAIRE DÉTECTÉE</h4>
            <p className="text-sm">Le nombre de ventes actives excède le stock réel. Une intervention manuelle est requise pour régulariser les doublons.</p>
          </div>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#D1127B]" />
            Répertoire des Parcelles
          </CardTitle>
          <CardDescription>Liste exhaustive et statuts en temps réel.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold uppercase text-xs">N° Parcelle</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Lotissement</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Surface</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Prix Base</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Statut</TableHead>
                  <TableHead className="font-bold uppercase text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plotsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Chargement de l'inventaire...</TableCell>
                  </TableRow>
                ) : plots?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Aucune parcelle enregistrée.</TableCell>
                  </TableRow>
                ) : (
                  plots?.map((plot) => (
                    <TableRow key={plot.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium font-mono">{plot.plot_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{plot.ilot?.zone?.lotissement?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{plot.surface_area} m²</TableCell>
                      <TableCell className="font-semibold text-primary">{formatFCFA(plot.base_price)}</TableCell>
                      <TableCell>{getStatusBadge(plot.status)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                          Historique
                        </Badge>
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
  );
}
