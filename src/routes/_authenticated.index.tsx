import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ventes du mois</h3>
          <p className="mt-2 text-2xl font-bold text-primary">0 FCFA</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Encaissements</h3>
          <p className="mt-2 text-2xl font-bold text-primary">0 FCFA</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Parcelles disponibles</h3>
          <p className="mt-2 text-2xl font-bold text-primary">0</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Clients actifs</h3>
          <p className="mt-2 text-2xl font-bold text-primary">0</p>
        </div>
      </div>
      
      <div className="mt-8 rounded-xl border bg-card p-8">
        <h2 className="text-xl font-bold font-sans text-primary">Tableau de Bord MSI 2.0</h2>
        <p className="mt-2 text-muted-foreground font-sans">
          Bienvenue dans votre espace de gestion. La Phase 2 est en cours : les rôles (PDG, Comptable, Informaticien, etc.) et le journal d'audit universel ont été configurés en base de données.
        </p>
      </div>
    </>
  );
}
