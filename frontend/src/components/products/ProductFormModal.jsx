import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { productsApi } from '@/services/products'

const EMPTY = {
  name: '',
  sku: '',
  barcode: '',
  category_id: '',
  brand_id: '',
  unit_id: '',
  tax_id: '',
  price: '',
  cost: '',
  stock: '0',
  alert_qty: '0',
  is_active: true,
}

const inputCls =
  'h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(45,107,228,0.15)]'

function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
}

/** Add/Edit product modal. `product` null = create mode. */
export default function ProductFormModal({ open, onClose, product, onSaved }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const { data: meta } = useQuery({
    queryKey: ['catalog-meta'],
    queryFn: productsApi.catalogMeta,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!open) return
    setErrors({})
    setForm(
      product
        ? {
            ...EMPTY,
            ...product,
            category_id: product.category_id ?? '',
            brand_id: product.brand_id ?? '',
            unit_id: product.unit_id ?? '',
            tax_id: product.tax_id ?? '',
          }
        : EMPTY
    )
  }, [open, product])

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    // Strip empty selects so they pass nullable validation.
    const payload = { ...form }
    ;['category_id', 'brand_id', 'unit_id', 'tax_id'].forEach((k) => {
      if (payload[k] === '') payload[k] = null
    })

    try {
      if (isEdit) {
        await productsApi.update(product.id, payload)
        toast.success('Product updated')
      } else {
        await productsApi.create(payload)
        toast.success('Product created')
      }
      onSaved?.()
      onClose()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {})
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      width="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" error={errors.name?.[0]}>
            <input className={inputCls} value={form.name} onChange={set('name')} />
          </Field>
          <Field label="SKU" error={errors.sku?.[0]}>
            <input className={inputCls} value={form.sku ?? ''} onChange={set('sku')} />
          </Field>
          <Field label="Barcode">
            <input
              className={inputCls}
              value={form.barcode ?? ''}
              onChange={set('barcode')}
            />
          </Field>
          <Field label="Category">
            <select
              className={inputCls}
              value={form.category_id}
              onChange={set('category_id')}
            >
              <option value="">—</option>
              {meta?.categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Brand">
            <select className={inputCls} value={form.brand_id} onChange={set('brand_id')}>
              <option value="">—</option>
              {meta?.brands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Unit">
            <select className={inputCls} value={form.unit_id} onChange={set('unit_id')}>
              <option value="">—</option>
              {meta?.units?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price" error={errors.price?.[0]}>
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={form.price}
              onChange={set('price')}
            />
          </Field>
          <Field label="Cost">
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={form.cost ?? ''}
              onChange={set('cost')}
            />
          </Field>
          <Field label="Tax">
            <select className={inputCls} value={form.tax_id} onChange={set('tax_id')}>
              <option value="">—</option>
              {meta?.taxes?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.rate}%)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Stock">
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={form.stock}
              onChange={set('stock')}
            />
          </Field>
          <Field label="Low-stock alert qty">
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={form.alert_qty}
              onChange={set('alert_qty')}
            />
          </Field>
          <Field label="Expiry date">
            <input
              type="date"
              className={inputCls}
              value={form.expiry_date ?? ''}
              onChange={set('expiry_date')}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(form.is_active)}
            onChange={set('is_active')}
          />
          Active
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
