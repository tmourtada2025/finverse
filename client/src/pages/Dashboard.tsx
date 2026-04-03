import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase, Course, Enrollment } from '@/lib/supabase'
import { useLocation, Link } from 'wouter'

type EnrollmentWithCourse = Enrollment & { course: Course }

export default function Dashboard() {
  const { user, profile, isAuthenticated, isAdmin, loading, signOut } = useAuth()
  const [, setLocation] = useLocation()
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/login')
    }
  }, [loading, isAuthenticated, setLocation])

  useEffect(() => {
    if (!user) return
    fetchEnrollments()
  }, [user])

  async function fetchEnrollments() {
    const { data } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('user_id', user!.id)
      .order('enrolled_at', { ascending: false })

    setEnrollments((data as EnrollmentWithCourse[]) || [])
    setDataLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    setLocation('/')
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const activeCourses = enrollments.filter(e => !e.completed_at)
  const completedCourses = enrollments.filter(e => e.completed_at)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-8 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-50">
        <div className="flex items-center gap-6">
          <a href="/" className="text-white font-bold text-xl tracking-tight">
            Fin<span className="font-light">Verse</span>
          </a>
          <a href="/" className="text-[#555] text-sm hover:text-white transition-colors">
            ← Back to site
          </a>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin">
              <span className="text-[#888] text-sm hover:text-white transition-colors cursor-pointer">Admin</span>
            </Link>
          )}
          <span className="text-[#555] text-sm">{profile?.email || user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-[#555] text-sm hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[#555] text-sm uppercase tracking-widest mb-2">Dashboard</p>
          <h1 className="text-3xl font-bold">
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Your courses'}
          </h1>
        </div>

        {/* No enrollments */}
        {enrollments.length === 0 && (
          <div className="border border-[#1a1a1a] rounded-lg p-12 text-center">
            <p className="text-[#555] mb-2">You haven't enrolled in any courses yet.</p>
            <p className="text-[#444] text-sm mb-6">Once you purchase a course, it will appear here automatically.</p>
            <a
              href="/education"
              className="inline-block bg-white text-black text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explore courses →
            </a>
          </div>
        )}

        {/* Active courses */}
        {activeCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[#888] text-xs uppercase tracking-widest mb-6">In Progress</h2>
            <div className="space-y-4">
              {activeCourses.map(enrollment => (
                <CourseCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  userId={user!.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedCourses.length > 0 && (
          <div>
            <h2 className="text-[#888] text-xs uppercase tracking-widest mb-6">Completed</h2>
            <div className="space-y-4">
              {completedCourses.map(enrollment => (
                <CourseCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  userId={user!.id}
                  completed
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({
  enrollment,
  userId,
  completed = false,
}: {
  enrollment: EnrollmentWithCourse
  userId: string
  completed?: boolean
}) {
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    fetchProgress()
  }, [])

  async function fetchProgress() {
    const { count: total } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .in(
        'module_id',
        (
          await supabase
            .from('modules')
            .select('id')
            .eq('course_id', enrollment.course_id)
        ).data?.map(m => m.id) || []
      )

    const { count: done } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('enrollment_id', enrollment.id)
      .eq('completed', true)

    if (total && total > 0) {
      setProgress(Math.round(((done || 0) / total) * 100))
    } else {
      setProgress(0)
    }
  }

  return (
    <div className="border border-[#1a1a1a] rounded-lg p-6 hover:border-[#333] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-medium">{enrollment.course.title}</h3>
            {completed && (
              <span className="text-xs text-emerald-400 border border-emerald-400/30 rounded px-2 py-0.5">
                Complete
              </span>
            )}
          </div>
          {enrollment.course.description && (
            <p className="text-[#555] text-sm mb-4">{enrollment.course.description}</p>
          )}

          {/* Progress bar */}
          {progress !== null && !completed && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[#555] mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Link href={`/learn/${enrollment.course_id}`}>
          <span className="shrink-0 bg-[#1a1a1a] border border-[#333] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#222] hover:border-[#444] transition-colors cursor-pointer">
            {completed ? 'Review' : progress === 0 ? 'Start' : 'Continue'} →
          </span>
        </Link>
      </div>
    </div>
  )
}
