#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 *
 * Build-time sitemap generator for FinVerse.
 * Pulls published blog posts and courses from Supabase REST API directly
 * (no library, avoids Node 20 WebSocket compatibility issues).
 *
 * Runs as part of Vercel build via the `prebuild` npm script.
 *
 * Required env vars (reads either naming convention):
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY
 *
 * Falls back gracefully if env vars are missing or fetch fails —
 * writes a static sitemap with public pages so the build does not fail.
 *
 * Output: client/public/sitemap.xml
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../client/public/sitemap.xml");
const SITE_URL = "https://finverse.world";

// Static pages — manually maintained list of all public routes
const STATIC_PAGES = [
  { loc: "/",                priority: "1.0",  changefreq: "weekly"  },
  { loc: "/framework",       priority: "0.9",  changefreq: "monthly" },
  { loc: "/education",       priority: "0.9",  changefreq: "weekly"  },
  { loc: "/blog",            priority: "0.8",  changefreq: "weekly"  },
  { loc: "/about",           priority: "0.7",  changefreq: "monthly" },
  { loc: "/resources",       priority: "0.7",  changefreq: "monthly" },
  { loc: "/refund-policy",   priority: "0.3",  changefreq: "yearly"  },
  { loc: "/privacy-policy",  priority: "0.3",  changefreq: "yearly"  },
  { loc: "/terms",           priority: "0.3",  changefreq: "yearly"  },
];

// Course landing pages — render regardless of publish state
const COURSE_LANDING_PAGES = [
  { loc: "/blueprint",                    priority: "0.9", changefreq: "weekly" },
  { loc: "/courses/smc-complete-guide",   priority: "0.9", changefreq: "weekly" },
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(d) {
  if (!d) return null;
  return new Date(d).toISOString().split("T")[0];
}

function urlEntry({ loc, lastmod, priority, changefreq }) {
  const lines = [`  <url>`];
  lines.push(`    <loc>${escapeXml(SITE_URL + loc)}</loc>`);
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) lines.push(`    <priority>${priority}</priority>`);
  lines.push(`  </url>`);
  return lines.join("\n");
}

async function fetchSupabaseTable(supabaseUrl, supabaseKey, query) {
  const url = `${supabaseUrl}/rest/v1/${query}`;
  const response = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function fetchPosts(supabaseUrl, supabaseKey) {
  try {
    const data = await fetchSupabaseTable(
      supabaseUrl,
      supabaseKey,
      "posts?select=slug,published_at,updated_at&is_published=eq.true&order=published_at.desc"
    );
    return data || [];
  } catch (e) {
    console.warn("[sitemap] failed to fetch posts:", e.message);
    return [];
  }
}

async function fetchCourses(supabaseUrl, supabaseKey) {
  try {
    const data = await fetchSupabaseTable(
      supabaseUrl,
      supabaseKey,
      "courses?select=slug,published_at,updated_at,is_published"
    );
    return data || [];
  } catch (e) {
    console.warn("[sitemap] failed to fetch courses:", e.message);
    return [];
  }
}

async function main() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  let posts = [];
  let courses = [];

  if (supabaseUrl && supabaseKey) {
    [posts, courses] = await Promise.all([
      fetchPosts(supabaseUrl, supabaseKey),
      fetchCourses(supabaseUrl, supabaseKey),
    ]);
    console.log(`[sitemap] fetched ${posts.length} posts, ${courses.length} courses`);
  } else {
    console.warn("[sitemap] Supabase env vars not set — using static sitemap only");
  }

  const urls = [];
  const today = isoDate(new Date());

  // Static pages
  for (const page of STATIC_PAGES) {
    urls.push(urlEntry({
      loc: page.loc,
      lastmod: today,
      priority: page.priority,
      changefreq: page.changefreq,
    }));
  }

  // Course landing pages
  for (const page of COURSE_LANDING_PAGES) {
    const slug = page.loc.split("/").pop();
    const matchingCourse = courses.find((c) => c.slug === slug);
    const lastmod = matchingCourse?.updated_at
      ? isoDate(matchingCourse.updated_at)
      : today;
    urls.push(urlEntry({
      loc: page.loc,
      lastmod,
      priority: page.priority,
      changefreq: page.changefreq,
    }));
  }

  // Blog posts
  for (const post of posts) {
    urls.push(urlEntry({
      loc: `/blog/${post.slug}`,
      lastmod: isoDate(post.updated_at || post.published_at),
      priority: "0.8",
      changefreq: "monthly",
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, xml, "utf8");
  console.log(`[sitemap] wrote ${urls.length} urls to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("[sitemap] fatal error:", err);
  // Do not fail the build — write minimal sitemap and continue
  const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>
</urlset>
`;
  try {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, fallback, "utf8");
    console.warn("[sitemap] wrote fallback sitemap");
  } catch (writeErr) {
    console.error("[sitemap] could not write fallback:", writeErr);
    process.exit(1);
  }
});
