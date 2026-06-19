"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Subtle particle canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 55;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.4,
      o:  Math.random() * 0.4 + 0.1,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      id="hero"
      aria-label="Hero — Lone Star Peptides"
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#080808",
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, opacity: 0.6 }}
      />

      {/* Atmospheric glow orbs */}
      <div
        aria-hidden="true"
        className="animate-glow-pulse"
        style={{
          position: "absolute",
          top: "10%",
          right: "-5%",
          width: "clamp(300px, 45vw, 700px)",
          height: "clamp(300px, 45vw, 700px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,18,48,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        className="animate-glow-pulse"
        style={{
          position: "absolute",
          bottom: "5%",
          left: "-10%",
          width: "clamp(300px, 50vw, 750px)",
          height: "clamp(300px, 50vw, 750px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,58,143,0.2) 0%, transparent 70%)",
          animationDelay: "2s",
          pointerEvents: "none",
        }}
      />

      {/* Grid dots */}
      <div
        aria-hidden="true"
        className="bg-dots"
        style={{ position: "absolute", inset: 0, opacity: 0.6 }}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 24px",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            background: "rgba(196,18,48,0.1)",
            border: "1px solid rgba(196,18,48,0.35)",
            borderRadius: "2px",
            marginBottom: "32px",
            animation: "fadeIn 0.8s ease-out forwards",
          }}
        >
          <StarIcon />
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c41230",
          }}>
            Texas Research Excellence
          </span>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: "clamp(2.8rem, 8vw, 6rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: "24px",
            animation: "fadeUp 0.8s 0.15s ease-out both",
          }}
        >
          <span style={{ display: "block", color: "#ffffff" }}>LONE STAR</span>
          <span className="text-gradient-red" style={{ display: "block" }}>PEPTIDES</span>
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: "clamp(0.7rem, 2vw, 0.85rem)",
            fontWeight: 700,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "24px",
            animation: "fadeUp 0.8s 0.25s ease-out both",
          }}
        >
          Quality &nbsp;·&nbsp; Purity &nbsp;·&nbsp; Performance
        </p>

        {/* Sub-copy */}
        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.7,
            maxWidth: "580px",
            margin: "0 auto 48px",
            animation: "fadeUp 0.8s 0.35s ease-out both",
          }}
        >
          Premium research-grade peptides formulated for advanced scientific
          inquiry. Every batch third-party verified.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
            animation: "fadeUp 0.8s 0.45s ease-out both",
          }}
        >
          <a
            href="#products"
            className="btn-primary"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ padding: "14px 36px", fontSize: "0.9rem" }}
          >
            <span>Explore Products</span>
            <ArrowIcon />
          </a>
          <a
            href="#kits"
            className="btn-ghost"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#kits")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ padding: "14px 36px", fontSize: "0.9rem" }}
          >
            View Kits & Bundles
          </a>
        </div>

        {/* Research disclaimer pill */}
        <div
          style={{
            marginTop: "48px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "100px",
            animation: "fadeIn 1s 0.6s ease-out both",
          }}
        >
          <FlaskIcon />
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>
            For research purposes only — not for human consumption
          </span>
        </div>
      </div>

      {/* Vial showcase strip */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "180px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "12px",
          padding: "0 24px",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {VIAL_COLORS.map((c, i) => (
          <MiniVial key={i} color={c.accent} label={c.name} delay={i * 0.07} />
        ))}
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: "200px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: 0.35,
          animation: "fadeIn 1s 1.2s both",
        }}
      >
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff" }}>
          Scroll
        </span>
        <div style={{
          width: "1px",
          height: "32px",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
        }} />
      </div>
    </section>
  );
}

const VIAL_COLORS = [
  { name: "RETA",  accent: "#c41230" },
  { name: "GHK",   accent: "#1a3a8f" },
  { name: "BAC",   accent: "#888888" },
  { name: "TESA",  accent: "#c41230" },
  { name: "MOTS",  accent: "#1a3a8f" },
  { name: "MT2",   accent: "#c41230" },
  { name: "CJC",   accent: "#1a3a8f" },
];

function MiniVial({ color, label, delay }: { color: string; label: string; delay: number }) {
  return (
    <div
      style={{
        width: "48px",
        animation: `fadeUp 0.8s ${0.6 + delay}s ease-out both, float 4s ${delay * 2}s ease-in-out infinite`,
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 48 100" xmlns="http://www.w3.org/2000/svg" width="48" height="100">
        {/* Cap */}
        <rect x="12" y="2" width="24" height="10" rx="3" fill="#888" />
        <rect x="16" y="0" width="16" height="5" rx="2" fill="#aaa" />
        {/* Vial body */}
        <rect x="8" y="11" width="32" height="82" rx="4" fill="#111" />
        {/* Glass sheen left */}
        <rect x="10" y="13" width="6" height="76" rx="3" fill="rgba(255,255,255,0.04)" />
        {/* Label bg */}
        <rect x="8" y="30" width="32" height="42" fill="#0a0a0a" />
        {/* Label accent bar top */}
        <rect x="8" y="30" width="32" height="1.5" fill={color} opacity="0.9" />
        {/* Label accent bar bottom */}
        <rect x="8" y="70.5" width="32" height="1.5" fill={color} opacity="0.9" />
        {/* Star */}
        <polygon
          points="24,38 26.4,44.4 33,44.4 27.8,48.2 29.8,54.6 24,50.8 18.2,54.6 20.2,48.2 15,44.4 21.6,44.4"
          fill={color}
          opacity="0.7"
          transform="scale(0.55) translate(19.5, 24)"
        />
        {/* Label text */}
        <text x="24" y="60" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="Inter,sans-serif">
          {label}
        </text>
        <text x="24" y="67" textAnchor="middle" fill={color} fontSize="5" fontFamily="Inter,sans-serif" letterSpacing="1">
          LONE STAR
        </text>
      </svg>
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="#c41230"
        stroke="#c41230"
        strokeWidth="1"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 3h6M9 3v6L5 18a2 2 0 001.85 2.77h10.3A2 2 0 0019 18l-4-9V3" />
    </svg>
  );
}
