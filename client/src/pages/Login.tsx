import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useLocation } from 'wouter'

type Mode = 'signin' | 'signup' | 'reset'

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, isAuthenticated, loading } = useAuth()
  const [, setLocation] = useLocation()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation('/dashboard')
    }
  }, [isAuthenticated, loading, setLocation])

  function resetForm() {
    setError(null)
    setMessage(null)
    setPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password)
      if (error) setError(error)
    } else if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.')
        setSubmitting(false)
        return
      }
      const { error } = await signUpWithEmail(email, password, fullName)
      if (error) setError(error)
      else setMessage('Check your inbox to confirm your email, then sign in.')
    } else if (mode === 'reset') {
      const { error } = await resetPassword(email)
      if (error) setError(error)
      else setMessage('Password reset link sent — check your inbox.')
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <nav className="px-8 py-5">
        <a href="/" className="text-white font-bold text-xl tracking-tight">
          Fin<span className="font-light">Verse</span>
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">
              {mode === 'signin' ? 'Access your courses' : mode === 'signup' ? 'Create your account' : 'Reset password'}
            </h1>
            <p className="text-[#888] text-sm">
              {mode === 'signin' ? 'Sign in to continue your learning.' : mode === 'signup' ? 'Set up your FinVerse account.' : "Enter your email and we'll send a reset link."}
            </p>
          </div>

          {mode !== 'reset' && (
            <>
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[#222]" />
                <span className="text-[#555] text-xs">or</span>
                <div className="flex-1 h-px bg-[#222]" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full bg-[#111] border border-[#333] text-white placeholder-[#555] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555] transition-colors"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-[#111] border border-[#333] text-white placeholder-[#555] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555] transition-colors"
            />
            {mode !== 'reset' && (
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={8}
                className="w-full bg-[#111] border border-[#333] text-white placeholder-[#555] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555] transition-colors"
              />
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}
            {message && <p className="text-emerald-400 text-xs">{message}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            {mode === 'signin' && (
              <>
                <p className="text-[#555] text-xs">
                  No account?{' '}
                  <button onClick={() => { setMode('signup'); resetForm() }} className="text-[#888] hover:text-white transition-colors">
                    Create one
                  </button>
                </p>
                <p className="text-[#555] text-xs">
                  <button onClick={() => { setMode('reset'); resetForm() }} className="text-[#888] hover:text-white transition-colors">
                    Forgot password?
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-[#555] text-xs">
                Already have an account?{' '}
                <button onClick={() => { setMode('signin'); resetForm() }} className="text-[#888] hover:text-white transition-colors">
                  Sign in
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <p className="text-[#555] text-xs">
                <button onClick={() => { setMode('signin'); resetForm() }} className="text-[#888] hover:text-white transition-colors">
                  ← Back to sign in
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
