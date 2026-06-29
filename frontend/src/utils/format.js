/** Format a number as the configured currency. Default symbol: ৳ (BDT). */
export function formatCurrency(value, symbol = '৳') {
  const n = Number(value || 0)
  return `${symbol}${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Join class names, dropping falsy values. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
