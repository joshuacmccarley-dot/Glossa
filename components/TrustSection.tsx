"use client";

const PILLARS = [
  {
    id: "quality",
    label: "Quality",
    heading: "Uncompromising Standards",
    body: "Every compound is synthesized under strict quality control, with full traceability from raw material to final lyophilized vial.",
    stat: "100%",
    statLabel: "QC Verified",
    icon: "quality",
  },
  {
    id: "purity",
    label: "Purity",
    heading: "Third-Party Verified",
    body: "Independent HPLC testing on every batch. Certificate of Analysis provided with each order. Minimum 98% purity — guaranteed.",
    stat: "≥98%",
    statLabel: "Purity Guarantee",
    icon: "purity",
  },
  {
    id: "performance",
    label: "Performance",
    heading: "Research-Ready Formulation",
    body: "Lyophilized for long-term stability. Reconstitutes cleanly with BAC water. Designed to deliver consistent, reproducible results.",
    stat: "24-72h",
    statLabel: "Typical Dispatch",
    icon: "performance",
  },
];

export default function TrustSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Full-width dark strip with red/blue split glow */}
      <div
        style={{
          background: "linear-gradient(180deg, #0c0c0c 0%, #0a0808 100%)",
          padding: "120px 24px",
          position: "relative",
        }}
      >
        {/* Decorative lines */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(196,18,48,0.4), rgba(26,58,143,0.4), transparent)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
        />

        {/* Red glow left */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(196,18,48,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Blue glow right */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(26,58,143,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <span className="section-label">Why Lone Star</span>
            <h2
              id="about-heading"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              The Texas Standard
            </h2>
            <p style={{
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.5)",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}>
              Three principles drive everything we do — and every product we deliver.
            </p>
          </div>

          {/* Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {PILLARS.map((p, i) => (
              <PillarCard key={p.id} pillar={p} index={i} />
            ))}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              overflow: "hidden",
              marginTop: "64px",
            }}
          >
            {[
              { num: "8+", label: "Active Compounds" },
              { num: "100%", label: "Independently Tested" },
              { num: "≥98%", label: "Minimum Purity" },
              { num: "TX", label: "Based in Texas" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "36px 24px",
                  textAlign: "center",
                  background: "#0e0e0e",
                }}
              >
                <div style={{
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1,
                  marginBottom: "8px",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  pillar,
  index,
}: {
  pillar: (typeof PILLARS)[0];
  index: number;
}) {
  return (
    <div
      className="glass-card"
      style={{
        borderRadius: "8px",
        padding: "36px 28px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "8px",
          background: "rgba(196,18,48,0.08)",
          border: "1px solid rgba(196,18,48,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PillarIcon type={pillar.icon} />
      </div>

      {/* Label */}
      <div>
        <span style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#c41230",
        }}>
          {pillar.label}
        </span>
        <h3 style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "#fff",
          marginTop: "6px",
          lineHeight: 1.3,
        }}>
          {pillar.heading}
        </h3>
      </div>

      <p style={{
        fontSize: "0.88rem",
        color: "rgba(255,255,255,0.5)",
        lineHeight: 1.7,
        flexGrow: 1,
      }}>
        {pillar.body}
      </p>

      {/* Stat */}
      <div
        style={{
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
        }}
      >
        <span style={{
          fontSize: "1.6rem",
          fontWeight: 800,
          color: "#c41230",
          fontVariantNumeric: "tabular-nums",
        }}>
          {pillar.stat}
        </span>
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
          {pillar.statLabel}
        </span>
      </div>
    </div>
  );
}

function PillarIcon({ type }: { type: string }) {
  const s = { stroke: "#c41230", fill: "none", strokeWidth: "1.5" } as const;
  if (type === "quality") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...s}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (type === "purity") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...s}>
        <path d="M9 3h6M9 3v6L5 18a2 2 0 001.85 2.77h10.3A2 2 0 0019 18l-4-9V3" />
        <path d="M6.7 15.3h10.6" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...s}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
