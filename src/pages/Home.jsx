import "./Home.css";

import { useEffect, useState } from "react";
import api, { getAssetUrl } from "../services/api";
import {
  addToCart,
  getCartCount,
  getCart,
  updateCartQuantity
} from "../utils/cartStorage";
import Header from "../components/Header";
import { formatPrice, getReferenceMarketPrice } from "../utils/pricing";

import { Link, useLocation, useNavigate } from "react-router-dom";
import MapSelector from "../components/MapSelector";
import CustomerLoginModal from "../components/CustomerLoginModal";
import { REVIEW_DEFAULT_LOCATION, REVIEW_MODE_ENABLED } from "../config/reviewMode";

export default function Home() {

  // ✅ MODAL STATE - This controls the map modal
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("Select delivery location");

  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedVariantIds, setSelectedVariantIds] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState(getCart());
  const [cartAnimating, setCartAnimating] = useState(false);
  const [campaignMode, setCampaignMode] = useState(null);
  const [isRaining, setIsRaining] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("divasa_user")) || null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("divasa_user"));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  useEffect(() => {
    const updateUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("divasa_user"));
      setUser(updatedUser);
    };
    window.addEventListener("userUpdated", updateUser);
    return () => {
      window.removeEventListener("userUpdated", updateUser);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setShowAddressPicker(false);
      setShowMapModal(false);
      setShowLoginModal(REVIEW_MODE_ENABLED ? false : true);
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await api.get(`/addresses/${user.phone}`);
        const sorted = [...res.data].sort((a, b) => b.isDefault - a.isDefault);
        setSavedAddresses(sorted);

        if (sorted.length === 0) {
          setShowAddressPicker(false);
          if (!REVIEW_MODE_ENABLED) {
            navigate("/saved-addresses?action=add");
          }
          return;
        }

        const pickerShown = sessionStorage.getItem("divasa_address_picker_seen");
        if (!pickerShown) {
          sessionStorage.setItem("divasa_address_picker_seen", "true");
          setShowAddressPicker(true);
          return;
        }

        setShowAddressPicker(false);
      } catch (err) {
        setSavedAddresses([]);
        if (err?.response?.status === 404) {
          setShowAddressPicker(false);
          if (!REVIEW_MODE_ENABLED) {
            navigate("/saved-addresses?action=add");
          }
          return;
        }
        setShowAddressPicker(false);
      }
    };

    fetchAddresses();
  }, [user, navigate]);

  useEffect(() => {
    if (!REVIEW_MODE_ENABLED) return;
    localStorage.setItem("divasa_location_lat", String(REVIEW_DEFAULT_LOCATION.lat));
    localStorage.setItem("divasa_location_lng", String(REVIEW_DEFAULT_LOCATION.lng));
    localStorage.setItem("divasa_location_name", REVIEW_DEFAULT_LOCATION.name);
    setShowMapModal(false);
    setShowAddressPicker(false);
  }, []);

  const [favs, setFavs] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.phone) {
      api.get(`/products/favorites/${user.phone}`).then(res => setFavs(res.data.map(f => f._id)));
    }
  }, [user]);

  const handleFav = async (e, productId) => {
    e.stopPropagation();
    if (!user) return setShowLoginModal(true);
    const res = await api.post("/products/toggle-favorite", { productId, phone: user.phone });
    setFavs(res.data.favorites);
  };

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const cartTotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const [headerLocation, setHeaderLocation] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [liveEta, setLiveEta] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse {
        0% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
        100% { opacity: 0.6; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const WAREHOUSE_LOCATION = { lat: 13.0570, lng: 77.7108 };
  const SERVICE_RADIUS_KM = 15;

  function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculateDeliveryTime(distanceKm) {
    const basePrepTime = 10;
    const avgSpeedKmPerHour = 25;
    const travelTime = (distanceKm / avgSpeedKmPerHour) * 60;
    const totalTime = Math.round(basePrepTime + travelTime);
    return totalTime;
  }

  const categoryImages = {
    vegetable: "/category-images/vegetable.png",
    fruits: "/category-images/fruits.png",
    juice: "/category-images/juice.png",
    "solar dry powders": "/category-images/powder.png",
    "combo packs": "/category-images/combo.png",
    "fruit salad": "/category-images/salad.png",
    all: "/category-images/all.png"
  };

  // Meal category is subscription-only - never shown in normal orders
  const HIDDEN_CATEGORIES = ["meal"];
  const isHiddenCategory = (category = "") => {
    const normalized = String(category).trim().toLowerCase();
    return HIDDEN_CATEGORIES.some((hidden) => normalized.includes(hidden));
  };

  // ✅ Check for saved location on mount
  useEffect(() => {
    const lat = localStorage.getItem("divasa_location_lat");
    const lng = localStorage.getItem("divasa_location_lng");
    const savedName = localStorage.getItem("divasa_location_name");
    if (!lat || !lng) return;
    const distance = getDistanceInKm(
      WAREHOUSE_LOCATION.lat,
      WAREHOUSE_LOCATION.lng,
      parseFloat(lat),
      parseFloat(lng)
    );
    const deliveryTime = calculateDeliveryTime(distance);
    setDeliveryTime(deliveryTime);
    setHeaderLocation(savedName || "Select Location");
    setDeliveryAddress(savedName || "Select Location");
  }, []);

  useEffect(() => {
    const normalizeProducts = (list) =>
      (Array.isArray(list) ? list : []).map((p) => {
        const rawStock = Number(p?.stockQuantity);
        const derivedVariantStock = Array.isArray(p?.variants)
          ? p.variants.reduce((sum, v) => {
              const n = Number(v?.stock);
              return sum + (Number.isFinite(n) ? n : 0);
            }, 0)
          : 0;
        return {
          ...p,
          stockQuantity: Number.isFinite(rawStock) ? rawStock : derivedVariantStock,
        };
      });

    const loadProducts = async () => {
      try {
        const res = await api.get("/products", {
          params: { _ts: Date.now() },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        let normalized = normalizeProducts(res.data);

        // Localhost safety fallback: if stale zero-stock data appears, force-read directly from local backend.
        if (
          typeof window !== "undefined" &&
          ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
          normalized.length > 0 &&
          normalized.every((p) => Number(p.stockQuantity || 0) <= 0)
        ) {
          const localRes = await fetch(
            `${window.location.protocol}//${window.location.hostname}:5000/api/products?_ts=${Date.now()}`,
            { cache: "no-store" }
          );
          if (localRes.ok) {
            const localData = await localRes.json();
            normalized = normalizeProducts(localData);
          }
        }

        setProducts(normalized);
      } catch (err) {
        console.error("Failed to load products:", err);
        try {
          const retry = await api.get("/products");
          setProducts(normalizeProducts(retry.data));
        } catch (retryErr) {
          console.error("Retry products load failed:", retryErr);
          setProducts([]);
        }
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = products
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 6);
    setSuggestions(filtered);
  }, [search, products]);

  useEffect(() => {
    function syncCart() {
      const updatedCart = getCart();
      setCart(updatedCart);
      setCartCount(getCartCount());
    }
    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    return () => { window.removeEventListener("cartUpdated", syncCart); };
  }, []);

  function getItemQuantity(productId, variantId) {
    const item = cart.find(
      (i) => i.productId === productId && i.variantId === variantId
    );
    return item ? item.quantity : 0;
  }

  function getVariantWeightInGrams(name = "") {
    const normalized = String(name).trim().toLowerCase();
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|gram|grams)/i);
    if (!match) return Number.MAX_SAFE_INTEGER;

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (!Number.isFinite(value)) return Number.MAX_SAFE_INTEGER;
    if (unit === "kg") return value * 1000;
    return value;
  }

  function isWeightCategory(category = "") {
    const normalized = String(category).trim().toLowerCase();
    return normalized.includes("vegetable") || normalized.includes("fruit");
  }

  function isSingleKgVariant(variant) {
    const normalized = String(variant?.name || "").replace(/\s+/g, "").toLowerCase();
    return normalized === "kg" || normalized === "1kg";
  }

  function getDefaultListingVariant(product, variants) {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    if (!isWeightCategory(product?.category)) return variants[0];

    const exactOneKg = variants.find((variant) => isSingleKgVariant(variant));
    if (exactOneKg) return exactOneKg;

    const oneKgOrMore = variants
      .filter((variant) => getVariantWeightInGrams(variant.name) >= 1000)
      .sort((a, b) => getVariantWeightInGrams(a.name) - getVariantWeightInGrams(b.name));
    if (oneKgOrMore.length > 0) return oneKgOrMore[0];

    // Fallback to largest available option for products missing a 1kg variant.
    return variants[variants.length - 1];
  }

  function getDisplayVariants(product) {
    if (!Array.isArray(product?.variants)) return [];

    const normalizedVariants = product.variants
      .filter((variant) => variant && variant._id && variant.name !== undefined && variant.price !== undefined)
      .map((variant) => ({ ...variant, price: Number(variant.price), actualVariantId: variant._id, weightMultiplier: 1 }))
      .filter((variant) => Number.isFinite(variant.price))
      .sort((a, b) => {
        const weightDiff = getVariantWeightInGrams(a.name) - getVariantWeightInGrams(b.name);
        if (weightDiff !== 0) return weightDiff;
        return String(a.name).localeCompare(String(b.name));
      });

    if (
      normalizedVariants.length === 1 &&
      isWeightCategory(product?.category) &&
      isSingleKgVariant(normalizedVariants[0])
    ) {
      const baseVariant = normalizedVariants[0];
      const weightOptions = [
        { label: "250g", multiplier: 0.25 },
        { label: "500g", multiplier: 0.5 },
        { label: "750g", multiplier: 0.75 },
        { label: "1 Kg", multiplier: 1 },
      ];

      return weightOptions.map((option) => ({
        ...baseVariant,
        _id: `${baseVariant._id}_${option.label.replace(/\s+/g, "").toLowerCase()}`,
        name: option.label,
        price: Number((baseVariant.price * option.multiplier).toFixed(2)),
        actualVariantId: baseVariant._id,
        weightMultiplier: option.multiplier,
      }));
    }

    return normalizedVariants;
  }

  // ✅ FIXED: Handle location selection from map
  const handleLocationSelect = (location) => {
    if (!location) return;
    console.log("Location selected:", location);
    const distance = getDistanceInKm(
      WAREHOUSE_LOCATION.lat,
      WAREHOUSE_LOCATION.lng,
      location.lat,
      location.lng
    );
    if (distance > SERVICE_RADIUS_KM) {
      alert("Sorry 😔 We do not deliver to this location yet.");
      return;
    }
    const deliveryTime = calculateDeliveryTime(distance);
    localStorage.setItem("divasa_location_lat", location.lat);
    localStorage.setItem("divasa_location_lng", location.lng);
    localStorage.setItem("divasa_location_name", location.name);
    setHeaderLocation(location.name);
    setDeliveryAddress(location.name);
    setDeliveryTime(deliveryTime);
    setSelectedLocation(location);
    setShowMapModal(false);
  };

  // ✅ FIXED: Close modal handler
  const handleCloseModal = () => {
    setShowMapModal(false);
  };

  useEffect(() => {
    if (!liveEta || liveEta <= 0) return;
    const timer = setInterval(() => {
      setLiveEta(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [liveEta]);

  function handleAddToCart(product, variant) {
    if (!user && !REVIEW_MODE_ENABLED) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }
    addToCart({
      productId: product._id,
      variantId: variant._id,
      actualVariantId: variant.actualVariantId || variant._id,
      name: product.name,
      variantName: variant.name,
      price: variant.price,
      weightMultiplier: Number(variant.weightMultiplier) || 1,
      image: getProductImagePath(product),
      quantity: 1,
    });
    const updatedCart = getCart();
    setCart(updatedCart);
    setCartCount(getCartCount());
    setCartAnimating(true);
    setTimeout(() => { setCartAnimating(false); }, 800);
  }

  const highlightCardStyle = (bgColor) => ({
    position: "relative",
    borderRadius: 22,
    padding: 22,
    minHeight: 240,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    color: "#fff",
    background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
    boxShadow: "0 18px 45px rgba(0,0,0,0.12)",
    transition: "all 0.3s ease"
  });

  const highlightTitle = { fontSize: 16, fontWeight: 700, marginBottom: 6 };
  const highlightText = { fontSize: 14, fontWeight: 500, lineHeight: 1.4, maxWidth: "70%" };
  const highlightSub = { fontSize: 12, color: "#555", marginBottom: 10 };
  const highlightBtn = {
    padding: "6px 14px", background: "#22C55E", borderRadius: 20,
    border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12,
  };

  function activateCampaign(categoryName) {
    setCampaignMode(null);
    setActiveCategory(categoryName);
    setTimeout(() => {
      const section = document.getElementById("products-section");
      if (section) {
        const yOffset = -120;
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  }

  function normalizeCategoryKey(category = "") {
    const normalized = String(category).trim().toLowerCase();
    if (!normalized) return "";
    if (normalized === "all") return "all";
    if (normalized.includes("veget")) return "vegetable";
    if (normalized.includes("fruit salad")) return "fruit salad";
    if (normalized.includes("fruit")) return "fruits";
    if (normalized.includes("juice")) return "juice";
    if (normalized.includes("powder")) return "solar dry powders";
    if (normalized.includes("combo")) return "combo packs";
    return normalized;
  }

  function scrollToProducts() {
    const section = document.getElementById("products-section");
    if (section) {
      const yOffset = -120;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  function openAddAddressFlow() {
    if (REVIEW_MODE_ENABLED) return;
    navigate("/saved-addresses?action=add");
  }

  function getProductImagePath(product = {}) {
    return (
      product.image ||
      product.imageUrl ||
      product.productImage ||
      product.productImageUrl ||
      ""
    );
  }

  function getProductImageSources(product = {}) {
    const raw = getProductImagePath(product);
    if (!raw) return [];
    if (/^https?:\/\//i.test(raw)) return [raw];

    const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
    const primary = getAssetUrl(normalizedPath);
    const sources = [primary];

    if (
      typeof window !== "undefined" &&
      ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ) {
      const localDev = `${window.location.protocol}//${window.location.hostname}:5000${normalizedPath}`;
      if (!sources.includes(localDev)) {
        sources.push(localDev);
      }
    }

    return sources;
  }

  return (
    <div
      className="page-root"
      style={{ padding: "60px 20px 40px 20px", width: "100%" }}
    >
      <Header />

      {/* HERO SECTION */}
      <div
        className="hero-section-container"
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #FFD43B 0%, #c3f0ca 100%)",
          borderRadius: 30,
          marginBottom: 60,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "70px 90px",
          minHeight: "500px",
          gap: 40
        }}
      >
        <div style={{ maxWidth: 520, zIndex: 2, flex: 1 }}>
          <h1
            style={{
              fontSize: 48, fontWeight: 900, lineHeight: 1.1,
              marginBottom: 15, color: "#1f2937"
            }}
          >
            Fresh groceries <br />
            at your doorstep.
          </h1>

          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 25, color: "#374151" }}>
            Get vegetables, fruits, juices &amp; healthy meals
            delivered in 15–25 minutes.
          </p>

          {/* App Store Download Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <a
              href="https://apps.apple.com/in/app/divasa-fresh/id6743688031"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#000", color: "#fff", padding: "10px 18px",
                borderRadius: 12, textDecoration: "none", fontWeight: 600,
                fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.divasafresh.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#01875f", color: "#fff", padding: "10px 18px",
                borderRadius: 12, textDecoration: "none", fontWeight: 600,
                fontSize: 13, boxShadow: "0 4px 12px rgba(1,135,95,0.3)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M3.18 23.76c.33.18.7.18 1.04 0l10.2-5.88-2.15-2.15-9.09 8.03zM.09 2.07C.04 2.26 0 2.47 0 2.7v18.6c0 .23.04.44.09.63l.04.04 10.42-10.42v-.24L.13 1.97l-.04.1zM20.45 10.4l-2.9-1.67-2.4 2.4 2.4 2.4 2.91-1.67c.83-.48.83-1.97-.01-2.46zM4.22.24L14.43 6.12l-2.15 2.15L2.18.24C2.52.06 2.89.06 3.22.24l1 0z"/>
              </svg>
              Play Store
            </a>
          </div>

          <button
            onClick={scrollToProducts}
            style={{
              padding: "14px 36px", borderRadius: 40, border: "none",
              background: "#1d8ae3", color: "#ffffff", fontWeight: 700,
              fontSize: 15, cursor: "pointer",
              boxShadow: "0 12px 25px rgba(0,0,0,0.15)", transition: "0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            Shop Now →
          </button>
        </div>

        <div
          style={{
            flex: 1, position: "relative", display: "flex",
            alignItems: "center", justifyContent: "center", minHeight: 300, zIndex: 2
          }}
        >
          <img
            src="hero-girl.png"
            alt="Fresh produce"
            style={{
              position: "absolute", width: "100%", maxWidth: 400,
              right: "-5px", height: "auto", objectFit: "contain",
              transform: "scale(1.8)", display: "block"
            }}
          />
        </div>
      </div>

      {/* FEATURE HIGHLIGHT CARDS */}
      <div
        className="highlight-grid"
        style={{
          display: "flex", overflowX: "auto", scrollSnapType: "x mandatory",
          gap: "20px", margin: "30px auto", maxWidth: "1400px",
          padding: "0 20px 20px 20px", scrollbarWidth: "none", msOverflowStyle: "none",
        }}
      >
        <style>{`
          .highlight-grid::-webkit-scrollbar { display: none; }
          @media (max-width: 768px) {
            .highlight-card { min-width: 320px !important; height: 240px !important; }
            .card-image { width: 150px !important; right: 0px !important; }
            .card-title { font-size: 24px !important; }
            .card-desc { max-width: 55% !important; font-size: 11px !important; }
          }
        `}</style>

        {/* Combo Veggies Card */}
        <div
          className="highlight-card veggies-card"
          style={{
            position: "relative", flex: "0 0 auto", scrollSnapAlign: "start",
            width: "420px", height: "280px", background: "#064e3b",
            borderRadius: "32px", padding: "24px", color: "#fff",
            fontFamily: "'Inter', sans-serif", overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", transition: "all 0.4s ease",
          }}
        >
          <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(0,0,0,0) 70%)", zIndex: 1 }} />
          <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", background: "#22c55e", padding: "4px 10px", borderRadius: "100px" }}>Farm to Fork</span>
                <h3 className="card-title" style={{ fontSize: "32px", fontWeight: 900, marginTop: "8px", lineHeight: "1" }}>Combo <br /> <span style={{ color: "#4ade80" }}>Veggies</span></h3>
              </div>
              <div style={{ position: "absolute", top: "18px", right: "18px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", padding: "8px 12px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: "1", minWidth: "75px" }}>
                <span style={{ fontSize: "9px", opacity: 0.8 }}>Just at</span>
                <strong style={{ fontSize: "16px", fontWeight: 800 }}>₹199</strong>
              </div>
            </div>
            <div className="card-image" style={{ position: "absolute", right: "-20px", bottom: "-10px", width: "210px" }}>
              <img src="/highlight/combo.png" alt="Combo" style={{ width: "100%", transform: "scale(1.40) translateY(20px)", transition: "all 0.4s ease", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" }} />
            </div>
            <div style={{ marginTop: "auto", maxWidth: "60%" }}>
              <p className="card-desc" style={{ fontSize: "13px", lineHeight: "1.4", opacity: 0.9, marginBottom: "16px", minHeight: "40px", display: "flex", alignItems: "center" }}>Handpicked daily for your safety.</p>
              <button
                onClick={() => activateCampaign("combo packs")}
                style={{ background: "#fff", color: "#064e3b", border: "none", padding: "10px 20px", borderRadius: "16px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                Grab Deal <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Fruit Salad Card */}
        <div
          className="highlight-card"
          style={{
            position: "relative", flex: "0 0 auto", scrollSnapAlign: "start",
            width: "420px", height: "280px", background: "#0a1854",
            borderRadius: "32px", padding: "24px", color: "#fff",
            fontFamily: "'Inter', sans-serif", overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(10, 24, 84, 0.3)",
          }}
        >
          <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(0,0,0,0) 70%)", zIndex: 1 }} />
          <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", background: "#6366f1", padding: "4px 10px", borderRadius: "100px" }}>Weekly &amp; Monthly</span>
                <h3 className="card-title" style={{ fontSize: "30px", fontWeight: 900, marginTop: "8px", lineHeight: "1.1" }}>Fruit Salad <br /> <span style={{ color: "#818cf8" }}>Sub</span></h3>
              </div>
              <div style={{ position: "absolute", top: "18px", right: "18px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", padding: "8px 12px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: "1", minWidth: "75px" }}>
                <span style={{ fontSize: "9px", opacity: 0.8 }}>From</span>
                <strong style={{ fontSize: "16px", fontWeight: 800 }}>₹599</strong>
              </div>
            </div>
            <div className="card-image" style={{ position: "absolute", right: "-10px", bottom: "-10px", width: "190px" }}>
              <img src="/highlight/fruit.png" alt="Fruit Salad" style={{ width: "100%", transform: "scale(1.55) translateY(-10px)", transition: "all 0.4s ease", filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.4))" }} />
            </div>
            <div style={{ marginTop: "auto", maxWidth: "60%" }}>
              <p className="card-desc" style={{ fontSize: "13px", lineHeight: "1.4", opacity: 0.9, marginBottom: "16px", minHeight: "40px", display: "flex", alignItems: "center" }}>Fresh bowls to your doorstep.</p>
              <button onClick={() => navigate("/subscribe")} style={{ background: "#fff", color: "#0a1854", border: "none", padding: "10px 20px", borderRadius: "16px", fontWeight: 800, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                Subscribe <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Healthy Meals Card */}
        <div
          className="highlight-card meals-card"
          style={{
            position: "relative", flex: "0 0 auto", scrollSnapAlign: "start",
            width: "420px", height: "280px", background: "#7f1d1d",
            borderRadius: "32px", padding: "24px", color: "#fff",
            fontFamily: "'Inter', sans-serif", overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(127, 29, 29, 0.3)",
          }}
        >
          <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "280px", height: "280px", background: "radial-gradient(circle, rgba(248,113,113,0.3) 0%, rgba(0,0,0,0) 70%)", zIndex: 1 }} />
          <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", background: "#ef4444", padding: "4px 10px", borderRadius: "100px" }}>Homemade Quality</span>
                <h3 className="card-title" style={{ fontSize: "30px", fontWeight: 900, marginTop: "8px", lineHeight: "1.1" }}>Healthy <br /> <span style={{ color: "#fca5a5" }}>Meals</span></h3>
              </div>
              <div style={{ position: "absolute", top: "18px", right: "18px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", padding: "8px 12px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: "1", minWidth: "75px" }}>
                <span style={{ fontSize: "9px", opacity: 0.8 }}>Monthly</span>
                <strong style={{ fontSize: "16px", fontWeight: 800 }}>₹3,299</strong>
              </div>
            </div>
            <div className="card-image" style={{ position: "absolute", right: "-15px", bottom: "-5px", width: "200px" }}>
              <img src="/highlight/meals.png" alt="Healthy Meals" style={{ width: "100%", transform: "scale(1.55) translateY(-6px)", transition: "all 0.4s ease", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.4))" }} />
            </div>
            <div style={{ marginTop: "auto", maxWidth: "60%" }}>
              <p className="card-desc" style={{ fontSize: "13px", lineHeight: "1.4", opacity: 0.9, marginBottom: "16px", minHeight: "40px", display: "flex", alignItems: "center" }}>Balanced meals for professionals.</p>
              <button
                onClick={() => navigate("/subscribe?planCategory=meal")}
                style={{ background: "#fff", color: "#7f1d1d", border: "none", padding: "10px 20px", borderRadius: "16px", fontWeight: 800, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                Meal Plan <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div
        className="home-category-filter"
        style={{
          display: "flex", gap: 12, overflowX: "auto",
          padding: "20px 0", marginBottom: 40, scrollBehavior: "smooth"
        }}
      >
        {[
          { key: "all", label: "All", icon: "🌟" },
          { key: "vegetable", label: "Vegetables", icon: "🥬" },
          { key: "fruits", label: "Fruits", icon: "🍎" },
          { key: "juice", label: "Juices", icon: "🧃" },
          { key: "solar dry powders", label: "Powders", icon: "💫" },
          { key: "combo packs", label: "Combos", icon: "📦" },
          { key: "fruit salad", label: "Salads", icon: "🥗" },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: "12px 22px",
              background: activeCategory === cat.key
                ? "linear-gradient(135deg, #22C55E 0%, #16a34a 100%)"
                : "#ffffff",
              color: activeCategory === cat.key ? "#ffffff" : "#374151",
              border: activeCategory === cat.key ? "none" : "1px solid #e5e7eb",
              borderRadius: 30, cursor: "pointer", fontSize: 14, fontWeight: 600,
              whiteSpace: "nowrap", transition: "all 0.25s ease",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: activeCategory === cat.key
                ? "0 8px 20px rgba(34,197,94,0.35)"
                : "0 4px 10px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== cat.key) {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== cat.key) {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="home-products-scroll">
        <div
          id="products-section"
          className="product-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: "25px"
          }}
        >
        {products
          .filter((product) => product.isActive === true || product.isActive === undefined)
          .filter((product) => !isHiddenCategory(product.category))
          .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
          .filter((product) => {
            const category = normalizeCategoryKey(product.category);
            const selectedCategory = normalizeCategoryKey(activeCategory);
            if (campaignMode) return category === normalizeCategoryKey(campaignMode);
            return selectedCategory === "all" ? true : category === selectedCategory;
          })
          .map((product) => {
            const availableVariants = getDisplayVariants(product);
            if (!availableVariants || availableVariants.length === 0) return null;
            const totalStock = Number(product?.stockQuantity || 0);
            const isOutOfStock = totalStock <= 0;
            const productImageSources = getProductImageSources(product);
            const productImage = productImageSources[0] || "";
            const selectedVariantId = selectedVariantIds[product._id];
            const selectedVariant =
              availableVariants.find((variant) => String(variant._id) === String(selectedVariantId)) ||
              getDefaultListingVariant(product, availableVariants) ||
              availableVariants[0];
            const referencePrice = getReferenceMarketPrice(selectedVariant?.price);

            return (
              <div
                key={product._id}
                className="product-card"
                style={{
                  background: "#ffffff", borderRadius: 18, padding: 14,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)", border: "1px solid #eef2f7",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  transition: "0.25s ease", cursor: "pointer", position: "relative",
                  opacity: isOutOfStock ? 0.65 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 25px 60px rgba(34,197,94,0.35)";
                  const img = e.currentTarget.querySelector("img");
                  if (img) img.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 18px 45px rgba(0,0,0,0.12)";
                  const img = e.currentTarget.querySelector("img");
                  if (img) img.style.transform = "scale(1)";
                }}
              >
                {isOutOfStock && (
                 <div
  style={{
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%) rotate(-15deg)",
    zIndex: 6,
    border: "3px solid #d11f1f",
    color: "#d11f1f",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0,
    padding: "6px 16px",
    background: "rgba(255,255,255,0.85)",
    borderRadius: 4,
    textTransform: "uppercase",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
    pointerEvents: "none",
  }}
>
  OUT OF STOCK
</div>
                )}

                {productImage && (
                  <div className="product-img-wrap" style={{ overflow: "hidden", borderRadius: 12 }}>
                    <img
                      src={productImage}
                      alt={product.name}
                      data-fallback-index="0"
                      onError={(e) => {
                        const currentIndex = Number(e.currentTarget.dataset.fallbackIndex || "0");
                        const nextIndex = currentIndex + 1;
                        const nextSrc = productImageSources[nextIndex];
                        if (nextSrc) {
                          e.currentTarget.dataset.fallbackIndex = String(nextIndex);
                          e.currentTarget.src = nextSrc;
                          return;
                        }
                        e.currentTarget.onerror = null;
                      }}
                      style={{
                        width: "100%", height: 130, objectFit: "contain",
                        borderRadius: 12, marginBottom: 8,
                        background: "#f5f8f4", padding: 8, transition: "0.3s ease"
                      }}
                    />
                  </div>
                )}

                <button
                  className="product-fav-btn"
                  onClick={(e) => handleFav(e, product._id)}
                  style={{
                    position: "absolute", top: 4, right: 4,
                    background: "rgba(255,255,255,0.95)", border: "none",
                    width: 22, height: 22, borderRadius: "50%", cursor: "pointer",
                    fontSize: 12, display: "flex", alignItems: "center",
                    justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.12)", zIndex: 5
                  }}
                >
                  {favs.includes(product._id) ? "❤️" : "🤍"}
                </button>

                <h3
                  className="product-name"
                  style={{ fontSize: 14, fontWeight: 600, margin: "4px 0", textAlign: "left", color: "#222" }}
                >
                  {product.name}
                </h3>

                {/* Variant chips — clickable size buttons with per-variant pricing */}
                {availableVariants.length > 1 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "6px 0" }}>
                    {availableVariants.map((variant) => {
                      const isActive = selectedVariant._id === variant._id;
                      return (
                        <button
                          key={variant._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVariantIds((prev) => ({ ...prev, [product._id]: variant._id }));
                          }}
                          style={{
                            padding: "4px 10px", borderRadius: 20,
                            border: isActive ? "1.5px solid #16a34a" : "1px solid #e0e0e0",
                            background: isActive ? "#f0fdf4" : "#f9fafb",
                            color: isActive ? "#16a34a" : "#555",
                            fontSize: 11, fontWeight: isActive ? 700 : 500,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          {variant.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="product-variant-name" style={{ margin: "6px 0", fontSize: 13, fontWeight: 500, color: "#555" }}>
                    {selectedVariant.name}
                  </p>
                )}

                <p
                  className="product-price"
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    margin: "4px 0 8px 0",
                    color: "#1b5e20",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {referencePrice ? (
                    <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", fontWeight: 600 }}>
                      {"\u20B9"}{formatPrice(referencePrice)}
                    </span>
                  ) : null}
                  <span>{"\u20B9"}{formatPrice(selectedVariant.price)}</span>
                </p>

                {isOutOfStock ? (
                  <button
                    disabled
                    style={{
                      padding: "10px 0", background: "#e5e7eb", color: "#6b7280",
                      borderRadius: 28, border: "none", fontWeight: 700, width: "100%"
                    }}
                  >
                    Out Of Stock
                  </button>
                ) : getItemQuantity(product._id, selectedVariant._id) === 0 ? (
                  <button
                    className="add-btn"
                    onClick={() => handleAddToCart(product, selectedVariant)}
                    style={{
                      padding: "10px 0", background: "#22C55E", color: "#ffffff",
                      borderRadius: 28, border: "none", fontWeight: 600, cursor: "pointer",
                      width: "100%", transition: "all 0.25s ease",
                      boxShadow: "0 4px 12px rgba(34,197,94,0.25)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    ADD
                  </button>
                ) : (
                  <div
                    className="qty-stepper"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 14, marginTop: 7, background: "#e8f5e9",
                      borderRadius: 24, padding: "6px 12px",
                    }}
                  >
                    <button
                      className="qty-btn"
                      onClick={() => {
                        updateCartQuantity(product._id, selectedVariant._id, -1);
                        const updatedCart = getCart();
                        setCart(updatedCart);
                        setCartCount(getCartCount());
                      }}
                      style={{
                        background: "#2e7d32", color: "#fff", border: "none",
                        width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
                        fontWeight: 700, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 16, lineHeight: "28px", padding: 0
                      }}
                    >
                      -
                    </button>
                    <span
                      className="qty-count"
                      style={{ fontWeight: 700, fontSize: 15, color: "#1b5e20", minWidth: 18, textAlign: "center" }}
                    >
                      {getItemQuantity(product._id, selectedVariant._id)}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() => {
                        updateCartQuantity(product._id, selectedVariant._id, 1);
                        const updatedCart = getCart();
                        setCart(updatedCart);
                        setCartCount(getCartCount());
                      }}
                      style={{
                        background: "#2e7d32", color: "#fff", border: "none",
                        width: 42, height: 42, borderRadius: "50%", cursor: "pointer",
                        fontWeight: 700, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 16, lineHeight: "28px", padding: 0
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING CART BAR */}
      {cartCount > 0 && (
        <div
          className="home-floating-cart"
          style={{
            position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
            backdropFilter: "blur(12px)", background: "rgba(108, 85, 85, 0.85)",
            border: "1px solid rgba(0,0,0,0.06)", color: "#111827",
            padding: "14px 24px", borderRadius: 60, display: "flex",
            alignItems: "center", gap: 24, boxShadow: "0 25px 60px rgba(0,0,0,0.12)",
            zIndex: 4000, transition: "all 0.3s ease"
          }}
        >
          <span style={{ fontWeight: 600 }}>🛒 {cartCount} Items</span>
          <span style={{ fontWeight: 700 }}>₹{cartTotal}</span>
          <Link to="/cart" style={{ background: "#22C55E", color: "#ffffff", padding: "8px 18px", borderRadius: 30, textDecoration: "none", fontWeight: 600, boxShadow: "0 8px 20px rgba(34,197,94,0.3)", transition: "0.2s ease" }}>
            View Cart
          </Link>
        </div>
      )}

      {/* LOCATION MODAL */}
      {showMapModal === true && user && !REVIEW_MODE_ENABLED && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 6000, padding: "20px"
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              width: "100%", maxWidth: 900, height: "80vh", maxHeight: 700,
              background: "#fff", borderRadius: 20, overflow: "hidden",
              position: "relative", display: "flex", flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Select Delivery Location
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none", border: "none", fontSize: 28,
                  cursor: "pointer", color: "#6b7280", padding: 4, lineHeight: 1, fontWeight: 300
                }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <MapSelector
                onLocationSelect={handleLocationSelect}
                onClose={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}

      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          const updatedUser = JSON.parse(localStorage.getItem("divasa_user"));
          setUser(updatedUser);
          setShowLoginModal(false);
        }}
      />

      {showAddressPicker && user && !REVIEW_MODE_ENABLED && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 6500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#fff",
              borderRadius: 18,
              padding: 20,
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 6 }}>Hi {user?.name || "Customer"} 👋</h3>
            <p style={{ margin: 0, marginBottom: 16, color: "#555", fontSize: 14 }}>
              Select your delivery address to start shopping.
            </p>

            {savedAddresses.length === 0 ? (
              <div style={{ border: "1px dashed #16a34a", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <p style={{ margin: 0, marginBottom: 10, fontSize: 13 }}>
                  No saved address found. Add your address first.
                </p>
                <button
                  onClick={openAddAddressFlow}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: 10,
                    background: "#16a34a",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Add Address
                </button>
              </div>
            ) : (
              <>
                {savedAddresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => {
                      const lat = addr.lat ?? addr.latitude;
                      const lng = addr.lng ?? addr.longitude;
                      const locationName = addr.mapAddress || addr.addressLine || `${addr.flatNo || ""}, ${addr.landmark || ""}`;
                      if (lat && lng) {
                        localStorage.setItem("divasa_location_lat", lat);
                        localStorage.setItem("divasa_location_lng", lng);
                        localStorage.setItem("divasa_location_name", locationName);
                      }
                      setHeaderLocation(locationName);
                      setDeliveryAddress(locationName);
                      setShowAddressPicker(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{addr.addressType || "Address"}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {addr.flatNo || ""}{addr.landmark ? `, ${addr.landmark}` : ""}{addr.mapAddress ? `, ${addr.mapAddress}` : ""}
                    </div>
                  </button>
                ))}

                <button
                  onClick={openAddAddressFlow}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #16a34a",
                    borderRadius: 10,
                    background: "#f0fdf4",
                    color: "#166534",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: 4,
                  }}
                >
                  Add New Address
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!user && !REVIEW_MODE_ENABLED && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.88)",
            zIndex: 5000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 12px 30px rgba(0,0,0,0.12)", maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>Login Required</h3>
            <p style={{ color: "#555", fontSize: 14 }}>Please login first to start shopping.</p>
            <button
              onClick={() => window.dispatchEvent(new Event("openLoginModal"))}
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "none",
                borderRadius: 10,
                background: "#16a34a",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Login To Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
