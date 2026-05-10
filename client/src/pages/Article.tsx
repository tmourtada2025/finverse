/*
 * FinVerse Single Article — Supabase-backed
 */

import { useEffect, useState } from "react";
import { useParams, Link, Redirect } from "wouter";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import SEO, { articleSchema } from "@/components/SEO";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  thumbnail_url: string | null;
  published_at: string;
}

export default function Article() {
  const params = useParams<{ slug: string }>()
  const [post, setPost]       = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => { fetchPost() }, [params.slug])

  async function fetchPost() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', params.slug || '')
      .eq('is_published', true)
      .single()
    if (!data) { setNotFound(true) } else { setPost(data) }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ backgroundColor: "#111318", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="w-6 h-6 border-2 border-[#3E5C76] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return <Redirect to="/404" />

  if (!post) return null

  const dateStr = new Date(post.published_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ backgroundColor: "#111318" }}>
      <SEO
        title={post.title}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.thumbnail_url || undefined}
        publishedTime={post.published_at}
        author="Toufic Mourtada"
        jsonLd={articleSchema({
          title: post.title,
          description: post.excerpt,
          slug: post.slug,
          publishedAt: post.published_at,
          image: post.thumbnail_url || undefined,
          category: post.category,
        })}
      />
      {/* Article Header */}
      <section className="pt-16 md:pt-24 pb-12">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="mx-auto" style={{ maxWidth: "720px" }}>
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[#9EA7B3] hover:text-[#3E5C76] transition-colors mb-10">
              <ArrowLeft size={14} /> Back to Journal
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#3E5C76]">{post.category}</span>
              <span className="text-[#9EA7B3] opacity-30">|</span>
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#9EA7B3]">{dateStr}</span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-[#F4F4F2] mb-8">
              {post.title}
            </h1>

            {post.thumbnail_url && (
              <div className="aspect-[16/9] overflow-hidden mb-4" style={{ backgroundColor: "#1a1d24" }}>
                <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover opacity-80" />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="px-5 mx-auto" style={{ maxWidth: "720px" }}>
        <div style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
      </div>

      {/* Article Body */}
      <section className="py-16 md:py-20">
        <div className="px-5 mx-auto" style={{ maxWidth: "1200px" }}>
          <div className="mx-auto" style={{ maxWidth: "720px" }}>
            <style>{`
              .article-content p { color: #9EA7B3; line-height: 1.8; margin: .8em 0; font-size: 1rem; }
              .article-content h1,.article-content h2 { font-family: Georgia,serif; color: #F4F4F2; font-weight: 700; margin: 1.5em 0 .5em; }
              .article-content h2 { font-size: 1.4em; }
              .article-content h3 { color: #F4F4F2; font-weight: 600; margin: 1.2em 0 .4em; }
              .article-content strong { color: #F4F4F2; font-weight: 600; }
              .article-content ul { list-style: disc; padding-left: 1.5em; color: #9EA7B3; margin: .6em 0; }
              .article-content ol { list-style: decimal; padding-left: 1.5em; color: #9EA7B3; margin: .6em 0; }
              .article-content li { margin-bottom: .3em; line-height: 1.7; }
              .article-content a { color: #3E5C76; text-decoration: underline; }
              .article-content blockquote { border-left: 2px solid #3E5C76; padding-left: 1.5em; color: #9EA7B3; margin: 1em 0; }
              .article-content img { max-width: 100%; border-radius: 4px; margin: 1em 0; }
              .article-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
              .article-content th { background: #1a1d24; color: #9EA7B3; padding: 8px 12px; border: 1px solid #2a2d34; font-size: .85em; text-transform: uppercase; letter-spacing: .05em; }
              .article-content td { padding: 8px 12px; border: 1px solid #2a2d34; color: #9EA7B3; }
            `}</style>

            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

            {/* Udemy reference */}
            <div className="mt-20 pt-12" style={{ borderTop: "1px solid rgba(158,167,179,0.15)" }}>
              <p className="text-xs text-[#9EA7B3] opacity-60">
                For a structured curriculum covering these concepts, see the{" "}
                <a href="https://www.udemy.com/course/smart-money-concepts-the-complete-guide-to-smart-trading/?referralCode=C4DBD99FE2D9012F18F5"
                  target="_blank" rel="noopener noreferrer" className="text-[#3E5C76] hover:underline">
                  Smart Money Trading Course
                </a>{" "}on Udemy.
              </p>
            </div>

            <div className="mt-12">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[#3E5C76] hover:text-[#9EA7B3] transition-colors">
                <ArrowLeft size={14} /> Back to Journal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
