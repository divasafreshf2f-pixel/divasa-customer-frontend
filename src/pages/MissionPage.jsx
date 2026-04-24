import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Leaf, 
  BarChart3, 
  Users, 
  Building2, 
  ShoppingBasket, 
  ShieldCheck, 
  Zap, 
  Target,
  Globe,
  Truck,
  ArrowRight,
  ClipboardCheck,
  Activity,
  HeartHandshake,
  CheckCircle2,
  Sprout,
  Scale
} from "lucide-react";

const THEME = {
  primary: "#1FAA59",
  primaryDeep: "#167a41",
  bg: "#0B0F19",
  surface: "#161B28",
  accent: "#22D3EE",
  textMain: "#F8FAFC",
  textMuted: "#94A3B8",
  border: "rgba(255, 255, 255, 0.08)",
  glow: "rgba(31, 170, 89, 0.4)"
};

/* ---------------- 3D TILT WRAPPER ---------------- */
const TiltWrapper = ({ children, style = {} }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: "transform 0.1s ease-out",
        transformStyle: "preserve-3d"
      }}
    >
      {children}
    </div>
  );
};

/* ---------------- FLOATING PARTICLES (Fruits/Veg) ---------------- */
const ParticleEngine = () => {
  const canvasRef = useRef(null);
  const items = ["🥦", "🍅", "🥕", "🍏", "🥬", "🌽", "🫑"];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 20 + 15,
      char: items[Math.floor(Math.random() * items.length)],
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      rotation: Math.random() * Math.PI * 2
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.rotation += 0.005;
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
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }} />;
};

const MissionPage = () => {
  return (
    <div style={{ backgroundColor: THEME.bg, color: THEME.textMain, fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      <style>{`
        @media (max-width: 768px) {
          .mission-hero { padding: 80px 5% 40px !important; }
          .mission-hero h1 { font-size: clamp(26px, 7vw, 38px) !important; line-height: 1.1 !important; }
          .mission-section { padding: 50px 5% !important; }
          .bento-grid-wrap { grid-template-columns: 1fr !important; }
          .bento-grid-wrap > * { grid-column: span 1 !important; }
          .priority-grid-wrap { grid-template-columns: 1fr !important; gap: 16px !important; }
          .human-chain-row { flex-direction: column !important; gap: 12px !important; }
          .dashed-line { display: none !important; }
          .summary-card-inner { padding: 40px 20px !important; border-radius: 28px !important; }
          .summary-card-inner h2 { font-size: 24px !important; }
          .summary-footer-row {
            flex-wrap: wrap !important;
            gap: 10px !important;
            font-size: 11px !important;
            justify-content: center !important;
          }
          .mission-foundation-row { flex-direction: column !important; gap: 20px !important; }
        }
      `}</style>
      <ParticleEngine />
      
      {/* ================= HERO ================= */}
      <section className="mission-hero" style={styles.hero}>
        <div style={styles.gridOverlay} />
        <div style={styles.heroGlow} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          style={styles.container}
        >
          <div style={styles.tagLine}>
            <Globe size={14} color={THEME.primary} />
            <span>RESILIENT FOOD SYSTEMS ARCHITECTURE</span>
          </div>
          <h1 style={styles.heroTitle}>
            Engineering <span style={{ color: THEME.primary, textShadow: `0 0 20px ${THEME.glow}` }}>Stability</span> <br /> 
            Across the Agricultural Ecosystem
          </h1>
          <p style={styles.heroLead}>
            Divasa Fresh is not a trading intermediary. We serve as a structural supply chain stabilizer — aligning farm production with disciplined, predictable demand across both household and institutional markets.
          </p>
        </motion.div>
      </section>

      {/* ================= MISSION FOUNDATION ================= */}
      <section style={{ padding: "120px 0", backgroundColor: "#0B0F19", position: "relative" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 2 }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 style={{ fontSize: "48px", fontWeight: 800, marginBottom: "20px" }}>Mission Foundation</h2>
            <p style={{ fontSize: "20px", color: "#94A3B8" }}>Our goal is simple: <span style={{ color: THEME.primary }}>Empowering the hands that feed us.</span></p>
          </motion.div>

          <div className="mission-foundation-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "100px", flexWrap: "wrap", gap: "20px" }}>
            <StakeholderNode icon={<Users />} title="Farmer First" sub="Direct Empowerment" delay={0.2} />
            <FlowLine label="Direct Link" delay={0.8} />
            <StakeholderNode icon={<HeartHandshake />} title="Zero Middlemen" sub="Fair Value Bridge" delay={0.4} />
            <FlowLine label="Honest Value" delay={1.0} />
            <StakeholderNode icon={<ShoppingBasket />} title="Healthy Homes" sub="Community Trust" delay={0.6} />
          </div>

          <TiltWrapper style={styles.glassCard}>
            <p style={{ fontSize: "24px", fontWeight: 600, marginBottom: "20px", lineHeight: 1.4 }}>
              A resilient food system is a <span style={{ color: "#1FAA59" }}>shared responsibility.</span>
            </p>
            <p style={{ fontSize: "16px", color: "#94A3B8", lineHeight: 1.8, maxWidth: "850px", margin: "0 auto" }}>
              True support isn't just a promise—it's a partnership. We remove the layers of intermediaries that drain profits from the farm and raise costs for the home. By creating a transparent path from soil to table, we ensure that farmers earn what they deserve.
            </p>
          </TiltWrapper>
        </div>
      </section>

      {/* ================= THE INFRASTRUCTURE (Bento) ================= */}
      <section style={{ ...styles.section, background: "rgba(255,255,255,0.02)" }}>
        <div style={styles.container}>
          <div className="bento-grid-wrap" style={styles.bentoGrid}>
            <motion.div style={styles.bentoLarge} whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
              <TiltWrapper>
                <div style={styles.iconCircle}><Leaf color={THEME.primary} /></div>
                <h3 style={styles.bentoTitle}>Farmer Stability Is Economic Infrastructure</h3>
                <p style={styles.bentoText}>We treat agriculture as economic infrastructure. Behind every shipment is a farmer managing climate, cost, and market volatility.</p>
                <div style={styles.listGrid}>
                  {["Direct Regional Sourcing", "Recurring Demand Alignment", "Structured Procurement", "Professionalized Market Linkage"].map((item, i) => (
                    <div key={i} style={styles.listItem}><Zap size={14} color={THEME.primary} /> {item}</div>
                  ))}
                </div>
              </TiltWrapper>
            </motion.div>

            <motion.div style={styles.bentoSmall} whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
              <TiltWrapper>
                <div style={styles.iconCircle}><ShieldCheck color={THEME.accent} /></div>
                <h3 style={styles.bentoTitle}>B2C: Trust-Driven</h3>
                <p style={styles.bentoText}>“Because families deserve food they can trust every single day.”</p>
                <div style={styles.tagGroup}><span>Freshness</span><span>Hygiene</span><span>Price Continuity</span></div>
              </TiltWrapper>
            </motion.div>

            <motion.div style={styles.bentoSmall} whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
              <TiltWrapper>
                <div style={styles.iconCircle}><BarChart3 color={THEME.primary} /></div>
                <h3 style={styles.bentoTitle}>B2B: Engineering</h3>
                <p style={styles.bentoText}>Demand forecasting to reduce supply-side friction for retail and hospitality.</p>
                <div style={styles.tagGroup}><span>Grade Consistency</span><span>Volume Predictability</span></div>
              </TiltWrapper>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= HUMAN COMMITMENT ================= */}
      <section style={styles.humanSection}>
        <div style={styles.container}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.5 }} style={styles.humanContent}>
            <h2 style={styles.humanTitle}>Human Commitment Within Structure</h2>
            <p style={styles.humanText}>Food connects rural labor to urban life. We believe farmers deserve <strong>structural respect</strong>.</p>
            <div className="human-chain-row" style={styles.chainIcon}>
              <Truck size={48} color={THEME.primary} />
              <div className="dashed-line" style={styles.dashedLine} />
              <ShoppingBasket size={48} color={THEME.primary} />
            </div>
            <p style={{ fontStyle: 'italic', opacity: 0.7 }}>"Not louder. Stronger."</p>
          </motion.div>
        </div>
      </section>

      {/* ================= EXECUTION PRIORITIES ================= */}
      <section className="mission-section" style={styles.section}>
        <div style={styles.container}>
          <div style={{ marginBottom: "60px" }}>
            <div style={styles.tagLine}><CheckCircle2 size={18} /> <span>OPERATIONAL FOCUS</span></div>
            <h2 style={{ fontSize: "42px", fontWeight: 800 }}>Execution Priorities</h2>
          </div>
          
          <div className="priority-grid-wrap" style={styles.priorityGrid}>
            <PriorityCard icon={<Sprout size={24} />} title="Verified Farm Networks" desc="Direct partnerships with local growers to ensure 100% traceability." />
            <PriorityCard icon={<ShieldCheck size={24} />} title="Quality Control Guard" desc="Strict multi-point inspections at the farm-gate." />
            <PriorityCard icon={<BarChart3 size={24} />} title="Demand Alignment" desc="Engineering supply to match actual consumption." />
            <PriorityCard icon={<Truck size={24} />} title="Direct Logistics" desc="Bypassing traditional wholesale hubs." />
            <PriorityCard icon={<Scale size={24} />} title="Fair Price Guard" desc="Stabilizing costs by removing middleman markups." />
            <PriorityCard icon={<Activity size={24} />} title="System Health" desc="Continuous monitoring of supply chain flow." />
          </div>
        </div>
      </section>

      {/* ================= EXECUTIVE SUMMARY ================= */}
      <section style={styles.summarySection}>
        <div style={styles.container}>
          <TiltWrapper className="summary-card-inner" style={styles.summaryCard}>
            <div style={styles.summaryHeader}>EXECUTIVE SUMMARY</div>
            <p style={styles.summaryMain}>
              Divasa Fresh exists to engineer a more reliable agricultural supply ecosystem — where farmers gain stability, institutions gain predictability, and households gain trust.
            </p>
            <div className="summary-footer-row" style={styles.summaryFooter}>
              <span>STRUCTURAL</span> <div style={styles.dot} /> <span>ECONOMIC</span> <div style={styles.dot} /> <span>HUMAN</span>
            </div>
          </TiltWrapper>
        </div>
      </section>
    </div>
  );
};

/* ---------------- HELPER COMPONENTS ---------------- */

const PriorityCard = ({ icon, title, desc }) => (
  <motion.div whileHover={{ y: -5 }} style={{ height: '100%' }}>
    <TiltWrapper style={styles.priorityCard}>
      <div style={styles.pIcon}>{icon}</div>
      <h4 style={styles.pTitle}>{title}</h4>
      <p style={styles.pDesc}>{desc}</p>
      <div style={styles.pArrow}><ArrowRight size={16} /></div>
    </TiltWrapper>
  </motion.div>
);

const StakeholderNode = ({ icon, title, sub, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    style={{ zIndex: 2 }}
  >
    <TiltWrapper style={styles.nodeCard}>
      <div style={styles.nodeIcon}>{icon}</div>
      <div style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC" }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>{sub}</div>
    </TiltWrapper>
  </motion.div>
);

const FlowLine = ({ label, delay }) => (
  <div style={{ flex: 1, minWidth: "100px", textAlign: "center", zIndex: 1 }}>
    <div style={{ fontSize: "10px", fontWeight: 800, color: "#1FAA59", marginBottom: "8px" }}>{label}</div>
    <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(255,255,255,0.1)", position: "relative", overflow: "hidden" }}>
      <motion.div 
        initial={{ left: "-100%" }}
        whileInView={{ left: "100%" }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear", delay }}
        style={{ position: "absolute", width: "40%", height: "100%", background: "linear-gradient(90deg, transparent, #1FAA59, transparent)" }} 
      />
    </div>
  </div>
);

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 2 },
  section: { padding: "120px 0" },
  hero: {
    padding: "180px 0 120px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    borderBottom: `1px solid ${THEME.border}`
  },
  heroGlow: {
    position: "absolute",
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60vw", height: "60vw",
    background: `radial-gradient(circle, ${THEME.glow} 0%, transparent 70%)`,
    opacity: 0.15, pointerEvents: "none"
  },
  gridOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `radial-gradient(${THEME.border} 1px, transparent 1px)`,
    backgroundSize: "40px 40px", opacity: 0.5
  },
  tagLine: { display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "12px", fontWeight: 800, color: THEME.primary, marginBottom: "20px" },
  heroTitle: { fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, lineHeight: 1, marginBottom: "30px" },
  heroLead: { fontSize: "clamp(18px, 2vw, 22px)", color: THEME.textMuted, maxWidth: "800px", margin: "0 auto", lineHeight: 1.6 },
  bentoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" },
  bentoLarge: { gridColumn: "span 2" },
  bentoSmall: { gridColumn: "span 1" },
  iconCircle: { width: "50px", height: "50px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" },
  bentoTitle: { fontSize: "24px", fontWeight: 700, marginBottom: "16px" },
  bentoText: { color: THEME.textMuted, lineHeight: 1.6, marginBottom: "24px" },
  listGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  listItem: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600 },
  tagGroup: { display: "flex", gap: "10px", flexWrap: "wrap" },
  humanSection: { padding: "140px 0", background: THEME.primaryDeep, textAlign: "center" },
  humanTitle: { fontSize: "48px", fontWeight: 900, marginBottom: "30px" },
  humanText: { fontSize: "20px", maxWidth: "800px", margin: "0 auto 40px", lineHeight: 1.8 },
  chainIcon: { display: "flex", alignItems: "center", justifyContent: "center", gap: "30px", marginBottom: "30px" },
  dashedLine: { width: "100px", borderTop: "2px dashed white", opacity: 0.3 },
  priorityGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
  priorityCard: { background: "rgba(22, 27, 40, 0.7)", padding: "40px", borderRadius: "24px", border: `1px solid ${THEME.border}`, height: "100%", backdropFilter: "blur(10px)" },
  pIcon: { color: THEME.primary, marginBottom: "24px" },
  pTitle: { fontSize: "22px", fontWeight: 700, marginBottom: "12px" },
  pDesc: { color: THEME.textMuted, fontSize: "15px", lineHeight: 1.6 },
  pArrow: { position: "absolute", bottom: "30px", right: "30px", opacity: 0.2, color: THEME.primary },
  summarySection: { padding: "100px 0 150px" },
  summaryCard: { padding: "80px 40px", borderRadius: "48px", background: `linear-gradient(135deg, ${THEME.surface} 0%, #000 100%)`, border: `1px solid ${THEME.primary}`, textAlign: "center", boxShadow: `0 0 40px ${THEME.glow}11` },
  summaryHeader: { fontSize: "12px", fontWeight: 900, letterSpacing: "4px", color: THEME.primary, marginBottom: "30px" },
  summaryMain: { fontSize: "28px", fontWeight: 700, lineHeight: 1.4, maxWidth: "900px", margin: "0 auto 40px" },
  summaryFooter: { display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", fontWeight: 800, fontSize: "14px", opacity: 0.6 },
  dot: { width: "4px", height: "4px", borderRadius: "50%", background: THEME.primary },
  glassCard: { padding: "50px", borderRadius: "32px", background: "rgba(31, 170, 89, 0.05)", border: "1px solid rgba(31, 170, 89, 0.2)", backdropFilter: "blur(5px)", textAlign: "center" },
  nodeCard: { width: "180px", textAlign: "center", padding: "30px 20px", background: "#161B28", borderRadius: "24px", border: `1px solid ${THEME.border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  nodeIcon: { width: "50px", height: "50px", borderRadius: "14px", backgroundColor: "rgba(31, 170, 89, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1FAA59", margin: "0 auto 15px" }
};

export default MissionPage;