import React, { useEffect, useRef, useState } from "react";

const Vision2030Full = () => {
  const THEME = {
    primary: "#22C55E",
    primaryLight: "#4ADE80",
    dark: "#05080D",
    card: "rgba(17, 24, 39, 0.7)",
    textLight: "#F3F4F6",
    textMuted: "#9CA3AF",
    accentGlow: "rgba(34, 197, 94, 0.15)"
  };

  /* ---------------- Fruit/Vegetable Particle Engine ---------------- */
  const ParticleBackground = () => {
    const canvasRef = useRef(null);
    const items = ["🥦", "🍅", "🥕", "🍏", "🥬", "🌽", "🫑"];

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      let animationFrameId;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener("resize", resize);
      resize();

      const particles = Array.from({ length: 25 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 15,
        char: items[Math.floor(Math.random() * items.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.2 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rSpeed: (Math.random() - 0.5) * 0.01
      }));

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rSpeed;

          if (p.x < -50) p.x = canvas.width + 50;
          if (p.x > canvas.width + 50) p.x = -50;
          if (p.y < -50) p.y = canvas.height + 50;
          if (p.y > canvas.height + 50) p.y = -50;

          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = `${p.size}px serif`;
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        });
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resize);
      };
    }, []);

    return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }} />;
  };

  /* ---------------- 3D Hover Hook ---------------- */
  const TiltCard = ({ children, intensity = 15 }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: x * intensity, y: y * -intensity });
    };

    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouse}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{
          ...cardStyle,
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.02, 1.02, 1.02)`,
          zIndex: 2
        }}
      >
        {children}
      </div>
    );
  };

  /* ---------------- Reveal Hook ---------------- */
  const useReveal = () => {
    const ref = useRef();
    useEffect(() => {
      const el = ref.current;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = 1;
          el.style.transform = "translateY(0)";
        }
      }, { threshold: 0.1 });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);
    return ref;
  };

  return (
    <div style={{ background: THEME.dark, color: THEME.textLight, fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden" }}>
      <ParticleBackground />

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .vision-hero { padding: 0 16px !important; }
          .vision-hero-title { font-size: clamp(3rem, 15vw, 5rem) !important; letter-spacing: -2px !important; }
          .vision-content-section { padding: 60px 5% !important; }
          .vision-grid-split { grid-template-columns: 1fr !important; gap: 30px !important; }
          .vision-grid2 { grid-template-columns: 1fr !important; gap: 40px !important; }
          .vision-hub-wrapper { padding: 24px 16px !important; border-radius: 20px !important; }
          .vision-hub-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .vision-objective-bar { font-size: 13px !important; gap: 10px !important; }
          .vision-summary-card { padding: 30px 20px !important; border-radius: 24px !important; }
          .vision-footer-section { padding: 60px 5% !important; }
          .vision-final-quote { font-size: 1.3rem !important; }
          .vision-big-header { font-size: clamp(2rem, 7vw, 3rem) !important; }
          .vision-impact-text { font-size: 1.6rem !important; }
          .vision-tag-cloud span { font-size: 12px !important; padding: 6px 12px !important; }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="vision-hero" style={heroStyle}>
        <div style={{ position: "relative", zIndex: 5 }}>
          <div style={glowText}>DIVASA FRESH</div>
          <h1 className="vision-hero-title" style={massiveTitle}>Vision <span style={{ color: THEME.primary }}>2030</span></h1>
          <p style={heroSub}>Building the Backbone of a Resilient Food Economy</p>
          <div style={scrollIndicator}></div>
        </div>
      </section>

      {/* 2. VISION PREMISE */}
      <section className="vision-content-section" style={contentSection}>
        <div ref={useReveal()} style={revealBase}>
          <div className="vision-grid-split" style={gridSplit}>
            <div>
              <h2 style={sectionLabel}>Vision Premise</h2>
              <h3 className="vision-big-header" style={bigHeader}>Stability Over Visibility.</h3>
            </div>
            <div style={bodyText}>
              <p>By 2030, Divasa Fresh aims to become a structured agricultural supply network that connects regional farmers to predictable demand systems across households and institutions.</p>
              <p style={{ marginTop: "20px", color: THEME.primary, fontWeight: "bold" }}>We do not envision scale for visibility. We envision scale for stability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STRUCTURAL VISION (Redesigned Block) */}
      <section style={{ ...contentSection, background: "rgba(255,255,255,0.02)" }}>
        <h2 style={{ ...sectionLabel, textAlign: "center" }}>The Structural Vision</h2>
        <p style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 60px", fontSize: "1.2rem", color: THEME.textMuted }}>
          Correcting the imbalance between India's agricultural strength and its distribution inefficiency.
        </p>
        
        <div className="vision-hub-wrapper" style={hubWrapper}>
          <div className="vision-hub-grid" style={hubGrid}>
            {[
              { title: "Farm Partner Network", desc: "Verified and expanding regional connections." },
              { title: "Digital Procurement", desc: "Coordinated planning systems for seamless flow." },
              { title: "Quality Grading", desc: "Standardized checkpoints for every harvest." },
              { title: "Post-Harvest Preservation", desc: "Integrated storage and temperature-managed infrastructure." },
              { title: "Institutional B2B", desc: "Structured high-volume partnerships." },
              { title: "Household B2C", desc: "Trust-driven neighborhood distribution." }
            ].map((item, i) => (
              <div key={i} style={hubItem}>
                <div style={itemIndicator}></div>
                <h4 style={hubItemTitle}>{item.title}</h4>
                <p style={hubItemDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="vision-objective-bar" style={objectiveBar}>
          <div>Reduce Volatility</div>
          <div style={dot}></div>
          <div>Increase Predictability</div>
          <div style={dot}></div>
          <div>Strengthen Economics</div>
        </div>
      </section>

      {/* 4. FARMER-CENTRIC EXPANSION */}
      <section className="vision-content-section" style={contentSection}>
        <div ref={useReveal()} style={revealBase}>
          <h2 style={sectionLabel}>Farmer-Centric Expansion</h2>
          <div className="vision-grid-split" style={gridSplit}>
            <div className="vision-impact-text" style={largeImpactText}>
              "A farmer should not fear the market after harvest."
            </div>
            <div style={bodyText}>
              <p>Our goal is to provide consistent market linkage for hundreds of regional farmers—not seasonal, but recurring demand integration.</p>
              <ul style={featureList}>
                <li>Long-term crop planning alignment</li>
                <li>Predictable procurement cycles</li>
                <li>Transparent pricing mechanisms</li>
                <li>Reduced dependency on unstable intermediaries</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSTITUTIONAL & HOUSEHOLD (Side by Side) */}
      <section style={{ ...contentSection, background: THEME.accentGlow }}>
        <div className="vision-grid2" style={grid2}>
          <div ref={useReveal()} style={revealBase}>
            <h2 style={sectionLabel}>Institutional Architecture</h2>
            <p style={bodyText}>Volume forecasting and demand synchronization for retail chains, catering, and hospitality groups.</p>
            <div className="vision-tag-cloud" style={tagCloud}>
              <span>Volume Forecasting</span><span>Logistics</span><span>Supply Agreements</span>
            </div>
          </div>
          <div ref={useReveal()} style={revealBase}>
            <h2 style={sectionLabel}>Household Trust</h2>
            <p style={bodyText}>Personalized assurance of health and safety for daily consumption.</p>
            <div className="vision-tag-cloud" style={tagCloud}>
              <span>Freshness Benchmarks</span><span>Sourcing Transparency</span><span>Neighborhood Hubs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TECH & GEOGRAPHY */}
      <section className="vision-content-section" style={contentSection}>
        <div className="vision-grid-split" style={gridSplit}>
          <div>
            <h2 style={sectionLabel}>Technology & Data</h2>
            <p style={bodyText}>Data will not replace farmers; it will strengthen their market position. Procurement analytics and demand models lead our intelligence.</p>
          </div>
          <div>
            <h2 style={sectionLabel}>Geographic Strategy</h2>
            <p style={bodyText}>Expansion will follow infrastructure—not ambition alone. We grow only where supply capacity and logistics readiness are verified.</p>
          </div>
        </div>
      </section>

      {/* 7. HUMAN VISION & SUMMARY */}
      <section className="vision-footer-section" style={footerSection}>
        <div ref={useReveal()} style={{ ...revealBase, textAlign: "center" }}>
          <h2 className="vision-big-header" style={bigHeader}>Human Vision</h2>
          <p className="vision-final-quote" style={finalQuote}>
            Farmers operate with <strong>dignity</strong>. Institutions with <strong>confidence</strong>. Households with <strong>trust</strong>.
          </p>
          <div style={divider}></div>
          <div className="vision-summary-card" style={summaryBox}>
            <h3 style={{ color: THEME.primary, marginBottom: "20px" }}>Vision 2030 Executive Summary</h3>
            <p>Our growth is not ambition-driven. It is structure-driven.</p>
            <p>Our scale is not marketing-led. It is system-led.</p>
            <p style={{ marginTop: "20px", fontWeight: "900", letterSpacing: "2px" }}>IT IS GENERATIONAL.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ---------------- Styles ---------------- */

const heroStyle = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "0 20px"
};

const massiveTitle = {
  fontSize: "clamp(4rem, 15vw, 10rem)",
  fontWeight: "900",
  lineHeight: 0.9,
  margin: "20px 0",
  letterSpacing: "-4px"
};

const glowText = {
  color: "#22C55E",
  letterSpacing: "10px",
  fontSize: "1rem",
  fontWeight: "bold",
  textShadow: "0 0 20px rgba(34, 197, 94, 0.5)"
};

const heroSub = {
  fontSize: "1.5rem",
  color: "#9CA3AF",
  maxWidth: "700px",
  margin: "0 auto"
};

const contentSection = {
  padding: "120px 10%",
  position: "relative",
  zIndex: 2
};

const sectionLabel = {
  color: "#22C55E",
  textTransform: "uppercase",
  letterSpacing: "3px",
  fontSize: "0.9rem",
  marginBottom: "20px",
  fontWeight: "800"
};

const bigHeader = {
  fontSize: "clamp(2.5rem, 5vw, 4rem)",
  fontWeight: "800",
  lineHeight: 1.1,
  marginBottom: "30px"
};

const gridSplit = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "60px",
  alignItems: "start"
};

const bodyText = {
  fontSize: "1.2rem",
  lineHeight: "1.8",
  color: "#D1D5DB"
};

const hubWrapper = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "50px",
  background: "rgba(17, 24, 39, 0.5)",
  borderRadius: "40px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(15px)"
};

const hubGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "40px"
};

const hubItem = {
  borderLeft: "2px solid rgba(34, 197, 94, 0.3)",
  paddingLeft: "20px",
  transition: "all 0.3s ease"
};

const itemIndicator = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#22C55E",
  marginBottom: "15px",
  boxShadow: "0 0 10px rgba(34, 197, 94, 0.5)"
};

const hubItemTitle = {
  fontSize: "1.2rem",
  fontWeight: "700",
  color: "#F3F4F6",
  marginBottom: "10px"
};

const hubItemDesc = {
  fontSize: "0.95rem",
  color: "#9CA3AF",
  lineHeight: "1.6"
};

const cardStyle = {
  background: "rgba(17, 24, 39, 0.6)",
  padding: "40px",
  borderRadius: "30px",
  border: "1px solid rgba(255,255,255,0.08)",
  transition: "all 0.1s ease-out",
  backdropFilter: "blur(10px)"
};

const featureList = {
  listStyle: "none",
  padding: 0,
  marginTop: "30px"
};

const objectiveBar = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "30px",
  marginTop: "80px",
  flexWrap: "wrap",
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#22C55E"
};

const dot = { width: "8px", height: "8px", background: "#1F2937", borderRadius: "50%" };

const largeImpactText = {
  fontSize: "2.5rem",
  fontWeight: "700",
  lineHeight: 1.2,
  color: "#F3F4F6",
  borderLeft: "5px solid #22C55E",
  paddingLeft: "30px"
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "100px"
};

const tagCloud = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "20px"
};

const footerSection = {
  padding: "150px 10%",
  background: "linear-gradient(to bottom, #05080D, #0B1F14)"
};

const finalQuote = {
  fontSize: "2rem",
  color: "#9CA3AF",
  margin: "40px 0",
  lineHeight: 1.5
};

const summaryBox = {
  background: "rgba(34, 197, 94, 0.05)",
  padding: "60px",
  borderRadius: "40px",
  border: "1px solid rgba(34, 197, 94, 0.2)",
  marginTop: "60px"
};

const divider = { width: "100px", height: "2px", background: "#22C55E", margin: "40px auto" };

const revealBase = {
  opacity: 0,
  transform: "translateY(50px)",
  transition: "all 1s cubic-bezier(0.22, 1, 0.36, 1)"
};

const scrollIndicator = {
  width: "2px",
  height: "60px",
  background: "linear-gradient(to bottom, #22C55E, transparent)",
  margin: "40px auto",
  animation: "bounce 2s infinite"
};

export default Vision2030Full;