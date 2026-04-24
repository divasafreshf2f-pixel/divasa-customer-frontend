import React, { useEffect, useState } from "react";

const ShippingPolicy = () => {
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
      const sections = Array.from({ length: 19 }, (_, i) => `part${i + 1}`);
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
            {["🚚", "🥭", "🍎", "🥦", "🍋", "🛵"][i % 6]}
          </div>
        ))}
      </div>

      {/* HERO */}
      <section className="legal-hero" style={{ padding: "120px 5% 40px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, color: THEME.primary, marginBottom: "8px" }}>
          Shipping & Delivery Policy
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
            "Order Processing",
            "Delivery Coverage Area",
            "Delivery Types",
            "Delivery Time Windows",
            "Delivery Charges",
            "Order Dispatch",
            "Customer Responsibilities",
            "Delivery Confirmation",
            "Delayed Deliveries",
            "Failed Deliveries",
            "Perishable Products",
            "Subscription Deliveries",
            "Bulk Orders",
            "Hygiene & Safety",
            "Address Changes",
            "Force Majeure",
            "Refund Reference",
            "Contact Information",
            "Policy Updates"
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

        {/* CONTENT */}
        <div className="legal-content" style={{ fontSize: "16px", lineHeight: "1.9", color: "#CBD5E1" }}>

          {/* Intro blurb */}
          <p style={{ color: THEME.textMuted, fontSize: "15px", lineHeight: "1.9", marginBottom: "8px", paddingTop: "40px" }}>
            Divasa Fresh is committed to delivering fresh fruits, vegetables, meals, and subscription-based food products in a timely, hygienic, and reliable manner. Due to the perishable nature of our products, delivery operations are carefully managed to maintain quality and freshness.
          </p>

          {/* ── 1 ── */}
          <div id="part1" className="legal-section">
            <span className="glow-heading">1. Order Processing</span>
            <p>Once an order is placed, it progresses through the following stages:</p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "12px",
              marginTop: "24px",
              marginBottom: "20px"
            }}>
              {[
                { icon: "📥", label: "Order Received" },
                { icon: "💳", label: "Payment Verified" },
                { icon: "✅", label: "Confirmed" },
                { icon: "🥗", label: "Preparation" },
                { icon: "🛵", label: "Dispatch" },
                { icon: "🚚", label: "Out for Delivery" },
                { icon: "📦", label: "Delivered" },
              ].map((step, i) => (
                <div key={i} style={{
                  background: "rgba(31, 170, 89, 0.07)",
                  border: "1px solid rgba(31, 170, 89, 0.15)",
                  borderRadius: "10px",
                  padding: "14px 12px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#CBD5E1"
                }}>
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{step.icon}</div>
                  {step.label}
                </div>
              ))}
            </div>

            <p>
              Processing time depends on product type. Fresh produce requires sorting and packing, while prepared meals and fruit bowls are made close to delivery time to ensure freshness and quality.
            </p>
          </div>

          {/* ── 2 ── */}
          <div id="part2" className="legal-section">
            <span className="glow-heading">2. Delivery Coverage Area</span>
            <p>Divasa Fresh delivers within selected service areas based on operational feasibility.</p>
            <p style={{ marginTop: "16px" }}>Delivery availability depends on:</p>
            <ul style={{ marginTop: "12px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Distance from dispatch location</li>
              <li>Delivery partner availability</li>
              <li>Serviceable zones defined by Divasa Fresh</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Customers can check service availability during checkout. Coverage areas may be updated based on operational requirements.
            </p>
          </div>

          {/* ── 3 ── */}
          <div id="part3" className="legal-section">
            <span className="glow-heading">3. Delivery Types</span>
            <p>Divasa Fresh offers multiple delivery options:</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              {[
                {
                  label: "a) Standard Delivery",
                  icon: "⚡",
                  text: "Orders may be delivered within approximately 20 to 40 minutes, depending on distance, order volume, and operational conditions."
                },
                {
                  label: "b) Scheduled Delivery",
                  icon: "📅",
                  text: "Customers may choose a specific delivery date and time slot during checkout. Orders will be delivered within the selected time window."
                },
                {
                  label: "c) Subscription Delivery",
                  icon: "🔄",
                  text: "Subscription orders are delivered based on pre-selected schedules and time slots chosen at the time of subscription."
                }
              ].map((item, i) => (
                <div key={i} style={{
                  background: "rgba(31, 170, 89, 0.07)",
                  border: "1px solid rgba(31, 170, 89, 0.15)",
                  borderRadius: "12px",
                  padding: "20px 24px"
                }}>
                  <div style={{ color: THEME.primary, fontWeight: 700, marginBottom: "8px", fontSize: "15px" }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ color: "#CBD5E1", fontSize: "15px" }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4 ── */}
          <div id="part4" className="legal-section">
            <span className="glow-heading">4. Delivery Time Windows</span>
            <p>Delivery timing depends on:</p>
            <ul style={{ marginTop: "12px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Selected delivery type</li>
              <li>Distance from dispatch point</li>
              <li>Preparation time</li>
              <li>Routing efficiency</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              While Divasa Fresh aims to meet selected delivery windows, slight variations may occur due to real-world conditions.
            </p>
          </div>

          {/* ── 5 ── */}
          <div id="part5" className="legal-section">
            <span className="glow-heading">5. Delivery Charges</span>
            <p>Delivery charges may vary based on:</p>
            <ul style={{ marginTop: "12px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Order value</li>
              <li>Distance</li>
              <li>Subscription plans</li>
              <li>Promotional offers</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              All applicable charges are clearly displayed at checkout before order confirmation.
            </p>
          </div>

          {/* ── 6 ── */}
          <div id="part6" className="legal-section">
            <span className="glow-heading">6. Order Dispatch</span>
            <p>
              Once an order is prepared and packed, it is assigned to a delivery partner and marked as{" "}
              <strong style={{ color: THEME.primary }}>Out for Delivery</strong>.
            </p>
            <p style={{ marginTop: "16px" }}>
              Customers receive delivery updates through the Divasa Fresh application or website dashboard.
            </p>
          </div>

          {/* ── 7 ── */}
          <div id="part7" className="legal-section">
            <span className="glow-heading">7. Customer Responsibilities</span>
            <p>Customers are expected to:</p>
            <ul style={{ marginTop: "12px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Provide accurate delivery address details</li>
              <li>Include building name, flat number, and landmarks</li>
              <li>Be available during the delivery window</li>
              <li>Keep their registered phone accessible</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Customers may also provide receiver details (such as a family member, neighbor, or security personnel) to accept the order on their behalf.
            </p>
          </div>

          {/* ── 8 ── */}
          <div id="part8" className="legal-section">
            <span className="glow-heading">8. Delivery Confirmation</span>
            <p>A delivery is considered complete when:</p>
            <ul style={{ marginTop: "12px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>The order is handed over to the customer or authorized receiver</li>
              <li>The delivery is marked as completed in the system</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Customers are advised to check the items immediately upon delivery.
            </p>
          </div>

          {/* ── 9 ── */}
          <div id="part9" className="legal-section">
            <span className="glow-heading">9. Delayed Deliveries</span>
            <p>Delays may occur due to:</p>
            <ul style={{ marginTop: "12px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Traffic conditions</li>
              <li>Weather conditions</li>
              <li>High order volumes</li>
              <li>Delivery partner availability</li>
              <li>External disruptions</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Divasa Fresh will make reasonable efforts to complete deliveries as quickly as possible.
            </p>
          </div>

          {/* ── 10 ── */}
          <div id="part10" className="legal-section">
            <span className="glow-heading">10. Failed Deliveries</span>
            <p>Delivery attempts may fail due to:</p>
            <ul style={{ marginTop: "12px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Customer unavailability</li>
              <li>Incorrect or incomplete address</li>
              <li>Inability to contact the customer</li>
              <li>Restricted access to the delivery location</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Depending on the situation, orders may be rescheduled or cancelled. Due to the perishable nature of products, repeated delivery attempts may not always be possible.
            </p>
          </div>

          {/* ── 11 ── */}
          <div id="part11" className="legal-section">
            <span className="glow-heading">11. Perishable Products</span>
            <p>
              Most products are fresh and perishable. Customers are advised to consume or store items appropriately after delivery.
            </p>
            <p style={{ marginTop: "16px" }}>
              Divasa Fresh is not responsible for quality issues arising after delivery due to improper storage or delayed consumption.
            </p>
          </div>

          {/* ── 12 ── */}
          <div id="part12" className="legal-section">
            <span className="glow-heading">12. Subscription Deliveries</span>
            <p>Subscription orders are delivered as per the selected schedule:</p>
            <ul style={{ marginTop: "12px", listStyleType: "disc", paddingLeft: "24px", lineHeight: "2.2" }}>
              <li>Daily or periodic deliveries</li>
              <li>Fixed delivery slots</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Changes to subscription deliveries must follow timelines mentioned in the Refund &amp; Cancellation Policy.
            </p>
          </div>

          {/* ── 13 ── */}
          <div id="part13" className="legal-section">
            <span className="glow-heading">13. Bulk Orders</span>
            <p>
              Bulk and institutional orders may follow customized delivery arrangements depending on order size and scheduling requirements.
            </p>
            <p style={{ marginTop: "16px" }}>For bulk inquiries, contact:</p>
            <div style={{
              background: "rgba(31, 170, 89, 0.07)",
              border: "1px solid rgba(31, 170, 89, 0.15)",
              borderRadius: "12px",
              padding: "20px 24px",
              marginTop: "16px"
            }}>
              📧{" "}
              <a href="mailto:support@divasafresh.in" style={{ color: THEME.primary, textDecoration: "none" }}>
                support@divasafresh.in
              </a>
            </div>
          </div>

          {/* ── 14 ── */}
          <div id="part14" className="legal-section">
            <span className="glow-heading">14. Hygiene & Safety</span>
            <p>
              All products are handled and packed under hygienic conditions. Delivery partners follow standard safety and handling practices during transportation.
            </p>
          </div>

          {/* ── 15 ── */}
          <div id="part15" className="legal-section">
            <span className="glow-heading">15. Address Changes</span>
            <p>
              Address changes are allowed only before the order is dispatched. Once the order is out for delivery, modifications may not be possible.
            </p>
          </div>

          {/* ── 16 ── */}
          <div id="part16" className="legal-section">
            <span className="glow-heading">16. Force Majeure</span>
            <p>
              Divasa Fresh is not liable for delivery delays or failures caused by events beyond reasonable control, including natural disasters, government restrictions, or operational disruptions.
            </p>
          </div>

          {/* ── 17 ── */}
          <div id="part17" className="legal-section">
            <span className="glow-heading">17. Refund Reference</span>
            <p>
              Refunds and cancellations are governed by the Refund &amp; Cancellation Policy available on the platform.
            </p>
          </div>

          {/* ── 18 ── */}
          <div id="part18" className="legal-section">
            <span className="glow-heading">18. Contact Information</span>
            <p>For delivery-related support:</p>
            <div style={{
              background: "rgba(31, 170, 89, 0.08)",
              border: "1px solid rgba(31, 170, 89, 0.2)",
              borderRadius: "12px",
              padding: "24px 28px",
              marginTop: "20px",
              lineHeight: "2.4"
            }}>
              <strong style={{ color: THEME.primary, display: "block", marginBottom: "8px", fontSize: "15px" }}>Divasa Fresh Customer Support</strong>
              📞{" "}
              <a href="tel:+919900152573" style={{ color: THEME.accent, textDecoration: "none", fontWeight: 700 }}>
                +91 9900152573
              </a>
              <br />
              📧{" "}
              <a href="mailto:support@divasafresh.in" style={{ color: THEME.primary, textDecoration: "none" }}>
                support@divasafresh.in
              </a>
            </div>
          </div>

          {/* ── 19 ── */}
          <div id="part19" className="legal-section">
            <span className="glow-heading">19. Policy Updates</span>
            <p>
              Divasa Fresh may update this policy from time to time. Continued use of the platform constitutes acceptance of the updated policy.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ShippingPolicy;