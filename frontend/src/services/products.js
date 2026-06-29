import api from '@/services/api'

/** Product + catalog API calls (spec §5). */
export const productsApi = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/products', payload).then((r) => r.data.data),
  update: (id, payload) =>
    api.put(`/products/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  search: (q) =>
    api.get('/products/search', { params: { q } }).then((r) => r.data.data),
  catalogMeta: () => api.get('/catalog/meta').then((r) => r.data),
}
