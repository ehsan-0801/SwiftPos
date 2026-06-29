import api from '@/services/api'

export const customersApi = {
  list: (params) => api.get('/customers', { params }).then((r) => r.data),
  create: (payload) => api.post('/customers', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/customers/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/customers/${id}`).then((r) => r.data),
  search: (q) => api.get('/customers/search', { params: { q } }).then((r) => r.data.data),
  history: (id) => api.get(`/customers/${id}/history`).then((r) => r.data),
  groups: () => api.get('/customer-groups').then((r) => r.data),
}
