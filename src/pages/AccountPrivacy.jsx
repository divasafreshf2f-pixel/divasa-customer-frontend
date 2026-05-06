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

export default function AccountPrivacy() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("divasa_user"));

  if (!user) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <h2>Please login to view Account Privacy.</h2>
        <button onClick={() => navigate("/")} style={shopNowBtn}>Go to Home</button>
      </div>
    );
  }

  return (
    <>
      <style>{DB_MOBILE}</style>
      <Header />
      <div className="db-wrap" style={dashboardContainer}>
        <AccountSidebar user={user} activePath="/account-privacy" />

        <div className="db-main" style={mainContentArea}>
          <div style={{ width: "100%", maxWidth: 700 }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px", color: "#1f2937" }}>Account Privacy</h2>
            <div style={privacyContentCard}>
              <div style={iconHeader}>🛡️</div>
              <p style={privacyText}>
                At <b>Divasa Fresh</b>, we are committed to protecting your personal information and maintaining transparency in how your data is handled.
                We collect only the information necessary to process orders, manage deliveries, and provide customer support.
              </p>

              <p style={privacyText}>
                Your data is handled securely and is <b>never sold, rented, or traded</b> to any third parties. We may share limited data only with trusted service providers such as payment gateways (Cashfree) and OTP/messaging services (MSG91) strictly for operational purposes. We do not store your full debit or credit card details.
              </p>

              <p style={privacyText}>
                Users have full control over their data. You may request access, correction, or deletion of your personal information by contacting us at <b>contact@divasafresh.in</b>. Please include your registered phone number or email for verification.
                Requests are processed within a reasonable timeframe, subject to legal and operational requirements.
              </p>

              <p style={privacyText}>
                By using our platform, you explicitly agree to our Privacy Policy and Terms of Service, including the collection and use of data as described.
              </p>

              <p style={privacyText}>
                For complete details, please refer to our full Privacy Policy available on our website.
              </p>
              <div style={footerNote}>Last updated: May 2, 2026</div>
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
const privacyContentCard = { background: "#fff", padding: "40px", borderRadius: "20px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const iconHeader = { fontSize: "40px", marginBottom: "20px" };
const privacyText = { fontSize: "15px", color: "#4b5563", lineHeight: "1.8", marginBottom: "20px" };
const footerNote = { marginTop: "30px", fontSize: "12px", color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: "20px" };
const shopNowBtn = { padding: "12px 25px", background: "#16a34a", color: "#fff", borderRadius: "10px", border: "none", cursor: "pointer" };