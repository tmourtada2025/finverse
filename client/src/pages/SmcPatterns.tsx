import { useState } from 'react'

// ══════════════════════════════════════════════════════════════════════════════
// /smc-patterns — Lead magnet landing page
// Single-purpose page: captures email, triggers Supabase Edge Function which
// generates signed PDF URL and emails it via Resend.
// ══════════════════════════════════════════════════════════════════════════════

const ENDPOINT = 'https://qnhjdwfxdocnutulwmas.supabase.co/functions/v1/lead-magnet-signup'
const MAGNET_SLUG = 'smc-patterns'

// FinVerse dark palette — matches main site
const C = {
  bg:        '#0d0d0f',
  surface:   '#18181d',
  border:    '#1e1e24',
  text:      '#f0f0f5',
  muted:     '#9EA7B3',
  dim:       '#6b6b80',
  accent:    '#3E5C76',   // slate blue — the brand accent
  accentLt:  '#5a7a96',
  cream:     '#F4F4F2',   // PDF accent color — used sparingly
  amber:     '#f59e0b',
  green:     '#10b981',
  red:       '#ef4444',
}

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error', message: string }

export default function SmcPatterns() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state.kind === 'submitting') return

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState({ kind: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setState({ kind: 'submitting' })

    try {
      const res = await fetch(ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trimmed, lead_magnet_slug: MAGNET_SLUG }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok || res.status === 202) {
        setState({ kind: 'success' })
        return
      }
      setState({ kind: 'error', message: data?.error || 'Something went wrong. Please try again.' })
    } catch {
      setState({ kind: 'error', message: 'Network error. Please try again.' })
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: C.bg,
      color: C.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; }
        ::selection { background-color: ${C.accent}; color: ${C.cream}; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fv-page { animation: fadeIn 0.5s ease-out; }
      `}</style>

      {/* ─── Top bar — minimal, just brand ──────────────────────────────── */}
      <header style={{
        padding: '24px 32px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <a href="https://finverse.world" style={{
          textDecoration: 'none',
          fontSize: '1.05rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: C.text,
        }}>
          Fin<span style={{ fontWeight: 300 }}>Verse</span>
        </a>
      </header>

      {/* ─── Main content ─────────────────────────────────────────────── */}
      <main className="fv-page" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{
          maxWidth: '640px',
          width: '100%',
        }}>

          {/* Category label */}
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.accentLt,
            fontWeight: 600,
            marginBottom: '20px',
          }}>
            Free Guide · Smart Money Concepts
          </p>

          {/* Headline — serif, large, tight */}
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: C.text,
            marginBottom: '20px',
          }}>
            5 Smart Money Patterns Most Retail Traders Never See
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: C.muted,
            marginBottom: '36px',
            maxWidth: '560px',
          }}>
            A field guide to institutional behaviour for traders who are tired of being the liquidity.
          </p>

          {/* What you get — minimal bullets */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: C.dim,
              fontWeight: 600,
              marginBottom: '14px',
            }}>
              What's inside
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'The liquidity sweep — how institutions hunt your stops before reversing',
                'Order block retest — the structural zones where price reacts',
                'Fair value gaps — the imbalance that becomes a magnet',
                'BOS vs CHoCH — the distinction that costs most traders money',
                'The inducement — the most deliberate trap in the SMC playbook',
              ].map((item, i) => (
                <li key={i} style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: C.text,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{
                    color: C.accentLt,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '4px',
                    width: '18px',
                  }}>0{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Form / success state ────────────────────────────────── */}
          {state.kind === 'success' ? (
            <SuccessState />
          ) : (
            <form onSubmit={submit} style={{
              borderTop: `1px solid ${C.border}`,
              paddingTop: '32px',
            }}>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: C.dim,
                fontWeight: 600,
                marginBottom: '10px',
              }}>
                Email
              </label>

              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (state.kind === 'error') setState({ kind: 'idle' }) }}
                  disabled={state.kind === 'submitting'}
                  style={{
                    flex: '1 1 280px',
                    backgroundColor: C.surface,
                    border: `1px solid ${state.kind === 'error' ? C.red : C.border}`,
                    color: C.text,
                    borderRadius: '8px',
                    padding: '13px 16px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = C.accent)}
                  onBlur={e => (e.target.style.borderColor = state.kind === 'error' ? C.red : C.border)}
                />
                <button
                  type="submit"
                  disabled={state.kind === 'submitting' || !email.trim()}
                  style={{
                    backgroundColor: C.accent,
                    color: C.cream,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '13px 24px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: state.kind === 'submitting' || !email.trim() ? 'not-allowed' : 'pointer',
                    opacity: state.kind === 'submitting' || !email.trim() ? 0.6 : 1,
                    transition: 'background-color 0.15s, opacity 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: '46px',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (state.kind !== 'submitting' && email.trim()) (e.currentTarget as HTMLElement).style.backgroundColor = C.accentLt }}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = C.accent}
                >
                  {state.kind === 'submitting' ? (
                    <>
                      <span style={{ width: '14px', height: '14px', border: `2px solid ${C.cream}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Sending
                    </>
                  ) : 'Send me the guide'}
                </button>
              </div>

              {/* Error message */}
              {state.kind === 'error' && (
                <p style={{
                  fontSize: '0.82rem',
                  color: C.red,
                  marginTop: '10px',
                  lineHeight: 1.5,
                }}>
                  {state.message}
                </p>
              )}

              {/* Privacy note */}
              <p style={{
                fontSize: '0.78rem',
                color: C.dim,
                marginTop: '14px',
                lineHeight: 1.6,
              }}>
                We send the guide to your inbox immediately. No spam — just the occasional FinVerse update. Unsubscribe anytime.
              </p>
            </form>
          )}

          {/* ─── Trust signal ─────────────────────────────────────── */}
          <div style={{
            marginTop: '48px',
            paddingTop: '28px',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Georgia, serif',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: C.accentLt,
              flexShrink: 0,
            }}>
              TM
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: C.text,
                marginBottom: '2px',
              }}>
                Toufic Mourtada
              </p>
              <p style={{
                fontSize: '0.78rem',
                color: C.muted,
                fontStyle: 'italic',
              }}>
                The Trader Alchemist · Founder, FinVerse
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        padding: '24px 32px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <p style={{
          fontSize: '0.72rem',
          color: C.dim,
        }}>
          © {new Date().getFullYear()} FinVerse
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="https://finverse.world" style={{ fontSize: '0.72rem', color: C.muted, textDecoration: 'none' }}>
            finverse.world
          </a>
          <a href="https://finverse.world/privacy" style={{ fontSize: '0.72rem', color: C.muted, textDecoration: 'none' }}>
            Privacy
          </a>
        </div>
      </footer>
    </div>
  )
}

// ─── Success state — shown after form submission ─────────────────────────────
function SuccessState() {
  return (
    <div className="fv-page" style={{
      borderTop: `1px solid ${C.border}`,
      paddingTop: '32px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '20px 22px',
        backgroundColor: C.accent + '12',
        border: `1px solid ${C.accent}40`,
        borderRadius: '10px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: C.accent,
          color: C.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.95rem',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          ✓
        </div>
        <div>
          <p style={{
            fontSize: '0.98rem',
            fontWeight: 600,
            color: C.text,
            marginBottom: '6px',
            lineHeight: 1.4,
          }}>
            Check your inbox.
          </p>
          <p style={{
            fontSize: '0.88rem',
            color: C.muted,
            lineHeight: 1.6,
          }}>
            The guide is on its way. If it doesn't arrive within a few minutes, check spam — and add{' '}
            <span style={{ color: C.accentLt, fontWeight: 500 }}>toufic@finverse.world</span> to your contacts so future emails land in your primary inbox.
          </p>
        </div>
      </div>
    </div>
  )
}
