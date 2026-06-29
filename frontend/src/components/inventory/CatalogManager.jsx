import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { catalogApi } from '@/services/inventory'

/**
 * Compact inline CRUD for a lookup type (categories/brands/units/taxes).
 * `fields` = [{ name, label, type? }]; the first field is the primary label.
 */
export default function CatalogManager({ kind, title, fields }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState({})
  const { data: items = [] } = useQuery({ queryKey: [kind], queryFn: () => catalogApi.list(kind) })

  const refresh = () => queryClient.invalidateQueries({ queryKey: [kind] })

  const add = async () => {
    if (!draft[fields[0].name]) return
    try {
      await catalogApi.create(kind, draft)
      setDraft({})
      refresh()
      toast.success(`${title} added`)
    } catch { /* toasts */ }
  }
  const remove = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    try { await catalogApi.remove(kind, id); refresh() } catch { /* toasts */ }
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="mb-3 max-h-40 space-y-1 overflow-auto">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-bg-base">
            <span>{fields.map((f) => it[f.name]).filter(Boolean).join(' · ')}</span>
            <button className="text-danger" onClick={() => remove(it.id)}>×</button>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-text-secondary">None yet</div>}
      </div>
      <div className="flex gap-2">
        {fields.map((f) => (
          <input
            key={f.name}
            type={f.type ?? 'text'}
            placeholder={f.label}
            value={draft[f.name] ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))}
            className="h-9 w-full rounded-md border border-border px-2 text-sm outline-none focus:border-primary"
          />
        ))}
        <button onClick={add} className="rounded-md bg-primary px-3 text-sm font-medium text-white">Add</button>
      </div>
    </div>
  )
}
