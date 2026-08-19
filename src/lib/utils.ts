import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un montant en FCFA
 */
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // Code ISO pour le Franc CFA (BCEAO)
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
}

/**
 * Formate une date selon le fuseau horaire de Niamey
 */
export function formatDateNiamey(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Africa/Niamey'
  }).format(new Date(date));
}
