import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
    
    const type = params.get('type') || hashParams.get('type')
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    // Password recovery flow
    if (type === 'recovery') {
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(() => { window.location.replace('/reset-password') })
          .catch(() => { window.location.replace('/login') })
      } else {
        window.location.replace('/login')
      }
      return
    }

    // Normal OAuth/magic link flow
    supabase.auth.exchangeCodeForSession(window.location.search)
      .then(() => { window.location.replace('/dashboard') })
      .catch(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          window.location.replace(session ? '/dashboard' : '/login')
        })
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#888] text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
