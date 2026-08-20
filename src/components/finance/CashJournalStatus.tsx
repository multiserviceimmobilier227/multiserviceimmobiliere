import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getActiveCashJournal, openCashSession, closeCashSession } from "@/lib/finance.functions";
import { 
  Wallet, 
  Lock, 
  Unlock, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatFCFA } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export function CashJournalStatus() {
  const queryClient = useQueryClient();
  const getActiveSession = useServerFn(getActiveCashJournal);
  const openSessionFn = useServerFn(openCashSession);
  const closeSessionFn = useServerFn(closeCashSession);
  const [openingBalance, setOpeningBalance] = useState<string>("0");
  const [closingBalance, setClosingBalance] = useState<string>("0");
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { data: activeSession, isLoading } = useQuery({
    queryKey: ["active-cash-journal"],
    queryFn: () => getActiveSession(),
    refetchInterval: 60000,
  });

  const { data: userAgency } = useQuery({
    queryKey: ["user-agency"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("agence_id")
        .eq("user_id", user.id)
        .single();
      return data?.agence_id;
    }
  });

  const openMutation = useMutation({
    mutationFn: async () => {
      if (!userAgency) throw new Error("Aucune agence rattachée.");
      return openSessionFn({ 
        data: { 
          openingBalance: parseFloat(openingBalance),
          agencyId: userAgency
        } 
      });
    },
    onSuccess: () => {
      toast.success("Caisse ouverte avec succès");
      queryClient.invalidateQueries({ queryKey: ["active-cash-journal"] });
      setIsOpening(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'ouverture");
    }
  });

  if (isLoading) return null;

  if (!activeSession) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-700">
            <Lock className="h-4 w-4" />
            Caisse Fermée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-orange-600 mb-4">
            Aucune session de caisse n'est ouverte pour votre agence aujourd'hui.
          </p>
          {isOpening ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-orange-700">Solde d'ouverture (FCFA)</label>
                <Input 
                  type="number" 
                  value={openingBalance} 
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="h-8 text-sm border-orange-300 focus-visible:ring-orange-500"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={() => openMutation.mutate()}
                  disabled={openMutation.isPending}
                >
                  {openMutation.isPending ? "Ouverture..." : "Confirmer l'ouverture"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsOpening(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
              onClick={() => setIsOpening(true)}
            >
              Ouvrir la caisse
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center justify-between text-emerald-700">
          <div className="flex items-center gap-2">
            <Unlock className="h-4 w-4" />
            Caisse Ouverte
          </div>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            EN COURS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-600">Ouvert par :</span>
            <span className="font-medium text-emerald-800">Agent MSI</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-600">Solde initial :</span>
            <span className="font-bold text-emerald-800">{formatFCFA(activeSession.opening_balance)}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200">
            <span className="text-emerald-700 font-bold">Solde Théorique :</span>
            <span className="font-black text-emerald-900">{formatFCFA(activeSession.theoretical_closing_balance)}</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
          >
            Détails des flux
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
