import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Auth state — token + current user, persisted to localStorage so a refresh
 * keeps the session. Login/logout are wired to the API in hooks/useAuth.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),

      isAuthenticated: () => Boolean(useAuthStore.getState().token),
    }),
    { name: 'swiftpos-auth' }
  )
)
