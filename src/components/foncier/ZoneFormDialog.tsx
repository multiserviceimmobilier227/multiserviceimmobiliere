import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createZone } from "@/lib/real-estate.functions";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const zoneSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  lotissement_id: z.string().uuid(),
  description: z.string().optional().nullable(),
});

type ZoneFormValues = z.infer<typeof zoneSchema>;

interface ZoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotissementId: string;
}

export function ZoneFormDialog({ open, onOpenChange, lotissementId }: ZoneFormDialogProps) {
  const queryClient = useQueryClient();
  const createZoneFn = useServerFn(createZone);

  const form = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      lotissement_id: lotissementId,
      description: "",
    },
  });

  // Handle lotissementId change if dialog is reused
  if (form.getValues("lotissement_id") !== lotissementId) {
    form.setValue("lotissement_id", lotissementId);
  }

  const mutation = useMutation({
    mutationFn: (values: ZoneFormValues) => 
      createZoneFn({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotissements"] });
      toast.success("Zone créée avec succès");
      onOpenChange(false);
      form.reset({ name: "", lotissement_id: lotissementId, description: "" });
    },
    onError: (error) => {
      toast.error("Erreur : " + (error as Error).message);
    },
  });

  function onSubmit(values: ZoneFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Zone</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la zone</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Zone A, Extension Sud..." {...field} />
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
                  <FormLabel>Description (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Détails sur la zone..." 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ""}
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
