/**
 * Sidebar navigation (spec §7.1). `permission` (when set) hides the item
 * unless the user holds it — enforcement also happens on the backend.
 */
export const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pos', label: 'POS / New Sale', permission: 'make-sales' },
  { to: '/sales', label: 'Sales History' },
  { to: '/products', label: 'Products' },
  { to: '/inventory', label: 'Inventory', permission: 'adjust-stock' },
  { to: '/purchases', label: 'Purchases', permission: 'create-purchase' },
  { to: '/customers', label: 'Customers' },
  { to: '/suppliers', label: 'Suppliers', permission: 'manage-suppliers' },
  { to: '/expenses', label: 'Expenses', permission: 'manage-expenses' },
  { to: '/reports', label: 'Reports', permission: 'view-reports' },
  { to: '/users', label: 'Users', permission: 'manage-users' },
  { to: '/audit-logs', label: 'Audit Log', permission: 'manage-users' },
  { to: '/settings', label: 'Settings', permission: 'system-settings' },
]
