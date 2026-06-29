import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

/**
 * Central Axios instance. Every API call in the app goes through here
 * (spec §10 — React Conventions). Base URL comes from the Vite env.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: 'application/json' },
})

// Attach the Sanctum bearer token to every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalise errors and surface them as toasts. The API contract is
// { message, errors: {} } (spec §9 — Error Handling).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      useAuthStore.getState().logout()
    } else {
      const message = response?.data?.message || 'Something went wrong'
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
