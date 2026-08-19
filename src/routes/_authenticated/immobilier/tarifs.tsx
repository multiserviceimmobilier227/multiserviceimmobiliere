import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getPriceTemplates } from '@/lib/pricing.functions';
import { formatFCFA } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Clock
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/immobilier/tarifs')({
  component: PricingPage,
});

function PricingPage() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['priceTemplates'],
    queryFn: () => getPriceTemplates(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Tarification & Offres</h1>
          <p className="text-muted-foreground font-sans">
            Gestion des grilles tarifaires et suivi des prix catalogue.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 font-sans bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Nouvelle Grille
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans text-muted-foreground">Grilles Actives</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{templates?.filter(t => t.is_active).length || 0}</div>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              Basées sur les gabarits standards
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans text-muted-foreground">Prix Moyen / m²</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">
              {templates && templates.length > 0 
                ? formatFCFA(Math.round(templates.reduce((acc, t) => acc + Number(t.price_per_m2), 0) / templates.length)) 
                : '0 FCFA'}
            </div>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              Moyenne des gabarits actifs
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans text-muted-foreground">Validations en attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">0</div>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              Modifications soumises au PDG
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une grille..." 
            className="pl-9 font-sans"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-sans">Nom de la Grille</TableHead>
              <TableHead className="font-sans text-right">Surface Min</TableHead>
              <TableHead className="font-sans text-right">Surface Max</TableHead>
              <TableHead className="font-sans text-right">Prix / m²</TableHead>
              <TableHead className="font-sans text-center">Statut</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full mx-auto" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : (
              templates?.map((template) => (
                <TableRow key={template.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium font-sans">{template.name}</TableCell>
                  <TableCell className="font-sans text-right">{template.surface_range_min} m²</TableCell>
                  <TableCell className="font-sans text-right">{template.surface_range_max} m²</TableCell>
                  <TableCell className="font-sans text-right font-medium">
                    {formatFCFA(Number(template.price_per_m2))}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={template.is_active ? "outline" : "secondary"} className={`font-sans ${template.is_active ? 'bg-green-50 text-green-700 border-green-200' : ''}`}>
                      {template.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            
            {!isLoading && templates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-sans">
                  Aucune grille tarifaire configurée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="border-border/50 shadow-sm border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-lg font-sans flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Règles métier - Tarification
          </CardTitle>
          <CardDescription className="font-sans">
            Rappels des principes non-négociables de MSI 2.0
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-sans text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-bold mb-1">Non-rétroactivité</h4>
              <p className="text-muted-foreground">Toute modification de prix n'impacte jamais un contrat déjà signé ou une réservation en cours.</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-bold mb-1">Traçabilité des Remises</h4>
              <p className="text-muted-foreground">Les réductions sont enregistrées séparément. Le calcul est toujours : Catalogue - Réduction = Prix Final.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}