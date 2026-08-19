import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createAcquisition } from "@/lib/acquisitions.functions";
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

const acquisitionSchema = z.object({
  vendeur: z.string().min(1, "Vendeur requis"),
  date_achat: z.string().min(1, "Date requise"),
  prix_principal: z.number().min(0, "Prix requis"),
});

type FormValues = z.infer<typeof acquisitionSchema>;

export function AcquisitionFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const createAcq = useServerFn(createAcquisition);
  const form = useForm<FormValues>({
    resolver: zodResolver(acquisitionSchema),
    defaultValues: { vendeur: "", date_achat: new Date().toISOString().split('T')[0], prix_principal: 0 },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createAcq({ data: { ...values } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acquisitions"] });
      toast.success("Acquisition enregistrée");
      onOpenChange(false);
      form.reset();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouvelle Acquisition</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="vendeur" render={({ field }) => (
              <FormItem><FormLabel>Vendeur</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="prix_principal" render={({ field }) => (
              <FormItem><FormLabel>Prix Principal (FCFA)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full bg-[#D1127B]">Enregistrer</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
