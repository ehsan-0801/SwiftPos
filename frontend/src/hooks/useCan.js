import { useAuthStore } from '@/stores/authStore'

/** True if the logged-in user has the given permission (Super Admin has all). */
export function useCan(permission) {
  const perms = useAuthStore((s) => s.user?.permissions ?? [])
  if (!permission) return true
  return perms.includes(permission)
}
