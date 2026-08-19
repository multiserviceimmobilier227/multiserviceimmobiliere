import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getLotissements } from '@/lib/real-estate.functions';
import { 
  Building2, 
  MapPin, 
  Plus, 
  ChevronRight, 
  Layers, 
  Grid,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LotissementFormDialog } from '@/components/foncier/LotissementFormDialog';
import { ZoneFormDialog } from '@/components/foncier/ZoneFormDialog';
import { IlotFormDialog } from '@/components/foncier/IlotFormDialog';
import { PlotFormDialog } from '@/components/foncier/PlotFormDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const Route = createFileRoute('/_authenticated/immobilier/lotissements')({
  component: LotissementsPage,
});

function LotissementsPage() {
  const [isNewLotissementOpen, setIsNewLotissementOpen] = useState(false);
  const [selectedLotissementId, setSelectedLotissementId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedIlotId, setSelectedIlotId] = useState<string | null>(null);
  
  const [isNewZoneOpen, setIsNewZoneOpen] = useState(false);
  const [isNewIlotOpen, setIsNewIlotOpen] = useState(false);
  const [isNewPlotOpen, setIsNewPlotOpen] = useState(false);

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
        <Button 
          className="gap-2 font-sans bg-primary hover:bg-primary/90"
          onClick={() => setIsNewLotissementOpen(true)}
        >
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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {lotissements?.map((lot) => (
            <Card key={lot.id} className="overflow-hidden border-border/50">
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
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold font-sans text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Zones ({lot.zones?.length || 0})
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-xs font-sans gap-1"
                    onClick={() => {
                      setSelectedLotissementId(lot.id);
                      setIsNewZoneOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                    Zone
                  </Button>
                </div>

                <div className="space-y-2">
                  {lot.zones?.map((zone) => (
                    <Collapsible key={zone.id}>
                      <div className="flex items-center justify-between p-2 rounded-md bg-muted/20 border border-border/30">
                        <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left font-sans text-sm hover:text-primary transition-colors">
                          <ChevronDown className="h-3 w-3" />
                          {zone.name}
                          <Badge variant="secondary" className="h-5 text-[10px] px-1.5 ml-auto">
                            {zone.ilots?.length || 0} îlots
                          </Badge>
                        </CollapsibleTrigger>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-2"
                          onClick={() => {
                            setSelectedZoneId(zone.id);
                            setIsNewIlotOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <CollapsibleContent className="pl-6 pt-2 space-y-2">
                        {zone.ilots?.map((ilot) => (
                          <div key={ilot.id} className="flex items-center justify-between p-2 rounded-md bg-card border border-border/20 text-xs">
                            <span className="font-sans font-medium flex items-center gap-2">
                              <Grid className="h-3 w-3 text-muted-foreground" />
                              Îlot {ilot.numero}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-[10px] font-sans gap-1 text-primary hover:text-primary hover:bg-primary/5"
                              onClick={() => {
                                setSelectedIlotId(ilot.id);
                                setIsNewPlotOpen(true);
                              }}
                            >
                              <Plus className="h-2.5 w-2.5" />
                              Parcelle
                            </Button>
                          </div>
                        ))}
                        {zone.ilots?.length === 0 && (
                          <p className="text-[10px] text-muted-foreground italic pl-2">Aucun îlot dans cette zone</p>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  {lot.zones?.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">Aucune zone définie</p>
                  )}
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

      <LotissementFormDialog 
        open={isNewLotissementOpen} 
        onOpenChange={setIsNewLotissementOpen} 
      />

      {selectedLotissementId && (
        <ZoneFormDialog 
          open={isNewZoneOpen} 
          onOpenChange={setIsNewZoneOpen}
          lotissementId={selectedLotissementId}
        />
      )}

      {selectedZoneId && (
        <IlotFormDialog 
          open={isNewIlotOpen} 
          onOpenChange={setIsNewIlotOpen}
          zoneId={selectedZoneId}
        />
      )}

      {selectedIlotId && (
        <PlotFormDialog 
          open={isNewPlotOpen} 
          onOpenChange={setIsNewPlotOpen}
          ilotId={selectedIlotId}
        />
      )}
    </div>
  );
}
