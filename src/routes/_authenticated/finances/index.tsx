import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated/finances/')({
  component: CashManagement,
});

function CashManagement() {
  const { data: cashOps, isLoading } = useQuery({
    queryKey: ['cash-operations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_cash_operations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: financialSummary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_financial_summary')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion de Caisse MSI 2.0</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Encaissé Net</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatFCFA(financialSummary?.total_collected_net || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Flux réels certifiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées du Jour</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatFCFA(
                cashOps
                  ?.filter(op => 
                    op.operation_type === 'ENTREE' && 
                    format(new Date(op.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  )
                  .reduce((acc, op) => acc + Number(op.amount), 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aujourd'hui, {format(new Date(), 'dd MMMM', { locale: fr })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restes à Recouvrer</CardTitle>
            <History className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatFCFA(financialSummary?.total_outstanding || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Potentiel contracté restant</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Journal des Opérations de Caisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Chargement du journal...</TableCell>
                </TableRow>
              ) : cashOps?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 italic text-muted-foreground">Aucune opération enregistrée.</TableCell>
                </TableRow>
              ) : (
                cashOps?.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="text-xs">
                      {format(new Date(op.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={op.operation_type === 'ENTREE' ? 'outline' : 'destructive'} className={op.operation_type === 'ENTREE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
                        {op.operation_type === 'ENTREE' ? 'Encaissement' : 'Décaissement'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold font-mono">
                      {formatFCFA(op.amount)}
                    </TableCell>
                    <TableCell className="text-xs uppercase">
                      {op.payment_method}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {op.description}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
