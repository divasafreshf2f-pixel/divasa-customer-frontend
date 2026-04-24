import React, { useEffect } from "react";

const DeliveryAreas = () => {
  const THEME = {
    primary: "#1FAA59",
    accent: "#4ADE80",
    dark: "#020617",
    surface: "rgba(15, 23, 42, 0.8)",
    textMain: "#F8FAFC",
    textMuted: "#94A3B8"
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      backgroundColor: THEME.dark,
      color: THEME.textMain,
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
      paddingBottom: "100px"
    }}>
      
      {/* PROFESSIONAL STYLES */}
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0) rotate(0); opacity: 0; }
          20% { opacity: 0.15; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease-out;
        }
        .delivery-card {
          background: ${THEME.surface};
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .delivery-card:hover {
          border-color: ${THEME.primary};
          box-shadow: 0 0 30px rgba(31, 170, 89, 0.2);
        }
        .glow-dot {
          width: 8px;
          height: 8px;
          background: ${THEME.primary};
          border-radius: 50%;
          display: inline-block;
          margin-right: 12px;
          box-shadow: 0 0 10px ${THEME.primary};
        }
        .dark-map {
          filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%);
          border-radius: 16px;
        }
        @media (max-width: 768px) {
          .delivery-hero { padding: 90px 5% 40px !important; }
          .delivery-hero h1 { font-size: clamp(32px, 8vw, 48px) !important; }
          .delivery-content { padding: 0 4% !important; }
          .delivery-card { padding: 28px 20px !important; border-radius: 16px !important; }
          .delivery-map { height: 250px !important; }
        }

      `}</style>

      {/* FLOATING DECORATIONS */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            bottom: "-10%",
            left: `${Math.random() * 100}%`,
            fontSize: "30px",
            animation: `drift ${15 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`
          }}>
            {["🥬", "🍎", "🥦", "🥕", "🥑", "🍓"][i % 6]}
          </div>
        ))}
      </div>

      {/* HERO SECTION */}
      <section className="delivery-hero" style={{ padding: "120px 5% 60px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div className="reveal">
          <h1 style={{ 
            fontSize: "clamp(40px, 7vw, 72px)", 
            fontWeight: 900, 
            color: THEME.primary,
            marginBottom: "24px" 
          }}>
            Delivery Areas
          </h1>
          <p style={{ 
            fontSize: "18px", 
            color: THEME.textMuted, 
            maxWidth: "800px", 
            margin: "0 auto", 
            lineHeight: "1.8" 
          }}>
            Divasa Fresh operates within a defined, structured service radius designed to maintain supply chain discipline, predictable delivery cycles, and freshness integrity.
          </p>
        </div>
      </section>

      {/* CONTENT BLOCK */}
      <section className="delivery-content" style={{ padding: "0 5%", position: "relative", zIndex: 1 }}>
        <div style={{ 
          maxWidth: "1000px", 
          margin: "0 auto", 
          display: "flex", 
          flexDirection: "column", 
          gap: "30px" 
        }}>

          <div className="reveal delivery-card">
            <h2 style={{ fontSize: "24px", marginBottom: "20px", color: THEME.textMain }}>1. Current Operational Radius</h2>
            <div style={{ color: THEME.textMuted, lineHeight: "1.9" }}>
              <p>1.1 Divasa Fresh currently operates within an approximate 20 kilometer service radius centered around Bidarahalli, Bengaluru, Karnataka.</p>
              <p>1.2 This defined operational zone enables structured sourcing, same-cycle distribution, and predictable last-mile delivery.</p>
              <p>1.3 Orders placed outside the active service radius may be declined, delayed, or placed under review at the sole discretion of Divasa Fresh.</p>
              <p>1.4 Serviceability is determined through address verification during checkout and may change depending on logistics capacity.</p>
            </div>
          </div>

          <div className="reveal delivery-card">
            <h2 style={{ fontSize: "24px", marginBottom: "20px", color: THEME.textMain }}>2. Apartment & Community Coverage</h2>
            <div style={{ color: THEME.textMuted, lineHeight: "1.9" }}>
              <p>2.1 Divasa Fresh operates structured apartment stall programs in select residential communities within the operational radius.</p>
              <p>2.2 Apartment operations may require prior management approval and scheduled pre-booking commitments.</p>
              <p>2.3 Entry restrictions, association policies, or building-level permissions may impact service availability.</p>
              <p>2.4 Divasa Fresh shall not be liable for refusal of entry, logistical constraints imposed by residential associations, or administrative restrictions.</p>
            </div>
          </div>

          <div className="reveal delivery-card">
            <h2 style={{ fontSize: "24px", marginBottom: "20px", color: THEME.textMain }}>3. Institutional & Bulk Supply Zones</h2>
            <div style={{ color: THEME.textMuted, lineHeight: "1.9" }}>
              <p>3.1 Institutional, HORECA, and bulk supply agreements may operate within and beyond the standard retail radius subject to negotiated commercial terms.</p>
              <p>3.2 Extended delivery zones for institutional clients may be enabled on a case-by-case basis depending on procurement cycles and distribution capacity.</p>
              <p>3.3 No institutional supply relationship shall create an obligation for Divasa Fresh to extend consumer retail coverage to that locality.</p>
            </div>
          </div>

          <div className="reveal delivery-card">
            <h2 style={{ fontSize: "24px", marginBottom: "20px", color: THEME.textMain }}>4. Expansion Roadmap</h2>
            <div style={{ color: THEME.textMuted, lineHeight: "1.9" }}>
              <p>4.1 Divasa Fresh is actively working toward phased geographic expansion to additional zones within Bengaluru and surrounding regions.</p>
              <p>4.2 Expansion decisions are based on:<br />• Farmer sourcing alignment<br />• Demand density analysis<br />• Route efficiency modeling<br />• Operational feasibility</p>
              <p>4.3 Public statements regarding expansion shall not be construed as legally binding commitments until formally activated on the platform.</p>
              <p>4.4 Divasa Fresh reserves the absolute right to expand, restrict, suspend, or modify service areas without prior notice.</p>
            </div>
          </div>

          <div className="reveal delivery-card">
            <h2 style={{ fontSize: "24px", marginBottom: "20px", color: THEME.textMain }}>5. Delivery Eligibility & Address Validation</h2>
            <div style={{ color: THEME.textMuted, lineHeight: "1.9" }}>
              <p>5.1 Users must provide accurate and complete delivery addresses.</p>
              <p>5.2 Incorrect or incomplete address information may result in delivery delay or cancellation.</p>
              <p>5.3 In the event that a delivery location is later found to be outside serviceable range, Divasa Fresh may cancel the order and initiate refund procedures in accordance with policy.</p>
              <p>5.4 Service area determination is final and non-negotiable.</p>
            </div>
          </div>

          <div className="reveal delivery-card">
            <h2 style={{ fontSize: "24px", marginBottom: "20px", color: THEME.textMain }}>6. Future Service Notifications</h2>
            <div style={{ color: THEME.textMuted, lineHeight: "1.9" }}>
              <p>6.1 Users residing outside the current operational radius may register interest for future expansion.</p>
              <p>6.2 Divasa Fresh may notify such users upon activation of service in their locality.</p>
              <p>6.3 Registration of interest does not guarantee priority onboarding.</p>
              <p>6.4 Expansion timelines are subject to internal operational planning and agricultural supply readiness.</p>
            </div>
          </div>

          {/* CORRECTED MAP SECTION */}
          <div className="reveal delivery-card" style={{ borderStyle: "solid", borderColor: "rgba(31, 170, 89, 0.3)" }}>
            <h3 style={{ color: THEME.accent, marginBottom: "20px", display: "flex", alignItems: "center", fontSize: "22px" }}>
              <span className="glow-dot"></span>
              Service Radius Overview
            </h3>
            <p style={{ color: THEME.textMuted, lineHeight: "1.8", marginBottom: "30px" }}>
              Our operational coverage is centered at <b>Green Garden Layout, Aduru, Bengaluru (560049)</b>. Exact boundaries vary based on delivery density and route feasibility.
            </p>
            
            <div className="delivery-map" style={{
              height: "450px",
              width: "100%",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "#000"
            }}>
              <iframe
                title="Divasa Fresh Hub Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.914285816773!2d77.70514!3d13.05594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11075727c1f7%3A0x1ddecbe4079eafa9!2sGreen%20Garden%20Layout%2C%20Aduru%2C%20Karnataka%20560049!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                className="dark-map"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default DeliveryAreas;