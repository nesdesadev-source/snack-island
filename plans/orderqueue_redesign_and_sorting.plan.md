# OrderQueue redesign: smaller cards, sort order, and iPad-first UX

## Current behavior

- [OrderQueue.vue](src/components/OrderQueue.vue) shows three rows (TO DO, READY, DONE) with horizontal scroll. Cards use `getOrdersByStatus(status)` which **filters** by status but does **not** sort; order is whatever comes from `orders.value`.
- Cards: `min-width: 280px`, `max-width: 320px`, `padding: 1rem`, with full item list, payment, total, and actions. Row content has `max-height: 400px` and horizontal scroll.
- [Order model](src/models/Order.ts) has `created_at: string | null` for sorting.

---

## iPad and touchscreen constraints

The app will be **mostly used on iPad**. That drives layout and interaction choices:

- **Viewport:** Typical iPad viewports are ~768px (portrait) to ~1024px (landscape). Card sizing and breakpoints should treat the 768–1024px range as a primary target, not an afterthought.
- **Touch targets:** Buttons and tappable areas (Mark Ready, Cancel, Complete Order, row collapse) should meet a minimum touch target size (e.g. **44×44px** or similar) to avoid mis-taps. This may mean:
  - Keeping action buttons at least that height and with comfortable padding.
  - Ensuring row headers and collapse icons are large enough to tap.
- **Horizontal scroll:** On touch devices, horizontal scroll is fine but should feel natural—no tiny scrollbars; consider subtle visual cues that the row is scrollable (e.g. visible edge of next card).
- **Spacing:** Slightly more gap between tappable elements reduces accidental taps. When making cards “smaller,” avoid shrinking button or tap areas below the minimum.
- **Summary:** Smaller cards are about **card width and internal padding/typography**, not shrinking touch targets. Row gap and button size can stay or increase for iPad.

---

## 1. Sorting (earliest vs latest)

**Requirement:**

- **To do** (pending) and **Ready**: earliest customer order on the **left** (sort by `created_at` ascending).
- **Done** (completed): latest order on the **left** (sort by `created_at` descending).

**Approach (TDD):**

- Add a small util used only by the queue, e.g. `sortOrdersForQueue(orders: Order[], status: OrderStatus): Order[]`:
  - For `pending` and `ready`: sort by `created_at` ascending (null/undefined treated as oldest, e.g. end of list).
  - For `completed`: sort by `created_at` descending (null/undefined at end).
- **Tests first:** New file e.g. `tests/utils/orderQueueSort.spec.ts` (or under `tests/modules/orders/`) that covers:
  - Pending: multiple orders with different `created_at` → result order is ascending by date.
  - Ready: same ascending behavior.
  - Completed: multiple orders → result order is descending by date.
  - Edge: empty list; single order; null/undefined `created_at` (e.g. push to end).
- **Then:** Implement the util and use it inside `getOrdersByStatus`: after filtering, return `sortOrdersForQueue(filtered, status)`.

**Code touch points:**

- New util: e.g. [src/utils/orderQueueSort.ts](src/utils/orderQueueSort.ts) or [src/modules/orders/orderQueueSort.ts](src/modules/orders/orderQueueSort.ts).
- [OrderQueue.vue](src/components/OrderQueue.vue): in `getOrdersByStatus`, after building `filtered`, return the sorted array using this util.

---

## 2. Smaller cards and less crowding (iPad-aware)

**Goal:** Same information per card, smaller footprint so 4+ orders are easier to scan on iPad, without hurting touch usability.

**Planned changes (all in [OrderQueue.vue](src/components/OrderQueue.vue)):**

- **Card size:** Reduce card `min-width` / `max-width` (e.g. to ~220px / ~260px) so more cards fit in 768–1024px; keep `flex-shrink: 0`. Optionally use a **tablet-first media query** (e.g. min-width: 768px and max-width: 1024px) to use these sizes on iPad while keeping larger cards on big desktops if desired.
- **Card padding and spacing:** Slightly reduce `.order-card` padding and internal margins (e.g. `0.75rem`) and `.row-content` gap (e.g. `0.75rem`). Do **not** reduce action button min-height—keep touch targets ≥ 44px.
- **Typography:** Slightly reduce font sizes for labels and secondary text so content fits the narrower card; keep total and order ID readable.
- **Items list:** Optionally cap `.items-list` max-height so card height is predictable; keep scroll for many items.
- **Row container:** Keep horizontal scroll; consider `-webkit-overflow-scrolling: touch` for smooth scrolling on iOS. Keep or slightly reduce `max-height` so the queue doesn’t dominate the screen on iPad.
- **Touch-friendly details:**
  - `.action-btn`: ensure min-height ~44px and adequate padding.
  - Row header / collapse: ensure clickable area is at least 44px in the relevant direction.
  - Avoid placing two tappable controls too close (e.g. keep gap between “Mark Ready” and “Cancel”).
- **Responsive:** Add or adjust a **768px–1024px** breakpoint as the primary “tablet” range; then adjust for &lt;768px (e.g. single-column or smaller cards) and &gt;1024px if needed.

---

## 3. Optional: compact “items” display

If the row still feels crowded with many items per order, consider showing first N items plus “+K more” with expand/tooltip. Can be a follow-up.

---

## 4. Order of work (TDD)

1. **Tests:** Add `orderQueueSort.spec.ts`; watch them fail.
2. **Util:** Implement `sortOrdersForQueue` until tests pass.
3. **OrderQueue:** Use the util in `getOrdersByStatus` so To do/Ready = oldest first, Done = newest first.
4. **OrderQueue styles:** Apply smaller card dimensions, iPad-aware breakpoints, touch-friendly button/header sizes, and smooth touch scroll; verify on iPad (or simulator) with 2–3 and 4+ orders.

---

## 5. Alignment with Plan.md

Fits within the existing Orders module; no schema or backend changes.

---

## Summary

| Area | Action |
|------|--------|
| Sort order | New util `sortOrdersForQueue`; unit tests first; use in `getOrdersByStatus` (To do/Ready = oldest first, Done = newest first). |
| Crowding | Smaller card width and internal spacing/typography; 768–1024px as primary target; more cards visible on iPad. |
| iPad / touch | Touch targets ≥ 44px; smooth horizontal scroll (`-webkit-overflow-scrolling: touch`); tablet breakpoint; no shrinking of buttons. |
| Scope | [OrderQueue.vue](src/components/OrderQueue.vue) + one new util + one test file. |
