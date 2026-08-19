import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforcePermission } from "./permissions.server";

export const getReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await enforcePermission(context.userId, 'view_reservations');
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        plot:plot_id (
          id,
          number,
          lotissement:lotissement_id ( name )
        ),
        client:client_id (
          id,
          first_name,
          last_name,
          phone
        ),
        creator:created_by ( email )
      `)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  });

export const createReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        plotId: z.string().uuid(),
        clientId: z.string().uuid(),
        durationDays: z.number().min(1).max(90).default(15),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    await enforcePermission(context.userId, 'create_reservation');
    const { supabase } = await import("@/integrations/supabase/client");

    // Check if plot is available
    const { data: plot, error: plotError } = await supabase
      .from("plots")
      .select("status")
      .eq("id", data.plotId)
      .single();

    if (plotError || !plot) throw new Error("Parcelle introuvable");
    if (plot.status !== 'Disponible') throw new Error("La parcelle n'est plus disponible");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.durationDays);

    const { error } = await supabase.from("reservations").insert({
      plot_id: data.plotId,
      client_id: data.clientId,
      created_by: context.userId,
      expires_at: expiresAt.toISOString(),
      status: 'active',
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        reservationId: z.string().uuid(),
        reason: z.string().min(1),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    await enforcePermission(context.userId, 'manage_reservations');
    const { supabase } = await import("@/integrations/supabase/client");

    const { error } = await supabase
      .from("reservations")
      .update({
        status: 'cancelled',
        cancellation_reason: data.reason,
      })
      .eq("id", data.reservationId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const checkAndExpireReservations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // This could be called by an admin or a cron job route
    await enforcePermission(context.userId, 'manage_settings');
    const { supabase } = await import("@/integrations/supabase/client");

    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from("reservations")
      .update({ status: 'expired' })
      .eq("status", 'active')
      .lt("expires_at", now);

    if (error) throw new Error(error.message);
    return { success: true };
  });
