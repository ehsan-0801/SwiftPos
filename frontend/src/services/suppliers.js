import api from '@/services/api'

export const suppliersApi = {
  list: (params) => api.get('/suppliers', { params }).then((r) => r.data),
  create: (payload) => api.post('/suppliers', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/suppliers/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/suppliers/${id}`).then((r) => r.data),
}
