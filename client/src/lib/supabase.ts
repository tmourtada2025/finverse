import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
}

export type Course = {
  id: string
  title: string
  slug: string
  subtitle: string | null
  description: string | null
  thumbnail_url: string | null
  price: number
  stripe_price_id: string | null
  stripe_product_id: string | null
  is_published: boolean
  position: number
  created_at: string
  updated_at: string
}

export type Module = {
  id: string
  course_id: string
  title: string
  description: string | null
  position: number
  created_at: string
}

export type Lesson = {
  id: string
  module_id: string
  course_id: string
  title: string
  description: string | null
  content_type: 'text' | 'video' | 'audio' | 'quiz' | 'pdf' | 'slides' | 'excel'
  content_url: string | null
  content_text: string | null
  pdf_url: string | null
  duration_seconds: number | null
  duration_minutes: number | null
  position: number
  is_preview: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export type Section = {
  id: string
  lesson_id: string
  title: string
  content_type: 'text' | 'video' | 'audio' | 'quiz' | 'pdf' | 'slides' | 'excel'
  content_text: string | null
  content_url: string | null
  position: number
  created_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  status: 'active' | 'completed' | 'refunded' | 'suspended'
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  amount_paid: number | null
  enrolled_at: string
  completed_at: string | null
}

export type LessonProgress = {
  id: string
  user_id: string
  lesson_id: string
  enrollment_id: string
  section_id: string | null
  completed: boolean
  progress_seconds: number
  completed_at: string | null
  last_watched_at: string
}

export type Certificate = {
  id: string
  user_id: string
  course_id: string
  issued_at: string
  certificate_url: string | null
}

export type QuizQuestion = {
  type: 'multiple_choice' | 'fill_blank' | 'matching'
  question: string
  image_url?: string
  options?: string[]
  correct_index?: number
  correct_answer?: string
  pairs?: { left: string; right: string }[]
  explanation: string
}
