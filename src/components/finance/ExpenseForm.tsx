import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { submitExpense, getExpenseCategories } from "@/lib/finance.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Upload, FileCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const expenseSchema = z.object({
  amount: z.string().transform((v) => parseFloat(v)).refine(v => v > 0, "Le montant doit être positif"),
  categoryId: z.string().uuid("Veuillez choisir une catégorie"),
  description: z.string().min(5, "Description trop courte"),
  beneficiary: z.string().min(2, "Bénéficiaire requis"),
  paymentMethod: z.enum(['espece', 'nita', 'virement', 'cheque', 'mobile_money']),
  projectId: z.string().uuid().optional().nullable(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function ExpenseForm({ agencyId, cashJournalId }: { agencyId: string, cashJournalId?: string }) {
  const queryClient = useQueryClient();
  const submitExpenseFn = useServerFn(submitExpense);
  const getCategoriesFn = useServerFn(getExpenseCategories);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lotissements").select("id, name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => getCategoriesFn(),
  });

  const { data: activeJournal } = useQuery({
    queryKey: ["active-cash-journal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_journals")
        .select("id, status")
        .eq("agency_id", agencyId)
        .eq("status", "ouvert")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<any>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      categoryId: "",
      description: "",
      beneficiary: "",
      paymentMethod: "espece",
      projectId: null,
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `justificatifs/${fileName}`;

      const { data, error } = await supabase.storage
        .from('justificatifs_depenses')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('justificatifs_depenses')
        .getPublicUrl(filePath);

      setReceiptUrl(publicUrl);
      toast.success("Justificatif téléchargé");
    } catch (error: any) {
      toast.error("Erreur upload : " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) => {
      if (values.paymentMethod === 'espece' && !activeJournal) {
        throw new Error("Impossible d'enregistrer une dépense en espèces sans session de caisse ouverte.");
      }
      
      return submitExpenseFn({ 
        data: { 
          ...values, 
          agencyId, 
          cashJournalId: values.paymentMethod === 'espece' ? activeJournal?.id : null,
          amount: parseFloat(values.amount as any),
          receiptUrl: receiptUrl
        } 
      });
    },
    onSuccess: () => {
      toast.success("Dépense soumise pour validation");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["active-cash-journal"] });
      form.reset();
      setReceiptUrl(null);
    },
    onError: (error: any) => {
      toast.error("Erreur : " + error.message);
    },
  });

  function onSubmit(values: any) {
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-[#D1127B]" />
          Nouvelle Dépense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (FCFA)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(categories as any[]).map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="beneficiary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bénéficiaire</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de la personne ou entreprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif / Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Détail de la dépense..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moyen de paiement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="espece">Espèces</SelectItem>
                        <SelectItem value="nita">Nita</SelectItem>
                        <SelectItem value="virement">Virement</SelectItem>
                        <SelectItem value="cheque">Chèque</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <FormLabel>Justificatif (PDF/Image)</FormLabel>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                />
                {!receiptUrl ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-dashed border-2 h-10 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Envoi..." : "Scanner / Uploader"}
                  </Button>
                ) : (
                  <div className="flex items-center justify-between p-2 border rounded bg-emerald-50 text-emerald-700 text-xs">
                    <span className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" /> Justificatif prêt
                    </span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-emerald-700"
                      onClick={() => setReceiptUrl(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground italic">Requis pour validation PDG</p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#D1127B] hover:bg-[#b00e68]" 
              disabled={mutation.isPending || (form.watch('paymentMethod') === 'espece' && !activeJournal)}
            >
              {mutation.isPending ? "Traitement..." : (form.watch('paymentMethod') === 'espece' && !activeJournal) ? "Caisse fermée" : "Soumettre pour validation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
