import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createPlot, getSites } from "@/lib/real-estate.functions";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const plotSchema = z.object({
  plot_number: z.string().min(1, "Le numéro est requis"),
  ilot_id: z.string().uuid(),
  surface_area: z.number().min(0, "La superficie est requise"),
  base_price: z.number().min(0, "Le prix est requis"),
  site_id: z.string().uuid("Veuillez sélectionner un site"),
  status: z.string().optional(),
});

type PlotFormValues = z.infer<typeof plotSchema>;

interface PlotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ilotId: string;
}

export function PlotFormDialog({ open, onOpenChange, ilotId }: PlotFormDialogProps) {
  const queryClient = useQueryClient();
  const createPlotFn = useServerFn(createPlot);
  const fetchSites = useServerFn(getSites);

  const { data: sites } = useQuery({
    queryKey: ["sites"],
    queryFn: () => fetchSites(),
  });

  const form = useForm<PlotFormValues>({
    resolver: zodResolver(plotSchema),
    defaultValues: {
      plot_number: "",
      ilot_id: ilotId,
      surface_area: 0,
      base_price: 0,
      site_id: "",
      status: "Disponible",
    },
  });

  if (form.getValues("ilot_id") !== ilotId) {
    form.setValue("ilot_id", ilotId);
  }

  const mutation = useMutation({
    mutationFn: (values: PlotFormValues) => 
      createPlotFn({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotissements"] });
      queryClient.invalidateQueries({ queryKey: ["plots"] });
      toast.success("Parcelle créée avec succès");
      onOpenChange(false);
      form.reset({ 
        plot_number: "", 
        ilot_id: ilotId, 
        surface_area: 0, 
        base_price: 0, 
        site_id: form.getValues("site_id"), // Keep site if creating multiple
        status: "Disponible" 
      });
    },
    onError: (error) => {
      toast.error("Erreur : " + (error as Error).message);
    },
  });

  function onSubmit(values: PlotFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Parcelle</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plot_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de parcelle</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: P01, 102..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="site_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site de construction</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sites?.map((site: any) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name} ({site.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="surface_area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Superficie (m²)</FormLabel>
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
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix de base (FCFA)</FormLabel>
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
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#D1127B] hover:bg-[#b00e68]" disabled={mutation.isPending}>
                {mutation.isPending ? "Création..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
