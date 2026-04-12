import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        window.location.href = '/dashboard'
      } else if (event === 'SIGNED_OUT') {
        subscription.unsubscribe()
        window.location.href = '/login'
      }
    })

    // Fallback: if already signed in when callback loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe()
        window.location.href = '/dashboard'
      }
    })

    return () => subscription.unsubscribe()
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
