import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { customersApi } from '@/services/customers'

/** Select a saved customer for the current sale, or reset to walk-in. */
export default function CustomerPicker({ open, onClose, onSelect }) {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250)
    return () => clearTimeout(t)
  }, [q])

  const { data: customers = [] } = useQuery({
    queryKey: ['pos-customers', debounced],
    queryFn: () => customersApi.search(debounced),
    enabled: open,
  })

  return (
    <Modal open={open} onClose={onClose} title="Select Customer" width="max-w-md">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or phone…"
        className="mb-3 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary"
      />
      <div className="max-h-72 overflow-auto rounded-md border border-border">
        <button
          onClick={() => { onSelect(null); onClose() }}
          className="block w-full border-b border-border px-3 py-2 text-left text-sm hover:bg-bg-base"
        >
          Walk-in customer
        </button>
        {customers.map((c) => (
          <button
            key={c.id}
            onClick={() => { onSelect(c); onClose() }}
            className="block w-full border-b border-border px-3 py-2 text-left text-sm hover:bg-bg-base"
          >
            <span className="font-medium">{c.name}</span>
            <span className="ml-2 text-text-secondary">{c.phone}</span>
          </button>
        ))}
        {customers.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-text-secondary">No matches</div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  )
}
