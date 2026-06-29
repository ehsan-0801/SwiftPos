import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Pos from '@/pages/Pos'
import Products from '@/pages/Products'
import Customers from '@/pages/Customers'
import Suppliers from '@/pages/Suppliers'
import Sales from '@/pages/Sales'
import Purchases from '@/pages/Purchases'
import Inventory from '@/pages/Inventory'
import Expenses from '@/pages/Expenses'
import Reports from '@/pages/Reports'
import Placeholder from '@/pages/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* POS is a full-screen layout without the standard shell (spec §10) */}
        <Route path="/pos" element={<Pos />} />

        {/* Standard admin shell */}
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="customers" element={<Customers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Route>
    </Routes>
  )
}
