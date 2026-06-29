import { useState } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import ReceiptPreview from '@/components/pos/ReceiptPreview'
import { salesApi } from '@/services/sales'
import { useCan } from '@/hooks/useCan'
import { formatCurrency } from '@/utils/format'

const STATUS_TONE = { paid: 'paid', partial: 'partial', due: 'due' }

export default function Sales() {
  const queryClient = useQueryClient()
  const canReturn = useCan('return-sales')
  const [filters, setFilters] = useState({ from: '', to: '', payment_status: '' })
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['sales', { ...filters, page }],
    queryFn: () => salesApi.list({ ...filters, page, per_page: 20 }),
    placeholderData: keepPreviousData,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const openDetail = async (id) => {
    setBusy(true)
    try { setDetail(await salesApi.get(id)) } finally { setBusy(false) }
  }

  const reprint = async (id) => {
    setBusy(true)
    try { setReceipt(await salesApi.receipt(id)) } finally { setBusy(false) }
  }

  const doReturn = async (sale) => {
    if (!window.confirm(`Return sale ${sale.invoice_no}? Stock will be restored.`)) return
    setBusy(true)
    try {
      await salesApi.return(sale.id)
      toast.success('Sale returned')
      setDetail(null)
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    } catch {
      /* interceptor toasts */
    } finally { setBusy(false) }
  }

  const setF = (k) => (e) => { setFilters((f) => ({ ...f, [k]: e.target.value })); setPage(1) }

  const columns = [
    { key: 'invoice_no', label: 'Invoice', render: (r) => <span className="font-mono text-text-secondary">{r.invoice_no}</span> },
    { key: 'customer', label: 'Customer', render: (r) => r.customer ?? 'Walk-in' },
    { key: 'cashier', label: 'Cashier' },
    { key: 'total', label: 'Total', render: (r) => formatCurrency(r.total) },
    { key: 'payment_status', label: 'Payment', render: (r) => <Badge tone={STATUS_TONE[r.payment_status]}>{r.payment_status}</Badge> },
    { key: 'sale_status', label: 'Status', render: (r) => r.sale_status === 'returned' ? <Badge tone="inactive">returned</Badge> : <Badge tone="active">{r.sale_status}</Badge> },
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { key: 'actions', label: '', render: (r) => <button className="text-primary text-sm" onClick={() => openDetail(r.id)}>View</button> },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Sales History</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-white p-4">
        <label className="text-sm">
          <span className="mb-1 block text-text-secondary">From</span>
          <input type="date" value={filters.from} onChange={setF('from')} className="h-10 rounded-md border border-border px-3 text-sm" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-text-secondary">To</span>
          <input type="date" value={filters.to} onChange={setF('to')} className="h-10 rounded-md border border-border px-3 text-sm" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-text-secondary">Payment</span>
          <select value={filters.payment_status} onChange={setF('payment_status')} className="h-10 rounded-md border border-border px-3 text-sm">
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="due">Due</option>
          </select>
        </label>
      </div>

      <DataTable columns={columns} rows={rows} emptyText={isLoading ? 'Loading…' : 'No sales found.'} />

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Showing {meta.from}–{meta.to} of {meta.total}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
            <Button variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next →</Button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail ? `Sale ${detail.invoice_no}` : ''} width="max-w-lg">
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>{detail.customer ?? 'Walk-in'} · {detail.cashier}</span>
              <span>{new Date(detail.created_at).toLocaleString()}</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-text-secondary"><th>Item</th><th className="text-right">Qty</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody>
                {detail.items?.map((i, idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="py-1">{i.name}</td>
                    <td className="py-1 text-right">{i.qty}</td>
                    <td className="py-1 text-right">{formatCurrency(i.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border pt-2">
              <Row label="Subtotal" value={formatCurrency(detail.subtotal)} />
              {detail.discount > 0 && <Row label="Discount" value={`-${formatCurrency(detail.discount)}`} />}
              <Row label="Tax" value={formatCurrency(detail.tax)} />
              <Row label="Total" value={formatCurrency(detail.total)} bold />
              <Row label="Paid" value={formatCurrency(detail.paid)} />
              <Row label="Change" value={formatCurrency(detail.change)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {canReturn && detail.sale_status !== 'returned' && (
                <Button variant="danger" disabled={busy} onClick={() => doReturn(detail)}>Return</Button>
              )}
              <Button variant="secondary" disabled={busy} onClick={() => reprint(detail.id)}>Reprint</Button>
              <Button onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <ReceiptPreview open={Boolean(receipt)} onClose={() => setReceipt(null)} data={receipt} />
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold' : 'text-text-secondary'}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
