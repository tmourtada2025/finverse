import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, Course, Module, Lesson, Profile } from '@/lib/supabase'

type Tab = 'courses' | 'users' | 'enrollments'

export default function Admin() {
  const { loading, isAuthenticated, isAdmin } = useAuth()
  const [tab, setTab] = useState<Tab>('courses')

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!isAdmin) { window.location.href = '/dashboard' }
  }, [loading, isAuthenticated, isAdmin])

  // Show spinner only while loading AND no existing session hint
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Don't render admin UI if not admin (redirect is firing)
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-[#1a1a1a] px-8 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-50">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold text-xl tracking-tight">
            Fin<span className="font-light">Verse</span>
          </span>
          <span className="text-[#333]">/</span>
          <span className="text-[#888] text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.location.href = '/dashboard' }}
            className="text-[#555] text-sm hover:text-white transition-colors"
          >
            Student view
          </button>
          <button
            onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/' })}
            className="text-[#555] text-sm hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="border-b border-[#1a1a1a] px-8">
        <div className="flex gap-6">
          {(['courses', 'users', 'enrollments'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {tab === 'courses' && <CoursesTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'enrollments' && <EnrollmentsTab />}
      </div>
    </div>
  )
}

function CoursesTab() {
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

  if (selected) return <CourseEditor course={selected} onBack={() => { setSelected(null); fetchCourses() }} />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Courses</h2>
        <button
          onClick={() => setSelected({ id: '', title: '', slug: '', subtitle: null, description: '', thumbnail_url: null, price: 0, stripe_price_id: null, stripe_product_id: null, is_published: false, position: 0, created_at: '', updated_at: '' })}
          className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          + New course
        </button>
      </div>
      {loading ? <p className="text-[#555]">Loading…</p> : courses.length === 0 ? <p className="text-[#555]">No courses yet.</p> : (
        <div className="space-y-3">
          {courses.map(course => (
            <div key={course.id} className="border border-[#1a1a1a] rounded-lg p-5 flex items-center justify-between hover:border-[#333] transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium">{course.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded border ${course.is_published ? 'text-emerald-400 border-emerald-400/30' : 'text-[#555] border-[#333]'}`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-[#555] text-sm">${course.price} · /{course.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => togglePublish(course)} className="text-[#555] text-sm hover:text-white transition-colors">
                  {course.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => setSelected(course)} className="text-sm bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded-lg hover:bg-[#222] transition-colors">
                  Edit →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CourseEditor({ course, onBack }: { course: Course; onBack: () => void }) {
  const isNew = !course.id
  const [form, setForm] = useState({ title: course.title, slug: course.slug, description: course.description || '', price: course.price })
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([])
  const [saving, setSaving] = useState(false)
  const [courseId, setCourseId] = useState(course.id)

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
    const type = prompt('Content type (text / video / audio / quiz):') as Lesson['content_type'] || 'text'
    await supabase.from('lessons').insert({ module_id: moduleId, title, content_type: type, position: modules[moduleIndex].lessons.length + 1, is_published: true })
    fetchModules()
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson?')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    fetchModules()
  }

  async function editLesson(lesson: Lesson) {
    const title = prompt('Lesson title:', lesson.title)
    if (!title) return
    const content = prompt('Content text (or URL for video/audio):', lesson.content_text || lesson.content_url || '')
    const isUrl = content?.startsWith('http')
    await supabase.from('lessons').update({ title, content_text: isUrl ? null : content, content_url: isUrl ? content : null }).eq('id', lesson.id)
    fetchModules()
  }

  return (
    <div>
      <button onClick={onBack} className="text-[#555] text-sm hover:text-white transition-colors mb-8 flex items-center gap-2">← Back to courses</button>
      <h2 className="text-xl font-bold mb-8">{isNew ? 'New course' : `Edit: ${course.title}`}</h2>
      <div className="border border-[#1a1a1a] rounded-lg p-6 mb-8 space-y-4">
        <div>
          <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Title</label>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#555]" />
        </div>
        <div>
          <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Slug</label>
          <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#555]" />
        </div>
        <div>
          <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#555] resize-none" />
        </div>
        <div>
          <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Price (USD)</label>
          <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#555]" />
        </div>
        <button onClick={saveCourse} disabled={saving} className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save course'}
        </button>
      </div>
      {courseId && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[#888] text-xs uppercase tracking-widest">Modules & Lessons</h3>
            <button onClick={addModule} className="text-sm text-[#888] hover:text-white border border-[#333] px-3 py-1.5 rounded-lg hover:border-[#555] transition-colors">+ Add module</button>
          </div>
          <div className="space-y-4">
            {modules.map((mod, mIdx) => (
              <div key={mod.id} className="border border-[#1a1a1a] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[#111]">
                  <div><span className="text-[#555] text-xs mr-2">M{mIdx + 1}</span><span className="font-medium text-sm">{mod.title}</span></div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => addLesson(mod.id, mIdx)} className="text-xs text-[#555] hover:text-white transition-colors">+ lesson</button>
                    <button onClick={() => deleteModule(mod.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">delete</button>
                  </div>
                </div>
                {mod.lessons.length > 0 && (
                  <div className="divide-y divide-[#111]">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[#333] text-xs w-6">{lIdx + 1}</span>
                          <span className="text-[#888] text-sm">{lesson.title}</span>
                          <span className="text-[#444] text-xs border border-[#222] rounded px-1.5 py-0.5">{lesson.content_type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => editLesson(lesson)} className="text-xs text-[#555] hover:text-white transition-colors">edit</button>
                          <button onClick={() => deleteLesson(lesson.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">delete</button>
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
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

  async function setAdmin(userId: string, makeAdmin: boolean) {
    await supabase.from('profiles').update({ role: makeAdmin ? 'admin' : 'student' }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: makeAdmin ? 'admin' : 'student' } : u))
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-8">Users ({users.length})</h2>
      {loading ? <p className="text-[#555]">Loading…</p> : (
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1a1a1a] bg-[#111]">
              <tr>
                <th className="text-left text-[#555] text-xs uppercase tracking-widest px-5 py-3">Email</th>
                <th className="text-left text-[#555] text-xs uppercase tracking-widest px-5 py-3">Name</th>
                <th className="text-left text-[#555] text-xs uppercase tracking-widest px-5 py-3">Role</th>
                <th className="text-left text-[#555] text-xs uppercase tracking-widest px-5 py-3">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#0f0f0f]">
                  <td className="px-5 py-3 text-white">{u.email}</td>
                  <td className="px-5 py-3 text-[#888]">{u.full_name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${u.role === 'admin' ? 'text-amber-400 border-amber-400/30' : 'text-[#555] border-[#333]'}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3 text-[#555]">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setAdmin(u.id, u.role !== 'admin')} className="text-xs text-[#555] hover:text-white transition-colors">
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

function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [granting, setGranting] = useState(false)

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
    setGranting(true)
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase()).single()
    if (!profile) { alert('No user found with that email. They need to sign in once first.'); setGranting(false); return }
    await supabase.from('enrollments').upsert({ user_id: profile.id, course_id: selectedCourse, enrolled_at: new Date().toISOString() }, { onConflict: 'user_id,course_id' })
    setEmail(''); setSelectedCourse(''); setGranting(false); fetchData()
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-8">
        <h2 className="text-xl font-bold">Enrollments</h2>
        <div className="border border-[#1a1a1a] rounded-lg p-5 w-80 shrink-0">
          <p className="text-[#888] text-xs uppercase tracking-widest mb-4">Grant access manually</p>
          <div className="space-y-3">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="student@email.com" className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#555]" />
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#555]">
              <option value="">Select course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <button onClick={grantAccess} disabled={granting || !email || !selectedCourse} className="w-full bg-white text-black text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              {granting ? 'Granting…' : 'Grant access'}
            </button>
          </div>
        </div>
      </div>
      {loading ? <p className="text-[#555]">Loading…</p> : (
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1a1a1a] bg-[#111]">
              <tr>
                <th className="text-left text-[#555] text-xs uppercase tracking-widest px-5 py-3">Student</th>
                <th className="text-left text-[#555] text-xs uppercase tracking-widest px-5 py-3">Course</th>
                <th className="text-left text-[#555] text-xs uppercase tracking-widest px-5 py-3">Enrolled</th>
                <th className="text-left text-[#555] text-xs uppercase tracking-widest px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {enrollments.map((e: any) => (
                <tr key={e.id} className="hover:bg-[#0f0f0f]">
                  <td className="px-5 py-3 text-white">{e.profiles?.email || e.user_id}</td>
                  <td className="px-5 py-3 text-[#888]">{e.courses?.title || e.course_id}</td>
                  <td className="px-5 py-3 text-[#555]">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${e.completed_at ? 'text-emerald-400 border-emerald-400/30' : 'text-[#555] border-[#333]'}`}>
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
