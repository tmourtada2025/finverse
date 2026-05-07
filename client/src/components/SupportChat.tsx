import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are FinVerse Support, a helpful assistant for FinVerse — an online trading education platform.

You help students with:
- FINANCIAL questions: pricing, payment methods, what's included in courses, invoices
- REFUND questions: refund policy (14-day window), how to request a refund, refund status
- TECHNICAL questions: login issues, accessing courses, account problems, browser/device issues

You do NOT answer questions about:
- Trading strategies, market analysis, or course content — direct those to the course material
- General financial advice

If you cannot resolve an issue, collect a brief description and tell the user: "I'll escalate this to our support team at support@finverse.world — they'll get back to you within 24 hours."

Keep responses concise and helpful. Be friendly but professional.

Key facts:
- Refund window: 14 days from purchase
- Students can request refunds directly from their dashboard under My Courses
- Login: finverse.world/login (Google or email/password)
- Support email: support@finverse.world`

interface SupportChatProps {
  dark?: boolean
}

export default function SupportChat({ dark = true }: SupportChatProps) {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hi! I\'m the FinVerse support assistant. I can help with billing, refunds, and technical issues. What can I help you with?'
      }])
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      })

      const data = await response.json()
      const reply = data.content?.[0]?.text || "I'm having trouble connecting. Please email support@finverse.world directly."
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please email support@finverse.world directly." }])
    }

    setLoading(false)
  }

  const bg      = dark ? '#111115' : '#ffffff'
  const border  = dark ? '#1e1e24' : '#e8e8e2'
  const text    = dark ? '#f0f0f5' : '#111118'
  const muted   = dark ? '#6b6b80' : '#888890'
  const surface = dark ? '#18181d' : '#f8f8f6'
  const accent  = '#3E5C76'

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          width: '52px', height: '52px', borderRadius: '50%',
          backgroundColor: accent, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        title="Support chat"
      >
        {open
          ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        }
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '86px', right: '24px', zIndex: 998,
          width: '360px', height: '480px',
          backgroundColor: bg, border: `1px solid ${border}`,
          borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>FV</span>
            </div>
            <div>
              <p style={{ fontSize: '0.855rem', fontWeight: 600, color: text, margin: 0 }}>FinVerse Support</p>
              <p style={{ fontSize: '0.7rem', color: muted, margin: 0 }}>Billing · Refunds · Technical</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '9px 13px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  backgroundColor: msg.role === 'user' ? accent : surface,
                  color: msg.role === 'user' ? '#fff' : text,
                  fontSize: '0.835rem', lineHeight: 1.55,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '9px 13px', borderRadius: '12px 12px 12px 2px', backgroundColor: surface }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: muted, animation: `bounce 1s ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: `1px solid ${border}`, display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask a question…"
              rows={1}
              style={{
                flex: 1, backgroundColor: surface, border: `1px solid ${border}`,
                color: text, borderRadius: '8px', padding: '8px 12px',
                fontSize: '0.835rem', outline: 'none', resize: 'none' as const,
                fontFamily: 'inherit', lineHeight: 1.5, maxHeight: '80px', overflowY: 'auto',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                backgroundColor: accent, border: 'none', borderRadius: '8px',
                padding: '8px 14px', cursor: input.trim() ? 'pointer' : 'not-allowed',
                opacity: input.trim() ? 1 : 0.4, flexShrink: 0,
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
        </div>
      )}
    </>
  )
}
