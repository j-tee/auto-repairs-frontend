/**
 * Currency formatting utilities for the auto repair system
 */

/**
 * Format currency values from string decimals to display format
 * @param amount - String decimal amount (e.g., "123.45") or number
 * @returns Formatted currency string (e.g., "$123.45")
 */
export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid amounts
  if (isNaN(numAmount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
}

/**
 * Parse currency string back to number
 * @param currencyString - Formatted currency string (e.g., "$123.45")
 * @returns Number value
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and formatting
  const cleanString = currencyString.replace(/[$,]/g, '');
  const amount = parseFloat(cleanString);
  return isNaN(amount) ? 0 : amount;
}

/**
 * Format as decimal string (for API requests)
 * @param amount - Number amount
 * @returns Decimal string with 2 decimal places
 */
export function toDecimalString(amount: number): string {
  if (isNaN(amount)) {
    return '0.00';
  }
  return amount.toFixed(2);
}

/**
 * Add two decimal string amounts
 * @param amount1 - First amount as string
 * @param amount2 - Second amount as string
 * @returns Sum as decimal string
 */
export function addCurrency(amount1: string, amount2: string): string {
  const num1 = parseFloat(amount1) || 0;
  const num2 = parseFloat(amount2) || 0;
  return toDecimalString(num1 + num2);
}

/**
 * Subtract two decimal string amounts
 * @param amount1 - First amount as string
 * @param amount2 - Second amount as string
 * @returns Difference as decimal string
 */
export function subtractCurrency(amount1: string, amount2: string): string {
  const num1 = parseFloat(amount1) || 0;
  const num2 = parseFloat(amount2) || 0;
  return toDecimalString(num1 - num2);
}

/**
 * Calculate percentage of an amount
 * @param amount - Base amount as string
 * @param percentage - Percentage as string or number
 * @returns Calculated amount as decimal string
 */
export function calculatePercentage(amount: string, percentage: string | number): string {
  const baseAmount = parseFloat(amount) || 0;
  const percent = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  
  if (isNaN(percent)) {
    return '0.00';
  }
  
  return toDecimalString(baseAmount * (percent / 100));
}

/**
 * Calculate tax amount
 * @param subtotal - Subtotal amount as string
 * @param taxRate - Tax rate as percentage string (e.g., "8.25")
 * @returns Tax amount as decimal string
 */
export function calculateTax(subtotal: string, taxRate: string): string {
  return calculatePercentage(subtotal, taxRate);
}

/**
 * Calculate discount amount
 * @param subtotal - Subtotal amount as string
 * @param discountRate - Discount rate as percentage string (e.g., "10")
 * @returns Discount amount as decimal string
 */
export function calculateDiscount(subtotal: string, discountRate: string): string {
  return calculatePercentage(subtotal, discountRate);
}
