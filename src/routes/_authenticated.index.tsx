import { useQuery } from '@tanstack/react-query';
import { useServerFn } from "@tanstack/react-start";
import { getClients } from "@/lib/crm.functions";
import { getPlots, getLotissements } from "@/lib/real-estate.functions";
import { getDashboardStats } from "@/lib/acquisitions.functions";
import { formatFCFA } from "@/lib/utils";
import { createFileRoute } from '@tanstack/react-router';

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recouvrement Global</h3>
          <div className="mt-4 flex items-end gap-2">
            <p className="text-3xl font-bold text-emerald-600">{formatFCFA(stats?.totalCollected || 0)}</p>
            <p className="text-sm text-muted-foreground pb-1">encaissé sur {formatFCFA(stats?.totalCAPotential || 0)}</p>
          </div>
          <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${Math.min(100, ((stats?.totalCollected || 0) / (stats?.totalCAPotential || 1)) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-right text-muted-foreground">
            Taux de recouvrement : {Math.round(((stats?.totalCollected || 0) / (stats?.totalCAPotential || 1)) * 100)}%
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Clients & Parcelles</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-[#D1127B]">{clients?.filter(c => c.sales_count > 0).length || 0}</p>
              <p className="text-xs text-muted-foreground uppercase">Clients Actifs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{plots?.length || 0}</p>
              <p className="text-xs text-muted-foreground uppercase">Parcelles Libres</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 rounded-xl border bg-card p-8">
        <h2 className="text-xl font-bold font-sans text-[#D1127B]">Tableau de Bord MSI 2.0</h2>
        <p className="mt-2 text-muted-foreground font-sans">
          Bienvenue Souleymane. Le système est désormais opérationnel pour la gestion foncière et le CRM. 
          Vous pouvez créer des lotissements, gérer vos clients et suivre vos parcelles en temps réel.
        </p>
      </div>
    </>
  );
}
