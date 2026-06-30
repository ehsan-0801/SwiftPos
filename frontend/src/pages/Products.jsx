import { useState } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ProductFormModal from '@/components/products/ProductFormModal'
import { productsApi } from '@/services/products'
import { formatCurrency } from '@/utils/format'

export default function Products() {
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { q, page }],
    queryFn: () => productsApi.list({ q, page, per_page: 20 }),
    placeholderData: keepPreviousData,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['products'] })

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (product) => {
    setEditing(product)
    setModalOpen(true)
  }

  const onDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    try {
      await productsApi.remove(product.id)
      toast.success('Product deleted')
      refresh()
    } catch {
      /* interceptor toasts the error */
    }
  }

  // Serial number — a positional row count (not the database id),
  // continuous across pages via the pagination offset.
  const serialBase = meta?.from ?? 1

  const columns = [
    {
      key: 'serial',
      label: '#',
      render: (_r, i) => (
        <span className="text-text-secondary">{serialBase + i}</span>
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'sku',
      label: 'SKU',
      render: (r) => <span className="font-mono text-text-secondary">{r.sku ?? '—'}</span>,
    },
    { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    {
      key: 'stock',
      label: 'Stock',
      render: (r) => (
        <span className="flex items-center gap-2">
          {r.stock}
          {r.low_stock && <Badge tone="warning">Low</Badge>}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (r) =>
        r.is_active ? <Badge tone="active">Active</Badge> : <Badge>Inactive</Badge>,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex justify-end gap-3 text-sm">
          <button className="text-primary" onClick={() => openEdit(r)}>
            Edit
          </button>
          <button className="text-danger" onClick={() => onDelete(r)}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="Search name, SKU, barcode…"
            className="h-10 w-64 rounded-md border border-border px-3 text-sm outline-none focus:border-primary"
          />
          <Button onClick={openCreate}>+ Add Product</Button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-border bg-white p-8 text-center text-sm text-danger">
          Failed to load products.
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyText={isLoading ? 'Loading…' : 'No products found.'}
        />
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Showing {meta.from}–{meta.to} of {meta.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
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

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editing}
        onSaved={refresh}
      />
    </div>
  )
}
