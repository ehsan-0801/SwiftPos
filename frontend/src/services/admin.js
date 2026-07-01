import api from '@/services/api'

export const usersApi = {
  list: (params) => api.get('/users', { params }).then((r) => r.data),
  create: (payload) => api.post('/users', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
  roles: () => api.get('/users/roles').then((r) => r.data),
}

export const auditApi = {
  list: (params) => api.get('/audit-logs', { params }).then((r) => r.data),
}

export const settingsApi = {
  get: () => api.get('/settings').then((r) => r.data),
  update: (settings) => api.post('/settings', { settings }).then((r) => r.data),
  uploadLogo: (file) => {
    const form = new FormData()
    form.append('logo', file)
    return api.post('/settings/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
