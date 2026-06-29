import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCartStore } from '@/stores/cartStore'
import { productsApi } from '@/services/products'
import { salesApi } from '@/services/sales'
import { formatCurrency } from '@/utils/format'
import Button from '@/components/ui/Button'
import PaymentModal from '@/components/pos/PaymentModal'
import ReceiptPreview from '@/components/pos/ReceiptPreview'
import CustomerPicker from '@/components/pos/CustomerPicker'

export default function Pos() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const searchRef = useRef(null)

  const {
    items, addItem, updateQty, removeItem, clear,
    subtotal, taxTotal, total, discount,
    held, hold, recall, dropHeld,
    customer, setCustomer,
  } = useCartStore()

  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [payOpen, setPayOpen] = useState(false)
  const [custOpen, setCustOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [recent, setRecent] = useState([])

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250)
    return () => clearTimeout(t)
  }, [query])

  const { data: products = [], isFetching } = useQuery({
    queryKey: ['pos-search', debounced],
    queryFn: () => productsApi.search(debounced),
  })

  const totalDue = total()

  const charge = async ({ method, paid }) => {
    setSubmitting(true)
    try {
      const sale = await salesApi.create({
        customer_id: useCartStore.getState().customer?.id ?? null,
        items: items.map((i) => ({
          product_id: i.id,
          qty: i.qty,
          price: i.price,
          discount: i.discount,
        })),
        discount,
        paid,
        payment_method: method,
      })
      const receiptData = await salesApi.receipt(sale.id)
      setReceipt(receiptData)
      setRecent((r) => [sale, ...r].slice(0, 3))
      clear()
      setPayOpen(false)
      queryClient.invalidateQueries({ queryKey: ['pos-search'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`Sale ${sale.invoice_no} completed`)
    } catch {
      /* interceptor toasts the error */
    } finally {
      setSubmitting(false)
    }
  }

  // Keyboard shortcuts (spec §3.2).
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      switch (e.key) {
        case 'F1':
          e.preventDefault()
          searchRef.current?.focus()
          break
        case 'F2':
          if (items.length) {
            e.preventDefault()
            setPayOpen(true)
          }
          break
        case 'F3':
          if (items.length) {
            e.preventDefault()
            hold()
            toast('Sale held')
          }
          break
        case 'F4':
          if (held.length) {
            e.preventDefault()
            recall(held[held.length - 1].id)
          }
          break
        case 'F5':
          if (tag !== 'INPUT') {
            e.preventDefault()
            clear()
          }
          break
        case 'F8':
          e.preventDefault()
          setCustOpen(true)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items.length, held, hold, recall, clear])

  return (
    <div className="flex h-screen flex-col bg-bg-base">
      {/* Transaction ticker (spec §6.1) */}
      <div className="flex h-9 items-center gap-4 overflow-hidden bg-bg-sidebar px-4 text-xs text-text-sidebar">
        <span className="font-medium text-white">Recent</span>
        {recent.length === 0 ? (
          <span>— no completed sales yet —</span>
        ) : (
          recent.map((s) => (
            <span key={s.id} className="animate-[fadeIn_.3s_ease] whitespace-nowrap">
              {s.invoice_no} · {formatCurrency(s.total)}
            </span>
          ))
        )}
        <button
          onClick={() => navigate('/')}
          className="ml-auto text-text-sidebar hover:text-white"
        >
          Exit POS →
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Product panel */}
        <section className="flex w-3/5 flex-col border-r border-border p-4">
          <input
            ref={searchRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product / scan barcode  (F1)"
            className="mb-4 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary"
          />
          <div className="grid grid-cols-3 gap-3 overflow-auto xl:grid-cols-4">
            {products.length === 0 && !isFetching && (
              <div className="col-span-full mt-8 text-center text-sm text-text-secondary">
                No products found
              </div>
            )}
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addItem(p)}
                disabled={p.stock <= 0}
                className="flex min-h-[110px] flex-col justify-between rounded-md border border-border bg-white p-3 text-left transition hover:border-t-2 hover:border-t-primary hover:shadow-[var(--shadow-md)] disabled:opacity-40"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <div>
                  <div className="font-bold">{formatCurrency(p.price)}</div>
                  <div className="text-xs text-text-secondary">
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Cart panel */}
        <section className="flex w-2/5 flex-col bg-white">
          {/* Held sales bar */}
          {held.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-border bg-bg-base px-4 py-2">
              {held.map((h) => (
                <span
                  key={h.id}
                  className="flex items-center gap-1 rounded-sm bg-white px-2 py-1 text-xs shadow-[var(--shadow-sm)]"
                >
                  <button className="text-primary" onClick={() => recall(h.id)}>
                    {h.label}
                  </button>
                  <button className="text-danger" onClick={() => dropHeld(h.id)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setCustOpen(true)}
            className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left text-sm hover:bg-bg-base"
          >
            <span className="text-text-secondary">Customer (F8)</span>
            <span className="font-medium">
              {customer ? `${customer.name}${customer.phone ? ` · ${customer.phone}` : ''}` : 'Walk-in ▾'}
            </span>
          </button>

          <div className="flex-1 overflow-auto">
            {items.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-text-secondary">
                Cart is empty
              </div>
            ) : (
              items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-2 border-b border-border px-4 py-2 text-sm"
                >
                  <div className="flex-1">
                    <div>{i.name}</div>
                    <div className="text-xs text-text-secondary">
                      {formatCurrency(i.price)}
                      {i.tax_rate > 0 && ` · ${i.tax_rate}% tax`}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={i.qty}
                    onChange={(e) => updateQty(i.id, Number(e.target.value))}
                    className="h-8 w-14 rounded border border-border px-2 text-center"
                  />
                  <div className="w-20 text-right font-medium">
                    {formatCurrency(i.price * i.qty)}
                  </div>
                  <button
                    onClick={() => removeItem(i.id)}
                    className="text-danger"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-4">
            <Line label="Subtotal" value={formatCurrency(subtotal())} />
            {discount > 0 && <Line label="Discount" value={`-${formatCurrency(discount)}`} />}
            <Line label="Tax" value={formatCurrency(taxTotal())} />
            <div className="my-2 flex justify-between text-lg font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(totalDue)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  hold()
                  toast('Sale held')
                }}
                disabled={items.length === 0}
                className="flex-1"
              >
                Hold (F3)
              </Button>
              <Button
                variant="secondary"
                onClick={clear}
                disabled={items.length === 0}
                className="flex-1"
              >
                Clear (F5)
              </Button>
            </div>
            <Button
              onClick={() => setPayOpen(true)}
              disabled={items.length === 0}
              className="mt-2 w-full py-3 text-base"
            >
              💳 Charge {formatCurrency(totalDue)} (F2)
            </Button>
          </div>
        </section>
      </div>

      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        total={totalDue}
        onConfirm={charge}
        submitting={submitting}
      />
      <ReceiptPreview
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        data={receipt}
      />
      <CustomerPicker
        open={custOpen}
        onClose={() => setCustOpen(false)}
        onSelect={setCustomer}
      />
    </div>
  )
}

function Line({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-text-secondary">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
