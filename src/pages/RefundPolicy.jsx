import React, { useEffect, useState } from "react";

const RefundPolicy = () => {
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
      const sections = Array.from({ length: 14 }, (_, i) => `part${i + 1}`);
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
            {["🍎", "🥭", "🍋", "🥬", "🍓", "🥦"][i % 6]}
          </div>
        ))}
      </div>

      {/* HERO */}
      <section className="legal-hero" style={{ padding: "120px 5% 40px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, color: THEME.primary, marginBottom: "8px" }}>
          Refund & Cancellation Policy
        </h1>
        <p style={{ color: THEME.textMuted, fontSize: "13px", letterSpacing: "1px", fontWeight: 600 }}>
          DIVASA FRESH | EFFECTIVE DATE: APRIL 16, 2026 | LAST UPDATED: APRIL 16, 2026
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
            "Nature of Products",
            "Order Cancellation",
            "Refund Eligibility",
            "Non-Refundable Situations",
            "Subscription Refunds",
            "Replacement Policy",
            "Refund Processing",
            "Payment & Transaction Charges",
            "Customer Responsibilities",
            "Fair Usage & Abuse Prevention",
            "Limitation of Liability",
            "Contact Information",
            "Compliance",
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

          {/* 1. Nature of Products */}
          <div id="part1" className="legal-section">
            <span className="glow-heading">1. Nature of Products</span>
            Divasa Fresh is committed to delivering high-quality fresh food products, including fruits, vegetables, meal bowls, and subscription-based services. Due to the perishable nature of many of our offerings, this Refund & Cancellation Policy is designed to ensure transparency, fairness, and compliance with applicable consumer protection standards and payment gateway guidelines.
            <br /><br />
            By placing an order on the Divasa Fresh platform, customers agree to the terms outlined in this policy.
            <br /><br />
            Divasa Fresh deals in fresh, perishable, and made-to-order food items, including but not limited to:
            <ul style={{ marginTop: "15px", listStyleType: "circle", paddingLeft: "20px", lineHeight: "2" }}>
              <li>Fresh fruits and vegetables</li>
              <li>Fruit cups, bowls, and salads</li>
              <li>Healthy meals and prepared food items</li>
              <li>Subscription-based delivery plans</li>
              <li>Bulk and scheduled supply orders</li>
            </ul>
            <br />
            Due to the time-sensitive and consumable nature of these products, returns are not accepted once delivered. However, refunds or replacements may be provided under specific conditions outlined in this policy.
          </div>

          {/* 2. Order Cancellation */}
          <div id="part2" className="legal-section">
            <span className="glow-heading">2. Order Cancellation Policy</span>

            <strong style={{ color: THEME.accent, fontSize: "15px" }}>2.1 On-Demand Orders</strong>
            <br />
            Orders may be cancelled only before they enter the processing stage. Once an order is marked as{" "}
            <strong style={{ color: THEME.primary }}>"Packed," "Ready for Dispatch," or "Out for Delivery,"</strong>{" "}
            cancellation is not permitted.

            <br /><br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>2.2 Subscription Orders</strong>
            <br />
            Subscription orders are planned and scheduled in advance. To cancel or modify a subscription delivery, requests must be submitted at least{" "}
            <strong style={{ color: THEME.primary }}>72 hours (3 days)</strong> before the scheduled delivery. Requests received after this time window may not affect the upcoming delivery.
          </div>

          {/* 3. Refund Eligibility */}
          <div id="part3" className="legal-section">
            <span className="glow-heading">3. Refund Eligibility</span>
            Refunds will be processed only in genuine and verified cases, including:
            <ul style={{ marginTop: "15px", listStyleType: "circle", paddingLeft: "20px", lineHeight: "2" }}>
              <li>Incorrect items delivered</li>
              <li>Missing items from the order</li>
              <li>Products that are damaged, spoiled, or unfit for consumption at the time of delivery</li>
              <li>Orders not delivered due to operational issues attributable to Divasa Fresh</li>
              <li>All refund requests are subject to internal verification and approval.</li>
            </ul>
            <br />
            Customers must report issues within <strong style={{ color: THEME.primary }}>4 hours of delivery</strong>; earlier reporting is recommended for faster resolution.
            <br /><br />
            Supporting evidence such as photos or videos may be required for verification. All approved refunds will be processed in a fair, transparent, and legally compliant manner.
          </div>

          {/* 4. Non-Refundable Situations */}
          <div id="part4" className="legal-section">
            <span className="glow-heading">4. Non-Refundable Situations</span>
            Refunds will not be applicable in situations arising due to customer-related issues, including:

            <br /><br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>4.1 Incorrect or Incomplete Delivery Details</strong>
            <br />
            If the customer provides an incorrect address, unreachable contact, or incomplete delivery information, Divasa Fresh cannot be held responsible for failed deliveries.

            <br /><br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>4.2 Customer Unavailability During Delivery</strong>
            <br />
            If the customer is not available at the delivery location and cannot be reached within a reasonable time, the order may be marked as delivered and may not qualify for a refund.

            <br /><br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>4.3 Requests Made After the Reporting Window</strong>
            <br />
            Complaints raised after the allowed reporting window of <strong style={{ color: THEME.primary }}>4 hours post-delivery</strong> are not eligible for a refund due to the perishable nature of fresh food products.

            <br /><br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>4.4 Cancellation After Processing or Dispatch</strong>
            <br />
            Orders cancelled after they have been packed, dispatched, or are out for delivery are not eligible for a refund.

            <br /><br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>4.5 Personal Taste or Preference</strong>
            <br />
            Dissatisfaction based on personal taste or dietary preference does not qualify as a valid refund reason.

            <br /><br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>4.6 Natural Product Variations</strong>
            <br />
            Natural variations in size, color, or appearance that do not affect product quality are not grounds for a refund.

            <br /><br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>4.7 External Delivery Delays</strong>
            <br />
            Delivery delays caused by factors beyond reasonable control — such as traffic, weather, or unforeseen operational constraints — are not refundable.
          </div>

          {/* 5. Subscription Refund Policy */}
          <div id="part5" className="legal-section">
            <span className="glow-heading">5. Subscription Refund Policy</span>
            Subscription services involve advance planning, procurement, and logistics. If a subscription is cancelled before completion:
            <br /><br />
            <div style={{
              background: "rgba(31, 170, 89, 0.08)",
              border: "1px solid rgba(31, 170, 89, 0.2)",
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "20px",
              fontFamily: "monospace",
              fontSize: "15px"
            }}>
              <strong style={{ color: THEME.accent }}>Refund Amount</strong>{" "}
              <span style={{ color: THEME.textMain }}>=</span>{" "}
              <strong style={{ color: THEME.primary }}>Total Amount Paid</strong>{" "}
              <span style={{ color: THEME.textMain }}>–</span>{" "}
              <strong style={{ color: THEME.primary }}>(Deliveries Completed × Standard Per-Delivery Rate)</strong>
            </div>

            Key conditions:
            <ul style={{ marginTop: "15px", listStyleType: "circle", paddingLeft: "20px", lineHeight: "2" }}>
              <li>Refunds apply only to <strong style={{ color: THEME.primary }}>unused deliveries</strong></li>
              <li>Completed deliveries are charged at the <strong style={{ color: THEME.primary }}>standard per-delivery rate</strong> applicable to the plan</li>
              <li>Promotional pricing, discounts, or bundled offers <strong style={{ color: THEME.primary }}>may be adjusted or recalculated</strong> upon early cancellation</li>
              <li>Refunds will not be issued for completed deliveries</li>
            </ul>
            <br />
            <strong style={{ color: THEME.accent, fontSize: "15px" }}>Example:</strong>
            <br />
            If 10 deliveries have been completed and each delivery costs ₹120, then ₹1,200 will be deducted, and the remaining balance will be refunded.
          </div>

          {/* 6. Replacement Policy */}
          <div id="part6" className="legal-section">
            <span className="glow-heading">6. Replacement Policy</span>
            In certain situations, a replacement may be offered instead of a refund based on:
            <ul style={{ marginTop: "15px", listStyleType: "circle", paddingLeft: "20px", lineHeight: "2" }}>
              <li>Product availability</li>
              <li>Nature of the issue</li>
              <li>Time of complaint</li>
              <li>Delivery feasibility</li>
            </ul>
            <br />
            Replacement products may be delivered at no additional cost if the complaint is verified and conditions are met.
          </div>

          {/* 7. Refund Processing */}
          <div id="part7" className="legal-section">
            <span className="glow-heading">7. Refund Processing</span>
            <ul style={{ marginTop: "15px", listStyleType: "circle", paddingLeft: "20px", lineHeight: "2" }}>
              <li>Refunds are initiated within <strong style={{ color: THEME.primary }}>24–48 hours</strong> after approval</li>
              <li>Amounts are credited to the <strong style={{ color: THEME.primary }}>original payment method</strong></li>
              <li>Final settlement may take <strong style={{ color: THEME.primary }}>5–7 business days</strong> depending on banking systems</li>
            </ul>
            <br />
            Divasa Fresh is not responsible for delays caused by external financial institutions.
          </div>

          {/* 8. Payment & Transaction Charges */}
          <div id="part8" className="legal-section">
            <span className="glow-heading">8. Payment and Transaction Charges</span>
            Payment gateway or transaction charges may be deducted where applicable, in accordance with payment gateway policies.
            <br /><br />
            No deductions will be made where the refund is due to an error from Divasa Fresh.
            <br /><br />
            All refunds are subject to the timelines and policies of the respective payment gateway and banking partners.
          </div>

          {/* 9. Customer Responsibilities */}
          <div id="part9" className="legal-section">
            <span className="glow-heading">9. Customer Responsibilities</span>
            Customers are expected to:
            <ul style={{ marginTop: "15px", listStyleType: "circle", paddingLeft: "20px", lineHeight: "2" }}>
              <li>Provide accurate delivery details</li>
              <li>Be available at the time of delivery</li>
              <li>Inspect products immediately upon delivery</li>
              <li>Report issues within the specified timeframe</li>
            </ul>
            <br />
            Failure to comply with these responsibilities may impact refund eligibility.
          </div>

          {/* 10. Fair Usage & Abuse Prevention */}
          <div id="part10" className="legal-section">
            <span className="glow-heading">10. Fair Usage and Abuse Prevention</span>
            Divasa Fresh reserves the right to review and investigate refund requests.
            <br /><br />
            Repeated or suspicious claims, misuse of the policy, or false complaints may result in:
            <ul style={{ marginTop: "15px", listStyleType: "circle", paddingLeft: "20px", lineHeight: "2" }}>
              <li>Rejection of refund requests</li>
              <li>Restriction or suspension of services</li>
            </ul>
          </div>

          {/* 11. Limitation of Liability */}
          <div id="part11" className="legal-section">
            <span className="glow-heading">11. Limitation of Liability</span>
            Divasa Fresh's liability is limited to the value of the affected order or product.
            <br /><br />
            The company is not responsible for indirect losses, personal inconvenience, or issues arising after delivery due to improper storage or delayed consumption.
          </div>

          {/* 12. Contact Information */}
          <div id="part12" className="legal-section">
            <span className="glow-heading">12. Contact for Support</span>
            For refund or cancellation requests:
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
            All requests are reviewed and handled within a reasonable timeframe.
          </div>

          {/* 13. Compliance */}
          <div id="part13" className="legal-section">
            <span className="glow-heading">13. Compliance</span>
            Divasa Fresh operates in accordance with applicable consumer protection laws and ensures fair and transparent handling of all refund requests.
          </div>

          {/* 14. Policy Updates */}
          <div id="part14" className="legal-section">
            <span className="glow-heading">14. Policy Updates</span>
            Divasa Fresh reserves the right to update this policy at any time.
            <br /><br />
            Customers are encouraged to review this policy periodically to remain informed about their rights and obligations.
            <br /><br />
            Continued use of the platform constitutes acceptance of the updated policy.
          </div>

        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;