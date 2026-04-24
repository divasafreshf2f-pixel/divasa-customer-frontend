import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AccountSidebar from "../components/AccountSidebar";
import api, { getAssetCandidates, resolveImagePath } from "../services/api";

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toFixed(0)}`;

export default function BulkOrders() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem("divasa_user") || "null"));
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const businessesRes = await api.get("/bulk/businesses");
        const eventBusinesses = (businessesRes.data?.businesses || []).filter((entry) => entry.accountType === "event");
        setEvents(eventBusinesses);
        const firstId = eventBusinesses[0]?._id || "";
        setSelectedEventId(firstId);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!selectedEventId) {
      setOrders([]);
      return;
    }
    const loadOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get("/bulk/orders", { params: { businessId: selectedEventId, limit: 40 } });
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedEventId) || null,
    [events, selectedEventId]
  );

  if (!user) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <h2>Please login to view your bulk orders.</h2>
        <button onClick={() => navigate("/")} style={reorderBtnStyle}>Go to Home</button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="db-wrap" style={dashboardContainer}>
        <AccountSidebar user={user} activePath="/my-bulk-orders" />
        <div className="db-main" style={mainContentArea}>
          <div style={{ width: "100%", maxWidth: 900 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", margin: 0, color: "#1f2937" }}>Bulk Orders</h2>
              {!!events.length && (
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  style={{ borderRadius: 10, border: "1px solid #d1d5db", padding: "10px 12px", minWidth: 220 }}
                >
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.businessName || event.ownerName || "Event Profile"}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedEvent ? (
              <div style={{ ...orderCardStyle, marginBottom: 20, cursor: "default" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  Active Event
                </p>
                <p style={{ margin: "6px 0 2px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                  {selectedEvent.businessName || "Event Profile"}
                </p>
                <p style={{ margin: 0, color: "#475569", fontSize: 13 }}>{selectedEvent.deliveryAddress || "No address saved"}</p>
              </div>
            ) : null}

            {loading ? (
              <p>Loading your bulk orders...</p>
            ) : !selectedEventId ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#666", marginBottom: 16 }}>Create an event profile in Bulk Order to start ordering.</p>
                <button onClick={() => navigate("/bulk-order")} style={reorderBtnStyle}>Go to Bulk Order</button>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#666", marginBottom: 16 }}>No bulk orders found yet.</p>
                <button onClick={() => navigate("/bulk-order")} style={reorderBtnStyle}>Place Bulk Order</button>
              </div>
            ) : (
              orders.map((order) => {
                const statusColors = {
                  pending: "#f59e0b",
                  scheduled: "#0ea5e9",
                  packed: "#3b82f6",
                  out_for_delivery: "#8b5cf6",
                  delivered: "#16a34a",
                  cancelled: "#ef4444",
                };
                return (
                  <div key={order._id} className="order-card" style={{ ...orderCardStyle, cursor: "default" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>
                          Bulk #{String(order._id || "").slice(-6).toUpperCase()}
                        </p>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
                          {new Date(order.createdAt || Date.now()).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ background: statusColors[order.status] || "#94a3b8", color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "capitalize", marginBottom: 6, display: "inline-block" }}>
                          {String(order.status || "").replaceAll("_", " ")}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>{formatMoney(order.totalAmount || 0)}</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 6, fontSize: 13, color: "#334155", marginBottom: 12 }}>
                      <div><strong>Delivery:</strong> {order.scheduleType === "standard" ? "Standard (20-30 mins)" : `${order.scheduleDate || ""} · ${order.scheduleSlot || ""}`}</div>
                      <div><strong>Payment:</strong> {String(order.paymentMethod || "cod").toUpperCase()} · {String(order.paymentMode || "pay_later").replaceAll("_", " ")}</div>
                      <div><strong>Address:</strong> {order.deliveryAddress || "-"}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                      {(order.items || []).slice(0, 5).map((item, index) => (
                        <div key={`${order._id}_${item.productId || index}`} style={{ minWidth: 145, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 8 }}>
                          {resolveImagePath(item) ? (
                            (() => {
                              const candidates = getAssetCandidates(resolveImagePath(item));
                              return (
                                <img
                                  src={candidates[0] || "/vite.svg"}
                                  alt={item.name}
                                  style={{ width: "100%", height: 56, objectFit: "cover", borderRadius: 8, marginBottom: 6 }}
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
                            })()
                          ) : null}
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{item.name}</p>
                          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#475569" }}>
                            {item.selectedTierLabel || `${item.quantity} ${item.unit || ""}`} · {formatMoney(item.lineTotal || 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const dashboardContainer = { display: "flex", minHeight: "calc(100vh - 78px)", background: "#f9fafb", paddingTop: "78px" };
const mainContentArea = { flex: 1, padding: "40px 60px", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "flex-start" };
const orderCardStyle = { background: "#fff", padding: "20px", borderRadius: "16px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #f3f4f6", width: "100%" };
const reorderBtnStyle = { padding: "10px 24px", borderRadius: "10px", border: "1px solid #16a34a", background: "#fff", color: "#16a34a", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
