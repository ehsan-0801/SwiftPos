import CrudPage from '@/components/crud/CrudPage'
import Badge from '@/components/ui/Badge'
import { suppliersApi } from '@/services/suppliers'
import { useCan } from '@/hooks/useCan'
import { formatCurrency } from '@/utils/format'

export default function Suppliers() {
  const canManage = useCan('manage-suppliers')

  const fields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'balance', label: 'Balance (payable)', type: 'number', step: '0.01' },
    { name: 'address', label: 'Address', type: 'textarea' },
  ]

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone ?? '—' },
    { key: 'email', label: 'Email', render: (r) => r.email ?? '—' },
    {
      key: 'balance',
      label: 'Payable',
      render: (r) =>
        r.balance > 0 ? (
          <Badge tone="warning">{formatCurrency(r.balance)}</Badge>
        ) : (
          <span className="text-text-secondary">{formatCurrency(0)}</span>
        ),
    },
  ]

  return (
    <CrudPage
      title="Suppliers"
      singular="supplier"
      queryKey="suppliers"
      service={suppliersApi}
      columns={columns}
      fields={fields}
      canManage={canManage}
      searchPlaceholder="Search name, phone, email…"
    />
  )
}
