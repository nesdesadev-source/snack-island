function round(value: number, precision = 2): number {
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

function clampNonNegative(value: number): number {
  if (!isFinite(value) || isNaN(value)) return 0
  return Math.max(0, value)
}

export function calculateSuggestedPriceForTargetProfit(
  costPerOrder: number,
  profitPercent: number,
  precision = 2
): number {
  const safeCost = clampNonNegative(costPerOrder)
  const safePct = clampNonNegative(profitPercent)
  const multiplier = 1 + safePct / 100
  return round(safeCost * multiplier, precision)
}

export function calculateProfitPerOrderForPrice(
  price: number,
  costPerOrder: number,
  precision = 2
): number {
  const safePrice = clampNonNegative(price)
  const safeCost = clampNonNegative(costPerOrder)
  const profit = safePrice - safeCost
  return round(Math.max(0, profit), precision)
}


