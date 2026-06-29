import { useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/** Topbar with breadcrumb + user (spec §7.1). */
export default function Topbar() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const crumb = pathname === '/' ? 'Dashboard' : pathname.slice(1).replace(/-/g, ' ')

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
      <span className="text-sm capitalize text-text-secondary">{crumb}</span>
      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-light text-sm font-medium text-primary">
        {user?.name?.[0]?.toUpperCase() ?? 'U'}
      </div>
    </header>
  )
}
