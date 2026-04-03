import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const [, setLocation] = useLocation()

  useEffect(() => {
    // Supabase handles the token exchange automatically from the URL hash/params
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLocation('/dashboard')
      } else {
        // Give it a moment for the hash exchange to complete
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession()
          setLocation(session ? '/dashboard' : '/login')
        }, 1500)
      }
    })
  }, [setLocation])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#888] text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
