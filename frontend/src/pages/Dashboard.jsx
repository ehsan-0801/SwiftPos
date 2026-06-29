import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { dashboardApi } from '@/services/dashboard'
import { formatCurrency } from '@/utils/format'

const STATUS_TONE = { paid: 'paid', partial: 'partial', due: 'due' }

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary,
  })

  const stats = [
    { label: "Today's Sales", value: formatCurrency(data?.sales_today), accent: 'var(--color-primary)' },
    { label: "Today's Profit", value: formatCurrency(data?.profit_today), accent: 'var(--color-success)' },
    { label: "Today's Expenses", value: formatCurrency(data?.expenses_today), accent: 'var(--color-warning)' },
    { label: 'Low Stock Items', value: data?.low_stock_count ?? 0, accent: 'var(--color-danger)', onClick: () => navigate('/products') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/pos')}>New Sale</Button>
          <Button variant="secondary" onClick={() => navigate('/products')}>Add Product</Button>
          <Button variant="secondary" onClick={() => navigate('/purchases')}>Add Purchase</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={s.onClick}
            className="rounded-lg border-l-4 bg-white p-5 text-left shadow-[var(--shadow-sm)] disabled:cursor-default"
            style={{ borderColor: s.accent }}
            disabled={!s.onClick}
          >
            <div className="text-3xl font-bold">{isLoading ? '…' : s.value}</div>
            <div className="mt-1 text-sm text-text-secondary">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-lg font-semibold">Sales Trend (30 days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data?.sales_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="total" stroke="#2D6BE4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-4 text-lg font-semibold">Top Products (by revenue)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.top_products ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#2D6BE4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-[var(--shadow-sm)]">
        <h2 className="mb-4 text-lg font-semibold">Recent Sales</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary">
              <th className="py-2">Invoice</th>
              <th>Customer</th>
              <th className="text-right">Total</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recent_sales ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="py-2 font-mono text-text-secondary">{s.invoice_no}</td>
                <td>{s.customer}</td>
                <td className="text-right">{formatCurrency(s.total)}</td>
                <td className="text-right">
                  <Badge tone={STATUS_TONE[s.payment_status]}>{s.payment_status}</Badge>
                </td>
              </tr>
            ))}
            {!isLoading && (data?.recent_sales ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-text-secondary">No sales yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
