import { useState } from "react";

interface EmailCaptureProps {
  /**
   * Where this form is embedded — passed to API for analytics.
   * Examples: 'framework_page', 'article_footer', 'homepage'
   */
  source: string;

  /**
   * Optional heading shown above the form.
   */
  heading?: string;

  /**
   * Optional subheading / description.
   */
  description?: string;

  /**
   * Optional CTA text on the submit button. Defaults to "Subscribe".
   */
  buttonLabel?: string;

  /**
   * Optional success message shown after successful submission.
   */
  successMessage?: string;

  /**
   * Optional className for outer container.
   */
  className?: string;
}

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * EmailCapture
 *
 * Self-contained email signup form. Posts to /api/subscribe, which:
 * - Validates the email
 * - Stores it in Supabase
 * - Sends a welcome email via Resend
 *
 * Features:
 * - Honeypot anti-bot field (hidden 'website' input — bots fill, humans don't)
 * - Loading state during submission
 * - Inline success/error messaging (no toasts, no modals)
 * - Privacy-respecting: doesn't leak whether email was already subscribed
 *
 * Usage:
 *   <EmailCapture
 *     source="framework_page"
 *     heading="Stay in the loop"
 *     description="Weekly analysis on structure, macro, and trader psychology."
 *   />
 */
export default function EmailCapture({
  source,
  heading,
  description,
  buttonLabel = "Subscribe",
  successMessage = "Welcome aboard. Check your inbox for a confirmation email — including from your spam folder if it's not in your main inbox.",
  className = "",
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setState({ status: "error", message: "Please enter your email." });
      return;
    }

    // Light client-side check — server does the real validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState({ status: "error", message: "That doesn't look like a valid email." });
      return;
    }

    setState({ status: "submitting" });

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source,
          website, // honeypot — empty for humans
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setState({
          status: "error",
          message: data?.error || "Something went wrong. Please try again.",
        });
        return;
      }

      setState({ status: "success" });
      setEmail("");
    } catch (err) {
      setState({
        status: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  if (state.status === "success") {
    return (
      <div
        className={`border border-[#1e3a5f]/30 rounded-lg p-6 bg-[#1e3a5f]/5 ${className}`}
      >
        <p className="text-[#1e3a5f] font-serif text-base leading-relaxed">
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {heading && (
        <h3 className="font-serif text-2xl text-[#111] mb-2 leading-tight">
          {heading}
        </h3>
      )}
      {description && (
        <p className="text-[#555] text-sm leading-relaxed mb-4">{description}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        {/* Honeypot — hidden from humans, attractive to bots */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={state.status === "submitting"}
          aria-label="Email address"
          className="flex-1 px-4 py-3 border border-[#ddd] rounded-lg bg-white text-[#111] text-sm focus:outline-none focus:border-[#1e3a5f] disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a5f]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {state.status === "submitting" ? "Subscribing…" : buttonLabel}
        </button>
      </form>

      {state.status === "error" && (
        <p className="mt-3 text-sm text-red-600">{state.message}</p>
      )}

      <p className="mt-3 text-xs text-[#888]">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
