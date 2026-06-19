"use client";

import { useState, useId } from "react";
import { products } from "@/lib/products";

interface FormData {
  name: string;
  email: string;
  product: string;
  quantity: string;
  message: string;
  _hp: string;
}

interface FormState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

const INITIAL: FormData = {
  name: "",
  email: "",
  product: "",
  quantity: "1",
  message: "",
  _hp: "",
};

export default function ContactSection() {
  const [form,  setForm]  = useState<FormData>(INITIAL);
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });
  const uid = useId();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: "loading", message: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setState({ status: "success", message: "Your inquiry has been received. We'll be in touch within 24 hours." });
        setForm(INITIAL);
      } else {
        setState({ status: "error", message: data.message || "Something went wrong. Please try again." });
      }
    } catch {
      setState({ status: "error", message: "Network error. Please check your connection and try again." });
    }
  };

  const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "4px",
    color: "#f0f0f0",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s ease",
    minHeight: "44px",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "8px",
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      style={{
        background: "#0c0c0c",
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Red glow bottom */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse at bottom, rgba(196,18,48,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "80px",
            alignItems: "start",
          }}
          className="contact-grid"
        >
          {/* Left column — copy */}
          <div>
            <span className="section-label">Place an Inquiry</span>
            <h2
              id="contact-heading"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: "20px",
              }}
            >
              Ready to Start Your Research?
            </h2>
            <p style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.8,
              marginBottom: "36px",
            }}>
              Submit your inquiry below and our team will respond within 24 hours
              with availability, pricing, and shipping details.
            </p>

            {/* Contact details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { icon: "location", label: "Location", value: "Texas, United States" },
                { icon: "research", label: "All Sales", value: "Research Purposes Only" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 20px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "6px",
                  }}
                >
                  <ContactItemIcon type={item.icon} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#f0f0f0", marginTop: "2px" }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legal note */}
            <div
              style={{
                marginTop: "32px",
                padding: "16px",
                background: "rgba(196,18,48,0.05)",
                border: "1px solid rgba(196,18,48,0.15)",
                borderRadius: "6px",
              }}
            >
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>
                By submitting this form you confirm that you are a qualified
                researcher and that all products are for laboratory research use
                only. Lone Star Peptides does not condone the misuse of any
                compound.
              </p>
            </div>
          </div>

          {/* Right column — form */}
          <div
            className="glass-card"
            style={{ borderRadius: "10px", padding: "40px 36px" }}
          >
            {state.status === "success" ? (
              <SuccessState message={state.message} onReset={() => setState({ status: "idle", message: "" })} />
            ) : (
              <form onSubmit={handleSubmit} noValidate aria-label="Research inquiry form">
                {/* Honeypot — hidden from real users; bots fill this in */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
                  <label htmlFor="hp_field">Leave this blank</label>
                  <input
                    id="hp_field"
                    name="_hp"
                    type="text"
                    value={form._hp}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Name + Email row */}
                  <div className="form-name-email" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label htmlFor={`${uid}-name`} style={labelStyle}>
                        Full Name <span aria-hidden="true" style={{ color: "#c41230" }}>*</span>
                      </label>
                      <input
                        id={`${uid}-name`}
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                        placeholder="Dr. Jane Smith"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(196,18,48,0.5)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${uid}-email`} style={labelStyle}>
                        Email <span aria-hidden="true" style={{ color: "#c41230" }}>*</span>
                      </label>
                      <input
                        id={`${uid}-email`}
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        placeholder="researcher@lab.com"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(196,18,48,0.5)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                      />
                    </div>
                  </div>

                  {/* Product + Quantity row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px" }}>
                    <div>
                      <label htmlFor={`${uid}-product`} style={labelStyle}>
                        Product of Interest <span aria-hidden="true" style={{ color: "#c41230" }}>*</span>
                      </label>
                      <select
                        id={`${uid}-product`}
                        name="product"
                        value={form.product}
                        onChange={handleChange}
                        required
                        style={{ ...inputStyle, cursor: "pointer" }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(196,18,48,0.5)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                      >
                        <option value="" disabled>Select compound...</option>
                        <optgroup label="Individual Compounds">
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.dosage}
                              {p.price !== null ? ` — $${p.price}` : ""}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Kits & Bundles">
                          <option value="reta-kit">RETA Starter Kit — $110</option>
                          <option value="ghk-kit">GHK Starter Kit — $60</option>
                          <option value="mt2-kit">MT2 Complete Kit — $65</option>
                          <option value="cjc-ipa-kit">CJC + IPA Research Kit — $90</option>
                          <option value="tesa-kit">TESA Research Kit — $80</option>
                          <option value="multiple">Multiple Products</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`${uid}-quantity`} style={labelStyle}>
                        Quantity
                      </label>
                      <input
                        id={`${uid}-quantity`}
                        name="quantity"
                        type="number"
                        min="1"
                        max="100"
                        value={form.quantity}
                        onChange={handleChange}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(196,18,48,0.5)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor={`${uid}-message`} style={labelStyle}>
                      Research Notes / Additional Info
                    </label>
                    <textarea
                      id={`${uid}-message`}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe your research protocol or any specific requirements..."
                      style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
                      onFocus={(e) => { e.target.style.borderColor = "rgba(196,18,48,0.5)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>

                  {/* Error message */}
                  {state.status === "error" && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      style={{
                        padding: "12px 16px",
                        background: "rgba(196,18,48,0.08)",
                        border: "1px solid rgba(196,18,48,0.25)",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        color: "#ff6b6b",
                      }}
                    >
                      {state.message}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={state.status === "loading"}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "14px",
                      fontSize: "0.85rem",
                      opacity: state.status === "loading" ? 0.7 : 1,
                      cursor: state.status === "loading" ? "not-allowed" : "pointer",
                    }}
                    aria-busy={state.status === "loading"}
                  >
                    {state.status === "loading" ? (
                      <>
                        <SpinnerIcon />
                        Sending Inquiry...
                      </>
                    ) : (
                      <>
                        Submit Research Inquiry
                        <SendIcon />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 480px) {
          .form-name-email {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function SuccessState({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(196,18,48,0.1)",
          border: "1px solid rgba(196,18,48,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c41230" strokeWidth="2" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>Inquiry Received!</h3>
      <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "320px" }}>
        {message}
      </p>
      <button
        onClick={onReset}
        className="btn-ghost"
        style={{ marginTop: "8px" }}
      >
        Submit Another Inquiry
      </button>
    </div>
  );
}

function ContactItemIcon({ type }: { type: string }) {
  const p = { stroke: "#c41230", fill: "none", strokeWidth: "1.5", width: "20", height: "20", viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (type === "location") {
    return (
      <svg {...p}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M9 3h6M9 3v6L5 18a2 2 0 001.85 2.77h10.3A2 2 0 0019 18l-4-9V3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      style={{ animation: "rotateSlow 0.8s linear infinite" }}
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
