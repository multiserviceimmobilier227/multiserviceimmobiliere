import { useQuery } from '@tanstack/react-query';
import { useServerFn } from "@tanstack/react-start";
import { getClients } from "@/lib/crm.functions";
import { getPlots } from "@/lib/real-estate.functions";
import { getDashboardStats } from "@/lib/acquisitions.functions";
import { getSaleFinancialLedger } from "@/lib/sales.functions";
import { formatFCFA } from "@/lib/utils";
import { format } from "date-fns";

import { createFileRoute } from '@tanstack/react-router';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { AlertCircle, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';


export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})

function Dashboard() {
  const fetchClients = useServerFn(getClients);
  const fetchPlots = useServerFn(getPlots);
  const fetchStats = useServerFn(getDashboardStats);
  const fetchLedger = useServerFn(getSaleFinancialLedger);


  const { data: clients } = useQuery({
    queryKey: ["clients", ""],
    queryFn: () => fetchClients({ data: { search: "" } }),
  });

  const { data: plots } = useQuery({
    queryKey: ["plots", "Disponible"],
    queryFn: () => fetchPlots({ data: { status: "Disponible" } }),
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchStats(),
  });

  const { data: globalLedger } = useQuery({
    queryKey: ["global-financial-ledger"],
    queryFn: () => fetchLedger({ data: { saleId: undefined as any } }),
  });


  // Data for the summary chart
  const chartData = [
    { name: 'Potentiel', montant: stats?.totalCAPotential || 0, color: '#D1127B' },
    { name: 'Encaissé', montant: stats?.totalCollected || 0, color: '#10b981' },
    { name: 'Restant', montant: stats?.totalOutstanding || 0, color: '#f59e0b' },
    { name: 'Stock', montant: stats?.inventoryValue || 0, color: '#3b82f6' }
  ];

  const isInconsistent = (stats?.activeSalesCount || 0) > (stats?.totalRealPlots || 0);

  return (
    <>
      {isInconsistent && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h4 className="font-bold text-red-800">ALERTE D'INTÉGRITÉ LOGISTIQUE</h4>
            <p className="text-sm text-red-700">
              Le nombre de ventes actives ({stats?.activeSalesCount}) dépasse le nombre total de parcelles dans le système ({stats?.totalRealPlots}). 
              Veuillez auditer l'inventaire immédiatement.
            </p>
          </div>
        </div>
      )}

      {stats && stats.integrityAlerts > 0 && (
        <div className="mb-6 p-4 bg-orange-100 border border-orange-300 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <p className="text-sm text-orange-800 font-medium">
            Attention : {stats.integrityAlerts} alerte(s) d'intégrité détectée(s) ces 7 derniers jours.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ventes Contractées (Mois)</h3>
          <p className="mt-2 text-2xl font-bold text-[#D1127B]">{formatFCFA(stats?.monthlySales || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Nouveaux contrats actifs</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recouvrement Réel (Mois)</h3>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{formatFCFA(stats?.monthlyCollections || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Argent encaissé en banque/caisse</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">CA Potentiel Total</h3>
          <p className="mt-2 text-2xl font-bold text-[#D1127B]">{formatFCFA(stats?.totalCAPotential || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total des ventes actives</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Valeur Stock Invendu</h3>
          <p className="mt-2 text-2xl font-bold text-blue-600">{formatFCFA(stats?.inventoryValue || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Potentiel des parcelles disponibles</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Comparatif Financier (FCFA)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value: number) => [formatFCFA(value), 'Montant']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recouvrement Global</h3>
            <div className="mt-4 flex items-end gap-2">
              <p className="text-3xl font-bold text-emerald-600">{formatFCFA(stats?.totalCollected || 0)}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">sur un potentiel de {formatFCFA(stats?.totalCAPotential || 0)}</p>
            
            <div className="mt-6 h-3 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, ((stats?.totalCollected || 0) / (stats?.totalCAPotential || 1)) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-muted-foreground font-medium">Taux de réalisation</p>
              <p className="text-sm font-bold text-emerald-600">
                {Math.round(((stats?.totalCollected || 0) / (stats?.totalCAPotential || 1)) * 100)}%
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Performance Commerciale</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="text-lg font-bold text-[#D1127B]">{(clients as any[])?.filter((c: any) => c.sales_count > 0).length || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Clients Actifs</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{plots?.length || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Parcelles Libres</p>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2 italic">Tendance Recouvrement (Potentiel vs Réel)</p>
                <div className="h-[100px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.filter(d => ['Potentiel', 'Encaissé'].includes(d.name))}>
                      <Area type="monotone" dataKey="montant" stroke="#D1127B" fill="#fce7f3" />
                      <Tooltip formatter={(value: number) => formatFCFA(value)} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <p className="text-xs text-muted-foreground">Reste à recouvrer</p>
                <p className="text-sm font-bold text-orange-500">{formatFCFA(stats?.totalOutstanding || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-8">
          <h2 className="text-xl font-bold font-sans text-[#D1127B]">État de l'Inventaire</h2>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Total Parcelles Réelles</span>
              <span className="text-lg font-bold">{stats?.totalRealPlots || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Parcelles Vendues/Attribuées</span>
              <span className="text-lg font-bold text-emerald-600">{stats?.activeSalesCount || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Parcelles Disponibles (Stock)</span>
              <span className="text-lg font-bold text-blue-600">{stats?.availablePlotsCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-8">
          <h2 className="text-xl font-bold font-sans text-[#D1127B]">MSI 2.0 Certifié</h2>
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
            <p className="text-emerald-800 font-medium">
              Statut : Excellence Opérationnelle et Financière.
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Intégrité Logicielle : Les parcelles fantômes ont été éliminées. Le système bloque désormais toute vente de parcelle inexistante ou déjà attribuée.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold font-sans text-[#D1127B] flex items-center gap-2 mb-4">
            <History className="h-5 w-5" />
            Flux de Trésorerie Global (Derniers Mouvements)
          </h2>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground uppercase">
                    <th className="text-left pb-2 font-medium">Date</th>
                    <th className="text-left pb-2 font-medium">Opération</th>
                    <th className="text-right pb-2 font-medium">Montant</th>
                    <th className="text-left pb-2 font-medium px-4">Notes / Affectation</th>
                    <th className="text-right pb-2 font-medium">Nouveau Solde</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {globalLedger?.map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM/yy HH:mm')}
                      </td>
                      <td className="py-3">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                          log.operation_type === 'CORRECTION_FINANCIERE' ? 'bg-orange-100 text-orange-700' : 
                          log.operation_type === 'annulation' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {log.operation_type}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold ${log.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatFCFA(log.amount)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground italic">
                        {log.notes}
                      </td>
                      <td className="py-3 text-right font-mono font-medium">
                        {formatFCFA(log.new_balance)}
                      </td>
                    </tr>
                  ))}
                  {(!globalLedger || globalLedger.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground italic">
                        Aucun mouvement financier enregistré dans le grand livre global.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>
      </div>

    </>
  );
}
