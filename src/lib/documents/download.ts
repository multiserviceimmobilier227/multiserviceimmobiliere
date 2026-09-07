/**
 * Phase 15.2 — Téléchargement / ouverture d'un PDF officiel côté navigateur.
 */

export function base64ToBlob(base64: string, mime = "application/pdf"): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function downloadPdf(base64: string, fileName: string) {
  const url = URL.createObjectURL(base64ToBlob(base64));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function openPdfInNewTab(base64: string) {
  const url = URL.createObjectURL(base64ToBlob(base64));
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
