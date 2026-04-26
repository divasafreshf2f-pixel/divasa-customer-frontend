import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import MapSelector from "./MapSelector";
import { getCartCount, getCart } from "../utils/cartStorage";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("divasa_user")) || null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [headerLocation, setHeaderLocation] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [liveEta, setLiveEta] = useState(null);
  const [isRaining] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartAnimating, setCartAnimating] = useState(false);

  const WAREHOUSE_LOCATION = { lat: 13.0570, lng: 77.7108 };
  const SERVICE_RADIUS_KM = 15;
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const handleLocationClick = () => {
    if (!user) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }
    setShowLocationModal(true);
  };

  function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
      Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*
      Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function calculateDeliveryTime(distanceKm) {
    return Math.round(10 + (distanceKm / 25) * 60);
  }

  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

// Sync user after login/logout
useEffect(() => {
  const handleUserUpdate = () => {
    setUser(JSON.parse(localStorage.getItem("divasa_user")));
  };

  window.addEventListener("userUpdated", handleUserUpdate);

  return () => {
    window.removeEventListener("userUpdated", handleUserUpdate);
  };
}, []);


  useEffect(() => {
  function handleClickOutside(event) {
    if (
      accountMenuRef.current &&
      !accountMenuRef.current.contains(event.target)
    ) {
      setShowAccountMenu(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  useEffect(() => {
    const lat = localStorage.getItem("divasa_location_lat");
    const lng = localStorage.getItem("divasa_location_lng");
    if (!lat || !lng) return;

    const distance = getDistanceInKm(
      WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng,
      parseFloat(lat), parseFloat(lng)
    );
    setDeliveryTime(Math.round(15 + distance * 2));
    const savedName = localStorage.getItem("divasa_location_name");
    setHeaderLocation(savedName || "Select Location");
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSuggestions([]); return; }
    setSuggestions(
      products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    );
  }, [search, products]);

  useEffect(() => {
    function syncCart() { setCartCount(getCartCount()); }
    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    return () => window.removeEventListener("cartUpdated", syncCart);
  }, []);

  useEffect(() => {
    if (!liveEta || liveEta <= 0) return;
    const timer = setInterval(() => {
      setLiveEta(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 60000);
    return () => clearInterval(timer);
  }, [liveEta]);

  const confirmMapLocation = async (position) => {
    if (!position) return;
    const distance = getDistanceInKm(
      WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng,
      position.lat, position.lng
    );
    if (distance > SERVICE_RADIUS_KM) {
      alert("Sorry 😔 We do not deliver to this location yet.");
      return;
    }
    let placeName = position?.name || "Your Location";
    if (GOOGLE_MAPS_API_KEY) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.lat},${position.lng}&region=IN&language=en&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`
        );
        if (response.ok) {
          const data = await response.json();
          placeName = data.results?.[0]?.formatted_address || placeName;
        }
      } catch {
        // Keep fallback placeName from selected map result.
      }
    }
    let time = calculateDeliveryTime(distance);
    if (isRaining) time += 10;
    localStorage.setItem("divasa_location_lat", position.lat);
    localStorage.setItem("divasa_location_lng", position.lng);
    localStorage.setItem("divasa_location_name", placeName);
    localStorage.setItem("divasa_delivery_time", time);
    setDeliveryTime(time);
    setLiveEta(time);
    setHeaderLocation(placeName);
    setShowLocationModal(false);
  };

  function scrollToProducts() {
    const section = document.getElementById("products-section");
    if (section) {
      const y = section.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>

      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%",
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.75)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
        zIndex: 1000,
      }}>

        {/* DESKTOP HEADER */}
        <div className="header-desktop" style={{
          maxWidth: "1400px", margin: "0 auto",
          padding: "15px 30px", display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: 20,
        }}>

          {/* Logo + Location */}
          <div className="mobile-left" style={{ display: "flex", alignItems: "center", gap: 18 }}>
           <Link 
  to="/" 
  style={{ textDecoration: "none" }}
>
  <h2
    className="mobile-logo"
    style={{
      margin: 0,
      fontWeight: 700,
      fontSize: 20,
      color: "#111827",
      letterSpacing: "-0.5px",
      cursor: "pointer"
    }}
  >
    Divasa Fresh
  </h2>
</Link>
            <div onClick={handleLocationClick} style={{
              padding: "6px 14px", borderRadius: 24, background: "#ffffff",
              border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 500,
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span>📍 {headerLocation || "Select Location"}</span>
                {deliveryTime && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, animation: "pulse 1.8s infinite" }}>
                      Delivering in {liveEta ?? deliveryTime} mins
                    </span>
                    {deliveryTime <= 15 && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>⚡ Fast Delivery</span>}
                    {deliveryTime > 30 && <span style={{ fontSize: 11, color: "#f97316", fontWeight: 600 }}>🚦 Peak Time</span>}
                    {isRaining && <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 600 }}>🌧️ Rain Delay Applied</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 520 }}>
            <input
              className="search-input"
              type="text"
              placeholder="Search vegetables, fruits..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: "100%", padding: "10px 18px", borderRadius: 30,
                background: "#ffffff", color: "#111827", border: "1px solid #e5e7eb",
                outline: "none", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "110%", left: 0, width: "100%",
                background: "#fff", borderRadius: 16,
                boxShadow: "0 15px 40px rgba(0,0,0,0.1)", overflow: "hidden", zIndex: 3000
              }}>
                {suggestions.map((item) => (
                  <div key={item._id}
                    onClick={() => { setSearch(item.name); setShowSuggestions(false); scrollToProducts(); }}
                    style={{ padding: "12px 16px", cursor: "pointer", fontSize: 14 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                  >
                    ↗ {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right buttons */}
          <div className="mobile-right" style={{ display: "flex", alignItems: "center", gap: 20 }}>

            <button onClick={() => navigate("/subscribe")} style={{
              background: "#f3f4f6", border: "1px solid #e5e7eb",
              padding: "8px 16px", borderRadius: 24, fontWeight: 600,
              cursor: "pointer", color: "#111827", fontSize: 14
            }}>
              Subscription
            </button>

            <button onClick={() => navigate("/bulk-order")} style={{
              background: "#f3f4f6", border: "1px solid #e5e7eb",
              padding: "8px 16px", borderRadius: 24, fontWeight: 600,
              cursor: "pointer", color: "#111827", fontSize: 14
            }}>
              Bulk Order
            </button>

            {!user ? (
              <button onClick={() => window.dispatchEvent(new Event("openLoginModal"))}style={{
                background: "#22C55E", color: "#fff", border: "none",
                padding: "8px 18px", borderRadius: 24, fontWeight: 600, cursor: "pointer"
              }}>
                Login
              </button>
            ) : (
<div ref={accountMenuRef} style={{ position: "relative" }}>
                  <button onClick={() => setShowAccountMenu(!showAccountMenu)} style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "#f3f4f6", border: "1px solid #e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 6px 18px rgba(7,11,131,0.35)"
                }}>
                  <span style={{ fontSize: 20 }}>👤</span>
                </button>
                {showAccountMenu && (
                  <div style={{
                    position: "absolute", right: 0, top: 45, background: "#fff",
                    borderRadius: 14, boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
                    width: 240, zIndex: 2000
                  }}>
                    <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>My Account</div>
                     <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
<span>
<strong>Hi </strong><strong>{user.name || user.phone}</strong> 👋
</span>
</div>
                    </div>
                    {[
                      { label: "My Orders", path: "/my-orders" },
                      { label: "Bulk Orders", path: "/my-bulk-orders" },
                      { label: "My Subscriptions 🔄", path: "/my-subscriptions" },
                      { label: "Saved Addresses", path: "/saved-addresses" },
                      { label: "My Favourites", path: "/my-favourites" },
                      { label: "Loyalty Cards", path: "/loyalty-cards" },
                      { label: "FAQs", path: "/faqs" },
                      { label: "Account Privacy", path: "/account-privacy" },
                    ].map((item) => (
                      <div key={item.path}
                        onClick={() => { setShowAccountMenu(false); navigate(item.path); }}
                        style={{ padding: "12px 10px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: 15, fontWeight: 500 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                      >
                        {item.label}
                      </div>
                    ))}
                    <div onClick={() => {
                      localStorage.removeItem("divasa_token");
                      localStorage.removeItem("customerToken");
                      localStorage.removeItem("token");
                      localStorage.removeItem("divasa_user");
                      window.dispatchEvent(new Event("userUpdated"));
                      setUser(null); setShowAccountMenu(false);
                    }} style={{ padding: "12px 10px", cursor: "pointer", color: "red", fontWeight: 600 }}>
                      Logout
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link to="/cart" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", borderRadius: 30,
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: "6px 14px",
                transform: cartAnimating ? "scale(1.15)" : "scale(1)", transition: "all 0.35s ease"
              }}>
                <span style={{ fontSize: 18 }}>🛒</span>
                {cartCount > 0 && (
                  <span style={{ marginLeft: 8, fontWeight: 700, color: "#111827", fontSize: 14 }}>
                    Cart ({cartCount})
                  </span>
                )}
              </div>
            </Link>

          </div>
        </div>
        {/* END DESKTOP HEADER */}

        {/* MOBILE HEADER */}
        <div className="header-mobile">
          <div className="mh-row1">
            <div className="mh-brand">
              <div className="mh-hamburger">☰</div>
             <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
  <span className="mh-logo">Divasa Fresh</span>
</Link>
            </div>
            <div className="mh-location" onClick={handleLocationClick}>
              <div className="mh-loc-line1">
                <span className="mh-pin">📍</span>
                <span className="mh-loc-name">
                  {headerLocation ? headerLocation.split(",")[0] : "Select Location"}
                </span>
                <span className="mh-chevron">▾</span>
              </div>
              {deliveryTime && (
                <div className="mh-loc-line2">
                  <span className="mh-eta" style={{ animation: "pulse 1.8s infinite" }}>
                    🕐 {liveEta ?? deliveryTime} mins
                  </span>
                  {deliveryTime <= 15 && <span className="mh-badge mh-badge-fast">⚡ Fast</span>}
                  {deliveryTime > 30 && <span className="mh-badge mh-badge-peak">🚦 Peak</span>}
                  {isRaining && <span className="mh-badge mh-badge-rain">🌧️ Rain</span>}
                </div>
              )}
            </div>
            <div className="mh-actions">
              {!user ? (
                <button className="mh-login-btn" onClick={() => window.dispatchEvent(new Event("openLoginModal"))}>Login</button>
              ) : (
                <div style={{ position: "relative" }}>
                  <button className="mh-account-btn" onClick={() => setShowAccountMenu(!showAccountMenu)}>👤</button>
                  {showAccountMenu && (
                    <div className="mh-account-menu">
                      <div style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>My Account</div>
                       <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
<span>
<strong>Hi </strong><strong>{user.name || user.phone}</strong> 👋
</span>
</div>
                      </div>
                      {[
                        { label: "My Orders", path: "/my-orders" },
                        { label: "Bulk Orders", path: "/my-bulk-orders" },
                        { label: "My Subscriptions 🔄", path: "/my-subscriptions" },
                        { label: "Saved Addresses", path: "/saved-addresses" },
                        { label: "My Favourites", path: "/my-favourites" },
                        { label: "Loyalty Cards", path: "/loyalty-cards" },
                        { label: "FAQs", path: "/faqs" },
                        { label: "Account Privacy", path: "/account-privacy" },
                      ].map((item) => (
                        <div key={item.path} className="mh-menu-item"
                          onClick={() => { setShowAccountMenu(false); navigate(item.path); }}>
                          {item.label}
                        </div>
                      ))}
                      <div className="mh-menu-item mh-logout" onClick={() => {
                        localStorage.removeItem("divasa_token");
                        localStorage.removeItem("customerToken");
                        localStorage.removeItem("token");
                        localStorage.removeItem("divasa_user");
                        window.dispatchEvent(new Event("userUpdated"));
                        setUser(null); setShowAccountMenu(false);
                      }}>Logout</div>
                    </div>
                  )}
                </div>
              )}
              <Link to="/cart" style={{ textDecoration: "none" }}>
                <div className="mh-cart" style={{ transform: cartAnimating ? "scale(1.2)" : "scale(1)" }}>
                  🛒
                  {cartCount > 0 && <span className="mh-cart-badge">{cartCount}</span>}
                </div>
              </Link>
            </div>
          </div>
          <div className="mh-search-row">
            <div className="mh-search-wrap">
              <span className="mh-search-icon">🔍</span>
              <input className="mh-search-input" type="text" placeholder="Search vegetables, fruits..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        {/* END MOBILE HEADER */}

      </div>

      {/* LOCATION MODAL */}
      {showLocationModal && user && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            width: "min(450px, 95vw)", height: "min(600px, 85vh)",
            background: "#fff", borderRadius: 20, overflow: "hidden",
            display: "flex", flexDirection: "column"
          }}>
            <div style={{
              padding: "14px 18px", display: "flex", justifyContent: "space-between",
              alignItems: "center", borderBottom: "1px solid #eee", fontWeight: 600
            }}>
              Select Delivery Location
              <span onClick={() => setShowLocationModal(false)} style={{ cursor: "pointer", fontSize: 20 }}>✕</span>
            </div>
            <div style={{ flex: 1 }}>
              <MapSelector 
  onLocationSelect={confirmMapLocation}
  onClose={() => setShowLocationModal(false)}
/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

