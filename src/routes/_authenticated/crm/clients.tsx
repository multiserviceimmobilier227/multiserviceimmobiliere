import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/crm/clients')({
  component: ClientsListPage,
});

function ClientsListPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-sans">Gestion des Clients</h1>
      <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground font-sans">
        Liste des clients en cours de développement.
      </div>
    </div>
  );
}
