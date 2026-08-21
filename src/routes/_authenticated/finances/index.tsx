import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatFCFA } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Wallet, ArrowUpCircle, History, Receipt, CreditCard, LayoutDashboard, ShieldCheck, Undo2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getActiveCashJournal } from '@/lib/finance.functions';
import { ExpenseForm } from '@/components/finance/ExpenseForm';
import RefundManagement from '@/components/finances/RefundManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const FINANCE_TABS = ['overview', 'expenses', 'history', 'refunds'] as const;
type FinanceTab = (typeof FINANCE_TABS)[number];

export const Route = createFileRoute('/_authenticated/finances/')({
  validateSearch: (search: Record<string, unknown>): { tab?: FinanceTab } =>
    FINANCE_TABS.includes(search['tab'] as FinanceTab) ? { tab: search['tab'] as FinanceTab } : {},

  component: FinanceDashboard,
});

function FinanceDashboard() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const getActiveJournalFn = useServerFn(getActiveCashJournal);

  
  const { data: activeJournal } = useQuery({
    queryKey: ['active-cash-journal'],
    queryFn: () => getActiveJournalFn(),
  });

  const { data: userAgency } = useQuery({
    queryKey: ['user-agency'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('agence_id')
        .eq('user_id', user.id)
        .single();
      return data?.agence_id;
    }
  });

  const { data: cashOps, isLoading: isLoadingOps } = useQuery({
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

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, category:expense_categories(name)')
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trésorerie & Caisse</h1>
          <p className="text-muted-foreground italic text-sm">MSI 2.0 — Gestion rigoureuse des flux financiers</p>
        </div>
        <div className="flex gap-2">
          {activeJournal ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-1 h-8">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Caisse Ouverte : {formatFCFA(activeJournal.theoretical_closing_balance)}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-4 py-1 h-8">
              Caisse Fermée
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encaissements Nets</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatFCFA(financialSummary?.total_collected_net || 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold">Flux réels certifiés</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
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
                    op.created_at &&
                    format(new Date(op.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  )
                  .reduce((acc, op) => acc + Number(op.amount || 0), 0) || 0
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold">Total au {format(new Date(), 'dd/MM/yyyy')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#D1127B]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses (Mois)</CardTitle>
            <CreditCard className="h-4 w-4 text-[#D1127B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#D1127B]">
              {formatFCFA(
                expenses
                  ?.filter(ex => 
                    ex.status === 'validé' && 
                    ex.created_at &&
                    new Date(ex.created_at).getMonth() === new Date().getMonth()
                  )
                  .reduce((acc, ex) => acc + Number(ex.amount || 0), 0) || 0
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold">Décaissements validés</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <CreditCard className="h-4 w-4" /> Gestion Dépenses
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> Historique Flux
          </TabsTrigger>
          <TabsTrigger value="refunds" className="gap-2">
            <Undo2 className="h-4 w-4" /> Remboursements
          </TabsTrigger>
        </TabsList>


        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-lg">
                     <Receipt className="h-5 w-5 text-primary" />
                     Journal Récent (Ventes & Dépenses)
                   </CardTitle>
                 </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <Button 
             variant="outline" 
             size="sm" 
             className="w-full gap-2 border-[#D1127B] text-[#D1127B] hover:bg-[#D1127B] hover:text-white"
             asChild
           >
             <a href="/finances/validations">
               <ShieldCheck className="h-4 w-4" /> Validations
             </a>
           </Button>
           <Button variant="outline" size="sm" className="w-full gap-2">
             <History className="h-4 w-4" /> Historique
           </Button>
        </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Détails</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingOps ? (
                          <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow>
                        ) : cashOps?.slice(0, 10).map((op) => (
                          <TableRow key={op.id}>
                            <TableCell className="text-xs">{format(new Date(op.created_at || ""), 'dd/MM HH:mm')}</TableCell>
                            <TableCell>
                              <Badge variant={op.operation_type === 'ENTREE' ? 'outline' : 'destructive'} className="text-[10px]">
                                {op.operation_type === 'ENTREE' ? 'Entrée' : 'Sortie'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-bold">{formatFCFA(op.amount)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">{op.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 </CardContent>
               </Card>
            </div>
            <div className="space-y-6">
              {userAgency && activeJournal && (
                <ExpenseForm agencyId={userAgency} cashJournalId={activeJournal.id} />
              )}
              {!activeJournal && (
                 <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="pt-6">
                      <p className="text-sm text-orange-700 font-bold text-center">
                        ⚠️ Caisse fermée : Ouvrez une session de caisse pour enregistrer des dépenses en espèces.
                      </p>
                    </CardContent>
                 </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle>Registre des Dépenses</CardTitle>
               <Button size="sm" className="bg-[#D1127B] hover:bg-[#b00e68]">Exporter (.xlsx)</Button>
             </CardHeader>
             <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Bénéficiaire</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingExpenses ? (
                      <TableRow><TableCell colSpan={5} className="text-center">Chargement...</TableCell></TableRow>
                    ) : expenses?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Aucune dépense enregistrée.</TableCell></TableRow>
                    ) : expenses?.map((ex) => (
                      <TableRow key={ex.id}>
                        <TableCell className="text-xs">{format(new Date(ex.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-xs font-bold">{(ex.category as any)?.name}</TableCell>
                        <TableCell className="text-xs">{ex.beneficiary}</TableCell>
                        <TableCell className="font-bold text-[#D1127B]">{formatFCFA(ex.amount)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              ex.status === 'validé' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              ex.status === 'rejeté' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }
                          >
                            {ex.status === 'en_attente_validation' ? 'En attente' : ex.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-emerald-50 border-emerald-100">
               <CardContent className="pt-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-emerald-600">Total Entrées</p>
                     <p className="text-2xl font-bold text-emerald-700">
                       {formatFCFA(cashOps?.filter(o => o.operation_type === 'ENTREE').reduce((a, c) => a + Number(c.amount), 0) || 0)}
                     </p>
                   </div>
                   <ArrowUpCircle className="h-8 w-8 text-emerald-200" />
                 </div>
               </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-100">
               <CardContent className="pt-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-red-600">Total Sorties</p>
                     <p className="text-2xl font-bold text-red-700">
                       {formatFCFA(cashOps?.filter(o => o.operation_type === 'SORTIE').reduce((a, c) => a + Number(c.amount), 0) || 0)}
                     </p>
                   </div>
                   <CreditCard className="h-8 w-8 text-red-200" />
                 </div>
               </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Journal Universel des Flux</CardTitle>
              <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                SOLDE NET : {formatFCFA(
                  (cashOps?.filter(o => o.operation_type === 'ENTREE').reduce((a, c) => a + Number(c.amount), 0) || 0) - 
                  (cashOps?.filter(o => o.operation_type === 'SORTIE').reduce((a, c) => a + Number(c.amount), 0) || 0)
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Libellé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashOps?.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell className="text-xs italic">
                        {op.created_at ? format(new Date(op.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={op.operation_type === 'ENTREE' ? 'outline' : 'destructive'}>
                          {op.operation_type === 'ENTREE' ? 'Encaissement' : 'Décaissement'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold font-mono">
                        {formatFCFA(op.amount)}
                      </TableCell>
                      <TableCell className="text-[10px] uppercase font-bold">
                        {op.payment_method}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground italic">
                        {op.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="refunds">
          <RefundManagement />
        </TabsContent>
      </Tabs>
    </div>

  );
}
