import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/utils/format'

const METHODS = [
  { key: 'cash', label: 'Cash' },
  { key: 'card', label: 'Card' },
  { key: 'bkash', label: 'bKash' },
  { key: 'nagad', label: 'Nagad' },
]

/**
 * Payment modal (spec §7.3). Cash shows tendered + change; other methods
 * assume exact payment. Calls onConfirm({ method, paid }).
 */
export default function PaymentModal({ open, onClose, total, onConfirm, submitting }) {
  const [method, setMethod] = useState('cash')
  const [tendered, setTendered] = useState('')

  useEffect(() => {
    if (open) {
      setMethod('cash')
      setTendered(String(total.toFixed(2)))
    }
  }, [open, total])

  const paid = method === 'cash' ? Number(tendered || 0) : total
  const change = useMemo(() => Math.max(0, paid - total), [paid, total])

  const confirm = () => onConfirm({ method, paid })

  return (
    <Modal open={open} onClose={onClose} title="Complete Payment" width="max-w-md">
      <div className="space-y-4">
        <div className="rounded-md bg-bg-base p-4 text-center">
          <div className="text-sm text-text-secondary">Total Due</div>
          <div className="text-3xl font-bold">{formatCurrency(total)}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key)}
              className={`rounded-md border py-2 text-sm font-medium transition ${
                method === m.key
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border text-text-secondary hover:bg-bg-base'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method === 'cash' && (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Amount Tendered</span>
              <input
                type="number"
                step="0.01"
                autoFocus
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
                className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <div className="flex justify-between text-lg">
              <span className="text-text-secondary">Change</span>
              <span className="font-bold">{formatCurrency(change)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={submitting || (method === 'cash' && paid < total)}
          >
            {submitting ? 'Processing…' : 'Confirm Payment (F2)'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
