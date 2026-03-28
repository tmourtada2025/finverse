/*
 * FinVerse Layout
 * 
 * Navbar: dark #111318, 72px desktop / 64px mobile
 * No logo image — text wordmark only
 * Nav links: light text, right-aligned
 * Footer: dark, thin rule + minimal copyright
 */

import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/framework", label: "Framework" },
  { href: "/blog", label: "Journal" },
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
        isActive
          ? "text-[#3E5C76]"
          : "text-[#F4F4F2]/70 hover:text-[#F4F4F2]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  // Scroll to top and close mobile nav on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — dark navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "#111318",
          borderBottom: "1px solid rgba(158,167,179,0.12)",
        }}
      >
        {/* Desktop: 72px, Mobile: 64px */}
        <div
          className="flex items-center justify-between mx-auto px-5 h-16 md:h-[72px]"
          style={{ maxWidth: "1200px" }}
        >
          {/* Text wordmark — no logo image */}
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-[#F4F4F2] tracking-tight">
              FinVerse
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          {/* Mobile Toggle */}
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

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav
            className="md:hidden"
            style={{
              backgroundColor: "#111318",
              borderTop: "1px solid rgba(158,167,179,0.12)",
            }}
          >
            <div className="mx-auto px-5 py-4 flex flex-col gap-4" style={{ maxWidth: "1200px" }}>
              {NAV_LINKS.map((link) => (
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

      {/* Main Content — offset for fixed navbar */}
      <main className="flex-1 pt-16 md:pt-[72px]">
        {children}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#111318", borderTop: "1px solid rgba(158,167,179,0.15)" }}>
        <div className="px-5 mx-auto py-12" style={{ maxWidth: "1200px" }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="font-serif text-lg font-bold text-[#F4F4F2]">FinVerse</span>
              <p className="text-xs text-[#9EA7B3] mt-1">
                Institutional Market Structure Journal
              </p>
            </div>
            <nav className="flex flex-wrap gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-[#9EA7B3] hover:text-[#F4F4F2] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
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
