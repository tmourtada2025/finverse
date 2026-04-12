import { useEffect, useState } from 'react'
import LessonEditor from '@/pages/LessonEditor'
import { useAuth } from '@/lib/auth'
import { supabase, Course, Module, Lesson, Profile } from '@/lib/supabase'

type Tab = 'courses' | 'users' | 'enrollments'

function SunIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
}
function MoonIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
}

export default function Admin() {
  const { loading, isAuthenticated, isAdmin } = useAuth()
  const [tab, setTab] = useState<Tab>('courses')
  const [dark, setDark] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!isAdmin) { window.location.href = '/dashboard' }
  }, [loading, isAuthenticated, isAdmin])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isAdmin) return null

  const t = dark
    ? { bg: '#0a0a0a', surface: '#111', border: '#1a1a1a', text: '#fff', muted: '#888', dim: '#444' }
    : { bg: '#f5f5f0', surface: '#fff', border: '#e5e5e0', text: '#111', muted: '#666', dim: '#bbb' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, color: t.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <nav style={{ borderBottom: `1px solid ${t.border}`, padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: t.bg, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Fin<span style={{ fontWeight: 300 }}>Verse</span></span>
          <span style={{ color: t.dim }}>/</span>
          <span style={{ color: t.muted, fontSize: '0.875rem' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setDark(d => !d)} style={{ background: 'none', border: `1px solid ${dark ? '#f59e0b40' : '#6366f140'}`, color: dark ? '#f59e0b' : '#6366f1', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={() => { window.location.href = '/dashboard' }} style={{ fontSize: '0.8rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>Student view</button>
          <button onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/' })} style={{ fontSize: '0.8rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ borderBottom: `1px solid ${t.border}`, padding: '0 2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {(['courses', 'users', 'enrollments'] as Tab[]).map(t2 => (
            <button key={t2} onClick={() => setTab(t2)} style={{ padding: '12px 0', fontSize: '0.875rem', textTransform: 'capitalize', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t2 ? t.text : 'transparent'}`, color: tab === t2 ? t.text : t.muted, cursor: 'pointer', transition: 'all 0.15s' }}>
              {t2}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        {tab === 'courses' && <CoursesTab t={t} />}
        {tab === 'users' && <UsersTab t={t} />}
        {tab === 'enrollments' && <EnrollmentsTab t={t} />}
      </div>
    </div>
  )
}

// ─── Courses tab ──────────────────────────────────────────────────────────────

function CoursesTab({ t }: { t: any }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [selected, setSelected] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  async function togglePublish(course: Course) {
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id)
    fetchCourses()
  }

  if (selected) return <CourseEditor course={selected} onBack={() => { setSelected(null); fetchCourses() }} t={t} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Courses</h2>
        <button
          onClick={() => setSelected({ id: '', title: '', slug: '', subtitle: null, description: '', thumbnail_url: null, price: 0, stripe_price_id: null, stripe_product_id: null, is_published: false, position: 0, created_at: '', updated_at: '' })}
          style={{ backgroundColor: t.text, color: t.bg, border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}
        >+ New course</button>
      </div>

      {loading ? <p style={{ color: t.muted }}>Loading…</p> : courses.length === 0 ? <p style={{ color: t.muted }}>No courses yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {courses.map(course => (
            <div key={course.id} style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.surface }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{course.title}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${course.is_published ? '#10b98150' : t.border}`, color: course.is_published ? '#10b981' : t.muted }}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: t.muted }}>${course.price} · /{course.slug}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => togglePublish(course)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {course.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => setSelected(course)} style={{ fontSize: '0.75rem', border: `1px solid ${t.border}`, background: 'none', color: t.text, borderRadius: '6px', padding: '6px 14px', cursor: 'pointer' }}>Edit →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Course Editor ────────────────────────────────────────────────────────────

type LessonWithEdit = Lesson & { editing?: boolean }
type ModuleWithLessons = Module & { lessons: LessonWithEdit[] }

function CourseEditor({ course, onBack, t }: { course: Course; onBack: () => void; t: any }) {
  const isNew = !course.id
  const [form, setForm] = useState({ title: course.title, slug: course.slug, description: course.description || '', price: course.price })
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [saving, setSaving] = useState(false)
  const [courseId, setCourseId] = useState(course.id)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  useEffect(() => { if (courseId) fetchModules() }, [courseId])

  async function fetchModules() {
    const { data: mods } = await supabase.from('modules').select('*').eq('course_id', courseId).order('position')
    const withLessons = await Promise.all((mods || []).map(async m => {
      const { data: lessons } = await supabase.from('lessons').select('*').eq('module_id', m.id).order('position')
      return { ...m, lessons: lessons || [] }
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
    setSaving(false)
  }

  async function addModule() {
    const title = prompt('Module title:')
    if (!title || !courseId) return
    await supabase.from('modules').insert({ course_id: courseId, title, position: modules.length + 1 })
    fetchModules()
  }

  async function deleteModule(modId: string) {
    if (!confirm('Delete this module and all its lessons?')) return
    await supabase.from('modules').delete().eq('id', modId)
    fetchModules()
  }

  async function addLesson(moduleId: string, moduleIndex: number) {
    const title = prompt('Lesson title:')
    if (!title) return
    const { data } = await supabase.from('lessons').insert({
      module_id: moduleId, course_id: courseId, title,
      content_type: 'text', position: modules[moduleIndex].lessons.length + 1, is_published: true,
    }).select().single()
    fetchModules()
    if (data) setEditingLesson(data)
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson?')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    fetchModules()
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>← Back to courses</button>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>{isNew ? 'New course' : `Edit: ${course.title}`}</h2>

      {/* Course meta form */}
      <div style={{ border: `1px solid ${t.border}`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: t.surface, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Label t={t}>Title</Label>
          <Input value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} t={t} />
        </div>
        <div>
          <Label t={t}>Slug</Label>
          <Input value={form.slug} onChange={v => setForm(p => ({ ...p, slug: v }))} t={t} placeholder="url-slug" />
        </div>
        <div>
          <Label t={t}>Price (USD)</Label>
          <Input value={String(form.price)} onChange={v => setForm(p => ({ ...p, price: Number(v) }))} t={t} type="number" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Label t={t}>Description</Label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
            style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>
        <div>
          <button onClick={saveCourse} disabled={saving} style={{ backgroundColor: t.text, color: t.bg, border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : isNew ? 'Create course' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Modules & Lessons */}
      {courseId && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.muted }}>Modules & Lessons</h3>
            <button onClick={addModule} style={{ fontSize: '0.75rem', color: t.muted, border: `1px solid ${t.border}`, background: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer' }}>+ Add module</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {modules.map((mod, mIdx) => (
              <div key={mod.id} style={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: t.surface }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: t.dim, marginRight: '8px' }}>M{mIdx + 1}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{mod.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => addLesson(mod.id, mIdx)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>+ lesson</button>
                    <button onClick={() => deleteModule(mod.id)} style={{ fontSize: '0.75rem', color: '#ef444460', background: 'none', border: 'none', cursor: 'pointer' }}>delete</button>
                  </div>
                </div>

                {mod.lessons.length > 0 && (
                  <div>
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${t.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.7rem', color: t.dim, width: '20px' }}>{lIdx + 1}</span>
                          <span style={{ fontSize: '0.875rem', color: t.muted }}>{lesson.title}</span>
                          <span style={{ fontSize: '0.65rem', border: `1px solid ${t.border}`, borderRadius: '4px', padding: '1px 6px', color: t.dim }}>{lesson.content_type}</span>
                          {!lesson.is_published && <span style={{ fontSize: '0.65rem', color: '#f59e0b' }}>draft</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button onClick={() => setEditingLesson(lesson)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>edit</button>
                          <button onClick={() => deleteLesson(lesson.id)} style={{ fontSize: '0.75rem', color: '#ef444460', background: 'none', border: 'none', cursor: 'pointer' }}>delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Editor Modal */}
      {editingLesson && (
        <LessonEditor
          lesson={editingLesson}
          t={t}
          onClose={() => { setEditingLesson(null); fetchModules() }}
        />
      )}
    </div>
  )
}


// ─── Shared components ────────────────────────────────────────────────────────

function Label({ children, t }: { children: React.ReactNode; t: any }) {
  return <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>{children}</label>
}

function Input({ value, onChange, t, placeholder = '', type = 'text' }: { value: string; onChange: (v: string) => void; t: any; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
    />
  )
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab({ t }: { t: any }) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

  async function toggleAdmin(u: Profile) {
    const newRole = u.role === 'admin' ? 'student' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', u.id)
    setUsers(prev => prev.map(p => p.id === u.id ? { ...p, role: newRole } : p))
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Users ({users.length})</h2>
      {loading ? <p style={{ color: t.muted }}>Loading…</p> : (
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface }}>
              <tr>
                {['Email', 'Name', 'Role', 'Joined', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: t.muted, padding: '10px 16px', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: '12px 16px', color: t.text }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', color: t.muted }}>{u.full_name || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${u.role === 'admin' ? '#f59e0b50' : t.border}`, color: u.role === 'admin' ? '#f59e0b' : t.muted }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: t.muted, fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => toggleAdmin(u)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
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

// ─── Enrollments tab ──────────────────────────────────────────────────────────

function EnrollmentsTab({ t }: { t: any }) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [granting, setGranting] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: enrs }, { data: crs }] = await Promise.all([
      supabase.from('enrollments').select('*, profiles(*), courses(*)').order('enrolled_at', { ascending: false }).limit(50),
      supabase.from('courses').select('*').order('title'),
    ])
    setEnrollments(enrs || [])
    setCourses(crs || [])
    setLoading(false)
  }

  async function grantAccess() {
    if (!email || !selectedCourse) return
    setGranting(true); setMessage(null)
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase()).single()
    if (!profile) {
      setMessage({ text: 'No user found with that email. They need to sign in once first.', ok: false })
      setGranting(false); return
    }
    await supabase.from('enrollments').upsert({ user_id: profile.id, course_id: selectedCourse, enrolled_at: new Date().toISOString() }, { onConflict: 'user_id,course_id' })
    setMessage({ text: 'Access granted successfully.', ok: true })
    setEmail(''); setSelectedCourse(''); setGranting(false); fetchData()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Enrollments</h2>
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.25rem', width: '300px', flexShrink: 0, backgroundColor: t.surface }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: t.muted, marginBottom: '1rem' }}>Grant access manually</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="student@email.com"
              style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
              style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', outline: 'none' }}>
              <option value="">Select course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            {message && <p style={{ fontSize: '0.75rem', color: message.ok ? '#10b981' : '#ef4444' }}>{message.text}</p>}
            <button onClick={grantAccess} disabled={granting || !email || !selectedCourse}
              style={{ backgroundColor: t.text, color: t.bg, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', opacity: (granting || !email || !selectedCourse) ? 0.5 : 1 }}>
              {granting ? 'Granting…' : 'Grant access'}
            </button>
          </div>
        </div>
      </div>

      {loading ? <p style={{ color: t.muted }}>Loading…</p> : (
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface }}>
              <tr>
                {['Student', 'Course', 'Enrolled', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: t.muted, padding: '10px 16px', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e: any) => (
                <tr key={e.id} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: '12px 16px', color: t.text }}>{e.profiles?.email || e.user_id}</td>
                  <td style={{ padding: '12px 16px', color: t.muted }}>{e.courses?.title || e.course_id}</td>
                  <td style={{ padding: '12px 16px', color: t.muted, fontSize: '0.8rem' }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${e.completed_at ? '#10b98150' : t.border}`, color: e.completed_at ? '#10b981' : t.muted }}>
                      {e.completed_at ? 'Complete' : 'Active'}
                    </span>
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
