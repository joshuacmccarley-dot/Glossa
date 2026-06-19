"use client";

import { kits, type Kit } from "@/lib/products";

export default function KitsSection() {
  return (
    <section
      id="kits"
      aria-labelledby="kits-heading"
      style={{
        background: "#080808",
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative grid */}
      <div
        aria-hidden="true"
        className="bg-dots"
        style={{ position: "absolute", inset: 0, opacity: 0.5 }}
      />
      {/* Blue glow top right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse at top right, rgba(26,58,143,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <span className="section-label">Bundle &amp; Save</span>
          <h2
            id="kits-heading"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#fff",
              marginBottom: "16px",
            }}
          >
            Complete Research Kits
          </h2>
          <p style={{
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Everything you need to begin your research protocol —
            bundled at a discount with needles, wipes, and BAC water included.
          </p>
        </div>

        {/* Kits grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {kits.map((kit, i) => (
            <KitCard key={kit.id} kit={kit} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function KitCard({ kit, index }: { kit: Kit; index: number }) {
  const { popular } = kit;

  return (
    <article
      aria-label={kit.name}
      style={{
        borderRadius: "10px",
        border: popular
          ? "1px solid rgba(196,18,48,0.5)"
          : "1px solid rgba(255,255,255,0.07)",
        background: popular
          ? "linear-gradient(145deg, #161010 0%, #120a0a 100%)"
          : "linear-gradient(145deg, #141414 0%, #111111 100%)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
        animationDelay: `${index * 80}ms`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = popular
          ? "0 0 40px rgba(196,18,48,0.15), 0 20px 60px rgba(0,0,0,0.5)"
          : "0 0 30px rgba(255,255,255,0.03), 0 20px 60px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Popular glow */}
      {popular && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "radial-gradient(ellipse at top, rgba(196,18,48,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top bar for popular */}
      {popular && (
        <div
          style={{
            background: "linear-gradient(90deg, #c41230, #8b0f22)",
            padding: "8px 24px",
            textAlign: "center",
          }}
        >
          <span style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#fff",
          }}>
            Most Popular
          </span>
        </div>
      )}

      {/* Card content */}
      <div style={{ padding: "28px 24px 24px", display: "flex", flexDirection: "column", flexGrow: 1, gap: "20px" }}>
        {/* Kit name + badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <h3 style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
          }}>
            {kit.name}
          </h3>
          {kit.badge && !kit.popular && (
            <span style={{
              flexShrink: 0,
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 10px",
              background: "rgba(196,18,48,0.15)",
              border: "1px solid rgba(196,18,48,0.3)",
              borderRadius: "2px",
              color: "#c41230",
            }}>
              {kit.badge}
            </span>
          )}
        </div>

        {/* What's included */}
        <div>
          <p style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            marginBottom: "12px",
          }}>
            Kit includes
          </p>
          <ul role="list" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {kit.includes.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <CheckMark popular={popular} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Spacer */}
        <div style={{ flexGrow: 1 }} />

        {/* Divider */}
        <div className="divider-line" />

        {/* Pricing */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{
              fontSize: "2rem",
              fontWeight: 900,
              color: popular ? "#fff" : "#f0f0f0",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              marginBottom: "4px",
            }}>
              ${kit.price}
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
              Save{" "}
              <span style={{ color: "#c41230", fontWeight: 600 }}>
                ${kit.savings}
              </span>{" "}
              vs. individual
            </div>
          </div>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={popular ? "btn-primary" : "btn-ghost"}
            style={{ minWidth: "44px", minHeight: "44px" }}
          >
            Order Kit
          </a>
        </div>
      </div>
    </article>
  );
}

function CheckMark({ popular }: { popular?: boolean }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: popular ? "rgba(196,18,48,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${popular ? "rgba(196,18,48,0.3)" : "rgba(255,255,255,0.1)"}`,
        flexShrink: 0,
      }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke={popular ? "#c41230" : "rgba(255,255,255,0.5)"}
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
