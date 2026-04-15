// CourseImporter.tsx
// Drop this component into your Admin.tsx alongside the existing course management UI.
// It adds an "Import Course" tab/section that Darine can use to bulk-upload course content.

import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase'; // adjust path to your supabase client
import { parseCourseMarkdown, getCourseStats, CourseData } from './courseParser';
import { importCourseToSupabase, ImportProgress } from './courseImportService';

type Step = 'upload' | 'preview' | 'importing' | 'done' | 'error';

export default function CourseImporter() {
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; courseId?: string; modulesInserted: number; lessonsInserted: number; sectionsInserted: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      setParseErrors(['File must be a .md or .txt markdown file']);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCourseMarkdown(text);
      setParseErrors(result.errors);
      setParseWarnings(result.warnings);
      if (result.success && result.data) {
        setCourseData(result.data);
        setStep('preview');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    if (!courseData) return;
    setStep('importing');
    setProgress({ stage: 'course', message: 'Starting import...', percent: 0 });

    const result = await importCourseToSupabase(supabase, courseData, (p) => {
      setProgress(p);
    });

    setImportResult(result);
    setStep(result.success ? 'done' : 'error');
  };

  const reset = () => {
    setStep('upload');
    setFileName('');
    setParseErrors([]);
    setParseWarnings([]);
    setCourseData(null);
    setProgress(null);
    setImportResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const stats = courseData ? getCourseStats(courseData) : null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Import Course</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Upload a structured markdown file to bulk-create a course with all modules, lessons, and sections.
        </p>
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-700 font-medium">Drop your .md file here</p>
            <p className="text-gray-400 text-sm mt-1">or click to browse</p>
            <input
              ref={fileRef}
              type="file"
              accept=".md,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {parseErrors.length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-700 mb-2">Parse errors — fix these in your file:</p>
              {parseErrors.map((e, i) => (
                <p key={i} className="text-red-600 text-sm">• {e}</p>
              ))}
            </div>
          )}

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-semibold text-gray-700 mb-2 text-sm">Expected file format:</p>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">{`# Course Title
slug: course-slug
subtitle: Optional subtitle
description: Course description
price: 79.99
is_published: false

## Module 1: Module Title
description: Module description

### Lesson 1.1: Lesson Title
content_type: text
is_preview: true
description: Lesson description

#### Section: Section Title
type: text
---
Your lesson content goes here.
Multiple paragraphs are supported.
---`}
            </pre>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && courseData && stats && (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="font-semibold text-green-700">✓ File parsed successfully: {fileName}</p>
          </div>

          {parseWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-yellow-700 mb-1">Warnings:</p>
              {parseWarnings.map((w, i) => (
                <p key={i} className="text-yellow-600 text-sm">• {w}</p>
              ))}
            </div>
          )}

          {/* Course summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="text-lg font-bold text-gray-900">{courseData.title}</h3>
            {courseData.subtitle && <p className="text-gray-500 text-sm mt-0.5">{courseData.subtitle}</p>}
            <div className="flex gap-4 mt-3">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {stats.moduleCount} modules
              </span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                {stats.lessonCount} lessons
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                {stats.sectionCount} sections
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                ${courseData.price}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                courseData.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {courseData.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">slug: {courseData.slug}</p>
          </div>

          {/* Module/lesson tree */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Course structure</p>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {courseData.modules.map((mod, mi) => (
                <div key={mi}>
                  <p className="text-sm font-semibold text-gray-800">
                    Module {mi + 1}: {mod.title}
                    <span className="text-xs font-normal text-gray-400 ml-2">
                      {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                    </span>
                  </p>
                  <div className="ml-4 mt-1 space-y-1">
                    {mod.lessons.map((lesson, li) => (
                      <div key={li} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{li + 1}.</span>
                        <span className="text-xs text-gray-600">{lesson.title}</span>
                        {lesson.is_preview && (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-1 rounded">preview</span>
                        )}
                        <span className="text-xs text-gray-400">
                          ({lesson.sections.length} section{lesson.sections.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Import Course to Database
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === 'importing' && progress && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-3xl mb-4">⚙️</div>
          <p className="font-semibold text-gray-800 mb-2">Importing course...</p>
          <p className="text-sm text-gray-500 mb-4">{progress.message}</p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{progress.percent}%</p>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && importResult && (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-lg font-bold text-green-700">Course imported successfully</p>
            {importResult.courseId && (
              <p className="text-xs text-green-600 mt-1">Course ID: {importResult.courseId}</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{importResult.modulesInserted}</p>
              <p className="text-xs text-gray-500 mt-1">Modules</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{importResult.lessonsInserted}</p>
              <p className="text-xs text-gray-500 mt-1">Lessons</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{importResult.sectionsInserted}</p>
              <p className="text-xs text-gray-500 mt-1">Sections</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center mb-4">
            Media (videos, PDFs) can now be added per-lesson through the normal admin editor.
          </p>
          <button
            onClick={reset}
            className="w-full border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Import Another Course
          </button>
        </div>
      )}

      {/* Step: Error */}
      {step === 'error' && importResult && (
        <div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
            <p className="font-bold text-red-700 mb-3">
              Import completed with errors ({importResult.modulesInserted} modules, {importResult.lessonsInserted} lessons inserted before failure)
            </p>
            {importResult.errors.map((e, i) => (
              <p key={i} className="text-red-600 text-sm">• {e}</p>
            ))}
          </div>
          <button
            onClick={reset}
            className="w-full border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
