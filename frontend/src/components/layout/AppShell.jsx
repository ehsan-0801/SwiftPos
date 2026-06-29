import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import Topbar from './Topbar'

/** Standard admin shell: sidebar + topbar + scrollable content. */
export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
