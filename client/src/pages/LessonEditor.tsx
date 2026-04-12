import { useState, useRef, useCallback } from 'react'
import { supabase, Lesson } from '@/lib/supabase'

type ContentType = 'text' | 'video' | 'audio' | 'quiz' | 'pdf' | 'slides'

interface QuizQuestion {
  question: string
  options: string[]
  correct_index: number
  explanation: string
}

interface LessonEditorProps {
  lesson: Lesson
  t: any
  onClose: () => void
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
function ToolBtn({ label, onClick, active = false, t }: { label: string; onClick: () => void; active?: boolean; t: any }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      style={{
        padding: '4px 8px', fontSize: '0.75rem', fontWeight: active ? 700 : 400,
        border: `1px solid ${active ? t.text : t.border}`,
        borderRadius: '4px', cursor: 'pointer', background: active ? t.text : 'transparent',
        color: active ? t.bg : t.muted, minWidth: '28px', lineHeight: 1.2,
      }}
    >
      {label}
    </button>
  )
}

// ─── Rich text editor ─────────────────────────────────────────────────────────
function RichEditor({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function wrap(before: string, after: string) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(newVal)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  function insertLine(prefix: string) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newVal = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(newVal)
    setTimeout(() => { el.focus(); el.setSelectionRange(start + prefix.length, start + prefix.length) }, 0)
  }

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px 10px', borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface }}>
        <ToolBtn label="B" onClick={() => wrap('**', '**')} t={t} />
        <ToolBtn label="I" onClick={() => wrap('_', '_')} t={t} />
        <ToolBtn label="H1" onClick={() => insertLine('# ')} t={t} />
        <ToolBtn label="H2" onClick={() => insertLine('## ')} t={t} />
        <ToolBtn label="H3" onClick={() => insertLine('### ')} t={t} />
        <span style={{ width: '1px', backgroundColor: t.border, margin: '0 4px' }} />
        <ToolBtn label="• List" onClick={() => insertLine('- ')} t={t} />
        <ToolBtn label="1. List" onClick={() => insertLine('1. ')} t={t} />
        <ToolBtn label="Quote" onClick={() => insertLine('> ')} t={t} />
        <span style={{ width: '1px', backgroundColor: t.border, margin: '0 4px' }} />
        <ToolBtn label="Link" onClick={() => wrap('[', '](url)')} t={t} />
        <ToolBtn label="---" onClick={() => { const el = ref.current; if (!el) return; const pos = el.selectionStart; onChange(value.slice(0, pos) + '\n\n---\n\n' + value.slice(pos)) }} t={t} />
      </div>
      {/* Editor */}
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={14}
        placeholder="Write your lesson content here...&#10;&#10;# Heading&#10;&#10;Paragraph text. **Bold** and _italic_ supported.&#10;&#10;- List item&#10;- Another item"
        style={{
          width: '100%', backgroundColor: t.bg, border: 'none', color: t.text,
          padding: '14px', fontSize: '0.875rem', outline: 'none', resize: 'vertical',
          boxSizing: 'border-box', fontFamily: 'monospace', lineHeight: 1.7, minHeight: '280px',
        }}
      />
    </div>
  )
}

// ─── Quiz builder ─────────────────────────────────────────────────────────────
function QuizBuilder({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  let questions: QuizQuestion[] = []
  try { questions = JSON.parse(value || '[]') } catch { questions = [] }

  function update(qs: QuizQuestion[]) {
    onChange(JSON.stringify(qs, null, 2))
  }

  function addQuestion() {
    update([...questions, { question: '', options: ['', '', '', ''], correct_index: 0, explanation: '' }])
  }

  function removeQuestion(qi: number) {
    update(questions.filter((_, i) => i !== qi))
  }

  function updateQuestion(qi: number, field: keyof QuizQuestion, val: any) {
    const qs = [...questions]
    qs[qi] = { ...qs[qi], [field]: val }
    update(qs)
  }

  function updateOption(qi: number, oi: number, val: string) {
    const qs = [...questions]
    const opts = [...qs[qi].options]
    opts[oi] = val
    qs[qi] = { ...qs[qi], options: opts }
    update(qs)
  }

  function addOption(qi: number) {
    const qs = [...questions]
    qs[qi] = { ...qs[qi], options: [...qs[qi].options, ''] }
    update(qs)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {questions.map((q, qi) => (
        <div key={qi} style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1rem', backgroundColor: t.surface }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Question {qi + 1}</span>
            <button onClick={() => removeQuestion(qi)} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>

          <textarea
            value={q.question}
            onChange={e => updateQuestion(qi, 'question', e.target.value)}
            placeholder="Enter question..."
            rows={2}
            style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {q.options.map((opt, oi) => (
              <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correct_index === oi}
                  onChange={() => updateQuestion(qi, 'correct_index', oi)}
                  style={{ cursor: 'pointer', accentColor: '#10b981' }}
                />
                <input
                  value={opt}
                  onChange={e => updateOption(qi, oi, e.target.value)}
                  placeholder={`Option ${oi + 1}`}
                  style={{ flex: 1, backgroundColor: t.bg, border: `1px solid ${q.correct_index === oi ? '#10b98150' : t.border}`, color: t.text, borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none' }}
                />
              </div>
            ))}
            <button onClick={() => addOption(qi)} style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0' }}>+ Add option</button>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Explanation (shown after answering)</label>
            <input
              value={q.explanation}
              onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
              placeholder="Why is this the correct answer?"
              style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addQuestion}
        style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '12px', fontSize: '0.8rem', color: t.muted, background: 'none', cursor: 'pointer', width: '100%' }}
      >
        + Add question
      </button>
    </div>
  )
}

// ─── Audio uploader ───────────────────────────────────────────────────────────
function AudioUploader({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/')) { alert('Please select an audio file.'); return }
    if (file.size > 100 * 1024 * 1024) { alert('File must be under 100MB.'); return }

    setUploading(true)
    setProgress(10)

    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const { data, error } = await supabase.storage
      .from('lesson-audio')
      .upload(filename, file, { contentType: file.type, upsert: false })

    setProgress(90)

    if (error) {
      alert('Upload failed: ' + error.message)
      setUploading(false)
      setProgress(0)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('lesson-audio').getPublicUrl(filename)
    onChange(publicUrl)
    setUploading(false)
    setProgress(100)
  }

  return (
    <div>
      {value ? (
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', padding: '1rem', backgroundColor: t.surface }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: t.muted }}>Audio uploaded</span>
            <button onClick={() => onChange('')} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <audio controls style={{ width: '100%' }}>
            <source src={value} />
          </audio>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${t.border}`, borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎵</div>
          <p style={{ fontSize: '0.875rem', color: t.text, marginBottom: '4px' }}>Click to upload audio</p>
          <p style={{ fontSize: '0.75rem', color: t.muted }}>MP3, WAV, M4A — max 100MB</p>
          {uploading && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ height: '4px', backgroundColor: t.border, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: t.muted, marginTop: '6px' }}>Uploading…</p>
            </div>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="audio/*" onChange={handleFile} style={{ display: 'none' }} />

      {/* Also allow URL */}
      <div style={{ marginTop: '10px' }}>
        <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Or paste audio URL</label>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  )
}

// ─── PDF uploader ─────────────────────────────────────────────────────────────
function PdfUploader({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { alert('Please select a PDF file.'); return }
    if (file.size > 50 * 1024 * 1024) { alert('File must be under 50MB.'); return }

    setUploading(true); setProgress(10)
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const { error } = await supabase.storage.from('lesson-pdfs').upload(filename, file, { contentType: 'application/pdf', upsert: false })
    setProgress(90)
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); setProgress(0); return }
    const { data: { publicUrl } } = supabase.storage.from('lesson-pdfs').getPublicUrl(filename)
    onChange(publicUrl); setUploading(false); setProgress(100)
  }

  return (
    <div>
      {value ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: t.muted }}>PDF uploaded</span>
            <button onClick={() => onChange('')} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <iframe src={value} style={{ width: '100%', height: '500px', border: `1px solid ${t.border}`, borderRadius: '8px' }} />
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${t.border}`, borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
          <p style={{ fontSize: '0.875rem', color: t.text, marginBottom: '4px' }}>Click to upload PDF</p>
          <p style={{ fontSize: '0.75rem', color: t.muted }}>PDF only — max 50MB</p>
          {uploading && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ height: '4px', backgroundColor: t.border, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: t.muted, marginTop: '6px' }}>Uploading…</p>
            </div>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} style={{ display: 'none' }} />
      <div style={{ marginTop: '10px' }}>
        <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Or paste PDF URL</label>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://..." style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }} />
      </div>
    </div>
  )
}


// ─── Main LessonEditor ────────────────────────────────────────────────────────
export default function LessonEditor({ lesson, t, onClose }: LessonEditorProps) {
  const [title, setTitle] = useState(lesson.title)
  const [contentType, setContentType] = useState<ContentType>(lesson.content_type as ContentType)
  const [contentText, setContentText] = useState(lesson.content_text || '')
  const [contentUrl, setContentUrl] = useState(lesson.content_url || '')
  const [durationMinutes, setDurationMinutes] = useState(lesson.duration_minutes || 0)
  const [isPublished, setIsPublished] = useState(lesson.is_published)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from('lessons').update({
      title,
      content_type: contentType,
      content_text: contentText || null,
      content_url: contentUrl || null,
      duration_minutes: durationMinutes || null,
      is_published: isPublished,
    }).eq('id', lesson.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs: { id: ContentType; label: string; icon: string }[] = [
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'video', label: 'Video', icon: '🎬' },
    { id: 'audio', label: 'Audio', icon: '🎵' },
    { id: 'pdf', label: 'PDF', icon: '📄' },
    { id: 'slides', label: 'Slides', icon: '🖥️' },
    { id: 'quiz', label: 'Quiz', icon: '❓' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: '16px', width: '100%', maxWidth: '860px', maxHeight: '92vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Edit lesson</h3>
            <p style={{ fontSize: '0.75rem', color: t.muted, margin: '2px 0 0' }}>{lesson.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, padding: '4px 8px' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflow: 'auto', flex: 1 }}>

          {/* Title + Duration row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Duration (min)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                min={0}
                style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Content type tabs */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Content type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setContentType(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '8px', border: `1px solid ${contentType === tab.id ? t.text : t.border}`,
                    backgroundColor: contentType === tab.id ? t.text : 'transparent',
                    color: contentType === tab.id ? t.bg : t.muted,
                    fontSize: '0.8rem', fontWeight: contentType === tab.id ? 500 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content area by type */}
          <div style={{ marginBottom: '1.25rem' }}>
            {contentType === 'text' && (
              <RichEditor value={contentText} onChange={setContentText} t={t} />
            )}

            {contentType === 'video' && (
              <div>
                <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>YouTube / Vimeo embed URL</label>
                <input
                  value={contentUrl}
                  onChange={e => setContentUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
                />
                <p style={{ fontSize: '0.72rem', color: t.muted, lineHeight: 1.5 }}>
                  YouTube: use <code style={{ backgroundColor: t.surface, padding: '1px 5px', borderRadius: '3px' }}>youtube.com/embed/VIDEO_ID</code> · 
                  Vimeo: use <code style={{ backgroundColor: t.surface, padding: '1px 5px', borderRadius: '3px' }}>player.vimeo.com/video/VIDEO_ID</code>
                </p>
                {contentUrl && contentUrl.includes('embed') && (
                  <div style={{ marginTop: '12px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${t.border}` }}>
                    <iframe src={contentUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                  </div>
                )}
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Transcript / Notes (optional)</label>
                  <textarea
                    value={contentText}
                    onChange={e => setContentText(e.target.value)}
                    rows={4}
                    placeholder="Optional transcript or lesson notes..."
                    style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            )}

            {contentType === 'audio' && (
              <div>
                <AudioUploader value={contentUrl} onChange={setContentUrl} t={t} />
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Transcript / Notes (optional)</label>
                  <textarea
                    value={contentText}
                    onChange={e => setContentText(e.target.value)}
                    rows={4}
                    placeholder="Optional transcript or lesson notes..."
                    style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            )}

            {contentType === 'pdf' && (
              <PdfUploader value={contentUrl} onChange={setContentUrl} t={t} />
            )}

            {contentType === 'slides' && (
              <div>
                <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Google Slides or Office Online embed URL</label>
                <input
                  value={contentUrl}
                  onChange={e => setContentUrl(e.target.value)}
                  placeholder="https://docs.google.com/presentation/d/ID/embed or https://onedrive.live.com/embed?..."
                  style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '8px' }}
                />
                <p style={{ fontSize: '0.72rem', color: t.muted, lineHeight: 1.5, marginBottom: '12px' }}>
                  Google Slides: File → Share → Publish to web → Embed → copy URL · Office: Share → Embed → copy iframe src
                </p>
                {contentUrl && (
                  <iframe src={contentUrl} style={{ width: '100%', height: '480px', border: `1px solid ${t.border}`, borderRadius: '8px' }} allowFullScreen />
                )}
              </div>
            )}

            {contentType === 'quiz' && (
              <QuizBuilder value={contentText} onChange={setContentText} t={t} />
            )}
          </div>

          {/* Published toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="lesson-published"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }}
            />
            <label htmlFor="lesson-published" style={{ fontSize: '0.875rem', color: t.muted, cursor: 'pointer' }}>
              Published — visible to enrolled students
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ fontSize: '0.875rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>
            Close
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{ backgroundColor: saved ? '#10b981' : t.text, color: saved ? '#fff' : t.bg, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1, minWidth: '120px', transition: 'background-color 0.2s' }}
          >
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save lesson'}
          </button>
        </div>
      </div>
    </div>
  )
}
