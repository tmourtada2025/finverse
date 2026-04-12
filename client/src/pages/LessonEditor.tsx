import { useState, useRef, useEffect } from 'react'
import { supabase, Lesson, Section } from '@/lib/supabase'

type ContentType = 'text' | 'video' | 'audio' | 'quiz' | 'pdf' | 'slides' | 'excel'
type QuizType = 'multiple_choice' | 'fill_blank' | 'matching'
type Direction = 'ltr' | 'rtl'

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

// ─── Google Fonts loader ──────────────────────────────────────────────────────
function loadArabicFont() {
  if (document.getElementById('arabic-font')) return
  const link = document.createElement('link')
  link.id = 'arabic-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap'
  document.head.appendChild(link)
}

// ─── Image uploader ───────────────────────────────────────────────────────────
function ImageUploader({ onInsert, t }: { onInsert: (url: string) => void; t: any }) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) { alert('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB.'); return }
    setUploading(true)
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const { error } = await supabase.storage.from('lesson-images').upload(filename, file, { contentType: file.type })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('lesson-images').getPublicUrl(filename)
    onInsert(publicUrl); setUploading(false)
    if (ref.current) ref.current.value = ''
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <button type="button" onClick={() => ref.current?.click()}
        style={{ padding: '4px 8px', fontSize: '0.75rem', border: `1px solid ${t.border}`, borderRadius: '4px', cursor: 'pointer', background: 'transparent', color: t.muted }}>
        {uploading ? '⏳' : '🖼'}
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </span>
  )
}

// ─── Rich HTML Editor ─────────────────────────────────────────────────────────
function RichEditor({ value, onChange, t, direction = 'ltr' }: {
  value: string; onChange: (v: string) => void; t: any; direction?: Direction
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [font, setFont] = useState('inherit')
  const [dir, setDir] = useState<Direction>(direction)

  useEffect(() => { loadArabicFont() }, [])

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [])

  useEffect(() => {
    if (editorRef.current) editorRef.current.dir = dir
  }, [dir])

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    sync()
  }

  function sync() {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

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
    { label: 'Cairo (AR)', value: 'Cairo, sans-serif' },
    { label: 'Amiri (AR)', value: 'Amiri, serif' },
  ]

  const btn = (extra?: any) => ({
    padding: '4px 8px', fontSize: '0.75rem', border: `1px solid ${t.border}`,
    borderRadius: '4px', cursor: 'pointer', background: 'transparent',
    color: t.muted, minWidth: '28px', lineHeight: 1.2, ...extra,
  })
  const sep = { width: '1px', background: t.border, margin: '0 2px', alignSelf: 'stretch' as const }

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px', padding: '8px 10px', borderBottom: `1px solid ${t.border}`, backgroundColor: t.surface, alignItems: 'center' }}>
        <button type="button" onClick={() => exec('undo')} style={btn()} title="Undo">↩</button>
        <button type="button" onClick={() => exec('redo')} style={btn()} title="Redo">↪</button>
        <span style={sep} />
        <button type="button" onClick={() => exec('bold')} style={btn()}><b>B</b></button>
        <button type="button" onClick={() => exec('italic')} style={btn()}><i>I</i></button>
        <button type="button" onClick={() => exec('underline')} style={btn()}><u>U</u></button>
        <button type="button" onClick={() => exec('insertHTML', '<span style="border-bottom:3px double currentColor">text</span>')} style={btn()} title="Double underline">Ü</button>
        <button type="button" onClick={() => exec('strikeThrough')} style={btn()}><s>S</s></button>
        <span style={sep} />
        <button type="button" onClick={() => exec('formatBlock', 'h1')} style={btn()}>H1</button>
        <button type="button" onClick={() => exec('formatBlock', 'h2')} style={btn()}>H2</button>
        <button type="button" onClick={() => exec('formatBlock', 'h3')} style={btn()}>H3</button>
        <button type="button" onClick={() => exec('formatBlock', 'p')} style={btn()}>¶</button>
        <span style={sep} />
        <button type="button" onClick={() => exec('justifyLeft')} style={btn()} title="Align left">⬅</button>
        <button type="button" onClick={() => exec('justifyCenter')} style={btn()} title="Align center">☰</button>
        <button type="button" onClick={() => exec('justifyRight')} style={btn()} title="Align right">➡</button>
        <button type="button" onClick={() => exec('justifyFull')} style={btn()} title="Justify">≡</button>
        <span style={sep} />
        <button type="button" onClick={() => exec('insertUnorderedList')} style={btn()}>• List</button>
        <button type="button" onClick={() => exec('insertOrderedList')} style={btn()}>1. List</button>
        <button type="button" onClick={() => exec('formatBlock', 'blockquote')} style={btn()}>❝</button>
        <span style={sep} />
        <button type="button" onClick={() => { const url = prompt('URL:'); if (url) exec('createLink', url) }} style={btn()}>🔗</button>
        <ImageUploader onInsert={insertImage} t={t} />
        <span style={sep} />
        {/* RTL/LTR toggle */}
        <button type="button" onClick={() => setDir(d => d === 'ltr' ? 'rtl' : 'ltr')}
          style={btn({ backgroundColor: dir === 'rtl' ? '#f59e0b20' : 'transparent', color: dir === 'rtl' ? '#f59e0b' : t.muted, border: `1px solid ${dir === 'rtl' ? '#f59e0b50' : t.border}` })}
          title="Toggle RTL/LTR">
          {dir === 'rtl' ? 'RTL' : 'LTR'}
        </button>
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
        dir={dir}
        style={{ minHeight: '220px', padding: '14px', outline: 'none', backgroundColor: t.bg, color: t.text, fontSize: '0.9rem', lineHeight: 1.7, fontFamily: font, direction: dir }}
      />
    </div>
  )
}

// ─── File uploaders ───────────────────────────────────────────────────────────
function FileUploader({ bucket, accept, icon, label, maxMB, value, onChange, t }: {
  bucket: string; accept: string; icon: string; label: string; maxMB: number
  value: string; onChange: (v: string) => void; t: any
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > maxMB * 1024 * 1024) { alert(`File must be under ${maxMB}MB.`); return }
    setUploading(true); setProgress(20)
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
    const { error } = await supabase.storage.from(bucket).upload(filename, file, { contentType: file.type })
    setProgress(90)
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); setProgress(0); return }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename)
    onChange(publicUrl); setUploading(false); setProgress(100)
  }

  return (
    <div>
      {value ? (
        <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.surface }}>
          <span style={{ fontSize: '0.8rem', color: t.muted }}>{icon} File uploaded</span>
          <button onClick={() => onChange('')} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${t.border}`, borderRadius: '8px', padding: '1.5rem', textAlign: 'center' as const, cursor: 'pointer' }}>
          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{icon}</div>
          <p style={{ fontSize: '0.875rem', color: t.text, marginBottom: '4px' }}>{uploading ? `Uploading… ${progress}%` : `Click to upload ${label}`}</p>
          <p style={{ fontSize: '0.75rem', color: t.muted }}>Max {maxMB}MB</p>
          {uploading && <div style={{ marginTop: '10px', height: '4px', backgroundColor: t.border, borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s' }} /></div>}
        </div>
      )}
      <input ref={fileRef} type="file" accept={accept} onChange={handleFile} style={{ display: 'none' }} />
      <div style={{ marginTop: '8px' }}>
        <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '4px' }}>Or paste URL</label>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
          style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }} />
      </div>
    </div>
  )
}

// ─── Quiz Builder ─────────────────────────────────────────────────────────────
function QuizBuilder({ value, onChange, t }: { value: string; onChange: (v: string) => void; t: any }) {
  let questions: QuizQuestion[] = []
  try { questions = JSON.parse(value || '[]') } catch { questions = [] }

  function update(qs: QuizQuestion[]) { onChange(JSON.stringify(qs, null, 2)) }

  function addQ(type: QuizType) {
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
      const filename = `${Date.now()}-q-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
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
          <button key={type} onClick={() => addQ(type)}
            style={{ fontSize: '0.75rem', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${typeColors[type]}50`, color: typeColors[type], background: `${typeColors[type]}10`, cursor: 'pointer' }}>
            + {typeLabels[type]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
        {questions.map((q, qi) => (
          <div key={qi} style={{ border: `1px solid ${typeColors[q.type]}30`, borderRadius: '10px', padding: '1rem', backgroundColor: t.surface }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: `${typeColors[q.type]}15`, color: typeColors[q.type] }}>{typeLabels[q.type]}</span>
              <button onClick={() => removeQ(qi)} style={{ fontSize: '0.75rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
            </div>
            <textarea value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)}
              placeholder={q.type === 'fill_blank' ? 'Use ___ to mark the blank. E.g. The capital of France is ___.' : 'Enter question...'}
              rows={2} style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, marginBottom: '8px', fontFamily: 'inherit' }} />
            <div style={{ marginBottom: '8px' }}>
              {q.image_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={q.image_url} style={{ height: '56px', borderRadius: '4px', objectFit: 'cover' as const }} />
                  <button onClick={() => updateQ(qi, 'image_url', '')} style={{ fontSize: '0.7rem', color: '#ef444470', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <button onClick={() => uploadQImage(qi)} style={{ fontSize: '0.72rem', color: t.muted, background: 'none', border: `1px dashed ${t.border}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>+ Image</button>
              )}
            </div>
            {q.type === 'multiple_choice' && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '5px' }}>
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" name={`q-${qi}`} checked={q.correct_index === oi} onChange={() => updateQ(qi, 'correct_index', oi)} style={{ cursor: 'pointer', accentColor: '#10b981' }} />
                    <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`}
                      style={{ flex: 1, backgroundColor: t.bg, border: `1px solid ${q.correct_index === oi ? '#10b98150' : t.border}`, color: t.text, borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }} />
                  </div>
                ))}
                <button onClick={() => { const qs = [...questions]; qs[qi].options = [...(qs[qi].options || []), '']; update(qs) }}
                  style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, padding: '3px 0' }}>+ Add option</button>
              </div>
            )}
            {q.type === 'fill_blank' && (
              <input value={q.correct_answer || ''} onChange={e => updateQ(qi, 'correct_answer', e.target.value)} placeholder="Correct answer..."
                style={{ width: '100%', backgroundColor: t.bg, border: `1px solid #10b98150`, color: t.text, borderRadius: '6px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
            )}
            {q.type === 'matching' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: t.muted, textAlign: 'center' as const }}>Left</span>
                  <span style={{ fontSize: '0.7rem', color: t.muted, textAlign: 'center' as const }}>Match</span>
                </div>
                {(q.pairs || []).map((pair, pi) => (
                  <div key={pi} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '5px' }}>
                    <input value={pair.left} onChange={e => updatePair(qi, pi, 'left', e.target.value)} placeholder={`Left ${pi + 1}`}
                      style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }} />
                    <input value={pair.right} onChange={e => updatePair(qi, pi, 'right', e.target.value)} placeholder={`Right ${pi + 1}`}
                      style={{ backgroundColor: t.bg, border: `1px solid #f59e0b50`, color: t.text, borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }} />
                  </div>
                ))}
                <button onClick={() => { const qs = [...questions]; qs[qi].pairs = [...(qs[qi].pairs || []), { left: '', right: '' }]; update(qs) }}
                  style={{ fontSize: '0.75rem', color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add pair</button>
              </div>
            )}
            <div style={{ marginTop: '8px' }}>
              <input value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} placeholder="Explanation (shown after answering)..."
                style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '2rem', textAlign: 'center' as const, color: t.muted, fontSize: '0.875rem' }}>
            Add a question type above to get started
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section Editor ───────────────────────────────────────────────────────────
function SectionEditor({ section, t, onSave, onDelete }: {
  section: Section; t: any; onSave: (s: Partial<Section>) => void; onDelete: () => void
}) {
  const [title, setTitle] = useState(section.title)
  const [contentType, setContentType] = useState<ContentType>(section.content_type as ContentType)
  const [contentText, setContentText] = useState(section.content_text || '')
  const [contentUrl, setContentUrl] = useState(section.content_url || '')
  const [expanded, setExpanded] = useState(!section.id || section.id === 'new')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await onSave({ title, content_type: contentType, content_text: contentText || null, content_url: contentUrl || null })
    setSaving(false)
  }

  const tabs = [
    { id: 'text', icon: '📝' }, { id: 'video', icon: '🎬' }, { id: 'audio', icon: '🎵' },
    { id: 'pdf', icon: '📄' }, { id: 'slides', icon: '🖥️' }, { id: 'excel', icon: '📊' }, { id: 'quiz', icon: '❓' },
  ] as const

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: t.surface, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: t.dim }}>{expanded ? '▼' : '▶'}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: title ? t.text : t.dim }}>{title || 'Untitled section'}</span>
          <span style={{ fontSize: '0.65rem', border: `1px solid ${t.border}`, borderRadius: '4px', padding: '1px 6px', color: t.dim }}>{contentType}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); if (confirm('Delete this section?')) onDelete() }}
          style={{ fontSize: '0.75rem', color: '#ef444460', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
      </div>

      {expanded && (
        <div style={{ padding: '1rem', backgroundColor: t.bg }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Section title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Section title..."
              style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          {/* Content type selector */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '12px' }}>
            {tabs.map(tab => (
              <button key={tab.id} type="button" onClick={() => setContentType(tab.id as ContentType)}
                style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid ${contentType === tab.id ? t.text : t.border}`, backgroundColor: contentType === tab.id ? t.text : 'transparent', color: contentType === tab.id ? t.bg : t.muted, fontSize: '0.75rem', cursor: 'pointer' }}>
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>

          {/* Content */}
          {contentType === 'text' && <RichEditor value={contentText} onChange={setContentText} t={t} />}

          {contentType === 'video' && (
            <div>
              <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://www.youtube.com/embed/VIDEO_ID"
                style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '8px' }} />
              {contentUrl && contentUrl.includes('embed') && (
                <div style={{ aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${t.border}` }}>
                  <iframe src={contentUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                </div>
              )}
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.7rem', color: t.muted, display: 'block', marginBottom: '5px' }}>Transcript (optional)</label>
                <RichEditor value={contentText} onChange={setContentText} t={t} />
              </div>
            </div>
          )}

          {contentType === 'audio' && (
            <FileUploader bucket="lesson-audio" accept="audio/*" icon="🎵" label="audio" maxMB={100} value={contentUrl} onChange={setContentUrl} t={t} />
          )}

          {contentType === 'pdf' && (
            <div>
              <FileUploader bucket="lesson-pdfs" accept="application/pdf" icon="📄" label="PDF" maxMB={50} value={contentUrl} onChange={setContentUrl} t={t} />
              {contentUrl && <iframe src={contentUrl} style={{ width: '100%', height: '400px', border: `1px solid ${t.border}`, borderRadius: '8px', marginTop: '10px' }} />}
            </div>
          )}

          {contentType === 'slides' && (
            <div>
              <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://docs.google.com/presentation/d/ID/embed"
                style={{ width: '100%', backgroundColor: t.surface, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '8px' }} />
              {contentUrl && <iframe src={contentUrl} style={{ width: '100%', height: '400px', border: `1px solid ${t.border}`, borderRadius: '8px' }} allowFullScreen />}
            </div>
          )}

          {contentType === 'excel' && (
            <div>
              <FileUploader bucket="lesson-excel" accept=".xlsx,.xls,.csv" icon="📊" label="Excel file" maxMB={20} value={contentUrl} onChange={setContentUrl} t={t} />
              {contentUrl && contentUrl.startsWith('http') && !contentUrl.includes('supabase') && (
                <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(contentUrl)}`}
                  style={{ width: '100%', height: '400px', border: `1px solid ${t.border}`, borderRadius: '8px', marginTop: '10px' }} />
              )}
              <p style={{ fontSize: '0.7rem', color: t.muted, marginTop: '6px' }}>
                Tip: For inline preview, upload to OneDrive and paste the embed URL. Or paste a Google Sheets embed URL.
              </p>
            </div>
          )}

          {contentType === 'quiz' && <QuizBuilder value={contentText} onChange={setContentText} t={t} />}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={save} disabled={saving}
              style={{ backgroundColor: t.text, color: t.bg, border: 'none', borderRadius: '7px', padding: '8px 20px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save section'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main LessonEditor ────────────────────────────────────────────────────────
export default function LessonEditor({ lesson, t, onClose }: { lesson: Lesson; t: any; onClose: () => void }) {
  const [title, setTitle] = useState(lesson.title)
  const [durationMinutes, setDurationMinutes] = useState(lesson.duration_minutes || 0)
  const [isPublished, setIsPublished] = useState(lesson.is_published)
  const [sections, setSections] = useState<Section[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingSections, setLoadingSections] = useState(true)

  useEffect(() => { fetchSections() }, [lesson.id])

  async function fetchSections() {
    if (!lesson.id) { setLoadingSections(false); return }
    const { data } = await supabase.from('sections').select('*').eq('lesson_id', lesson.id).order('position')
    setSections(data || [])
    setLoadingSections(false)
  }

  async function saveLesson() {
    setSaving(true)
    await supabase.from('lessons').update({ title, duration_minutes: durationMinutes || null, is_published: isPublished }).eq('id', lesson.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function addSection() {
    if (!lesson.id) { alert('Save the lesson first.'); return }
    const { data } = await supabase.from('sections').insert({
      lesson_id: lesson.id, title: 'New section', content_type: 'text',
      position: sections.length + 1,
    }).select().single()
    if (data) setSections(s => [...s, data])
  }

  async function saveSection(sectionId: string, updates: Partial<Section>) {
    await supabase.from('sections').update(updates).eq('id', sectionId)
    setSections(s => s.map(sec => sec.id === sectionId ? { ...sec, ...updates } : sec))
  }

  async function deleteSection(sectionId: string) {
    await supabase.from('sections').delete().eq('id', sectionId)
    setSections(s => s.filter(sec => sec.id !== sectionId))
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: '16px', width: '100%', maxWidth: '920px', maxHeight: '92vh', overflow: 'auto', display: 'flex', flexDirection: 'column' as const }}>

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

          {/* Lesson meta */}
          <div style={{ border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1rem', backgroundColor: t.surface, marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Lesson title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: t.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Duration (min)</label>
                <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} min={0}
                  style={{ width: '100%', backgroundColor: t.bg, border: `1px solid ${t.border}`, color: t.text, borderRadius: '7px', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="published" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#10b981' }} />
                <label htmlFor="published" style={{ fontSize: '0.8rem', color: t.muted, cursor: 'pointer' }}>Published</label>
              </div>
              <button onClick={saveLesson} disabled={saving}
                style={{ backgroundColor: saved ? '#10b981' : t.text, color: saved ? '#fff' : t.bg, border: 'none', borderRadius: '7px', padding: '7px 18px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1, transition: 'background-color 0.2s' }}>
                {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save lesson'}
              </button>
            </div>
          </div>

          {/* Sections */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: t.muted, margin: 0 }}>
                Sections ({sections.length})
              </h4>
              <button onClick={addSection}
                style={{ fontSize: '0.75rem', color: t.muted, border: `1px solid ${t.border}`, background: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer' }}>
                + Add section
              </button>
            </div>

            {loadingSections ? (
              <p style={{ color: t.muted, fontSize: '0.875rem' }}>Loading sections…</p>
            ) : sections.length === 0 ? (
              <div style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '2rem', textAlign: 'center' as const, color: t.muted, fontSize: '0.875rem' }}>
                No sections yet. Click "+ Add section" to add content to this lesson.
              </div>
            ) : (
              sections.map(section => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  t={t}
                  onSave={updates => saveSection(section.id, updates)}
                  onDelete={() => deleteSection(section.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ fontSize: '0.875rem', color: t.muted, background: 'none', border: `1px solid ${t.border}`, borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  )
}
