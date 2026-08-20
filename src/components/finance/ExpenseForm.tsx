import { useState } from "react";
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
import { CreditCard, Upload } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => getCategoriesFn(),
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

  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) => 
      submitExpenseFn({ 
        data: { 
          ...values, 
          agencyId, 
          cashJournalId,
          amount: parseFloat(values.amount as any)
        } 
      }),
    onSuccess: () => {
      toast.success("Dépense soumise pour validation");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      form.reset();
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
                        {categories.map((cat: any) => (
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
                <Button type="button" variant="outline" className="border-dashed border-2 h-10 gap-2">
                  <Upload className="h-4 w-4" />
                  Scanner / Uploader
                </Button>
                <p className="text-[10px] text-muted-foreground italic">Requis pour validation PDG</p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#D1127B] hover:bg-[#b00e68]" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Traitement..." : "Soumettre pour validation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
