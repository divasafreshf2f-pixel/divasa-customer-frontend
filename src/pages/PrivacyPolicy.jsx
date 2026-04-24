import React, { useEffect, useState } from "react";

const PrivacyPolicy = () => {
  const THEME = {
    primary: "#1FAA59",
    accent: "#4ADE80",
    dark: "#020617",
    textMain: "#F8FAFC",
    textMuted: "#94A3B8"
  };

  const [activeSection, setActiveSection] = useState("part1");

  // Logic to highlight sidebar based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = Array.from({ length: 10 }, (_, i) => `part${i + 1}`);
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ 
      fontFamily: "'Plus Jakarta Sans', sans-serif", 
      backgroundColor: THEME.dark, 
      color: THEME.textMain, 
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden"
    }}>
      
      {/* ANIMATION ENGINE */}
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }

        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .glow-heading {
          color: ${THEME.primary};
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 30px;
          display: block;
          border-bottom: 1px solid rgba(31, 170, 89, 0.1);
          padding-bottom: 12px;
        }

        .legal-section { 
          padding-top: 80px; 
          margin-bottom: 20px;
          animation: fadeInRight 0.8s ease forwards;
        }

        .sidebar-link {
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 6px 0;
          display: block;
        }

        .sidebar-link:hover {
          color: ${THEME.accent};
          padding-left: 8px;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${THEME.dark}; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${THEME.primary}; }

        @media (max-width: 768px) {
          .legal-hero { padding: 80px 5% 40px !important; }
          .legal-hero h1 { font-size: clamp(28px, 8vw, 40px) !important; }
          .legal-layout {
            display: block !important;
            padding: 0 16px 60px !important;
          }
          .legal-sidebar { display: none !important; }
          .legal-content { 
            width: 100% !important; 
            margin-left: 0 !important; 
            max-width: 100% !important; 
            padding: 20px 0 !important; 
          }
          .glow-heading { font-size: 20px !important; }
          .legal-section { padding-top: 40px !important; }
        }

      `}</style>

      {/* BACKGROUND PARTICLES */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: "100%", left: `${Math.random() * 100}%`,
            fontSize: "24px", animation: `drift ${15 + Math.random() * 10}s linear infinite`,
            animationDelay: `${-Math.random() * 15}s`
          }}>
            {["🥬", "🍎", "🥦", "🥕", "🥑", "🍓"][i % 6]}
          </div>
        ))}
      </div>

      {/* HERO */}
      <section className="legal-hero" style={{ padding: "120px 5% 40px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, color: THEME.primary, marginBottom: "8px" }}>
          Privacy Policy
        </h1>
        <p style={{ color: THEME.textMuted, fontSize: "13px", letterSpacing: "1px", fontWeight: 600 }}>
          DIVASA FRESH | LAST UPDATED: JUNE 2026
        </p>
      </section>

      {/* MAIN LAYOUT */}
      <main style={{ 
        maxWidth: "1200px", margin: "0 auto", display: "grid", 
        gridTemplateColumns: "220px 1fr", gap: "80px", padding: "0 5% 100px",
        position: "relative", zIndex: 1 
      }} className="legal-layout">
        
        {/* SIDEBAR */}
        <aside className="legal-sidebar" style={{ position: "sticky", top: "40px", height: "fit-content" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, color: THEME.primary, marginBottom: "20px", letterSpacing: "1.5px" }}>CONTENTS</p>
          {[
            "Introduction", "Information We Collect", "Purpose of Data Collection", 
            "Marketing Communication", "Data Sharing", "Data Security", "Data Retention", 
            "User Rights", "Third-Party Links", "Updates to Policy"
          ].map((title, i) => {
            const id = `part${i + 1}`;
            return (
              <a key={id} href={`#${id}`} className="sidebar-link" style={{ 
                color: activeSection === id ? THEME.primary : THEME.textMuted,
                fontWeight: activeSection === id ? 800 : 400,
                borderLeft: activeSection === id ? `2px solid ${THEME.primary}` : "2px solid transparent",
                paddingLeft: activeSection === id ? "12px" : "0px"
              }}>
                {title}
              </a>
            );
          })}
        </aside>

        {/* CONTENT FLOW */}
        <div className="legal-content" style={{ fontSize: "16px", lineHeight: "1.9", color: "#CBD5E1" }}>

          {/* 1. Introduction */}
          <div id="part1" className="legal-section">
            <span className="glow-heading">1. Introduction</span>
            <p>
              Divasa Fresh operates as a fresh produce and food delivery service catering to households,
              communities, and institutional customers. This Policy applies to all users interacting with
              our platform through orders, subscriptions, or communication channels.
            </p>
            <p style={{ marginTop: "16px" }}>
              We collect only the information necessary to provide and improve our services in a lawful
              and transparent manner.
            </p>
            <p style={{ marginTop: "16px" }}>
              By using the Divasa Fresh platform, you consent to the practices described in this Policy.
            </p>
          </div>

          {/* 2. Information We Collect */}
          <div id="part2" className="legal-section">
            <span className="glow-heading">2. Information We Collect</span>
            <p>We may collect the following types of information:</p>
            <ul style={{ marginTop: "15px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Personal details such as name, phone number, and email address</li>
              <li>Delivery information including address and location details</li>
              <li>Order history, subscription details, and transaction records</li>
              <li>Communication data including messages, calls, and support interactions</li>
              <li>Device and usage data such as IP address and session activity</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              We do not store full debit or credit card details. Payments are processed securely through
              authorized payment gateways.
            </p>
          </div>

          {/* 3. Purpose of Data Collection */}
          <div id="part3" className="legal-section">
            <span className="glow-heading">3. Purpose of Data Collection</span>
            <p>Your information is used for:</p>
            <ul style={{ marginTop: "15px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Processing and fulfilling orders</li>
              <li>Managing deliveries and logistics</li>
              <li>Handling subscriptions and renewals</li>
              <li>Providing customer support and resolving issues</li>
              <li>Sending order updates and service-related notifications</li>
              <li>Improving services and operational efficiency</li>
              <li>Preventing fraud and misuse</li>
              <li>Complying with legal and regulatory requirements</li>
            </ul>
          </div>

          {/* 4. Marketing Communication */}
          <div id="part4" className="legal-section">
            <span className="glow-heading">4. Marketing Communication</span>
            <p>We may send:</p>
            <ul style={{ marginTop: "15px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Transactional messages (order updates, delivery alerts)</li>
              <li>Promotional messages (offers, discounts, updates)</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Users may opt out of promotional communication where applicable. Transactional communication
              is necessary for service delivery.
            </p>
          </div>

          {/* 5. Data Sharing */}
          <div id="part5" className="legal-section">
            <span className="glow-heading">5. Data Sharing</span>
            <p>Divasa Fresh does not sell personal data.</p>
            <p style={{ marginTop: "16px" }}>Information may be shared with:</p>
            <ul style={{ marginTop: "15px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Delivery personnel for order fulfillment</li>
              <li>Payment gateway providers for transaction processing</li>
              <li>Service providers supporting platform operations</li>
              <li>Authorities where required by law</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              All sharing is limited to operational necessity and handled securely.
            </p>
          </div>

          {/* 6. Data Security */}
          <div id="part6" className="legal-section">
            <span className="glow-heading">6. Data Security</span>
            <p>
              We implement reasonable technical and organizational measures to protect user data. Access
              is restricted to authorized personnel.
            </p>
            <p style={{ marginTop: "16px" }}>
              While we strive to protect your data, no system can guarantee complete security. Users are
              responsible for maintaining the confidentiality of their login credentials.
            </p>
          </div>

          {/* 7. Data Retention */}
          <div id="part7" className="legal-section">
            <span className="glow-heading">7. Data Retention</span>
            <p>We retain data only as long as necessary for:</p>
            <ul style={{ marginTop: "15px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Service delivery</li>
              <li>Legal and compliance requirements</li>
              <li>Record keeping and dispute resolution</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Certain information may be retained even after account deactivation where required by law.
            </p>
          </div>

          {/* 8. User Rights */}
          <div id="part8" className="legal-section">
            <span className="glow-heading">8. User Rights</span>
            <p>Users have the following rights regarding their data:</p>
            <ul style={{ marginTop: "15px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>
                <strong style={{ color: THEME.textMain }}>Update Information:</strong> Users can update
                their personal details such as name, phone number, or address through their account or
                by contacting support.
              </li>
              <li>
                <strong style={{ color: THEME.textMain }}>Correction Requests:</strong> Users may request
                correction of inaccurate information.
              </li>
              <li>
                <strong style={{ color: THEME.textMain }}>Account Deactivation:</strong> Users may request
                account deactivation by contacting support.
              </li>
            </ul>
            <p style={{ marginTop: "16px" }}>Please note:</p>
            <ul style={{ marginTop: "10px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Account deletion requests will be processed within a reasonable timeframe.</li>
              <li>Certain data may be retained for legal or compliance purposes.</li>
              <li>Transaction history may not be fully deleted.</li>
            </ul>
          </div>

          {/* 9. Third-Party Links */}
          <div id="part9" className="legal-section">
            <span className="glow-heading">9. Third-Party Links</span>
            <p>
              Our platform may include links to our official social media pages such as Instagram and Facebook.
            </p>
            <p style={{ marginTop: "16px" }}>
              Divasa Fresh is not responsible for the privacy practices of these third-party platforms.
              Users are advised to review their respective privacy policies before sharing any personal
              information.
            </p>
          </div>

          {/* 10. Updates to Policy */}
          <div id="part10" className="legal-section">
            <span className="glow-heading">10. Updates to Policy</span>
            <p>
              This Privacy Policy may be updated from time to time. Changes will be published on this page.
            </p>
            <p style={{ marginTop: "16px" }}>
              Continued use of the platform constitutes acceptance of the updated Policy.
            </p>
          </div>

          {/* Contact */}
          <div style={{
            marginTop: "60px",
            padding: "32px",
            borderRadius: "12px",
            background: "rgba(31, 170, 89, 0.06)",
            border: "1px solid rgba(31, 170, 89, 0.15)"
          }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: THEME.primary, letterSpacing: "1.5px", marginBottom: "16px" }}>
              11. CONTACT INFORMATION
            </p>
            <p>For any questions or concerns regarding this Policy:</p>
            <p style={{ marginTop: "14px" }}>
              📧{" "}
              <a href="mailto:support@divasafresh.in" style={{ color: THEME.primary, textDecoration: "none" }}>
                support@divasafresh.in
              </a>
            </p>
            <p style={{ marginTop: "8px" }}>
              📞{" "}
              <a href="tel:+919900152573" style={{ color: THEME.primary, textDecoration: "none" }}>
                +91 9900152573
              </a>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;