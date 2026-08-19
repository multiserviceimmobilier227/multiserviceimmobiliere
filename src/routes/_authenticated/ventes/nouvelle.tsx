import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createSaleDraft } from '@/lib/sales.functions'
import { useServerFn } from '@tanstack/react-start'
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, UserPlus, Calendar } from 'lucide-react'
import { PaymentScheduleEditor } from '@/components/ventes/PaymentScheduleEditor'
import { ClientFormDialog } from '@/components/crm/ClientFormDialog'
import { z } from 'zod'

const searchSchema = z.object({
  clientId: z.string().uuid().optional(),
})

export const Route = createFileRoute('/_authenticated/ventes/nouvelle')({
  validateSearch: searchSchema,
  component: NewSaleComponent,
})

function NewSaleComponent() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/ventes/nouvelle' })
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [formData, setFormData] = useState({
    clientId: search.clientId || '',
    plotId: '',
    totalAmount: 0,
    depositAmount: 0,
    paymentPlanType: 'Échéancier' as 'Comptant' | 'Échéancier',
    durationMonths: 15, // Default for MSI 2.0 Phase 10
    firstPaymentDate: format(new Date(), 'yyyy-MM-dd'),
    customSchedules: [] as any[],
    justification: '',
  })

  useEffect(() => {
    if (search.clientId) {
      setFormData(prev => ({ ...prev, clientId: search.clientId! }))
    }
  }, [search.clientId])

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('id, first_name, last_name').order('last_name')
      if (error) throw error
      return data
    }
  })

  const { data: plots } = useQuery({
    queryKey: ['available-plots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plots')
        .select('id, plot_number, base_price, surface_area')
        .eq('status', 'Disponible')
      if (error) throw error
      return data
    }
  })

  const createSaleFn = useServerFn(createSaleDraft)
  const mutation = useMutation({
    mutationFn: createSaleFn,
    onSuccess: (sale) => {
      toast.success('Vente créée avec succès en tant que brouillon')
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      navigate({ to: '/ventes/liste' })
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la création : ${error.message}`)
    }
  })

  const handlePlotSelect = (plotId: string) => {
    const plot = plots?.find(p => p.id === plotId)
    if (plot) {
      setFormData(prev => ({
        ...prev,
        plotId,
        totalAmount: plot.base_price,
        depositAmount: Math.round(plot.base_price * 0.3) // 30% default
      }))
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle Vente</h1>
          <p className="text-muted-foreground">Suivez les étapes pour préparer un contrat de vente.</p>
        </div>
        <div className="flex gap-2 text-sm font-medium">
          <span className={step === 1 ? "text-primary" : "text-muted-foreground"}>1. Client</span>
          <span className="text-muted-foreground">/</span>
          <span className={step === 2 ? "text-primary" : "text-muted-foreground"}>2. Parcelle</span>
          <span className="text-muted-foreground">/</span>
          <span className={step === 3 ? "text-primary" : "text-muted-foreground"}>3. Financement</span>
        </div>
      </div>

      <div className="grid gap-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner le Client</CardTitle>
              <CardDescription>Choisissez le client acquéreur dans la liste MSI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="space-y-2 flex-1">
                  <Label>Sélectionner le Client</Label>
                  <Select onValueChange={(val) => setFormData(prev => ({ ...prev, clientId: val }))} value={formData.clientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.last_name} {c.first_name}</SelectItem>
                      ))}
                      {clients?.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">Aucun client trouvé</div>}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewClientOpen(true)}
                  title="Créer un nouveau client"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              
              <ClientFormDialog 
                open={isNewClientOpen} 
                onOpenChange={setIsNewClientOpen}
                onSuccess={(client) => {
                  setFormData(prev => ({ ...prev, clientId: client.id }));
                  queryClient.invalidateQueries({ queryKey: ['clients'] });
                }}
              />
              <Button 
                className="w-full" 
                disabled={!formData.clientId} 
                onClick={() => setStep(2)}
              >
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner la Parcelle</CardTitle>
              <CardDescription>Seules les parcelles avec le statut 'Disponible' sont affichées.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Parcelle</Label>
                <Select onValueChange={handlePlotSelect} value={formData.plotId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une parcelle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plots?.map(p => (
                      <SelectItem key={p.id} value={p.id}>N° {p.plot_number} - {p.surface_area}m² ({new Intl.NumberFormat('fr-FR').format(p.base_price)} FCFA)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={!formData.plotId} 
                  onClick={() => setStep(3)}
                >
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Configuration Financière</CardTitle>
              <CardDescription>Définissez les modalités de paiement pour cette acquisition.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix de Vente (FCFA)</Label>
                  <Input 
                    type="number" 
                    value={formData.totalAmount} 
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apport Initial / Dépôt (FCFA)</Label>
                  <Input 
                    type="number" 
                    value={formData.depositAmount} 
                    onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: Number(e.target.value) }))}
                  />
                  <p className="text-[10px] text-muted-foreground">Minimum recommandé: 30% ({new Intl.NumberFormat('fr-FR').format(formData.totalAmount * 0.3)} FCFA)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mode de Paiement</Label>
                <Select 
                  value={formData.paymentPlanType} 
                  onValueChange={(val: any) => setFormData(prev => ({ ...prev, paymentPlanType: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comptant">Comptant (Paiement intégral)</SelectItem>
                    <SelectItem value="Échéancier">Échéancier (Plusieurs mensualités)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.paymentPlanType === 'Échéancier' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <Label>Date du 1er versement / Ancrage</Label>
                      <div className="relative">
                        <Input 
                          type="date" 
                          value={formData.firstPaymentDate} 
                          onChange={(e) => setFormData(prev => ({ ...prev, firstPaymentDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Durée de l'échéancier (mois)</Label>
                      <Select 
                        value={formData.durationMonths.toString()} 
                        onValueChange={(val) => setFormData(prev => ({ ...prev, durationMonths: Number(val) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">Standard (15 mois)</SelectItem>
                          <SelectItem value="20">Étendu (20 mois)</SelectItem>
                          <SelectItem value="12">Court (12 mois)</SelectItem>
                          <SelectItem value="24">Long (24 mois)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <PaymentScheduleEditor 
                    totalAmount={formData.totalAmount}
                    depositAmount={formData.depositAmount}
                    initialDuration={formData.durationMonths}
                    firstPaymentDate={formData.firstPaymentDate}
                    onChange={(schedules) => setFormData(prev => ({ ...prev, customSchedules: schedules }))}
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  disabled={mutation.isPending || (formData.paymentPlanType === 'Échéancier' && formData.customSchedules.reduce((acc, curr) => acc + curr.amount_due, 0) !== (formData.totalAmount - formData.depositAmount))} 
                  onClick={() => mutation.mutate({ data: formData })}
                >

                  {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Valider le brouillon
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
