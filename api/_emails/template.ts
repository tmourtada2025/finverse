/**
 * Shared email template helper.
 *
 * Takes the body content (paragraphs and optional links) and renders it
 * inside the FinVerse-styled HTML wrapper.
 *
 * Each nurture email passes its content here. Welcome email has its own
 * template (welcome.ts) because it has a CTA button + special structure.
 */

export interface NurtureContent {
  /** Subject line shown in inbox */
  subject: string;
  /** Italic subtitle below the headline (optional, can be empty) */
  subtitle?: string;
  /** Headline shown in serif at the top of the email */
  headline: string;
  /** Array of paragraphs. Each rendered as a <p>. Use \n\n in text version. */
  paragraphs: string[];
  /** Plain-text version (overrides default paragraph join) */
  textOverride?: string;
}

export function renderEmail(c: NurtureContent): { subject: string; html: string; text: string } {
  return {
    subject: c.subject,
    html: html(c),
    text: c.textOverride || textFromParagraphs(c),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Renders inline markdown-ish formatting:
 * - **bold** -> <strong>
 * - *italic* -> <em>
 * - [text](url) -> <a>
 * Paragraph text should be pre-escaped before formatting markers are processed.
 */
function inlineFormat(p: string): string {
  // Process links first (they contain special characters)
  // Pattern: [text](url) — capture text and url
  let result = p.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, url) =>
      `<a href="${escapeHtml(url)}" style="color:#3E5C76;text-decoration:none;font-weight:600;">${escapeHtml(text)}</a>`
  );

  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic (single asterisks not adjacent to other asterisks)
  result = result.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, "$1<em>$2</em>$3");

  return result;
}

function html(c: NurtureContent): string {
  const paragraphs = c.paragraphs
    .map((p) => {
      // First escape, then format. But links contain HTML we don't want escaped,
      // so we escape just the text portions. Simplest approach: escape everything,
      // then run the format which uses escaped link syntax.
      const escaped = p
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<p style="font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.7;color:#111318;margin:0 0 20px 0;">${inlineFormat(escaped)}</p>`;
    })
    .join("\n              ");

  const subtitle = c.subtitle
    ? `<p style="font-family:Georgia,serif;font-size:14px;color:#9EA7B3;margin:0 0 32px 0;font-style:italic;">${escapeHtml(c.subtitle)}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F2;font-family:Georgia,serif;color:#111318;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F2;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:48px 48px 24px 48px;">
              <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;margin:0 0 8px 0;letter-spacing:0.12em;text-transform:uppercase;font-weight:500;">FinVerse Journal</p>
              <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:28px;font-weight:700;color:#111318;margin:0 0 8px 0;line-height:1.2;letter-spacing:-0.01em;">${escapeHtml(c.headline)}</h1>
              ${subtitle}
              ${paragraphs}

              <p style="font-family:Georgia,serif;font-size:16px;color:#111318;font-style:italic;margin:32px 0 0 0;">&mdash; Toufic</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 48px 32px 48px;border-top:1px solid #F4F4F2;">
              <p style="font-family:Inter,Arial,sans-serif;font-size:11px;color:#9EA7B3;line-height:1.6;margin:0;letter-spacing:0.02em;">FinVerse &middot; The Trader Alchemist &middot; <a href="https://finverse.world" style="color:#9EA7B3;text-decoration:none;">finverse.world</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function textFromParagraphs(c: NurtureContent): string {
  // Strip inline formatting markers for text version
  const cleanParagraphs = c.paragraphs.map((p) =>
    p
      .replace(/\*\*([^*]+)\*\*/g, "$1") // remove bold
      .replace(/\*([^*]+)\*/g, "$1") // remove italic
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1: $2") // links: "text: url"
  );

  const subtitleText = c.subtitle ? `${c.subtitle}\n\n` : "";

  return `${c.headline}
${subtitleText}
${cleanParagraphs.join("\n\n")}

— Toufic

---
FinVerse · The Trader Alchemist
finverse.world`;
}
