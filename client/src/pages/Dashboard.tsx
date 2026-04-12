import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, Course, Enrollment } from '@/lib/supabase'
import { Link } from 'wouter'

type EnrollmentWithCourse = Enrollment & { course: Course }
type Section = 'courses' | 'catalogue' | 'profile'

const Icons = {
  courses: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  catalogue: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  profile: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  admin: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  sun: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>,
  moon: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  logout: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  bell: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
}


// ─── Notification Bell ────────────────────────────────────────────────────────
interface Notification {
  id: string
  title: string
  body: string
  type: string
  created_at: string
  read?: boolean
}

function NotificationBell({ userId, t }: { userId: string; t: any }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchNotifications() }, [userId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications() {
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: reads } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', userId)

    const readSet = new Set((reads || []).map((r: any) => r.notification_id))
    setReadIds(readSet)
    setNotifications(notifs || [])
  }

  async function markRead(id: string) {
    if (readIds.has(id)) return
    await supabase.from('notification_reads').upsert({ notification_id: id, user_id: userId })
    setReadIds(prev => new Set([...prev, id]))
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !readIds.has(n.id))
    if (!unread.length) return
    await supabase.from('notification_reads').upsert(
      unread.map(n => ({ notification_id: n.id, user_id: userId }))
    )
    setReadIds(new Set(notifications.map(n => n.id)))
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  const typeIcon: Record<string, string> = {
    announcement: '📢',
    new_course: '🎓',
    event: '📅',
    offer: '🎁',
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) notifications.forEach(n => markRead(n.id)) }}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: t.muted, display: 'flex', alignItems: 'center' }}
        title="Notifications"
      >
        <span style={{ fontSize: '1.1rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#ef4444', color: '#fff',
            fontSize: '0.6rem', fontWeight: 700,
            borderRadius: '999px', minWidth: '16px', height: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', lineHeight: 1,
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 999,
          width: '320px', backgroundColor: t.bg,
          border: `1px solid ${t.border}`, borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', overflow: 'hidden',
          marginTop: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: t.text }}>Notifications</span>
            {unreadCount === 0 ? null : (
              <button onClick={markAllRead} style={{ fontSize: '0.72rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
            )}
          </div>
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: t.muted, fontSize: '0.855rem' }}>No notifications yet</div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)} style={{
                padding: '12px 16px', borderBottom: `1px solid ${t.border}`,
                backgroundColor: readIds.has(n.id) ? 'transparent' : t.surface,
                cursor: 'default',
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{typeIcon[n.type] || '📢'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: readIds.has(n.id) ? 400 : 600, color: t.text }}>{n.title}</span>
                      {!readIds.has(n.id) && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: t.muted, margin: '2px 0 0', lineHeight: 1.4 }}>{n.body}</p>
                    <span style={{ fontSize: '0.68rem', color: t.dim, marginTop: '4px', display: 'block' }}>
                      {new Date(n.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, isAuthenticated, isAdmin, loading } = useAuth()
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [catalogue, setCatalogue] = useState<Course[]>([])
  const [section, setSection] = useState<Section>('courses')
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('fv-theme') !== 'light' } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('fv-theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  useEffect(() => {
    if (!loading && !isAuthenticated) window.location.href = '/login'
  }, [loading, isAuthenticated])

  useEffect(() => {
    if (user) { fetchEnrollments(); fetchCatalogue() }
  }, [user])

  async function fetchEnrollments() {
    const { data } = await supabase.from('enrollments').select('*, course:courses(*)')
      .eq('user_id', user!.id).order('enrolled_at', { ascending: false })
    setEnrollments((data as EnrollmentWithCourse[]) || [])
  }

  async function fetchCatalogue() {
    const { data } = await supabase.from('courses').select('*').eq('is_published', true).order('position')
    setCatalogue(data || [])
  }

  if (loading && !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #222', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const t = dark ? {
    bg: '#0d0d0f', sidebar: '#111115', sidebarBorder: '#1e1e24',
    surface: '#18181d', border: '#1e1e24', text: '#f0f0f5',
    muted: '#6b6b80', dim: '#2a2a35', accent: '#ffffff', accentText: '#000000',
    activeNavBg: '#1e1e28', activeNavText: '#ffffff', navText: '#6b6b80',
    progressBg: '#1e1e24', cardBorder: '#1e1e24',
    green: '#10b981', blue: '#3b82f6', amber: '#f59e0b', indigo: '#6366f1',
  } : {
    bg: '#f4f4f0', sidebar: '#ffffff', sidebarBorder: '#e8e8e2',
    surface: '#ffffff', border: '#e8e8e2', text: '#111118',
    muted: '#888890', dim: '#e8e8e2', accent: '#111118', accentText: '#ffffff',
    activeNavBg: '#111118', activeNavText: '#ffffff', navText: '#888890',
    progressBg: '#e8e8e2', cardBorder: '#e8e8e2',
    green: '#059669', blue: '#2563eb', amber: '#d97706', indigo: '#4f46e5',
  }

  const navItems = [
    { id: 'courses' as Section, label: 'My Courses', Icon: Icons.courses },
    { id: 'catalogue' as Section, label: 'Catalogue', Icon: Icons.catalogue },
    { id: 'profile' as Section, label: 'Profile', Icon: Icons.profile },
  ]

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] || 'S').toUpperCase()

  const sectionTitles = { courses: 'My Courses', catalogue: 'Course Catalogue', profile: 'Profile' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: t.bg, color: t.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.dim};border-radius:2px}`}</style>

      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, backgroundColor: t.sidebar, borderRight: `1px solid ${t.sidebarBorder}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>

        {/* Logo + Bell */}
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${t.sidebarBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', color: t.text }}>
            Fin<span style={{ fontWeight: 300 }}>Verse</span>
          </span>
          {user && <NotificationBell userId={user.id} t={t} />}
        </div>

        {/* User */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: dark ? '#252530' : '#ebebf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: t.muted, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 500, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name || user?.email?.split('@')[0]}
              </p>
              <p style={{ fontSize: '0.7rem', color: t.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.email || user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.muted, padding: '8px 12px 6px', opacity: 0.6 }}>Learning</p>
          {navItems.map(({ id, label, Icon }) => {
            const active = section === id
            return (
              <button key={id} onClick={() => setSection(id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                textAlign: 'left', marginBottom: '1px', transition: 'all 0.12s',
                backgroundColor: active ? t.activeNavBg : 'transparent',
                color: active ? t.activeNavText : t.navText,
                fontWeight: active ? 500 : 400, fontSize: '0.855rem',
              }}>
                <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}><Icon /></span>
                <span>{label}</span>
                {id === 'courses' && enrollments.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.65rem', backgroundColor: active ? (dark ? '#2a2a38' : '#e0e0ea') : t.dim, color: t.muted, borderRadius: '10px', padding: '1px 6px' }}>
                    {enrollments.length}
                  </span>
                )}
              </button>
            )
          })}

          {isAdmin && (
            <>
              <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.muted, padding: '14px 12px 6px', opacity: 0.6 }}>Admin</p>
              <Link href="/admin">
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', backgroundColor: 'transparent', color: t.amber, fontWeight: 400, fontSize: '0.855rem' }}>
                  <span style={{ flexShrink: 0 }}><Icons.admin /></span>
                  <span>Admin panel</span>
                </button>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '10px', borderTop: `1px solid ${t.sidebarBorder}` }}>
          <button onClick={() => setDark(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: dark ? t.amber : t.indigo, fontSize: '0.855rem', marginBottom: '1px' }}>
            <span>{dark ? <Icons.sun /> : <Icons.moon />}</span>
            <span>{dark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/' })} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: t.muted, fontSize: '0.855rem' }}>
            <span><Icons.logout /></span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{ padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, backgroundColor: t.bg, zIndex: 10 }}>
          <h1 style={{ fontSize: '0.95rem', fontWeight: 600, color: t.text }}>{sectionTitles[section]}</h1>
          <button style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: '6px', borderRadius: '6px', position: 'relative' }}>
            <Icons.bell />
            <span style={{ position: 'absolute', top: 5, right: 5, width: 5, height: 5, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          </button>
        </div>

        <div style={{ padding: '28px 32px' }}>

          {/* MY COURSES */}
          {section === 'courses' && (
            enrollments.length === 0 ? (
              <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '52px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>📚</div>
                <p style={{ color: t.text, fontWeight: 500, marginBottom: '6px', fontSize: '0.95rem' }}>No courses yet</p>
                <p style={{ color: t.muted, fontSize: '0.85rem', marginBottom: '22px' }}>Once you purchase a course, it will appear here automatically.</p>
                <button onClick={() => setSection('catalogue')} style={{ backgroundColor: t.accent, color: t.accentText, border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                  Browse catalogue →
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(256px, 1fr))', gap: '14px' }}>
                {enrollments.map(e => <CourseCard key={e.id} enrollment={e} t={t} />)}
              </div>
            )
          )}

          {/* CATALOGUE */}
          {section === 'catalogue' && (
            catalogue.length === 0 ? (
              <p style={{ color: t.muted }}>No courses available yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(256px, 1fr))', gap: '14px' }}>
                {catalogue.map(course => {
                  const enrolled = enrollments.some(e => e.course_id === course.id)
                  return (
                    <div key={course.id} style={{ border: `1px solid ${t.cardBorder}`, borderRadius: '12px', padding: '20px', backgroundColor: t.surface, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', color: t.text, lineHeight: 1.4 }}>{course.title}</h3>
                        {course.description && <p style={{ fontSize: '0.78rem', color: t.muted, lineHeight: 1.5 }}>{course.description.length > 90 ? course.description.slice(0, 90) + '…' : course.description}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        {enrolled
                          ? <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: `${t.green}15`, color: t.green, fontWeight: 500 }}>Enrolled</span>
                          : <span style={{ fontSize: '0.9rem', fontWeight: 700, color: t.text }}>${course.price}</span>
                        }
                        {enrolled
                          ? <Link href={`/learn/${course.id}`}><span style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: '7px', border: `1px solid ${t.border}`, cursor: 'pointer', color: t.text, fontWeight: 500 }}>Continue →</span></Link>
                          : <a href="/blueprint" style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: '7px', backgroundColor: t.accent, color: t.accentText, textDecoration: 'none', fontWeight: 500 }}>Enrol →</a>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* PROFILE */}
          {section === 'profile' && <ProfileSection profile={profile} userId={user?.id || ''} t={t} />}
        </div>
      </main>
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileSection({ profile, userId, t }: { profile: any; userId: string; t: any }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
    }
  }, [profile])

  async function save() {
    setSaving(true); setStatus('idle')
    const full_name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
    const { error } = await supabase.from('profiles').update({ full_name }).eq('id', userId)
    setSaving(false)
    setStatus(error ? 'error' : 'saved')
    if (!error) setTimeout(() => setStatus('idle'), 3000)
  }

  const input = { width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { fontSize: '0.72rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: t.surface }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: t.text }}>Personal information</h2>
          <p style={{ fontSize: '0.78rem', color: t.muted, marginTop: '2px' }}>Update how your name appears on your account.</p>
        </div>
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>First name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" style={input} />
            </div>
            <div>
              <label style={lbl}>Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" style={input} />
            </div>
          </div>
          <div>
            <label style={lbl}>Email address</label>
            <input value={profile?.email || ''} disabled style={{ ...input, color: t.muted, cursor: 'not-allowed' }} />
            <p style={{ fontSize: '0.7rem', color: t.muted, marginTop: '4px', opacity: 0.7 }}>Email cannot be changed.</p>
          </div>
        </div>
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: status === 'saved' ? '#10b981' : status === 'error' ? '#ef4444' : 'transparent' }}>
            {status === 'saved' ? '✓ Saved' : status === 'error' ? 'Failed — try again' : '.'}
          </span>
          <button onClick={save} disabled={saving} style={{ backgroundColor: t.accent, color: t.accentText, border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '0.855rem', fontWeight: 500, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Course card ──────────────────────────────────────────────────────────────
function CourseCard({ enrollment, t }: { enrollment: EnrollmentWithCourse; t: any }) {
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => { fetchProgress() }, [])

  async function fetchProgress() {
    const { data: mods } = await supabase.from('modules').select('id').eq('course_id', enrollment.course_id)
    const modIds = (mods || []).map((m: any) => m.id)
    if (!modIds.length) { setProgress(0); return }
    const { count: total } = await supabase.from('lessons').select('id', { count: 'exact', head: true }).in('module_id', modIds)
    const { count: done } = await supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('enrollment_id', enrollment.id).eq('completed', true)
    setProgress(total && total > 0 ? Math.round(((done || 0) / total) * 100) : 0)
  }

  const pct = progress ?? 0
  const statusColor = pct === 100 ? t.green : pct > 0 ? t.blue : t.muted

  return (
    <div style={{ border: `1px solid ${t.cardBorder}`, borderRadius: '12px', padding: '20px', backgroundColor: t.surface, display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: t.text, lineHeight: 1.4, marginBottom: '4px' }}>{enrollment.course.title}</h3>
        <p style={{ fontSize: '0.72rem', color: t.muted }}>Since {new Date(enrollment.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
      <div>
        <div style={{ height: '3px', backgroundColor: t.progressBg, borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: statusColor, borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
        <p style={{ fontSize: '0.72rem', color: statusColor }}>{pct === 100 ? 'Completed' : pct === 0 ? 'Not started' : `${pct}% complete`}</p>
      </div>
      <Link href={`/learn/${enrollment.course_id}`}>
        <button style={{ width: '100%', padding: '9px', borderRadius: '8px', border: `1px solid ${t.border}`, backgroundColor: 'transparent', color: t.text, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
          {pct === 0 ? 'Start course' : pct === 100 ? 'Review' : 'Continue'} →
        </button>
      </Link>
    </div>
  )
}
