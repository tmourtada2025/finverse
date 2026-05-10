import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonContentProps {
  content: string | null | undefined;
}

/**
 * LessonContent
 *
 * Renders lesson section text from Supabase as markdown.
 *
 * Why this exists: section.content_text is stored as raw markdown
 * (paragraphs separated by \n\n, lists with `- ` or `1. ` prefixes,
 * **bold**, *italic*, etc). The previous renderer printed it as plain
 * text, which produced walls of text with literal dashes and numbers.
 *
 * This component uses react-markdown + remark-gfm to render the same
 * data as proper HTML, with Tailwind prose styling for typography.
 *
 * Drop-in usage in CoursePlayer:
 *
 *   {section.content_type === "text" && (
 *     <LessonContent content={section.content_text} />
 *   )}
 */
export default function LessonContent({ content }: LessonContentProps) {
  if (!content) return null;

  return (
    <div className="prose prose-invert max-w-none
      prose-headings:font-serif
      prose-h1:text-3xl prose-h1:mb-6
      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
      prose-p:leading-relaxed prose-p:mb-4
      prose-ul:my-4 prose-ul:pl-6
      prose-ol:my-4 prose-ol:pl-6
      prose-li:mb-2 prose-li:leading-relaxed
      prose-strong:text-white prose-strong:font-semibold
      prose-em:italic
      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5
        prose-code:rounded prose-code:text-sm prose-code:before:content-none
        prose-code:after:content-none
      prose-blockquote:border-l-4 prose-blockquote:border-gray-600
        prose-blockquote:pl-4 prose-blockquote:italic
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
