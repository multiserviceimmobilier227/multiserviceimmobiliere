import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getLotissements } from '@/lib/real-estate.functions';
import { 
  Building2, 
  MapPin, 
  Plus, 
  ChevronRight, 
  Layers, 
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/immobilier/lotissements')({
  component: LotissementsPage,
});

function LotissementsPage() {
  const { data: lotissements, isLoading } = useQuery({
    queryKey: ['lotissements'],
    queryFn: () => getLotissements(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-sans">Lotissements & Zones</h1>
          <p className="text-muted-foreground font-sans">
            Gérez votre portefeuille foncier, les lotissements et leurs divisions.
          </p>
        </div>
        <Button className="gap-2 font-sans bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nouveau Lotissement
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[250px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lotissements?.map((lot) => (
            <Card key={lot.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-sans text-primary">{lot.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 font-sans">
                      <MapPin className="h-3 w-3" />
                      {lot.location}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-sans">
                    {lot.agence?.name || 'Siège'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-sans">
                      <Layers className="h-4 w-4" />
                      Zones
                    </div>
                    <span className="font-medium font-sans">{lot.zones?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-sans">
                      <Grid className="h-4 w-4" />
                      Îlots
                    </div>
                    <span className="font-medium font-sans">
                      {lot.zones?.reduce((acc: number, z: any) => acc + (z.ilots?.length || 0), 0) || 0}
                    </span>
                  </div>
                  
                  {lot.superficie_totale && (
                    <div className="text-xs text-muted-foreground font-sans mt-2 italic">
                      Superficie totale: {lot.superficie_totale.toLocaleString()} m²
                    </div>
                  )}
                  
                  <Button variant="ghost" className="w-full justify-between group font-sans text-primary hover:text-primary hover:bg-primary/5 mt-2">
                    Voir les détails
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {lotissements?.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium font-sans">Aucun lotissement</h3>
              <p className="text-muted-foreground font-sans">Commencez par créer votre premier lotissement.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
