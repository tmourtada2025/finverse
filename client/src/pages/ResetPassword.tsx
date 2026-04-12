import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Verify we have an active session from the recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      else window.location.href = '/login'
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => { window.location.href = '/dashboard' }, 2000)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <nav className="px-8 py-5">
        <span className="text-white font-bold text-xl tracking-tight">
          Fin<span className="font-light">Verse</span>
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">Set new password</h1>
            <p className="text-[#888] text-sm">Choose a strong password for your account.</p>
          </div>

          {success ? (
            <div className="bg-[#1a3a2a] border border-emerald-400/30 rounded-lg p-6 text-center">
              <p className="text-emerald-400 font-medium mb-1">Password updated</p>
              <p className="text-[#888] text-sm">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={8}
                className="w-full bg-[#111] border border-[#333] text-white placeholder-[#555] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555] transition-colors"
              />
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={8}
                className="w-full bg-[#111] border border-[#333] text-white placeholder-[#555] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555] transition-colors"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Updating…' : 'Set new password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
