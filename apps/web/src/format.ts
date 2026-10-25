/**
 * Annual CTC in its own currency. en-US keeps every symbol unambiguous (SGD 90,000 vs $90,000),
 * except INR, which uses en-IN lakh grouping (12,00,000) the way Indian HR reads it.
 */
export function formatMoney(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** '2023-04-01' -> '01 Apr 2023'. */
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}
