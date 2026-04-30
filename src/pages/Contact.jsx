import React, { useEffect, useRef } from "react";

const ContactPage = () => {
  const THEME = {
    primary: "#1FAA59",
    accent: "#4ADE80",
    dark: "#020617",
    surface: "rgba(30, 41, 59, 0.4)",
    glassBorder: "1px solid rgba(255, 255, 255, 0.1)",
    textMain: "#F8FAFC",
    textMuted: "#94A3B8"
  };

  const useReveal = () => {
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.style.opacity = 1;
            el.style.transform = "translateY(0px)";
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, []);
    return ref;
  };

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      backgroundColor: THEME.dark,
      color: THEME.textMain,
      overflowX: "hidden",
      position: "relative"
    }}>

      {/* BACKGROUND FRUIT/VEG ANIMATION */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.4 }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="drift-item" style={{
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            fontSize: `${20 + Math.random() * 30}px`,
            animation: `drift ${15 + Math.random() * 20}s linear infinite`,
            animationDelay: `${-Math.random() * 20}s`
          }}>
            {["🥬", "🍎", "🥦", "🥕", "🥑", "🍓"][i % 6]}
          </div>
        ))}
      </div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      {/* CORE EFFECTS ENGINE */}
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        .glass-card { 
          backdrop-filter: blur(10px); 
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(30, 41, 59, 0.4);
          position: relative;
        }

        .glass-card:hover { 
          transform: translateY(-10px); 
          background: rgba(30, 41, 59, 0.7);
          border-color: ${THEME.accent};
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px ${THEME.primary}44;
        }

        .glass-card:hover i {
          text-shadow: 0 0 15px ${THEME.accent};
          transform: scale(1.1);
        }

        .social-btn { 
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          display: flex; align-items: center; justify-content: center; 
          width: 55px; height: 55px; border-radius: 15px; 
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
          color: white; text-decoration: none; font-size: 22px; 
        }

        .social-btn:hover { 
          background: ${THEME.primary}; 
          transform: translateY(-8px); 
          box-shadow: 0 15px 25px ${THEME.primary}66;
          border-color: ${THEME.accent};
        }

        .form-input { 
          width: 100%; padding: 18px; margin-bottom: 20px; 
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 15px; color: white; font-size: 15px; transition: 0.3s;
          backdrop-filter: blur(5px);
          box-sizing: border-box;
        }

        .form-input:focus { 
          outline: none; border-color: ${THEME.primary}; 
          background: rgba(255,255,255,0.1); 
          box-shadow: 0 0 15px ${THEME.primary}33; 
        }

        select.form-input option {
          background-color: #0f172a;
          color: white;
        }
        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .contact-hero { padding: 100px 5% 40px !important; }
          .contact-hero h1 { font-size: clamp(28px, 7vw, 44px) !important; letter-spacing: -1px !important; }
          .contact-section { padding: 40px 5% !important; }

          /* Service cards - force single column */
          .service-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .service-grid .glass-card {
            padding: 28px 24px !important;
            border-radius: 20px !important;
          }

          /* Regional block - stack */
          .regional-block {
            flex-direction: column !important;
            padding: 30px 20px !important;
            gap: 24px !important;
            border-radius: 20px !important;
          }
          .regional-block > div { flex: none !important; width: 100% !important; }
          .regional-block h2 { font-size: 24px !important; }
          .regional-stats {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          .regional-stats .glass-card { padding: 16px 12px !important; border-radius: 14px !important; }

          /* Form + map - stack */
          .contact-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .contact-map {
            min-height: 260px !important;
            height: 260px !important;
            border-radius: 20px !important;
          }

          /* Socials */
          .socials-row { flex-wrap: wrap !important; gap: 12px !important; justify-content: center !important; }
          .footer-contact-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .footer-contact-grid .glass-card { padding: 20px !important; border-radius: 16px !important; }

          /* Disable hover on mobile */
          .glass-card:hover { transform: none !important; box-shadow: none !important; }
          .social-btn { width: 46px !important; height: 46px !important; font-size: 18px !important; }
        }

      `}</style>

      {/* HERO */}
      <section className="contact-hero" style={{ padding: "180px 5% 100px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(48px, 7vw, 82px)", fontWeight: 900, marginBottom: "30px", lineHeight: "1.05", letterSpacing: "-2px" }}>
            Freshness Without <span style={{ color: THEME.primary, background: `linear-gradient(to right, ${THEME.accent}, ${THEME.primary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interruption</span>
          </h1>
          <p style={{ fontSize: "20px", color: THEME.textMuted, lineHeight: "1.8", maxWidth: "800px", margin: "0 auto" }}>
            Divasa Fresh eliminates the lag of traditional warehousing. We move produce directly from the farm to your doorstep.
          </p>
        </div>
      </section>

      {/* SERVICE CARDS */}
      <section className="contact-section" style={{ padding: "80px 5%", position: "relative", zIndex: 1 }}>
        <div ref={useReveal()} style={{ opacity: 0, transform: "translateY(40px)", transition: "all 1s", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }} className="service-grid">
          {[
            { title: "Apartment Pop-up Stalls", icon: "fa-shop", desc: "Bringing the farm market to your community. We set up weekly fresh stalls right inside apartment complexes for convenient, touch-and-feel shopping." },
            { title: "Direct Home Delivery", icon: "fa-house-chimney", desc: "Harvested at dawn, delivered by evening. We bypass distribution hubs to preserve vital nutrients." },
            { title: "Direct Home Subscriptions", icon: "fa-calendar-check", desc: "Automated recurring plans for families. Customized seasonal baskets directly from our farm partners." },
            { title: "B2B & HORECA Solutions", icon: "fa-truck-fast", desc: "Direct procurement for restaurants. High-speed delivery ensuring ingredients never sit in stock." },
            { title: "Farm-to-Market Logistics", icon: "fa-seedling", desc: "Live transit bridging the gap between rural growers and urban health-conscious consumers." },
            { title: "Institutional Partnerships", icon: "fa-handshake", desc: "Strategic growth for retail entities seeking a modern, zero-storage supply model." }
          ].map((item, index) => (
            <div key={index} className="glass-card" style={{ padding: "50px 40px", borderRadius: "35px" }}>
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: "32px", color: THEME.primary, marginBottom: "25px", display: "block", transition: "0.3s" }}></i>
              <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "15px" }}>{item.title}</h3>
              <p style={{ fontSize: "15px", color: THEME.textMuted, lineHeight: "1.7" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REGIONAL EXPANSION VISUAL BLOCK */}
      <section className="contact-section" style={{ padding: "100px 5%", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", background: "rgba(255,255,255,0.02)", borderRadius: "50px", border: THEME.glassBorder, padding: "80px 60px", display: "flex", flexWrap: "wrap", gap: "60px", alignItems: "center", backdropFilter: "blur(5px)" }} className="regional-block">
          <div style={{ flex: "1 1 500px" }}>
            <h2 style={{ fontSize: "42px", fontWeight: 900, marginBottom: "25px" }}>Direct Regional Expansion</h2>
            <p style={{ fontSize: "18px", color: THEME.textMuted, lineHeight: "1.8", marginBottom: "30px" }}>
              Our model bypasses traditional stock-holding hubs. We are building dynamic, live transit nodes across South India.
            </p>
          </div>
          <div style={{ flex: "1 1 400px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="regional-stats">
            {[
              { label: "Farm Aggregation", val: "Direct Sourcing" },
              { label: "Live Transit", val: "Zero-Storage" },
              { label: "Last-Mile Delivery", val: "Direct-to-Door" },
              { label: "Direct Sourcing", val: "Farm clusters" }
            ].map((stat, i) => (
              <div key={i} className="glass-card" style={{ padding: "25px", borderRadius: "20px", textAlign: "center" }}>
                <div style={{ color: THEME.primary, fontWeight: 900, fontSize: "18px" }}>{stat.label}</div>
                <div style={{ fontSize: "12px", color: THEME.textMuted, marginTop: "5px", textTransform: "uppercase" }}>{stat.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INQUIRY FORM & MAP */}
      <section className="contact-section" style={{ padding: "100px 5%", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "80px" }} className="contact-grid">
          <div ref={useReveal()} style={{ opacity: 0, transform: "translateY(40px)", transition: "all 1s" }}>
            <h2 style={{ fontSize: "40px", fontWeight: 900, marginBottom: "30px" }}>Start the Conversation</h2>
            <form action="https://formsubmit.co/contact@divasfresh.in" method="POST">
              <input name="Name" placeholder="Full Name" required className="form-input" />
              <input name="Organisation" placeholder="Company Name" required className="form-input" />
              <select name="Category" required className="form-input" defaultValue="">
                <option value="" disabled>Select Inquiry Category</option>
                <option value="Home Delivery">Direct Home Delivery</option>
                <option value="Consumer Subscription">Household Subscription</option>
                <option value="Business Supply">Retail / Restaurant Supply</option>
                <option value="Farmer Network">Farmer Partnership</option>
              </select>
              <textarea name="Message" placeholder="Describe your requirement..." required rows="4" className="form-input" />
              <button type="submit" style={buttonStyle}>Submit Secure Request</button>
            </form>
          </div>

          <div className="contact-map" style={{ borderRadius: "40px", overflow: "hidden", border: THEME.glassBorder, height: "100%", minHeight: "550px", background: "#0f172a" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.828552664972!2d77.7471953757422!3d12.982823614561081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae13d74f7620ad%3A0x6d9f09315b8df4f5!2sAduru%2C%20Karnataka%20560049!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%" height="100%" style={{ border: 0, filter: "invert(90%) hue-rotate(150deg) contrast(1.2)" }} allowFullScreen="" loading="lazy">
            </iframe>
          </div>
        </div>
      </section>

      {/* FOOTER & SOCIALS */}
      <section style={{ padding: "120px 5%", background: "rgba(0,0,0,0.5)", textAlign: "center", borderTop: THEME.glassBorder, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "40px" }}>Connect With Our Ecosystem</h2>
          <div className="socials-row" style={{ display: "flex", justifyContent: "center", gap: "25px", marginBottom: "60px" }}>
            <a href="https://www.linkedin.com/company/divasafresh/" target="_blank" className="social-btn"><i className="fa-brands fa-linkedin-in"></i></a>
            <a href="https://www.facebook.com/profile.php?id=61582916816410" target="_blank" className="social-btn"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/divasafresh/" target="_blank" className="social-btn"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://www.youtube.com/@DivasaFresh" target="_blank" className="social-btn"><i className="fa-brands fa-youtube"></i></a>
            <a href="https://wa.me/919900152573" target="_blank" className="social-btn"><i className="fa-brands fa-whatsapp"></i></a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", textAlign: "left" }} className="footer-contact-grid">
            <div className="glass-card" style={{ padding: "30px", borderRadius: "25px" }}>
              <p style={{ color: THEME.primary, fontWeight: 800, textTransform: "uppercase", fontSize: "12px", marginBottom: "10px" }}>Headquarters</p>
              <p style={{ fontSize: "15px", lineHeight: "1.6" }}>No.12, 1st cross, Green Garden Layout, Aduru, Bengaluru, 560049</p>
            </div>
            <div className="glass-card" style={{ padding: "30px", borderRadius: "25px" }}>
              <p style={{ color: THEME.primary, fontWeight: 800, textTransform: "uppercase", fontSize: "12px", marginBottom: "10px" }}>Direct Lines</p>
              <p style={{ fontSize: "15px", marginBottom: "5px" }}>📞 +91 9900152573</p>
              <p style={{ fontSize: "15px" }}>✉️ contact@divasfresh.in</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const buttonStyle = {
  width: "100%", padding: "20px", background: "linear-gradient(135deg, #1FAA59, #4ADE80)",
  color: "white", border: "none", borderRadius: "15px", fontSize: "16px", fontWeight: 800,
  cursor: "pointer", boxShadow: "0 10px 25px rgba(31, 170, 89, 0.4)", transition: "0.3s"
};

export default ContactPage;
