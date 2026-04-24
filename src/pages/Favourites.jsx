import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getAssetCandidates, resolveImagePath } from "../services/api";
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
  .fav-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
  .fav-img { height: 130px !important; }
}
@media (max-width: 380px) {
  .fav-grid { grid-template-columns: 1fr !important; }
}
`;

export default function Favourites() {
  const navigate = useNavigate();
  const [favProducts, setFavProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("divasa_user"));

  useEffect(() => {
    if (user?.phone) {
      api.get(`/products/favorites/${user.phone}`)
        .then((res) => { setFavProducts(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    } else { setLoading(false); }
  }, [user?.phone]);

  const removeFav = async (e, productId) => {
    e.stopPropagation();
    try {
      await api.post("/products/toggle-favorite", { productId, phone: user.phone });
      setFavProducts(favProducts.filter(p => p._id !== productId));
    } catch (err) { console.error("Error removing favourite", err); }
  };

  if (!user) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <h2>Please login to view your favourites.</h2>
        <button onClick={() => navigate("/")} style={shopNowBtn}>Go to Home</button>
      </div>
    );
  }

  return (
    <>
      <style>{DB_MOBILE}</style>
      <Header />
      <div className="db-wrap" style={dashboardContainer}>
        <AccountSidebar user={user} activePath="/my-favourites" />

        <div className="db-main" style={mainContentArea}>
          <div style={{ width: "100%", maxWidth: 1000 }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px", color: "#1f2937" }}>My Favourites ({favProducts.length})</h2>

            {loading ? (
              <p>Loading your favourites...</p>
            ) : favProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: "#fff", borderRadius: "16px" }}>
                <p style={{ color: "#64748b", marginBottom: "20px" }}>You haven't added any favourites yet.</p>
                <button onClick={() => navigate("/")} style={shopNowBtn}>Start Shopping</button>
              </div>
            ) : (
              <div className="fav-grid" style={productGrid}>
                {favProducts.map((product) => (
                  <div key={product._id} style={productCard} onClick={() => navigate(`/product/${product._id}`)}>
                    {(() => {
                      const candidates = getAssetCandidates(resolveImagePath(product));
                      return (
                        <img
                          className="fav-img"
                          src={candidates[0] || "/vite.svg"}
                          alt={product.name}
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
                    })()}
                    <div onClick={(e) => removeFav(e, product._id)} style={heartIconStyle}>❤️</div>
                    <div style={{ marginTop: "12px" }}>
                      <h4 style={productNameStyle}>{product.name}</h4>
                      <p style={productPriceStyle}>₹{product.variants?.[0]?.price || "0"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
const productGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px", width: "100%" };
const productCard = { background: "#fff", borderRadius: "16px", padding: "15px", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", border: "1px solid #f3f4f6" };
const productImgStyle = { width: "100%", height: "180px", objectFit: "cover", borderRadius: "12px", background: "#f8fafc" };
const heartIconStyle = { position: "absolute", top: "22px", right: "22px", fontSize: "20px", background: "#fff", width: "35px", height: "35px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" };
const productNameStyle = { margin: "0", fontSize: "15px", fontWeight: "600", color: "#1f2937" };
const productPriceStyle = { margin: "5px 0 0", fontWeight: "700", color: "#16a34a", fontSize: "17px" };
const shopNowBtn = { padding: "12px 25px", background: "#16a34a", color: "#fff", borderRadius: "10px", border: "none", fontWeight: "600", cursor: "pointer" };
