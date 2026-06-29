import { useQuery } from '@tanstack/react-query'
import CrudPage from '@/components/crud/CrudPage'
import CatalogManager from '@/components/inventory/CatalogManager'
import { expensesApi } from '@/services/expenses'
import { useCan } from '@/hooks/useCan'
import { formatCurrency } from '@/utils/format'

export default function Expenses() {
  const canManage = useCan('manage-expenses')
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: expensesApi.categories,
    staleTime: 5 * 60 * 1000,
  })

  const today = new Date().toISOString().slice(0, 10)

  const fields = [
    { name: 'date', label: 'Date', type: 'date', default: today },
    { name: 'amount', label: 'Amount', type: 'number', step: '0.01', required: true },
    {
      name: 'category_id',
      label: 'Category',
      type: 'select',
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: 'note', label: 'Note', type: 'textarea' },
  ]

  const columns = [
    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'category', label: 'Category', render: (r) => r.category ?? '—' },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'note', label: 'Note', render: (r) => r.note ?? '—' },
    { key: 'user', label: 'By', render: (r) => r.user ?? '—' },
  ]

  return (
    <div className="space-y-6">
      <CrudPage
        title="Expenses"
        singular="expense"
        queryKey="expenses"
        service={expensesApi}
        columns={columns}
        fields={fields}
        canManage={canManage}
        searchPlaceholder="Filter…"
      />

      {canManage && (
        <div className="max-w-sm">
          <CatalogManager kind="expense-categories" title="Expense Categories" fields={[{ name: 'name', label: 'Name' }]} />
        </div>
      )}
    </div>
  )
}
