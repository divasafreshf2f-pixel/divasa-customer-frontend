import { useNavigate } from "react-router-dom";
import AccountSidebar from "../components/AccountSidebar";
import Header from "../components/Header";

const DB_MOBILE = `
@media (max-width: 768px) {
  .db-wrap { flex-direction: column !important; padding-top: 136px !important; }
  .db-sidebar { width: 100% !important; height: auto !important; position: relative !important; top: auto !important; border-right: none !important; border-bottom: 1px solid #e5e7eb !important; padding: 12px 0 0 0 !important; }
  .db-nav { flex-direction: row !important; overflow-x: auto !important; padding: 0 8px 10px !important; gap: 4px !important; scrollbar-width: none !important; }
  .db-nav::-webkit-scrollbar { display: none; }
  .db-nav > div { padding: 7px 12px !important; font-size: 12px !important; white-space: nowrap !important; border-radius: 20px !important; border-right: none !important; background: #f9fafb !important; flex-shrink: 0 !important; }
  .db-main { padding: 16px !important; }
}
`;

export default function FAQs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("divasa_user"));

  const faqData = [
    { q: "How do I earn stamps?", a: "Place any order above ₹299 to earn 1 stamp automatically on your Loyalty Card." },
    { q: "What is the 'D' symbol on my card?", a: "The 'D' symbol represents a completed stamp. Collect 5 to unlock your reward!" },
    { q: "How do I redeem my free Veg Combo?", a: "Once you have 5 stamps, a 'Redeem' button will appear in your Loyalty section." },
    { q: "When will my order be delivered?", a: "Most orders are delivered within 30-60 minutes depending on your location." },
    { q: "Can I edit my saved addresses?", a: "Yes, go to 'Saved Addresses' and click the three dots menu on any address to edit or delete it." }
  ];

  if (!user) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <h2>Please login to view FAQ's.</h2>
        <button onClick={() => navigate("/")} style={shopNowBtn}>Go to Home</button>
      </div>
    );
  }

  return (
    <>
      <style>{DB_MOBILE}</style>
      <Header />
      <div className="db-wrap" style={dashboardContainer}>
        <AccountSidebar user={user} activePath="/faqs" />

        <div className="db-main" style={mainContentArea}>
          <div style={{ width: "100%", maxWidth: 700 }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px", color: "#1f2937" }}>Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {faqData.map((item, index) => (
                <div key={index} style={faqCard}>
                  <p style={faqQuestion}>{item.q}</p>
                  <p style={faqAnswer}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
                </div>

      </div>
    </>
  );
}

const dashboardContainer = { display: "flex", minHeight: "calc(100vh - 78px)", background: "#f9fafb", paddingTop: "78px" };
const sidebarStyle = { width: "280px", background: "#fff", borderRight: "1px solid #e5e7eb", padding: "40px 0", position: "sticky", top: 0, height: "100vh" };
const mainContentArea = { flex: 1, padding: "40px 60px" };
const navStyle = { display: "flex", flexDirection: "column" };
const navItem = { padding: "14px 25px", cursor: "pointer", fontSize: "15px", color: "#4b5563", fontWeight: "500" };
const activeNavItem = { ...navItem, background: "#f0fdf4", color: "#16a34a", fontWeight: "700", borderRight: "4px solid #16a34a" };
const faqCard = { background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" };
const faqQuestion = { margin: "0 0 8px 0", fontWeight: "700", color: "#16a34a", fontSize: "15px" };
const faqAnswer = { margin: 0, color: "#64748b", fontSize: "14px", lineHeight: "1.6" };
const shopNowBtn = { padding: "12px 25px", background: "#16a34a", color: "#fff", borderRadius: "10px", border: "none", cursor: "pointer" };
