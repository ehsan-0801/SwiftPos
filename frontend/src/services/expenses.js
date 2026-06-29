import api from '@/services/api'

export const expensesApi = {
  list: (params) => api.get('/expenses', { params }).then((r) => r.data),
  create: (payload) => api.post('/expenses', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/expenses/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/expenses/${id}`).then((r) => r.data),
  categories: () => api.get('/expense-categories').then((r) => r.data),
}
