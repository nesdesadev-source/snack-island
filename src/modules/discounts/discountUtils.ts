import type { Discount } from '../../models';

/**
 * Filters discounts by active status
 */
export function filterActiveDiscounts(discounts: Discount[]): Discount[] {
  return discounts.filter(discount => discount.is_active);
}

/**
 * Filters discounts by discount type
 */
export function filterDiscountsByType(discounts: Discount[], type: 'flat' | 'percentage'): Discount[] {
  return discounts.filter(discount => discount.discount_type === type);
}

/**
 * Filters discounts by search query (searches name and description)
 */
export function filterDiscountsBySearch(discounts: Discount[], query: string): Discount[] {
  if (!query.trim()) return discounts;
  
  const lowerQuery = query.toLowerCase();
  return discounts.filter(discount => 
    discount.name.toLowerCase().includes(lowerQuery) ||
    (discount.description && discount.description.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Counts total active discounts
 */
export function countActiveDiscounts(discounts: Discount[]): number {
  return filterActiveDiscounts(discounts).length;
}

/**
 * Counts discounts by type
 */
export function countDiscountsByType(discounts: Discount[], type: 'flat' | 'percentage'): number {
  return filterDiscountsByType(discounts, type).length;
}

/**
 * Counts active discounts by type
 */
export function countActiveDiscountsByType(discounts: Discount[], type: 'flat' | 'percentage'): number {
  const activeDiscounts = filterActiveDiscounts(discounts);
  return filterDiscountsByType(activeDiscounts, type).length;
}

/**
 * Calculates the discount amount for a given price
 * @param discount - The discount to apply
 * @param originalPrice - The original price before discount
 * @returns The discount amount (not the final price)
 */
export function calculateDiscountAmount(discount: Discount, originalPrice: number): number {
  if (!discount.is_active) return 0;
  
  if (discount.discount_type === 'flat') {
    return Math.min(discount.amount, originalPrice); // Don't discount more than the price
  } else {
    // Percentage discount
    return (originalPrice * discount.amount) / 100;
  }
}

/**
 * Calculates the final price after applying a discount
 * @param discount - The discount to apply
 * @param originalPrice - The original price before discount
 * @returns The final price after discount
 */
export function calculateDiscountedPrice(discount: Discount, originalPrice: number): number {
  const discountAmount = calculateDiscountAmount(discount, originalPrice);
  return Math.max(0, originalPrice - discountAmount); // Ensure price doesn't go negative
}

/**
 * Groups discounts by type
 */
export function groupDiscountsByType(discounts: Discount[]): {
  flat: Discount[];
  percentage: Discount[];
} {
  return {
    flat: filterDiscountsByType(discounts, 'flat'),
    percentage: filterDiscountsByType(discounts, 'percentage')
  };
}

/**
 * Filters discounts by multiple criteria
 */
export function filterDiscounts(
  discounts: Discount[],
  options: {
    searchQuery?: string;
    discountType?: 'flat' | 'percentage';
    isActive?: boolean;
  }
): Discount[] {
  let filtered = [...discounts];

  if (options.searchQuery) {
    filtered = filterDiscountsBySearch(filtered, options.searchQuery);
  }

  if (options.discountType) {
    filtered = filterDiscountsByType(filtered, options.discountType);
  }

  if (options.isActive !== undefined) {
    filtered = filtered.filter(discount => discount.is_active === options.isActive);
  }

  return filtered;
}
