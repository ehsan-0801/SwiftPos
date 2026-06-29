import api from '@/services/api'

/** Sales API calls (spec §5). */
export const salesApi = {
  list: (params) => api.get('/sales', { params }).then((r) => r.data),
  get: (id) => api.get(`/sales/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/sales', payload).then((r) => r.data.data),
  receipt: (id) => api.get(`/sales/${id}/receipt`).then((r) => r.data),
  return: (id) => api.post(`/sales/${id}/return`).then((r) => r.data.data),
}
