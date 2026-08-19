import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createIlot } from "@/lib/real-estate.functions";
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
import { toast } from "sonner";

const ilotSchema = z.object({
  numero: z.string().min(1, "Le numéro est requis"),
  zone_id: z.string().uuid(),
});

type IlotFormValues = z.infer<typeof ilotSchema>;

interface IlotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zoneId: string;
}

export function IlotFormDialog({ open, onOpenChange, zoneId }: IlotFormDialogProps) {
  const queryClient = useQueryClient();
  const createIlotFn = useServerFn(createIlot);

  const form = useForm<IlotFormValues>({
    resolver: zodResolver(ilotSchema),
    defaultValues: {
      numero: "",
      zone_id: zoneId,
    },
  });

  if (form.getValues("zone_id") !== zoneId) {
    form.setValue("zone_id", zoneId);
  }

  const mutation = useMutation({
    mutationFn: (values: IlotFormValues) => 
      createIlotFn({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotissements"] });
      toast.success("Îlot créé avec succès");
      onOpenChange(false);
      form.reset({ numero: "", zone_id: zoneId });
    },
    onError: (error) => {
      toast.error("Erreur : " + (error as Error).message);
    },
  });

  function onSubmit(values: IlotFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvel Îlot</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de l'îlot</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 01, 15, B2..." {...field} />
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
