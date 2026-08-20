import { useQuery } from '@tanstack/react-query';
import { useServerFn } from "@tanstack/react-start";
import { getClients } from "@/lib/crm.functions";
import { getPlots, getLotissements } from "@/lib/real-estate.functions";
import { getDashboardStats } from "@/lib/acquisitions.functions";
import { formatFCFA } from "@/lib/utils";
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
  Legend
} from 'recharts';

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})

function Dashboard() {
  const fetchClients = useServerFn(getClients);
  const fetchPlots = useServerFn(getPlots);
  const fetchStats = useServerFn(getDashboardStats);

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

  // Data for the summary chart
  const chartData = [
    { name: 'Potentiel', montant: stats?.totalCAPotential || 0, color: '#D1127B' },
    { name: 'Encaissé', montant: stats?.totalCollected || 0, color: '#10b981' },
    { name: 'Restant', montant: stats?.totalOutstanding || 0, color: '#f59e0b' },
    { name: 'Stock', montant: stats?.inventoryValue || 0, color: '#3b82f6' }
  ];

  return (
    <>
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
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Activités & Stock</h3>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="text-lg font-bold text-[#D1127B]">{clients?.filter(c => c.sales_count > 0).length || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Clients Actifs</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{plots?.length || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Parcelles Libres</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Reste à recouvrer</p>
                <p className="text-sm font-bold text-orange-500">{formatFCFA(stats?.totalOutstanding || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 rounded-xl border bg-card p-8">
        <h2 className="text-xl font-bold font-sans text-[#D1127B]">Tableau de Bord MSI 2.0</h2>
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
          <p className="text-emerald-800 font-medium">
            Statut : Système de confiance financière Phase A-02 Déployé.
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            Intégrité garantie : Les ventes annulées libèrent les parcelles et ajustent le CA en temps réel via triggers SQL sécurisés.
          </p>
        </div>
      </div>
    </>
  );
}
