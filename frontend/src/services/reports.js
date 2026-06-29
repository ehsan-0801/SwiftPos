import api from '@/services/api'

export const reportsApi = {
  get: (report, params) => api.get(`/reports/${report}`, { params }).then((r) => r.data),

  /** Download an export (pdf|excel). Uses a blob so the bearer token is sent. */
  download: async (report, format, params = {}) => {
    const res = await api.get(`/reports/${report}`, {
      params: { ...params, export: format },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
