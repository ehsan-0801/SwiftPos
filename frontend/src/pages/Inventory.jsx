import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import CatalogManager from '@/components/inventory/CatalogManager'
import { productsApi } from '@/services/products'
import { stockApi } from '@/services/inventory'
import { useCan } from '@/hooks/useCan'
import { formatCurrency } from '@/utils/format'

export default function Inventory() {
  const queryClient = useQueryClient()
  const canAdjust = useCan('adjust-stock')
  const canManage = useCan('manage-products')
  const fileRef = useRef(null)

  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState(null)
  const [type, setType] = useState('in')
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')

  const { data: results = [] } = useQuery({
    queryKey: ['inv-search', search],
    queryFn: () => productsApi.search(search),
    enabled: search.length > 0,
  })
  const { data: lowStock = [] } = useQuery({ queryKey: ['low-stock'], queryFn: stockApi.lowStock })

  const refreshStock = () => {
    queryClient.invalidateQueries({ queryKey: ['low-stock'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const submitAdjust = async () => {
    if (!picked || !qty) return toast.error('Pick a product and quantity')
    try {
      const res = await stockApi.adjust({ product_id: picked.id, type, qty: Number(qty), reason })
      toast.success(`Stock updated → ${res.stock}`)
      setPicked(null); setQty(''); setReason(''); setSearch('')
      refreshStock()
    } catch { /* toasts */ }
  }

  const onImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await stockApi.importProducts(file)
      toast.success('Products imported')
      refreshStock()
    } catch { /* toasts */ } finally { if (fileRef.current) fileRef.current.value = '' }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Inventory</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Stock adjustment */}
        {canAdjust && (
          <div className="rounded-lg border border-border bg-white p-4">
            <h3 className="mb-3 font-semibold">Stock Adjustment</h3>
            {picked ? (
              <div className="mb-2 flex items-center justify-between rounded-md bg-bg-base px-3 py-2 text-sm">
                <span>{picked.name} <span className="text-text-secondary">· {picked.stock} in stock</span></span>
                <button className="text-danger" onClick={() => setPicked(null)}>change</button>
              </div>
            ) : (
              <div className="relative mb-2">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product…" className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary" />
                {search && results.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-44 w-full overflow-auto rounded-md border border-border bg-white shadow-[var(--shadow-md)]">
                    {results.map((p) => (
                      <button key={p.id} onClick={() => { setPicked(p); setSearch('') }} className="block w-full px-3 py-2 text-left text-sm hover:bg-bg-base">{p.name}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-md border border-border px-3 text-sm">
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>
              <input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" className="h-10 w-24 rounded-md border border-border px-3 text-sm" />
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="h-10 flex-1 rounded-md border border-border px-3 text-sm" />
            </div>
            <Button onClick={submitAdjust} className="mt-3 w-full">Apply Adjustment</Button>
          </div>
        )}

        {/* Import */}
        {canManage && (
          <div className="rounded-lg border border-border bg-white p-4">
            <h3 className="mb-3 font-semibold">Bulk Import Products</h3>
            <p className="mb-3 text-sm text-text-secondary">
              Upload an Excel/CSV with columns: name, sku, barcode, category, brand, unit, price, cost, stock, alert_qty.
            </p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={onImport} className="text-sm" />
          </div>
        )}
      </div>

      {/* Low stock */}
      <div className="rounded-lg border border-border bg-white p-4">
        <h3 className="mb-3 font-semibold">Low Stock ({lowStock.length})</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-text-secondary"><th className="py-2">Product</th><th>SKU</th><th className="text-right">Stock</th><th className="text-right">Alert at</th></tr></thead>
          <tbody>
            {lowStock.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-2">{p.name}</td>
                <td className="font-mono text-text-secondary">{p.sku ?? '—'}</td>
                <td className="text-right"><Badge tone="warning">{p.stock}</Badge></td>
                <td className="text-right text-text-secondary">{p.alert_qty}</td>
              </tr>
            ))}
            {lowStock.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-text-secondary">All stocked up 🎉</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Catalog management */}
      {canManage && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Catalog</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CatalogManager kind="categories" title="Categories" fields={[{ name: 'name', label: 'Name' }]} />
            <CatalogManager kind="brands" title="Brands" fields={[{ name: 'name', label: 'Name' }]} />
            <CatalogManager kind="units" title="Units" fields={[{ name: 'name', label: 'Name' }, { name: 'short_name', label: 'Short' }]} />
            <CatalogManager kind="taxes" title="Taxes" fields={[{ name: 'name', label: 'Name' }, { name: 'rate', label: 'Rate %', type: 'number' }]} />
          </div>
        </div>
      )}
    </div>
  )
}
