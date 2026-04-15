// courseParser.ts
// Converts the Finverse markdown import format into a structured object
// ready for Supabase insertion.

export interface SectionData {
  title: string;
  content_type: string;
  content_text: string | null;
  content_url: string | null;
  position: number;
  blocks: Record<string, unknown> | null;
}

export interface LessonData {
  title: string;
  description: string | null;
  content_type: string;
  content_text: string | null;
  content_url: string | null;
  pdf_url: string | null;
  duration_seconds: number | null;
  duration_minutes: number | null;
  is_preview: boolean;
  is_published: boolean;
  position: number;
  sections: SectionData[];
}

export interface ModuleData {
  title: string;
  description: string | null;
  position: number;
  intro_video_url: string | null;
  lessons: LessonData[];
}

export interface CourseData {
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  is_published: boolean;
  position: number;
  modules: ModuleData[];
}

export interface ParseResult {
  success: boolean;
  data?: CourseData;
  errors: string[];
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseMetaBlock(lines: string[]): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const line of lines) {
    const match = line.match(/^([a-zA-Z_]+)\s*:\s*(.+)$/);
    if (match) {
      meta[match[1].trim()] = match[2].trim();
    }
  }
  return meta;
}

function extractFencedContent(lines: string[], startIdx: number): { content: string; endIdx: number } {
  // Find opening ---
  let i = startIdx;
  while (i < lines.length && lines[i].trim() !== '---') i++;
  if (i >= lines.length) return { content: '', endIdx: startIdx };
  i++; // skip opening ---
  const contentLines: string[] = [];
  while (i < lines.length && lines[i].trim() !== '---') {
    contentLines.push(lines[i]);
    i++;
  }
  return { content: contentLines.join('\n').trim(), endIdx: i };
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

export function parseCourseMarkdown(raw: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = raw.split('\n');

  let courseTitle = '';
  let courseMeta: Record<string, string> = {};
  const modules: ModuleData[] = [];

  let currentModuleTitle = '';
  let currentModuleMeta: Record<string, string> = {};
  let currentModuleMetaLines: string[] = [];
  let currentLessons: LessonData[] = [];

  let currentLessonTitle = '';
  let currentLessonMeta: Record<string, string> = {};
  let currentLessonMetaLines: string[] = [];
  let currentSections: SectionData[] = [];

  let currentSectionTitle = '';
  let currentSectionMeta: Record<string, string> = {};
  let currentSectionMetaLines: string[] = [];
  let inSectionMeta = false;

  type Level = 'none' | 'course' | 'module' | 'lesson' | 'section';
  let level: Level = 'none';

  const finalizeSection = () => {
    if (!currentSectionTitle) return;
    const meta = parseMetaBlock(currentSectionMetaLines);
    currentSections.push({
      title: currentSectionTitle,
      content_type: meta.type || 'text',
      content_text: meta._content || null,
      content_url: meta.content_url || null,
      position: currentSections.length + 1,
      blocks: null,
    });
    currentSectionTitle = '';
    currentSectionMeta = {};
    currentSectionMetaLines = [];
    inSectionMeta = false;
  };

  const finalizeLesson = () => {
    if (!currentLessonTitle) return;
    finalizeSection();
    const meta = parseMetaBlock(currentLessonMetaLines);
    currentLessons.push({
      title: currentLessonTitle,
      description: meta.description || null,
      content_type: meta.content_type || 'text',
      content_text: meta.content_text || null,
      content_url: meta.content_url || null,
      pdf_url: meta.pdf_url || null,
      duration_seconds: meta.duration_seconds ? parseInt(meta.duration_seconds) : null,
      duration_minutes: meta.duration_minutes ? parseInt(meta.duration_minutes) : null,
      is_preview: meta.is_preview === 'true',
      is_published: meta.is_published !== 'false',
      position: currentLessons.length + 1,
      sections: [...currentSections],
    });
    currentLessonTitle = '';
    currentLessonMeta = {};
    currentLessonMetaLines = [];
    currentSections = [];
  };

  const finalizeModule = () => {
    if (!currentModuleTitle) return;
    finalizeLesson();
    const meta = parseMetaBlock(currentModuleMetaLines);
    modules.push({
      title: currentModuleTitle,
      description: meta.description || null,
      position: modules.length + 1,
      intro_video_url: meta.intro_video_url || null,
      lessons: [...currentLessons],
    });
    currentModuleTitle = '';
    currentModuleMeta = {};
    currentModuleMetaLines = [];
    currentLessons = [];
  };

  let i = 0;
  let inFence = false;
  let fenceContent: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle fenced content blocks inside sections
    if (trimmed === '---' && level === 'section') {
      if (!inFence) {
        inFence = true;
        fenceContent = [];
      } else {
        // Close fence — attach content to current section meta
        currentSectionMetaLines.push(`_content: ${fenceContent.join('\\n')}`);
        // Store full content directly
        const sectionIdx = currentSections.length; // will be next section
        // We store raw for later
        if (currentSectionTitle) {
          const meta = parseMetaBlock(currentSectionMetaLines);
          currentSections.push({
            title: currentSectionTitle,
            content_type: meta.type || 'text',
            content_text: fenceContent.join('\n').trim(),
            content_url: meta.content_url || null,
            position: currentSections.length + 1,
            blocks: null,
          });
          currentSectionTitle = '';
          currentSectionMeta = {};
          currentSectionMetaLines = [];
        }
        inFence = false;
        fenceContent = [];
      }
      i++;
      continue;
    }

    if (inFence) {
      fenceContent.push(line);
      i++;
      continue;
    }

    // Course heading
    if (/^# /.test(line)) {
      courseTitle = line.replace(/^# /, '').trim();
      level = 'course';
      i++;
      // Collect course meta lines until next heading
      const metaLines: string[] = [];
      while (i < lines.length && !/^#{1,4} /.test(lines[i])) {
        metaLines.push(lines[i]);
        i++;
      }
      courseMeta = parseMetaBlock(metaLines);
      continue;
    }

    // Module heading
    if (/^## /.test(line)) {
      finalizeModule();
      currentModuleTitle = line.replace(/^## /, '').replace(/^Module \d+:\s*/i, '').trim();
      level = 'module';
      i++;
      currentModuleMetaLines = [];
      while (i < lines.length && !/^#{1,4} /.test(lines[i])) {
        currentModuleMetaLines.push(lines[i]);
        i++;
      }
      continue;
    }

    // Lesson heading
    if (/^### /.test(line)) {
      finalizeLesson();
      currentLessonTitle = line.replace(/^### /, '').replace(/^Lesson [\d.]+:\s*/i, '').trim();
      level = 'lesson';
      i++;
      currentLessonMetaLines = [];
      while (i < lines.length && !/^#{1,4} /.test(lines[i])) {
        currentLessonMetaLines.push(lines[i]);
        i++;
      }
      continue;
    }

    // Section heading
    if (/^#### /.test(line)) {
      finalizeSection();
      currentSectionTitle = line.replace(/^#### /, '').replace(/^Section:\s*/i, '').trim();
      level = 'section';
      i++;
      currentSectionMetaLines = [];
      // Collect meta lines until --- fence or next heading
      while (i < lines.length && !/^#{1,4} /.test(lines[i]) && lines[i].trim() !== '---') {
        currentSectionMetaLines.push(lines[i]);
        i++;
      }
      continue;
    }

    i++;
  }

  // Finalize remaining
  finalizeModule();

  // Validate
  if (!courseTitle) errors.push('Course title missing — must start with # Course Title');
  if (!courseMeta.slug) errors.push('Course slug missing — add: slug: your-course-slug');
  if (!courseMeta.price) errors.push('Course price missing — add: price: 79.99');
  if (modules.length === 0) warnings.push('No modules found in file');
  modules.forEach((m, mi) => {
    if (m.lessons.length === 0) warnings.push(`Module ${mi + 1} "${m.title}" has no lessons`);
  });

  if (errors.length > 0) {
    return { success: false, errors, warnings };
  }

  const courseData: CourseData = {
    title: courseTitle,
    slug: courseMeta.slug,
    subtitle: courseMeta.subtitle || null,
    description: courseMeta.description || null,
    thumbnail_url: courseMeta.thumbnail_url || null,
    price: parseFloat(courseMeta.price),
    stripe_price_id: courseMeta.stripe_price_id || null,
    stripe_product_id: courseMeta.stripe_product_id || null,
    is_published: courseMeta.is_published === 'true',
    position: courseMeta.position ? parseInt(courseMeta.position) : 1,
    modules,
  };

  return { success: true, data: courseData, errors: [], warnings };
}

// ---------------------------------------------------------------------------
// Stats helper for preview UI
// ---------------------------------------------------------------------------
export function getCourseStats(data: CourseData) {
  const moduleCount = data.modules.length;
  const lessonCount = data.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const sectionCount = data.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((la, l) => la + l.sections.length, 0),
    0
  );
  return { moduleCount, lessonCount, sectionCount };
}
