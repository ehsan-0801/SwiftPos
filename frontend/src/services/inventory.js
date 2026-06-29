import api from '@/services/api'

export const stockApi = {
  adjustments: (params) => api.get('/stock-adjustments', { params }).then((r) => r.data),
  adjust: (payload) => api.post('/stock-adjustments', payload).then((r) => r.data),
  lowStock: () => api.get('/products/low-stock').then((r) => r.data.data),
  importProducts: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/products/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}

/** Simple catalog CRUD (categories / brands / units / taxes). */
export const catalogApi = {
  list: (kind) => api.get(`/${kind}`).then((r) => r.data),
  create: (kind, payload) => api.post(`/${kind}`, payload).then((r) => r.data),
  update: (kind, id, payload) => api.put(`/${kind}/${id}`, payload).then((r) => r.data),
  remove: (kind, id) => api.delete(`/${kind}/${id}`).then((r) => r.data),
}
