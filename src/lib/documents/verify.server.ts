/**
 * Phase 15.2 — Vérification publique d'un numéro de document.
 * Ne renvoie aucune donnée personnelle ni montant.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { DOC_TYPE_LABELS, type DocType } from "./types";

export interface VerificationResult {
  found: boolean;
  docNumber: string;
  docLabel?: string | undefined;
  issuedOn?: string | undefined;
  status?: "emis" | "annule" | "remplace" | undefined;
}

export async function verifyDocument(docNumber: string): Promise<VerificationResult> {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await supabase.rpc("fn_verify_document", { _doc_number: docNumber });
  if (error) throw new Error("Vérification indisponible");

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { found: false, docNumber };

  return {
    found: true,
    docNumber: row.doc_number,
    docLabel: DOC_TYPE_LABELS[row.doc_type as DocType] ?? row.doc_type,
    issuedOn: row.issued_on,
    status: row.status as VerificationResult["status"],
  };
}
