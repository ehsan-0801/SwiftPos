import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { auditApi } from '@/services/admin'

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'auth.login', label: 'Login' },
  { value: 'auth.logout', label: 'Logout' },
  { value: 'sale.created', label: 'Sale created' },
  { value: 'sale.returned', label: 'Sale returned' },
  { value: 'purchase.created', label: 'Purchase created' },
  { value: 'stock.adjusted', label: 'Stock adjusted' },
]

const TONE = {
  'auth.login': 'active',
  'auth.logout': 'inactive',
  'sale.created': 'paid',
  'sale.returned': 'due',
  'purchase.created': 'active',
  'stock.adjusted': 'warning',
}

const inputCls =
  'h-10 rounded-md border border-border px-3 text-sm outline-none focus:border-primary'

export default function AuditLog() {
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', { action, from, to, page }],
    queryFn: () => auditApi.list({ action, from, to, page, per_page: 30 }),
    placeholderData: keepPreviousData,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const resetPageAnd = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const columns = [
    {
      key: 'created_at',
      label: 'When',
      render: (r) => (
        <span className="whitespace-nowrap text-text-secondary">
          {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (r) => <Badge tone={TONE[r.action] ?? 'inactive'}>{r.action}</Badge>,
    },
    { key: 'description', label: 'Description' },
    {
      key: 'user',
      label: 'User',
      render: (r) => r.user ?? '—',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Audit Log</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={action}
            onChange={resetPageAnd(setAction)}
            className={inputCls}
          >
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <input type="date" value={from} onChange={resetPageAnd(setFrom)} className={inputCls} />
          <input type="date" value={to} onChange={resetPageAnd(setTo)} className={inputCls} />
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-border bg-white p-8 text-center text-sm text-danger">
          Failed to load audit log.
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyText={isLoading ? 'Loading…' : 'No audit entries found.'}
        />
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Showing {meta.from}–{meta.to} of {meta.total}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </Button>
            <Button
              variant="secondary"
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
