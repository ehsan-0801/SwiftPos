import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@swiftpos.test')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch {
      // error toast handled by the API interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-base p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow-[var(--shadow-md)]"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-lg bg-primary text-xl font-bold text-white">
            S
          </div>
          <h1 className="text-xl font-semibold">SwiftPOS</h1>
          <p className="text-sm text-text-secondary">Sign in to your account</p>
        </div>

        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(45,107,228,0.15)]"
        />

        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(45,107,228,0.15)]"
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
