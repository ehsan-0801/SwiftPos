import { useState } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import ResourceForm from '@/components/crud/ResourceForm'

/**
 * Reusable list+CRUD page. Provide:
 *   title, queryKey, service {list,create,update,remove}, columns, fields,
 *   singular (label for the entity), searchPlaceholder, canManage (bool).
 * `columns` may include an 'actions' column auto-appended when canManage.
 */
export default function CrudPage({
  title,
  queryKey,
  service,
  columns,
  fields,
  singular = 'record',
  searchPlaceholder = 'Search…',
  canManage = true,
  extraActions,
}) {
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey, { q, page }],
    queryFn: () => service.list({ q, page, per_page: 20 }),
    placeholderData: keepPreviousData,
  })

  const rows = data?.data ?? []
  const meta = data?.meta
  const refresh = () => queryClient.invalidateQueries({ queryKey: [queryKey] })

  const onDelete = async (row) => {
    if (!window.confirm(`Delete this ${singular}?`)) return
    try {
      await service.remove(row.id)
      toast.success(`${singular} deleted`)
      refresh()
    } catch {
      /* interceptor toasts */
    }
  }

  const allColumns = canManage
    ? [
        ...columns,
        {
          key: 'actions',
          label: '',
          render: (r) => (
            <div className="flex justify-end gap-3 text-sm">
              <button className="text-primary" onClick={() => { setEditing(r); setOpen(true) }}>
                Edit
              </button>
              <button className="text-danger" onClick={() => onDelete(r)}>
                Delete
              </button>
            </div>
          ),
        },
      ]
    : columns

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder}
            className="h-10 w-64 rounded-md border border-border px-3 text-sm outline-none focus:border-primary"
          />
          {extraActions}
          {canManage && (
            <Button onClick={() => { setEditing(null); setOpen(true) }}>+ Add</Button>
          )}
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-border bg-white p-8 text-center text-sm text-danger">
          Failed to load.
        </div>
      ) : (
        <DataTable
          columns={allColumns}
          rows={rows}
          emptyText={isLoading ? 'Loading…' : `No ${singular}s found.`}
        />
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Showing {meta.from}–{meta.to} of {meta.total}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </Button>
            <Button variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {canManage && (
        <ResourceForm
          open={open}
          onClose={() => setOpen(false)}
          record={editing}
          fields={fields}
          title={editing ? `Edit ${title}` : `Add ${title}`}
          submit={(payload) =>
            editing ? service.update(editing.id, payload) : service.create(payload)
          }
          onSaved={() => {
            toast.success(editing ? `${singular} updated` : `${singular} created`)
            refresh()
          }}
        />
      )}
    </div>
  )
}
