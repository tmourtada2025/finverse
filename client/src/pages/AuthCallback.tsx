import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

async function activatePendingEnrollments(userId: string, email: string) {
  // Find any pending enrollments for this email
  const { data: pending } = await supabase
    .from('enrollments')
    .select('id, course_id')
    .eq('pending_email', email.toLowerCase())
    .eq('status', 'pending_signup')

  if (!pending || pending.length === 0) return

  // Activate each one — update user_id and status
  for (const enrollment of pending) {
    await supabase
      .from('enrollments')
      .update({
        user_id: userId,
        status: 'active',
        pending_email: null,
      })
      .eq('id', enrollment.id)
  }

  console.log(`Activated ${pending.length} pending enrollment(s) for ${email}`)
}

export default function AuthCallback() {
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
    const type     = params.get('type') || hashParams.get('type')
    const accessToken  = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    // ── Password recovery flow ──────────────────────────────────────────────
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

    // ── Normal sign-in / sign-up flow ───────────────────────────────────────
    supabase.auth.exchangeCodeForSession(window.location.search)
      .then(async ({ data }) => {
        const user = data?.session?.user
        if (user?.id && user?.email) {
          await activatePendingEnrollments(user.id, user.email)
        }
        window.location.replace('/dashboard')
      })
      .catch(() => {
        // Fallback: hash-based flow
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (session?.user?.id && session?.user?.email) {
            await activatePendingEnrollments(session.user.id, session.user.email)
          }
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
