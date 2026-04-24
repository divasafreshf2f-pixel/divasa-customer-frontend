import React, { useEffect, useRef, useState } from "react";

/* ------------------ Original Styles (Preserved & Enhanced with Motion) ------------------ */
const navLink = {
  textDecoration: "none",
  color: "#FFFFFF",
  fontWeight: 600,
  fontSize: "14px",
  transition: "all 0.3s ease"
};

const sectionTitle = {
  fontSize: "42px",
  fontWeight: 900,
  marginBottom: "25px",
  color: "#FFFFFF"
};

const sectionText = {
  fontSize: "18px",
  color: "#E2E8F0",
  lineHeight: "1.8"
};

const counterStyle = {
  fontSize: "52px",
  fontWeight: 900,
  color: "#4ADE80",
  textShadow: "0 0 20px rgba(74, 222, 128, 0.3)"
};

const counterLabel = {
  fontSize: "16px",
  fontWeight: 600,
  marginTop: "10px",
  color: "#94A3B8"
};

const revealStyle = {
  opacity: 0,
  transform: "translateY(40px)",
  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)"
};

const initialCircle = {
  width: "60px",
  height: "60px",
  background: "linear-gradient(135deg, #1FAA59, #4ADE80)",
  color: "white",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
  fontSize: "20px",
  fontWeight: "800",
  letterSpacing: "1px",
  boxShadow: "0 0 15px rgba(31, 170, 89, 0.4)"
};

const leaderName = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#FFFFFF",
  marginBottom: "8px"
};

const leaderRole = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#4ADE80",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "20px"
};

const leaderBio = {
  fontSize: "15px",
  color: "#94A3B8",
  lineHeight: "1.6",
  fontWeight: "400"
};

const AboutPage = () => {
  const THEME = {
    primary: "#1FAA59",
    accent: "#B6F09C",
    surface: "#020617",
    cardBg: "rgba(30, 41, 59, 0.4)",
    glassBorder: "1px solid rgba(255, 255, 255, 0.1)",
    softBg: "rgba(31, 170, 89, 0.05)",
    textMain: "#F8FAFC",
    textMuted: "#94A3B8",
    glass: "rgba(15, 23, 42, 0.8)",
  };

  /* ------------------ Fruit/Vegetable Particle Engine ------------------ */
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

      const particles = Array.from({ length: 30 }, () => ({
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
          p.x += p.vx; p.y += p.vy; p.rotation += p.rSpeed;
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
      return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener("resize", resize); };
    }, []);

    return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }} />;
  };

  /* ------------------ Original Logic ------------------ */
  const Counter = ({ target }) => {
    const [count, setCount] = useState(0);
    const ref = useRef();
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const interval = setInterval(() => {
            start += Math.ceil(target / 40);
            if (start >= target) { setCount(target); clearInterval(interval); } else { setCount(start); }
          }, 40);
        }
      }, { threshold: 0.5 });
      observer.observe(ref.current);
      return () => observer.disconnect();
    }, [target]);
    return <div ref={ref}>{count}+</div>;
  };

  const useReveal = () => {
    const ref = useRef();
    useEffect(() => {
      const el = ref.current;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { el.style.opacity = 1; el.style.transform = "translateY(0px)"; }
      }, { threshold: 0.2 });
      observer.observe(el);
      return () => observer.disconnect();
    }, []);
    return ref;
  };

  return (
    <div style={{ backgroundColor: THEME.surface, color: THEME.textMain, fontFamily: "'Plus Jakarta Sans', sans-serif", scrollBehavior: "smooth", position: "relative", overflowX: "hidden" }}>

      {/* Dynamic Animated Styles */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes textGlow { 0% { text-shadow: 0 0 10px rgba(74,222,128,0); } 50% { text-shadow: 0 0 20px rgba(74,222,128,0.4); } 100% { text-shadow: 0 0 10px rgba(74,222,128,0); } }
        .hover-card { transition: all 0.4s ease; cursor: default; }
        .hover-card:hover { transform: translateY(-10px); background: rgba(30, 41, 59, 0.7) !important; border-color: #4ADE80 !important; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .glow-title { animation: textGlow 4s infinite ease-in-out; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .about-navbar {
            top: 10px !important;
            width: 95% !important;
            padding: 10px 16px !important;
            border-radius: 50px !important;
          }
          .about-navbar-links { gap: 14px !important; }
          .about-navbar a { font-size: 12px !important; }
          .about-navbar-cta { padding: 8px 14px !important; font-size: 12px !important; }

          .about-hero { height: 70vh !important; padding: 0 16px !important; }
          .about-hero h1 { font-size: clamp(28px, 8vw, 42px) !important; }

          .about-mission-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .about-mission-img { display: none !important; }

          .about-story-grid { grid-template-columns: 1fr !important; gap: 20px !important; }

          .leaders-grid { 
            grid-template-columns: 1fr !important; 
            border-radius: 24px !important;
          }
          .leader-card { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; padding: 40px 24px !important; }

          .partner-top { grid-template-columns: 1fr !important; gap: 30px !important; }
          .partner-sub-grid { grid-template-columns: 1fr 1fr !important; gap: 20px 30px !important; }
          .partner-bottom { flex-direction: column !important; gap: 20px !important; align-items: flex-start !important; }
          .partner-email { font-size: clamp(18px, 5vw, 26px) !important; }

          .about-section { padding: 60px 5% !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 30px !important; }
        }
        @media (max-width: 480px) {
          .partner-sub-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Dynamic Background Glows */}
      <div style={{ position: "fixed", width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(31,170,89,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)" }} />
      </div>

      <ParticleBackground />

      {/* NAVBAR */}
      <nav className="about-navbar" style={{
        position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", width: "90%", maxWidth: "1200px",
        background: THEME.glass, backdropFilter: "blur(20px)", borderRadius: "100px", padding: "12px 30px",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1000, boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        border: THEME.glassBorder
      }}>
        <img src="logo.png" alt="Logo" style={{ height: "50px", filter: "brightness(1.2)" }} />
        <div className="about-navbar-links" style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          <a href="#about" style={navLink}>About</a>
          <a href="#story" style={navLink}>Our Story</a>
          <a className="about-navbar-cta" href="#enquiry" style={{ background: THEME.primary, color: "white", padding: "12px 24px", borderRadius: "100px", textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", boxShadow: "0 4px 15px rgba(31,170,89,0.4)" }}>
            Partner With Us
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="about-hero" style={{
        height: "90vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(rgba(2,6,23,0.6), rgba(2,6,23,0.8)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600')`,
        backgroundSize: "cover", backgroundPosition: "center", textAlign: "center", color: "white", padding: "0 20px"
      }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 className="glow-title" style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, lineHeight: 1.1, textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            From Soil to Society.<br />
            <span style={{ color: THEME.accent, background: "linear-gradient(to right, #B6F09C, #4ADE80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              A Farmer-First Fresh Ecosystem.
            </span>
          </h1>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section id="about" className="about-section" style={{ padding: "120px 5%", background: "transparent", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="about-mission-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "80px", alignItems: "center" }}>

            <div ref={useReveal()} style={revealStyle}>
              <span style={{ color: THEME.primary, fontWeight: "800", letterSpacing: "2px", fontSize: "12px", textTransform: "uppercase", display: "block", marginBottom: "15px" }}>
                Our Core Mission
              </span>

              <h2 style={{ ...sectionTitle, fontSize: "clamp(32px, 5vw, 52px)", lineHeight: "1.1", letterSpacing: "-0.03em", marginBottom: "35px" }}>
                Rebuilding Agricultural <br />
                <span style={{ color: THEME.primary }}>Supply Chains.</span>
              </h2>

              <div style={{ ...sectionText }}>
                <p style={{ marginBottom: "25px", fontSize: "20px", color: "#FFFFFF", fontWeight: "500" }}>
                  Divasa Fresh connects over <strong style={{ color: THEME.primary }}>75+ active farm partners</strong> directly with families and businesses.
                </p>

                <p style={{ marginBottom: "25px", lineHeight: "1.8" }}>
                  We eliminate redundant middle layers to establish a system rooted in <strong>transparent sourcing</strong>, <strong>ethical pricing</strong>, and <strong>structured distribution</strong>.
                </p>

                <p style={{ lineHeight: "1.8", color: THEME.textMuted }}>
                  By operating across B2C household deliveries and B2B bulk systems, we secure stable demand cycles for regional farmers while maintaining rigorous quality standards for our clients.
                </p>
              </div>
            </div>

            <div className="about-mission-img" style={{ position: "relative", animation: "float 6s infinite ease-in-out" }}>
              <img
                src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=900"
                alt="Farm Field"
                style={{
                  width: "100%",
                  borderRadius: "40px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                  border: THEME.glassBorder
                }}
              />

              <div style={{
                position: "absolute",
                bottom: "-20px",
                left: "-20px",
                background: THEME.primary,
                width: "60px",
                height: "60px",
                borderRadius: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 20px rgba(31,170,89,0.5)"
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a7 7 0 0 1-10 10Z" />
                  <path d="M3 21c3-3 7-4 10-4" />
                </svg>
              </div>
            </div>

          </div>
        </div>   {/* ✅ THIS WAS MISSING */}
      </section>

      {/* STATS */}
      <section className="about-section" style={{ padding: "80px 5%", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(10px)", borderY: THEME.glassBorder }}>
        <div className="stats-grid" style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "40px", textAlign: "center" }}>
          <div><div style={counterStyle}><Counter target={75} /></div><div style={counterLabel}>Farm Partners</div></div>
          <div><div style={counterStyle}><Counter target={850} /></div><div style={counterLabel}>Families Served</div></div>
          <div><div style={counterStyle}><Counter target={40} /></div><div style={counterLabel}>Business Clients</div></div>
        </div>
      </section>

      {/* KNOW YOUR FARM */}
      <section style={{ padding: "100px 5%", background: "transparent" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ ...sectionTitle, textAlign: "center", marginBottom: "40px" }}>Know Your Farm. Know Your Food.</h2>
          <p style={{ fontSize: "20px", lineHeight: "1.6", marginBottom: "40px", color: THEME.textMuted, fontWeight: "500", textAlign: "center" }}>
            Consumers today deserve clarity about where their food comes from. <strong style={{ color: "#FFFFFF" }}> Divasa Fresh</strong> promotes a transparent sourcing philosophy — connecting customers closer to the origin of their produce.
          </p>
          <h3 style={{ fontSize: "16px", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "25px", color: "#FFFFFF", fontWeight: "800" }}>Every procurement cycle involves:</h3>
          <div style={{ marginBottom: "50px" }}>
            {["Direct sourcing from regional farmers", "Basic quality inspection before dispatch", "Organized storage and distribution", "Timely last-mile delivery"].map((item, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "15px", fontSize: "18px", color: THEME.textMuted, transition: "transform 0.3s ease" }}>
                <span style={{ color: THEME.primary, marginRight: "15px", fontSize: "24px" }}>•</span>{item}
              </div>
            ))}
          </div>
          <div style={{ padding: "40px", background: "rgba(31, 170, 89, 0.1)", borderRadius: "30px", borderLeft: `6px solid ${THEME.primary}`, backdropFilter: "blur(5px)", border: THEME.glassBorder, borderLeftWidth: "6px", transition: "all 0.4s ease" }}>
            <p style={{ fontSize: "19px", lineHeight: "1.7", color: "#FFFFFF", margin: 0 }}>
              As we grow, we aim to introduce deeper traceability features under our <span style={{ fontWeight: "700" }}> “Know Your Farmers” </span> initiative — highlighting the communities and agricultural regions that support our supply chain.
            </p>
          </div>
        </div>
      </section>

      {/* STORY / JOURNEY */}
      <section id="story" className="about-section" style={{ padding: "120px 5%", background: "rgba(15, 23, 42, 0.3)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{ ...sectionTitle, textAlign: "center" }}>Our Journey & Vision</h2>
          <div style={{ ...sectionText, textAlign: "justify", marginBottom: "40px" }}>
            <p style={{ marginBottom: "20px" }}>Divasa Fresh was founded with a clear and practical vision — to bring stability to farmers and reliability to consumers. In today’s agricultural ecosystem, farmers often struggle with unpredictable pricing, inconsistent demand, and dependency on multiple middle layers. At the same time, families and businesses face quality inconsistency and fluctuating market prices.</p>
            <p>Divasa Fresh bridges this gap by building direct farm-to-market supply systems. We work closely with local farmers to plan crop cycles, structure demand forecasting, and ensure timely procurement. By reducing unnecessary intermediaries, we improve farmer earnings while delivering fresher produce to customers.</p>
          </div>
          <div className="about-story-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginTop: "60px" }}>
            <div className="hover-card" style={{ background: THE_CARD_GRADIENT, padding: "40px", borderRadius: "32px", border: THEME.glassBorder, backdropFilter: "blur(10px)" }}>
              <h4 style={{ color: THEME.primary, fontSize: "22px", fontWeight: "800", marginBottom: "15px" }}>B2C <span style={{ fontSize: "14px", fontWeight: "400", color: THEME.textMuted }}>(Business to Consumer)</span></h4>
              <p style={{ ...sectionText, fontSize: "16px" }}>Fresh vegetables, fruits, curated combos, fruit bowls, healthy meal components, and wellness products delivered directly to households and residential communities.</p>
            </div>
            <div className="hover-card" style={{ background: THE_CARD_GRADIENT, padding: "40px", borderRadius: "32px", border: THEME.glassBorder, backdropFilter: "blur(10px)" }}>
              <h4 style={{ color: THEME.primary, fontSize: "22px", fontWeight: "800", marginBottom: "15px" }}>B2B <span style={{ fontSize: "14px", fontWeight: "400", color: THEME.textMuted }}>(Business to Business)</span></h4>
              <p style={{ ...sectionText, fontSize: "16px" }}>Bulk supply of graded produce to retailers, restaurants, catering units, and institutional buyers with predictable quality standards and scheduled logistics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP SECTION (Glass Grid) */}
      <section className="about-section" style={{ padding: "120px 5%", background: "transparent" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={sectionTitle}>The Minds Behind Divasa Fresh</h2>
          <p style={{ ...sectionText, maxWidth: "700px", margin: "0 auto 60px" }}>Our leadership team combines deep agricultural roots with modern operational expertise to bridge the gap between farm and society.</p>
          <div className="leaders-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            borderRadius: "40px", overflow: "hidden", border: THEME.glassBorder, background: "rgba(255,255,255,0.02)"
          }}>
            {[
              { id: "DH", name: "Dhanraj H B", role: "Founder", bio: "Driving the vision of a farmer-first ecosystem, focusing on sustainable sourcing and community growth." },
              { id: "KT", name: "Kavya T", role: "Proprietor & Director", bio: "Leading corporate strategy and ensuring the brand maintains its commitment to quality and transparency." },
              { id: "VK", name: "Vijay Krishna", role: "Chief Operating Officer", bio: "Oversees operational logistics, supply chain efficiency, and the management of B2B and B2C distribution channels." }
            ].map((leader, i) => (
              <div key={i} className="hover-card leader-card" style={{
                padding: "60px 40px", borderRight: i < 2 ? THEME.glassBorder : "none",
                background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent"
              }}>
                <div style={initialCircle}>{leader.id}</div>
                <h3 style={leaderName}>{leader.name}</h3>
                <p style={leaderRole}>{leader.role}</p>
                <p style={leaderBio}>{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER SECTION */}
      <section id="enquiry" className="about-section" style={{ padding: "140px 5%", background: "rgba(15, 23, 42, 0.6)", borderTop: THEME.glassBorder }}>
        <div ref={useReveal()} style={{ ...revealStyle, maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "80px" }}>
            <span style={{ color: THEME.primary, fontWeight: "700", letterSpacing: "3px", fontSize: "11px", textTransform: "uppercase", marginBottom: "20px" }}>Strategic Alliances</span>
            <h2 style={{ ...sectionTitle, fontSize: "clamp(32px, 5vw, 48px)", textAlign: "left", margin: 0 }}>Partner with <span style={{ fontWeight: "300" }}>Divasa Fresh</span></h2>
          </div>
          <div className="partner-top" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "100px", alignItems: "start", marginBottom: "100px" }}>
            <div><p style={{ fontSize: "19px", lineHeight: "1.6", color: "#CBD5E1", margin: 0 }}>We provide structured supply chain solutions for retail, hospitality, and institutional segments, ensuring demand stability through direct agricultural alignment.</p></div>
            <div className="partner-sub-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 60px" }}>
              {[{ t: "Procurement", d: "Volume-based planning" }, { t: "Quality Control", d: "Grade-specific supply" }, { t: "Logistics", d: "Scheduled bulk dispatch" }, { t: "Sourcing", d: "Long-term supply alignment" }].map((item, idx) => (
                <div key={idx}><h4 style={{ fontSize: "14px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", color: "#FFFFFF" }}>{item.t}</h4><p style={{ fontSize: "15px", color: THEME.textMuted, margin: 0 }}>{item.d}</p></div>
              ))}
            </div>
          </div>
          <div className="partner-bottom" style={{ borderTop: THEME.glassBorder, paddingTop: "60px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: "13px", color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "15px" }}>Inquiries</p>
              <a href="mailto:contact@divasfresh.in" style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "400", color: "#FFFFFF", textDecoration: "none", transition: "0.3s" }}>contact@divasfresh.in</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const THE_CARD_GRADIENT = "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)";

export default AboutPage;