import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.search)
      .then(() => {
        window.location.replace('/dashboard')
      })
      .catch(() => {
        // Try hash-based flow (older OAuth)
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
