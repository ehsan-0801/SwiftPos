import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { productsApi } from '@/services/products'
import { suppliersApi } from '@/services/suppliers'
import { purchasesApi } from '@/services/purchases'
import { formatCurrency } from '@/utils/format'

const inputCls = 'h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary'

export default function PurchaseFormModal({ open, onClose, onSaved }) {
  const [supplierId, setSupplierId] = useState('')
  const [lines, setLines] = useState([])
  const [search, setSearch] = useState('')
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [paid, setPaid] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setSupplierId(''); setLines([]); setSearch(''); setDiscount(0); setTax(0); setPaid(0) }
  }, [open])

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: () => suppliersApi.list({ per_page: 100 }),
    enabled: open,
  })
  const { data: results = [] } = useQuery({
    queryKey: ['purchase-product-search', search],
    queryFn: () => productsApi.search(search),
    enabled: open && search.length > 0,
  })

  const addLine = (p) => {
    setSearch('')
    setLines((ls) => {
      const existing = ls.find((l) => l.product_id === p.id)
      if (existing) return ls.map((l) => l.product_id === p.id ? { ...l, qty: l.qty + 1 } : l)
      return [...ls, { product_id: p.id, name: p.name, qty: 1, cost: Number(p.cost) || 0 }]
    })
  }
  const setLine = (id, key, val) =>
    setLines((ls) => ls.map((l) => (l.product_id === id ? { ...l, [key]: Number(val) } : l)))
  const removeLine = (id) => setLines((ls) => ls.filter((l) => l.product_id !== id))

  const subtotal = lines.reduce((s, l) => s + l.qty * l.cost, 0)
  const total = Math.max(0, subtotal - Number(discount) + Number(tax))

  const submit = async () => {
    if (lines.length === 0) return toast.error('Add at least one item')
    setSaving(true)
    try {
      await purchasesApi.create({
        supplier_id: supplierId || null,
        items: lines.map((l) => ({ product_id: l.product_id, qty: l.qty, cost: l.cost })),
        discount: Number(discount), tax: Number(tax), paid: Number(paid),
      })
      toast.success('Purchase recorded, stock updated')
      onSaved?.()
      onClose()
    } catch {
      /* interceptor toasts */
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Purchase" width="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Supplier</span>
            <select className={inputCls} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">—</option>
              {suppliers?.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="relative block">
            <span className="mb-1 block text-sm font-medium">Add product</span>
            <input className={inputCls} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
            {search && results.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-white shadow-[var(--shadow-md)]">
                {results.map((p) => (
                  <button key={p.id} type="button" onClick={() => addLine(p)} className="block w-full px-3 py-2 text-left text-sm hover:bg-bg-base">
                    {p.name} <span className="text-text-secondary">· cost {formatCurrency(p.cost)}</span>
                  </button>
                ))}
              </div>
            )}
          </label>
        </div>

        <div className="rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-base text-left text-text-secondary">
                <th className="px-3 py-2">Product</th><th className="px-3 py-2 w-24">Qty</th>
                <th className="px-3 py-2 w-28">Cost</th><th className="px-3 py-2 w-24 text-right">Total</th><th></th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-text-secondary">No items yet</td></tr>
              ) : lines.map((l) => (
                <tr key={l.product_id} className="border-t border-border">
                  <td className="px-3 py-2">{l.name}</td>
                  <td className="px-3 py-2"><input type="number" min="0" value={l.qty} onChange={(e) => setLine(l.product_id, 'qty', e.target.value)} className="h-8 w-20 rounded border border-border px-2" /></td>
                  <td className="px-3 py-2"><input type="number" min="0" step="0.01" value={l.cost} onChange={(e) => setLine(l.product_id, 'cost', e.target.value)} className="h-8 w-24 rounded border border-border px-2" /></td>
                  <td className="px-3 py-2 text-right">{formatCurrency(l.qty * l.cost)}</td>
                  <td className="px-3 py-2 text-right"><button className="text-danger" onClick={() => removeLine(l.product_id)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className="block"><span className="mb-1 block text-sm font-medium">Discount</span><input type="number" min="0" step="0.01" className={inputCls} value={discount} onChange={(e) => setDiscount(e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">Tax</span><input type="number" min="0" step="0.01" className={inputCls} value={tax} onChange={(e) => setTax(e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">Paid</span><input type="number" min="0" step="0.01" className={inputCls} value={paid} onChange={(e) => setPaid(e.target.value)} /></label>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-lg font-bold">Total: {formatCurrency(total)}</span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Record Purchase'}</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
