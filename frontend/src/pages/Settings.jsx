import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { settingsApi } from '@/services/admin'
import { useCan } from '@/hooks/useCan'

const inputCls = 'h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary'

const SECTIONS = [
  {
    title: 'Business Info',
    fields: [
      { key: 'business_name', label: 'Business Name' },
      { key: 'business_phone', label: 'Phone' },
      { key: 'business_address', label: 'Address' },
      { key: 'currency_symbol', label: 'Currency Symbol' },
    ],
  },
  {
    title: 'Receipt',
    fields: [
      { key: 'receipt_header', label: 'Header' },
      { key: 'receipt_footer', label: 'Footer' },
      { key: 'thermal_format', label: 'Thermal Format (58mm/80mm/A4)' },
    ],
  },
  {
    title: 'POS & Tax',
    fields: [
      { key: 'low_stock_threshold', label: 'Low Stock Threshold', type: 'number' },
      { key: 'tax_inclusive', label: 'Tax Inclusive (1/0)', type: 'number' },
      { key: 'loyalty_point_ratio', label: 'Loyalty Point Ratio', type: 'number' },
      { key: 'session_timeout', label: 'Session Timeout (min)', type: 'number' },
    ],
  },
]

export default function Settings() {
  const canManage = useCan('system-settings')
  const fileRef = useRef(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const { data } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })

  useEffect(() => { if (data) setForm(data) }, [data])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      await settingsApi.update(form)
      toast.success('Settings saved')
    } catch {
      /* toasts */
    } finally { setSaving(false) }
  }

  const onLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await settingsApi.uploadLogo(file)
      setForm((f) => ({ ...f, business_logo: res.business_logo }))
      toast.success('Logo uploaded')
    } catch { /* toasts */ } finally { if (fileRef.current) fileRef.current.value = '' }
  }

  if (!canManage) {
    return <div className="rounded-lg border border-border bg-white p-8 text-center text-text-secondary">
      Only a Super Admin can manage system settings.
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Settings</h1>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">{section.title}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1 block text-sm font-medium">{f.label}</span>
                <input type={f.type ?? 'text'} className={inputCls} value={form[f.key] ?? ''} onChange={set(f.key)} />
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Logo</h2>
        {form.business_logo && (
          <img src={`http://localhost:8000${form.business_logo}`} alt="logo" className="mb-3 h-16 w-auto object-contain" />
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onLogo} className="text-sm" />
      </div>
    </div>
  )
}
