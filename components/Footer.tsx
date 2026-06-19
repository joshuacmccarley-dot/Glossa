"use client";

const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#kits",     label: "Kits" },
  { href: "#about",    label: "About" },
  { href: "#contact",  label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      role="contentinfo"
      style={{
        background: "#060606",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(196,18,48,0.3), rgba(26,58,143,0.3), transparent)",
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "64px 24px 32px" }}>
        {/* Main footer row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            gap: "48px",
            paddingBottom: "48px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <LoneStarMini />
              <div style={{ lineHeight: 1 }}>
                <span style={{
                  display: "block",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fff",
                }}>
                  LONE STAR
                </span>
                <span style={{
                  display: "block",
                  fontWeight: 400,
                  fontSize: "0.6rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#c41230",
                }}>
                  PEPTIDES
                </span>
              </div>
            </div>
            <p style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.7,
              maxWidth: "300px",
              marginBottom: "20px",
            }}>
              Premium research-grade peptides from the heart of Texas.
              Quality. Purity. Performance. — in every vial.
            </p>
            {/* Tagline strip */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              background: "rgba(196,18,48,0.08)",
              border: "1px solid rgba(196,18,48,0.2)",
              borderRadius: "2px",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#c41230" aria-hidden="true">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <span style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}>
                Research Only
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "20px",
            }}>
              Navigation
            </h3>
            <ul role="list" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={(e) => handleNav(e, href)}
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.45)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Compounds quick list */}
          <div>
            <h3 style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "20px",
            }}>
              Compounds
            </h3>
            <ul role="list" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {["RETA 20mg", "GHK-CU 100mg", "TESA 10mg", "MT2 10mg", "MOTS-C 10mg", "CJC-1295 & IPA"].map((p) => (
                <li key={p}>
                  <a
                    href="#products"
                    onClick={(e) => handleNav(e, "#products")}
                    style={{
                      fontSize: "0.82rem",
                      color: "rgba(255,255,255,0.35)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: "16px",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>
            © {year} Lone Star Peptides. All rights reserved.
          </p>

          <p style={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.15)",
            maxWidth: "640px",
            lineHeight: 1.6,
            margin: 0,
            textAlign: "right",
          }}>
            <strong style={{ color: "rgba(255,255,255,0.2)" }}>Research Use Only.</strong>{" "}
            All products sold by Lone Star Peptides are strictly for in vitro
            laboratory and research use. Not intended for human or animal
            consumption, clinical use, or therapeutic purposes. Use at your own
            risk. These statements have not been evaluated by the FDA.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

function LoneStarMini() {
  const pts = "40,8 48,30 70,30 52,44 59,66 40,53 21,66 28,44 10,30 32,30";
  return (
    <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="foot-ring" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%"   stopColor="#1a3a8f"/>
          <stop offset="40%"  stopColor="#c0c8d8"/>
          <stop offset="60%"  stopColor="#dde2ec"/>
          <stop offset="100%" stopColor="#c41230"/>
        </linearGradient>
        <linearGradient id="foot-blue" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2c5cd4"/>
          <stop offset="100%" stopColor="#0b1e60"/>
        </linearGradient>
        <linearGradient id="foot-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="60%"  stopColor="#c8d0e0"/>
          <stop offset="100%" stopColor="#8898b0"/>
        </linearGradient>
        <linearGradient id="foot-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#d81535"/>
          <stop offset="100%" stopColor="#640918"/>
        </linearGradient>
        <clipPath id="foot-cl"><rect x="0"  y="0"  width="40" height="80"/></clipPath>
        <clipPath id="foot-ctr"><rect x="40" y="0"  width="40" height="40"/></clipPath>
        <clipPath id="foot-cbr"><rect x="40" y="40" width="40" height="40"/></clipPath>
      </defs>

      <circle cx="40" cy="40" r="37.5" fill="#0a0a0a" stroke="url(#foot-ring)" strokeWidth="3"/>
      <polygon points={pts} fill="url(#foot-blue)"   clipPath="url(#foot-cl)"/>
      <polygon points={pts} fill="url(#foot-silver)"  clipPath="url(#foot-ctr)"/>
      <polygon points={pts} fill="url(#foot-red)"     clipPath="url(#foot-cbr)"/>
      <polygon points={pts} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="0.7"/>
      <path
        d="M39.5,12 C44.5,18 44.5,24 39.5,29.5 C34.5,35 34.5,40 39.5,45 C44.5,50 44.5,56 39.5,61 C36,64 38.5,66.5 39.5,67"
        stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" fill="none" strokeLinecap="round"
      />
      <path
        d="M40.5,12 C35.5,18 35.5,24 40.5,29.5 C45.5,35 45.5,40 40.5,45 C35.5,50 35.5,56 40.5,61 C44,64 41.5,66.5 40.5,67"
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" fill="none" strokeLinecap="round"
      />
      <line x1="37.5" y1="19"   x2="42.5" y2="19"   stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="36.5" y1="25"   x2="43.5" y2="25"   stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="37"   y1="31.5" x2="43"   y2="31.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="36.5" y1="38"   x2="43.5" y2="38"   stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="36.5" y1="44.5" x2="43.5" y2="44.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="36.5" y1="51"   x2="43.5" y2="51"   stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
      <line x1="37"   y1="57.5" x2="43"   y2="57.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
    </svg>
  );
}
