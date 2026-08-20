import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatFCFA } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Eye,
  AlertCircle
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

  const { data: pendingExpenses, isLoading } = useQuery({
    queryKey: ['pending-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, category:expense_categories(name), agency:agences(nom)')
        .eq('status', 'en_attente_validation')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const validateMutation = useMutation({
    mutationFn: async ({ expenseId, approve }: { expenseId: string; approve: boolean }) => {
      return validateFn({ data: { expenseId, approve } });
    },
    onSuccess: (_, variables) => {
      toast.success(variables.approve ? "Dépense validée" : "Dépense rejetée");
      queryClient.invalidateQueries({ queryKey: ['pending-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['active-cash-journal'] });
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
                <TableHead>Catégorie</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Chargement...</TableCell></TableRow>
              ) : pendingExpenses?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground italic">Aucune dépense en attente.</TableCell></TableRow>
              ) : pendingExpenses?.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="text-xs">{format(new Date(ex.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-xs font-medium">{(ex.agency as any)?.nom}</TableCell>
                  <TableCell className="text-xs">{(ex.category as any)?.name}</TableCell>
                  <TableCell className="text-xs font-bold">{ex.beneficiary}</TableCell>
                  <TableCell className="font-bold text-[#D1127B]">{formatFCFA(ex.amount)}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{ex.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      {ex.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {ex.receipt_url ? (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={ex.receipt_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 text-blue-500" />
                        </a>
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-400 border-slate-200">
                        <AlertCircle className="h-3 w-3 mr-1" /> No Doc
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => validateMutation.mutate({ expenseId: ex.id, approve: true })}
                      disabled={validateMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-red-50 hover:text-red-600"
                      onClick={() => validateMutation.mutate({ expenseId: ex.id, approve: false })}
                      disabled={validateMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
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
