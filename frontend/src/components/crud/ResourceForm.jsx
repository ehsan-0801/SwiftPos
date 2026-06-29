import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

const inputCls =
  'h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(45,107,228,0.15)]'

/**
 * Generic add/edit form driven by a `fields` schema:
 *   { name, label, type?, options?, required?, step?, full? }
 * type: text | number | email | textarea | select | checkbox | date
 * `submit(payload)` should return a promise; 422 errors are shown per field.
 */
export default function ResourceForm({ open, onClose, record, fields, title, submit, onSaved }) {
  const isEdit = Boolean(record)
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setErrors({})
    const init = {}
    for (const f of fields) {
      const val = record?.[f.name]
      init[f.name] =
        val ?? (f.type === 'checkbox' ? (f.default ?? false) : f.default ?? '')
    }
    setForm(init)
  }, [open, record, fields])

  const set = (name, type) => (e) => {
    const value = type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const payload = { ...form }
    for (const f of fields) {
      if (f.type === 'select' && payload[f.name] === '') payload[f.name] = null
    }
    try {
      await submit(payload)
      onSaved?.()
      onClose()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <label key={f.name} className={f.full || f.type === 'textarea' ? 'col-span-2 block' : 'block'}>
              {f.type !== 'checkbox' && (
                <span className="mb-1 block text-sm font-medium">{f.label}</span>
              )}
              {f.type === 'select' ? (
                <select className={inputCls} value={form[f.name] ?? ''} onChange={set(f.name)}>
                  <option value="">—</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  className={`${inputCls} h-20 py-2`}
                  value={form[f.name] ?? ''}
                  onChange={set(f.name)}
                />
              ) : f.type === 'checkbox' ? (
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form[f.name])}
                    onChange={set(f.name, 'checkbox')}
                  />
                  {f.label}
                </span>
              ) : (
                <input
                  type={f.type ?? 'text'}
                  step={f.step}
                  className={inputCls}
                  value={form[f.name] ?? ''}
                  onChange={set(f.name)}
                />
              )}
              {errors[f.name] && (
                <span className="mt-1 block text-xs text-danger">{errors[f.name][0]}</span>
              )}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
