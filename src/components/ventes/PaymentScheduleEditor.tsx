import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addMonths, format } from "date-fns";
import { Trash2, Plus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScheduleItem {
  due_date: string;
  amount_due: number;
  notes?: string;
}

interface PaymentScheduleEditorProps {
  totalAmount: number;
  depositAmount: number;
  initialDuration?: number;
  firstPaymentDate?: string;
  onChange: (schedules: ScheduleItem[]) => void;
}

export function PaymentScheduleEditor({
  totalAmount,
  depositAmount,
  initialDuration = 12,
  firstPaymentDate,
  onChange,
}: PaymentScheduleEditorProps) {
  const remainingAmount = totalAmount - depositAmount;
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isManual, setIsManual] = useState(false);

  // Generate initial schedules when inputs change
  useEffect(() => {
    if (!isManual) {
      const baseDate = firstPaymentDate ? new Date(firstPaymentDate) : new Date();
      const monthlyAmount = Math.round((remainingAmount / initialDuration));
      const newSchedules: ScheduleItem[] = [];
      
      for (let i = 1; i <= initialDuration; i++) {
        newSchedules.push({
          due_date: format(addMonths(baseDate, i), "yyyy-MM-dd"),
          amount_due: monthlyAmount,
        });
      }
      
      // Adjust last installment for rounding
      const sum = newSchedules.reduce((acc, curr) => acc + curr.amount_due, 0);
      if (sum !== remainingAmount && newSchedules.length > 0) {
        const lastIndex = newSchedules.length - 1;
        const lastInstallment = newSchedules[lastIndex];
        if (lastInstallment) {
          lastInstallment.amount_due += (remainingAmount - sum);
        }
      }
      
      setSchedules(newSchedules);
      onChange(newSchedules);
    }
  }, [totalAmount, depositAmount, initialDuration, firstPaymentDate, isManual]);

  const handleAmountChange = (index: number, value: number) => {
    setIsManual(true);
    const newSchedules = [...schedules];
    const schedule = newSchedules[index];
    if (schedule) {
      const oldAmount = schedule.amount_due;
      schedule.amount_due = value;
      
      // MSI 2.0 Phase 10: Logic to recalculate remaining months
      if (index < newSchedules.length - 1) {
        const remainingToDistribute = remainingAmount - newSchedules.slice(0, index + 1).reduce((acc, curr) => acc + curr.amount_due, 0);
        const remainingMonths = newSchedules.length - (index + 1);
        
        if (remainingMonths > 0) {
          const newMonthlyAmount = Math.max(0, Math.round(remainingToDistribute / remainingMonths));
          let distributed = 0;
          
          for (let i = index + 1; i < newSchedules.length; i++) {
            if (i === newSchedules.length - 1) {
              newSchedules[i].amount_due = remainingToDistribute - distributed;
            } else {
              newSchedules[i].amount_due = newMonthlyAmount;
              distributed += newMonthlyAmount;
            }
          }
        }
      }
    }
    setSchedules(newSchedules);
    onChange(newSchedules);
  };

  const handleDateChange = (index: number, value: string) => {
    setIsManual(true);
    const newSchedules = [...schedules];
    const schedule = newSchedules[index];
    if (schedule) {
      schedule.due_date = value;
    }
    setSchedules(newSchedules);
    onChange(newSchedules);
  };

  const addInstallment = () => {
    setIsManual(true);
    const lastSchedule = schedules[schedules.length - 1];
    const lastDate = (schedules.length > 0 && lastSchedule)
      ? new Date(lastSchedule.due_date)
      : (firstPaymentDate ? new Date(firstPaymentDate) : new Date());
    
    const newSchedules = [
      ...schedules,
      {
        due_date: format(addMonths(lastDate, 1), "yyyy-MM-dd"),
        amount_due: 0,
      },
    ];
    setSchedules(newSchedules);
    onChange(newSchedules);
  };

  const removeInstallment = (index: number) => {
    setIsManual(true);
    const newSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(newSchedules);
    onChange(newSchedules);
  };

  const totalScheduled = schedules.reduce((acc, curr) => acc + curr.amount_due, 0);
  const diff = remainingAmount - totalScheduled;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base">Plan de mensualités</Label>
          <p className="text-sm text-muted-foreground">
            Ajustez les montants ou les dates si nécessaire.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">Total à échéancer : {new Intl.NumberFormat('fr-FR').format(remainingAmount)} FCFA</div>
          {diff !== 0 && (
            <Badge variant="destructive" className="mt-1">
              Écart : {new Intl.NumberFormat('fr-FR').format(diff)} FCFA
            </Badge>
          )}
          {diff === 0 && schedules.length > 0 && (
            <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
              Échéancier équilibré
            </Badge>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Date d'échéance</TableHead>
              <TableHead>Montant (FCFA)</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  <Input 
                    type="date" 
                    value={item.due_date} 
                    onChange={(e) => handleDateChange(index, e.target.value)}
                    className="h-8 py-1"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={item.amount_due} 
                    onChange={(e) => handleAmountChange(index, Number(e.target.value))}
                    className="h-8 py-1 font-mono"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeInstallment(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {schedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                  Aucune échéance définie.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="p-2 border-t flex justify-between items-center bg-muted/20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={addInstallment}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Plus className="mr-2 h-4 w-4" /> Ajouter une mensualité
          </Button>
          {!isManual ? (
             <span className="text-[10px] text-muted-foreground flex items-center">
               <Info className="h-3 w-3 mr-1" /> Génération automatique
             </span>
          ) : (
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setIsManual(false)}
              className="text-[10px] h-auto p-0 text-muted-foreground"
            >
              Réinitialiser l'échéancier
            </Button>
          )}
        </div>
      </div>
      
      {diff !== 0 && (
        <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-3">
          <Info className="h-5 w-5 text-orange-600 mt-0.5" />
          <p className="text-xs text-orange-800 leading-relaxed">
            Attention : Le montant total des mensualités ({new Intl.NumberFormat('fr-FR').format(totalScheduled)} FCFA) ne correspond pas au reste à payer ({new Intl.NumberFormat('fr-FR').format(remainingAmount)} FCFA). Veuillez ajuster les montants avant de valider.
          </p>
        </div>
      )}
    </div>
  );
}
