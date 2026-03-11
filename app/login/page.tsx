'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      toast.error(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-300/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold text-gradient">🏛️ Campus Vault</Link>
          <h1 className="font-display text-3xl font-bold mt-4 mb-2" style={{ color: "#1a1a2e" }}>Welcome Back</h1>
          <p className="text-vault-muted text-sm" style={{ color: "#78716c" }}>Log in to your account</p>
        </div>

        <div className="card p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Email</label>
              <input className="input" type="email" placeholder="you@college.edu" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Password</label>
              <input className="input" type="password" placeholder="Your password" required
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-vault-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/register" style={{ color: "#ea580c", fontWeight: 600, textDecoration: "none" }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
