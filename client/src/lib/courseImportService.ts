// courseImportService.ts
// Takes a parsed CourseData object and inserts it into Supabase.
// Returns a detailed result with IDs and any insertion errors.

import { CourseData, ModuleData, LessonData, SectionData } from './courseParser';

export interface ImportProgress {
  stage: 'course' | 'module' | 'lesson' | 'section' | 'done' | 'error';
  message: string;
  percent: number;
}

export interface ImportResult {
  success: boolean;
  courseId?: string;
  modulesInserted: number;
  lessonsInserted: number;
  sectionsInserted: number;
  errors: string[];
}

export async function importCourseToSupabase(
  supabase: any,
  data: CourseData,
  onProgress?: (p: ImportProgress) => void
): Promise<ImportResult> {
  const errors: string[] = [];
  let modulesInserted = 0;
  let lessonsInserted = 0;
  let sectionsInserted = 0;

  const progress = (stage: ImportProgress['stage'], message: string, percent: number) => {
    onProgress?.({ stage, message, percent });
  };

  // -------------------------------------------------------------------------
  // 1. Check for slug conflict
  // -------------------------------------------------------------------------
  progress('course', 'Checking for existing course...', 2);
  const { data: existing } = await supabase
    .from('courses')
    .select('id, title')
    .eq('slug', data.slug)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      modulesInserted: 0,
      lessonsInserted: 0,
      sectionsInserted: 0,
      errors: [`A course with slug "${data.slug}" already exists (ID: ${existing.id}, Title: "${existing.title}"). Change the slug in your import file.`],
    };
  }

  // -------------------------------------------------------------------------
  // 2. Insert course
  // -------------------------------------------------------------------------
  progress('course', `Creating course: ${data.title}`, 5);
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: data.title,
      slug: data.slug,
      subtitle: data.subtitle,
      description: data.description,
      thumbnail_url: data.thumbnail_url,
      price: data.price,
      stripe_price_id: data.stripe_price_id,
      stripe_product_id: data.stripe_product_id,
      is_published: data.is_published,
      position: data.position,
    })
    .select('id')
    .single();

  if (courseError || !course) {
    return {
      success: false,
      modulesInserted: 0,
      lessonsInserted: 0,
      sectionsInserted: 0,
      errors: [`Failed to insert course: ${courseError?.message}`],
    };
  }

  const courseId = course.id;
  const totalModules = data.modules.length;
  const totalLessons = data.modules.reduce((a, m) => a + m.lessons.length, 0);

  // -------------------------------------------------------------------------
  // 3. Insert modules → lessons → sections
  // -------------------------------------------------------------------------
  for (let mi = 0; mi < data.modules.length; mi++) {
    const mod = data.modules[mi];
    const modulePercent = 10 + Math.round((mi / totalModules) * 85);

    progress('module', `Creating module ${mi + 1}/${totalModules}: ${mod.title}`, modulePercent);

    const { data: moduleRow, error: moduleError } = await supabase
      .from('modules')
      .insert({
        course_id: courseId,
        title: mod.title,
        description: mod.description,
        position: mod.position,
        intro_video_url: mod.intro_video_url,
      })
      .select('id')
      .single();

    if (moduleError || !moduleRow) {
      errors.push(`Module "${mod.title}": ${moduleError?.message}`);
      continue;
    }

    modulesInserted++;
    const moduleId = moduleRow.id;

    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li];

      progress(
        'lesson',
        `  Lesson ${li + 1}/${mod.lessons.length}: ${lesson.title}`,
        modulePercent + Math.round((li / Math.max(mod.lessons.length, 1)) * 5)
      );

      const { data: lessonRow, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          module_id: moduleId,
          title: lesson.title,
          description: lesson.description,
          content_type: lesson.content_type,
          content_text: lesson.content_text,
          content_url: lesson.content_url,
          pdf_url: lesson.pdf_url,
          duration_seconds: lesson.duration_seconds,
          duration_minutes: lesson.duration_minutes,
          is_preview: lesson.is_preview,
          is_published: lesson.is_published,
          position: lesson.position,
        })
        .select('id')
        .single();

      if (lessonError || !lessonRow) {
        errors.push(`Lesson "${lesson.title}": ${lessonError?.message}`);
        continue;
      }

      lessonsInserted++;
      const lessonId = lessonRow.id;

      // Insert sections
      for (let si = 0; si < lesson.sections.length; si++) {
        const section = lesson.sections[si];

        const { error: sectionError } = await supabase
          .from('sections')
          .insert({
            lesson_id: lessonId,
            title: section.title,
            content_type: section.content_type,
            content_text: section.content_text,
            content_url: section.content_url,
            position: section.position,
            blocks: section.blocks,
          });

        if (sectionError) {
          errors.push(`Section "${section.title}" in "${lesson.title}": ${sectionError.message}`);
        } else {
          sectionsInserted++;
        }
      }
    }
  }

  progress('done', 'Import complete', 100);

  return {
    success: errors.length === 0,
    courseId,
    modulesInserted,
    lessonsInserted,
    sectionsInserted,
    errors,
  };
}
