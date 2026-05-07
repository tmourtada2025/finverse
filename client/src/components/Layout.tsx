/*
 * FinVerse Layout
 *
 * Navbar: dark #111318, 72px desktop / 64px mobile
 * Footer: Content / Platform / Legal columns
 */

import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

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

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const [location] = useLocation();
  const isCurrent = location === href;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="text-xs text-[#9EA7B3] hover:text-[#F4F4F2] transition-colors">
        {label}
      </a>
    )
  }

  function handleClick(e: React.MouseEvent) {
    if (isCurrent) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Link href={href} onClick={handleClick}
      className="text-xs text-[#9EA7B3] hover:text-[#F4F4F2] transition-colors">
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
        style={{ backgroundColor: "#111318", borderBottom: "1px solid rgba(158,167,179,0.12)" }}
      >
        <div className="flex items-center justify-between mx-auto px-5 h-16 md:h-[72px]" style={{ maxWidth: "1200px" }}>
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-[#F4F4F2] tracking-tight">FinVerse</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {FLAT_NAV_LINKS.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
            <Link href="/login"
              className="text-xs font-medium tracking-wide text-[#F4F4F2]/40 hover:text-[#F4F4F2]/70 transition-colors duration-200 ml-2">
              Login
            </Link>
          </nav>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#F4F4F2]/70 hover:text-[#F4F4F2] transition-colors"
            aria-label="Toggle navigation">
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
          <nav className="md:hidden" style={{ backgroundColor: "#111318", borderTop: "1px solid rgba(158,167,179,0.12)" }}>
            <div className="mx-auto px-5 py-4 flex flex-col gap-4" style={{ maxWidth: "1200px" }}>
              {FLAT_NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-[#F4F4F2]/70 hover:text-[#F4F4F2] transition-colors">
                  {link.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="text-xs font-medium text-[#F4F4F2]/40 hover:text-[#F4F4F2]/70 transition-colors">
                Login
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 pt-16 md:pt-[72px]">
        {children}
      </main>

      <footer style={{ backgroundColor: "#111318", borderTop: "1px solid rgba(158,167,179,0.15)" }}>
        <div className="px-5 mx-auto py-12" style={{ maxWidth: "1200px" }}>
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">

            {/* Brand */}
            <div style={{ maxWidth: "260px" }}>
              <span className="font-serif text-lg font-bold text-[#F4F4F2]">FinVerse</span>
              <p className="text-xs text-[#9EA7B3] mt-2" style={{ lineHeight: "1.7" }}>
                Institutional market structure education for serious independent traders.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-10 md:gap-14">

              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-40 mb-3">Content</p>
                <div className="flex flex-col gap-2">
                  <FooterLink href="/framework" label="Framework" />
                  <FooterLink href="/blog"      label="Journal" />
                  <FooterLink href="/resources" label="Resources" />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-40 mb-3">Platform</p>
                <div className="flex flex-col gap-2">
                  <FooterLink href="/education" label="Courses" />
                  <FooterLink href="/dashboard" label="My Courses" />
                  <FooterLink href="/about"     label="About" />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9EA7B3] opacity-40 mb-3">Legal</p>
                <div className="flex flex-col gap-2">
                  <FooterLink href="/refund-policy"  label="Refund Policy" />
                  <FooterLink href="/privacy-policy" label="Privacy Policy" />
                  <FooterLink href="/terms"           label="Terms of Use" />
                </div>
              </div>

            </div>
          </div>

          <div className="mt-10 mb-4" style={{ height: "1px", backgroundColor: "#9EA7B3", opacity: 0.15 }} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <p className="text-xs text-[#9EA7B3] opacity-50">
              &copy; {new Date().getFullYear()} FinVerse. All rights reserved.
            </p>
            <p className="text-xs text-[#9EA7B3] opacity-40">
              Educational content only. Not financial advice. Trading involves risk of loss.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
