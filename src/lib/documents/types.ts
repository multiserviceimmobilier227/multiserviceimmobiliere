/**
 * Phase 15.2 — Types partagés du moteur documentaire MSI
 * Ce module est client-safe (aucun accès serveur).
 */

export type DocType =
  | "recu"
  | "contrat"
  | "echeancier"
  | "relance"
  | "mise_en_demeure"
  | "remboursement"
  | "quitus";

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  recu: "Reçu d'encaissement",
  contrat: "Contrat de vente",
  echeancier: "Échéancier de paiement",
  relance: "Lettre de relance",
  mise_en_demeure: "Mise en demeure",
  remboursement: "Attestation de remboursement",
  quitus: "Attestation de solde",
};

export interface DocField {
  label: string;
  value: string;
}

export interface DocSection {
  title: string;
  fields: DocField[];
}

export interface DocTable {
  title?: string;
  columns: string[];
  /** Largeurs relatives (somme libre), optionnel */
  widths?: number[];
  rows: string[][];
}

/** Contenu figé d'un document au moment de son émission. */
export interface DocumentPayload {
  title: string;
  subtitle?: string;
  agencyName: string;
  agencyCity?: string;
  issuedOnLabel: string;
  sections: DocSection[];
  tables?: DocTable[];
  highlight?: { label: string; value: string };
  amountInWords?: string;
  notes?: string[];
  legalMentions?: string;
  footerText?: string;
}

export interface DocumentRecord {
  id: string;
  doc_type: string;
  doc_number: string;
  entity_type: string;
  entity_id: string | null;
  status: string;
  issued_at: string;
  reissue_count: number;
  cancel_reason: string | null;
}
