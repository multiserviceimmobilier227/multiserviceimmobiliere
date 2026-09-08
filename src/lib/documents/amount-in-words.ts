/**
 * Phase 15.2 — Conversion d'un montant entier FCFA en toutes lettres (français).
 * Client-safe, sans dépendance.
 */

const UNITS = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf",
];

const TENS: Record<number, string> = {
  2: "vingt",
  3: "trente",
  4: "quarante",
  5: "cinquante",
  6: "soixante",
  7: "soixante",
  8: "quatre-vingt",
  9: "quatre-vingt",
};

function belowHundred(n: number, isFinal = true): string {
  if (n < 20) return UNITS[n]!;
  const t = Math.floor(n / 10);
  const u = n % 10;
  const base = TENS[t]!;

  if (t === 7 || t === 9) {
    const rest = 10 + u;
    if (t === 7) return u === 1 ? "soixante et onze" : `soixante-${UNITS[rest]}`;
    return `quatre-vingt-${UNITS[rest]}`;
  }
  if (u === 0) return t === 8 && isFinal ? "quatre-vingts" : base;
  if (u === 1 && t !== 8) return `${base} et un`;
  return `${base}-${UNITS[u]}`;
}

function belowThousand(n: number, isFinal = true): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 0) return belowHundred(rest, isFinal);
  const hundreds = h === 1 ? "cent" : `${UNITS[h]} cent`;
  if (rest === 0) return h === 1 ? "cent" : isFinal ? `${hundreds}s` : hundreds;
  return `${hundreds} ${belowHundred(rest, isFinal)}`;
}

const SCALES: Array<{ value: number; singular: string; plural: string }> = [
  { value: 1_000_000_000, singular: "milliard", plural: "milliards" },
  { value: 1_000_000, singular: "million", plural: "millions" },
  { value: 1_000, singular: "mille", plural: "mille" },
];

/** Retourne le nombre en lettres (français), sans devise. */
export function numberToFrenchWords(input: number): string {
  let n = Math.trunc(Math.abs(input));
  if (n === 0) return "zéro";

  const parts: string[] = [];
  for (const scale of SCALES) {
    if (n < scale.value) continue;
    const count = Math.floor(n / scale.value);
    n %= scale.value;
    if (scale.value === 1_000 && count === 1) {
      parts.push("mille");
    } else {
      const label = count > 1 ? scale.plural : scale.singular;
      parts.push(`${belowThousand(count, scale.value !== 1_000)} ${label}`);
    }
  }
  if (n > 0) parts.push(belowThousand(n));

  const words = parts.join(" ").replace(/\s+/g, " ").trim();
  return input < 0 ? `moins ${words}` : words;
}

/** Montant FCFA en toutes lettres, prêt à imprimer sur un document officiel. */
export function amountToWordsFCFA(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  const words = numberToFrenchWords(rounded);
  const unit = Math.abs(rounded) < 2 ? "franc CFA" : "francs CFA";
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} (${formatFCFA(rounded)}) ${unit}`;
}

/** Formatage FCFA à l'entier, séparateur d'espace insécable fine évité pour le PDF. */
export function formatFCFA(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  return rounded.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");
}
