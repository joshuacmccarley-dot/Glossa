"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#kits",     label: "Kits" },
  { href: "#about",    label: "About" },
  { href: "#contact",  label: "Contact" },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setActiveLink(href);
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      role="banner"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: "background 0.3s ease, border-color 0.3s ease",
        background: scrolled ? "rgba(8,8,8,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          aria-label="Lone Star Peptides — home"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
        >
          <LoneStarIcon size={40} />
          <div style={{ lineHeight: 1 }}>
            <span style={{
              display: "block",
              fontWeight: 800,
              fontSize: "1rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#fff",
            }}>
              LONE STAR
            </span>
            <span style={{
              display: "block",
              fontWeight: 400,
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#c41230",
            }}>
              PEPTIDES
            </span>
          </div>
        </a>

        {/* Desktop nav — display controlled entirely by CSS below */}
        <ul
          role="list"
          className="nav-desktop-links"
          style={{ alignItems: "center", gap: "8px", listStyle: "none" }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                onClick={(e) => handleNav(e, href)}
                aria-current={activeLink === href ? "page" : undefined}
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: activeLink === href ? "#fff" : "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color =
                    activeLink === href ? "#fff" : "rgba(255,255,255,0.6)";
                }}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              onClick={(e) => handleNav(e, "#contact")}
              className="btn-primary"
              style={{ padding: "8px 20px", fontSize: "0.75rem" }}
            >
              Order Now
            </a>
          </li>
        </ul>

        {/* Mobile hamburger — display controlled entirely by CSS below */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-hamburger"
          style={{
            flexDirection: "column",
            gap: "5px",
            padding: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            minWidth: "44px",
            minHeight: "44px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "#fff",
                borderRadius: "1px",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                transform: menuOpen
                  ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                  : i === 2 ? "rotate(-45deg) translate(5px, -5px)"
                  : "scaleX(0)"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      <div
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        style={{
          maxHeight: menuOpen ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
          background: "rgba(8,8,8,0.97)",
          borderBottom: menuOpen ? "1px solid rgba(255,255,255,0.07)" : "none",
        }}
      >
        <ul role="list" style={{ listStyle: "none", padding: "16px 24px 24px" }}>
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <a
                href={href}
                onClick={(e) => handleNav(e, href)}
                style={{
                  display: "block",
                  padding: "16px 0",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  minHeight: "44px",
                }}
              >
                {label}
              </a>
            </li>
          ))}
          <li style={{ marginTop: "16px" }}>
            <a
              href="#contact"
              onClick={(e) => handleNav(e, "#contact")}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Order Now
            </a>
          </li>
        </ul>
      </div>

      {/* Responsive breakpoint — CSS wins over inline display */}
      <style>{`
        .nav-desktop-links { display: none; }
        .nav-hamburger      { display: flex; }
        @media (min-width: 768px) {
          .nav-desktop-links { display: flex; }
          .nav-hamburger      { display: none;  }
        }
      `}</style>
    </header>
  );
}

/* ─── Brand logo SVG ─────────────────────────────────────────────
   Three-zone Texas star (blue left / silver top-right / red bottom-right)
   with a DNA double-helix running through the centre.            */
function LoneStarIcon({ size = 40 }: { size?: number }) {
  const pts = "40,8 48,30 70,30 52,44 59,66 40,53 21,66 28,44 10,30 32,30";
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        {/* Ring gradient: blue → silver → red */}
        <linearGradient id="nav-ring" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%"   stopColor="#1a3a8f"/>
          <stop offset="40%"  stopColor="#c0c8d8"/>
          <stop offset="60%"  stopColor="#dde2ec"/>
          <stop offset="100%" stopColor="#c41230"/>
        </linearGradient>
        {/* Left zone gradient (blue) */}
        <linearGradient id="nav-blue" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2c5cd4"/>
          <stop offset="100%" stopColor="#0b1e60"/>
        </linearGradient>
        {/* Top-right zone gradient (silver / white) */}
        <linearGradient id="nav-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="60%"  stopColor="#c8d0e0"/>
          <stop offset="100%" stopColor="#8898b0"/>
        </linearGradient>
        {/* Bottom-right zone gradient (red) */}
        <linearGradient id="nav-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#d81535"/>
          <stop offset="100%" stopColor="#640918"/>
        </linearGradient>
        {/* Clip regions for the three star zones */}
        <clipPath id="nav-cl"><rect x="0"  y="0"  width="40" height="80"/></clipPath>
        <clipPath id="nav-ctr"><rect x="40" y="0"  width="40" height="40"/></clipPath>
        <clipPath id="nav-cbr"><rect x="40" y="40" width="40" height="40"/></clipPath>
      </defs>

      {/* Outer ring */}
      <circle cx="40" cy="40" r="37.5" fill="#0a0a0a" stroke="url(#nav-ring)" strokeWidth="3"/>
      <circle cx="40" cy="40" r="34.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>

      {/* Star — three colour zones */}
      <polygon points={pts} fill="url(#nav-blue)"   clipPath="url(#nav-cl)"/>
      <polygon points={pts} fill="url(#nav-silver)"  clipPath="url(#nav-ctr)"/>
      <polygon points={pts} fill="url(#nav-red)"     clipPath="url(#nav-cbr)"/>
      {/* Crisp edge between zones */}
      <polygon points={pts} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="0.7"/>

      {/* DNA primary strand */}
      <path
        d="M39.5,12 C44.5,18 44.5,24 39.5,29.5 C34.5,35 34.5,40 39.5,45 C44.5,50 44.5,56 39.5,61 C36,64 38.5,66.5 39.5,67"
        stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" fill="none" strokeLinecap="round"
      />
      {/* DNA secondary strand */}
      <path
        d="M40.5,12 C35.5,18 35.5,24 40.5,29.5 C45.5,35 45.5,40 40.5,45 C35.5,50 35.5,56 40.5,61 C44,64 41.5,66.5 40.5,67"
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" fill="none" strokeLinecap="round"
      />
      {/* Horizontal crossbars (ladder rungs) */}
      <line x1="37.5" y1="19"   x2="42.5" y2="19"   stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="36.5" y1="25"   x2="43.5" y2="25"   stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="37"   y1="31.5" x2="43"   y2="31.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="36.5" y1="38"   x2="43.5" y2="38"   stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="36.5" y1="44.5" x2="43.5" y2="44.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="36.5" y1="51"   x2="43.5" y2="51"   stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="37"   y1="57.5" x2="43"   y2="57.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="37.5" y1="63.5" x2="42.5" y2="63.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
    </svg>
  );
}
