"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html><body>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", textAlign:"center", background:"#f0fdf4" }}>
        <div style={{ fontSize:"4rem", marginBottom:"1.5rem" }}>⚡</div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:900, marginBottom:"0.5rem" }}>sinc&apos;d is having a moment</h1>
        <p style={{ color:"#6b7280", marginBottom:"2rem" }}>Try refreshing the page.</p>
        <button onClick={reset} style={{ background:"linear-gradient(135deg,#059669,#0d9488)", color:"#fff", fontWeight:700, padding:"1rem 2rem", borderRadius:"100px", border:"none", cursor:"pointer" }}>
          Refresh
        </button>
      </div>
    </body></html>
  );
}
