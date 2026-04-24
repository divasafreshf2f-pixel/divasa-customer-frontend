import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { getAssetCandidates, resolveImagePath } from "../services/api";
import {
  computeOrderTotals,
  formatPrice,
  getOrderDisplayAddress,
  getReferenceMarketPrice,
  getReferenceMarketSubtotal,
} from "../utils/pricing";
import AccountSidebar from "../components/AccountSidebar";

const DB_MOBILE = `
@media (max-width: 768px) {
  .db-wrap { flex-direction: column !important; }
  .db-sidebar { width: 100% !important; height: auto !important; position: relative !important; top: auto !important; border-right: none !important; border-bottom: 1px solid #e5e7eb !important; padding: 12px 0 0 0 !important; }
  .db-nav { flex-direction: row !important; overflow-x: auto !important; padding: 0 8px 10px !important; gap: 4px !important; scrollbar-width: none !important; }
  .db-nav::-webkit-scrollbar { display: none; }
  .db-nav > div { padding: 7px 12px !important; font-size: 12px !important; white-space: nowrap !important; border-radius: 20px !important; border-right: none !important; background: #f9fafb !important; flex-shrink: 0 !important; }
  .db-main { padding: 16px 12px !important; }
  .details-grid { grid-template-columns: 1fr !important; }
  .order-step-text { font-size: 9px !important; }
  .step-dot-inner { width: 22px !important; height: 22px !important; font-size: 10px !important; }
}
`;

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!order) return <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>Loading your order details...</div>;

  const steps = ["new", "packed", "out_for_delivery", "delivered"];
  const currentStepIndex = steps.indexOf(order.status);
  const totals = computeOrderTotals(order);
  const addressLine = getOrderDisplayAddress(order);
  const sidebarUser =
    JSON.parse(localStorage.getItem("divasa_user")) || {
      name: order.customerName || "Customer",
      phone: order.customerPhone || "",
    };

  return (
    <>
      <style>{DB_MOBILE}</style>
      <div className="db-wrap" style={dashboardContainer}>
        <AccountSidebar user={sidebarUser} activePath="/my-orders" />

        {/* MAIN */}
        <div className="db-main" style={mainContentArea}>
          <div style={contentWrapper}>
            <div style={stickyHeader}>
              <button onClick={() => navigate(-1)} style={backCircle}>←</button>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Order #{order._id.slice(-6).toUpperCase()}</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* STATUS TRACKER */}
            <div style={statusCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", overflowX: "auto" }}>
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isLast = index === steps.length - 1;
                  return (
                    <div key={step} style={{ display: "flex", alignItems: "center", flex: isLast ? "none" : 1, minWidth: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                        <div className="step-dot-inner" style={stepDot(isCompleted)}>{isCompleted ? "✓" : index + 1}</div>
                        <span className="order-step-text" style={stepText(isCompleted)}>{step.replaceAll("_", " ")}</span>
                      </div>
                      {!isLast && <div style={stepLine(isCompleted)} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ITEMS */}
            <div style={whiteCard}>
              <h3 style={cardTitle}>Items in this shipment</h3>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {order.items.map((item, index) => (
                  <div key={index} style={itemRow}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      {(() => {
                        const candidates = getAssetCandidates(resolveImagePath(item));
                        return (
                          <img
                            src={candidates[0] || "/vite.svg"}
                            alt={item.productName}
                            style={productImageStyle}
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
                      })()}
                      <div>
                        <p style={itemName}>{item.productName}</p>
                        <p style={itemQty}>{item.quantity} x {item.variantName}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {getReferenceMarketSubtotal(item.price ?? (item.quantity ? item.subtotal / item.quantity : 0), item.quantity) ? (
                        <p style={itemPriceStrike}>
                          ₹{formatPrice(getReferenceMarketSubtotal(item.price ?? (item.quantity ? item.subtotal / item.quantity : 0), item.quantity))}
                        </p>
                      ) : null}
                      <p style={itemPrice}>₹{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BILLING + ADDRESS */}
            <div className="details-grid" style={detailsGrid}>
              <div style={whiteCard}>
                <h3 style={cardTitle}>Bill Details</h3>
                <div style={billRow}><span>Item Total</span><span>₹{formatPrice(totals.itemTotal)}</span></div>
                <div style={billRow}>
                  <span>Delivery Fee</span>
                  <span>{totals.deliveryFee === 0 ? <span style={{ color: "#16a34a" }}>FREE</span> : `₹${formatPrice(totals.deliveryFee)}`}</span>
                </div>
                <div style={billRow}><span>Handling Fee</span><span>₹{formatPrice(totals.handlingFee)}</span></div>
                {totals.bagFee > 0 && <div style={billRow}><span>Carry Bag Fee</span><span>₹{formatPrice(totals.bagFee)}</span></div>}
                {totals.couponDiscount > 0 && <div style={{ ...billRow, color: "#16a34a" }}><span>Coupon Discount</span><span>-₹{formatPrice(totals.couponDiscount)}</span></div>}
                {totals.juiceDiscount > 0 && <div style={{ ...billRow, color: "#16a34a" }}><span>Meal + Juice Offer</span><span>-₹{formatPrice(totals.juiceDiscount)}</span></div>}
                <div style={totalDivider} />
                <div style={totalRow}>
                  <span>Bill Total</span>
                  <span>
                    {getReferenceMarketPrice(totals.grandTotal) ? (
                      <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", marginRight: 8 }}>
                        ₹{formatPrice(getReferenceMarketPrice(totals.grandTotal))}
                      </span>
                    ) : null}
                    ₹{formatPrice(totals.grandTotal)}
                  </span>
                </div>
                <div style={paymentBadge}>Paid via {order.paymentMethod === "ONLINE" ? "Online Payment" : "Cash on Delivery"}</div>
              </div>
              <div style={whiteCard}>
                <h3 style={cardTitle}>Delivery Address</h3>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={addressIcon}>📍</div>
                  <div>
                    <p style={{ fontWeight: "700", margin: "0 0 4px 0", color: "#1e293b" }}>{order.customerAddress?.addressType || "Delivery Address"}</p>
                    <p style={addressText}>{addressLine || "Address details missing"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const dashboardContainer = { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" };
const sidebarStyle = { width: "280px", background: "#fff", borderRight: "1px solid #e2e8f0", padding: "40px 0", position: "sticky", top: 0, height: "100vh" };
const phoneTextStyle = { fontSize: "18px", margin: 0, color: "#333", fontWeight: "800" };
const navStyle = { display: "flex", flexDirection: "column" };
const navItem = { padding: "14px 25px", cursor: "pointer", fontSize: "15px", color: "#4b5563", transition: "0.2s", fontWeight: "500" };
const activeNavItem = { ...navItem, color: "#16a34a", background: "#f0fdf4", fontWeight: "700", borderRight: "4px solid #16a34a" };
const mainContentArea = { flex: 1, padding: "30px 40px", display: "flex", justifyContent: "center", overflowY: "auto" };
const contentWrapper = { width: "100%", maxWidth: "800px" };
const stickyHeader = { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", position: "sticky", top: 0, background: "#f8fafc", padding: "10px 0", zIndex: 10 };
const backCircle = { width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" };
const statusCard = { background: "#fff", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", marginBottom: "25px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" };
const stepDot = (done) => ({ width: "28px", height: "28px", borderRadius: "50%", background: done ? "#16a34a" : "#f1f5f9", color: done ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", transition: "0.3s", zIndex: 2 });
const stepText = (done) => ({ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginTop: "8px", color: done ? "#1e293b" : "#94a3b8", letterSpacing: "0.5px" });
const stepLine = (done) => ({ flex: 1, height: "3px", background: done ? "#16a34a" : "#f1f5f9", margin: "0 -15px", marginTop: "-20px", zIndex: 1 });
const whiteCard = { background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", marginBottom: "20px" };
const cardTitle = { fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "20px", marginTop: 0 };
const itemRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f1f5f9" };
const productImageStyle = { width: "64px", height: "64px", borderRadius: "14px", objectFit: "cover", border: "1px solid #f1f5f9" };
const itemName = { margin: 0, fontWeight: "600", color: "#1e293b", fontSize: "15px" };
const itemQty = { margin: 0, fontSize: "13px", color: "#64748b" };
const itemPrice = { fontWeight: "700", color: "#0f172a", margin: 0 };
const itemPriceStrike = { fontSize: "12px", color: "#9ca3af", textDecoration: "line-through", fontWeight: "600", margin: "0 0 4px 0" };
const detailsGrid = { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" };
const billRow = { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b", marginBottom: "10px" };
const totalDivider = { height: "1px", background: "#f1f5f9", margin: "15px 0" };
const totalRow = { display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "800", color: "#0f172a" };
const paymentBadge = { marginTop: "15px", background: "#f8fafc", padding: "8px", borderRadius: "8px", fontSize: "12px", textAlign: "center", color: "#64748b", fontWeight: "600", border: "1px dashed #cbd5e1" };
const addressIcon = { width: "40px", height: "40px", borderRadius: "10px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" };
const addressText = { fontSize: "14px", color: "#64748b", lineHeight: "1.6", margin: 0 };
