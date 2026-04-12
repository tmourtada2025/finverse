import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, Course, Module, Lesson, Profile } from '@/lib/supabase'
import LessonEditor from '@/pages/LessonEditor'

type AdminSection = 'overview' | 'courses' | 'users' | 'enrollments' | 'analytics'

const I = {
  overview: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  courses: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  users: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  enrollments: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  analytics: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  sun: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>,
  moon: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  logout: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  eye: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
}

function mkTheme(dark: boolean) {
  return dark ? {
    bg: '#0d0d0f', sidebar: '#111115', sidebarBorder: '#1e1e24',
    surface: '#18181d', border: '#1e1e24', text: '#f0f0f5',
    muted: '#6b6b80', dim: '#2a2a35', accent: '#ffffff', accentText: '#000000',
    activeNavBg: '#1e1e28', activeNavText: '#ffffff', navText: '#6b6b80',
    amber: '#f59e0b', indigo: '#6366f1', green: '#10b981', blue: '#3b82f6', red: '#ef4444',
  } : {
    bg: '#f4f4f0', sidebar: '#ffffff', sidebarBorder: '#e8e8e2',
    surface: '#ffffff', border: '#e8e8e2', text: '#111118',
    muted: '#888890', dim: '#e0e0e8', accent: '#111118', accentText: '#ffffff',
    activeNavBg: '#111118', activeNavText: '#ffffff', navText: '#888890',
    amber: '#d97706', indigo: '#4f46e5', green: '#059669', blue: '#2563eb', red: '#dc2626',
  }
}

function StatCard({ label, value, sub, color, t }: any) {
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '20px 22px', backgroundColor: t.surface }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <p style={{ fontSize: '0.72rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{label}</p>
        <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color, marginTop: 3 }} />
      </div>
      <p style={{ fontSize: '1.75rem', fontWeight: 700, color: t.text, lineHeight: 1, marginBottom: '5px' }}>{value}</p>
      {sub && <p style={{ fontSize: '0.72rem', color: t.muted }}>{sub}</p>}
    </div>
  )
}

export default function Admin() {
  const { loading, isAuthenticated, isAdmin, profile } = useAuth()
  const [section, setSection] = useState<AdminSection>('overview')
  const [dark, setDark] = useState(true)
  const t = mkTheme(dark)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!isAdmin) window.location.href = '/dashboard'
  }, [loading, isAuthenticated, isAdmin])

  if (loading || !isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0f' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const navItems: { id: AdminSection; label: string; Icon: () => JSX.Element }[] = [
    { id: 'overview', label: 'Overview', Icon: I.overview },
    { id: 'courses', label: 'Courses', Icon: I.courses },
    { id: 'users', label: 'Users', Icon: I.users },
    { id: 'enrollments', label: 'Enrollments', Icon: I.enrollments },
    { id: 'analytics', label: 'Analytics', Icon: I.analytics },
  ]

  const titles: Record<AdminSection, string> = { overview: 'Overview', courses: 'Courses', users: 'Users', enrollments: 'Enrollments', analytics: 'Analytics' }
  const initials = profile?.full_name ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'A'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: t.bg, color: t.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.dim};border-radius:2px}`}</style>

      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, backgroundColor: t.sidebar, borderRight: `1px solid ${t.sidebarBorder}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${t.sidebarBorder}` }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', color: t.text }}>Fin<span style={{ fontWeight: 300 }}>Verse</span></span>
          <span style={{ fontSize: '0.62rem', color: t.amber, marginLeft: '8px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Admin</span>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: dark ? '#252530' : '#ebebf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: t.muted, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 500, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || 'Admin'}</p>
              <p style={{ fontSize: '0.68rem', color: t.amber }}>Administrator</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.62rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: t.muted, padding: '8px 12px 6px', opacity: 0.6 }}>Management</p>
          {navItems.map(({ id, label, Icon }) => {
            const active = section === id
            return (
              <button key={id} onClick={() => setSection(id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, marginBottom: '1px', transition: 'all 0.12s', backgroundColor: active ? t.activeNavBg : 'transparent', color: active ? t.activeNavText : t.navText, fontWeight: active ? 500 : 400, fontSize: '0.855rem' }}>
                <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}><Icon /></span>
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '10px', borderTop: `1px solid ${t.sidebarBorder}` }}>
          <button onClick={() => { window.location.href = '/dashboard' }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: t.muted, fontSize: '0.855rem', marginBottom: '1px' }}>
            <I.eye /><span>Student view</span>
          </button>
          <button onClick={() => setDark(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: dark ? t.amber : t.indigo, fontSize: '0.855rem', marginBottom: '1px' }}>
            <span>{dark ? <I.sun /> : <I.moon />}</span><span>{dark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/' })} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: t.muted, fontSize: '0.855rem' }}>
            <I.logout /><span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        <div style={{ padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, backgroundColor: t.bg, zIndex: 10 }}>
          <h1 style={{ fontSize: '0.95rem', fontWeight: 600, color: t.text }}>{titles[section]}</h1>
        </div>
        <div style={{ padding: '28px 32px' }}>
          {section === 'overview' && <OverviewSection t={t} onNavigate={setSection} />}
          {section === 'courses' && <CoursesSection t={t} />}
          {section === 'users' && <UsersSection t={t} />}
          {section === 'enrollments' && <EnrollmentsSection t={t} />}
          {section === 'analytics' && <AnalyticsSection t={t} />}
        </div>
      </main>
    </div>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewSection({ t, onNavigate }: { t: any; onNavigate: (s: AdminSection) => void }) {
  const [stats, setStats] = useState({ users: 0, enrollments: 0, completed: 0, revenue: 0, courses: 0, published: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ count: u }, { count: en }, { count: co }, { data: rev }, { count: cr }, { count: pub }, { data: rec }] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }).not('completed_at', 'is', null),
        supabase.from('enrollments').select('amount_paid'),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('enrollments').select('*, profiles(*), courses(title)').order('enrolled_at', { ascending: false }).limit(6),
      ])
      const revenue = (rev || []).reduce((s: number, e: any) => s + (e.amount_paid || 0), 0)
      setStats({ users: u || 0, enrollments: en || 0, completed: co || 0, revenue, courses: cr || 0, published: pub || 0 })
      setRecent(rec || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{ color: t.muted, fontSize: '0.875rem' }}>Loading…</p>
  const rate = stats.enrollments > 0 ? Math.round((stats.completed / stats.enrollments) * 100) : 0

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Total students" value={stats.users} color={t.blue} t={t} />
        <StatCard label="Enrollments" value={stats.enrollments} sub={`${rate}% completion rate`} color={t.green} t={t} />
        <StatCard label="Completions" value={stats.completed} color={t.green} t={t} />
        <StatCard label="Revenue" value={`$${stats.revenue.toLocaleString()}`} color={t.amber} t={t} />
        <StatCard label="Courses" value={`${stats.published}/${stats.courses}`} sub="published / total" color={t.indigo} t={t} />
      </div>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: t.surface }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: t.text }}>Recent enrollments</h3>
          <button onClick={() => onNavigate('enrollments')} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
        </div>
        <table style={{ width: '100%', fontSize: '0.855rem', borderCollapse: 'collapse' }}>
          <tbody>
            {recent.map((e: any) => (
              <tr key={e.id} style={{ borderTop: `1px solid ${t.border}` }}>
                <td style={{ padding: '11px 20px', color: t.text }}>{e.profiles?.email || '—'}</td>
                <td style={{ padding: '11px 20px', color: t.muted }}>{e.courses?.title || '—'}</td>
                <td style={{ padding: '11px 20px', color: t.muted, fontSize: '0.78rem' }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                <td style={{ padding: '11px 20px', textAlign: 'right' as const }}>
                  <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${e.completed_at ? t.green + '50' : t.border}`, color: e.completed_at ? t.green : t.muted }}>
                    {e.completed_at ? 'Completed' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Courses ──────────────────────────────────────────────────────────────────
type ModuleWithLessons = Module & { lessons: Lesson[] }

function CoursesSection({ t }: { t: any }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Course | null>(null)

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setCourses(data || []); setLoading(false)
  }

  async function togglePublish(course: Course) {
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id)
    fetchCourses()
  }

  const blank: Course = { id: '', title: '', slug: '', subtitle: null, description: '', thumbnail_url: null, price: 0, stripe_price_id: null, stripe_product_id: null, is_published: false, position: 0, created_at: '', updated_at: '' }

  if (editing) return <CourseEditor course={editing} onBack={() => { setEditing(null); fetchCourses() }} t={t} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.855rem', color: t.muted }}>{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setEditing(blank)} style={{ backgroundColor: t.accent, color: t.accentText, border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '0.855rem', fontWeight: 500, cursor: 'pointer' }}>+ New course</button>
      </div>
      {loading ? <p style={{ color: t.muted }}>Loading…</p> : courses.length === 0 ? (
        <div style={{ border: `1px dashed ${t.border}`, borderRadius: '12px', padding: '48px', textAlign: 'center' as const, color: t.muted, fontSize: '0.875rem' }}>No courses yet. Create your first one.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
          {courses.map(course => (
            <div key={course.id} style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.surface }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem', color: t.text }}>{course.title}</span>
                  <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${course.is_published ? t.green + '50' : t.border}`, color: course.is_published ? t.green : t.muted }}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: t.muted }}>${course.price} · /{course.slug}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => togglePublish(course)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>{course.is_published ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => setEditing(course)} style={{ fontSize: '0.78rem', border: `1px solid ${t.border}`, background: 'none', color: t.text, borderRadius: '7px', padding: '6px 14px', cursor: 'pointer' }}>Edit →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CourseEditor({ course, onBack, t }: { course: Course; onBack: () => void; t: any }) {
  const isNew = !course.id
  const [form, setForm] = useState({ title: course.title, slug: course.slug || '', description: course.description || '', price: course.price })
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [courseId, setCourseId] = useState(course.id)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  useEffect(() => { if (courseId) fetchModules() }, [courseId])

  async function fetchModules() {
    const { data: mods } = await supabase.from('modules').select('*').eq('course_id', courseId).order('position')
    const withLessons = await Promise.all((mods || []).map(async m => {
      const { data: ls } = await supabase.from('lessons').select('*').eq('module_id', m.id).order('position')
      return { ...m, lessons: ls || [] }
    }))
    setModules(withLessons)
  }

  async function saveCourse() {
    setSaving(true)
    if (isNew) {
      const { data } = await supabase.from('courses').insert({ ...form, is_published: false }).select().single()
      if (data) setCourseId(data.id)
    } else {
      await supabase.from('courses').update(form).eq('id', courseId)
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const inp = { width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: '0.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>← Back to courses</button>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px', color: t.text }}>{isNew ? 'New course' : `Edit: ${course.title}`}</h2>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px', backgroundColor: t.surface, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inp} /></div>
        <div><label style={lbl}>Slug</label><input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="url-slug" style={inp} /></div>
        <div><label style={lbl}>Price (USD)</label><input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} style={inp} /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' as const, fontFamily: 'inherit' }} /></div>
        <div>
          <button onClick={saveCourse} disabled={saving} style={{ backgroundColor: saved ? t.green : t.accent, color: saved ? '#fff' : t.accentText, border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1, transition: 'background-color 0.2s' }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : isNew ? 'Create course' : 'Save changes'}
          </button>
        </div>
      </div>
      {courseId && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: t.muted }}>Modules & Lessons</p>
            <button onClick={async () => { const title = prompt('Module title:'); if (!title) return; await supabase.from('modules').insert({ course_id: courseId, title, position: modules.length + 1 }); fetchModules() }} style={{ fontSize: '0.75rem', color: t.muted, border: `1px solid ${t.border}`, background: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer' }}>+ Add module</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
            {modules.map((mod, mIdx) => (
              <div key={mod.id} style={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: t.surface }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.68rem', color: t.dim }}>M{mIdx + 1}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem', color: t.text }}>{mod.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={async () => { const title = prompt('Lesson title:'); if (!title) return; const { data } = await supabase.from('lessons').insert({ module_id: mod.id, course_id: courseId, title, content_type: 'text', position: mod.lessons.length + 1, is_published: true }).select().single(); fetchModules(); if (data) setEditingLesson(data) }} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>+ lesson</button>
                    <button onClick={async () => { if (!confirm('Delete module?')) return; await supabase.from('modules').delete().eq('id', mod.id); fetchModules() }} style={{ fontSize: '0.75rem', color: t.red + '80', background: 'none', border: 'none', cursor: 'pointer' }}>delete</button>
                  </div>
                </div>
                {mod.lessons.map((lesson, lIdx) => (
                  <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${t.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.68rem', color: t.dim, width: 18 }}>{lIdx + 1}</span>
                      <span style={{ fontSize: '0.855rem', color: t.muted }}>{lesson.title}</span>
                      <span style={{ fontSize: '0.65rem', border: `1px solid ${t.border}`, borderRadius: '4px', padding: '1px 5px', color: t.dim }}>{lesson.content_type}</span>
                      {!lesson.is_published && <span style={{ fontSize: '0.65rem', color: t.amber }}>draft</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setEditingLesson(lesson)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>edit</button>
                      <button onClick={async () => { if (!confirm('Delete lesson?')) return; await supabase.from('lessons').delete().eq('id', lesson.id); fetchModules() }} style={{ fontSize: '0.75rem', color: t.red + '80', background: 'none', border: 'none', cursor: 'pointer' }}>delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {editingLesson && <LessonEditor lesson={editingLesson} t={t} onClose={() => { setEditingLesson(null); fetchModules() }} />}
    </div>
  )
}

// ─── Users ────────────────────────────────────────────────────────────────────
function UsersSection({ t }: { t: any }) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

  async function toggleAdmin(u: Profile) {
    const role = u.role === 'admin' ? 'student' : 'admin'
    await supabase.from('profiles').update({ role }).eq('id', u.id)
    setUsers(p => p.map(x => x.id === u.id ? { ...x, role } : x))
  }

  const filtered = users.filter(u => (u.email + (u.full_name || '')).toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.855rem', color: t.muted }}>{users.length} user{users.length !== 1 ? 's' : ''}</p>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '8px 14px', fontSize: '0.855rem', outline: 'none', width: '220px' }} />
      </div>
      {loading ? <p style={{ color: t.muted }}>Loading…</p> : (
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '0.855rem', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface }}>
              <tr>{['Email', 'Name', 'Role', 'Joined', ''].map(h => <th key={h} style={{ textAlign: 'left' as const, fontSize: '0.68rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: t.muted, padding: '10px 16px', fontWeight: 400 }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: '11px 16px', color: t.text }}>{u.email}</td>
                  <td style={{ padding: '11px 16px', color: t.muted }}>{u.full_name || '—'}</td>
                  <td style={{ padding: '11px 16px' }}><span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${u.role === 'admin' ? t.amber + '50' : t.border}`, color: u.role === 'admin' ? t.amber : t.muted }}>{u.role}</span></td>
                  <td style={{ padding: '11px 16px', color: t.muted, fontSize: '0.78rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right' as const }}><button onClick={() => toggleAdmin(u)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>{u.role === 'admin' ? 'Remove admin' : 'Make admin'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Enrollments ──────────────────────────────────────────────────────────────
function EnrollmentsSection({ t }: { t: any }) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [granting, setGranting] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: enrs }, { data: crs }] = await Promise.all([
      supabase.from('enrollments').select('*, profiles(*), courses(title)').order('enrolled_at', { ascending: false }).limit(100),
      supabase.from('courses').select('*').order('title'),
    ])
    setEnrollments(enrs || []); setCourses(crs || []); setLoading(false)
  }

  async function grant() {
    if (!email || !selectedCourse) return
    setGranting(true); setMsg(null)
    const { data: p } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase()).single()
    if (!p) { setMsg({ text: 'User not found. They must sign in once first.', ok: false }); setGranting(false); return }
    await supabase.from('enrollments').upsert({ user_id: p.id, course_id: selectedCourse, enrolled_at: new Date().toISOString() }, { onConflict: 'user_id,course_id' })
    setMsg({ text: 'Access granted.', ok: true })
    setEmail(''); setSelectedCourse(''); setGranting(false); fetchData()
  }

  const filtered = enrollments.filter((e: any) => ((e.profiles?.email || '') + (e.courses?.title || '')).toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
        <div>
          <p style={{ fontSize: '0.855rem', color: t.muted, marginBottom: '14px' }}>{enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''}</p>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or course…" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '8px 14px', fontSize: '0.855rem', outline: 'none', width: '100%' }} />
        </div>
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '16px', backgroundColor: t.surface }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: t.muted, marginBottom: '12px' }}>Grant access manually</p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="student@email.com" style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.8rem', outline: 'none' }} />
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.8rem', outline: 'none' }}>
              <option value="">Select course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            {msg && <p style={{ fontSize: '0.75rem', color: msg.ok ? t.green : t.red }}>{msg.text}</p>}
            <button onClick={grant} disabled={granting || !email || !selectedCourse} style={{ backgroundColor: t.accent, color: t.accentText, border: 'none', borderRadius: '7px', padding: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', opacity: (granting || !email || !selectedCourse) ? 0.5 : 1 }}>
              {granting ? 'Granting…' : 'Grant access'}
            </button>
          </div>
        </div>
      </div>
      {loading ? <p style={{ color: t.muted }}>Loading…</p> : (
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '0.855rem', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface }}>
              <tr>{['Student', 'Course', 'Enrolled', 'Status'].map(h => <th key={h} style={{ textAlign: 'left' as const, fontSize: '0.68rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: t.muted, padding: '10px 16px', fontWeight: 400 }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((e: any) => (
                <tr key={e.id} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: '11px 16px', color: t.text }}>{e.profiles?.email || e.user_id}</td>
                  <td style={{ padding: '11px 16px', color: t.muted }}>{e.courses?.title || '—'}</td>
                  <td style={{ padding: '11px 16px', color: t.muted, fontSize: '0.78rem' }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 16px' }}><span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${e.completed_at ? t.green + '50' : t.border}`, color: e.completed_at ? t.green : t.muted }}>{e.completed_at ? 'Completed' : 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function AnalyticsSection({ t }: { t: any }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: enrs }, { data: courses }] = await Promise.all([
        supabase.from('enrollments').select('enrolled_at, completed_at, amount_paid, course_id'),
        supabase.from('courses').select('id, title, is_published'),
      ])

      const now = new Date()
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return { label: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), revenue: 0, count: 0 }
      })
      ;(enrs || []).forEach((e: any) => {
        const d = new Date(e.enrolled_at)
        const m = months.find(mo => mo.year === d.getFullYear() && mo.month === d.getMonth())
        if (m) { m.revenue += e.amount_paid || 0; m.count++ }
      })

      const courseStats = (courses || []).map((c: any) => {
        const en = (enrs || []).filter((e: any) => e.course_id === c.id)
        const comp = en.filter((e: any) => e.completed_at).length
        return { ...c, enrolled: en.length, completed: comp, rate: en.length > 0 ? Math.round((comp / en.length) * 100) : 0 }
      })

      const totalRevenue = (enrs || []).reduce((s: number, e: any) => s + (e.amount_paid || 0), 0)
      const totalCompleted = (enrs || []).filter((e: any) => e.completed_at).length
      const rate = enrs?.length ? Math.round((totalCompleted / enrs.length) * 100) : 0

      setData({ months, courseStats, totalRevenue, totalCompleted, rate, total: enrs?.length || 0 })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{ color: t.muted, fontSize: '0.875rem' }}>Loading analytics…</p>

  const maxRev = Math.max(...data.months.map((m: any) => m.revenue), 1)
  const maxCnt = Math.max(...data.months.map((m: any) => m.count), 1)

  function BarChart({ months, key2, color, label }: any) {
    const max = Math.max(...months.map((m: any) => m[key2]), 1)
    return (
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '20px', backgroundColor: t.surface }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '20px', color: t.text }}>{label}</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '110px' }}>
          {months.map((m: any, i: number) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '5px', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.62rem', color: t.muted }}>{m[key2] > 0 ? (key2 === 'revenue' ? `$${m[key2]}` : m[key2]) : ''}</span>
              <div style={{ width: '100%', backgroundColor: color, borderRadius: '4px 4px 0 0', height: `${Math.max((m[key2] / max) * 80, m[key2] > 0 ? 3 : 0)}px`, opacity: 0.85 }} />
              <span style={{ fontSize: '0.7rem', color: t.muted }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        <StatCard label="Total revenue" value={`$${data.totalRevenue.toLocaleString()}`} color={t.amber} t={t} />
        <StatCard label="Enrollments" value={data.total} color={t.blue} t={t} />
        <StatCard label="Completions" value={data.totalCompleted} sub={`${data.rate}% rate`} color={t.green} t={t} />
      </div>

      <BarChart months={data.months} key2="revenue" color={t.amber} label="Revenue — last 6 months" />
      <BarChart months={data.months} key2="count" color={t.blue} label="Enrollments — last 6 months" />

      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: t.surface }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: t.text }}>Completion by course</h3>
        </div>
        <table style={{ width: '100%', fontSize: '0.855rem', borderCollapse: 'collapse' }}>
          <thead style={{ borderBottom: `1px solid ${t.border}` }}>
            <tr>{['Course', 'Enrolled', 'Completed', 'Rate'].map(h => <th key={h} style={{ textAlign: 'left' as const, fontSize: '0.68rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: t.muted, padding: '10px 20px', fontWeight: 400 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.courseStats.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '20px', color: t.muted, textAlign: 'center' as const }}>No data yet.</td></tr>
            ) : data.courseStats.map((c: any) => (
              <tr key={c.id} style={{ borderTop: `1px solid ${t.border}` }}>
                <td style={{ padding: '12px 20px', color: t.text }}>{c.title}{!c.is_published && <span style={{ fontSize: '0.65rem', color: t.muted, marginLeft: '6px' }}>(draft)</span>}</td>
                <td style={{ padding: '12px 20px', color: t.muted }}>{c.enrolled}</td>
                <td style={{ padding: '12px 20px', color: t.muted }}>{c.completed}</td>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 80, height: 4, backgroundColor: t.dim, borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${c.rate}%`, backgroundColor: c.rate >= 70 ? t.green : c.rate >= 40 ? t.amber : t.red, borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: t.muted }}>{c.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
