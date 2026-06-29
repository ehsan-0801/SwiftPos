import { useQuery } from '@tanstack/react-query'
import CrudPage from '@/components/crud/CrudPage'
import Badge from '@/components/ui/Badge'
import { customersApi } from '@/services/customers'
import { useCan } from '@/hooks/useCan'
import { formatCurrency } from '@/utils/format'

export default function Customers() {
  const canManage = useCan('manage-customers')
  const { data: groups = [] } = useQuery({
    queryKey: ['customer-groups'],
    queryFn: customersApi.groups,
    staleTime: 5 * 60 * 1000,
  })

  const fields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email', type: 'email' },
    {
      name: 'group_id',
      label: 'Group',
      type: 'select',
      options: groups.map((g) => ({ value: g.id, label: g.name })),
    },
    { name: 'balance', label: 'Balance (due)', type: 'number', step: '0.01' },
    { name: 'address', label: 'Address', type: 'textarea' },
  ]

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone ?? '—' },
    { key: 'group', label: 'Group', render: (r) => r.group ?? '—' },
    {
      key: 'balance',
      label: 'Due',
      render: (r) =>
        r.balance > 0 ? (
          <Badge tone="due">{formatCurrency(r.balance)}</Badge>
        ) : (
          <span className="text-text-secondary">{formatCurrency(0)}</span>
        ),
    },
  ]

  return (
    <CrudPage
      title="Customers"
      singular="customer"
      queryKey="customers"
      service={customersApi}
      columns={columns}
      fields={fields}
      canManage={canManage}
      searchPlaceholder="Search name, phone, email…"
    />
  )
}
