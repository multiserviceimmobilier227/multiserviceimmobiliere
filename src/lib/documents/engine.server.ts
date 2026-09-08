/**
 * Phase 15.2 — Orchestration serveur du moteur documentaire.
 * Construit le contenu figé, réserve le numéro officiel, enregistre et rend le PDF.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { amountToWordsFCFA, formatFCFA } from "./amount-in-words";
import { DOC_TYPE_LABELS, type DocType, type DocumentPayload } from "./types";
import { bytesToBase64, hashPayload, renderDocumentPdf } from "./renderer.server";

type Client = SupabaseClient<Database>;

const NIAMEY = "Africa/Niamey";

function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: NIAMEY,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

const METHOD_LABELS: Record<string, string> = {
  espece: "Espèces",
  virement: "Virement",
  cheque: "Chèque",
  mobile_money: "Mobile Money",
};

export interface BuiltDocument {
  payload: DocumentPayload;
  agencyId: string | null;
  entityType: string;
  withSignatures: boolean;
}

/** Reçu d'encaissement (entité : paiement). */
async function buildReceipt(supabase: Client, paymentId: string): Promise<BuiltDocument> {
  const { data: payment, error } = await supabase
    .from("payments")
    .select("*, sale:sales(*, client:clients(*), plot:plots(*, site:sites(*)), payments(*), payment_schedules(*))")
    .eq("id", paymentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!payment?.sale) throw new Error("Versement introuvable");

  const sale = payment.sale as any;
  const client = sale.client ?? {};
  const plot = sale.plot ?? {};
  const site = plot.site ?? {};

  const agency = sale.agency_id
    ? (await supabase.from("agences").select("name, city").eq("id", sale.agency_id).maybeSingle()).data
    : null;

  const totalPaid = (sale.payments ?? []).reduce(
    (acc: number, p: any) => acc + Number(p.amount || 0),
    0,
  );
  const totalPrice = Number(sale.total_price || sale.final_price || 0);
  const remaining = Math.max(totalPrice - totalPaid, 0);

  const schedules = [...(sale.payment_schedules ?? [])].sort(
    (a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );

  const payload: DocumentPayload = {
    title: DOC_TYPE_LABELS.recu,
    agencyName: agency?.name ?? "Direction générale",
    agencyCity: agency?.city ?? "Maradi",
    issuedOnLabel: formatDate(payment.payment_date, true),
    sections: [
      {
        title: "Client",
        fields: [
          { label: "Nom et prénom", value: `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() || "—" },
          { label: "Téléphone", value: client.phone ?? "—" },
          { label: "Pièce d'identité", value: `${client.id_type ?? "—"} ${client.id_number ?? ""}`.trim() },
          { label: "Adresse", value: client.address ?? "—" },
        ],
      },
      {
        title: "Bien concerné",
        fields: [
          { label: "Lotissement / site", value: site.name ?? "—" },
          { label: "Parcelle", value: plot.plot_number ?? "—" },
          { label: "Superficie", value: plot.surface_area ? `${plot.surface_area} m²` : "—" },
          { label: "Prix total de la vente", value: `${formatFCFA(totalPrice)} FCFA` },
        ],
      },
      {
        title: "Versement",
        fields: [
          { label: "Date du versement", value: formatDate(payment.payment_date, true) },
          { label: "Mode de paiement", value: METHOD_LABELS[payment.method] ?? payment.method },
          { label: "Référence", value: payment.reference || "—" },
          { label: "Cumul versé", value: `${formatFCFA(totalPaid)} FCFA` },
          { label: "Reste dû", value: `${formatFCFA(remaining)} FCFA` },
          { label: "Statut de la vente", value: sale.status ?? "—" },
        ],
      },
    ],
    highlight: { label: "Montant encaissé", value: `${formatFCFA(payment.amount)} FCFA` },
    amountInWords: amountToWordsFCFA(Number(payment.amount)),
    tables: schedules.length
      ? [
          {
            title: "Situation de l'échéancier",
            columns: ["Échéance", "Montant dû", "Montant payé", "Reste", "Statut"],
            widths: [1.1, 1, 1, 1, 1],
            rows: schedules.map((s: any) => [
              formatDate(s.due_date),
              `${formatFCFA(s.amount_due)} FCFA`,
              `${formatFCFA(s.amount_paid || 0)} FCFA`,
              `${formatFCFA(Math.max(Number(s.amount_due || 0) - Number(s.amount_paid || 0), 0))} FCFA`,
              s.status ?? "—",
            ]),
          },
        ]
      : [],
    notes: [
      "Ce reçu atteste du versement mentionné ci-dessus, imputé sur les échéances les plus anciennes.",
    ],
    legalMentions:
      "Reçu officiel MULTI SERVICES IMMOBILIERE. Toute réédition porte la mention DUPLICATA. Vérification en ligne par QR code.",
  };

  return { payload, agencyId: sale.agency_id ?? null, entityType: "payment", withSignatures: true };
}

async function buildDocument(
  supabase: Client,
  docType: DocType,
  entityId: string,
): Promise<BuiltDocument> {
  switch (docType) {
    case "recu":
      return buildReceipt(supabase, entityId);
    default:
      throw new Error(`Type de document non encore disponible : ${docType}`);
  }
}

export interface EmitResult {
  documentId: string;
  docNumber: string;
  fileName: string;
  pdfBase64: string;
  duplicate: boolean;
}

function verifyUrl(origin: string, docNumber: string) {
  return `${origin.replace(/\/$/, "")}/verification?n=${encodeURIComponent(docNumber)}`;
}

/** Émet (ou réédite) un document officiel. */
export async function emitDocument(
  supabase: Client,
  userId: string,
  input: { docType: DocType; entityId: string; forceNew?: boolean | undefined },
  origin: string,
): Promise<EmitResult> {
  const { docType, entityId } = input;

  // Réédition : un document déjà émis pour cette entité et ce type
  if (!input.forceNew) {
    const { data: existing } = await supabase
      .from("documents")
      .select("*")
      .eq("doc_type", docType)
      .eq("entity_id", entityId)
      .eq("status", "emis")
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const payload = existing.payload as unknown as DocumentPayload;
      const bytes = await renderDocumentPdf({
        payload,
        docNumber: existing.doc_number,
        issuedOn: payload.issuedOnLabel,
        verifyUrl: verifyUrl(origin, existing.doc_number),
        duplicate: true,
        withSignatures: docType !== "recu" ? false : true,
      });
      await supabase
        .from("documents")
        .update({ reissue_count: (existing.reissue_count ?? 0) + 1 })
        .eq("id", existing.id);

      return {
        documentId: existing.id,
        docNumber: existing.doc_number,
        fileName: `${existing.doc_number.replace(/\//g, "-")}.pdf`,
        pdfBase64: bytesToBase64(bytes),
        duplicate: true,
      };
    }
  }

  const built = await buildDocument(supabase, docType, entityId);

  const { data: docNumber, error: numberError } = await supabase.rpc("fn_next_document_number", {
    _agency_id: built.agencyId,
    _doc_type: docType,
  });
  if (numberError || !docNumber) throw new Error(numberError?.message ?? "Numérotation impossible");

  const contentHash = await hashPayload(built.payload);

  const { data: inserted, error: insertError } = await supabase
    .from("documents")
    .insert({
      doc_type: docType,
      doc_number: docNumber as string,
      agency_id: built.agencyId,
      entity_type: built.entityType,
      entity_id: entityId,
      payload: built.payload as never,
      template_version: 1,
      content_hash: contentHash,
      issued_by: userId,
    })
    .select("id, doc_number")
    .single();

  if (insertError) throw new Error(insertError.message);

  const bytes = await renderDocumentPdf({
    payload: built.payload,
    docNumber: inserted.doc_number,
    issuedOn: built.payload.issuedOnLabel,
    verifyUrl: verifyUrl(origin, inserted.doc_number),
    withSignatures: built.withSignatures,
  });

  return {
    documentId: inserted.id,
    docNumber: inserted.doc_number,
    fileName: `${inserted.doc_number.replace(/\//g, "-")}.pdf`,
    pdfBase64: bytesToBase64(bytes),
    duplicate: false,
  };
}

/** Réimprime un document déjà émis à partir de son contenu figé. */
export async function renderExistingDocument(
  supabase: Client,
  documentId: string,
  origin: string,
): Promise<EmitResult> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Document introuvable");

  const payload = data.payload as unknown as DocumentPayload;
  const bytes = await renderDocumentPdf({
    payload,
    docNumber: data.doc_number,
    issuedOn: payload.issuedOnLabel,
    verifyUrl: verifyUrl(origin, data.doc_number),
    duplicate: true,
    cancelled: data.status === "annule",
    withSignatures: true,
  });

  await supabase
    .from("documents")
    .update({ reissue_count: (data.reissue_count ?? 0) + 1 })
    .eq("id", documentId);

  return {
    documentId: data.id,
    docNumber: data.doc_number,
    fileName: `${data.doc_number.replace(/\//g, "-")}.pdf`,
    pdfBase64: bytesToBase64(bytes),
    duplicate: true,
  };
}
