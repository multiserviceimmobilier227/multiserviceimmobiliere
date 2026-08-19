import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { addAcquisitionCost } from "@/lib/acquisitions.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const costSchema = z.object({
  category: z.enum(['Prix Achat', 'Frais Acte', 'Géomètre', 'Commission', 'Taxe', 'Autre']),
  amount: z.number().min(0, "Montant requis"),
  date: z.string().min(1, "Date requise"),
  description: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof costSchema>;

export function AcquisitionCostDialog({ 
  open, 
  onOpenChange, 
  acquisitionId 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  acquisitionId: string;
}) {
  const queryClient = useQueryClient();
  const addCost = useServerFn(addAcquisitionCost);

  const form = useForm<FormValues>({
    resolver: zodResolver(costSchema) as any,
    defaultValues: { 
      category: 'Frais Acte',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => addCost({ data: { ...values, acquisition_id: acquisitionId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acquisitions"] });
      toast.success("Frais enregistré");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Erreur : " + error.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Ajouter des Frais Annexes</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField 
              control={form.control} 
              name="category" 
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
                      <SelectItem value="Prix Achat">Prix Achat</SelectItem>
                      <SelectItem value="Frais Acte">Frais Acte</SelectItem>
                      <SelectItem value="Géomètre">Géomètre</SelectItem>
                      <SelectItem value="Commission">Commission</SelectItem>
                      <SelectItem value="Taxe">Taxe</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField 
                control={form.control} 
                name="amount" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (FCFA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="date" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>

            <FormField 
              control={form.control} 
              name="description" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#D1127B] hover:bg-[#b00e68]" disabled={mutation.isPending}>
                {mutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
