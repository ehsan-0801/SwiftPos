import { useState } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import PurchaseFormModal from '@/components/purchases/PurchaseFormModal'
import { purchasesApi } from '@/services/purchases'
import { useCan } from '@/hooks/useCan'
import { formatCurrency } from '@/utils/format'

const TONE = { paid: 'paid', partial: 'partial', due: 'due' }

export default function Purchases() {
  const queryClient = useQueryClient()
  const canCreate = useCan('create-purchase')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', { page }],
    queryFn: () => purchasesApi.list({ page, per_page: 20 }),
    placeholderData: keepPreviousData,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const columns = [
    { key: 'reference_no', label: 'Reference', render: (r) => <span className="font-mono text-text-secondary">{r.reference_no}</span> },
    { key: 'supplier', label: 'Supplier', render: (r) => r.supplier ?? '—' },
    { key: 'total', label: 'Total', render: (r) => formatCurrency(r.total) },
    { key: 'paid', label: 'Paid', render: (r) => formatCurrency(r.paid) },
    { key: 'payment_status', label: 'Status', render: (r) => <Badge tone={TONE[r.payment_status]}>{r.payment_status}</Badge> },
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Purchases</h1>
        {canCreate && <Button onClick={() => setOpen(true)}>+ New Purchase</Button>}
      </div>

      <DataTable columns={columns} rows={rows} emptyText={isLoading ? 'Loading…' : 'No purchases yet.'} />

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Showing {meta.from}–{meta.to} of {meta.total}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
            <Button variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next →</Button>
          </div>
        </div>
      )}

      <PurchaseFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['purchases'] })
          queryClient.invalidateQueries({ queryKey: ['products'] })
        }}
      />
    </div>
  )
}
