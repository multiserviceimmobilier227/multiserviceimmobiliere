import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSaleDetails, validateSale as validateSaleFn, adjustSalePrice, createMutationRequest, registerPayment, cancelSale as cancelSaleOrigin, confirmPayment as confirmPayFn, correctPayment as correctPayFn, getImputationPreview, getSaleFinancialLedger } from '@/lib/sales.functions'
import { useServerFn } from '@tanstack/react-start'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { FileText, CheckCircle2, AlertTriangle, Calendar, User, MapPin, Receipt, RefreshCw, DollarSign, History, Ban, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { ReceiptGenerator } from '@/components/ventes/ReceiptGenerator'

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
  const confirmPay = useServerFn(confirmPayFn)
  const correctPay = useServerFn(correctPayFn)

  const getPreview = useServerFn(getImputationPreview)
  const getLedger = useServerFn(getSaleFinancialLedger)


  const [newPrice, setNewPrice] = useState<string>('')
  const [adjustReason, setAdjustReason] = useState('')
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState<'espece' | 'virement' | 'cheque' | 'mobile_money'>('espece')
  const [payRef, setPayRef] = useState('')
  const [payDate, setPayDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  
  const registerPaymentFn = useServerFn(registerPayment)
  const cancelSaleFn = useServerFn(cancelSaleOrigin)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [isCorrectOpen, setIsCorrectOpen] = useState(false)
  const [correctAmount, setCorrectAmount] = useState('')
  const [correctReason, setCorrectReason] = useState('')


  const { data: userRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      return data?.map((r: any) => r.role) || [];
    }
  });

  const isPdgOrAdmin = userRoles?.some((r: any) => ['pdg', 'admin', 'super_admin'].includes(r as string));

  const { data: imputationPreview } = useQuery({
    queryKey: ['imputation-preview', saleId, payAmount],
    queryFn: () => getPreview({ data: { saleId, amount: parseFloat(payAmount) } }),
    enabled: !!payAmount && parseFloat(payAmount) > 0 && isPaymentOpen,
    staleTime: 1000
  });

  const { data: financialLedger } = useQuery({
    queryKey: ['financial-ledger', saleId],
    queryFn: () => getLedger({ data: { saleId } })
  });



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
    onSuccess: (data) => {
      toast.success('Paiement enregistré avec succès')
      setIsPaymentOpen(false)
      setPayAmount('')
      setPayRef('')
      setSelectedPayment(data)
      setIsReceiptOpen(true)
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] })
    },
    onError: (error: any) => {
      toast.error(`Erreur : ${error.message}`)
    }
  })

  const confirmPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => confirmPay({ data: { paymentId } }),
    onSuccess: () => {
      toast.success('Paiement confirmé par le PDG');
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
    },
    onError: (error: any) => toast.error(error.message)
  });

  const correctPaymentMutation = useMutation({
    mutationFn: () => correctPay({
      data: {
        paymentId: selectedPayment?.id,
        newAmount: parseFloat(correctAmount),
        reason: correctReason
      }
    }),
    onSuccess: () => {
      toast.success('Montant corrigé et journalisé');
      setIsCorrectOpen(false);
      setCorrectAmount('');
      setCorrectReason('');
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
    },
    onError: (error: any) => toast.error(error.message)
  });


  const cancelMutation = useMutation({
    mutationFn: () => cancelSaleFn({
      data: {
        saleId,
        reason: cancelReason,
        refundAmount: refundAmount ? parseFloat(refundAmount) : 0,
      }
    }),
    onSuccess: (res: any) => {
      toast.success(
        res?.refunded > 0
          ? `Vente annulée. Remboursement de ${Number(res.refunded).toLocaleString('fr-FR')} FCFA enregistré.`
          : 'Vente annulée. Parcelle libérée et CA ajusté.'
      )
      setIsCancelOpen(false)
      setCancelReason('')
      setRefundAmount('')
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: (error: any) => {
      toast.error(`Erreur : ${error.message}`)
    }
  });

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

  const collectedAmount =
    Number(sale.deposit_amount || 0) +
    ((sale as any).payments || []).reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0)
  const refundedAmount = ((sale as any).refunds || []).reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0)
  const refundableAmount = Math.max(0, collectedAmount - refundedAmount)

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

          {/* Enregistrement de Paiement */}
          <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-primary/90" disabled={sale.status === 'annule' || (sale.balance || 0) <= 0}>
                <DollarSign className="mr-2 h-4 w-4" /> Encaisser Paiement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Encaisser un Paiement</DialogTitle>
                <DialogDescription>
                  Enregistrez un nouveau versement pour cette vente. Le solde sera mis à jour automatiquement.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="payAmount">Montant à encaisser (FCFA)</Label>
                  <Input 
                    id="payAmount" 
                    type="number" 
                    value={payAmount} 
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Montant du versement" 
                  />
                  <p className="text-xs text-muted-foreground">Solde restant : {new Intl.NumberFormat('fr-FR').format(sale.balance ?? 0)} FCFA</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payDate">Date du paiement</Label>
                  <Input 
                    id="payDate" 
                    type="date" 
                    value={payDate} 
                    onChange={(e) => setPayDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payMethod">Mode de paiement</Label>
                  <Select value={payMethod} onValueChange={(val: any) => setPayMethod(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="espece">Espèces</SelectItem>
                      <SelectItem value="virement">Virement Bancaire</SelectItem>
                      <SelectItem value="cheque">Chèque</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payRef">Référence (N° Chèque/Transaction)</Label>
                  <Input 
                    id="payRef" 
                    value={payRef} 
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="Ex: CHQ-123456 ou Transaction ID" 
                  />
                </div>

                {imputationPreview && (
                  <div className="mt-2 space-y-2 border rounded-md p-3 bg-muted/20">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Prévisualisation de l'imputation</p>
                    <div className="space-y-1">
                      {(imputationPreview as any[]).map((item: any, idx: number) => (

                        <div key={idx} className="flex justify-between text-[11px]">
                          <span>
                            {item.due_date ? `Mois du ${format(new Date(item.due_date), 'dd/MM/yy')}` : item.type}
                          </span>
                          <span className="font-mono font-bold">
                            {new Intl.NumberFormat('fr-FR').format(item.amount_applied)} FCFA
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Annuler</Button>
                <Button onClick={() => paymentMutation.mutate()} disabled={!payAmount || parseFloat(payAmount) <= 0}>Confirmer l'encaissement</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {sale.status === 'reservation' && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> {validateMutation.isPending ? 'Validation...' : 'Valider Contrat (PDG)'}
            </Button>
          )}

          {/* Annulation & remboursement (Phase A-02) */}
          <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={sale.status === 'annule'}>
                <Ban className="mr-2 h-4 w-4" /> Annuler la vente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Annulation du contrat</DialogTitle>
                <DialogDescription>
                  La parcelle sera libérée, les échéances non payées annulées et le chiffre d'affaires contracté ajusté. Seules les sommes réellement encaissées peuvent être remboursées.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="rounded-md border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Encaissé (acompte + versements)</span>
                    <span className="font-semibold">{Number(collectedAmount).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Déjà remboursé</span>
                    <span className="font-semibold">{Number(refundedAmount).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Remboursable au maximum</span>
                    <span className="font-semibold">{Number(refundableAmount).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">Motif de l'annulation</Label>
                  <Input id="cancel-reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Désistement du client, litige..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refund-amount">Montant à rembourser (FCFA)</Label>
                  <Input id="refund-amount" type="number" min={0} max={refundableAmount} value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="0" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Fermer</Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelReason.trim().length < 3 || cancelMutation.isPending || parseFloat(refundAmount || '0') > refundableAmount}
                >
                  {cancelMutation.isPending ? 'Annulation...' : "Confirmer l'annulation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <TableHead>Mois</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Dû (FCFA)</TableHead>
                  <TableHead>Payé</TableHead>
                  <TableHead>Reste</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.payment_schedules?.map((item: any, idx: number) => {
                  const paid = item.amount_paid || 0;
                  const balance = item.amount_due - paid;
                  const isOverdue = new Date(item.due_date) < new Date() && item.status !== 'Payé';
                  
                  return (
                    <TableRow key={item.id} className={isOverdue ? "bg-red-50/50" : ""}>
                      <TableCell className="font-bold">M{idx + 1}</TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(item.due_date), 'dd/MM/yyyy', { locale: fr })}
                        {item.schedule_type === 'manuel' && <Badge variant="outline" className="ml-2 text-[8px] h-3 px-1 border-blue-200 text-blue-600">Manuel</Badge>}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{new Intl.NumberFormat('fr-FR').format(item.amount_due)}</TableCell>
                      <TableCell className="font-mono text-xs text-green-600">{new Intl.NumberFormat('fr-FR').format(paid)}</TableCell>
                      <TableCell className="font-mono text-xs text-red-600 font-bold">{new Intl.NumberFormat('fr-FR').format(balance)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === 'Payé' ? 'outline' : 'secondary'} 
                          className={
                            item.status === 'Payé' ? 'bg-green-50 text-green-700 border-green-200 text-[10px]' : 
                            isOverdue ? 'bg-red-50 text-red-700 border-red-200 text-[10px]' :
                            'text-[10px]'
                          }
                        >
                          {isOverdue && item.status !== 'Payé' ? 'En retard' : item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="h-4 w-4" />
                Journal d'Audit Financier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {financialLedger?.map((log: any) => (
                    <div key={log.id} className="text-xs border-b pb-2">
                      <div className="flex justify-between items-start">
                        <span className={`font-bold uppercase ${
                          log.operation_type === 'CORRECTION_FINANCIERE' ? 'text-orange-600' : 
                          log.operation_type === 'annulation' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {log.operation_type}
                        </span>
                        <span className="text-muted-foreground">{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <span>Montant : <strong>{new Intl.NumberFormat('fr-FR').format(log.amount)} FCFA</strong></span>
                        <span className="text-[10px] italic">{log.notes}</span>
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        Solde : {new Intl.NumberFormat('fr-FR').format(log.previous_balance)} → {new Intl.NumberFormat('fr-FR').format(log.new_balance)}
                      </div>
                    </div>
                  ))}
                  {(!financialLedger || financialLedger.length === 0) && (
                    <p className="text-center text-muted-foreground text-xs py-8">Aucun mouvement journalisé.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

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
                    {(sale as any).snapshots && (sale as any).snapshots.length > 0 && (sale as any).snapshots[0].created_at ? `Version figée le ${format(new Date((sale as any).snapshots[0].created_at), 'dd/MM/yyyy')}` : 'Version brouillon'}
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

          {(sale as any).payments && (sale as any).payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <History className="h-4 w-4" />
                  Historique des Paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(sale as any).payments.map((p: any) => (
                    <div key={p.id} className={`text-xs p-2 border-l-2 ${p.confirmed_at ? 'border-green-400 bg-green-50/30' : 'border-orange-400 bg-orange-50/30'} flex justify-between items-center`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{new Intl.NumberFormat('fr-FR').format(p.amount)} FCFA</p>
                          {!p.confirmed_at && <Badge variant="outline" className="text-[8px] h-3 px-1 border-orange-200 text-orange-600 bg-white">En attente PDG</Badge>}
                        </div>
                        <p className="text-muted-foreground">{format(new Date(p.payment_date), 'dd/MM/yyyy')} - {p.method}</p>
                        {p.reference && <p className="text-[10px] text-muted-foreground">Réf: {p.reference}</p>}
                      </div>
                      <div className="flex gap-1">
                        {isPdgOrAdmin && !p.confirmed_at && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            onClick={() => confirmPaymentMutation.mutate(p.id)}
                            disabled={confirmPaymentMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {isPdgOrAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                            onClick={() => {
                              setSelectedPayment(p);
                              setCorrectAmount(p.amount.toString());
                              setIsCorrectOpen(true);
                            }}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => {
                            setSelectedPayment(p);
                            setIsReceiptOpen(true);
                          }}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Correction de Paiement (PDG) */}
      <Dialog open={isCorrectOpen} onOpenChange={setIsCorrectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Correction de Versement (Audit)</DialogTitle>
            <DialogDescription>
              Toute modification du montant est historisée. Le solde et l'échéancier seront recalculés.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="correctAmount">Nouveau Montant (FCFA)</Label>
              <Input 
                id="correctAmount" 
                type="number" 
                value={correctAmount} 
                onChange={(e) => setCorrectAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="correctReason">Motif de la correction</Label>
              <Input 
                id="correctReason" 
                value={correctReason} 
                onChange={(e) => setCorrectReason(e.target.value)}
                placeholder="Ex: Erreur de saisie comptable" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCorrectOpen(false)}>Annuler</Button>
            <Button 
              onClick={() => correctPaymentMutation.mutate()} 
              disabled={!correctAmount || !correctReason || correctPaymentMutation.isPending}
            >
              {correctPaymentMutation.isPending ? 'Correction...' : 'Valider la Correction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReceiptGenerator 
        isOpen={isReceiptOpen} 
        onOpenChange={setIsReceiptOpen} 
        sale={sale} 
        payment={selectedPayment} 
      />
    </div>
  )
}
