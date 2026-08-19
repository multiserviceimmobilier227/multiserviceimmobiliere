import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getPlots } from '@/lib/real-estate.functions';
import { 
  Grid, 
  Search, 
  Filter, 
  History,
  Info,
  ChevronDown
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Route = createFileRoute('/_authenticated/immobilier/parcelles')({
  component: ParcellesPage,
});

const statusColors: Record<string, string> = {
  'Disponible': 'bg-green-100 text-green-800 border-green-200',
  'Réservée': 'bg-blue-100 text-blue-800 border-blue-200',
  'Attribuée': 'bg-purple-100 text-purple-800 border-purple-200',
  'En cours de paiement': 'bg-orange-100 text-orange-800 border-orange-200',
  'Entièrement payée': 'bg-teal-100 text-teal-800 border-teal-200',
  'Vendue': 'bg-slate-100 text-slate-800 border-slate-200',
  'Bloquée': 'bg-red-100 text-red-800 border-red-200',
  'Annulée': 'bg-gray-100 text-gray-800 border-gray-200',
};

function ParcellesPage() {
  const { data: plots, isLoading } = useQuery({
    queryKey: ['plots'],
    queryFn: () => getPlots(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Parcelles</h1>
          <p className="text-muted-foreground font-sans">
            Suivi individuel et cycle de vie de chaque parcelle.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2 font-sans">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
          <Button className="flex-1 sm:flex-none gap-2 font-sans bg-primary hover:bg-primary/90">
            <Grid className="h-4 w-4" />
            Vue Grille
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par numéro, îlot, lotissement..." 
            className="pl-9 font-sans w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between gap-2 font-sans w-full md:w-auto">
              Statut: Tous
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Tous</DropdownMenuItem>
            <DropdownMenuItem>Disponible</DropdownMenuItem>
            <DropdownMenuItem>Réservée</DropdownMenuItem>
            <DropdownMenuItem>Vendue</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-sans">Référence</TableHead>
              <TableHead className="font-sans">Lotissement / Zone</TableHead>
              <TableHead className="font-sans">Îlot</TableHead>
              <TableHead className="font-sans text-right">Superficie</TableHead>
              <TableHead className="font-sans text-right">Prix (FCFA)</TableHead>
              <TableHead className="font-sans">Statut</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-muted animate-pulse rounded-full" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : (
              plots?.map((plot: any) => (
                <TableRow key={plot.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium font-sans">{plot.plot_number}</TableCell>
                  <TableCell className="font-sans">
                    <div className="flex flex-col">
                      <span>{plot.ilot?.zone?.lotissement?.name}</span>
                      <span className="text-xs text-muted-foreground">{plot.ilot?.zone?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-sans">{plot.ilot?.numero}</TableCell>
                  <TableCell className="font-sans text-right">{plot.surface_area} m²</TableCell>
                  <TableCell className="font-sans text-right font-medium">
                    {plot.base_price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-sans ${statusColors[plot.status] || ''}`}>
                      {plot.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Info className="h-4 w-4" />
                      </Button>
                      <Link to="/immobilier/parcelles/$plotId/prix" params={{ plotId: plot.id }}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <History className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            
            {!isLoading && plots?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-sans">
                  Aucune parcelle trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
