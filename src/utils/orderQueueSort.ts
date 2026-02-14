import type { Order, OrderStatus } from '../models'

/**
 * Sorts orders for the queue display:
 * - pending / ready: earliest order first (created_at ascending), null at end
 * - completed: latest order first (created_at descending), null at end
 */
export function sortOrdersForQueue(orders: Order[], status: OrderStatus): Order[] {
  const copy = [...orders]
  const asc = status === 'pending' || status === 'ready'

  copy.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : -Infinity
    const bTime = b.created_at ? new Date(b.created_at).getTime() : -Infinity
    if (asc) {
      return aTime === -Infinity && bTime === -Infinity ? 0 : aTime === -Infinity ? 1 : bTime === -Infinity ? -1 : aTime - bTime
    }
    return aTime === -Infinity && bTime === -Infinity ? 0 : aTime === -Infinity ? 1 : bTime === -Infinity ? -1 : bTime - aTime
  })

  return copy
}
