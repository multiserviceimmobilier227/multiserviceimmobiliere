import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppSettings, updateBusinessRules } from '@/lib/auth.functions';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Percent, Calendar, Wallet, Check } from "lucide-react";
import { useState, useEffect } from 'react';
import { toast } from "sonner";

import { useUserRole } from '@/routes/_authenticated';

export const Route = createFileRoute('/_authenticated/admin/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { role, isLoading } = useUserRole();
  const queryClient = useQueryClient();
  const { data: settings } = useSuspenseQuery({
    queryKey: ['settings'],
    queryFn: () => getAppSettings(),
  });

  if (isLoading) return null;

  if (role !== 'pdg' && role !== 'informaticien') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground font-sans">Accès non autorisé.</p>
      </div>
    );
  }


  const businessRules = settings?.find(s => s.key === 'business_rules')?.value as any;

  const [rules, setRules] = useState({
    recommended_down_payment_pct: 30,
    payment_durations_months: [15, 20],
    cancellation_penalty_pct: 20,
    reservation_duration_days: 15,
    currency: 'FCFA'
  });

  useEffect(() => {
    if (businessRules) {
      setRules(businessRules);
    }
  }, [businessRules]);

  const mutation = useMutation({
    mutationFn: updateBusinessRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success("Paramètres mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    }
  });

  const handleSave = () => {
    mutation.mutate({ data: { rules } });
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-sans">Paramètres Métier</h1>
        <Button onClick={handleSave} disabled={mutation.isPending} className="gap-2">
          <Check className="h-4 w-4" /> Enregistrer les modifications
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-sans">
              <Percent className="h-5 w-5 text-primary" />
              Conditions de Vente
            </CardTitle>
            <CardDescription>
              Règles financières appliquées aux nouveaux contrats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apport">Apport initial recommandé (%)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="apport" 
                  type="number" 
                  value={rules.recommended_down_payment_pct} 
                  onChange={e => setRules({...rules, recommended_down_payment_pct: Number(e.target.value)})}
                />
                <span className="text-sm font-medium">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="penalty">Pénalité d'annulation (%)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="penalty" 
                  type="number" 
                  value={rules.cancellation_penalty_pct} 
                  onChange={e => setRules({...rules, cancellation_penalty_pct: Number(e.target.value)})}
                />
                <span className="text-sm font-medium">%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-sans">
              <Calendar className="h-5 w-5 text-primary" />
              Délais & Durées
            </CardTitle>
            <CardDescription>
              Gestion du temps et des échéances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservation">Durée de réservation (jours)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="reservation" 
                  type="number" 
                  value={rules.reservation_duration_days} 
                  onChange={e => setRules({...rules, reservation_duration_days: Number(e.target.value)})}
                />
                <span className="text-sm font-medium">jours</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Durées de paiement autorisées (mois)</Label>
              <div className="flex gap-2">
                {rules.payment_durations_months.map((duration, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      className="w-20"
                      value={duration} 
                      onChange={e => {
                        const newDurations = [...rules.payment_durations_months];
                        newDurations[idx] = Number(e.target.value);
                        setRules({...rules, payment_durations_months: newDurations});
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-sans">
              <Wallet className="h-5 w-5 text-primary" />
              Devise & Système
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Devise principale</Label>
              <Input 
                id="currency" 
                value={rules.currency} 
                onChange={e => setRules({...rules, currency: e.target.value})}
                placeholder="FCFA"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
