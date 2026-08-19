import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createLotissement } from "@/lib/real-estate.functions";
import { getAgences } from "@/lib/settings.functions";
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

const lotissementSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  location: z.string().min(2, "La localisation est requise"),
  agence_id: z.string().uuid("Veuillez sélectionner une agence"),
  plan_communal: z.string().optional(),
  superficie_totale: z.number().min(0).optional(),
});

type LotissementFormValues = z.infer<typeof lotissementSchema>;

interface LotissementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LotissementFormDialog({ open, onOpenChange }: LotissementFormDialogProps) {
  const queryClient = useQueryClient();
  const createLotissementFn = useServerFn(createLotissement);
  const fetchAgences = useServerFn(getAgences);

  const { data: agences } = useQuery({
    queryKey: ["agences"],
    queryFn: () => fetchAgences(),
  });

  const form = useForm<LotissementFormValues>({
    resolver: zodResolver(lotissementSchema),
    defaultValues: {
      name: "",
      location: "",
      agence_id: "",
      plan_communal: "",
      superficie_totale: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: LotissementFormValues) => 
      createLotissementFn({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotissements"] });
      toast.success("Lotissement créé avec succès");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Erreur lors de la création : " + (error as Error).message);
    },
  });

  function onSubmit(values: LotissementFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouveau Lotissement</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du lotissement</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cité Horizon 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localisation / Ville</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Maradi, Quartier..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agence_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agence Responsable</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une agence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agences?.map((agence: any) => (
                        <SelectItem key={agence.id} value={agence.id}>
                          {agence.name} ({agence.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan_communal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence Plan Communal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: PC-2026-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="superficie_totale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Superficie Totale (m²)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
                {mutation.isPending ? "Création..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
