/*
 * FinVerse Layout
 *
 * Navbar: dark #111318, 72px desktop / 64px mobile
 * SVG logo — dark-mode safe, white background removed
 * Footer: columnar with Education section
 */

import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

const UDEMY_URL = "https://www.udemy.com/course/smart-money-concepts-the-complete-guide-to-smart-trading/?referralCode=C4DBD99FE2D9012F18F5";

const FLAT_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/framework", label: "Framework" },
  { href: "/blog", label: "Journal" },
  { href: "/education", label: "Education" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
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

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
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
            {FLAT_NAV_LINKS.map((link) => (
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
              {FLAT_NAV_LINKS.map((link) => (
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
                  <Link href="/education" className="text-xs text-[#9EA7B3] hover:text-[#F4F4F2] transition-colors">
                    All Courses
                  </Link>
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
