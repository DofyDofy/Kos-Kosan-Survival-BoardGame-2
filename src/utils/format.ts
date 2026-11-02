import { STATUS_THRESHOLDS } from '../constants';
import { FinancialStatus } from '../types';

/**
 * Format angka ke format Rupiah Indonesia:
 * Contoh: 1200000 -> "Rp1.200.000", -50000 -> "-Rp50.000"
 */
export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absVal);

  if (isNegative) {
    return `-Rp${formatted}`;
  }
  return `Rp${formatted}`;
}

/**
 * Menghitung status keuangan berdasarkan ambang batas:
 * - Aman: >= Rp600.000
 * - Menipis: Rp250.000 - Rp599.999
 * - Kritis: Rp0 - Rp249.999
 * - Bangkrut: < Rp0
 */
export function getFinancialStatus(balance: number): FinancialStatus {
  if (balance >= STATUS_THRESHOLDS.SAFE) {
    return 'Aman';
  }
  if (balance >= STATUS_THRESHOLDS.WARNING) {
    return 'Menipis';
  }
  if (balance >= STATUS_THRESHOLDS.CRITICAL) {
    return 'Kritis';
  }
  return 'Bangkrut';
}

/**
 * Warna dan styling badge status
 */
export function getStatusStyle(status: FinancialStatus): {
  badge: string;
  dot: string;
  border: string;
  text: string;
} {
  switch (status) {
    case 'Aman':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500',
        text: 'text-emerald-600',
      };
    case 'Menipis':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        border: 'border-amber-500',
        text: 'text-amber-600',
      };
    case 'Kritis':
      return {
        badge: 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
        dot: 'bg-orange-500',
        border: 'border-orange-500',
        text: 'text-orange-600',
      };
    case 'Bangkrut':
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 animate-pulse',
        dot: 'bg-rose-500',
        border: 'border-rose-500',
        text: 'text-rose-600',
      };
  }
}
