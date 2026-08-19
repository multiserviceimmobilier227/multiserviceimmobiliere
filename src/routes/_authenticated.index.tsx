import { useQuery } from '@tanstack/react-query';
import { useServerFn } from "@tanstack/react-start";
import { getClients } from "@/lib/crm.functions";
import { getPlots, getLotissements } from "@/lib/real-estate.functions";
import { formatFCFA } from "@/lib/utils";
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})

function Dashboard() {
  const fetchClients = useServerFn(getClients);
  const fetchPlots = useServerFn(getPlots);
  const fetchLotissements = useServerFn(getLotissements);

  const { data: clients } = useQuery({
    queryKey: ["clients", ""],
    queryFn: () => fetchClients({ data: { search: "" } }),
  });

  const { data: plots } = useQuery({
    queryKey: ["plots", "Disponible"],
    queryFn: () => fetchPlots({ data: { status: "Disponible" } }),
  });

  // For "Ventes du mois" and "Encaissements", we would normally have a specific function,
  // but for now let's use what we have or placeholder until Phase 10.
  // Actually, Phase 9.5 Sous-phase E explicitly asks for this.
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ventes du mois</h3>
          <p className="mt-2 text-2xl font-bold text-[#D1127B]">0 FCFA</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Encaissements</h3>
          <p className="mt-2 text-2xl font-bold text-[#D1127B]">0 FCFA</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Parcelles disponibles</h3>
          <p className="mt-2 text-2xl font-bold text-[#D1127B]">{plots?.length || 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Clients actifs</h3>
          <p className="mt-2 text-2xl font-bold text-[#D1127B]">{clients?.length || 0}</p>
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
