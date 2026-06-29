import api from '@/services/api'

export const purchasesApi = {
  list: (params) => api.get('/purchases', { params }).then((r) => r.data),
  get: (id) => api.get(`/purchases/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/purchases', payload).then((r) => r.data.data),
}
