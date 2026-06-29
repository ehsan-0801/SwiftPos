import api from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * Auth actions backed by the Sanctum token endpoints.
 */
export function useAuth() {
  const setSession = useAuthStore((s) => s.setSession)
  const clear = useAuthStore((s) => s.logout)

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setSession(data.token, data.user)
    return data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore network/401 — clear the local session regardless
    } finally {
      clear()
    }
  }

  return { login, logout }
}
