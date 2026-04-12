import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, Module, Lesson, LessonProgress, Course } from '@/lib/supabase'
import { useLocation, useParams, Link } from 'wouter'

type LessonWithProgress = Lesson & { progress?: LessonProgress }
type ModuleWithLessons = Module & { lessons: LessonWithProgress[] }

export default function CoursePlayer() {
  const { user, loading, isAuthenticated } = useAuth()
  const [, setLocation] = useLocation()
  const params = useParams<{ courseId: string; lessonId?: string }>()
  const courseId = params.courseId

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [lessonCompleted, setLessonCompleted] = useState(false)

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
      if (found) setActiveLesson(found)
    }
  }, [params.lessonId, modules])

  async function loadCourse() {
    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user!.id)
      .eq('course_id', courseId)
      .single()

    if (!enrollment) {
      setLocation('/dashboard')
      return
    }
    setEnrollmentId(enrollment.id)

    // Fetch course
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()
    setCourse(courseData)

    // Fetch modules + lessons + progress
    const { data: modulesData } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('position')

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('enrollment_id', enrollment.id)

    const modulesWithLessons: ModuleWithLessons[] = await Promise.all(
      (modulesData || []).map(async (mod) => {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', mod.id)
          .eq('is_published', true)
          .order('position')

        const lessonsWithProgress = (lessons || []).map(lesson => ({
          ...lesson,
          progress: progressData?.find(p => p.lesson_id === lesson.id),
        }))

        return { ...mod, lessons: lessonsWithProgress }
      })
    )

    setModules(modulesWithLessons)

    // Set first incomplete lesson as active if no lessonId in URL
    if (!params.lessonId) {
      const allLessons = modulesWithLessons.flatMap(m => m.lessons)
      const firstIncomplete = allLessons.find(l => !l.progress?.completed)
      setActiveLesson(firstIncomplete || allLessons[0] || null)
    }

    setDataLoading(false)
  }

  async function markComplete() {
    if (!activeLesson || !enrollmentId || !user) return
    setCompleting(true)

    const { error } = await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      lesson_id: activeLesson.id,
      enrollment_id: enrollmentId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })

    if (!error) {
      setLessonCompleted(true)
      // Refresh modules to update progress indicators
      await loadCourse()
    }
    setCompleting(false)
  }

  function navigateToLesson(lesson: Lesson) {
    setActiveLesson(lesson)
    setLessonCompleted(
      modules.flatMap(m => m.lessons).find(l => l.id === lesson.id)?.progress?.completed || false
    )
    setLocation(`/learn/${courseId}/${lesson.id}`)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  function nextLesson() {
    const all = modules.flatMap(m => m.lessons)
    const idx = all.findIndex(l => l.id === activeLesson?.id)
    if (idx < all.length - 1) navigateToLesson(all[idx + 1])
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const allLessons = modules.flatMap(m => m.lessons)
  const completedCount = allLessons.filter(l => l.progress?.completed).length
  const totalCount = allLessons.length
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-3 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#555] hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => { window.location.href = '/dashboard' }}
            className="text-[#555] hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-[#333]">|</span>
          <span className="text-white font-bold text-lg tracking-tight">
            Fin<span className="font-light">Verse</span>
          </span>
          {course && (
            <>
              <span className="text-[#333]">/</span>
              <span className="text-[#888] text-sm truncate max-w-[200px]">{course.title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#555] text-xs">{completedCount}/{totalCount} lessons</span>
          <div className="w-24 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 border-r border-[#1a1a1a] overflow-y-auto transition-all duration-200 bg-[#0a0a0a]`}
        >
          <div className="p-4 min-w-[288px]">
            {modules.map((mod, mIdx) => (
              <div key={mod.id} className="mb-6">
                <p className="text-[#555] text-xs uppercase tracking-widest mb-3 px-2">
                  Module {mIdx + 1} · {mod.title}
                </p>
                <div className="space-y-1">
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLesson?.id
                    const isDone = lesson.progress?.completed
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigateToLesson(lesson)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                          isActive
                            ? 'bg-[#1a1a1a] text-white'
                            : 'text-[#888] hover:text-white hover:bg-[#111]'
                        }`}
                      >
                        {/* Status icon */}
                        <span className="shrink-0 mt-0.5">
                          {isDone ? (
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <ContentIcon type={lesson.content_type} />
                          )}
                        </span>
                        <span className="text-sm leading-snug">{lesson.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {!activeLesson ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#555]">Select a lesson to begin.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-8 py-10">
              {/* Lesson header */}
              <div className="mb-8">
                <p className="text-[#555] text-xs uppercase tracking-widest mb-2">
                  <ContentTypeLabel type={activeLesson.content_type} />
                </p>
                <h1 className="text-2xl font-bold mb-1">{activeLesson.title}</h1>
                {activeLesson.duration_minutes && (
                  <p className="text-[#555] text-sm">{activeLesson.duration_minutes} min</p>
                )}
              </div>

              {/* Content */}
              <LessonContent lesson={activeLesson} />

              {/* Actions */}
              <div className="mt-10 flex items-center justify-between border-t border-[#1a1a1a] pt-6">
                <button
                  onClick={markComplete}
                  disabled={completing || lessonCompleted || !!activeLesson.progress?.completed}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    lessonCompleted || activeLesson.progress?.completed
                      ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 cursor-default'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {lessonCompleted || activeLesson.progress?.completed
                    ? '✓ Completed'
                    : completing
                    ? 'Saving…'
                    : 'Mark complete'}
                </button>

                <button
                  onClick={nextLesson}
                  disabled={allLessons[allLessons.length - 1]?.id === activeLesson.id}
                  className="flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm disabled:opacity-30 disabled:cursor-default"
                >
                  Next lesson
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

// ─── Content renderer ────────────────────────────────────────────────────────

function LessonContent({ lesson }: { lesson: Lesson }) {
  switch (lesson.content_type) {
    case 'video':
      return (
        <div className="aspect-video bg-[#111] rounded-lg overflow-hidden mb-6">
          {lesson.content_url ? (
            <iframe
              src={lesson.content_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#555]">
              Video coming soon
            </div>
          )}
        </div>
      )

    case 'audio':
      return (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 mb-6">
          {lesson.content_url ? (
            <audio controls className="w-full" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
              <source src={lesson.content_url} />
              Your browser doesn't support audio playback.
            </audio>
          ) : (
            <p className="text-[#555] text-center">Audio coming soon</p>
          )}
          {lesson.content_text && (
            <div className="mt-6 prose prose-invert prose-sm max-w-none">
              <TextContent text={lesson.content_text} />
            </div>
          )}
        </div>
      )

    case 'text':
      return (
        <div className="prose prose-invert max-w-none">
          <TextContent text={lesson.content_text || ''} />
        </div>
      )

    case 'quiz':
      return lesson.content_text ? (
        <QuizContent jsonContent={lesson.content_text} />
      ) : (
        <p className="text-[#555]">Quiz coming soon</p>
      )

    case 'pdf':
      return (
        <div className="mb-6">
          {lesson.content_url ? (
            <iframe
              src={lesson.content_url}
              className="w-full rounded-lg border border-[#1a1a1a]"
              style={{ height: '600px' }}
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-[#111] rounded-lg text-[#555]">PDF coming soon</div>
          )}
        </div>
      )

    case 'slides':
      return (
        <div className="mb-6">
          {lesson.content_url ? (
            <iframe
              src={lesson.content_url}
              className="w-full rounded-lg border border-[#1a1a1a]"
              style={{ height: '480px' }}
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-[#111] rounded-lg text-[#555]">Slides coming soon</div>
          )}
        </div>
      )

    default:
      return null
  }
}

function TextContent({ text }: { text: string }) {
  // Renders both HTML (from new editor) and legacy markdown
  const isHtml = text.trim().startsWith('<')
  if (isHtml) {
    return (
      <div
        className="text-[#ccc] leading-relaxed"
        style={{ lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    )
  }
  // Legacy markdown fallback
  return (
    <div
      className="text-[#ccc] leading-relaxed space-y-4"
      dangerouslySetInnerHTML={{
        __html: text
          .replace(/\n\n/g, '</p><p class="mt-4">')
          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
          .replace(/^# (.+)$/gm, '<h2 class="text-white text-xl font-bold mt-8 mb-4">$1</h2>')
          .replace(/^## (.+)$/gm, '<h3 class="text-white text-lg font-semibold mt-6 mb-3">$1</h3>')
          .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>'),
      }}
    />
  )
}

function QuizContent({ jsonContent }: { jsonContent: string }) {
  let questions: any[] = []
  try { questions = JSON.parse(jsonContent) } catch { return <p className="text-[#555]">Quiz format error</p> }

  const [mcAnswers, setMcAnswers] = useState<Record<number, number>>({})
  const [fillAnswers, setFillAnswers] = useState<Record<number, string>>({})
  const [matchAnswers, setMatchAnswers] = useState<Record<number, Record<number, number>>>({})
  const [submitted, setSubmitted] = useState(false)

  function checkAnswer(q: any, qi: number): boolean {
    if (!q.type || q.type === 'multiple_choice') return mcAnswers[qi] === q.correct_index
    if (q.type === 'fill_blank') return (fillAnswers[qi] || '').trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase()
    if (q.type === 'matching') {
      const ma = matchAnswers[qi] || {}
      return (q.pairs || []).every((_: any, pi: number) => ma[pi] === pi)
    }
    return false
  }

  const score = submitted ? questions.filter((q, i) => checkAnswer(q, i)).length : 0

  return (
    <div className="space-y-8">
      {questions.map((q, qi) => {
        const correct = submitted && checkAnswer(q, qi)
        const wrong = submitted && !checkAnswer(q, qi)
        const type = q.type || 'multiple_choice'

        return (
          <div key={qi} className="border border-[#1a1a1a] rounded-lg p-6">
            {q.image_url && <img src={q.image_url} className="w-full max-h-48 object-cover rounded-lg mb-4" />}
            <p className="text-white font-medium mb-4">{q.question}</p>

            {type === 'multiple_choice' && (
              <div className="space-y-2">
                {(q.options || []).map((opt: string, oi: number) => {
                  const isSelected = mcAnswers[qi] === oi
                  const isCorrect = submitted && oi === q.correct_index
                  const isWrong = submitted && isSelected && oi !== q.correct_index
                  return (
                    <button key={oi} onClick={() => !submitted && setMcAnswers(p => ({ ...p, [qi]: oi }))}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors border ${isCorrect ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300' : isWrong ? 'border-red-400/50 bg-red-400/10 text-red-300' : isSelected ? 'border-white/30 bg-white/10 text-white' : 'border-[#222] text-[#888] hover:border-[#333] hover:text-white'}`}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}

            {type === 'fill_blank' && (
              <div>
                <input value={fillAnswers[qi] || ''} onChange={e => !submitted && setFillAnswers(p => ({ ...p, [qi]: e.target.value }))}
                  placeholder="Type your answer..."
                  className={`w-full px-4 py-3 rounded-lg text-sm border bg-transparent outline-none ${submitted ? correct ? 'border-emerald-400/50 text-emerald-300' : 'border-red-400/50 text-red-300' : 'border-[#333] text-white'}`} />
                {submitted && !correct && <p className="text-emerald-400 text-xs mt-2">Correct answer: {q.correct_answer}</p>}
              </div>
            )}

            {type === 'matching' && (
              <div className="space-y-2">
                <p className="text-[#555] text-xs mb-3">Click a left item, then click its match on the right.</p>
                <MatchingQuestion q={q} qi={qi} answers={matchAnswers[qi] || {}} submitted={submitted}
                  onAnswer={ma => setMatchAnswers(p => ({ ...p, [qi]: ma }))} />
              </div>
            )}

            {submitted && q.explanation && (
              <p className="text-[#666] text-xs mt-4 border-t border-[#1a1a1a] pt-4">{q.explanation}</p>
            )}
            {submitted && <p className={`text-xs mt-2 font-medium ${correct ? 'text-emerald-400' : 'text-red-400'}`}>{correct ? '✓ Correct' : '✗ Incorrect'}</p>}
          </div>
        )
      })}

      {!submitted ? (
        <button onClick={() => setSubmitted(true)}
          className="bg-white text-black font-medium px-6 py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors">
          Submit answers
        </button>
      ) : (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 text-center">
          <p className="text-2xl font-bold mb-1">{score}/{questions.length}</p>
          <p className="text-[#888] text-sm">{score === questions.length ? 'Perfect score!' : score >= questions.length * 0.7 ? 'Well done.' : 'Review the material and try again.'}</p>
        </div>
      )}
    </div>
  )
}

function MatchingQuestion({ q, qi, answers, submitted, onAnswer }: any) {
  const [selected, setSelected] = useState<number | null>(null)
  const pairs = q.pairs || []
  const rightOrder = [...pairs].map((_, i) => i).sort(() => 0.5 - Math.random())
  const [shuffled] = useState(rightOrder)

  function clickLeft(i: number) {
    if (submitted) return
    setSelected(i)
  }

  function clickRight(ri: number) {
    if (submitted || selected === null) return
    const newAnswers = { ...answers, [selected]: ri }
    onAnswer(newAnswers)
    setSelected(null)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {pairs.map((p: any, i: number) => (
          <button key={i} onClick={() => clickLeft(i)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${selected === i ? 'border-white/50 bg-white/10 text-white' : answers[i] !== undefined ? 'border-emerald-400/40 text-emerald-300' : 'border-[#222] text-[#888] hover:border-[#333]'}`}>
            {p.left}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {shuffled.map((ri: number) => (
          <button key={ri} onClick={() => clickRight(ri)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${Object.values(answers).includes(ri) ? 'border-blue-400/40 text-blue-300' : 'border-[#222] text-[#888] hover:border-[#333]'}`}>
            {pairs[ri].right}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ContentIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 text-[#444]"
  switch (type) {
    case 'video':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'audio':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
    case 'quiz':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'pdf':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    case 'slides':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    default:
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  }
}

function ContentTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    video: 'Video lesson',
    audio: 'Audio lesson',
    text: 'Reading',
    quiz: 'Quiz',
    pdf: 'PDF document',
    slides: 'Presentation',
  }
  return <>{labels[type] || 'Lesson'}</>
}
