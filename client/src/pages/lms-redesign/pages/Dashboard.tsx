import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, Course, Enrollment } from '@/lib/supabase'
import { Link } from 'wouter'

type EnrollmentWithCourse = Enrollment & { course: Course }
type Section = 'courses' | 'catalogue' | 'profile'

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

export default function Dashboard() {
  const { user, profile, isAuthenticated, isAdmin, loading } = useAuth()
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [catalogue, setCatalogue] = useState<Course[]>([])
  const [section, setSection] = useState<Section>('courses')
  const [dark, setDark] = useState(true)
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) window.location.href = '/login'
  }, [loading, isAuthenticated])

  useEffect(() => {
    if (user) { fetchEnrollments(); fetchCatalogue() }
  }, [user])

  useEffect(() => {
    if (profile) setProfileForm({ full_name: profile.full_name || '', email: profile.email || '' })
  }, [profile])

  async function fetchEnrollments() {
    const { data } = await supabase
      .from('enrollments').select('*, course:courses(*)')
      .eq('user_id', user!.id).order('enrolled_at', { ascending: false })
    setEnrollments((data as EnrollmentWithCourse[]) || [])
  }

  async function fetchCatalogue() {
    const { data } = await supabase.from('courses').select('*').eq('is_published', true).order('position')
    setCatalogue(data || [])
  }

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: profileForm.full_name }).eq('id', user!.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading && !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f0]'}`}>
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin opacity-40" />
      </div>
    )
  }

  const t = dark
    ? { bg: '#0a0a0a', surface: '#111', border: '#1a1a1a', borderHover: '#2a2a2a', text: '#fff', muted: '#888', dim: '#444', accent: '#fff', accentText: '#000' }
    : { bg: '#f5f5f0', surface: '#fff', border: '#e5e5e0', borderHover: '#d0d0c8', text: '#111', muted: '#666', dim: '#aaa', accent: '#111', accentText: '#fff' }

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'courses', label: 'My Courses', icon: '📘' },
    { id: 'catalogue', label: 'Catalogue', icon: '🧭' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, color: t.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Top nav */}
      <nav style={{ borderBottom: `1px solid ${t.border}`, padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: t.bg, zIndex: 50 }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          Fin<span style={{ fontWeight: 300 }}>Verse</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme toggle */}
          <button
            onClick={() => setDark(d => !d)}
            style={{ background: 'none', border: `1px solid ${t.border}`, color: t.muted, borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Bell */}
          <button style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', position: 'relative', padding: '4px' }}>
            <BellIcon />
            <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          </button>

          {/* User */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{profile?.full_name || 'Student'}</span>
            <span style={{ fontSize: '0.7rem', color: t.muted }}>{profile?.email || user?.email}</span>
          </div>

          {isAdmin && (
            <Link href="/admin">
              <span style={{ fontSize: '0.75rem', color: t.muted, cursor: 'pointer', padding: '4px 10px', border: `1px solid ${t.border}`, borderRadius: '6px' }}>
                Admin
              </span>
            </Link>
          )}

          <button
            onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/' })}
            style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '2rem', gap: '1.5rem' }}>

        {/* Sidebar */}
        <aside style={{ width: '200px', flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem',
                  fontWeight: section === item.id ? 500 : 400,
                  backgroundColor: section === item.id ? t.surface : 'transparent',
                  color: section === item.id ? t.text : t.muted,
                  transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* MY COURSES */}
          {section === 'courses' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>My Courses</h2>
              {enrollments.length === 0 ? (
                <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: t.muted, marginBottom: '0.5rem' }}>No courses yet.</p>
                  <p style={{ color: t.dim, fontSize: '0.8rem' }}>Once you purchase a course, it will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  {enrollments.map(e => (
                    <CourseCard key={e.id} enrollment={e} dark={dark} t={t} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CATALOGUE */}
          {section === 'catalogue' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Course Catalogue</h2>
              {catalogue.length === 0 ? (
                <p style={{ color: t.muted }}>No courses available yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  {catalogue.map(course => {
                    const enrolled = enrollments.some(e => e.course_id === course.id)
                    return (
                      <div key={course.id} style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '1.25rem', backgroundColor: t.surface }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>{course.title}</h3>
                        {course.description && <p style={{ fontSize: '0.75rem', color: t.muted, marginBottom: '1rem', lineHeight: 1.5 }}>{course.description.slice(0, 80)}…</p>}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>${course.price}</span>
                          {enrolled ? (
                            <Link href={`/learn/${course.id}`}>
                              <span style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: '6px', border: `1px solid ${t.border}`, cursor: 'pointer', color: t.muted }}>Continue →</span>
                            </Link>
                          ) : (
                            <a href="/blueprint" style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: '6px', backgroundColor: t.accent, color: t.accentText, textDecoration: 'none' }}>Enrol →</a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {section === 'profile' && (
            <div style={{ maxWidth: '480px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Profile</h2>
              <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '1.5rem', backgroundColor: t.surface }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Full name</label>
                  <input
                    value={profileForm.full_name}
                    onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                    style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Email</label>
                  <input
                    value={profileForm.email}
                    disabled
                    style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.dim, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <p style={{ fontSize: '0.7rem', color: t.dim, marginTop: '4px' }}>Email cannot be changed</p>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  style={{ backgroundColor: t.accent, color: t.accentText, border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
                >
                  {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

function CourseCard({ enrollment, dark, t }: { enrollment: EnrollmentWithCourse; dark: boolean; t: any }) {
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => { fetchProgress() }, [])

  async function fetchProgress() {
    const { data: mods } = await supabase.from('modules').select('id').eq('course_id', enrollment.course_id)
    const modIds = mods?.map(m => m.id) || []
    if (!modIds.length) { setProgress(0); return }
    const { count: total } = await supabase.from('lessons').select('id', { count: 'exact', head: true }).in('module_id', modIds)
    const { count: done } = await supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('enrollment_id', enrollment.id).eq('completed', true)
    setProgress(total && total > 0 ? Math.round(((done || 0) / total) * 100) : 0)
  }

  const pct = progress ?? 0

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '1.25rem', backgroundColor: t.surface, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4 }}>{enrollment.course.title}</h3>
      <p style={{ fontSize: '0.7rem', color: t.muted }}>
        Started {new Date(enrollment.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>

      {/* Progress bar */}
      <div>
        <div style={{ height: '4px', backgroundColor: dark ? '#1a1a1a' : '#e5e5e0', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : t.accent, borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>
        <p style={{ fontSize: '0.7rem', color: t.muted, marginTop: '4px' }}>{pct}% complete</p>
      </div>

      <Link href={`/learn/${enrollment.course_id}`}>
        <span style={{ display: 'block', textAlign: 'center', padding: '8px', borderRadius: '7px', border: `1px solid ${t.border}`, fontSize: '0.75rem', cursor: 'pointer', color: t.text, transition: 'all 0.15s' }}>
          {pct === 0 ? 'Start' : pct === 100 ? 'Review' : 'Continue'} →
        </span>
      </Link>
    </div>
  )
}
