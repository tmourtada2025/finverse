/*
 * FinVerse Layout
 *
 * Navbar: dark #111318, 72px desktop / 64px mobile
 * Education dropdown: hover-triggered, two course cards
 * Footer: dark, minimal copyright
 */

import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, ExternalLink, ChevronDown } from "lucide-react";

const UDEMY_URL = "https://www.udemy.com/course/smart-money-concepts-the-complete-guide-to-smart-trading/?referralCode=C4DBD99FE2D9012F18F5";

const FLAT_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/framework", label: "Framework" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
];

const EDUCATION_COURSES = [
  {
    title: "SMC: The Complete Guide",
    subtitle: "Smart Money Concepts",
    description: "Institutional order flow, liquidity mechanics, and structural execution for independent traders.",
    badge: "Udemy",
    badgeExternal: true,
    href: UDEMY_URL,
    external: true,
    level: "Beginner → Advanced",
  },
  {
    title: "The Trader's Financial Blueprint",
    subtitle: "Personal Finance for Traders",
    description: "Capital structure, income architecture, taxes, and financial sovereignty for active traders.",
    badge: "FinVerse",
    badgeExternal: false,
    href: "/blueprint",
    external: false,
    level: "All Levels · $79.99",
  },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));
  return (
    <Link
      href={href}
      className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
        isActive ? "text-[#3E5C76]" : "text-[#F4F4F2]/70 hover:text-[#F4F4F2]"
      }`}
    >
      {label}
    </Link>
  );
}

function EducationDropdown() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = location.startsWith("/blueprint");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors duration-200 ${
          isActive ? "text-[#3E5C76]" : "text-[#F4F4F2]/70 hover:text-[#F4F4F2]"
        }`}
      >
        Education
        <ChevronDown
          size={13}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 pt-4"
          style={{ transform: "translateX(-50%)", zIndex: 100, minWidth: "520px" }}
        >
          <div
            style={{
              backgroundColor: "#15181f",
              border: "1px solid rgba(158,167,179,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(158,167,179,0.08)" }}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#9EA7B3] opacity-60">
                Courses
              </p>
              <p className="text-[10px] text-[#9EA7B3] opacity-40">
                More courses coming
              </p>
            </div>

            <div className="p-3 flex gap-3">
              {EDUCATION_COURSES.map((course) =>
                course.external ? (
                  <a
                    key={course.title}
                    href={course.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex-1 p-4 transition-colors"
                    style={{ backgroundColor: "rgba(158,167,179,0.03)", border: "1px solid rgba(158,167,179,0.08)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(62,92,118,0.4)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(158,167,179,0.08)")}
                  >
                    <CourseCardContent course={course} />
                  </a>
                ) : (
                  <Link
                    key={course.title}
                    href={course.href}
                    className="group flex-1 p-4 transition-colors block"
                    style={{ backgroundColor: "rgba(158,167,179,0.03)", border: "1px solid rgba(158,167,179,0.08)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(62,92,118,0.4)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(158,167,179,0.08)")}
                  >
                    <CourseCardContent course={course} />
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCardContent({ course }: { course: typeof EDUCATION_COURSES[0] }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[9px] font-medium uppercase tracking-[0.12em] px-1.5 py-0.5"
          style={{
            backgroundColor: "rgba(62,92,118,0.2)",
            color: "#3E5C76",
            border: "1px solid rgba(62,92,118,0.3)",
          }}
        >
          {course.badge}
        </span>
        {course.external ? (
          <ExternalLink size={11} className="text-[#9EA7B3] opacity-30 group-hover:opacity-70 transition-opacity" />
        ) : (
          <ArrowRight size={11} className="text-[#9EA7B3] opacity-30 group-hover:opacity-70 transition-opacity" />
        )}
      </div>
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9EA7B3] opacity-50 mb-1">
        {course.subtitle}
      </p>
      <h4 className="font-serif text-sm font-bold text-[#F4F4F2] mb-2 leading-snug group-hover:text-[#3E5C76] transition-colors">
        {course.title}
      </h4>
      <p className="text-xs text-[#9EA7B3] leading-relaxed mb-3" style={{ opacity: 0.65 }}>
        {course.description}
      </p>
      <p className="text-[10px] text-[#9EA7B3] opacity-40">{course.level}</p>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileEduOpen, setMobileEduOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
    setMobileEduOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "#111318",
          borderBottom: "1px solid rgba(158,167,179,0.12)",
        }}
      >
        <div
          className="flex items-center justify-between mx-auto px-5 h-16 md:h-[72px]"
          style={{ maxWidth: "1200px" }}
        >
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-[#F4F4F2] tracking-tight">
              FinVerse
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {FLAT_NAV_LINKS.slice(0, 3).map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
            <EducationDropdown />
            {FLAT_NAV_LINKS.slice(3).map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#F4F4F2]/70 hover:text-[#F4F4F2] transition-colors"
            aria-label="Toggle navigation"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <>
                  <line x1="5" y1="5" x2="17" y2="17" />
                  <line x1="17" y1="5" x2="5" y2="17" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="19" y2="6" />
                  <line x1="3" y1="11" x2="19" y2="11" />
                  <line x1="3" y1="16" x2="19" y2="16" />
                </>
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <nav
            className="md:hidden"
            style={{
              backgroundColor: "#111318",
              borderTop: "1px solid rgba(158,167,179,0.12)",
            }}
          >
            <div className="mx-auto px-5 py-4 flex flex-col gap-4" style={{ maxWidth: "1200px" }}>
              {FLAT_NAV_LINKS.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-[#F4F4F2]/70 hover:text-[#F4F4F2] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <div>
                <button
                  onClick={() => setMobileEduOpen(!mobileEduOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-[#F4F4F2]/70 hover:text-[#F4F4F2] transition-colors w-full text-left"
                >
                  Education
                  <ChevronDown
                    size={13}
                    style={{ transform: mobileEduOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  />
                </button>
                {mobileEduOpen && (
                  <div className="mt-3 ml-3 flex flex-col gap-3">
                    <a
                      href={UDEMY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid rgba(158,167,179,0.08)" }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div>
                        <p className="text-xs font-medium text-[#F4F4F2]">SMC: The Complete Guide</p>
                        <p className="text-[11px] text-[#9EA7B3] opacity-60">on Udemy</p>
                      </div>
                      <ExternalLink size={12} className="text-[#9EA7B3] opacity-40" />
                    </a>
                    <Link
                      href="/blueprint"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="text-xs font-medium text-[#F4F4F2]">The Trader's Financial Blueprint</p>
                        <p className="text-[11px] text-[#9EA7B3] opacity-60">$79.99 · on FinVerse</p>
                      </div>
                      <ArrowRight size={12} className="text-[#9EA7B3] opacity-40" />
                    </Link>
                  </div>
                )}
              </div>

              {FLAT_NAV_LINKS.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-[#F4F4F2]/70 hover:text-[#F4F4F2] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 pt-16 md:pt-[72px]">
        {children}
      </main>

      <footer style={{ backgroundColor: "#111318", borderTop: "1px solid rgba(158,167,179,0.15)" }}>
        <div className="px-5 mx-auto py-12" style={{ maxWidth: "1200px" }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <span className="font-serif text-lg font-bold text-[#F4F4F2]">FinVerse</span>
              <p className="text-xs text-[#9EA7B3] mt-1">
                Institutional Market Structure Journal
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-40 mb-3">
                  Content
                </p>
                <div className="flex flex-col gap-2">
                  {FLAT_NAV_LINKS.filter(l => ["/framework", "/blog"].includes(l.href)).map((link) => (
                    <Link key={link.href} href={link.href} className="text-xs text-[#9EA7B3] hover:text-[#F4F4F2] transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-40 mb-3">
                  Education
                </p>
                <div className="flex flex-col gap-2">
                  <a href={UDEMY_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-[#9EA7B3] hover:text-[#F4F4F2] transition-colors">
                    SMC: The Complete Guide
                  </a>
                  <Link href="/blueprint" className="text-xs text-[#9EA7B3] hover:text-[#F4F4F2] transition-colors">
                    Financial Blueprint
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-40 mb-3">
                  More
                </p>
                <div className="flex flex-col gap-2">
                  {FLAT_NAV_LINKS.filter(l => ["/about", "/resources"].includes(l.href)).map((link) => (
                    <Link key={link.href} href={link.href} className="text-xs text-[#9EA7B3] hover:text-[#F4F4F2] transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 mb-4" style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />
          <p className="text-xs text-[#9EA7B3] opacity-60">
            &copy; {new Date().getFullYear()} FinVerse. All rights reserved. This content is for educational purposes only and does not constitute financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
