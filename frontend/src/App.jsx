import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Pos from '@/pages/Pos'
import Products from '@/pages/Products'
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
          <Route path="sales" element={<Placeholder title="Sales History" />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Placeholder title="Inventory" />} />
          <Route path="purchases" element={<Placeholder title="Purchases" />} />
          <Route path="customers" element={<Placeholder title="Customers" />} />
          <Route path="suppliers" element={<Placeholder title="Suppliers" />} />
          <Route path="expenses" element={<Placeholder title="Expenses" />} />
          <Route path="reports" element={<Placeholder title="Reports" />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Route>
    </Routes>
  )
}
