import { describe, it, expect } from 'vitest';
import { convertToGBP, formatGBP, formatOriginalCurrency } from '../utils/currency';

describe('currency utilities', () => {
  it('converts EUR to GBP using exchange rate', () => {
    // 1.18 EUR = 1.00 GBP
    const result = convertToGBP(11.80, 'EUR');
    expect(result).toBeCloseTo(10.00, 2);
  });

  it('converts USD to GBP using exchange rate', () => {
    // 1.28 USD = 1.00 GBP
    const result = convertToGBP(12.80, 'USD');
    expect(result).toBeCloseTo(10.00, 2);
  });

  it('returns exact amount if already GBP', () => {
    expect(convertToGBP(15.50, 'GBP')).toBe(15.50);
  });

  it('handles null, undefined, or NaN gracefully', () => {
    expect(convertToGBP(null)).toBeNull();
    expect(convertToGBP(undefined)).toBeNull();
    expect(convertToGBP('invalid')).toBeNull();
  });

  it('formats GBP correctly with £ symbol', () => {
    const formatted = formatGBP(25.5);
    expect(formatted).toContain('£25.50');
  });

  it('returns N/A when formatting null/undefined', () => {
    expect(formatGBP(null)).toBe('N/A');
    expect(formatGBP(undefined)).toBe('N/A');
    expect(formatGBP(NaN)).toBe('N/A');
  });
});
