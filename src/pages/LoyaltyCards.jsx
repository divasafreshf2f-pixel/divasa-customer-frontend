import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
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
  .loyalty-card-wrap { padding: 20px !important; }
  .stamp-slot { width: 44px !important; height: 44px !important; }
}
`;

export default function LoyaltyCards() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("divasa_user"));

  useEffect(() => {
    if (user?.phone) {
      api.get(`/orders/user/${user.phone}`)
        .then((res) => {
          const qualifiedOrders = res.data.filter((order) => order.status === "delivered" && order.totalAmount >= 299);
          setOrders(qualifiedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else { setLoading(false); }
  }, [user?.phone]);

  const completedCount = orders.length % 5;
  const totalSlots = 5;
  const displayCount = (completedCount === 0 && orders.length > 0) ? 5 : completedCount;

  if (!user) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <h2>Please login to view your rewards.</h2>
        <button onClick={() => navigate("/")} style={shopNowBtn}>Go to Home</button>
      </div>
    );
  }

  return (
    <>
      <style>{DB_MOBILE}</style>
      <Header />
      <div className="db-wrap" style={dashboardContainer}>
        <AccountSidebar user={user} activePath="/loyalty-cards" />

        <div className="db-main" style={mainContentArea}>
          <div style={{ width: "100%", maxWidth: 600 }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px", color: "#1f2937" }}>My Rewards</h2>

            {loading ? (
              <p>Loading your card...</p>
            ) : (
              <>
                <div className="loyalty-card-wrap" style={loyaltyCardStyle}>
                  <div style={cardHeader}>
                    <div style={logoCircle}>🥬</div>
                    <div>
                      <h3 style={cardTitle}>DIVASA FRESH</h3>
                      <p style={cardSubtitle}>Fresh Rewards Card</p>
                    </div>
                  </div>
                  <div style={instructionBox}>Order above ₹299 to earn a stamp. Collect 5 stamps to get a <b>₹299 Veg Combo FREE!</b> 🎁</div>
                  <div style={stampRow}>
                    {[...Array(totalSlots)].map((_, index) => {
                      const isStamped = index < displayCount;
                      return (
                        <div key={index} className="stamp-slot" style={isStamped ? stampedSlot : emptySlot}>
                          {isStamped ? <span style={{ fontSize: "20px" }}>🥬</span> : <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: "bold" }}>{index + 1}</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={cardFooter}>
                    {displayCount === 5 ? <div style={unlockedTag}>🎉 REWARD UNLOCKED!</div> : <div style={progressText}>{displayCount} / 5 Stamps Collected</div>}
                  </div>
                </div>

                {displayCount === 5 && (
                  <div style={redeemBox}>
                    <p style={{ margin: "0 0 10px 0", fontWeight: "600", color: "#065f46" }}>Congratulations! Your ₹299 Veg Combo is ready.</p>
                    <button style={redeemBtn}>Redeem Now</button>
                  </div>
                )}

                <div style={{ marginTop: "40px" }}>
                  <h4 style={{ fontSize: "16px", color: "#4b5563", marginBottom: "15px" }}>Stamp History</h4>
                  {orders.length === 0 ? (
                    <p style={{ fontSize: "14px", color: "#94a3b8" }}>No stamps earned yet. Place an order above ₹299!</p>
                  ) : (
                    <div style={historyList}>
                      {orders.slice(0, 5).map((order, idx) => (
                        <div key={order._id} style={historyItem}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={miniStamp}>🥬</div>
                            <div>
                              <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>Stamp #{orders.length - idx}</p>
                              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div style={{ fontWeight: "700", color: "#16a34a" }}>₹{order.totalAmount}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
       </div>
    </>
  );
}

const dashboardContainer = { display: "flex", minHeight: "calc(100vh - 78px)", background: "#f9fafb", paddingTop: "78px" };
const sidebarStyle = { width: "280px", background: "#fff", borderRight: "1px solid #e5e7eb", padding: "40px 0", position: "sticky", top: 0, height: "100vh" };
const mainContentArea = { flex: 1, padding: "40px 60px", display: "flex", flexDirection: "column", alignItems: "flex-start" };
const navStyle = { display: "flex", flexDirection: "column" };
const navItem = { padding: "14px 25px", cursor: "pointer", fontSize: "15px", color: "#4b5563", fontWeight: "500" };
const activeNavItem = { ...navItem, background: "#f0fdf4", color: "#16a34a", fontWeight: "700", borderRight: "4px solid #16a34a" };
const loyaltyCardStyle = { background: "linear-gradient(135deg, #16a34a 0%, #065f46 100%)", borderRadius: "24px", padding: "30px", color: "#fff", boxShadow: "0 20px 25px -5px rgba(22, 163, 74, 0.2)", position: "relative" };
const cardHeader = { display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" };
const logoCircle = { width: "50px", height: "50px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" };
const cardTitle = { margin: 0, fontSize: "20px", fontWeight: "800", letterSpacing: "1px" };
const cardSubtitle = { margin: 0, fontSize: "13px", opacity: 0.8 };
const instructionBox = { background: "rgba(255,255,255,0.12)", padding: "15px", borderRadius: "14px", fontSize: "13px", lineHeight: "1.5", marginBottom: "30px", border: "1px solid rgba(255,255,255,0.1)" };
const stampRow = { display: "flex", justifyContent: "space-between", gap: "8px" };
const emptySlot = { width: "55px", height: "55px", borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" };
const stampedSlot = { width: "55px", height: "55px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" };
const cardFooter = { marginTop: "30px", textAlign: "center" };
const progressText = { fontSize: "14px", fontWeight: "700" };
const unlockedTag = { background: "#fbbf24", color: "#000", padding: "8px 24px", borderRadius: "20px", fontWeight: "900", fontSize: "13px" };
const historyList = { background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden", width: "100%" };
const historyItem = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid #f1f5f9" };
const miniStamp = { width: "32px", height: "32px", background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", border: "1px solid #dcfce7" };
const redeemBox = { marginTop: "20px", padding: "25px", background: "#fff", borderRadius: "16px", border: "2px solid #fbbf24", textAlign: "center", width: "100%" };
const redeemBtn = { background: "#16a34a", color: "#fff", border: "none", padding: "12px 40px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" };
const shopNowBtn = { padding: "12px 25px", background: "#16a34a", color: "#fff", borderRadius: "10px", border: "none", cursor: "pointer", marginTop: "20px" };
