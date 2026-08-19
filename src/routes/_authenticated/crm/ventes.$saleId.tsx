import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/crm/ventes/$saleId')({
  component: SaleDetailsPage,
});

function SaleDetailsPage() {
  const { saleId } = Route.useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-sans">Détails de la Vente</h1>
      <p className="text-muted-foreground font-sans">ID de la vente : {saleId}</p>
      <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground font-sans">
        Interface de gestion détaillée du contrat en cours de développement (Phase 9.5).
      </div>
    </div>
  );
}
