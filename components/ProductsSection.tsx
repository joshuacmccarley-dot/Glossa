"use client";

import { products, type Product } from "@/lib/products";

export default function ProductsSection() {
  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      style={{
        background: "#0c0c0c",
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Section glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(196,18,48,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <span className="section-label">Research Compounds</span>
          <h2
            id="products-heading"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#fff",
              marginBottom: "16px",
            }}
          >
            Premium Peptide Catalog
          </h2>
          <p style={{
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Every compound is third-party tested, lyophilized for stability,
            and supplied with a Certificate of Analysis.
          </p>
        </div>

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Research disclaimer */}
        <div
          style={{
            marginTop: "64px",
            padding: "20px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <ShieldIcon />
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: "rgba(255,255,255,0.5)" }}>Research Use Only.</strong>{" "}
            All products are intended solely for in vitro research and laboratory
            studies. Not intended for human or animal consumption. By placing an
            order you confirm you are a qualified researcher and accept all
            associated risks.
          </p>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <article
      className="glass-card"
      aria-label={`${product.name} ${product.dosage}`}
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Vial visual header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d0d0d 0%, #151515 100%)",
          padding: "32px 24px 24px",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "120px",
            height: "60px",
            background: "radial-gradient(ellipse, rgba(196,18,48,0.15) 0%, transparent 70%)",
          }}
        />

        {/* SVG Vial */}
        <div style={{ width: "72px", height: "120px" }} className="animate-float">
          <VialSVG
            name={product.name}
            dosage={product.dosage}
            featured={product.featured}
          />
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "2px",
              background: product.badge === "Best Seller"
                ? "linear-gradient(135deg, #c41230, #8b0f22)"
                : product.badge === "New"
                ? "linear-gradient(135deg, #1a3a8f, #0f2460)"
                : "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        gap: "12px",
      }}>
        {/* Name + dosage */}
        <div>
          <h3 style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            letterSpacing: "0.05em",
            color: "#fff",
            marginBottom: "4px",
          }}>
            {product.name}
          </h3>
          <span style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#c41230",
            letterSpacing: "0.05em",
          }}>
            {product.dosage}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.6,
          flexGrow: 1,
        }}>
          {product.description}
        </p>

        {/* Features */}
        <ul role="list" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
          {["Lyophilized powder", "CoA included", "Research grade"].map((f) => (
            <li key={f} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.35)",
            }}>
              <CheckIcon />
              {f}
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          marginTop: "4px",
        }}>
          <div>
            {product.price !== null ? (
              <span style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "#fff",
                fontVariantNumeric: "tabular-nums",
              }}>
                ${product.price}
              </span>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                Contact for pricing
              </span>
            )}
          </div>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              background: "transparent",
              border: "1px solid rgba(196,18,48,0.4)",
              borderRadius: "4px",
              color: "#c41230",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textDecoration: "none",
              cursor: "pointer",
              transition: "background 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(196,18,48,0.12)";
              el.style.borderColor = "rgba(196,18,48,0.7)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "transparent";
              el.style.borderColor = "rgba(196,18,48,0.4)";
            }}
          >
            Inquire
            <ArrowSmIcon />
          </a>
        </div>
      </div>
    </article>
  );
}

function VialSVG({
  name,
  dosage,
  featured,
}: {
  name: string;
  dosage: string;
  featured?: boolean;
}) {
  const accent = featured ? "#c41230" : "#1a3a8f";
  const accentAlt = featured ? "#8b0f22" : "#0f2460";

  return (
    <svg viewBox="0 0 72 120" xmlns="http://www.w3.org/2000/svg" width="72" height="120">
      {/* Rubber septum top */}
      <rect x="26" y="0" width="20" height="7" rx="2" fill="#555" />
      {/* Cap */}
      <rect x="18" y="5" width="36" height="14" rx="4" fill={`url(#capGrad-${name})`} />
      <defs>
        <linearGradient id={`capGrad-${name}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#aaa" />
          <stop offset="100%" stopColor="#666" />
        </linearGradient>
        <linearGradient id={`bodyGrad-${name}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#181818" />
          <stop offset="40%" stopColor="#1e1e1e" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
        <linearGradient id={`labelGrad-${name}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
          <stop offset="100%" stopColor={accentAlt} stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Vial body */}
      <rect x="12" y="17" width="48" height="98" rx="5" fill={`url(#bodyGrad-${name})`} />

      {/* Glass sheen */}
      <rect x="15" y="20" width="8" height="92" rx="4" fill="rgba(255,255,255,0.035)" />
      <rect x="51" y="20" width="4" height="92" rx="2" fill="rgba(255,255,255,0.018)" />

      {/* Label background */}
      <rect x="12" y="35" width="48" height="62" fill="#0a0a0a" />
      <rect x="12" y="35" width="48" height="62" fill={`url(#labelGrad-${name})`} />

      {/* Label accent borders */}
      <rect x="12" y="35" width="48" height="2" fill={accent} opacity="0.9" />
      <rect x="12" y="95" width="48" height="2" fill={accent} opacity="0.9" />

      {/* Brand star icon */}
      <polygon
        points="36,43 38.4,49.4 45,49.4 39.8,53.2 41.8,59.6 36,55.8 30.2,59.6 32.2,53.2 27,49.4 33.6,49.4"
        fill={accent}
        opacity="0.75"
        transform="scale(0.65) translate(19.5, 21)"
      />

      {/* Name text */}
      <text
        x="36"
        y="73"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="9"
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="1.5"
      >
        {name.length > 8 ? name.substring(0, 8) : name}
      </text>

      {/* Dosage */}
      <text
        x="36"
        y="83"
        textAnchor="middle"
        fill={accent}
        fontSize="7"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {dosage}
      </text>

      {/* Research only text */}
      <text
        x="36"
        y="91"
        textAnchor="middle"
        fill="rgba(255,255,255,0.25)"
        fontSize="5"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.8"
      >
        RESEARCH ONLY
      </text>

      {/* Bottom dome */}
      <ellipse cx="36" cy="115" rx="24" ry="4" fill="#0f0f0f" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c41230" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowSmIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="1.5"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: "2px" }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
