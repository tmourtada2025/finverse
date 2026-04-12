import { useState, useRef, useEffect } from 'react'
import { supabase, Lesson } from '@/lib/supabase'

type ContentType = 'text' | 'video' | 'audio' | 'quiz' | 'pdf' | 'slides'
type QuizType = 'multiple_choice' | 'fill_blank' | 'matching'

interface QuizQuestion {
  type: QuizType
  question: string
  image_url?: string
  options?: string[]
  correct_index?: number
  correct_answer?: string
  pairs?: { left: string; right: string }[]
  explanation: string
}

// ─── Image uploader ───────────────────────────────────────────────────────────
function ImageUploader({ onInsert, t }: { onInsert: (url: string) => void; t: any }) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB.'); return }
    setUploading(true)
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const { error } = await supabase.storage.from('lesson-images').upload(filename, file, { contentType: file.type })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('lesson-images').getPublicUrl(filename)
    onInsert(publicUrl)
    setUploading(false)
    if (ref.current) ref.current.value = ''
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <button type="button" onClick={() => ref.current?.click()}
        style={{ padding: '4px 8px', fontSize: '0.75rem', border: `1px solid ${t.border}`, borderRadius: '4px', cursor: 'pointer', background: 'transparent', color: t.muted }}>
        {uploading ? '⏳' : '🖼 Image'}
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </span>
  )
}

// ─── HTML Rich Editor ─────────────────────────────────────────────────────────
function RichEditor({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [font, setFont] = useState('inherit')

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    sync()
  }

  function sync() {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [])

  function insertImage(url: string) {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%;border-radius:6px;margin:8px 0;" />`)
    sync()
  }

  const fonts = [
    { label: 'Default', value: 'inherit' },
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Mono', value: 'monospace' },
    { label: 'Sans', value: 'Arial, sans-serif' },
  ]

  const btn = (extra?: any) => ({
    padding: '4px 8px', fontSize: '0.75rem', border: `1px solid ${t.border}`,
    borderRadius: '4px', cursor: 'pointer', background: 'transparent',
    color: t.muted, minWidth: '28px', lineHeight: 1.2, ...extra,
  })

  const sep = { width: '1px', background: t.border, margin: '0 2px', alignSelf: 'stretch' as const }

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px', padding: '8px 10px', borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface, alignItems: 'center' }}>
        <button type="button" onClick={() => exec('undo')} style={btn()} title="Undo">↩</button>
        <button type="button" onClick={() => exec('redo')} style={btn()} title="Redo">↪</button>
        <span style={sep} />
        <button type="button" onClick={() => exec('bold')} style={btn()} title="Bold"><b>B</b></button>
        <button type="button" onClick={() => exec('italic')} style={btn()} title="Italic"><i>I</i></button>
        <button type="button" onClick={() => exec('underline')} style={btn()} title="Underline"><u>U</u></button>
        <button type="button" onClick={() => exec('insertHTML', '<span style="border-bottom:3px double currentColor">selected</span>')} style={btn()} title="Double underline">Ü</button>
        <button type="button" onClick={() => exec('strikeThrough')} style={btn()} title="Strikethrough"><s>S</s></button>
        <span style={sep} />
        <button type="button" onClick={() => exec('formatBlock', 'h1')} style={btn()}>H1</button>
        <button type="button" onClick={() => exec('formatBlock', 'h2')} style={btn()}>H2</button>
        <button type="button" onClick={() => exec('formatBlock', 'h3')} style={btn()}>H3</button>
        <button type="button" onClick={() => exec('formatBlock', 'p')} style={btn()}>¶</button>
        <span style={sep} />
        <button type="button" onClick={() => exec('insertUnorderedList')} style={btn()}>• List</button>
        <button type="button" onClick={() => exec('insertOrderedList')} style={btn()}>1. List</button>
        <button type="button" onClick={() => exec('formatBlock', 'blockquote')} style={btn()}>❝</button>
        <span style={sep} />
        <button type="button" onClick={() => { const url = prompt('URL:'); if (url) exec('createLink', url) }} style={btn()}>🔗</button>
        <ImageUploader onInsert={insertImage} t={t} />
        <span style={sep} />
        <select value={font} onChange={e => { setFont(e.target.value); exec('fontName', e.target.value) }}
          style={{ fontSize: '0.75rem', padding: '4px 6px', border: `1px solid ${t.border}`, borderRadius: '4px', backgroundColor: t.bg, color: t.muted, cursor: 'pointer' }}>
          {fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select onChange={e => exec('fontSize', e.target.value)} defaultValue=""
          style={{ fontSize: '0.75rem', padding: '4px 6px', border: `1px solid ${t.border}`, borderRadius: '4px', backgroundColor: t.bg, color: t.muted, cursor: 'pointer' }}>
          <option value="" disabled>Size</option>
          {['1','2','3','4','5','6','7'].map((s, i) => <option key={s} value={s}>{[8,10,12,14,18,24,36][i]}px</option>)}
        </select>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        style={{ minHeight: '280px', padding: '14px', outline: 'none', backgroundColor: t.bg, color: t.text, fontSize: '0.9rem', lineHeight: 1.7, fontFamily: font }}
      />
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
    if (!file || !file.type.startsWith('audio/')) { alert('Please select an audio file.'); return }
    if (file.size > 100 * 1024 * 1024) { alert('File must be under 100MB.'); return }
    setUploading(true); setProgress(10)
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const { error } = await supabase.storage.from('lesson-audio').upload(filename, file, { contentType: file.type })
    setProgress(90)
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); setProgress(0); return }
    const { data: { publicUrl } } = supabase.storage.from('lesson-audio').getPublicUrl(filename)
    onChange(publicUrl); setUploading(false); setProgress(100)
  }

  return (
    <div>
      {value ? (
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', padding: '1rem', backgroundColor: t.surface }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: t.muted }}>Audio uploaded</span>
            <button onClick={() => onChange('')} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <audio controls style={{ width: '100%' }}><source src={value} /></audio>
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${t.border}`, borderRadius: '8px', padding: '2rem', textAlign: 'center' as const, cursor: 'pointer' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎵</div>
          <p style={{ fontSize: '0.875rem', color: t.text, marginBottom: '4px' }}>Click to upload audio</p>
          <p style={{ fontSize: '0.75rem', color: t.muted }}>MP3, WAV, M4A — max 100MB</p>
          {uploading && <div style={{ marginTop: '12px' }}><div style={{ height: '4px', backgroundColor: t.border, borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s' }} /></div></div>}
        </div>
      )}
      <input ref={fileRef} type="file" accept="audio/*" onChange={handleFile} style={{ display: 'none' }} />
      <div style={{ marginTop: '10px' }}>
        <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Or paste audio URL</label>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
          style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }} />
      </div>
    </div>
  )
}

// ─── PDF uploader ─────────────────────────────────────────────────────────────
function PdfUploader({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'application/pdf') { alert('Please select a PDF file.'); return }
    if (file.size > 50 * 1024 * 1024) { alert('File must be under 50MB.'); return }
    setUploading(true)
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const { error } = await supabase.storage.from('lesson-pdfs').upload(filename, file, { contentType: 'application/pdf' })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('lesson-pdfs').getPublicUrl(filename)
    onChange(publicUrl); setUploading(false)
  }

  return (
    <div>
      {value ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: t.muted }}>PDF uploaded</span>
            <button onClick={() => onChange('')} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <iframe src={value} style={{ width: '100%', height: '500px', border: `1px solid ${t.border}`, borderRadius: '8px' }} />
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${t.border}`, borderRadius: '8px', padding: '2rem', textAlign: 'center' as const, cursor: 'pointer' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
          <p style={{ fontSize: '0.875rem', color: t.text, marginBottom: '4px' }}>{uploading ? 'Uploading…' : 'Click to upload PDF'}</p>
          <p style={{ fontSize: '0.75rem', color: t.muted }}>PDF only — max 50MB</p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} style={{ display: 'none' }} />
      <div style={{ marginTop: '10px' }}>
        <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Or paste PDF URL</label>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
          style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }} />
      </div>
    </div>
  )
}

// ─── Quiz Builder ─────────────────────────────────────────────────────────────
function QuizBuilder({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  let questions: QuizQuestion[] = []
  try { questions = JSON.parse(value || '[]') } catch { questions = [] }

  function update(qs: QuizQuestion[]) { onChange(JSON.stringify(qs, null, 2)) }

  function addQuestion(type: QuizType) {
    const base = { type, question: '', explanation: '', image_url: '' }
    if (type === 'multiple_choice') update([...questions, { ...base, options: ['', '', '', ''], correct_index: 0 }])
    else if (type === 'fill_blank') update([...questions, { ...base, correct_answer: '' }])
    else update([...questions, { ...base, pairs: [{ left: '', right: '' }, { left: '', right: '' }] }])
  }

  function removeQ(qi: number) { update(questions.filter((_, i) => i !== qi)) }

  function updateQ(qi: number, field: string, val: any) {
    const qs = [...questions]; qs[qi] = { ...qs[qi], [field]: val }; update(qs)
  }

  function updateOption(qi: number, oi: number, val: string) {
    const qs = [...questions]; const opts = [...(qs[qi].options || [])]; opts[oi] = val
    qs[qi] = { ...qs[qi], options: opts }; update(qs)
  }

  function updatePair(qi: number, pi: number, side: 'left' | 'right', val: string) {
    const qs = [...questions]; const pairs = [...(qs[qi].pairs || [])]; pairs[pi] = { ...pairs[pi], [side]: val }
    qs[qi] = { ...qs[qi], pairs }; update(qs)
  }

  async function uploadQImage(qi: number) {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return
      const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
      const { error } = await supabase.storage.from('lesson-images').upload(filename, file)
      if (error) { alert('Upload failed'); return }
      const { data: { publicUrl } } = supabase.storage.from('lesson-images').getPublicUrl(filename)
      updateQ(qi, 'image_url', publicUrl)
    }; input.click()
  }

  const typeColors: Record<QuizType, string> = { multiple_choice: '#3b82f6', fill_blank: '#10b981', matching: '#f59e0b' }
  const typeLabels: Record<QuizType, string> = { multiple_choice: 'Multiple choice', fill_blank: 'Fill in the blank', matching: 'Matching' }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
        {(['multiple_choice', 'fill_blank', 'matching'] as QuizType[]).map(type => (
          <button key={type} onClick={() => addQuestion(type)}
            style={{ fontSize: '0.75rem', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${typeColors[type]}50`, color: typeColors[type], background: `${typeColors[type]}10`, cursor: 'pointer' }}>
            + {typeLabels[type]}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
        {questions.map((q, qi) => (
          <div key={qi} style={{ border: `1px solid ${typeColors[q.type]}30`, borderRadius: '10px', padding: '1rem', backgroundColor: t.surface }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: `${typeColors[q.type]}15`, color: typeColors[q.type] }}>{typeLabels[q.type]}</span>
              <button onClick={() => removeQ(qi)} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
            </div>

            <textarea value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)}
              placeholder={q.type === 'fill_blank' ? 'Use ___ to mark the blank. E.g. The capital of France is ___.' : 'Enter question...'}
              rows={2} style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, marginBottom: '8px', fontFamily: 'inherit' }} />

            <div style={{ marginBottom: '10px' }}>
              {q.image_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={q.image_url} style={{ height: '60px', borderRadius: '4px', objectFit: 'cover' as const }} />
                  <button onClick={() => updateQ(qi, 'image_url', '')} style={{ fontSize: '0.7rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <button onClick={() => uploadQImage(qi)} style={{ fontSize: '0.72rem', color: t.muted, background: 'none', border: `1px dashed ${t.border}`, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' }}>+ Add image to question</button>
              )}
            </div>

            {q.type === 'multiple_choice' && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" name={`q-${qi}`} checked={q.correct_index === oi} onChange={() => updateQ(qi, 'correct_index', oi)} style={{ cursor: 'pointer', accentColor: '#10b981' }} />
                    <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`}
                      style={{ flex: 1, backgroundColor: t.bg, border: `1px solid ${q.correct_index === oi ? '#10b98150' : t.border}`, color: t.text, borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none' }} />
                  </div>
                ))}
                <button onClick={() => { const qs = [...questions]; qs[qi].options = [...(qs[qi].options || []), '']; update(qs) }}
                  style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, padding: '4px 0' }}>+ Add option</button>
              </div>
            )}

            {q.type === 'fill_blank' && (
              <div>
                <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Correct answer</label>
                <input value={q.correct_answer || ''} onChange={e => updateQ(qi, 'correct_answer', e.target.value)} placeholder="Type the correct answer..."
                  style={{ width: '100%', backgroundColor: t.bg, border: `1px solid #10b98150`, color: t.text, borderRadius: '6px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
            )}

            {q.type === 'matching' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: t.muted, textAlign: 'center' as const }}>Left</span>
                  <span style={{ fontSize: '0.7rem', color: t.muted, textAlign: 'center' as const }}>Match</span>
                </div>
                {(q.pairs || []).map((pair, pi) => (
                  <div key={pi} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                    <input value={pair.left} onChange={e => updatePair(qi, pi, 'left', e.target.value)} placeholder={`Left ${pi + 1}`}
                      style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none' }} />
                    <input value={pair.right} onChange={e => updatePair(qi, pi, 'right', e.target.value)} placeholder={`Right ${pi + 1}`}
                      style={{ backgroundColor: t.bg, border: `1px solid #f59e0b50`, color: t.text, borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none' }} />
                  </div>
                ))}
                <button onClick={() => { const qs = [...questions]; qs[qi].pairs = [...(qs[qi].pairs || []), { left: '', right: '' }]; update(qs) }}
                  style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add pair</button>
              </div>
            )}

            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Explanation</label>
              <input value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} placeholder="Why is this correct?"
                style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '2rem', textAlign: 'center' as const, color: t.muted, fontSize: '0.875rem' }}>
          Add a question type above to get started
        </div>
      )}
    </div>
  )
}

// ─── Main LessonEditor ────────────────────────────────────────────────────────
export default function LessonEditor({ lesson, t, onClose }: { lesson: Lesson; t: any; onClose: () => void }) {
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
      title, content_type: contentType,
      content_text: contentText || null,
      content_url: contentUrl || null,
      duration_minutes: durationMinutes || null,
      is_published: isPublished,
    }).eq('id', lesson.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'video', label: 'Video', icon: '🎬' },
    { id: 'audio', label: 'Audio', icon: '🎵' },
    { id: 'pdf', label: 'PDF', icon: '📄' },
    { id: 'slides', label: 'Slides', icon: '🖥️' },
    { id: 'quiz', label: 'Quiz', icon: '❓' },
  ] as const

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '92vh', overflow: 'auto', display: 'flex', flexDirection: 'column' as const }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Edit lesson</h3>
            <p style={{ fontSize: '0.75rem', color: t.muted, margin: '2px 0 0' }}>{lesson.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, padding: '4px 8px' }}>×</button>
        </div>

        <div style={{ padding: '1.5rem', overflow: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Duration (min)</label>
              <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} min={0}
                style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Content type</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {tabs.map(tab => (
                <button key={tab.id} type="button" onClick={() => setContentType(tab.id as ContentType)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${contentType === tab.id ? t.text : t.border}`, backgroundColor: contentType === tab.id ? t.text : 'transparent', color: contentType === tab.id ? t.bg : t.muted, fontSize: '0.8rem', fontWeight: contentType === tab.id ? 500 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <span>{tab.icon}</span><span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            {contentType === 'text' && <RichEditor value={contentText} onChange={setContentText} t={t} />}

            {contentType === 'video' && (
              <div>
                <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>YouTube / Vimeo embed URL</label>
                <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '8px' }} />
                <p style={{ fontSize: '0.72rem', color: t.muted, marginBottom: '12px' }}>YouTube: youtube.com/embed/VIDEO_ID · Vimeo: player.vimeo.com/video/VIDEO_ID</p>
                {contentUrl && contentUrl.includes('embed') && (
                  <div style={{ aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${t.border}`, marginBottom: '12px' }}>
                    <iframe src={contentUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                  </div>
                )}
                <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Transcript / Notes (optional)</label>
                <RichEditor value={contentText} onChange={setContentText} t={t} />
              </div>
            )}

            {contentType === 'audio' && (
              <div>
                <AudioUploader value={contentUrl} onChange={setContentUrl} t={t} />
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Transcript / Notes (optional)</label>
                  <RichEditor value={contentText} onChange={setContentText} t={t} />
                </div>
              </div>
            )}

            {contentType === 'pdf' && <PdfUploader value={contentUrl} onChange={setContentUrl} t={t} />}

            {contentType === 'slides' && (
              <div>
                <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Google Slides or Office Online embed URL</label>
                <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://docs.google.com/presentation/d/ID/embed"
                  style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '8px' }} />
                <p style={{ fontSize: '0.72rem', color: t.muted, marginBottom: '12px' }}>Google Slides: File → Share → Publish to web → Embed → copy URL</p>
                {contentUrl && <iframe src={contentUrl} style={{ width: '100%', height: '480px', border: `1px solid ${t.border}`, borderRadius: '8px' }} allowFullScreen />}
              </div>
            )}

            {contentType === 'quiz' && <QuizBuilder value={contentText} onChange={setContentText} t={t} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="lesson-published" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }} />
            <label htmlFor="lesson-published" style={{ fontSize: '0.875rem', color: t.muted, cursor: 'pointer' }}>
              Published — visible to enrolled students
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ fontSize: '0.875rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Close</button>
          <button onClick={save} disabled={saving}
            style={{ backgroundColor: saved ? '#10b981' : t.text, color: saved ? '#fff' : t.bg, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1, minWidth: '120px', transition: 'background-color 0.2s' }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save lesson'}
          </button>
        </div>
      </div>
    </div>
  )
}
