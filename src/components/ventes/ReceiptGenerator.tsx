import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Printer, Download, CheckCircle2, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { MsiLogo } from "@/components/ui/msi-logo";
import { emitOfficialDocument } from "@/lib/documents.functions";
import { downloadPdf } from "@/lib/documents/download";

interface ReceiptGeneratorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: any;
  payment: any;
}

export function ReceiptGenerator({
  isOpen,
  onOpenChange,
  sale,
  payment
}: ReceiptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const emitDocument = useServerFn(emitOfficialDocument);

  if (!sale || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOfficialPdf = async () => {
    setIsGenerating(true);
    try {
      const result = await emitDocument({ data: { docType: "recu", entityId: payment.id } });
      downloadPdf(result.pdfBase64, result.fileName);
      toast.success(
        result.duplicate
          ? `Duplicata du reçu ${result.docNumber} téléchargé`
          : `Reçu officiel ${result.docNumber} émis`,
      );
    } catch (error: any) {
      toast.error(error?.message || "Impossible de générer le reçu officiel");
    } finally {
      setIsGenerating(false);
    }
  };


  const totalPaid = (sale.payments || []).reduce((acc: number, p: any) => acc + Number(p.amount), 0) + Number(sale.deposit_amount || 0);
  const remainingBalance = Number(sale.total_price || 0) - totalPaid;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:max-w-[700px] print:p-0 print:max-w-full print:shadow-none print:border-none print:bg-white print:fixed print:inset-0 print:z-[9999]">
        <DialogHeader className="print:hidden">
          <DialogTitle>Reçu Officiel MSI 2.0</DialogTitle>
          <DialogDescription>
            Générez et imprimez le reçu « Mini-Bilan » pour ce versement.
          </DialogDescription>
        </DialogHeader>

        {/* Reçu Design */}
        <div id="receipt-content" className="p-6 border rounded-lg bg-white space-y-6 print:border-none print:p-0 print:w-[148mm] print:mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex items-center gap-3">
              <MsiLogo className="h-12 w-12 text-[#D1127B]" />
              <div>
                <h2 className="text-xl font-black text-[#D1127B]">MULTI SERVICES IMMOBILIERE</h2>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Maradi, Niger • Tél: +227 XX XX XX XX<br />
                  Expertise Foncière & Construction
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-[#D1127B] text-white hover:bg-[#D1127B]/90 mb-1">REÇU DE PAIEMENT</Badge>
              <p className="text-sm font-bold">N° {payment.id?.slice(0, 8).toUpperCase()}</p>
              <p className="text-[10px] text-muted-foreground">{format(new Date(payment.payment_date || new Date()), 'dd MMMM yyyy', { locale: fr })}</p>
            </div>
          </div>

          {/* Client & Plot Info */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Client</p>
              <p className="font-bold text-lg">{sale.client?.first_name} {sale.client?.last_name}</p>
              <p className="text-muted-foreground">{sale.client?.phone}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Désignation</p>
              <p className="font-bold">Parcelle N° {sale.plot?.plot_number}</p>
              <p className="text-muted-foreground">{sale.plot?.ilot?.zone?.lotissement?.name || 'N/A'}</p>
              <p className="text-[10px]">{sale.plot?.surface_area} m²</p>
            </div>
          </div>

          {/* Versement Détails */}
          <div className="bg-muted/30 p-4 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">Montant du versement :</span>
              <span className="text-xl font-black text-[#D1127B]">{new Intl.NumberFormat('fr-FR').format(payment.amount)} FCFA</span>
            </div>
            <div className="flex justify-between text-xs border-t pt-2">
              <span>Mode de paiement : <span className="font-semibold uppercase">{payment.method}</span></span>
              {payment.reference && <span>Référence : <span className="font-semibold">{payment.reference}</span></span>}
            </div>
          </div>

          {/* Mini-Bilan Financier */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b pb-1">Situation Financière (Mini-Bilan)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 border rounded bg-blue-50/30">
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Prix Total</p>
                <p className="text-sm font-bold">{new Intl.NumberFormat('fr-FR').format(sale.total_price)} FCFA</p>
              </div>
              <div className="p-3 border rounded bg-green-50/30">
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Total Encaissé</p>
                <p className="text-sm font-bold text-green-700">{new Intl.NumberFormat('fr-FR').format(totalPaid)} FCFA</p>
              </div>
              <div className="p-3 border rounded bg-red-50/30">
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Reste à Payer</p>
                <p className="text-sm font-bold text-red-700">{new Intl.NumberFormat('fr-FR').format(remainingBalance)} FCFA</p>
              </div>
            </div>
          </div>

          {/* Imputation sur Échéancier */}
          {payment.imputed_data && payment.imputed_data.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Détail de l'imputation</h3>
              <Table className="text-[10px] border">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="h-6">Échéance</TableHead>
                    <TableHead className="h-6 text-right">Montant Affecté</TableHead>
                    <TableHead className="h-6">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payment.imputed_data.map((item: any, idx: number) => (
                    <TableRow key={idx} className="h-6">
                      <TableCell className="py-1">Mois du {format(new Date(item.due_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="py-1 text-right font-bold">{new Intl.NumberFormat('fr-FR').format(item.amount_applied)} FCFA</TableCell>
                      <TableCell className="py-1">
                        {new Date(item.due_date) < new Date() ? 
                          <span className="text-red-600 font-bold">Retard apuré</span> : 
                          <span className="text-green-600">Mensualité</span>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-8">
            <div className="text-center space-y-4">
              <p className="text-xs font-bold underline">Le Caissier / Comptable</p>
              <div className="h-24 border-2 border-dashed border-muted flex items-center justify-center rounded-lg relative overflow-hidden">
                <p className="text-[10px] text-muted-foreground italic z-10">(Signature & Cachet)</p>
                {/* Visual watermark for stamp */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                   <MsiLogo className="h-16 w-16 rotate-12" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <p className="text-xs font-bold underline">Le Client</p>
              <div className="h-24 border-2 border-dashed border-muted flex items-center justify-center rounded-lg">
                <p className="text-[10px] text-muted-foreground italic">(Signature : Lu et Approuvé)</p>
              </div>
            </div>
          </div>


          {/* Footer Footer */}
          <div className="text-center border-t pt-2 mt-4">
            <p className="text-[8px] text-muted-foreground italic">
              Ce document est une pièce comptable officielle générée par MSI 2.0. Toute modification manuelle l'invalide.
            </p>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
          <Button
            className="bg-[#D1127B] text-white hover:bg-[#D1127B]/90"
            onClick={handleOfficialPdf}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Reçu officiel PDF
          </Button>
        </DialogFooter>

        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-content, #receipt-content * {
              visibility: visible;
            }
            #receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              padding: 0 !important;
            }
            @page {
              size: auto;
              margin: 0mm;
            }
          }
        `}} />

      </DialogContent>
    </Dialog>
  );
}
