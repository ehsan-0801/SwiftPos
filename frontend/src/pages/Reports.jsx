import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { reportsApi } from '@/services/reports'

const REPORTS = [
  { key: 'sales', label: 'Sales', dated: true },
  { key: 'profit', label: 'Profit & Loss', dated: true },
  { key: 'stock', label: 'Stock', dated: false },
  { key: 'low-stock', label: 'Low Stock', dated: false },
  { key: 'purchases', label: 'Purchases', dated: true },
  { key: 'expenses', label: 'Expenses', dated: true },
  { key: 'customer-due', label: 'Customer Due', dated: false },
  { key: 'supplier-due', label: 'Supplier Due', dated: false },
  { key: 'top-products', label: 'Top Products', dated: false },
  { key: 'cashier', label: 'Cashier Performance', dated: true },
]

export default function Reports() {
  const [report, setReport] = useState('sales')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [downloading, setDownloading] = useState(false)

  const current = REPORTS.find((r) => r.key === report)
  const params = current.dated ? { from, to } : {}

  const { data, isFetching } = useQuery({
    queryKey: ['report', report, params],
    queryFn: () => reportsApi.get(report, params),
  })

  const download = async (format) => {
    setDownloading(true)
    try {
      await reportsApi.download(report, format, params)
    } catch {
      toast.error('Export failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-white p-4">
        <label className="text-sm">
          <span className="mb-1 block text-text-secondary">Report</span>
          <select value={report} onChange={(e) => setReport(e.target.value)} className="h-10 rounded-md border border-border px-3 text-sm">
            {REPORTS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </label>
        {current.dated && (
          <>
            <label className="text-sm">
              <span className="mb-1 block text-text-secondary">From</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-md border border-border px-3 text-sm" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-text-secondary">To</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-md border border-border px-3 text-sm" />
            </label>
          </>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" disabled={downloading} onClick={() => download('pdf')}>Export PDF</Button>
          <Button variant="secondary" disabled={downloading} onClick={() => download('excel')}>Export Excel</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-base text-left text-text-secondary">
              {data?.columns?.map((c) => <th key={c} className="px-4 py-3 font-semibold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr><td className="px-4 py-8 text-center text-text-secondary" colSpan={data?.columns?.length || 1}>Loading…</td></tr>
            ) : (data?.rows ?? []).length === 0 ? (
              <tr><td className="px-4 py-8 text-center text-text-secondary" colSpan={data?.columns?.length || 1}>No records.</td></tr>
            ) : (
              data.rows.map((row, i) => (
                <tr key={i} className="border-t border-border hover:bg-bg-base">
                  {row.map((cell, j) => <td key={j} className="px-4 py-3">{cell}</td>)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data?.summary && (
        <div className="flex flex-wrap gap-6 rounded-lg border border-border bg-white p-4 text-sm">
          {Object.entries(data.summary).map(([k, v]) => (
            <div key={k}>
              <span className="text-text-secondary">{k}: </span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
