/**
 * Phase 15.2 — Moteur de rendu PDF serveur (compatible runtime edge).
 * pdf-lib pur JS, polices standard WinAnsi (accents français supportés).
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import type { DocumentPayload } from "./types";

const MAGENTA = rgb(0.82, 0.07, 0.48); // #D1127B
const INK = rgb(0.12, 0.12, 0.14);
const MUTED = rgb(0.42, 0.42, 0.47);
const LINE = rgb(0.85, 0.85, 0.88);
const SOFT = rgb(0.98, 0.94, 0.97);

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 46;
const CONTENT_WIDTH = A4[0] - MARGIN * 2;

interface Ctx {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
  pageIndex: number;
  docNumber: string;
  footerText: string;
  duplicate: boolean;
  cancelled: boolean;
}

/** Nettoie les caractères hors WinAnsi qui feraient échouer l'encodage. */
function safe(text: string): string {
  return String(text ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u202f\u00a0\u2009]/g, " ")
    .replace(/[\u2026]/g, "...")
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u0152\u0153]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function truncate(text: string, font: PDFFont, size: number, maxWidth: number): string {
  let value = safe(text);
  if (font.widthOfTextAtSize(value, size) <= maxWidth) return value;
  while (value.length > 1 && font.widthOfTextAtSize(`${value}...`, size) > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value}...`;
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.pdf.addPage(A4);
  ctx.pageIndex += 1;
  ctx.y = A4[1] - MARGIN;
  drawWatermarks(ctx);
  ctx.page.drawText("MULTI SERVICES IMMOBILIERE", {
    x: MARGIN, y: ctx.y, size: 8, font: ctx.bold, color: MAGENTA,
  });
  const cont = safe(`${ctx.docNumber} (suite)`);
  const w = ctx.regular.widthOfTextAtSize(cont, 8);
  ctx.page.drawText(cont, {
    x: A4[0] - MARGIN - w, y: ctx.y, size: 8, font: ctx.regular, color: MUTED,
  });
  ctx.y -= 8;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: MARGIN + CONTENT_WIDTH, y: ctx.y },
    thickness: 0.6, color: LINE,
  });
  ctx.y -= 22;
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN + 46) newPage(ctx);
}

function drawWatermarks(ctx: Ctx) {
  const label = ctx.cancelled ? "ANNULE" : ctx.duplicate ? "DUPLICATA" : null;
  if (!label) return;
  const wmSize = 58;
  const wmWidth = ctx.bold.widthOfTextAtSize(label, wmSize);
  const angle = 32;
  const rad = (angle * Math.PI) / 180;
  ctx.page.drawText(label, {
    x: (A4[0] - wmWidth * Math.cos(rad)) / 2,
    y: (A4[1] - wmWidth * Math.sin(rad)) / 2,
    size: wmSize,
    font: ctx.bold,
    color: ctx.cancelled ? rgb(0.85, 0.25, 0.25) : MAGENTA,
    opacity: 0.12,
    rotate: { type: "degrees", angle: 32 } as never,
  });
}

function drawHeader(ctx: Ctx, payload: DocumentPayload, docNumber: string, issuedOn: string) {
  const { page, bold, regular } = ctx;
  page.drawRectangle({ x: 0, y: A4[1] - 96, width: A4[0], height: 96, color: SOFT });
  page.drawRectangle({ x: 0, y: A4[1] - 100, width: A4[0], height: 4, color: MAGENTA });

  page.drawText("MULTI SERVICES IMMOBILIERE", {
    x: MARGIN, y: A4[1] - 44, size: 15, font: bold, color: MAGENTA,
  });
  page.drawText(safe(`${payload.agencyName}${payload.agencyCity ? ` — ${payload.agencyCity}` : ""}`), {
    x: MARGIN, y: A4[1] - 60, size: 9, font: regular, color: MUTED,
  });
  page.drawText(safe(payload.title.toUpperCase()), {
    x: MARGIN, y: A4[1] - 82, size: 12, font: bold, color: INK,
  });

  const numberText = safe(docNumber);
  const numberWidth = bold.widthOfTextAtSize(numberText, 9);
  page.drawText(numberText, {
    x: A4[0] - MARGIN - numberWidth, y: A4[1] - 44, size: 9, font: bold, color: INK,
  });
  const dateText = safe(issuedOn);
  const dateWidth = regular.widthOfTextAtSize(dateText, 9);
  page.drawText(dateText, {
    x: A4[0] - MARGIN - dateWidth, y: A4[1] - 58, size: 9, font: regular, color: MUTED,
  });

  ctx.y = A4[1] - 122;
}

function drawSectionTitle(ctx: Ctx, title: string) {
  ensure(ctx, 40);
  ctx.y -= 6;
  ctx.page.drawText(safe(title.toUpperCase()), {
    x: MARGIN, y: ctx.y, size: 9, font: ctx.bold, color: MAGENTA,
  });
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: MARGIN + CONTENT_WIDTH, y: ctx.y },
    thickness: 0.6,
    color: LINE,
  });
  ctx.y -= 14;
}

function drawFields(ctx: Ctx, fields: DocumentPayload["sections"][number]["fields"]) {
  const colWidth = CONTENT_WIDTH / 2;
  for (let i = 0; i < fields.length; i += 2) {
    ensure(ctx, 26);
    const rowFields = [fields[i], fields[i + 1]];
    rowFields.forEach((field, col) => {
      if (!field) return;
      const x = MARGIN + col * colWidth;
      ctx.page.drawText(truncate(field.label, ctx.regular, 7.5, colWidth - 12), {
        x, y: ctx.y, size: 7.5, font: ctx.regular, color: MUTED,
      });
      ctx.page.drawText(truncate(field.value, ctx.bold, 10, colWidth - 12), {
        x, y: ctx.y - 12, size: 10, font: ctx.bold, color: INK,
      });
    });
    ctx.y -= 30;
  }
}

function drawTable(ctx: Ctx, table: NonNullable<DocumentPayload["tables"]>[number]) {
  if (table.title) drawSectionTitle(ctx, table.title);
  const weights = table.widths?.length === table.columns.length
    ? table.widths
    : table.columns.map(() => 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => (w / total) * CONTENT_WIDTH);

  const drawHeaderRow = () => {
    ensure(ctx, 26);
    ctx.page.drawRectangle({
      x: MARGIN, y: ctx.y - 5, width: CONTENT_WIDTH, height: 18, color: SOFT,
    });
    let x = MARGIN + 4;
    table.columns.forEach((col, i) => {
      ctx.page.drawText(truncate(col, ctx.bold, 8, widths[i]! - 8), {
        x, y: ctx.y, size: 8, font: ctx.bold, color: INK,
      });
      x += widths[i]!;
    });
    ctx.y -= 22;
  };

  drawHeaderRow();

  for (const row of table.rows) {
    if (ctx.y - 18 < MARGIN + 46) {
      newPage(ctx);
      drawHeaderRow();
    }
    let x = MARGIN + 4;
    row.forEach((cell, i) => {
      ctx.page.drawText(truncate(cell, ctx.regular, 8.5, widths[i]! - 8), {
        x, y: ctx.y, size: 8.5, font: ctx.regular, color: INK,
      });
      x += widths[i]!;
    });
    ctx.y -= 5;
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y },
      end: { x: MARGIN + CONTENT_WIDTH, y: ctx.y },
      thickness: 0.4,
      color: LINE,
    });
    ctx.y -= 13;
  }
  ctx.y -= 6;
}

function drawHighlight(ctx: Ctx, label: string, value: string, words?: string) {
  ensure(ctx, words ? 78 : 60);
  const height = words ? 70 : 52;
  ctx.y -= height - 14;
  ctx.page.drawRectangle({
    x: MARGIN, y: ctx.y, width: CONTENT_WIDTH, height, color: SOFT,
    borderColor: MAGENTA, borderWidth: 0.8,
  });
  ctx.page.drawText(safe(label.toUpperCase()), {
    x: MARGIN + 14, y: ctx.y + height - 20, size: 8, font: ctx.regular, color: MUTED,
  });
  ctx.page.drawText(truncate(value, ctx.bold, 20, CONTENT_WIDTH - 28), {
    x: MARGIN + 14, y: ctx.y + height - 42, size: 20, font: ctx.bold, color: MAGENTA,
  });
  if (words) {
    const lines = wrap(words, ctx.regular, 8, CONTENT_WIDTH - 28).slice(0, 2);
    lines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN + 14, y: ctx.y + 16 - i * 10, size: 8, font: ctx.regular, color: INK,
      });
    });
  }
  ctx.y -= 22;
}

function drawParagraphs(ctx: Ctx, notes: string[]) {
  for (const note of notes) {
    const lines = wrap(note, ctx.regular, 9, CONTENT_WIDTH);
    ensure(ctx, lines.length * 12 + 8);
    for (const line of lines) {
      ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 9, font: ctx.regular, color: INK });
      ctx.y -= 12;
    }
    ctx.y -= 6;
  }
}

function drawSignatures(ctx: Ctx) {
  ensure(ctx, 76);
  ctx.y -= 34;
  const boxWidth = (CONTENT_WIDTH - 24) / 2;
  ["Le client", "Pour MULTI SERVICES IMMOBILIERE"].forEach((label, i) => {
    const x = MARGIN + i * (boxWidth + 24);
    ctx.page.drawLine({
      start: { x, y: ctx.y }, end: { x: x + boxWidth, y: ctx.y },
      thickness: 0.6, color: LINE,
    });
    ctx.page.drawText(safe(label), {
      x, y: ctx.y - 12, size: 8, font: ctx.regular, color: MUTED,
    });
  });
  ctx.y -= 30;
}

async function buildQrImage(pdf: PDFDocument, verifyUrl: string) {
  const qr = QRCode.create(verifyUrl, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const scale = Math.max(1.6, Math.min(2.6, 92 / size));
  const quiet = 2;
  const dim = (size + quiet * 2) * scale;

  // Image RGBA brute -> PNG via pdf-lib impossible : on dessine les modules en rectangles.
  return { size, data, scale, quiet, dim, pdf };
}

function drawQr(
  page: PDFPage,
  qr: { size: number; data: Uint8Array | number[]; scale: number; quiet: number },
  x: number,
  y: number,
) {
  const { size, data, scale } = qr;
  page.drawRectangle({
    x: x - scale * 2, y: y - scale * 2,
    width: (size + 4) * scale, height: (size + 4) * scale,
    color: rgb(1, 1, 1),
  });
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!data[row * size + col]) continue;
      page.drawRectangle({
        x: x + col * scale,
        y: y + (size - 1 - row) * scale,
        width: scale,
        height: scale,
        color: rgb(0, 0, 0),
      });
    }
  }
}

function drawFooters(
  ctx: Ctx,
  qr: { size: number; data: Uint8Array | number[]; scale: number; quiet: number },
  verifyUrl: string,
  legal?: string,
) {
  const pages = ctx.pdf.getPages();
  pages.forEach((page, index) => {
    const isLast = index === pages.length - 1;
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 34 },
      end: { x: MARGIN + CONTENT_WIDTH, y: MARGIN + 34 },
      thickness: 0.6,
      color: LINE,
    });
    if (legal) {
      wrap(legal, ctx.regular, 7, CONTENT_WIDTH - 80).slice(0, 2).forEach((line, i) => {
        page.drawText(line, { x: MARGIN, y: MARGIN + 22 - i * 9, size: 7, font: ctx.regular, color: MUTED });
      });
    }
    page.drawText(safe(`${ctx.footerText}`), {
      x: MARGIN, y: MARGIN, size: 7, font: ctx.regular, color: MUTED,
    });
    const pageLabel = safe(`Page ${index + 1}/${pages.length} — ${ctx.docNumber}`);
    const w = ctx.regular.widthOfTextAtSize(pageLabel, 7);
    page.drawText(pageLabel, {
      x: A4[0] - MARGIN - w, y: MARGIN, size: 7, font: ctx.regular, color: MUTED,
    });
    if (isLast) {
      const qrSide = qr.size * qr.scale;
      const qrX = A4[0] - MARGIN - qrSide;
      const qrY = MARGIN + 52;
      drawQr(page, qr, qrX, qrY);
      const hint = safe("Verifier ce document");
      const hw = ctx.regular.widthOfTextAtSize(hint, 6.5);
      page.drawText(hint, {
        x: A4[0] - MARGIN - Math.max(hw, qrSide) + (Math.max(hw, qrSide) - hw) / 2,
        y: qrY + qrSide + 8,
        size: 6.5,
        font: ctx.regular,
        color: MUTED,
      });
    }
  });
  void verifyUrl;
}

export interface RenderOptions {
  payload: DocumentPayload;
  docNumber: string;
  issuedOn: string;
  verifyUrl: string;
  duplicate?: boolean;
  cancelled?: boolean;
  withSignatures?: boolean;
}

/** Rend le document en PDF et renvoie les octets. */
export async function renderDocumentPdf(options: RenderOptions): Promise<Uint8Array> {
  const { payload, docNumber, issuedOn, verifyUrl } = options;
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  pdf.setTitle(`${payload.title} ${docNumber}`);
  pdf.setProducer("MSI 2.0");
  pdf.setCreator("MULTI SERVICES IMMOBILIERE");

  const ctx: Ctx = {
    pdf,
    page: pdf.addPage(A4),
    y: A4[1] - MARGIN,
    regular,
    bold,
    pageIndex: 0,
    docNumber,
    footerText: payload.footerText ?? "Document généré électroniquement par MSI 2.0.",
    duplicate: Boolean(options.duplicate),
    cancelled: Boolean(options.cancelled),
  };

  drawWatermarks(ctx);
  drawHeader(ctx, payload, docNumber, issuedOn);

  if (payload.subtitle) {
    drawParagraphs(ctx, [payload.subtitle]);
  }

  for (const section of payload.sections) {
    drawSectionTitle(ctx, section.title);
    drawFields(ctx, section.fields);
  }

  if (payload.highlight) {
    drawHighlight(ctx, payload.highlight.label, payload.highlight.value, payload.amountInWords);
  }

  for (const table of payload.tables ?? []) {
    drawTable(ctx, table);
  }

  if (payload.notes?.length) {
    drawParagraphs(ctx, payload.notes);
  }

  if (options.withSignatures) drawSignatures(ctx);

  const qr = await buildQrImage(pdf, verifyUrl);
  drawFooters(ctx, qr, verifyUrl, payload.legalMentions);

  return pdf.save();
}

/** Empreinte SHA-256 du contenu figé. */
export async function hashPayload(payload: unknown): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
