import { formatCurrency } from '@/utils/format'

const stats = [
  { label: 'Sales Today', value: 0, accent: 'var(--color-primary)' },
  { label: 'Profit Today', value: 0, accent: 'var(--color-success)' },
  { label: 'Expenses Today', value: 0, accent: 'var(--color-warning)' },
  { label: 'Low Stock Items', value: 0, accent: 'var(--color-danger)', count: true },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border-l-4 bg-white p-5 shadow-[var(--shadow-sm)]"
            style={{ borderColor: s.accent }}
          >
            <div className="text-3xl font-bold">
              {s.count ? s.value : formatCurrency(s.value)}
            </div>
            <div className="mt-1 text-sm text-text-secondary">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-lg font-semibold">Sales Trend</h2>
          <div className="grid h-56 place-items-center text-sm text-text-secondary">
            Chart wired up in the Dashboard build step (Recharts).
          </div>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-lg font-semibold">Top Products</h2>
          <div className="grid h-56 place-items-center text-sm text-text-secondary">
            Chart wired up in the Dashboard build step (Recharts).
          </div>
        </div>
      </div>
    </div>
  )
}
