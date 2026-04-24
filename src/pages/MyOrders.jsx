import { useEffect, useState } from "react";
import api, { getAssetCandidates, resolveImagePath } from "../services/api";
import { useNavigate } from "react-router-dom";
import { computeOrderTotals, formatPrice, getReferenceMarketPrice } from "../utils/pricing";
import AccountSidebar from "../components/AccountSidebar";
import Header from "../components/Header";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [user] = useState(() =>
    JSON.parse(localStorage.getItem("divasa_user"))
  );

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    if (!user?.phone) { setLoading(false); return; }
    api.get(`/orders/user/${user.phone}`)
      .then((res) => { setOrders(res.data); setLoading(false); })
      .catch((err) => { console.error("Order fetch error:", err); setLoading(false); });
  }, [user?.phone]);

  const handleReorder = (order) => {
    const reorderedItems = order.items.map((item) => ({
      productId: item.productId, variantId: item.variantId,
      quantity: item.quantity, price: item.price,
      name: item.productName, image: resolveImagePath(item),
    }));
    localStorage.setItem("divasa_cart", JSON.stringify(reorderedItems));
    navigate("/cart");
  };

  const confirmCancel = async () => {
    try {
      await api.put(`/orders/${selectedOrderId}/cancel`);
      setOrders((prev) => prev.map((order) =>
        order._id === selectedOrderId ? { ...order, status: "cancelled" } : order
      ));
      setShowCancelModal(false);
      setSelectedOrderId(null);
      alert("Order cancelled successfully");
    } catch (err) { alert("Failed to cancel order"); }
  };

  if (!user) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <h2>Please login to view your orders.</h2>
        <button onClick={() => navigate("/")} style={{ ...modalPrimaryBtn, background: "#000", marginTop: 20 }}>Go to Home</button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .db-wrap { flex-direction: column !important; padding-top: 136px !important; }
          .db-sidebar {
            width: 100% !important; height: auto !important;
            position: relative !important; top: auto !important;
            border-right: none !important; border-bottom: 1px solid #e5e7eb !important;
            padding: 12px 0 0 0 !important;
          }
          .db-sidebar-phone { padding: 0 16px 8px !important; font-size: 13px !important; }
          .db-nav { flex-direction: row !important; overflow-x: auto !important; padding: 0 8px 10px !important; gap: 4px !important; scrollbar-width: none !important; }
          .db-nav::-webkit-scrollbar { display: none; }
          .db-nav > div { padding: 7px 12px !important; font-size: 12px !important; white-space: nowrap !important; border-radius: 20px !important; border-right: none !important; background: #f9fafb !important; flex-shrink: 0 !important; }
          .db-main { padding: 16px !important; }
          .order-card { padding: 14px !important; }
          .order-card-imgs { gap: 6px !important; }
          .order-card-imgs img { width: 44px !important; height: 44px !important; }
          .order-actions { flex-wrap: wrap !important; gap: 8px !important; }
          .back-home-btn { padding: 10px 16px !important; font-size: 13px !important; }
        }
      `}</style>
      <Header />

      <div className="db-wrap" style={dashboardContainer}>
        <AccountSidebar user={user} activePath="/my-orders" />

        {/* MAIN */}
        <div className="db-main" style={mainContentArea}>
          <div style={{ width: "100%", maxWidth: 800 }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px", color: "#1f2937" }}>My Orders</h2>

            {loading ? (
              <p>Loading your orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#666", marginBottom: 20 }}>No orders found yet.</p>
                <button onClick={() => navigate("/")} style={reorderBtnStyle}>Start Shopping</button>
              </div>
            ) : (
              orders.map((order) => {
                const statusColors = { new: "#f59e0b", packed: "#3b82f6", out_for_delivery: "#8b5cf6", delivered: "#16a34a", cancelled: "#ef4444" };
                const totals = computeOrderTotals(order);
                const marketTotal = getReferenceMarketPrice(totals.grandTotal);
                return (
                  <div key={order._id} className="order-card" onClick={() => navigate(`/orders/${order._id}`)} style={orderCardStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Order #{order._id.slice(-6).toUpperCase()}</p>
                        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, margin: 0 }}>{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ background: statusColors[order.status] || "#ccc", color: "#fff", padding: "4px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "capitalize", marginBottom: 6, display: "inline-block" }}>
                          {order.status.replaceAll("_", " ")}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                          {marketTotal ? (
                            <div style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", fontWeight: 600 }}>
                              ₹{formatPrice(marketTotal)}
                            </div>
                          ) : null}
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>₹{formatPrice(totals.grandTotal)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="order-card-imgs" style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
                      {order.items.slice(0, 4).map((item, i) => {
                        const candidates = getAssetCandidates(resolveImagePath(item));
                        const first = candidates[0] || "/vite.svg";
                        return (
                          <img
                            key={i}
                            src={first}
                            alt="product"
                            style={productImgStyle}
                            data-fallback-index="0"
                            onError={(e) => {
                              const idx = Number(e.currentTarget.dataset.fallbackIndex || "0");
                              const next = candidates[idx + 1];
                              if (next) {
                                e.currentTarget.dataset.fallbackIndex = String(idx + 1);
                                e.currentTarget.src = next;
                                return;
                              }
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/vite.svg";
                            }}
                          />
                        );
                      })}
                      {order.items.length > 4 && <div style={moreItemsBadge}>+{order.items.length - 4}</div>}
                    </div>

                    <div className="order-actions" style={{ display: "flex", gap: 12 }}>
                      <button onClick={(e) => { e.stopPropagation(); handleReorder(order); }} style={reorderBtnStyle}>Reorder</button>
                      {(order.status === "new" || order.status === "packed") && (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order._id); setShowCancelModal(true); }} style={cancelBtnStyle}>Cancel Order</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CANCEL MODAL */}
        {showCancelModal && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Cancel Order?</h3>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "25px" }}>Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => setShowCancelModal(false)} style={modalSecondaryBtn}>Keep Order</button>
                <button onClick={confirmCancel} style={modalPrimaryBtn}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const dashboardContainer = { display: "flex", minHeight: "calc(100vh - 78px)", background: "#f9fafb", paddingTop: "78px" };
const sidebarStyle = { width: "280px", background: "#fff", borderRight: "1px solid #e5e7eb", padding: "40px 0", position: "sticky", top: 0, height: "100vh" };
const mainContentArea = { flex: 1, padding: "40px 60px", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "flex-start" };
const navStyle = { display: "flex", flexDirection: "column" };
const navItem = { padding: "14px 25px", cursor: "pointer", fontSize: "15px", color: "#4b5563", transition: "0.2s", fontWeight: "500" };
const activeNavItem = { ...navItem, background: "#f0fdf4", color: "#16a34a", fontWeight: "700", borderRight: "4px solid #16a34a" };
const orderCardStyle = { background: "#fff", padding: "20px", borderRadius: "16px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #f3f4f6", transition: "all 0.2s ease", cursor: "pointer", width: "100%" };
const productImgStyle = { width: "55px", height: "55px", objectFit: "cover", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#f8fafc" };
const moreItemsBadge = { width: "55px", height: "55px", borderRadius: "12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#64748b", border: "1px solid #e2e8f0" };
const reorderBtnStyle = { padding: "10px 24px", borderRadius: "10px", border: "1px solid #16a34a", background: "#fff", color: "#16a34a", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
const cancelBtnStyle = { padding: "10px 24px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fff", color: "#ef4444", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const modalContent = { background: "#fff", padding: "30px", borderRadius: "20px", width: "100%", maxWidth: "400px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" };
const modalPrimaryBtn = { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#ef4444", color: "#fff", fontWeight: "600", cursor: "pointer" };
const modalSecondaryBtn = { padding: "10px 20px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#f9fafb", color: "#4b5563", fontWeight: "600", cursor: "pointer" };
