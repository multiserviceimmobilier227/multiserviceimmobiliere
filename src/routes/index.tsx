import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <AppShell>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Ventes du mois</h3>
          <p className="mt-2 text-2xl font-bold text-primary">0 FCFA</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Encaissements</h3>
          <p className="mt-2 text-2xl font-bold text-primary">0 FCFA</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Parcelles disponibles</h3>
          <p className="mt-2 text-2xl font-bold text-primary">0</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Clients actifs</h3>
          <p className="mt-2 text-2xl font-bold text-primary">0</p>
        </div>
      </div>
      
      <div className="mt-8 rounded-xl border bg-card p-8">
        <h2 className="text-xl font-bold">Bienvenue sur MSI 2.0</h2>
        <p className="mt-2 text-muted-foreground">
          Ceci est la base de votre nouveau système de gestion immobilière. 
          Les fondations sont posées (Phase 1) : identité visuelle MSI, navigation, Lovable Cloud activé et paramètres globaux configurés.
        </p>
      </div>
    </AppShell>
  )
}
