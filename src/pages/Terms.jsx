import React, { useEffect, useState } from "react";

const Terms = () => {
  const THEME = {
    primary: "#1FAA59",
    accent: "#4ADE80",
    dark: "#020617",
    textMain: "#F8FAFC",
    textMuted: "#94A3B8"
  };

  const [activeSection, setActiveSection] = useState("part1");

  useEffect(() => {
    const handleScroll = () => {
      const sections = Array.from({ length: 21 }, (_, i) => `part${i + 1}`);
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

  const sidebarItems = [
    "Introduction",
    "Nature of Services",
    "Account Registration & Eligibility",
    "Service Area & Availability",
    "Orders & Acceptance",
    "Pricing, Charges & Taxes",
    "Delivery & Transfer of Risk",
    "Product Quality & Inspection",
    "Cancellation & Refunds",
    "Subscription Services",
    "Payments",
    "User Conduct",
    "Promotions & Offers",
    "Institutional & Bulk Orders",
    "Limitation of Liability",
    "Data & Communication",
    "Intellectual Property",
    "Force Majeure",
    "Governing Law & Jurisdiction",
    "Contact Information",
    "Updates to Terms"
  ];

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
          transition: text-shadow 0.3s ease;
        }

        .glow-heading:hover {
          text-shadow: 0 0 15px ${THEME.primary}66;
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
          padding: 5px 0;
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
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: "100%", left: `${Math.random() * 100}%`,
            fontSize: "24px", animation: `drift ${15 + Math.random() * 10}s linear infinite`,
            animationDelay: `${-Math.random() * 15}s`
          }}>
            {["🥬", "🍎", "🥦", "🥕", "🥑", "🍓"][i % 6]}
          </div>
        ))}
      </div>

      {/* HEADER */}
      <section className="legal-hero" style={{ padding: "120px 5% 40px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, color: THEME.primary, marginBottom: "8px" }}>
          Terms of Service
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
        <aside className="legal-sidebar" style={{ position: "sticky", top: "40px", height: "80vh", overflowY: "auto", paddingRight: "10px" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, color: THEME.primary, marginBottom: "20px", letterSpacing: "1.5px" }}>CONTENTS</p>
          {sidebarItems.map((title, i) => {
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

        {/* CONTENT */}
        <div className="legal-content" style={{ fontSize: "16px", lineHeight: "1.9", color: "#CBD5E1" }}>

          {/* 1. Introduction */}
          <div id="part1" className="legal-section">
            <span className="glow-heading">1. Introduction</span>
            These Terms of Service ("Terms") govern your access to and use of the Divasa Fresh platform, services, and products. By accessing, browsing, or placing orders through Divasa Fresh, you agree to be bound by these Terms in full.
            <br /><br />
            Divasa Fresh operates as a farm-to-consumer and business supply service providing fresh produce, food products, and subscription-based deliveries. These Terms apply to all users, including individual customers, subscribers, and institutional or bulk buyers.
            <br /><br />
            By using our services, you confirm that you are legally capable of entering into a binding agreement and agree to comply with applicable laws and regulations.
          </div>

          {/* 2. Nature of Services */}
          <div id="part2" className="legal-section">
            <span className="glow-heading">2. Nature of Services</span>
            Divasa Fresh provides fresh agricultural products including fruits, vegetables, prepared food items, and subscription-based delivery plans. Due to the nature of these products, availability may vary based on seasonality, sourcing conditions, and operational factors.
            <br /><br />
            Products are natural and may show variations in size, color, texture, and appearance. Such variations are inherent and do not constitute defects.
          </div>

          {/* 3. Account Registration & Eligibility */}
          <div id="part3" className="legal-section">
            <span className="glow-heading">3. Account Registration & Eligibility</span>
            Users must be at least <strong style={{ color: THEME.primary }}>18 years of age</strong> to use the platform. Account registration is required to place orders, and users must provide accurate and complete information at all times.
            <br /><br />
            Users are responsible for maintaining the confidentiality of their account credentials. Any misuse, fraudulent activity, or provision of false information may result in suspension or termination of access.
          </div>

          {/* 4. Service Area & Availability */}
          <div id="part4" className="legal-section">
            <span className="glow-heading">4. Service Area & Availability</span>
            Divasa Fresh operates within selected serviceable areas. Availability of services, products, and delivery slots may vary based on location, demand, and operational feasibility.
            <br /><br />
            The company reserves the right to modify, expand, or restrict service areas based on business and logistical considerations.
          </div>

          {/* 5. Orders & Acceptance */}
          <div id="part5" className="legal-section">
            <span className="glow-heading">5. Orders & Acceptance</span>
            Orders are considered confirmed only after successful placement and, where applicable, payment authorization. Divasa Fresh reserves the right to accept, decline, or cancel orders due to reasons including stock unavailability, operational constraints, or incorrect information.
            <br /><br />
            Customers are responsible for verifying order details before confirmation.
          </div>

          {/* 6. Pricing, Charges & Taxes */}
          <div id="part6" className="legal-section">
            <span className="glow-heading">6. Pricing, Charges & Taxes</span>
            All prices are displayed in <strong style={{ color: THEME.primary }}>Indian Rupees (INR)</strong> and may change based on market conditions and procurement costs. Delivery charges, handling fees will be clearly shown at checkout.
            <br /><br />
            Users agree to pay the total amount displayed at the time of order confirmation.
          </div>

          {/* 7. Delivery & Transfer of Risk */}
          <div id="part7" className="legal-section">
            <span className="glow-heading">7. Delivery & Transfer of Risk</span>
            Delivery timelines are indicative and may vary based on operational factors such as traffic, weather, and order volume. Customers must be available at the delivery location to receive the order.
            <br /><br />
            Risk and responsibility for the products transfer to the customer upon successful delivery. Divasa Fresh is not responsible for issues arising after delivery due to improper handling or storage.
          </div>

          {/* 8. Product Quality & Inspection */}
          <div id="part8" className="legal-section">
            <span className="glow-heading">8. Product Quality & Inspection</span>
            Customers are expected to inspect products at the time of delivery. Any concerns related to quality or condition must be reported within the time specified in the Refund Policy.
            <br /><br />
            Due to the natural nature of products, minor variations or cosmetic differences do not qualify as defects.
          </div>

          {/* 9. Cancellation & Refunds */}
          <div id="part9" className="legal-section">
            <span className="glow-heading">9. Cancellation & Refunds</span>
            Orders may be cancelled before they are processed or dispatched. Once dispatched, cancellation may not be possible.
            <br /><br />
            All refunds and cancellations are governed by the <strong style={{ color: THEME.accent }}>Refund & Cancellation Policy</strong> available on the platform. Where applicable, subscription refunds may be processed on a prorated basis for unused deliveries.
          </div>

          {/* 10. Subscription Services */}
          <div id="part10" className="legal-section">
            <span className="glow-heading">10. Subscription Services</span>
            Subscription plans operate on scheduled delivery cycles. Customers must follow specified timelines for modifications or cancellations.
            <br /><br />
            Failure to receive deliveries due to customer unavailability may result in forfeiture of that delivery. Subscription pricing and availability may change over time.
          </div>

          {/* 11. Payments */}
          <div id="part11" className="legal-section">
            <span className="glow-heading">11. Payments</span>
            Payments can be made through available payment methods such as <strong style={{ color: THEME.accent }}>UPI, cards,</strong> or other supported modes. Orders are confirmed only after successful payment authorization.
            <br /><br />
            Divasa Fresh is not responsible for payment failures caused by banks or payment gateways.
          </div>

          {/* 12. User Conduct */}
          <div id="part12" className="legal-section">
            <span className="glow-heading">12. User Conduct</span>
            Users agree to use the platform responsibly and not engage in fraudulent activity, misuse of offers, abusive behavior, or disruption of services.
            <br /><br />
            Divasa Fresh reserves the right to restrict or suspend access in case of policy violations or misuse.
          </div>

          {/* 13. Promotions & Offers */}
          <div id="part13" className="legal-section">
            <span className="glow-heading">13. Promotions & Offers</span>
            Promotional offers, discounts, and loyalty programs are subject to specific terms and may be modified or withdrawn at any time.
            <br /><br />
            Misuse of promotional benefits, including creating multiple accounts or exploiting offers, may result in disqualification or account action.
          </div>

          {/* 14. Institutional & Bulk Orders */}
          <div id="part14" className="legal-section">
            <span className="glow-heading">14. Institutional & Bulk Orders</span>
            Divasa Fresh may provide services to bulk or institutional customers under separate terms. Pricing, delivery schedules, and payment conditions may vary for such orders.
            <br /><br />
            Failure to comply with agreed terms may result in suspension of services.
          </div>

          {/* 15. Limitation of Liability */}
          <div id="part15" className="legal-section">
            <span className="glow-heading">15. Limitation of Liability</span>
            Divasa Fresh's liability is limited to the value of the affected order. The company shall not be liable for indirect or consequential losses, including delays caused by external factors.
            <br /><br />
            No liability shall arise for issues occurring after delivery due to improper storage or handling by the customer.
          </div>

          {/* 16. Data & Communication */}
          <div id="part16" className="legal-section">
            <span className="glow-heading">16. Data & Communication</span>
            By using the platform, users consent to receive service-related communication via phone, SMS, email, or messaging platforms.
            <br /><br />
            User data is used for operational and service purposes and is handled in accordance with applicable laws.
          </div>

          {/* 17. Intellectual Property */}
          <div id="part17" className="legal-section">
            <span className="glow-heading">17. Intellectual Property</span>
            All content, branding, and materials on the platform are the property of Divasa Fresh. Unauthorized use, copying, or reproduction is strictly prohibited.
          </div>

          {/* 18. Force Majeure */}
          <div id="part18" className="legal-section">
            <span className="glow-heading">18. Force Majeure</span>
            Divasa Fresh shall not be liable for delays or failure to perform obligations due to events beyond reasonable control, including natural disasters, government actions, or supply disruptions.
          </div>

          {/* 19. Governing Law & Jurisdiction */}
          <div id="part19" className="legal-section">
            <span className="glow-heading">19. Governing Law & Jurisdiction</span>
            These Terms shall be governed by the <strong style={{ color: THEME.primary }}>laws of India</strong>. Any disputes arising from these Terms shall be subject to the jurisdiction of courts located in <strong style={{ color: THEME.primary }}>Bengaluru, Karnataka</strong>.
          </div>

          {/* 20. Contact Information */}
          <div id="part20" className="legal-section">
            <span className="glow-heading">20. Contact Information</span>
            For any queries, support, or concerns:
            <br /><br />
            <div style={{
              background: "rgba(31, 170, 89, 0.08)",
              border: "1px solid rgba(31, 170, 89, 0.2)",
              borderRadius: "12px",
              padding: "24px 28px",
              marginTop: "8px",
              lineHeight: "2.2"
            }}>
              <strong style={{ color: THEME.primary, display: "block", marginBottom: "8px", fontSize: "15px" }}>Divasa Fresh Customer Support</strong>
              📞 Phone / WhatsApp: <strong style={{ color: THEME.accent }}>+91 9900152573</strong><br />
              ✉️ Email: <a href="mailto:support@divasafresh.in" style={{ color: THEME.primary, textDecoration: "none" }}>support@divasafresh.in</a><br />
              🌐 Website: <a href="https://www.divasafresh.in" target="_blank" rel="noopener noreferrer" style={{ color: THEME.primary, textDecoration: "none" }}>www.divasafresh.in</a><br />
              📍 Business Location: Bengaluru, Karnataka, India
            </div>
            <br />
            Divasa Fresh will make reasonable efforts to respond within appropriate timelines.
          </div>

          {/* 21. Updates to Terms */}
          <div id="part21" className="legal-section">
            <span className="glow-heading">21. Updates to Terms</span>
            Divasa Fresh may update these Terms from time to time. Continued use of the platform after updates constitutes acceptance of the revised Terms.
            <br /><br />
            Customers are encouraged to review this policy periodically to remain informed about their rights and obligations.
          </div>

        </div>
      </main>
    </div>
  );
};

export default Terms;