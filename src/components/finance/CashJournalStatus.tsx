import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getActiveCashJournal, openCashSession, closeCashSession, getMyAgency } from "@/lib/finance.functions";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatFCFA } from "@/lib/utils";

export function CashJournalStatus() {
  const queryClient = useQueryClient();
  const getActiveSession = useServerFn(getActiveCashJournal);
  const openSessionFn = useServerFn(openCashSession);
  const closeSessionFn = useServerFn(closeCashSession);
  const fetchMyAgency = useServerFn(getMyAgency);
  const [openingBalance, setOpeningBalance] = useState<string>("0");
  const [closingBalance, setClosingBalance] = useState<string>("0");
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const { data: activeSession, isLoading } = useQuery({
    queryKey: ["active-cash-journal"],
    queryFn: () => getActiveSession(),
    refetchInterval: 60000,
  });

  const { data: agency } = useQuery({
    queryKey: ["my-agency"],
    queryFn: () => fetchMyAgency(),
    staleTime: 5 * 60 * 1000,
  });
  const userAgency = (agency as any)?.id as string | undefined;
  const agencyName = (agency as any)?.name as string | undefined;

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

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession) throw new Error("Aucune session active.");
      return closeSessionFn({ 
        data: { 
          journalId: (activeSession as any).id,
          closingBalance: parseFloat(closingBalance),
          adjustmentReason: adjustmentReason
        } 
      });
    },
    onSuccess: () => {
      toast.success("Caisse clôturée avec succès");
      queryClient.invalidateQueries({ queryKey: ["active-cash-journal"] });
      setIsClosing(false);
      setAdjustmentReason("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la clôture");
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
            Aucune session de caisse n'est ouverte aujourd'hui pour {agencyName ?? "votre agence"}.
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
            <span className="font-bold text-emerald-800">{formatFCFA((activeSession as any).opening_balance)}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200">
            <span className="text-emerald-700 font-bold">Solde Théorique :</span>
            <span className="font-black text-emerald-900">{formatFCFA((activeSession as any).theoretical_closing_balance)}</span>
          </div>
          {isClosing ? (
            <div className="space-y-3 mt-2 pt-2 border-t border-emerald-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-emerald-700">Solde Physique (Réel)</label>
                <Input 
                  type="number" 
                  value={closingBalance} 
                  onChange={(e) => setClosingBalance(e.target.value)}
                  className="h-8 text-sm border-emerald-300 focus-visible:ring-emerald-500"
                />
              </div>
              
              {Math.abs(parseFloat(closingBalance) - (activeSession as any).theoretical_closing_balance) > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-red-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Justification de l'écart
                  </label>
                  <Textarea 
                    placeholder="Pourquoi y a-t-il un écart ?"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="text-xs h-16 border-red-200 bg-red-50 focus-visible:ring-red-500"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => closeMutation.mutate()}
                  disabled={closeMutation.isPending}
                >
                  {closeMutation.isPending ? "Clôture..." : "Confirmer"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsClosing(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                size="sm" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setClosingBalance((activeSession as any).theoretical_closing_balance.toString());
                  setIsClosing(true);
                }}
              >
                Clôturer la journée
              </Button>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
