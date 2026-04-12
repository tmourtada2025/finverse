import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

type AuthContextType = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    // Hard timeout — never block the app for more than 3 seconds
    const timeout = setTimeout(() => {
      setProfile(null)
      setLoading(false)
    }, 3000)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      clearTimeout(timeout)
      setProfile(error ? null : data)
    } catch {
      clearTimeout(timeout)
      setProfile(null)
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUpWithEmail(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error: error?.message ?? null }
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    window.location.href = '/'
  }

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAuthenticated: !!session,
    isAdmin: profile?.role === 'admin',
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
