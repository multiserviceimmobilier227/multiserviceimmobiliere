import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { formatFCFA } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Eye,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Calendar,
  Wallet,
  History
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateExpense } from '@/lib/finance.functions';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/finances/validations')({
  component: ExpenseValidations,
});

function ExpenseValidations() {
  const queryClient = useQueryClient();
  const validateFn = useServerFn(validateExpense);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [validationNote, setValidationNote] = useState("");

  const { data: pendingExpenses, isLoading } = useQuery({
    queryKey: ['pending-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *, 
          category:expense_categories(name), 
          agency:agences(nom),
          creator:profiles!expenses_created_by_id_fkey(full_name)
        `)
        .eq('status', 'en_attente_validation')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['expense-audit-logs', selectedExpense?.id],
    enabled: !!selectedExpense?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_finance_corrections')
        .select('*, corrector:profiles!audit_finance_corrections_corrected_by_fkey(full_name)')
        .eq('record_id', selectedExpense.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const validateMutation = useMutation({
    mutationFn: async ({ expenseId, approve }: { expenseId: string; approve: boolean }) => {
      return validateFn({ data: { expenseId, approve, notes: validationNote } });
    },
    onSuccess: (_, variables) => {
      toast.success(variables.approve ? "Dépense validée" : "Dépense rejetée");
      queryClient.invalidateQueries({ queryKey: ['pending-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setSelectedExpense(null);
      setValidationNote("");
    },
    onError: (error: any) => {
      toast.error("Erreur : " + error.message);
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre de Validation</h1>
          <p className="text-muted-foreground italic text-sm">MSI 2.0 — Contrôle PDG des décaissements</p>
        </div>
      </div>

      <Card className="border-t-4 border-t-[#D1127B]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-[#D1127B]" />
            Dépenses en attente de validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Chargement...</TableCell></TableRow>
              ) : pendingExpenses?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">Aucune dépense en attente.</TableCell></TableRow>
              ) : pendingExpenses?.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="text-xs">{format(new Date(ex.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-xs font-medium">{(ex.agency as any)?.nom}</TableCell>
                  <TableCell className="text-xs font-bold">{ex.beneficiary}</TableCell>
                  <TableCell className="font-bold text-[#D1127B]">{formatFCFA(ex.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      {ex.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedExpense(ex)}>
                          Détails & Validation
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Détails de la Dépense</DialogTitle>
                        </DialogHeader>
                        
                        {selectedExpense && (
                          <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Agence:</span> {(selectedExpense.agency as any)?.nom}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Date:</span> {format(new Date(selectedExpense.date), 'PPP', { locale: fr })}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Créé par:</span> {(selectedExpense.creator as any)?.full_name || 'Utilisateur'}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Wallet className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Mode:</span> <Badge>{selectedExpense.payment_method}</Badge>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border">
                                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Description</div>
                                  <div className="text-sm">{selectedExpense.description}</div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-[#D1127B]/5 p-4 rounded-lg border border-[#D1127B]/20 text-center">
                                  <div className="text-xs text-[#D1127B] uppercase font-bold mb-1">Montant Total</div>
                                  <div className="text-3xl font-black text-[#D1127B]">{formatFCFA(selectedExpense.amount)}</div>
                                </div>
                                
                                <div className="border rounded-md p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold flex items-center gap-1">
                                      <FileText className="h-3 w-3" /> JUSTIFICATIF
                                    </span>
                                    {selectedExpense.receipt_url ? (
                                      <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" asChild>
                                        <a href={selectedExpense.receipt_url} target="_blank" rel="noopener noreferrer">Ouvrir</a>
                                      </Button>
                                    ) : (
                                      <span className="text-[10px] text-red-500 italic">Absent</span>
                                    )}
                                  </div>
                                  {selectedExpense.receipt_url ? (
                                    <div className="aspect-video bg-black/5 rounded overflow-hidden flex items-center justify-center">
                                      <img src={selectedExpense.receipt_url} alt="Justificatif" className="max-h-full object-contain" />
                                    </div>
                                  ) : (
                                    <div className="aspect-video bg-slate-50 border-2 border-dashed rounded flex flex-col items-center justify-center text-slate-400">
                                      <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                                      <span className="text-xs">Aucun document joint</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {auditLogs && auditLogs.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs font-bold mb-2 flex items-center gap-1">
                                  <History className="h-3 w-3" /> HISTORIQUE DES CORRECTIONS
                                </div>
                                <div className="text-[11px] border rounded divide-y max-h-32 overflow-y-auto">
                                  {auditLogs.map((log: any) => (
                                    <div key={log.id} className="p-2 bg-amber-50/30">
                                      <div className="flex justify-between text-muted-foreground mb-1">
                                        <span>Par {(log.corrector as any)?.full_name}</span>
                                        <span>{format(new Date(log.created_at), 'dd/MM HH:mm')}</span>
                                      </div>
                                      <div><span className="font-semibold text-amber-700">Raison:</span> {log.reason}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="space-y-2 border-t pt-4">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Commentaire PDG (Optionnel)</label>
                              <Textarea 
                                placeholder="Ajouter un motif pour l'approbation ou le rejet..."
                                value={validationNote}
                                onChange={(e) => setValidationNote(e.target.value)}
                                className="text-sm min-h-[80px]"
                              />
                            </div>
                          </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => validateMutation.mutate({ expenseId: selectedExpense.id, approve: false })}
                            disabled={validateMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Refuser
                          </Button>
                          <Button 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => validateMutation.mutate({ expenseId: selectedExpense.id, approve: true })}
                            disabled={validateMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approuver
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
