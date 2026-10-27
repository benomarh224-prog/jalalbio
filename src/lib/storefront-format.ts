const priceFormatter = new Intl.NumberFormat('ar-MA', { maximumFractionDigits: 2 })

export function formatPrice(value: number) {
  return priceFormatter.format(value)
}
