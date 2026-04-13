import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, Course, Module, Lesson, Profile, Section } from '@/lib/supabase'

type AdminSection = 'overview' | 'courses_new' | 'courses_edit' | 'users' | 'enrollments' | 'analytics'
type CourseView = 'list' | 'editor'
type LessonView = 'editor'

// ─── Icons ────────────────────────────────────────────────────────────────────
const I = {
  overview: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  courses: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  users: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  enrollments: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  analytics: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  plus: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  edit: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  chevron: (open: boolean) => <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  sun: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>,
  moon: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  logout: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  eye: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  back: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
}

function mkT(dark: boolean) {
  return dark ? {
    bg: '#0d0d0f', sidebar: '#111115', sidebarBorder: '#1e1e24',
    surface: '#18181d', border: '#1e1e24', text: '#f0f0f5',
    muted: '#6b6b80', dim: '#2a2a35', accent: '#ffffff', accentText: '#000000',
    activeNavBg: '#1e1e28', activeNavText: '#ffffff', navText: '#6b6b80',
    amber: '#f59e0b', indigo: '#6366f1', green: '#10b981', blue: '#3b82f6', red: '#ef4444',
    subNavBg: '#161620',
  } : {
    bg: '#f4f4f0', sidebar: '#ffffff', sidebarBorder: '#e8e8e2',
    surface: '#ffffff', border: '#e8e8e2', text: '#111118',
    muted: '#888890', dim: '#e0e0e8', accent: '#111118', accentText: '#ffffff',
    activeNavBg: '#111118', activeNavText: '#ffffff', navText: '#888890',
    amber: '#d97706', indigo: '#4f46e5', green: '#059669', blue: '#2563eb', red: '#dc2626',
    subNavBg: '#f0f0ec',
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



// ─── User Profile Page ────────────────────────────────────────────────────────
function UserProfilePage({ userId, t, onBack }: { userId: string; t: any; onBack: () => void }) {
  const [profile, setProfile] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUserData() }, [userId])

  async function fetchUserData() {
    setLoading(true)
    const [{ data: prof }, { data: enrols }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('enrollments').select('*, course:courses(id, title)').eq('user_id', userId),
    ])
    setProfile(prof)
    const enrolData = enrols || []
    setEnrollments(enrolData)

    // Load progress per enrollment
    const progressData = await Promise.all(enrolData.map(async (enrol: any) => {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, modules!inner(course_id)')
        .eq('modules.course_id', enrol.course_id)
      const { data: completed } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed_at')
        .eq('user_id', userId)
        .eq('enrollment_id', enrol.id)
        .eq('completed', true)
      const total = (lessons || []).length
      const done = (completed || []).length
      const lastActivity = completed?.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]?.completed_at
      const daysSince = lastActivity ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / 86400000) : null
      return { courseId: enrol.course_id, courseTitle: enrol.course?.title, total, done, pct: total > 0 ? Math.round(done / total * 100) : 0, lastActivity, daysSince }
    }))
    setProgress(progressData)
    setLoading(false)
  }

  if (loading) return <div style={{ padding: '2rem', color: t.muted }}>Loading…</div>
  if (!profile) return <div style={{ padding: '2rem', color: t.muted }}>User not found</div>

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ maxWidth: '720px' }}>
      <button onClick={onBack} style={{ fontSize: '0.8rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>← Back to users</button>

      {/* Contact */}
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '1.25rem', backgroundColor: t.surface, marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.muted, margin: '0 0 12px' }}>Contact</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: t.dim, margin: '0 0 2px' }}>Full name</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: t.text, margin: 0 }}>{profile.full_name || '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: t.dim, margin: '0 0 2px' }}>Email</p>
            <p style={{ fontSize: '0.875rem', color: t.text, margin: 0 }}>{profile.email}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: t.dim, margin: '0 0 2px' }}>Joined</p>
            <p style={{ fontSize: '0.855rem', color: t.muted, margin: 0 }}>{joinedDate}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: t.dim, margin: '0 0 2px' }}>Role</p>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: profile.role === 'admin' ? '#6366f115' : '#10b98115', color: profile.role === 'admin' ? '#6366f1' : '#10b981' }}>{profile.role || 'student'}</span>
          </div>
        </div>
      </div>

      {/* Enrollments + Progress */}
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '1.25rem', backgroundColor: t.surface }}>
        <h2 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.muted, margin: '0 0 12px' }}>Courses & Progress</h2>
        {enrollments.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: t.dim }}>No enrollments</p>
        ) : enrollments.map((enrol: any, i: number) => {
          const prog = progress[i]
          const inactive = prog?.daysSince !== null && prog?.daysSince > 14
          return (
            <div key={enrol.id} style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1rem', marginBottom: '10px', backgroundColor: t.bg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: t.text, margin: '0 0 3px' }}>{enrol.course?.title}</p>
                  <p style={{ fontSize: '0.75rem', color: t.dim, margin: 0 }}>
                    Enrolled {new Date(enrol.enrolled_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {enrol.amount_paid ? ` · $${enrol.amount_paid}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {inactive && <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#f59e0b15', color: '#f59e0b' }}>Inactive {prog.daysSince}d</span>}
                  <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: enrol.status === 'active' ? '#10b98115' : '#ef444415', color: enrol.status === 'active' ? '#10b981' : '#ef4444' }}>{enrol.status}</span>
                </div>
              </div>
              {prog && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.75rem', color: t.muted }}>{prog.done}/{prog.total} lessons completed</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: t.text }}>{prog.pct}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: t.border, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${prog.pct}%`, backgroundColor: prog.pct === 100 ? '#10b981' : '#3b82f6', borderRadius: '3px', transition: 'width 0.4s' }} />
                  </div>
                  {prog.lastActivity && (
                    <p style={{ fontSize: '0.7rem', color: t.dim, margin: '5px 0 0' }}>Last activity: {new Date(prog.lastActivity).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Notifications Section ────────────────────────────────────────────────────
function NotificationsSection({ t }: { t: any }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('announcement')
  const [courseId, setCourseId] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    supabase.from('courses').select('id, title').then(({ data }) => setCourses(data || []))
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20).then(({ data }) => setHistory(data || []))
  }, [])

  async function send() {
    if (!title.trim() || !body.trim()) return
    setSending(true)
    const payload: any = { title: title.trim(), body: body.trim(), type }
    if (courseId) payload.course_id = courseId
    const { data, error } = await supabase.from('notifications').insert(payload).select().single()
    if (!error && data) {
      setHistory(h => [data, ...h])
      setTitle(''); setBody(''); setCourseId(''); setType('announcement')
      setSent(true); setTimeout(() => setSent(false), 2500)
    }
    setSending(false)
  }

  async function deleteNotif(id: string) {
    if (!confirm('Delete this notification?')) return
    await supabase.from('notifications').delete().eq('id', id)
    setHistory(h => h.filter(n => n.id !== id))
  }

  const typeColors: Record<string, string> = { announcement: '#6366f1', new_course: '#10b981', event: '#f59e0b', offer: '#ec4899' }
  const typeLabels: Record<string, string> = { announcement: '📢 Announcement', new_course: '🎓 New Course', event: '📅 Event', offer: '🎁 Offer' }

  return (
    <div style={{ maxWidth: '680px' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.5rem', color: t.text }}>Push Notification</h2>

      {/* Compose */}
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '1.25rem', backgroundColor: t.surface, marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none' }}>
              {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Target course (optional)</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)}
              style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none' }}>
              <option value="">All enrolled students</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..."
            style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} placeholder="Notification message..."
            style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={send} disabled={sending || !title.trim() || !body.trim()}
            style={{ backgroundColor: sent ? '#10b981' : t.text, color: sent ? '#fff' : t.bg, border: 'none', borderRadius: '8px', padding: '9px 24px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', opacity: (sending || !title.trim() || !body.trim()) ? 0.5 : 1, transition: 'background-color 0.2s' }}>
            {sent ? '✓ Sent' : sending ? 'Sending…' : 'Send notification'}
          </button>
        </div>
      </div>

      {/* History */}
      <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.muted, margin: '0 0 12px' }}>Sent notifications</h3>
      {history.length === 0 ? (
        <div style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '2rem', textAlign: 'center', color: t.muted, fontSize: '0.875rem' }}>No notifications sent yet</div>
      ) : history.map(n => (
        <div key={n.id} style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: t.surface }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: `${typeColors[n.type]}15`, color: typeColors[n.type] }}>{typeLabels[n.type] || n.type}</span>
              <span style={{ fontSize: '0.68rem', color: t.dim }}>{new Date(n.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p style={{ fontSize: '0.855rem', fontWeight: 600, color: t.text, margin: '0 0 2px' }}>{n.title}</p>
            <p style={{ fontSize: '0.8rem', color: t.muted, margin: 0 }}>{n.body}</p>
          </div>
          <button onClick={() => deleteNotif(n.id)} style={{ fontSize: '0.75rem', color: '#ef444460', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: '12px' }}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export default function Admin() {
  const { loading, isAuthenticated, isAdmin, profile } = useAuth()
  const [section, setSection] = useState<AdminSection>('overview')
  const [coursesOpen, setCoursesOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [courseTree, setCourseTree] = useState<any[]>([])
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('fv-theme') !== 'light' } catch { return true }
  })
  const t = mkT(dark)

  // Drill-down state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    try { localStorage.setItem('fv-theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!isAdmin) window.location.href = '/dashboard'
  }, [loading, isAuthenticated, isAdmin])

  useEffect(() => {
    if (isAdmin) loadCourseTree()
  }, [isAdmin])

  async function loadCourseTree() {
    const { data: courses } = await supabase.from('courses').select('id, title').order('title')
    if (!courses) return
    const tree = await Promise.all(courses.map(async (course: any) => {
      const { data: modules } = await supabase.from('modules').select('id, title, position').eq('course_id', course.id).order('position')
      const modulesWithLessons = await Promise.all((modules || []).map(async (mod: any) => {
        const { data: lessons } = await supabase.from('lessons').select('id, title, position').eq('module_id', mod.id).order('position')
        const lessonsWithSections = await Promise.all((lessons || []).map(async (lesson: any) => {
          const { data: sections } = await supabase.from('sections').select('id, title, content_type, position').eq('lesson_id', lesson.id).order('position')
          return { ...lesson, sections: sections || [] }
        }))
        return { ...mod, lessons: lessonsWithSections }
      }))
      return { ...course, modules: modulesWithLessons }
    }))
    setCourseTree(tree)
  }

  if (loading || !isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0f' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const isCourseSection = section === 'courses_new' || section === 'courses_edit'
  const initials = profile?.full_name ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'A'

  function navBtn(id: AdminSection, label: string, Icon: () => JSX.Element) {
    const active = section === id && !isCourseSection
    return (
      <button onClick={() => { setSection(id); setCoursesOpen(false); setEditingCourse(null); setEditingLesson(null) }}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, marginBottom: '1px', transition: 'all 0.12s', backgroundColor: active ? t.activeNavBg : 'transparent', color: active ? t.activeNavText : t.navText, fontWeight: active ? 500 : 400, fontSize: '0.855rem' }}>
        <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}><Icon /></span>
        <span>{label}</span>
      </button>
    )
  }

  // Breadcrumb
  function Breadcrumb() {
    const crumbs: string[] = []
    if (section === 'courses_new') crumbs.push('Courses', 'New course')
    else if (section === 'courses_edit') {
      crumbs.push('Courses', 'Edit')
      if (editingCourse) crumbs.push(editingCourse.title)
      if (editingLesson) crumbs.push(editingLesson.title)
    } else {
      crumbs.push({ overview: 'Overview', users: 'Users', enrollments: 'Enrollments', analytics: 'Analytics', notifications: 'Notifications' }[section] || '')
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {i > 0 && <span style={{ color: t.dim }}>/</span>}
            <span style={{ color: i === crumbs.length - 1 ? t.text : t.muted, fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>{c}</span>
          </span>
        ))}
      </div>
    )
  }

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
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: dark ? '#252530' : '#ebebf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: t.muted, flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 500, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || 'Admin'}</p>
              <p style={{ fontSize: '0.68rem', color: t.amber }}>Administrator</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.muted, padding: '8px 12px 4px', margin: 0, opacity: 0.5 }}>Platform</p>
          {navBtn('overview', 'Overview', I.overview)}
          {navBtn('users', 'Users', I.users)}
          {navBtn('enrollments', 'Enrollments', I.enrollments)}
          {navBtn('analytics', 'Analytics', I.analytics)}
          {navBtn('notifications', 'Notifications', () => <span style={{fontSize:'0.9rem'}}>🔔</span>)}

          {/* ── COURSES ── */}
          <div style={{ marginTop: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.muted, margin: 0, opacity: 0.5 }}>Courses</p>
            <button onClick={() => { setSection('courses_new'); setEditingCourse(null); setEditingLesson(null) }}
              style={{ fontSize: '0.7rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '5px', padding: '2px 7px', cursor: 'pointer' }}>+ New</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '8px' }}>
            {courseTree.map((course: any) => (
              <div key={course.id}>
                <button onClick={() => setExpandedCourses(s => { const n = new Set(s); n.has(course.id) ? n.delete(course.id) : n.add(course.id); return n })}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', padding: '6px 12px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: t.text, fontSize: '0.82rem', fontWeight: 500, textAlign: 'left' as const }}>
                  <span style={{ fontSize: '0.55rem', opacity: 0.4, flexShrink: 0 }}>{expandedCourses.has(course.id) ? '▼' : '▶'}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{course.title}</span>
                </button>
                {expandedCourses.has(course.id) && course.modules.map((mod: any) => (
                  <div key={mod.id} style={{ marginLeft: '16px', borderLeft: `1px solid ${t.border}`, paddingLeft: '8px' }}>
                    <button onClick={() => setExpandedModules(s => { const n = new Set(s); n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id); return n })}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '5px 8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: t.muted, fontSize: '0.78rem', textAlign: 'left' as const }}>
                      <span style={{ fontSize: '0.5rem', opacity: 0.4, flexShrink: 0 }}>{expandedModules.has(mod.id) ? '▼' : '▶'}</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{mod.title}</span>
                    </button>
                    {expandedModules.has(mod.id) && mod.lessons.map((lesson: any) => (
                      <div key={lesson.id} style={{ marginLeft: '10px', borderLeft: `1px solid ${t.border}`, paddingLeft: '8px' }}>
                        <button onClick={() => { setExpandedLessons(s => { const n = new Set(s); n.has(lesson.id) ? n.delete(lesson.id) : n.add(lesson.id); return n }); setEditingLesson(lesson); setSection('courses_edit' as any) }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '4px 8px', border: 'none', cursor: 'pointer', backgroundColor: editingLesson?.id === lesson.id ? t.subNavBg : 'transparent', color: editingLesson?.id === lesson.id ? t.text : t.muted, fontSize: '0.75rem', textAlign: 'left' as const, borderRadius: '5px' }}>
                          <span style={{ fontSize: '0.5rem', opacity: 0.4, flexShrink: 0 }}>{expandedLessons.has(lesson.id) ? '▼' : '▶'}</span>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{lesson.title}</span>
                        </button>
                        {expandedLessons.has(lesson.id) && lesson.sections.map((sec: any) => (
                          <button key={sec.id}
                            onClick={() => { setActiveSectionId(sec.id); setEditingLesson(lesson); setSection('courses_edit' as any) }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '3px 8px 3px 18px', border: 'none', cursor: 'pointer', textAlign: 'left' as const, borderRadius: '5px', backgroundColor: activeSectionId === sec.id ? t.subNavBg : 'transparent', color: activeSectionId === sec.id ? t.text : t.dim, fontSize: '0.72rem', marginBottom: '1px' }}>
                            <span style={{ opacity: 0.5, flexShrink: 0 }}>{sec.content_type === 'video' ? '🎬' : sec.content_type === 'audio' ? '🎵' : sec.content_type === 'pdf' ? '📄' : sec.content_type === 'quiz' ? '❓' : sec.content_type === 'slides' ? '🖥️' : sec.content_type === 'excel' ? '📊' : '📝'}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{sec.title}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            {courseTree.length === 0 && (
              <p style={{ fontSize: '0.75rem', color: t.dim, padding: '8px 12px' }}>No courses yet</p>
            )}
          </div>
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
        <div style={{ padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, backgroundColor: t.bg, zIndex: 10 }}>
          <Breadcrumb />
        </div>
        <div style={{ padding: '28px 32px' }}>
          {section === 'overview' && <OverviewSection t={t} onNavigate={(s) => { setSection(s); if (s === 'courses_edit') setCoursesOpen(true) }} />}
          {section === 'courses_new' && <CourseForm course={null} t={t} onSaved={(c) => { setSection('courses_edit'); setEditingCourse(c); setCoursesOpen(true); loadCourseTree() }} />}
          {section === 'courses_edit' && !editingCourse && <CourseList t={t} onSelect={(c) => setEditingCourse(c)} />}
          {section === 'courses_edit' && editingCourse && !editingLesson && (
            <CourseEditor
              course={editingCourse}
              t={t}
              onBack={() => setEditingCourse(null)}
              onEditLesson={(l) => setEditingLesson(l)}
              onTreeChange={() => loadCourseTree()}
            />
          )}
          {section === 'courses_edit' && editingCourse && editingLesson && (
            <LessonEditorPage
              lesson={editingLesson}
              t={t}
              onBack={() => setEditingLesson(null)}
            />
          )}
          {section === 'users' && <UsersSection t={t} onViewProfile={(id) => { setSelectedUserId(id); setSection('user_profile') }} />}
          {section === 'enrollments' && <EnrollmentsSection t={t} />}
          {section === 'analytics' && <AnalyticsSection t={t} />}
          {section === 'notifications' && <NotificationsSection t={t} />}
          {section === 'user_profile' && selectedUserId && <UserProfilePage userId={selectedUserId} t={t} onBack={() => setSection('users')} />}
        </div>
      </main>
    </div>
  )
}

// ─── Course list ──────────────────────────────────────────────────────────────
function CourseList({ t, onSelect }: { t: any; onSelect: (c: Course) => void }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('courses').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setCourses(data || []); setLoading(false) })
  }, [])

  async function togglePublish(e: React.MouseEvent, course: Course) {
    e.stopPropagation()
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id)
    setCourses(p => p.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c))
  }

  if (loading) return <p style={{ color: t.muted }}>Loading…</p>

  if (courses.length === 0) return (
    <div style={{ border: `1px dashed ${t.border}`, borderRadius: '12px', padding: '48px', textAlign: 'center' as const, color: t.muted, fontSize: '0.875rem' }}>
      No courses yet. Use "New course" to create one.
    </div>
  )

  return (
    <div>
      <p style={{ fontSize: '0.855rem', color: t.muted, marginBottom: '16px' }}>{courses.length} course{courses.length !== 1 ? 's' : ''} — click to edit</p>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
        {courses.map(course => (
          <div key={course.id} onClick={() => onSelect(course)}
            style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.surface, cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = t.muted)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                <span style={{ fontWeight: 500, fontSize: '0.9rem', color: t.text }}>{course.title}</span>
                <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${course.is_published ? t.green + '50' : t.border}`, color: course.is_published ? t.green : t.muted }}>
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: t.muted }}>${course.price} · /{course.slug}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={(e) => togglePublish(e, course)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                {course.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={async e => { e.stopPropagation(); if (!confirm(`Delete this course? This cannot be undone.`)) return; await supabase.from('courses').delete().eq('id', course.id); setCourses(p => p.filter(c => c.id !== course.id)) }}
                style={{ fontSize: '0.75rem', color: '#ef444490', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
              <span style={{ fontSize: '0.78rem', color: t.muted }}>Edit →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Course form (new or edit meta) ──────────────────────────────────────────
function CourseForm({ course, t, onSaved }: { course: Course | null; t: any; onSaved?: (c: Course) => void }) {
  const [form, setForm] = useState({ title: course?.title || '', slug: course?.slug || '', description: course?.description || '', price: course?.price || 0 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const isNew = !course?.id

  async function save() {
    setSaving(true)
    if (isNew) {
      const { data } = await supabase.from('courses').insert({ ...form, is_published: false }).select().single()
      setSaving(false)
      if (data && onSaved) onSaved(data)
    } else {
      await supabase.from('courses').update(form).eq('id', course!.id)
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
    }
  }

  const inp = { width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px', color: t.text }}>{isNew ? 'Create new course' : 'Course details'}</h2>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '22px', backgroundColor: t.surface, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Course title…" style={inp} /></div>
        <div><label style={lbl}>Slug</label><input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="url-slug" style={inp} /></div>
        <div><label style={lbl}>Price (USD)</label><input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} style={inp} /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' as const, fontFamily: 'inherit' }} /></div>
        <div>
          <button onClick={save} disabled={saving || !form.title} style={{ backgroundColor: saved ? t.green : t.accent, color: saved ? '#fff' : t.accentText, border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', opacity: (saving || !form.title) ? 0.6 : 1, transition: 'background-color 0.2s' }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : isNew ? 'Create course' : 'Save changes'}
          </button>
          {onSaved && <button type="button" onClick={() => window.history.back()} style={{ fontSize: '0.875rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '8px', padding: '9px 20px', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>
      {isNew && <p style={{ fontSize: '0.78rem', color: t.muted, marginTop: '12px' }}>After creating, you'll be taken to the course editor to add modules and lessons.</p>}
    </div>
  )
}

// ─── Course editor (full page) ────────────────────────────────────────────────
type ModuleWithLessons = Module & { lessons: Lesson[] }

function CourseEditor({ course, t, onBack, onEditLesson, onTreeChange }: { course: Course; t: any; onBack: () => void; onEditLesson: (l: Lesson) => void; onTreeChange?: () => void }) {
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchModules() }, [course.id])

  async function fetchModules() {
    const { data: mods } = await supabase.from('modules').select('*').eq('course_id', course.id).order('position')
    const withLessons = await Promise.all((mods || []).map(async m => {
      const { data: ls } = await supabase.from('lessons').select('*').eq('module_id', m.id).order('position')
      return { ...m, lessons: ls || [] }
    }))
    setModules(withLessons); setLoading(false)
  }

  async function addModule() {
    const title = prompt('Module title:'); if (!title) return
    await supabase.from('modules').insert({ course_id: course.id, title, position: modules.length + 1 })
    fetchModules(); onTreeChange?.()
  }

  async function deleteModule(modId: string) {
    if (!confirm('Delete this module and all its lessons?')) return
    await supabase.from('modules').delete().eq('id', modId)
    fetchModules(); onTreeChange?.()
  }

  async function addLesson(moduleId: string, pos: number) {
    const title = prompt('Lesson title:'); if (!title) return
    const { data } = await supabase.from('lessons').insert({ module_id: moduleId, course_id: course.id, title, content_type: 'text', position: pos, is_published: true }).select().single()
    fetchModules()
    if (data) onEditLesson(data)
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson?')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    fetchModules(); onTreeChange?.()
  }

  return (
    <div>
      {/* Back + course meta edit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: `1px solid ${t.border}`, color: t.muted, cursor: 'pointer', fontSize: '0.8rem', borderRadius: '7px', padding: '6px 12px' }}>
          <I.back /> Back
        </button>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: t.text, margin: 0 }}>{course.title}</h2>
          <p style={{ fontSize: '0.75rem', color: t.muted, margin: 0 }}>${course.price} · /{course.slug}</p>
        </div>
      </div>

      {/* Inline course meta form */}
      <CourseForm course={course} t={t} />

      <div style={{ height: '1px', backgroundColor: t.border, margin: '24px 0' }} />

      {/* Modules & Lessons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: t.text }}>Modules & Lessons</h3>
        <button onClick={addModule} style={{ fontSize: '0.78rem', color: t.muted, border: `1px solid ${t.border}`, background: 'none', borderRadius: '7px', padding: '6px 14px', cursor: 'pointer' }}>+ Add module</button>
      </div>

      {loading ? <p style={{ color: t.muted }}>Loading…</p> : modules.length === 0 ? (
        <div style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '32px', textAlign: 'center' as const, color: t.muted, fontSize: '0.875rem' }}>No modules yet. Add one above.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
          {modules.map((mod, mIdx) => (
            <div key={mod.id} style={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', backgroundColor: t.surface }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.68rem', color: t.dim, fontWeight: 600 }}>M{mIdx + 1}</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem', color: t.text }}>{mod.title}</span>
                  <span style={{ fontSize: '0.68rem', color: t.muted }}>{mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => addLesson(mod.id, mod.lessons.length + 1)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>+ lesson</button>
                  <button onClick={() => deleteModule(mod.id)} style={{ fontSize: '0.75rem', color: t.red + '80', background: 'none', border: 'none', cursor: 'pointer' }}>delete</button>
                </div>
              </div>
              {mod.lessons.map((lesson, lIdx) => (
                <div key={lesson.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${t.border}`, cursor: 'pointer', transition: 'background-color 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = t.dim + '20')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.68rem', color: t.dim, width: 18 }}>{lIdx + 1}</span>
                    <span style={{ fontSize: '0.855rem', color: t.muted }}>{lesson.title}</span>
                    <span style={{ fontSize: '0.65rem', border: `1px solid ${t.border}`, borderRadius: '4px', padding: '1px 5px', color: t.dim }}>{lesson.content_type}</span>
                    {!lesson.is_published && <span style={{ fontSize: '0.65rem', color: t.amber }}>draft</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => onEditLesson(lesson)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>Edit sections →</button>
                    <button onClick={() => deleteLesson(lesson.id)} style={{ fontSize: '0.75rem', color: t.red + '80', background: 'none', border: 'none', cursor: 'pointer' }}>delete</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Lesson editor page (sections, full page, no modal) ───────────────────────
function LessonEditorPage({ lesson, t, onBack }: { lesson: Lesson; t: any; onBack: () => void }) {
  const [title, setTitle] = useState(lesson.title)
  const [durationMinutes, setDurationMinutes] = useState(lesson.duration_minutes || 0)
  const [isPublished, setIsPublished] = useState(lesson.is_published)
  const [sections, setSections] = useState<Section[]>([])
  const [loadingSections, setLoadingSections] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchSections() }, [lesson.id])

  async function fetchSections() {
    const { data } = await supabase.from('sections').select('*').eq('lesson_id', lesson.id).order('position')
    setSections(data || []); setLoadingSections(false)
  }

  async function saveLesson() {
    setSaving(true)
    await supabase.from('lessons').update({ title, duration_minutes: durationMinutes || null, is_published: isPublished }).eq('id', lesson.id)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function addSection() {
    const { data } = await supabase.from('sections').insert({ lesson_id: lesson.id, title: 'New section', content_type: 'text', position: sections.length + 1 }).select().single()
    if (data) setSections(s => [...s, data])
  }

  async function saveSection(sectionId: string, updates: Partial<Section>) {
    await supabase.from('sections').update(updates).eq('id', sectionId)
    setSections(s => s.map(sec => sec.id === sectionId ? { ...sec, ...updates } : sec))
  }

  async function deleteSection(sectionId: string) {
    await supabase.from('sections').delete().eq('id', sectionId)
    setSections(s => s.filter(sec => sec.id !== sectionId))
  }

  const inp = { width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: `1px solid ${t.border}`, color: t.muted, cursor: 'pointer', fontSize: '0.8rem', borderRadius: '7px', padding: '6px 12px', marginBottom: '24px' }}>
        <I.back /> Back to course
      </button>

      {/* Lesson meta */}
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '20px', backgroundColor: t.surface, marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '14px', marginBottom: '14px' }}>
          <div><label style={lbl}>Lesson title</label><input value={title} onChange={e => setTitle(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Duration (min)</label><input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} min={0} style={inp} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="pub" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: t.green }} />
            <label htmlFor="pub" style={{ fontSize: '0.8rem', color: t.muted, cursor: 'pointer' }}>Published</label>
          </div>
          <button onClick={saveLesson} disabled={saving} style={{ backgroundColor: saved ? t.green : t.accent, color: saved ? '#fff' : t.accentText, border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '0.855rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1, transition: 'background-color 0.2s' }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save lesson'}
          </button>
          <button onClick={onBack} style={{ fontSize: '0.855rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' }}>← Back</button>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: t.text }}>Sections ({sections.length})</h3>
        <button onClick={addSection} style={{ fontSize: '0.78rem', color: t.muted, border: `1px solid ${t.border}`, background: 'none', borderRadius: '7px', padding: '6px 14px', cursor: 'pointer' }}>+ Add section</button>
      </div>

      {loadingSections ? <p style={{ color: t.muted }}>Loading sections…</p> : sections.length === 0 ? (
        <div style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '32px', textAlign: 'center' as const, color: t.muted, fontSize: '0.875rem' }}>
          No sections yet. Add one to start building this lesson.
        </div>
      ) : (
        sections.map(section => (
          <SectionBlock key={section.id} section={section} t={t} onSave={u => saveSection(section.id, u)} onDelete={() => deleteSection(section.id)} />
        ))
      )}
    </div>
  )
}


// ─── File uploader (for Admin SectionBlock) ───────────────────────────────────
function AdminFileUploader({ bucket, accept, icon, label, maxMB, value, onChange, t }: {
  bucket: string; accept: string; icon: string; label: string; maxMB: number
  value: string; onChange: (v: string) => void; t: any
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > maxMB * 1024 * 1024) { alert(`File must be under ${maxMB}MB.`); return }
    setUploading(true); setProgress(20)
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const { error } = await supabase.storage.from(bucket).upload(filename, file, { contentType: file.type })
    setProgress(90)
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); setProgress(0); return }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename)
    onChange(publicUrl); setUploading(false); setProgress(100)
  }

  return (
    <div>
      {value ? (
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.surface }}>
          <span style={{ fontSize: '0.8rem', color: t.muted }}>{icon} File uploaded</span>
          <button onClick={() => onChange('')} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${t.border}`, borderRadius: '8px', padding: '1.5rem', textAlign: 'center' as const, cursor: 'pointer' }}>
          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{icon}</div>
          <p style={{ fontSize: '0.875rem', color: t.text, marginBottom: '4px' }}>{uploading ? `Uploading… ${progress}%` : `Click to upload ${label}`}</p>
          <p style={{ fontSize: '0.75rem', color: t.muted }}>Max {maxMB}MB</p>
          {uploading && <div style={{ marginTop: '10px', height: '4px', backgroundColor: t.border, borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s' }} /></div>}
        </div>
      )}
      <input ref={fileRef} type="file" accept={accept} onChange={handleFile} style={{ display: 'none' }} />
      <div style={{ marginTop: '8px' }}>
        <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Or paste URL</label>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
          style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }} />
      </div>
    </div>
  )
}

// ─── Quiz builder (for Admin SectionBlock) ────────────────────────────────────
function AdminQuizBuilder({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  let questions: QuizQuestion[] = []
  try { questions = JSON.parse(value || '[]') } catch { questions = [] }

  function update(qs: QuizQuestion[]) { onChange(JSON.stringify(qs, null, 2)) }

  function addQ(type: QuizType) {
    const base = { type, question: '', explanation: '', image_url: '' }
    if (type === 'multiple_choice') update([...questions, { ...base, options: ['', '', '', ''], correct_index: 0 }])
    else if (type === 'fill_blank') update([...questions, { ...base, correct_answer: '' }])
    else update([...questions, { ...base, pairs: [{ left: '', right: '' }, { left: '', right: '' }] }])
  }

  function removeQ(qi: number) { update(questions.filter((_, i) => i !== qi)) }

  function updateQ(qi: number, field: string, val: any) {
    const qs = [...questions]; qs[qi] = { ...qs[qi], [field]: val }; update(qs)
  }

  function updateOption(qi: number, oi: number, val: string) {
    const qs = [...questions]; const opts = [...(qs[qi].options || [])]; opts[oi] = val
    qs[qi] = { ...qs[qi], options: opts }; update(qs)
  }

  function updatePair(qi: number, pi: number, side: 'left' | 'right', val: string) {
    const qs = [...questions]; const pairs = [...(qs[qi].pairs || [])]; pairs[pi] = { ...pairs[pi], [side]: val }
    qs[qi] = { ...qs[qi], pairs }; update(qs)
  }

  const typeColors: Record<QuizType, string> = { multiple_choice: '#3b82f6', fill_blank: '#10b981', matching: '#f59e0b' }
  const typeLabels: Record<QuizType, string> = { multiple_choice: 'Multiple choice', fill_blank: 'Fill in the blank', matching: 'Matching' }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
        {(['multiple_choice', 'fill_blank', 'matching'] as QuizType[]).map(type => (
          <button key={type} onClick={() => addQ(type)}
            style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '7px', border: `1px solid ${typeColors[type]}50`, color: typeColors[type], background: `${typeColors[type]}10`, cursor: 'pointer' }}>
            + {typeLabels[type]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
        {questions.map((q, qi) => (
          <div key={qi} style={{ border: `1px solid ${typeColors[q.type]}30`, borderRadius: '9px', padding: '12px', backgroundColor: t.surface }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: `${typeColors[q.type]}15`, color: typeColors[q.type] }}>{typeLabels[q.type]}</span>
              <button onClick={() => removeQ(qi)} style={{ fontSize: '0.72rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
            </div>
            <textarea value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)}
              placeholder={q.type === 'fill_blank' ? 'Use ___ to mark the blank.' : 'Enter question...'}
              rows={2} style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '7px 10px', fontSize: '0.855rem', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, marginBottom: '8px', fontFamily: 'inherit' }} />
            {q.type === 'multiple_choice' && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '5px' }}>
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <input type="radio" name={`aq-${qi}`} checked={q.correct_index === oi} onChange={() => updateQ(qi, 'correct_index', oi)} style={{ cursor: 'pointer', accentColor: '#10b981' }} />
                    <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`}
                      style={{ flex: 1, backgroundColor: t.bg, border: `1px solid ${q.correct_index === oi ? '#10b98150' : t.border}`, color: t.text, borderRadius: '5px', padding: '5px 8px', fontSize: '0.8rem', outline: 'none' }} />
                  </div>
                ))}
                <button onClick={() => { const qs = [...questions]; qs[qi].options = [...(qs[qi].options || []), '']; update(qs) }}
                  style={{ fontSize: '0.72rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, padding: '2px 0' }}>+ Add option</button>
              </div>
            )}
            {q.type === 'fill_blank' && (
              <input value={q.correct_answer || ''} onChange={e => updateQ(qi, 'correct_answer', e.target.value)} placeholder="Correct answer..."
                style={{ width: '100%', backgroundColor: t.bg, border: `1px solid #10b98150`, color: t.text, borderRadius: '5px', padding: '7px 10px', fontSize: '0.855rem', outline: 'none', boxSizing: 'border-box' as const }} />
            )}
            {q.type === 'matching' && (
              <div>
                {(q.pairs || []).map((pair, pi) => (
                  <div key={pi} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '5px' }}>
                    <input value={pair.left} onChange={e => updatePair(qi, pi, 'left', e.target.value)} placeholder={`Left ${pi + 1}`}
                      style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '5px', padding: '5px 8px', fontSize: '0.8rem', outline: 'none' }} />
                    <input value={pair.right} onChange={e => updatePair(qi, pi, 'right', e.target.value)} placeholder={`Right ${pi + 1}`}
                      style={{ backgroundColor: t.bg, border: `1px solid #f59e0b50`, color: t.text, borderRadius: '5px', padding: '5px 8px', fontSize: '0.8rem', outline: 'none' }} />
                  </div>
                ))}
                <button onClick={() => { const qs = [...questions]; qs[qi].pairs = [...(qs[qi].pairs || []), { left: '', right: '' }]; update(qs) }}
                  style={{ fontSize: '0.72rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add pair</button>
              </div>
            )}
            <div style={{ marginTop: '7px' }}>
              <input value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} placeholder="Explanation..."
                style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '5px', padding: '5px 8px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div style={{ border: `1px dashed ${t.border}`, borderRadius: '8px', padding: '1.5rem', textAlign: 'center' as const, color: t.muted, fontSize: '0.855rem' }}>
            Add a question type above
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section block (inline, collapsible) ─────────────────────────────────────
function SectionBlock({ section, t, onSave, onDelete }: { section: Section; t: any; onSave: (u: Partial<Section>) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(section.title === 'New section')
  const [title, setTitle] = useState(section.title)
  const [contentType, setContentType] = useState(section.content_type)
  const [contentText, setContentText] = useState(section.content_text || '')
  const [contentUrl, setContentUrl] = useState(section.content_url || '')
  const [saving, setSaving] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  async function save() {
    setSaving(true)
    await onSave({ title, content_type: contentType, content_text: contentText || null, content_url: contentUrl || null })
    setSaving(false)
  }

  const tabs = [
    { id: 'text', icon: '📝' }, { id: 'video', icon: '🎬' }, { id: 'audio', icon: '🎵' },
    { id: 'pdf', icon: '📄' }, { id: 'slides', icon: '🖥️' }, { id: 'excel', icon: '📊' }, { id: 'quiz', icon: '❓' },
  ]

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', backgroundColor: t.surface, cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ opacity: 0.4 }}>{I.chevron(open)}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: title && title !== 'New section' ? t.text : t.muted }}>{title || 'Untitled section'}</span>
          <span style={{ fontSize: '0.65rem', border: `1px solid ${t.border}`, borderRadius: '4px', padding: '1px 5px', color: t.dim }}>{contentType}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); if (confirm('Delete this section?')) onDelete() }} style={{ fontSize: '0.75rem', color: t.red + '70', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
      </div>

      {open && (
        <div style={{ padding: '16px', backgroundColor: t.bg }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Section title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setContentType(tab.id as any)}
                style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid ${contentType === tab.id ? t.text : t.border}`, backgroundColor: contentType === tab.id ? t.text : 'transparent', color: contentType === tab.id ? t.bg : t.muted, fontSize: '0.75rem', cursor: 'pointer' }}>
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>

          {contentType === 'text' && (
            <RichEditorInline value={contentText} onChange={setContentText} t={t} />
          )}
          {contentType === 'video' && (
            <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://www.youtube.com/embed/VIDEO_ID"
              style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
          )}
          {contentType === 'audio' && (
            <AdminFileUploader bucket="lesson-audio" accept="audio/*" icon="🎵" label="audio" maxMB={100} value={contentUrl} onChange={setContentUrl} t={t} />
          )}
          {contentType === 'pdf' && (
            <div>
              <AdminFileUploader bucket="lesson-pdfs" accept="application/pdf" icon="📄" label="PDF" maxMB={50} value={contentUrl} onChange={setContentUrl} t={t} />
              {contentUrl && <iframe src={contentUrl} style={{ width: '100%', height: '360px', border: `1px solid ${t.border}`, borderRadius: '8px', marginTop: '10px' }} />}
            </div>
          )}
          {contentType === 'slides' && (
            <div>
              <AdminFileUploader bucket="lesson-pdfs" accept=".pptx,.ppt,.odp" icon="🖥️" label="PowerPoint" maxMB={50} value={contentUrl} onChange={setContentUrl} t={t} />
              {contentUrl && contentUrl.startsWith('http') && (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(contentUrl)}`}
                  style={{ width: '100%', height: '400px', border: `1px solid ${t.border}`, borderRadius: '8px', marginTop: '10px' }}
                  allowFullScreen
                />
              )}
              <p style={{ fontSize: '0.7rem', color: t.muted, marginTop: '6px' }}>
                Tip: For best results, upload to OneDrive and paste the embed URL, or use Google Slides embed URL.
              </p>
            </div>
          )}
          {contentType === 'excel' && (
            <AdminFileUploader bucket="lesson-excel" accept=".xlsx,.xls,.csv" icon="📊" label="Excel" maxMB={20} value={contentUrl} onChange={setContentUrl} t={t} />
          )}
          {contentType === 'quiz' && (
            <AdminQuizBuilder value={contentText} onChange={setContentText} t={t} />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={save} disabled={saving} style={{ backgroundColor: t.accent, color: t.accentText, border: 'none', borderRadius: '7px', padding: '8px 20px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save section'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Inline rich editor (no modal dependency) ─────────────────────────────────
function RichEditorInline({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr')
  const [font, setFont] = useState('inherit')

  useEffect(() => {
    if (!document.getElementById('arabic-font')) {
      const link = document.createElement('link'); link.id = 'arabic-font'; link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&family=Amiri:wght@400;700&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) ref.current.innerHTML = value || ''
  }, [])

  function exec(cmd: string, val?: string) {
    ref.current?.focus()
    document.execCommand(cmd, false, val ?? undefined)
    setTimeout(sync, 0)
  }
  function sync() { if (ref.current) onChange(ref.current.innerHTML) }

  function toggleDir() {
    const newDir = dir === 'ltr' ? 'rtl' : 'ltr'
    setDir(newDir)
    if (ref.current) {
      ref.current.dir = newDir
      ref.current.style.direction = newDir
      ref.current.style.textAlign = newDir === 'rtl' ? 'right' : 'left'
    }
  }

  function insertList(ordered: boolean) {
    ref.current?.focus()
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false)
    // Ensure list items have proper styling
    setTimeout(() => {
      if (ref.current) {
        ref.current.querySelectorAll('ul, ol').forEach(el => {
          (el as HTMLElement).style.paddingLeft = '1.5em'
          ;(el as HTMLElement).style.margin = '0.5em 0'
        })
      }
      sync()
    }, 0)
  }

  function applyFont(fontFamily: string) {
    setFont(fontFamily)
    if (ref.current) ref.current.style.fontFamily = fontFamily
    sync()
  }

  const btn = (extra?: any) => ({ padding: '3px 7px', fontSize: '0.72rem', border: `1px solid ${t.border}`, borderRadius: '4px', cursor: 'pointer', background: 'transparent', color: t.muted, lineHeight: 1.2, ...extra })
  const sep = { width: 1, background: t.border, alignSelf: 'stretch' as const, margin: '0 2px' }

  const fonts = [
    { label: 'Default', value: 'inherit' },
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Sans', value: 'Arial, sans-serif' },
    { label: 'Cairo (AR)', value: 'Cairo, sans-serif' },
    { label: 'Amiri (AR)', value: 'Amiri, serif' },
  ]

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '3px', padding: '7px 10px', borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface, alignItems: 'center' }}>
        <button type="button" onClick={() => exec('undo')} style={btn()}>↩</button>
        <button type="button" onClick={() => exec('redo')} style={btn()}>↪</button>
        <span style={sep} />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('bold') }} style={btn()}><b>B</b></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('italic') }} style={btn()}><i>I</i></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('underline') }} style={btn()}><u>U</u></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('strikeThrough') }} style={btn()}><s>S</s></button>
        <span style={sep} />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h2') }} style={btn()}>H2</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h3') }} style={btn()}>H3</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p') }} style={btn()}>¶</button>
        <span style={sep} />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('justifyLeft') }} style={btn()}>⬅</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('justifyCenter') }} style={btn()}>☰</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('justifyRight') }} style={btn()}>➡</button>
        <span style={sep} />
        <button type="button" onMouseDown={e => { e.preventDefault(); insertList(false) }} style={btn()}>• List</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); insertList(true) }} style={btn()}>1.</button>
        <span style={sep} />
        <button type="button" onMouseDown={e => { e.preventDefault(); toggleDir() }}
          style={btn({ color: dir === 'rtl' ? t.amber : t.muted, borderColor: dir === 'rtl' ? t.amber + '60' : t.border })}>
          {dir.toUpperCase()}
        </button>
        <span style={sep} />
        <select value={font} onChange={e => applyFont(e.target.value)}
          style={{ fontSize: '0.72rem', padding: '3px 5px', border: `1px solid ${t.border}`, borderRadius: '4px', backgroundColor: t.bg, color: t.muted, cursor: 'pointer' }}>
          {fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select onChange={e => { ref.current?.focus(); document.execCommand('fontSize', false, e.target.value); setTimeout(sync, 0) }} defaultValue=""
          style={{ fontSize: '0.72rem', padding: '3px 5px', border: `1px solid ${t.border}`, borderRadius: '4px', backgroundColor: t.bg, color: t.muted, cursor: 'pointer' }}>
          <option value="" disabled>Size</option>
          {['1','2','3','4','5','6','7'].map((s, i) => <option key={s} value={s}>{[10,12,14,16,18,24,32][i]}px</option>)}
        </select>
      </div>
      <style>{`
          .fv-editor ul { list-style-type: disc !important; padding-left: 1.5em !important; margin: 0.5em 0 !important; }
          .fv-editor ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin: 0.5em 0 !important; }
          .fv-editor li { display: list-item !important; }
        `}</style>
        <div ref={ref} contentEditable suppressContentEditableWarning onInput={sync} onBlur={sync} className="fv-editor"
        style={{ minHeight: '160px', padding: '12px', outline: 'none', backgroundColor: t.bg, color: t.text, fontSize: '0.875rem', lineHeight: 1.7, fontFamily: font, direction: dir, textAlign: dir === 'rtl' ? 'right' : 'left' }} />
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
      setStats({ users: u || 0, enrollments: en || 0, completed: co || 0, revenue: (rev || []).reduce((s: number, e: any) => s + (e.amount_paid || 0), 0), courses: cr || 0, published: pub || 0 })
      setRecent(rec || []); setLoading(false)
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

// ─── Users ────────────────────────────────────────────────────────────────────
function UsersSection({ t, onViewProfile }: { t: any; onViewProfile: (id: string) => void }) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

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
                <tr key={u.id} onClick={() => onViewProfile(u.id)} style={{ borderTop: `1px solid ${t.border}`, cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = t.surface} onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '11px 16px', color: t.text }}>{u.email}</td>
                  <td style={{ padding: '11px 16px', color: t.muted }}>{u.full_name || '—'}</td>
                  <td style={{ padding: '11px 16px' }}><span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${u.role === 'admin' ? t.amber + '50' : t.border}`, color: u.role === 'admin' ? t.amber : t.muted }}>{u.role}</span></td>
                  <td style={{ padding: '11px 16px', color: t.muted, fontSize: '0.78rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right' as const }}>
                    <button onClick={async () => { const role = u.role === 'admin' ? 'student' : 'admin'; await supabase.from('profiles').update({ role }).eq('id', u.id); setUsers(p => p.map(x => x.id === u.id ? { ...x, role } : x)) }} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                      {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                    </button>
                  </td>
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

  useEffect(() => {
    Promise.all([
      supabase.from('enrollments').select('*, profiles(*), courses(title)').order('enrolled_at', { ascending: false }).limit(100),
      supabase.from('courses').select('*').order('title'),
    ]).then(([{ data: enrs }, { data: crs }]) => { setEnrollments(enrs || []); setCourses(crs || []); setLoading(false) })
  }, [])

  async function grant() {
    if (!email || !selectedCourse) return
    setGranting(true); setMsg(null)
    const { data: p } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase()).single()
    if (!p) { setMsg({ text: 'User not found. They must sign in once first.', ok: false }); setGranting(false); return }
    await supabase.from('enrollments').upsert({ user_id: p.id, course_id: selectedCourse, enrolled_at: new Date().toISOString() }, { onConflict: 'user_id,course_id' })
    setMsg({ text: 'Access granted.', ok: true })
    setEmail(''); setSelectedCourse(''); setGranting(false)
    supabase.from('enrollments').select('*, profiles(*), courses(title)').order('enrolled_at', { ascending: false }).limit(100)
      .then(({ data }) => setEnrollments(data || []))
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
      setData({ months, courseStats, totalRevenue, totalCompleted, rate: enrs?.length ? Math.round((totalCompleted / enrs.length) * 100) : 0, total: enrs?.length || 0 })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{ color: t.muted, fontSize: '0.875rem' }}>Loading analytics…</p>

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
            {data.courseStats.length === 0
              ? <tr><td colSpan={4} style={{ padding: '20px', color: t.muted, textAlign: 'center' as const }}>No data yet.</td></tr>
              : data.courseStats.map((c: any) => (
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
