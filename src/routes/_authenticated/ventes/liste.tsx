import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Eye } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const Route = createFileRoute('/_authenticated/ventes/liste')({
  component: SalesListComponent,
})

function SalesListComponent() {
  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          client:clients(first_name, last_name),
          plot:plots(plot_number, site_id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reservation': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Réservation</Badge>
      case 'en_cours': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">En cours</Badge>
      case 'termine': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terminée</Badge>
      case 'annule': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Annulée</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Ventes</h1>
        <Button asChild>
          <Link to="/ventes/nouvelle">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Vente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Parcelle</TableHead>
                <TableHead>Montant Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell>
                </TableRow>
              ) : sales?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Aucune vente trouvée.</TableCell>
                </TableRow>
              ) : sales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {format(new Date(sale.sale_date), 'dd MMMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {sale.client?.first_name} {sale.client?.last_name}
                  </TableCell>
                  <TableCell>
                    {sale.plot?.plot_number}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('fr-FR').format(sale.total_price)} FCFA
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(sale.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/ventes/${sale.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
