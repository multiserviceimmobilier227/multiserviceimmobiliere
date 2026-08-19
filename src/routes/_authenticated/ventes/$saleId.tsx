import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSaleDetails, validateSale as validateSaleFn } from '@/lib/sales.functions'
import { useServerFn } from '@tanstack/react-start'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { FileText, CheckCircle2, AlertTriangle, Calendar, User, MapPin, Receipt } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/ventes/$saleId')({
  component: SaleDetailsComponent,
})

function SaleDetailsComponent() {
  const { saleId } = useParams({ from: '/_authenticated/ventes/$saleId' })
  const queryClient = useQueryClient()
  
  const getDetails = useServerFn(getSaleDetails)
  const validate = useServerFn(validateSaleFn)

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: () => getDetails({ data: { saleId } })
  })

  const validateMutation = useMutation({
    mutationFn: () => validate({ data: { saleId } }),
    onSuccess: () => {
      toast.success('Vente validée avec succès par le PDG')
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] })
    },
    onError: (error: any) => {
      toast.error(`Erreur de validation : ${error.message}`)
    }
  })

  if (isLoading) return <div className="p-8 text-center">Chargement du dossier de vente...</div>
  if (!sale) return <div className="p-8 text-center">Vente introuvable.</div>

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reservation': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Brouillon / Réservation</Badge>
      case 'en_cours': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Validée / En cours</Badge>
      case 'termine': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terminée</Badge>
      case 'annule': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Annulée</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Vente #{sale.id.slice(0, 8)}</h1>
            {getStatusBadge(sale.status)}
          </div>
          <p className="text-muted-foreground">Créée le {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/ventes/liste">Retour à la liste</Link>
          </Button>
          {sale.status === 'reservation' && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => validateMutation.mutate()}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Valider (PDG)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{sale.client?.first_name} {sale.client?.last_name}</div>
            <p className="text-xs text-muted-foreground mt-1">{sale.client?.phone}</p>
            <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
              <Link to={`/crm/client/${sale.client?.id}`}>Voir profil 360°</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Parcelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">N° {sale.plot?.plot_number}</div>
            <p className="text-xs text-muted-foreground mt-1">{sale.plot?.surface_area} m²</p>
            <Badge className="mt-2" variant="outline">{sale.plot?.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Finances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{new Intl.NumberFormat('fr-FR').format(sale.total_price)} FCFA</div>
            <div className="text-xs text-muted-foreground mt-1">Apport : {new Intl.NumberFormat('fr-FR').format(sale.deposit_amount || 0)} FCFA</div>
            <div className="text-xs font-semibold text-primary mt-1">Solde : {new Intl.NumberFormat('fr-FR').format(sale.balance)} FCFA</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Échéancier de Paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.payment_schedules?.map((item: any, idx: number) => (
                  <TableRow key={item.id}>
                    <TableCell>Mois {idx + 1} ({format(new Date(item.due_date), 'MMM yyyy', { locale: fr })})</TableCell>
                    <TableCell className="font-medium">{new Intl.NumberFormat('fr-FR').format(item.amount_due)} FCFA</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={item.status === 'Payé' ? 'bg-green-100 text-green-800' : ''}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
              <div>
                <p className="font-medium">Contrat de vente</p>
                <p className="text-xs text-muted-foreground">Version PDF générée à la validation</p>
              </div>
              <Button size="sm" variant="outline" disabled={sale.status === 'reservation'}>
                Télécharger
              </Button>
            </div>
            
            {sale.status === 'reservation' && (
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Validation Requise</p>
                  <p className="text-xs text-yellow-700">Cette vente est en attente de validation par le PDG pour devenir officielle.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
