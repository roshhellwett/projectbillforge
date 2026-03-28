/**
 * Formats a number as Indian Rupees (INR)
 * @param amount Number to format
 * @returns Formatted currency string (e.g., ₹1,00,000.00)
 */
export function formatCurrency(amount: number | null | undefined): string {
  const safeAmount = Number(amount ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Formats a date string or Date object into DD/MM/YYYY
 * @param date Date to format
 * @returns Formatted date string (e.g., 25/12/2026)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

/**
 * Formats a date string or Date object into DD MMM, YYYY for receipts
 * @param date Date to format
 * @returns Formatted date string (e.g., 25 Dec, 2026)
 */
export function formatReceiptDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
}
