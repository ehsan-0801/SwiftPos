import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * POS cart state. Persisted to localStorage so the cart survives a tab
 * refresh (spec §9 — Offline requirement). Held sales let a cashier park
 * a transaction and recall it later (F3 / F4).
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, price, qty, discount, tax_rate }
      customer: null, // null = walk-in
      discount: 0, // order-level flat discount
      held: [], // parked sales: { id, label, items, customer, discount }

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + 1 } : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                qty: 1,
                discount: 0,
                tax_rate: Number(product.tax_rate ?? 0),
              },
            ],
          }
        }),

      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
            .filter((i) => i.qty > 0),
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setCustomer: (customer) => set({ customer }),
      setDiscount: (discount) => set({ discount }),

      clear: () => set({ items: [], customer: null, discount: 0 }),

      // --- Totals ---
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty - i.discount, 0),

      taxTotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.price * i.qty - i.discount) * (i.tax_rate / 100),
          0
        ),

      total: () => {
        const s = get()
        return Math.max(0, s.subtotal() - s.discount + s.taxTotal())
      },

      // --- Hold / recall ---
      hold: () =>
        set((state) => {
          if (state.items.length === 0) return state
          const entry = {
            id: state.items.map((i) => i.id).join('-') + ':' + state.items.length,
            label: `${state.items.length} item(s) · ${state.customer?.name ?? 'Walk-in'}`,
            items: state.items,
            customer: state.customer,
            discount: state.discount,
          }
          return {
            held: [...state.held, entry],
            items: [],
            customer: null,
            discount: 0,
          }
        }),

      recall: (id) =>
        set((state) => {
          const entry = state.held.find((h) => h.id === id)
          if (!entry) return state
          return {
            items: entry.items,
            customer: entry.customer,
            discount: entry.discount,
            held: state.held.filter((h) => h.id !== id),
          }
        }),

      dropHeld: (id) =>
        set((state) => ({ held: state.held.filter((h) => h.id !== id) })),
    }),
    { name: 'swiftpos-cart' }
  )
)
