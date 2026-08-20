import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPendingRefunds, 
  registerRefund, 
  cancelSaleWithRefund 
} from "@/lib/sales.functions";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatFCFA } from "@/lib/utils";
import { AlertCircle, CreditCard, History, Printer } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useServerFn } from "@tanstack/react-start";

export default function RefundManagement() {
  const queryClient = useQueryClient();
  const getPendingFn = useServerFn(getPendingRefunds);
  const registerRefundFn = useServerFn(registerRefund);
  
  const { data: pendingRefunds, isLoading } = useQuery({
    queryKey: ["pendingRefunds"],
    queryFn: () => getPendingFn(),
  });

  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("espece");
  const [notes, setNotes] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const refundMutation = useMutation({
    mutationFn: (data: any) => registerRefundFn(data),
    onSuccess: () => {
      toast.success("Remboursement enregistré avec succès");
      queryClient.invalidateQueries({ queryKey: ["pendingRefunds"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const resetForm = () => {
    setSelectedSale(null);
    setRefundAmount("");
    setMethod("espece");
    setNotes("");
  };

  const handleRefundSubmit = () => {
    if (!selectedSale || !refundAmount) return;
    
    refundMutation.mutate({
      saleId: selectedSale.sale_id,
      amount: parseFloat(refundAmount),
      method: method as any,
      notes,
    });
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#D1127B]">Gestion des Remboursements</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                        
                                            
                                            Bonsoir
          </p>





        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dû</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFCFA(pendingRefunds?.reduce((acc: number, curr: any) => acc + (curr.balance_due || 0), 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sur {pendingRefunds?.length || 0} dossiers actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {pendingRefunds && pendingRefunds.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Remboursements en attente</CardTitle>
            <CardDescription>
              Liste des clients dont la vente a été annulée et qui attendent un remboursement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Parcelle</TableHead>
                  <TableHead>Lotissement</TableHead>
                  <TableHead className="text-right">Total à Rembourser</TableHead>
                  <TableHead className="text-right">Déjà Remboursé</TableHead>
                  <TableHead className="text-right">Reste à Payer</TableHead>
                  <TableHead>Statut Parcelle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRefunds.map((item: any) => (
                  <TableRow key={item.sale_id}>
                    <TableCell className="font-medium">{item.client_name}</TableCell>
                    <TableCell>{item.plot_number}</TableCell>
                    <TableCell>{item.lotissement_name}</TableCell>
                    <TableCell className="text-right">{formatFCFA(item.total_to_refund)}</TableCell>
                    <TableCell className="text-right">{formatFCFA(item.total_refunded)}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {formatFCFA(item.balance_due)}
                    </TableCell>
                    <TableCell>
                      {item.current_plot_status === 'Vendu' ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Remise en vente (Vendu)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {item.current_plot_status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isDialogOpen && selectedSale?.sale_id === item.sale_id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) setSelectedSale(item);
                        else resetForm();
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Rembourser
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enregistrer un remboursement</DialogTitle>
                            <DialogDescription>
                              Client: {item.client_name} - Parcelle: {item.plot_number}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="amount" className="text-right">Montant</Label>
                              <Input 
                                id="amount" 
                                type="number" 
                                className="col-span-3" 
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                placeholder={`Max: ${item.balance_due}`}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="method" className="text-right">Méthode</Label>
                              <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Choisir une méthode" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="espece">Espèce</SelectItem>
                                  <SelectItem value="virement">Virement</SelectItem>
                                  <SelectItem value="cheque">Chèque</SelectItem>
                                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="notes" className="text-right">Notes</Label>
                              <Textarea 
                                id="notes" 
                                className="col-span-3" 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                          </div>

                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Attention</AlertTitle>
                            <AlertDescription>
                              Cette opération est irréversible et sera tracée dans le journal financier.
                            </AlertDescription>
                          </Alert>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button 
                              className="bg-[#D1127B] hover:bg-[#b00e68]" 
                              onClick={handleRefundSubmit}
                              disabled={refundMutation.isPending || !refundAmount}
                            >
                              Confirmer le Remboursement
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aucun remboursement en attente</AlertTitle>
          <AlertDescription>
            Tous les clients ont été intégralement remboursés ou aucune vente n'a été annulée récemment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
