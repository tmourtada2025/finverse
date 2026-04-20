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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [showWelcome, setShowWelcome] = useState(true)
  const [bookmarkedSection, setBookmarkedSection] = useState<{lessonId: string; sectionId: string} | null>(() => {
    try { const b = localStorage.getItem(`fv-bookmark-${params.courseId}`); return b ? JSON.parse(b) : null } catch { return null }
  })
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
      // Stay on welcome screen — don't auto-navigate
      setDataLoading(false)
      return
    }
  }

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

    const allLessons = modules.flatMap(m => m.lessons)
    const allCompleted = allLessons.every(l => l.id === lesson.id || l.progress?.completed)
    if (allCompleted) {
      await supabase.from('enrollments').update({ completed_at: new Date().toISOString() }).eq('id', enrollmentId)
    }

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
    // FIX: toggle expand/collapse instead of always adding
    setExpandedLessons(prev => {
      const next = new Set(prev)
      if (next.has(lesson.id)) {
        next.delete(lesson.id)
      } else {
        next.add(lesson.id)
      }
      return next
    })
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

  function saveBookmark() {
    if (!activeLesson || !activeSection) return
    const bookmark = { lessonId: activeLesson.id, sectionId: activeSection.id }
    setBookmarkedSection(bookmark)
    try { localStorage.setItem(`fv-bookmark-${courseId}`, JSON.stringify(bookmark)) } catch {}
  }

  async function jumpToBookmark() {
    if (!bookmarkedSection) return
    const allLessons = modules.flatMap(m => m.lessons)
    const lesson = allLessons.find(l => l.id === bookmarkedSection.lessonId)
    if (!lesson) return
    await navigateToLesson(lesson)
    setTimeout(() => {
      supabase.from('sections').select('*').eq('lesson_id', lesson.id).order('position')
        .then(({ data }) => {
          const sec = (data || []).find((s: any) => s.id === bookmarkedSection.sectionId)
          if (sec) setActiveSection(sec)
        })
    }, 300)
  }

  const isSequential = !!(course as any)?.is_sequential

  function isLessonUnlocked(lesson: LessonWithProgress, allLessons: LessonWithProgress[]) {
    if (!isSequential) return true
    const idx = allLessons.findIndex(l => l.id === lesson.id)
    if (idx === 0) return true
    if (lesson.progress?.completed) return true
    return allLessons.slice(0, idx).every(l => l.progress?.completed)
  }

  function isSectionUnlocked(secIdx: number, lesson: LessonWithProgress, allLessons: LessonWithProgress[]) {
    if (!isSequential) return true
    if (!isLessonUnlocked(lesson, allLessons)) return false
    if (secIdx === 0) return true
    const activeSectionIdx = lessonSections.findIndex(s => s.id === activeSection?.id)
    return secIdx <= activeSectionIdx + 1
  }

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

  const bg         = dark ? 'bg-[#0a0a0a] text-white'    : 'bg-[#f7f7f5] text-[#111]'
  const borderCol  = dark ? 'border-[#1a1a1a]'            : 'border-[#e0e0da]'
  const mutedText  = dark ? 'text-[#555]'                 : 'text-[#888]'
  const surfaceBg  = dark ? 'bg-[#0a0a0a]'               : 'bg-white'
  const sidebarBg  = dark ? 'bg-[#0a0a0a]'               : 'bg-white'
  const bodyText   = dark ? 'text-[#ccc]'                 : 'text-[#222]'

  const allLessons = modules.flatMap(m => m.lessons)
  const isLastLesson   = allLessons.findIndex(l => l.id === activeLesson?.id) === allLessons.length - 1
  const isLastSection  = lessonSections.findIndex(s => s.id === activeSection?.id) === lessonSections.length - 1
  const isFirstSection = lessonSections.findIndex(s => s.id === activeSection?.id) === 0
  const isFirstLesson  = allLessons.findIndex(l => l.id === activeLesson?.id) === 0

  return (
    <div className={`h-screen flex flex-col ${bg}`}>

      {/* Top nav */}
      <nav className={`border-b ${borderCol} px-6 py-3 flex items-center justify-between sticky top-0 ${surfaceBg}/95 backdrop-blur z-50 shrink-0`}>
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

      {/* Breadcrumb */}
      <div className={`border-b ${borderCol} px-6 py-2 ${surfaceBg} flex items-center gap-2 text-xs flex-wrap shrink-0`}>
        <span
          onClick={() => { setActiveLesson(null); setActiveModule(null); setActiveSection(null); setLessonSections([]) }}
          style={{ color: dark ? '#666' : '#999', cursor: 'pointer' }}
          className="font-medium hover:underline"
        >{course?.title || '…'}</span>
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

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 border-r ${borderCol} flex flex-col transition-all duration-200 ${sidebarBg} overflow-hidden`}>
          <div className="flex-1 overflow-y-auto p-4 min-w-[288px]">
            {modules.map((mod, mIdx) => {
              const modActive    = activeModule?.id === mod.id
              const modExpanded  = expandedModules.has(mod.id)
              const hasIntro     = !!(mod.description || mod.intro_video_url)
              const doneCount    = mod.lessons.filter(l => l.progress?.completed).length
              return (
                <div key={mod.id} className="mb-2">
                  {/* Module row — left side navigates, right chevron toggles expand */}
                  <div className={`flex items-center rounded-lg mb-1 transition-colors ${
                    modActive
                      ? (dark ? 'bg-[#1a1a1a]' : 'bg-[#efefed]')
                      : (dark ? 'hover:bg-[#111]' : 'hover:bg-[#f0f0ee]')
                  }`}>
                    <button
                      onClick={() => navigateToModule(mod)}
                      className={`flex-1 text-left px-2 py-2 flex items-center gap-2 ${
                        modActive
                          ? (dark ? 'text-white' : 'text-[#111]')
                          : (dark ? 'text-[#555] hover:text-[#888]' : 'text-[#999] hover:text-[#555]')
                      }`}
                    >
                      <span className="text-xs uppercase tracking-widest leading-snug flex-1">
                        M{mIdx + 1} · {mod.title}
                      </span>
                      {doneCount > 0 && (
                        <span className="text-[10px] text-[#10b981] flex-shrink-0">{doneCount}/{mod.lessons.length}</span>
                      )}
                    </button>
                    {/* Expand/collapse chevron */}
                    <button
                      onClick={() => setExpandedModules(prev => {
                        const next = new Set(prev)
                        next.has(mod.id) ? next.delete(mod.id) : next.add(mod.id)
                        return next
                      })}
                      className={`px-2 py-2 flex-shrink-0 transition-colors ${dark ? 'text-[#444] hover:text-[#888]' : 'text-[#bbb] hover:text-[#666]'}`}
                      title={modExpanded ? 'Collapse module' : 'Expand module'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ transform: modExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Lessons — only shown when module is expanded */}
                  {modExpanded && (
                  <div className="space-y-1 ml-2 pl-2" style={{ borderLeft: `1px solid ${dark ? '#1e1e1e' : '#e8e8e2'}` }}>
                    {mod.lessons.map((lesson) => {
                      const isActive   = lesson.id === activeLesson?.id
                      const isDone     = lesson.progress?.completed
                      const isExpanded = expandedLessons.has(lesson.id)
                      const unlocked   = isLessonUnlocked(lesson, modules.flatMap(m => m.lessons))
                      return (
                        <div key={lesson.id}>
                          <button
                            onClick={() => unlocked && navigateToLesson(lesson)}
                            disabled={!unlocked}
                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                              !unlocked
                                ? (dark ? 'text-[#333] cursor-not-allowed' : 'text-[#ccc] cursor-not-allowed')
                                : isActive
                                  ? (dark ? 'bg-[#1a1a1a] text-white' : 'bg-[#efefed] text-[#111]')
                                  : (dark ? 'text-[#888] hover:text-[#ccc] hover:bg-[#111]' : 'text-[#666] hover:text-[#111] hover:bg-[#f0f0ee]')
                            }`}
                          >
                            <span className="mt-0.5 flex-shrink-0">
                              {!unlocked
                                ? <span className={`text-sm ${dark ? 'text-[#333]' : 'text-[#ccc]'}`}>🔒</span>
                                : isDone
                                  ? <span className="text-[#10b981] text-sm">✓</span>
                                  : <span className={`w-4 h-4 rounded-full border flex-shrink-0 inline-block ${
                                      isActive
                                        ? (dark ? 'border-white' : 'border-[#111]')
                                        : (dark ? 'border-[#333]' : 'border-[#ccc]')
                                    }`} />
                              }
                            </span>
                            <span className="text-sm leading-snug flex-1">{lesson.title}</span>
                            {unlocked && <span className="text-xs opacity-40">{isExpanded ? '▲' : '▼'}</span>}
                          </button>

                          {isExpanded && isActive && lessonSections.map((sec, si) => {
                            const secActive   = sec.id === activeSection?.id
                            const secUnlocked = isSectionUnlocked(si, lesson, modules.flatMap(m => m.lessons))
                            const typeIcon = sec.content_type === 'video' ? '🎬'
                              : sec.content_type === 'audio' ? '🎵'
                              : sec.content_type === 'pdf' ? '📄'
                              : sec.content_type === 'quiz' ? '❓'
                              : sec.content_type === 'slides' ? '🖥️'
                              : sec.content_type === 'excel' ? '📊' : '📝'
                            return (
                              <button key={sec.id}
                                onClick={() => secUnlocked && setActiveSection(sec)}
                                disabled={!secUnlocked}
                                className={`w-full text-left pl-9 pr-3 py-2 flex items-center gap-2 text-xs transition-colors rounded-lg ${
                                  !secUnlocked
                                    ? (dark ? 'text-[#2a2a2a] cursor-not-allowed' : 'text-[#ddd] cursor-not-allowed')
                                    : secActive
                                      ? (dark ? 'text-white bg-[#222]' : 'text-[#111] bg-[#e8e8e4]')
                                      : (dark ? 'text-[#666] hover:text-[#aaa] hover:bg-[#111]' : 'text-[#999] hover:text-[#444] hover:bg-[#f0f0ee]')
                                }`}>
                                <span className="opacity-60">{secUnlocked ? typeIcon : '🔒'}</span>
                                <span className="truncate">{si + 1}. {sec.title}</span>
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                  )} {/* end modExpanded */}
                </div>
              )
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
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
            <CourseWelcomeScreen
              course={course}
              modules={modules}
              dark={dark}
              onStart={() => {
                setShowWelcome(false)
                const allLessons = modules.flatMap(m => m.lessons)
                const firstIncomplete = allLessons.find(l => !l.progress?.completed)
                const target = firstIncomplete || allLessons[0] || null
                if (target) navigateToLesson(target)
              }}
              onJumpBookmark={bookmarkedSection ? jumpToBookmark : undefined}
            />
          ) : (
            <div className="max-w-3xl mx-auto px-8 py-10">
              <h1 className={`text-2xl font-bold mb-8 ${dark ? 'text-white' : 'text-[#111]'}`}>
                {activeSection?.title || activeLesson.title}
              </h1>

              {activeSection
                ? <SectionContent section={activeSection} dark={dark} />
                : <p className={mutedText}>No content in this lesson yet.</p>
              }

              {/* Navigation */}
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

                {/* Bookmark button */}
                <button
                  onClick={saveBookmark}
                  title="Bookmark this position"
                  className={`px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                    bookmarkedSection?.sectionId === activeSection?.id
                      ? (dark ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-amber-500/50 text-amber-600 bg-amber-50')
                      : `${borderCol} ${mutedText} hover:text-current hover:border-current`
                  }`}
                >
                  {bookmarkedSection?.sectionId === activeSection?.id ? '🔖 Saved' : '🔖'}
                </button>

                <button
                  onClick={nextSection}
                  disabled={(isLastSection && isLastLesson) || (isLastSection && isSequential && !isLessonUnlocked(modules.flatMap(m => m.lessons)[allLessons.findIndex(l => l.id === activeLesson?.id) + 1] as any, modules.flatMap(m => m.lessons)))}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium border ${borderCol} ${mutedText} hover:text-current hover:border-current transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {isLastSection ? (isLastLesson ? 'Done' : 'Next lesson →') : 'Next section'}
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

// ─── Course Welcome Screen ────────────────────────────────────────────────────
function CourseWelcomeScreen({ course, modules, dark, onStart, onJumpBookmark }: {
  course: Course | null
  modules: ModuleWithLessons[]
  dark: boolean
  onStart: () => void
  onJumpBookmark?: () => void
}) {
  const totalLessons   = modules.reduce((s, m) => s + m.lessons.length, 0)
  const completedCount = modules.flatMap(m => m.lessons).filter(l => l.progress?.completed).length
  const isResume       = completedCount > 0
  const mutedText = dark ? 'text-[#555]' : 'text-[#888]'
  const borderCol = dark ? 'border-[#1a1a1a]' : 'border-[#e0e0da]'
  const cardBg    = dark ? 'bg-[#0f0f0f]'    : 'bg-white'
  const bodyText  = dark ? 'text-[#aaa]'      : 'text-[#444]'

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-16">

        {/* Header */}
        <p className={`${mutedText} text-xs uppercase tracking-widest mb-4`}>
          {isResume ? 'Welcome back' : 'Welcome'}
        </p>
        <h1 className={`text-3xl md:text-4xl font-bold mb-3 leading-tight ${dark ? 'text-white' : 'text-[#111]'}`}>
          {course?.title || 'The Course'}
        </h1>
        <p className={`${mutedText} text-sm mb-10`}>
          {modules.length} modules · {totalLessons} lessons
          {isResume && ` · ${completedCount} completed`}
        </p>

        {/* Welcome video placeholder — swap src for real embed when ready */}
        <div className={`border ${borderCol} rounded-xl overflow-hidden mb-10`}>
          <div className={`aspect-video ${dark ? 'bg-[#0d0d0d]' : 'bg-[#f0f0ee]'} flex flex-col items-center justify-center gap-3`}>
            <div className={`w-14 h-14 rounded-full border-2 ${dark ? 'border-[#333]' : 'border-[#ddd]'} flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${mutedText}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className={`text-sm ${mutedText}`}>Course intro video</p>
            <p className={`text-xs ${dark ? 'text-[#333]' : 'text-[#ccc]'}`}>Add a YouTube embed URL in the course description to display here</p>
          </div>
        </div>

        {/* What to expect */}
        <div className={`border ${borderCol} rounded-xl overflow-hidden mb-10 ${cardBg}`}>
          <div className={`px-5 py-4 border-b ${borderCol}`}>
            <h3 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-[#111]'}`}>How this course works</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            {[
              { icon: '📚', title: 'Lessons are divided into sections', body: 'Each lesson has multiple sections. Use the Next / Previous buttons at the bottom to move through them, or jump directly from the sidebar.' },
              { icon: '✓',  title: 'Progress is tracked automatically', body: 'When you finish the last section of a lesson, it is marked complete. Your progress is saved as you go.' },
              { icon: '❓', title: 'Knowledge checks at the end of each lesson', body: 'Every lesson ends with a quiz. Submit your answers to see your score and explanations.' },
              { icon: '☰',  title: 'Use the sidebar to navigate', body: 'Click a module to expand it, then click any lesson to jump directly to it. Collapse modules you\'ve finished to keep things clean.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <p className={`text-sm font-medium mb-1 ${dark ? 'text-[#ddd]' : 'text-[#222]'}`}>{title}</p>
                  <p className={`text-sm ${bodyText} leading-relaxed`}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module overview */}
        <div className={`border ${borderCol} rounded-xl overflow-hidden mb-10 ${cardBg}`}>
          <div className={`px-5 py-4 border-b ${borderCol}`}>
            <h3 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-[#111]'}`}>Course modules</h3>
          </div>
          {modules.map((mod, idx) => {
            const done = mod.lessons.filter(l => l.progress?.completed).length
            const total = mod.lessons.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <div key={mod.id} className={`flex items-center gap-4 px-5 py-3 border-b ${borderCol} last:border-b-0`}>
                <span className={`text-xs w-6 flex-shrink-0 ${mutedText}`}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${dark ? 'text-[#ccc]' : 'text-[#333]'}`}>{mod.title}</p>
                  <p className={`text-xs ${mutedText}`}>{total} lesson{total !== 1 ? 's' : ''}</p>
                </div>
                {pct === 100 ? (
                  <span className="text-[#10b981] text-sm flex-shrink-0">✓</span>
                ) : pct > 0 ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-16 h-1.5 rounded-full ${dark ? 'bg-[#1a1a1a]' : 'bg-[#eee]'} overflow-hidden`}>
                      <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs ${mutedText}`}>{pct}%</span>
                  </div>
                ) : (
                  <span className={`text-xs ${mutedText} flex-shrink-0`}>Not started</span>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={onStart}
            className={`px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors ${dark ? 'bg-white text-black hover:bg-white/90' : 'bg-[#111] text-white hover:bg-[#222]'}`}
          >
            {isResume ? `Continue where you left off →` : 'Start course →'}
          </button>
          {onJumpBookmark && (
            <button
              onClick={onJumpBookmark}
              className={`px-6 py-3.5 rounded-xl text-sm font-medium border transition-colors ${dark ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10' : 'border-amber-500/40 text-amber-600 hover:bg-amber-50'}`}
            >
              🔖 Jump to bookmark
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Module Intro Screen ──────────────────────────────────────────────────────
function ModuleIntroScreen({ mod, dark, onStartModule }: { mod: ModuleWithLessons; dark: boolean; onStartModule: () => void }) {
  const lessonCount    = mod.lessons.length
  const completedCount = mod.lessons.filter(l => l.progress?.completed).length
  const mutedText = dark ? 'text-[#555]' : 'text-[#888]'
  const borderCol = dark ? 'border-[#1a1a1a]' : 'border-[#e0e0da]'

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <p className={`${mutedText} text-xs uppercase tracking-widest mb-4`}>Module intro</p>
      <h1 className={`text-3xl font-bold mb-2 leading-tight ${dark ? 'text-white' : 'text-[#111]'}`}>{mod.title}</h1>
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
        <div className={`border-l-2 ${dark ? 'border-[#2a2a2a]' : 'border-[#ddd]'} pl-5 mb-10`}>
          <p className={`${dark ? 'text-[#aaa]' : 'text-[#444]'} leading-relaxed text-base whitespace-pre-wrap`}>{mod.description}</p>
        </div>
      )}

      {mod.lessons.length > 0 && (
        <div className={`border ${borderCol} rounded-xl overflow-hidden mb-10`}>
          <div className={`px-4 py-3 border-b ${borderCol} ${dark ? 'bg-[#0f0f0f]' : 'bg-[#fafaf8]'}`}>
            <p className={`text-xs uppercase tracking-widest ${mutedText}`}>Lessons in this module</p>
          </div>
          {mod.lessons.map((lesson, idx) => (
            <div key={lesson.id} className={`flex items-center gap-3 px-4 py-3 border-b ${borderCol} last:border-b-0 ${dark ? '' : 'bg-white'}`}>
              <span className={`text-xs w-5 ${mutedText}`}>{idx + 1}</span>
              {lesson.progress?.completed
                ? <span className="text-[#10b981] text-sm flex-shrink-0">✓</span>
                : <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${dark ? 'border-[#333]' : 'border-[#ccc]'}`} />
              }
              <span className={`text-sm ${dark ? 'text-[#888]' : 'text-[#444]'}`}>{lesson.title}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onStartModule}
        className={`px-8 py-3 rounded-xl text-sm font-medium transition-colors ${dark ? 'bg-white text-black hover:bg-white/90' : 'bg-[#111] text-white hover:bg-[#222]'}`}
      >
        {completedCount > 0 && completedCount < lessonCount ? 'Continue module →' : completedCount === lessonCount && lessonCount > 0 ? 'Review module →' : 'Start module →'}
      </button>
    </div>
  )
}

// ─── Section content ──────────────────────────────────────────────────────────
function SectionContent({ section, dark }: { section: Section; dark: boolean }) {
  const proseColor = dark ? '#ccc' : '#222'
  const h2Color    = dark ? '#fff' : '#111'
  const h3Color    = dark ? '#eee' : '#1a1a1a'
  const quoteColor = dark ? '#888' : '#666'
  const quoteBorder= dark ? '#333' : '#ddd'
  const codeColor  = dark ? '#aaa' : '#333'
  const codeBg     = dark ? '#111' : '#f0f0ee'
  const linkColor  = '#3b82f6'

  return (
    <div>
      <style>{`
        .fv-content ul { list-style-type: disc !important; padding-left: 1.5em !important; margin: .6em 0 !important; }
        .fv-content ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin: .6em 0 !important; }
        .fv-content li { display: list-item !important; color: ${proseColor}; line-height: 1.75; margin-bottom: .25em; }
        .fv-content h1 { font-size: 1.5em; font-weight: 700; margin: 1em 0 .4em; color: ${h2Color}; }
        .fv-content h2 { font-size: 1.2em; font-weight: 700; margin: 1.2em 0 .4em; color: ${h2Color}; }
        .fv-content h3 { font-size: 1.05em; font-weight: 600; margin: 1em 0 .3em; color: ${h3Color}; }
        .fv-content h4 { font-size: .95em; font-weight: 600; margin: .8em 0 .25em; color: ${h3Color}; }
        .fv-content p  { margin: .6em 0; color: ${proseColor}; line-height: 1.8; }
        .fv-content strong { color: ${dark ? '#fff' : '#000'}; font-weight: 600; }
        .fv-content em { font-style: italic; }
        .fv-content blockquote { border-left: 3px solid ${quoteBorder}; padding-left: 1em; color: ${quoteColor}; margin: .6em 0; }
        .fv-content code { background: ${codeBg}; color: ${codeColor}; padding: 1px 5px; border-radius: 4px; font-size: .88em; }
        .fv-content img { max-width: 100%; border-radius: 6px; margin: 8px 0; display: block; }
        .fv-content table { border-collapse: collapse; width: 100%; margin: .8em 0; font-size: .9em; }
        .fv-content th { background: ${dark ? '#1a1a1a' : '#f0f0ee'}; font-weight: 600; font-size: .8em; text-transform: uppercase; letter-spacing: .05em; padding: 8px 12px; border: 1px solid ${dark ? '#2a2a2a' : '#ddd'}; text-align: left; color: ${dark ? '#aaa' : '#555'}; }
        .fv-content td { padding: 8px 12px; border: 1px solid ${dark ? '#2a2a2a' : '#ddd'}; color: ${proseColor}; vertical-align: top; }
        .fv-content tr:nth-child(even) td { background: ${dark ? '#0f0f0f' : '#fafaf8'}; }
      `}</style>
      <SectionRenderer section={section} dark={dark} />
    </div>
  )
}

function SectionRenderer({ section, dark }: { section: Section; dark: boolean }) {
  const mutedText = dark ? 'text-[#555]' : 'text-[#999]'
  const borderCol = dark ? 'border-[#1a1a1a]' : 'border-[#e0e0da]'
  const audioBg   = dark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-[#f7f7f5] border-[#e0e0da]'

  const rawBlocks = (section as any).blocks
  if (rawBlocks) {
    let blocks: any[] = []
    try { blocks = JSON.parse(rawBlocks) } catch {}
    if (blocks.length > 0) {
      return (
        <div className="space-y-6">
          {blocks.map((block: any, i: number) => (
            <BlockRenderer key={block.id || i} block={block} dark={dark} />
          ))}
        </div>
      )
    }
  }

  switch (section.content_type) {
    case 'text':
      return section.content_text
        ? <div className="fv-content" style={{ lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: section.content_text }} />
        : <p className={mutedText}>No content yet.</p>

    case 'video':
      return (
        <div>
          {section.content_url?.includes('embed')
            ? <div className="aspect-video bg-[#111] rounded-lg overflow-hidden mb-4"><iframe src={section.content_url} className="w-full h-full" allowFullScreen /></div>
            : <p className={mutedText}>Video URL not set.</p>}
          {section.content_text && <div className="mt-6 fv-content" dangerouslySetInnerHTML={{ __html: section.content_text }} />}
        </div>
      )

    case 'audio':
      return (
        <div className={`${audioBg} border rounded-lg p-6 mb-4`}>
          {section.content_url
            ? <audio controls className="w-full"><source src={section.content_url} /></audio>
            : <p className={`${mutedText} text-center`}>Audio not available.</p>}
          {section.content_text && <div className="mt-6 fv-content" dangerouslySetInnerHTML={{ __html: section.content_text }} />}
        </div>
      )

    case 'pdf':
      return section.content_url
        ? <iframe src={section.content_url} className={`w-full rounded-lg border ${borderCol}`} style={{ height: '70vh' }} />
        : <p className={mutedText}>PDF not available.</p>

    case 'slides':
      return section.content_url
        ? <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(section.content_url)}`} className={`w-full rounded-lg border ${borderCol}`} style={{ height: '70vh' }} allowFullScreen />
        : <p className={mutedText}>Slides not available.</p>

    case 'excel':
      return section.content_url
        ? <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(section.content_url)}`} className={`w-full rounded-lg border ${borderCol}`} style={{ height: '60vh' }} />
        : <p className={mutedText}>File not available.</p>

    case 'quiz':
      return <QuizPlayer questions={section.content_text || '[]'} dark={dark} />

    default:
      return <p className={mutedText}>Unknown content type.</p>
  }
}

function BlockRenderer({ block, dark }: { block: any; dark: boolean }) {
  const mutedText = dark ? 'text-[#555]' : 'text-[#999]'
  const borderCol = dark ? 'border-[#1a1a1a]' : 'border-[#e0e0da]'
  const audioBg   = dark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-[#f7f7f5] border-[#e0e0da]'

  switch (block.type) {
    case 'text':
      return block.content_text
        ? <div className="fv-content" style={{ lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: block.content_text }} />
        : null

    case 'image':
      return block.content_url ? (
        <figure className="my-2">
          <img src={block.content_url} alt={block.content_text || ''} style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }} />
          {block.content_text && <figcaption className={`text-xs ${mutedText} mt-2 text-center`}>{block.content_text}</figcaption>}
        </figure>
      ) : null

    case 'video':
      return block.content_url?.includes('embed') ? (
        <div className="aspect-video bg-[#111] rounded-lg overflow-hidden">
          <iframe src={block.content_url} className="w-full h-full" allowFullScreen />
        </div>
      ) : null

    case 'audio':
      return block.content_url ? (
        <div className={`${audioBg} border rounded-lg p-5`}>
          <audio controls className="w-full"><source src={block.content_url} /></audio>
        </div>
      ) : null

    case 'pdf':
      return block.content_url
        ? <iframe src={block.content_url} className={`w-full rounded-lg border ${borderCol}`} style={{ height: '70vh' }} />
        : null

    case 'slides':
      return block.content_url
        ? <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(block.content_url)}`} className={`w-full rounded-lg border ${borderCol}`} style={{ height: '70vh' }} allowFullScreen />
        : null

    case 'excel':
      return block.content_url
        ? <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(block.content_url)}`} className={`w-full rounded-lg border ${borderCol}`} style={{ height: '60vh' }} />
        : null

    case 'quiz':
      return <QuizPlayer questions={block.content_text || '[]'} dark={dark} />

    default:
      return null
  }
}

// ─── Quiz Player ──────────────────────────────────────────────────────────────
function QuizPlayer({ questions: raw, dark }: { questions: string; dark: boolean }) {
  let qs: any[] = []
  try {
    const parsed = JSON.parse(raw)
    qs = parsed.questions || parsed
  } catch { qs = [] }

  const [answers, setAnswers]     = useState<Record<number, any>>({})
  const [submitted, setSubmitted] = useState(false)

  const mutedText = dark ? 'text-[#555]'    : 'text-[#888]'
  const cardBg    = dark ? 'bg-[#0f0f0f]'   : 'bg-[#fafaf8]'
  const cardBorder= dark ? 'border-[#1a1a1a]': 'border-[#e0e0da]'
  const qText     = dark ? 'text-[#ccc]'    : 'text-[#222]'
  const optDefault= dark
    ? 'border-[#222] text-[#888] hover:border-[#333] hover:text-[#ccc]'
    : 'border-[#ddd] text-[#555] hover:border-[#bbb] hover:text-[#111]'
  const optSelected = dark ? 'border-white/30 bg-white/5 text-white' : 'border-[#111]/30 bg-[#111]/5 text-[#111]'
  const inputStyle  = dark
    ? 'bg-[#111] border-[#222] text-[#ccc] focus:border-[#444]'
    : 'bg-white border-[#ddd] text-[#222] focus:border-[#aaa]'

  if (!qs.length) return <p className={mutedText}>No questions yet.</p>

  const typeColors: Record<string, string> = { multiple_choice: '#3b82f6', fill_blank: '#10b981', matching: '#f59e0b' }

  return (
    <div className="space-y-6">
      {qs.map((q: any, qi: number) => (
        <div key={qi} className={`border ${cardBorder} rounded-xl p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: typeColors[q.type] + '15', color: typeColors[q.type] }}>
              {q.type === 'multiple_choice' ? 'Multiple choice' : q.type === 'fill_blank' ? 'Fill in the blank' : 'Matching'}
            </span>
          </div>
          {q.image_url && <img src={q.image_url} className="max-w-full rounded-lg mb-3" style={{ maxHeight: '200px', objectFit: 'cover' }} />}
          <p className={`${qText} mb-4 leading-relaxed`}>{q.question}</p>

          {q.type === 'multiple_choice' && (
            <div className="space-y-2">
              {(q.options || []).map((opt: string, oi: number) => {
                const selected = answers[qi] === oi
                const correct  = submitted && oi === q.correct_index
                const wrong    = submitted && selected && oi !== q.correct_index
                return (
                  <button key={oi} onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      correct  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
                      wrong    ? 'border-red-500/50 bg-red-500/10 text-red-400' :
                      selected ? optSelected :
                                 optDefault
                    }`}>
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {q.type === 'fill_blank' && (
            <input
              value={answers[qi] || ''}
              onChange={e => !submitted && setAnswers(a => ({ ...a, [qi]: e.target.value }))}
              placeholder="Your answer…"
              className={`w-full border rounded-lg px-4 py-3 text-sm outline-none ${
                submitted
                  ? answers[qi]?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim()
                    ? 'border-emerald-500/50 text-emerald-400'
                    : 'border-red-500/50 text-red-400'
                  : inputStyle
              }`}
            />
          )}

          {q.type === 'matching' && (
            <div className="grid grid-cols-2 gap-3">
              {(q.pairs || []).map((pair: any, pi: number) => (
                <div key={pi} className="contents">
                  <div className={`px-3 py-2 border rounded-lg text-sm ${dark ? 'bg-[#111] border-[#222] text-[#ccc]' : 'bg-white border-[#ddd] text-[#333]'}`}>{pair.left}</div>
                  <div className={`px-3 py-2 border rounded-lg text-sm ${dark ? 'bg-[#111] border-[#222] text-[#888]' : 'bg-[#f7f7f5] border-[#ddd] text-[#666]'}`}>{pair.right}</div>
                </div>
              ))}
            </div>
          )}

          {submitted && q.explanation && (
            <p className={`mt-3 text-sm ${dark ? 'text-[#666]' : 'text-[#888]'} border-t ${dark ? 'border-[#1a1a1a]' : 'border-[#e0e0da]'} pt-3`}>
              {q.explanation}
            </p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button onClick={() => setSubmitted(true)}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${dark ? 'bg-white text-black hover:bg-white/90' : 'bg-[#111] text-white hover:bg-[#222]'}`}>
          Submit answers
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <p className={`text-sm ${mutedText}`}>
            Score: {qs.filter((q: any, qi: number) =>
              q.type === 'multiple_choice' ? answers[qi] === q.correct_index :
              q.type === 'fill_blank' ? answers[qi]?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim() : true
            ).length}/{qs.length}
          </p>
          <button onClick={() => { setAnswers({}); setSubmitted(false) }}
            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${dark ? 'border-[#222] text-[#888] hover:text-white hover:border-[#333]' : 'border-[#ddd] text-[#888] hover:text-[#111] hover:border-[#aaa]'}`}>
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
