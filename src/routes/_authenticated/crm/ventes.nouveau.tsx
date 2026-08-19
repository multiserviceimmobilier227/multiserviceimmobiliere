import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/crm/ventes/nouveau')({
  component: NewSalePage,
});

function NewSalePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-sans">Nouvelle Vente</h1>
      <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground font-sans">
        Formulaire de signature de contrat en cours de développement (Phase 9.2).
      </div>
    </div>
  );
}
