/**
 * Currency and Price Utility
 * Default primary currency is GBP (£) for UK delivery focus.
 */

// Approximate exchange rates (can be updated or customized in settings)
const DEFAULT_RATES = {
  GBP: 1.0,
  EUR: 1.18, // 1 GBP ≈ 1.18 EUR (or 1 EUR ≈ 0.85 GBP)
  USD: 1.28  // 1 GBP ≈ 1.28 USD (or 1 USD ≈ 0.78 GBP)
};

export function convertToGBP(amount, sourceCurrency = 'EUR') {
  if (amount === undefined || amount === null || isNaN(amount)) return null;
  const num = parseFloat(amount);
  if (sourceCurrency === 'GBP') return num;
  if (sourceCurrency === 'EUR') return num / DEFAULT_RATES.EUR;
  if (sourceCurrency === 'USD') return num / DEFAULT_RATES.USD;
  return num;
}

export function formatGBP(amount, options = { minimumFractionDigits: 2, maximumFractionDigits: 2 }) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    ...options
  }).format(amount);
}

export function formatOriginalCurrency(amount, currency = 'EUR') {
  if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(amount);
}
