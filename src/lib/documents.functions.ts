/**
 * Phase 15.2 — Server functions du moteur documentaire (fichier fin).
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const docTypeSchema = z.enum([
  "recu",
  "contrat",
  "echeancier",
  "relance",
  "mise_en_demeure",
  "remboursement",
  "quitus",
]);

export const emitOfficialDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        docType: docTypeSchema,
        entityId: z.string().uuid(),
        forceNew: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    if (!userId) throw new Error("Session requise");
    const { emitDocument } = await import("@/lib/documents/engine.server");
    const origin = new URL(getRequest().url).origin;
    return emitDocument(supabase as never, userId, data, origin);
  });

export const reprintOfficialDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ documentId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    if (!userId) throw new Error("Session requise");
    const { renderExistingDocument } = await import("@/lib/documents/engine.server");
    const origin = new URL(getRequest().url).origin;
    return renderExistingDocument(supabase as never, data.documentId, origin);
  });

export const listEntityDocuments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ entityType: z.string().min(1), entityId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context!;
    const { data: rows, error } = await supabase
      .from("documents")
      .select("id, doc_type, doc_number, entity_type, entity_id, status, issued_at, reissue_count, cancel_reason")
      .eq("entity_type", data.entityType)
      .eq("entity_id", data.entityId)
      .order("issued_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const cancelOfficialDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ documentId: z.string().uuid(), reason: z.string().min(5) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context!;
    if (!userId) throw new Error("Session requise");
    const { error } = await supabase
      .from("documents")
      .update({
        status: "annule",
        cancelled_by: userId,
        cancelled_at: new Date().toISOString(),
        cancel_reason: data.reason,
      })
      .eq("id", data.documentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const verifyDocumentNumber = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ docNumber: z.string().min(6).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyDocument } = await import("@/lib/documents/verify.server");
    return verifyDocument(data.docNumber);
  });
