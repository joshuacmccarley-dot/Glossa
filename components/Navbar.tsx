"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#kits",     label: "Kits" },
  { href: "#about",    label: "About" },
  { href: "#contact",  label: "Contact" },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [activeLink,  setActiveLink]  = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setActiveLink(href);
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      role="banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "background 0.3s ease, border-color 0.3s ease",
        background: scrolled
          ? "rgba(8,8,8,0.95)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid transparent",
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
        >
          <LoneStarIcon size={36} />
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

        {/* Desktop links */}
        <ul
          role="list"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            listStyle: "none",
          }}
          className="hidden md:flex"
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

        {/* Mobile hamburger */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
          style={{
            display: "flex",
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

      {/* Mobile menu */}
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
    </header>
  );
}

function LoneStarIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="40" cy="40" r="38" stroke="#c41230" strokeWidth="1.5" opacity="0.6" />
      <circle cx="40" cy="40" r="34" stroke="#1a3a8f" strokeWidth="0.5" opacity="0.4" />

      {/* Texas-style two-tone star — left blue, right red */}
      <clipPath id="starLeft">
        <rect x="0" y="0" width="40" height="80" />
      </clipPath>
      <clipPath id="starRight">
        <rect x="40" y="0" width="40" height="80" />
      </clipPath>

      {/* Star path */}
      <polygon
        points="40,12 46.5,30 66,30 51,41 57,59 40,48 23,59 29,41 14,30 33.5,30"
        fill="#1a3a8f"
        clipPath="url(#starLeft)"
      />
      <polygon
        points="40,12 46.5,30 66,30 51,41 57,59 40,48 23,59 29,41 14,30 33.5,30"
        fill="#c41230"
        clipPath="url(#starRight)"
      />

      {/* DNA helix center — simplified */}
      <path
        d="M38 22 C38 22, 42 27, 38 32 C34 37, 38 42, 38 42 C38 42, 42 47, 38 52 C34 57, 38 62, 38 62"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M42 22 C42 22, 38 27, 42 32 C46 37, 42 42, 42 42 C42 42, 38 47, 42 52 C46 57, 42 62, 42 62"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Horizontal crossbars */}
      {[28, 37, 46, 55].map((y) => (
        <line key={y} x1="37" y1={y} x2="43" y2={y} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      ))}
    </svg>
  );
}
