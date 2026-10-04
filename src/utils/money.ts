/**
 * Formats an integer amount in kobo to Nigerian Naira (₦).
 * Example: 89000000 -> "₦890,000"
 */
export function formatNaira(kobo: number, includeDecimals = false): string {
  const naira = (kobo || 0) / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(naira);
}

/**
 * Calculates free shipping progress.
 */
export function getFreeShippingProgress(subtotalKobo: number, thresholdKobo: number) {
  const progressPercent = Math.min(100, Math.round((subtotalKobo / thresholdKobo) * 100));
  const remainingKobo = Math.max(0, thresholdKobo - subtotalKobo);
  return {
    progressPercent,
    remainingKobo,
    isEligible: subtotalKobo >= thresholdKobo,
  };
}
