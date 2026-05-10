import { useState } from "react";

interface EmailCaptureProps {
  /**
   * Where this form is embedded — passed to API for analytics.
   * Examples: 'framework_page', 'article_footer', 'homepage'
   */
  source: string;

  /**
   * Visual variant. 'dark' for dark backgrounds (e.g. Framework page),
   * 'light' for light backgrounds (e.g. Blog articles).
   */
  variant?: "light" | "dark";

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
 * - Theme-aware: light/dark variants matching FinVerse brand
 *
 * FinVerse brand colors:
 *   #111318 - dark background
 *   #F4F4F2 - cream text on dark
 *   #3E5C76 - slate blue accent
 *   #9EA7B3 - muted text
 */
export default function EmailCapture({
  source,
  variant = "light",
  heading,
  description,
  buttonLabel = "Subscribe",
  successMessage = "Welcome aboard. Check your inbox for a confirmation email — including your spam folder if it's not in your main inbox.",
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
          website,
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

  // Theme tokens
  const isDark = variant === "dark";
  const tokens = {
    headingColor: isDark ? "#F4F4F2" : "#111318",
    descriptionColor: isDark ? "#9EA7B3" : "#555",
    inputBg: isDark ? "transparent" : "#FFFFFF",
    inputBorder: isDark ? "#3E5C76" : "#DDD",
    inputText: isDark ? "#F4F4F2" : "#111",
    inputPlaceholder: isDark ? "#9EA7B3" : "#999",
    buttonBg: "#3E5C76", // brand slate blue — same in both variants
    buttonText: "#F4F4F2",
    buttonHoverBg: isDark ? "#4A6B87" : "#345066",
    successBg: isDark ? "rgba(62, 92, 118, 0.15)" : "rgba(62, 92, 118, 0.08)",
    successBorder: isDark ? "rgba(62, 92, 118, 0.4)" : "rgba(62, 92, 118, 0.3)",
    successText: isDark ? "#F4F4F2" : "#111318",
    errorText: isDark ? "#FCA5A5" : "#DC2626",
    helperText: isDark ? "#9EA7B3" : "#888",
  };

  if (state.status === "success") {
    return (
      <div
        className={`rounded-lg p-6 ${className}`}
        style={{
          backgroundColor: tokens.successBg,
          border: `1px solid ${tokens.successBorder}`,
        }}
      >
        <p
          className="font-serif text-base"
          style={{ color: tokens.successText, lineHeight: "1.7" }}
        >
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {heading && (
        <h3
          className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight"
          style={{ color: tokens.headingColor }}
        >
          {heading}
        </h3>
      )}
      {description && (
        <p
          className="text-sm md:text-base mb-6"
          style={{ color: tokens.descriptionColor, lineHeight: "1.7" }}
        >
          {description}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
          className="flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none transition-colors disabled:opacity-60"
          style={{
            backgroundColor: tokens.inputBg,
            border: `1px solid ${tokens.inputBorder}`,
            color: tokens.inputText,
          }}
        />

        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          style={{
            backgroundColor: tokens.buttonBg,
            color: tokens.buttonText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.buttonHoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tokens.buttonBg;
          }}
        >
          {state.status === "submitting" ? "Subscribing…" : buttonLabel}
        </button>
      </form>

      {state.status === "error" && (
        <p className="mt-3 text-sm" style={{ color: tokens.errorText }}>
          {state.message}
        </p>
      )}

      <p className="mt-3 text-xs" style={{ color: tokens.helperText }}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
