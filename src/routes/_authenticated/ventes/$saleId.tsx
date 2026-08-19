import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSaleDetails, validateSale as validateSaleFn, adjustSalePrice, createMutationRequest, registerPayment } from '@/lib/sales.functions'
import { useServerFn } from '@tanstack/react-start'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { FileText, CheckCircle2, AlertTriangle, Calendar, User, MapPin, Receipt, RefreshCw, DollarSign, History } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/ventes/$saleId')({
  component: SaleDetailsComponent,
})

function SaleDetailsComponent() {
  const { saleId } = useParams({ from: '/_authenticated/ventes/$saleId' })
  const queryClient = useQueryClient()
  
  const getDetails = useServerFn(getSaleDetails)
  const validate = useServerFn(validateSaleFn)
  const adjustPrice = useServerFn(adjustSalePrice)
  const mutateSale = useServerFn(createMutationRequest)

  const [newPrice, setNewPrice] = useState<string>('')
  const [adjustReason, setAdjustReason] = useState('')
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState<'espece' | 'virement' | 'cheque' | 'mobile_money'>('espece')
  const [payRef, setPayRef] = useState('')
  const [payDate, setPayDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  
  const registerPaymentFn = useServerFn(registerPayment)

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

  const adjustPriceMutation = useMutation({
    mutationFn: () => adjustPrice({ 
      data: { 
        saleId, 
        newTotalAmount: parseFloat(newPrice),
        reason: adjustReason
      } 
    }),
    onSuccess: () => {
      toast.success('Prix ajusté avec succès')
      setIsAdjustOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] })
    },
    onError: (error: any) => {
      toast.error(`Erreur : ${error.message}`)
    }
  })
  
  const paymentMutation = useMutation({
    mutationFn: () => registerPaymentFn({
      data: {
        saleId,
        amount: parseFloat(payAmount),
        paymentDate: payDate,
        method: payMethod,
        reference: payRef || null,
      }
    }),
    onSuccess: () => {
      toast.success('Paiement enregistré avec succès')
      setIsPaymentOpen(false)
      setPayAmount('')
      setPayRef('')
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] })
    },
    onError: (error: any) => {
      toast.error(`Erreur : ${error.message}`)
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

  const plotInfo = sale.plot as any;
  const lotissementName = plotInfo?.ilot?.zone?.lotissement?.name || 'N/A';
  const zoneName = plotInfo?.ilot?.zone?.name || 'N/A';

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Vente #{sale.id.slice(0, 8)}</h1>
            {getStatusBadge(sale.status)}
          </div>
          <p className="text-muted-foreground">Créée le {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/ventes/liste">Retour à la liste</Link>
          </Button>
          
          {/* Mutation (Changement de parcelle) */}
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" disabled={sale.status === 'annule'}>
            <RefreshCw className="mr-2 h-4 w-4" /> Mutation
          </Button>

          {/* Ajustement de prix (PDG) */}
          <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" disabled={sale.status === 'annule'}>
                <DollarSign className="mr-2 h-4 w-4" /> Révision Prix
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Révision de Prix PDG</DialogTitle>
                <DialogDescription>
                  Cette action modifie le montant total de la vente et recalcule le solde.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Nouveau Prix Total (FCFA)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder={sale.total_price.toString()} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">Motif de la révision</Label>
                  <Input 
                    id="reason" 
                    value={adjustReason} 
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Ex: Remise commerciale exceptionnelle" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>Annuler</Button>
                <Button onClick={() => adjustPriceMutation.mutate()} disabled={!newPrice || !adjustReason}>Valider la révision</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {sale.status === 'reservation' && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => validateMutation.mutate()}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Valider Contrat (PDG)
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
              <Link to="/crm/client/$clientId" params={{ clientId: sale.client?.id ?? '' }}>Voir profil 360°</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Parcelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">N° {plotInfo?.plot_number}</div>
            <p className="text-xs text-muted-foreground mt-1">{lotissementName} - {zoneName}</p>
            <p className="text-xs text-muted-foreground">{plotInfo?.surface_area} m²</p>
            <Badge className="mt-2" variant="outline">{plotInfo?.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Finances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(sale.total_price ?? 0)} FCFA</div>
            <div className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">Apport : {new Intl.NumberFormat('fr-FR').format(sale.deposit_amount || 0)} FCFA</div>
            <div className="text-xs font-bold text-red-600 mt-1 border-t pt-1">Reste à payer : {new Intl.NumberFormat('fr-FR').format(sale.balance ?? 0)} FCFA</div>
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
                {(!sale.payment_schedules || sale.payment_schedules.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Paiement comptant / Aucun échéancier</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contrat & Historique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
                <div>
                  <p className="font-medium">Contrat MSI 2.0</p>
                  <p className="text-xs text-muted-foreground">
                    {(sale as any).snapshots && (sale as any).snapshots.length > 0 ? `Version figée le ${format(new Date((sale as any).snapshots[0].created_at), 'dd/MM/yyyy')}` : 'Version brouillon'}
                  </p>
                </div>
                <Button size="sm" variant="outline" disabled={sale.status === 'reservation'}>
                  Télécharger PDF
                </Button>
              </div>
              
              {sale.status === 'reservation' ? (
                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Gel Historique en attente</p>
                    <p className="text-xs text-yellow-700">Les données seront figées lors de la validation PDG pour garantir l'intégrité du contrat.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Données Figées</p>
                    <p className="text-xs text-green-700">Contrat scellé. Toute mutation ou remise requiert une validation PDG traçable.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {sale.mutations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <History className="h-4 w-4" />
                  Historique des Mutations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sale.mutations.map((mut: any) => (
                    <div key={mut.id} className="text-xs p-2 border-l-2 border-blue-400 bg-blue-50/30">
                      <p className="font-semibold">Mutation {mut.status}</p>
                      <p className="text-muted-foreground">{mut.reason}</p>
                      <p className="mt-1">Différence : {new Intl.NumberFormat('fr-FR').format(mut.price_difference)} FCFA</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
