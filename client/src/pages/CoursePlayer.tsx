import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, Module, Lesson, LessonProgress, Course, Section } from '@/lib/supabase'
import { useLocation, useParams } from 'wouter'

type LessonWithProgress = Lesson & { progress?: LessonProgress }
type ModuleWithLessons = Module & {
  lessons: LessonWithProgress[]
  description?: string | null
  intro_video_url?: string | null
}

export default function CoursePlayer() {
  const { user, loading, isAuthenticated } = useAuth()
  const [, setLocation] = useLocation()
  const params = useParams<{ courseId: string; lessonId?: string }>()
  const courseId = params.courseId

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [activeModule, setActiveModule] = useState<ModuleWithLessons | null>(null)
  const [activeSection, setActiveSection] = useState<Section | null>(null)
  const [lessonSections, setLessonSections] = useState<Section[]>([])
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
    if (!user || !courseId) return
    loadCourse()
  }, [user, courseId])

  useEffect(() => {
    if (params.lessonId && modules.length > 0) {
      const all = modules.flatMap(m => m.lessons)
      const found = all.find(l => l.id === params.lessonId)
      if (found) { setActiveLesson(found); setActiveModule(null) }
    }
  }, [params.lessonId, modules])

  async function loadCourse() {
    const { data: enrollment } = await supabase
      .from('enrollments').select('id').eq('user_id', user!.id).eq('course_id', courseId).single()
    if (!enrollment) { setLocation('/dashboard'); return }
    setEnrollmentId(enrollment.id)

    const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single()
    setCourse(courseData)

    if (!document.getElementById('arabic-font')) {
      const link = document.createElement('link')
      link.id = 'arabic-font'; link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap'
      document.head.appendChild(link)
    }

    const { data: modulesData } = await supabase
      .from('modules').select('*').eq('course_id', courseId).order('position')

    const { data: progressData } = await supabase
      .from('lesson_progress').select('*').eq('enrollment_id', enrollment.id)

    const modulesWithLessons: ModuleWithLessons[] = await Promise.all(
      (modulesData || []).map(async (mod) => {
        const { data: lessons } = await supabase
          .from('lessons').select('*').eq('module_id', mod.id).eq('is_published', true).order('position')
        const lessonsWithProgress = (lessons || []).map(lesson => ({
          ...lesson,
          progress: progressData?.find(p => p.lesson_id === lesson.id),
        }))
        return { ...mod, lessons: lessonsWithProgress }
      })
    )

    setModules(modulesWithLessons)

    if (!params.lessonId) {
      const allLessons = modulesWithLessons.flatMap(m => m.lessons)
      const firstIncomplete = allLessons.find(l => !l.progress?.completed)
      const initialLesson = firstIncomplete || allLessons[0] || null
      setActiveLesson(initialLesson)
      setActiveModule(null)

      if (initialLesson) {
        const { data: secs } = await supabase.from('sections').select('*').eq('lesson_id', initialLesson.id).order('position')
        const sections = secs || []
        setLessonSections(sections)
        setActiveSection(sections[0] || null)
        setExpandedLessons(new Set([initialLesson.id]))
      }
    }

    setDataLoading(false)
  }

  // ── Silent auto-complete on next past last section ──────────────────────────
  async function silentComplete(lesson: Lesson) {
    if (!enrollmentId || !user) return
    if (lesson.progress?.completed) return
    await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      enrollment_id: enrollmentId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })

    // Check if this was the last lesson
    const allLessons = modules.flatMap(m => m.lessons)
    const allCompleted = allLessons.every(l => l.id === lesson.id || l.progress?.completed)
    if (allCompleted) {
      await supabase.from('enrollments').update({ completed_at: new Date().toISOString() }).eq('id', enrollmentId)
    }

    // Update in-memory state silently
    setModules(prev => prev.map(mod => ({
      ...mod,
      lessons: mod.lessons.map(l => l.id === lesson.id
        ? { ...l, progress: { ...l.progress, completed: true, completed_at: new Date().toISOString() } as any }
        : l
      )
    })))
  }

  async function navigateToModule(mod: ModuleWithLessons) {
    if (!mod.description && !mod.intro_video_url) {
      const firstLesson = mod.lessons[0]
      if (firstLesson) { navigateToLesson(firstLesson); return }
    }
    setActiveModule(mod)
    setActiveLesson(null)
    setActiveSection(null)
    setLessonSections([])
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  async function navigateToLesson(lesson: Lesson) {
    setActiveLesson(lesson)
    setActiveModule(null)
    setLocation(`/learn/${courseId}/${lesson.id}`)
    if (window.innerWidth < 768) setSidebarOpen(false)
    const { data: secs } = await supabase.from('sections').select('*').eq('lesson_id', lesson.id).order('position')
    const sections = secs || []
    setLessonSections(sections)
    setActiveSection(sections[0] || null)
    setExpandedLessons(prev => new Set([...prev, lesson.id]))
  }

  function nextLesson() {
    const all = modules.flatMap(m => m.lessons)
    const idx = all.findIndex(l => l.id === activeLesson?.id)
    if (idx < all.length - 1) navigateToLesson(all[idx + 1])
  }

  function prevLesson() {
    const all = modules.flatMap(m => m.lessons)
    const idx = all.findIndex(l => l.id === activeLesson?.id)
    if (idx > 0) navigateToLesson(all[idx - 1])
  }

  async function nextSection() {
    if (!activeSection || !lessonSections.length) return
    const idx = lessonSections.findIndex(s => s.id === activeSection.id)
    if (idx < lessonSections.length - 1) {
      setActiveSection(lessonSections[idx + 1])
    } else {
      // Last section — auto-complete this lesson then go to next
      if (activeLesson) await silentComplete(activeLesson)
      nextLesson()
    }
  }

  function prevSection() {
    if (!activeSection || !lessonSections.length) return
    const idx = lessonSections.findIndex(s => s.id === activeSection.id)
    if (idx > 0) setActiveSection(lessonSections[idx - 1])
    else prevLesson()
  }

  // Breadcrumb: find which module contains the active lesson
  const activeModuleForLesson = activeLesson
    ? modules.find(m => m.lessons.some(l => l.id === activeLesson.id)) || null
    : activeModule

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const bg = dark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'
  const borderCol = dark ? 'border-[#1a1a1a]' : 'border-[#e8e8e2]'
  const mutedText = dark ? 'text-[#555]' : 'text-[#999]'

  const allLessons = modules.flatMap(m => m.lessons)
  const isLastLesson = allLessons.findIndex(l => l.id === activeLesson?.id) === allLessons.length - 1
  const isLastSection = lessonSections.findIndex(s => s.id === activeSection?.id) === lessonSections.length - 1
  const isFirstSection = lessonSections.findIndex(s => s.id === activeSection?.id) === 0
  const isFirstLesson = allLessons.findIndex(l => l.id === activeLesson?.id) === 0

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>

      {/* ── Top nav ── */}
      <nav className={`border-b ${borderCol} px-6 py-3 flex items-center justify-between sticky top-0 ${dark ? 'bg-[#0a0a0a]/95' : 'bg-white/95'} backdrop-blur z-50 shrink-0`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`${mutedText} hover:text-current transition-colors p-1`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => { window.location.href = '/dashboard' }} className={`${mutedText} hover:text-current transition-colors text-sm flex items-center gap-1`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <button onClick={() => setDark(d => !d)} className={`${mutedText} hover:text-current transition-colors ml-2`}>{dark ? '☀️' : '🌙'}</button>
          <span className={dark ? 'text-[#333]' : 'text-[#ddd]'}>|</span>
          <span className="font-bold text-lg tracking-tight">Fin<span className="font-light">Verse</span></span>
        </div>
      </nav>

      {/* ── Breadcrumb — always visible ── */}
      <div className={`border-b ${borderCol} px-6 py-2 ${dark ? 'bg-[#0a0a0a]' : 'bg-white'} flex items-center gap-2 text-xs flex-wrap shrink-0`}>
        <span style={{ color: dark ? '#666' : '#888' }} className="font-medium">{course?.title || '…'}</span>

        {activeModuleForLesson && (
          <>
            <span className={dark ? 'text-[#2a2a2a]' : 'text-[#ddd]'}>/</span>
            <button onClick={() => navigateToModule(activeModuleForLesson)} className={`${mutedText} hover:text-current transition-colors`}>
              {activeModuleForLesson.title}
            </button>
          </>
        )}

        {activeLesson && (
          <>
            <span className={dark ? 'text-[#2a2a2a]' : 'text-[#ddd]'}>/</span>
            <span style={{ color: dark ? '#aaa' : '#444' }}>{activeLesson.title}</span>
          </>
        )}

        {activeSection && lessonSections.length > 1 && (
          <>
            <span className={dark ? 'text-[#2a2a2a]' : 'text-[#ddd]'}>/</span>
            <span style={{ color: dark ? '#fff' : '#111' }} className="font-medium">{activeSection.title}</span>
            <span className={mutedText}>({lessonSections.findIndex(s => s.id === activeSection.id) + 1}/{lessonSections.length})</span>
          </>
        )}

        {activeModule && !activeLesson && (
          <>
            <span className={dark ? 'text-[#2a2a2a]' : 'text-[#ddd]'}>/</span>
            <span style={{ color: dark ? '#fff' : '#111' }} className="font-medium">Module intro</span>
          </>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 border-r ${borderCol} overflow-y-auto transition-all duration-200 ${dark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
          <div className="p-4 min-w-[288px]">
            {modules.map((mod, mIdx) => {
              const modActive = activeModule?.id === mod.id
              const hasIntro = !!(mod.description || mod.intro_video_url)
              return (
                <div key={mod.id} className="mb-6">
                  <button
                    onClick={() => navigateToModule(mod)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg mb-2 transition-colors group flex items-center justify-between gap-2 ${modActive ? (dark ? 'bg-[#1a1a1a] text-white' : 'bg-[#f0f0f0] text-black') : (dark ? 'text-[#555] hover:text-[#888]' : 'text-[#aaa] hover:text-[#666]')}`}
                  >
                    <span className="text-xs uppercase tracking-widest">Module {mIdx + 1} · {mod.title}</span>
                    {hasIntro && <span className="text-xs opacity-0 group-hover:opacity-60 transition-opacity">›</span>}
                  </button>

                  <div className="space-y-1">
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.id === activeLesson?.id
                      const isDone = lesson.progress?.completed
                      const isExpanded = expandedLessons.has(lesson.id)
                      return (
                        <div key={lesson.id}>
                          <button
                            onClick={() => navigateToLesson(lesson)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${isActive ? (dark ? 'bg-[#1a1a1a] text-white' : 'bg-[#f0f0f0] text-black') : (dark ? 'text-[#888] hover:text-[#ccc] hover:bg-[#111]' : 'text-[#666] hover:text-black hover:bg-[#f5f5f5]')}`}
                          >
                            <span className="mt-0.5 flex-shrink-0">
                              {isDone
                                ? <span className="text-[#10b981] text-sm">✓</span>
                                : <span className={`w-4 h-4 rounded-full border flex-shrink-0 inline-block ${isActive ? (dark ? 'border-white' : 'border-black') : (dark ? 'border-[#333]' : 'border-[#ccc]')}`} />
                              }
                            </span>
                            <span className="text-sm leading-snug flex-1">{lesson.title}</span>
                            <span className="text-xs opacity-40">{isExpanded ? '▲' : '▼'}</span>
                          </button>
                          {isExpanded && isActive && lessonSections.map((sec, si) => {
                            const secActive = sec.id === activeSection?.id
                            const typeIcon = sec.content_type === 'video' ? '🎬' : sec.content_type === 'audio' ? '🎵' : sec.content_type === 'pdf' ? '📄' : sec.content_type === 'quiz' ? '❓' : sec.content_type === 'slides' ? '🖥️' : sec.content_type === 'excel' ? '📊' : '📝'
                            return (
                              <button key={sec.id} onClick={() => setActiveSection(sec)}
                                className={`w-full text-left pl-9 pr-3 py-2 flex items-center gap-2 text-xs transition-colors rounded-lg ${secActive ? (dark ? 'text-white bg-[#222]' : 'text-black bg-[#ebebeb]') : (dark ? 'text-[#666] hover:text-[#aaa] hover:bg-[#111]' : 'text-[#999] hover:text-black hover:bg-[#f5f5f5]')}`}>
                                <span className="opacity-60">{typeIcon}</span>
                                <span className="truncate">{si + 1}. {sec.title}</span>
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">

          {/* Module intro */}
          {activeModule && !activeLesson ? (
            <ModuleIntroScreen
              mod={activeModule}
              dark={dark}
              onStartModule={() => {
                const firstLesson = activeModule.lessons[0]
                if (firstLesson) navigateToLesson(firstLesson)
              }}
            />
          ) : !activeLesson ? (
            <div className="flex items-center justify-center h-full">
              <p className={mutedText}>Select a lesson to begin.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-8 py-10">
              <h1 className="text-2xl font-bold mb-8">{activeSection?.title || activeLesson.title}</h1>

              {activeSection
                ? <SectionContent section={activeSection} />
                : <p className={mutedText}>No content in this lesson yet.</p>
              }

              {/* Navigation — no mark complete button */}
              <div className={`mt-10 flex items-center justify-between border-t ${borderCol} pt-6`}>
                <button
                  onClick={prevSection}
                  disabled={isFirstSection && isFirstLesson}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium border ${borderCol} ${mutedText} hover:text-current hover:border-current transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <button
                  onClick={nextSection}
                  disabled={isLastSection && isLastLesson}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium border ${borderCol} ${mutedText} hover:text-current hover:border-current transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {isLastSection
                    ? (isLastLesson ? 'Done' : 'Next lesson →')
                    : 'Next section'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── Module Intro Screen ──────────────────────────────────────────────────────
function ModuleIntroScreen({ mod, dark, onStartModule }: { mod: ModuleWithLessons; dark: boolean; onStartModule: () => void }) {
  const lessonCount = mod.lessons.length
  const completedCount = mod.lessons.filter(l => l.progress?.completed).length
  const mutedText = dark ? 'text-[#555]' : 'text-[#999]'
  const borderCol = dark ? 'border-[#1a1a1a]' : 'border-[#e8e8e2]'

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <p className={`${mutedText} text-xs uppercase tracking-widest mb-4`}>Module intro</p>
      <h1 className="text-3xl font-bold mb-2 leading-tight">{mod.title}</h1>
      <p className={`${mutedText} text-sm mb-8`}>
        {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
        {completedCount > 0 && ` · ${completedCount} completed`}
      </p>

      {mod.intro_video_url && mod.intro_video_url.includes('embed') && (
        <div className={`aspect-video rounded-xl overflow-hidden border ${borderCol} mb-8`}>
          <iframe src={mod.intro_video_url} className="w-full h-full" allowFullScreen />
        </div>
      )}

      {mod.description && (
        <div className={`border-l-2 ${dark ? 'border-[#2a2a2a]' : 'border-[#e0e0e0]'} pl-5 mb-10`}>
          <p className={`${dark ? 'text-[#aaa]' : 'text-[#555]'} leading-relaxed text-base whitespace-pre-wrap`}>{mod.description}</p>
        </div>
      )}

      {mod.lessons.length > 0 && (
        <div className={`border ${borderCol} rounded-xl overflow-hidden mb-10`}>
          <div className={`px-4 py-3 border-b ${borderCol} ${dark ? 'bg-[#0f0f0f]' : 'bg-[#fafafa]'}`}>
            <p className={`text-xs uppercase tracking-widest ${mutedText}`}>Lessons in this module</p>
          </div>
          {mod.lessons.map((lesson, idx) => (
            <div key={lesson.id} className={`flex items-center gap-3 px-4 py-3 border-b ${borderCol} last:border-b-0`}>
              <span className={`text-xs w-5 ${mutedText}`}>{idx + 1}</span>
              {lesson.progress?.completed
                ? <span className="text-[#10b981] text-sm flex-shrink-0">✓</span>
                : <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${dark ? 'border-[#333]' : 'border-[#ccc]'}`} />
              }
              <span className={`text-sm ${dark ? 'text-[#888]' : 'text-[#666]'}`}>{lesson.title}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onStartModule}
        className={`px-8 py-3 rounded-xl text-sm font-medium transition-colors ${dark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'}`}
      >
        {completedCount > 0 && completedCount < lessonCount ? 'Continue module →' : completedCount === lessonCount && lessonCount > 0 ? 'Review module →' : 'Start module →'}
      </button>
    </div>
  )
}

// ─── Section content ──────────────────────────────────────────────────────────
function SectionContent({ section }: { section: Section }) {
  return (
    <div>
      <style>{`
        .fv-content ul{list-style-type:disc!important;padding-left:1.5em!important;margin:.5em 0!important}
        .fv-content ol{list-style-type:decimal!important;padding-left:1.5em!important;margin:.5em 0!important}
        .fv-content li{display:list-item!important}
        .fv-content h1{font-size:1.5em;font-weight:700;margin:.8em 0 .4em}
        .fv-content h2{font-size:1.25em;font-weight:600;margin:.8em 0 .4em}
        .fv-content h3{font-size:1.1em;font-weight:600;margin:.6em 0 .3em}
        .fv-content p{margin:.5em 0}
        .fv-content blockquote{border-left:3px solid #444;padding-left:1em;color:#888;margin:.5em 0}
        .fv-content img{max-width:100%;border-radius:6px;margin:8px 0}
        .fv-content a{color:#3b82f6;text-decoration:underline}
      `}</style>
      <SectionRenderer section={section} />
    </div>
  )
}

function SectionRenderer({ section }: { section: Section }) {
  switch (section.content_type) {
    case 'text':
      return section.content_text
        ? <div className="text-[#ccc] leading-relaxed fv-content" style={{ lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: section.content_text }} />
        : <p className="text-[#555]">No content yet.</p>
    case 'video':
      return (
        <div>
          {section.content_url?.includes('embed')
            ? <div className="aspect-video bg-[#111] rounded-lg overflow-hidden mb-4"><iframe src={section.content_url} className="w-full h-full" allowFullScreen /></div>
            : <p className="text-[#555]">Video URL not set.</p>}
          {section.content_text && <div className="mt-6 text-[#ccc] fv-content" dangerouslySetInnerHTML={{ __html: section.content_text }} />}
        </div>
      )
    case 'audio':
      return (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 mb-4">
          {section.content_url
            ? <audio controls className="w-full"><source src={section.content_url} /></audio>
            : <p className="text-[#555] text-center">Audio not available.</p>}
          {section.content_text && <div className="mt-6 text-[#ccc] fv-content" dangerouslySetInnerHTML={{ __html: section.content_text }} />}
        </div>
      )
    case 'pdf':
      return section.content_url
        ? <iframe src={section.content_url} className="w-full rounded-lg border border-[#1a1a1a]" style={{ height: '70vh' }} />
        : <p className="text-[#555]">PDF not available.</p>
    case 'slides':
      return section.content_url
        ? <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(section.content_url)}`} className="w-full rounded-lg border border-[#1a1a1a]" style={{ height: '70vh' }} allowFullScreen />
        : <p className="text-[#555]">Slides not available.</p>
    case 'excel':
      return section.content_url
        ? <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(section.content_url)}`} className="w-full rounded-lg border border-[#1a1a1a]" style={{ height: '60vh' }} />
        : <p className="text-[#555]">File not available.</p>
    case 'quiz':
      return <QuizPlayer questions={section.content_text || '[]'} />
    default:
      return <p className="text-[#555]">Unknown content type.</p>
  }
}

// ─── Quiz Player ──────────────────────────────────────────────────────────────
function QuizPlayer({ questions: raw }: { questions: string }) {
  let questions: any[] = []
  try { questions = JSON.parse(raw) } catch { questions = [] }
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [submitted, setSubmitted] = useState(false)
  if (!questions.length) return <p className="text-[#555]">No questions yet.</p>
  const typeColors: Record<string, string> = { multiple_choice: '#3b82f6', fill_blank: '#10b981', matching: '#f59e0b' }
  return (
    <div className="space-y-6">
      {questions.map((q: any, qi: number) => (
        <div key={qi} className="border border-[#1a1a1a] rounded-xl p-5 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: typeColors[q.type] + '15', color: typeColors[q.type] }}>
              {q.type === 'multiple_choice' ? 'Multiple choice' : q.type === 'fill_blank' ? 'Fill in the blank' : 'Matching'}
            </span>
          </div>
          {q.image_url && <img src={q.image_url} className="max-w-full rounded-lg mb-3" style={{ maxHeight: '200px', objectFit: 'cover' }} />}
          <p className="text-[#ccc] mb-4 leading-relaxed">{q.question}</p>
          {q.type === 'multiple_choice' && (
            <div className="space-y-2">
              {(q.options || []).map((opt: string, oi: number) => {
                const selected = answers[qi] === oi
                const correct = submitted && oi === q.correct_index
                const wrong = submitted && selected && oi !== q.correct_index
                return (
                  <button key={oi} onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${correct ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : wrong ? 'border-red-500/50 bg-red-500/10 text-red-400' : selected ? 'border-white/30 bg-white/5 text-white' : 'border-[#222] text-[#888] hover:border-[#333] hover:text-[#ccc]'}`}>
                    {opt}
                  </button>
                )
              })}
            </div>
          )}
          {q.type === 'fill_blank' && (
            <input value={answers[qi] || ''} onChange={e => !submitted && setAnswers(a => ({ ...a, [qi]: e.target.value }))} placeholder="Your answer…"
              className={`w-full bg-[#111] border rounded-lg px-4 py-3 text-sm outline-none ${submitted ? answers[qi]?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim() ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400' : 'border-[#222] text-[#ccc] focus:border-[#444]'}`} />
          )}
          {q.type === 'matching' && (
            <div className="grid grid-cols-2 gap-3">
              {(q.pairs || []).map((pair: any, pi: number) => (
                <div key={pi} className="contents">
                  <div className="px-3 py-2 bg-[#111] border border-[#222] rounded-lg text-sm text-[#ccc]">{pair.left}</div>
                  <div className="px-3 py-2 bg-[#111] border border-[#222] rounded-lg text-sm text-[#888]">{pair.right}</div>
                </div>
              ))}
            </div>
          )}
          {submitted && q.explanation && <p className="mt-3 text-sm text-[#666] border-t border-[#1a1a1a] pt-3">{q.explanation}</p>}
        </div>
      ))}
      {!submitted ? (
        <button onClick={() => setSubmitted(true)} className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">Submit answers</button>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#555]">Score: {questions.filter((q: any, qi: number) => q.type === 'multiple_choice' ? answers[qi] === q.correct_index : q.type === 'fill_blank' ? answers[qi]?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim() : true).length}/{questions.length}</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false) }} className="px-4 py-2 text-sm border border-[#222] rounded-lg text-[#888] hover:text-white hover:border-[#333] transition-colors">Retry</button>
        </div>
      )}
    </div>
  )
}
