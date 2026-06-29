import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'

/** Dark fixed sidebar (240px) — spec §7.1. */
export default function AppSidebar() {
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()

  return (
    <aside className="flex h-full w-60 flex-col bg-bg-sidebar text-text-sidebar">
      <div className="flex items-center gap-2 px-5 py-5 text-white">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary font-bold">
          S
        </div>
        <span className="text-lg font-semibold">SwiftPOS</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'block rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'border-l-[3px] border-primary bg-[rgba(45,107,228,0.12)] text-white'
                  : 'text-text-sidebar hover:bg-[rgba(255,255,255,0.05)] hover:text-white',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-2 text-sm text-white">{user?.name ?? 'User'}</div>
        <button
          onClick={logout}
          className="text-sm text-text-sidebar hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
