import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useLocation } from 'wouter'

export default function Login() {
  const { signInWithGoogle, signInWithMagicLink, isAuthenticated } = useAuth()
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    setLocation('/dashboard')
    return null
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signInWithMagicLink(email)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5">
        <a href="/" className="text-white font-bold text-xl tracking-tight">
          Fin<span className="font-light">Verse</span>
        </a>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-white text-3xl font-bold mb-2">Access your courses</h1>
            <p className="text-[#888] text-sm">
              Sign in to continue your learning.
            </p>
          </div>

          {sent ? (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#1a3a2a] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">Check your inbox</p>
              <p className="text-[#888] text-sm">
                We sent a sign-in link to <span className="text-white">{email}</span>
              </p>
              <p className="text-[#555] text-xs mt-4">
                No email? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-[#888] underline hover:text-white"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            <>
              {/* Google */}
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

              {/* Magic link */}
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-[#111] border border-[#333] text-white placeholder-[#555] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555] transition-colors"
                />
                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#222] hover:border-[#444] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send sign-in link'}
                </button>
              </form>

              <p className="text-[#444] text-xs text-center mt-6">
                Access is granted after course purchase.{' '}
                <a href="/blueprint" className="text-[#666] hover:text-white transition-colors">
                  Enrol here →
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
