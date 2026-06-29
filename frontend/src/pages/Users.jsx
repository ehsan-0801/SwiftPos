import { useQuery } from '@tanstack/react-query'
import CrudPage from '@/components/crud/CrudPage'
import Badge from '@/components/ui/Badge'
import { usersApi } from '@/services/admin'
import { useCan } from '@/hooks/useCan'

export default function Users() {
  const canManage = useCan('manage-users')
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: usersApi.roles })

  const fields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password (blank = unchanged)', type: 'password' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      from: (r) => r?.roles?.[0],
      options: roles.map((r) => ({ value: r, label: r })),
    },
    { name: 'pin', label: 'Cashier PIN' },
    { name: 'is_active', label: 'Active', type: 'checkbox', default: true },
  ]

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'roles', label: 'Role', render: (r) => r.roles?.join(', ') ?? '—' },
    {
      key: 'is_active',
      label: 'Status',
      render: (r) => (r.is_active ? <Badge tone="active">Active</Badge> : <Badge>Inactive</Badge>),
    },
  ]

  return (
    <CrudPage
      title="Users"
      singular="user"
      queryKey="users"
      service={usersApi}
      columns={columns}
      fields={fields}
      canManage={canManage}
      searchPlaceholder="Search name, email…"
    />
  )
}
