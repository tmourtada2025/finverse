-- FinVerse LMS — Definitive Schema Alignment
-- Based on actual DB schema (finverse-lms / qnhjdwfxdocnutulwmas)
-- Strategy: rename/add DB columns to match code exactly
-- Safe to run on dev DB with no live student data.
-- Run in Supabase SQL Editor. Each section is idempotent.

-- ══════════════════════════════════════════════════════════════
-- 1. COURSES
-- ══════════════════════════════════════════════════════════════
-- published → is_published
ALTER TABLE courses RENAME COLUMN published TO is_published;

-- sort_order → position (used in admin for ordering)
ALTER TABLE courses RENAME COLUMN sort_order TO position;

-- ══════════════════════════════════════════════════════════════
-- 2. LESSONS
-- ══════════════════════════════════════════════════════════════
-- lesson_type (USER-DEFINED enum) → content_type (text)
-- Cast enum to text, then swap column
ALTER TABLE lessons ADD COLUMN content_type TEXT;
UPDATE lessons SET content_type = lesson_type::TEXT;
ALTER TABLE lessons ALTER COLUMN content_type SET NOT NULL;
ALTER TABLE lessons ALTER COLUMN content_type SET DEFAULT 'video';
ALTER TABLE lessons DROP COLUMN lesson_type;

-- video_url → content_url
ALTER TABLE lessons RENAME COLUMN video_url TO content_url;

-- content → content_text
ALTER TABLE lessons RENAME COLUMN content TO content_text;

-- sort_order → position
ALTER TABLE lessons RENAME COLUMN sort_order TO position;

-- Add is_published (separate from is_preview — different semantics)
-- is_preview = free teaser; is_published = visible to enrolled students
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- Add duration_minutes (code uses this; DB had duration_seconds)
-- Convert existing data if any, else just add the column
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
UPDATE lessons SET duration_minutes = ROUND(duration_seconds::numeric / 60)
  WHERE duration_seconds IS NOT NULL AND duration_minutes IS NULL;

-- ══════════════════════════════════════════════════════════════
-- 3. MODULES
-- ══════════════════════════════════════════════════════════════
ALTER TABLE modules RENAME COLUMN sort_order TO position;

-- ══════════════════════════════════════════════════════════════
-- 4. ENROLLMENTS
-- ══════════════════════════════════════════════════════════════
-- Add completed_at (code uses this to distinguish active vs completed)
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Unique constraint for upsert (webhook + admin grant)
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_user_course_unique;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_course_unique
  UNIQUE (user_id, course_id);

-- ══════════════════════════════════════════════════════════════
-- 5. LESSON_PROGRESS
-- ══════════════════════════════════════════════════════════════
-- Replace course_id with enrollment_id
-- enrollment_id is the correct FK: tracks progress per enrollment,
-- not per course. Required for retakes and correct progress queries.
ALTER TABLE lesson_progress
  ADD COLUMN IF NOT EXISTS enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE;
ALTER TABLE lesson_progress DROP COLUMN IF EXISTS course_id;

-- Unique constraint for upsert
ALTER TABLE lesson_progress DROP CONSTRAINT IF EXISTS lesson_progress_user_lesson_unique;
ALTER TABLE lesson_progress ADD CONSTRAINT lesson_progress_user_lesson_unique
  UNIQUE (user_id, lesson_id);

-- ══════════════════════════════════════════════════════════════
-- 6. PROFILES
-- ══════════════════════════════════════════════════════════════
-- Add role column (missing entirely from DB)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'
  CHECK (role IN ('student', 'admin'));

-- ══════════════════════════════════════════════════════════════
-- 7. AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ══════════════════════════════════════════════════════════════
-- 8. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- courses: published visible to authenticated; admins see all
DROP POLICY IF EXISTS "courses_select" ON courses;
CREATE POLICY "courses_select" ON courses FOR SELECT USING (
  is_published = true OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "courses_all_admin" ON courses;
CREATE POLICY "courses_all_admin" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- modules: enrolled users or admin
DROP POLICY IF EXISTS "modules_select" ON modules;
CREATE POLICY "modules_select" ON modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE user_id = auth.uid() AND course_id = modules.course_id
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "modules_all_admin" ON modules;
CREATE POLICY "modules_all_admin" ON modules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- lessons: enrolled users or admin (is_preview lessons visible to all authenticated)
DROP POLICY IF EXISTS "lessons_select" ON lessons;
CREATE POLICY "lessons_select" ON lessons FOR SELECT USING (
  is_preview = true OR
  EXISTS (
    SELECT 1 FROM modules m
    JOIN enrollments e ON e.course_id = m.course_id
    WHERE m.id = lessons.module_id AND e.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "lessons_all_admin" ON lessons;
CREATE POLICY "lessons_all_admin" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- enrollments
DROP POLICY IF EXISTS "enrollments_select" ON enrollments;
CREATE POLICY "enrollments_select" ON enrollments FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "enrollments_all_admin" ON enrollments;
CREATE POLICY "enrollments_all_admin" ON enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- lesson_progress
DROP POLICY IF EXISTS "progress_select" ON lesson_progress;
CREATE POLICY "progress_select" ON lesson_progress FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "progress_insert" ON lesson_progress;
CREATE POLICY "progress_insert" ON lesson_progress FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "progress_update" ON lesson_progress;
CREATE POLICY "progress_update" ON lesson_progress FOR UPDATE USING (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════
-- 9. SEED BLUEPRINT COURSE
-- ══════════════════════════════════════════════════════════════
INSERT INTO courses (title, slug, description, price, is_published)
VALUES (
  'The Trader''s Financial Blueprint',
  'traders-financial-blueprint',
  'Most traders learn how to read markets. Almost none learn how to manage the money those markets generate. Six focused modules covering everything outside the chart.',
  147,
  true
)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 10. MAKE YOURSELF ADMIN
-- Run this after your first Google sign-in:
-- ══════════════════════════════════════════════════════════════
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';
