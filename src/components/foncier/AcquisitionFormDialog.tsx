import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createAcquisition } from "@/lib/acquisitions.functions";
import { getLotissements, getPlots } from "@/lib/real-estate.functions";
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

const acquisitionSchema = z.object({
  vendeur: z.string().min(1, "Vendeur requis"),
  date_achat: z.string().min(1, "Date requise"),
  prix_principal: z.number().min(0, "Prix requis"),
  lotissement_id: z.string().uuid().nullable().optional(),
  plot_id: z.string().uuid().nullable().optional(),
});

type FormValues = z.infer<typeof acquisitionSchema>;

export function AcquisitionFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const createAcq = useServerFn(createAcquisition);
  const fetchLotissements = useServerFn(getLotissements);
  const fetchPlots = useServerFn(getPlots);

  const { data: lotissements } = useQuery({
    queryKey: ["lotissements"],
    queryFn: () => fetchLotissements(),
    enabled: open,
  });

  const { data: plots } = useQuery({
    queryKey: ["plots", "Disponible"],
    queryFn: () => fetchPlots({ data: { status: "Disponible" } }),
    enabled: open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(acquisitionSchema),
    defaultValues: { 
      vendeur: "", 
      date_achat: new Date().toISOString().split('T')[0], 
      prix_principal: 0,
      lotissement_id: null,
      plot_id: null,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createAcq({ data: { ...values, status: 'En attente' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acquisitions"] });
      toast.success("Acquisition enregistrée");
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
        <DialogHeader><DialogTitle>Nouvelle Acquisition</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField 
              control={form.control} 
              name="vendeur" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendeur</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField 
                control={form.control} 
                name="date_achat" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'achat</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              <FormField 
                control={form.control} 
                name="prix_principal" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix Principal (FCFA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>

            <FormField 
              control={form.control} 
              name="lotissement_id" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lotissement (Optionnel)</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val === "none" ? null : val)} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un lotissement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Aucun (Achat hors lotissement)</SelectItem>
                      {(lotissements as any)?.map((l: any) => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="plot_id" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelle spécifique (Optionnel)</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val === "none" ? null : val)} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une parcelle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Aucune (Achat global)</SelectItem>
                      {(plots as any)?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>N° {p.plot_number} ({p.ilot?.zone?.lotissement?.name})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#D1127B] hover:bg-[#b00e68]" disabled={mutation.isPending}>
                {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
