import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CustomerLoginModal from "../components/CustomerLoginModal";
import api, { getAssetCandidates, getAssetUrl, resolveImagePath } from "../services/api";
import { loadCashfreeClient } from "../utils/loadCashfree";
import "./BulkOrder.css";

const EVENT_TYPES = [
  { key: "marriage", backendValue: "wedding", label: "Marriage" },
  { key: "function", backendValue: "function", label: "Function" },
  { key: "corporate_event", backendValue: "corporate_event", label: "Corporate Event" },
  { key: "birthday_party", backendValue: "birthday", label: "Birthday Party" },
  { key: "housewarming", backendValue: "other_event", label: "Housewarming" },
  { key: "festival_order", backendValue: "other_event", label: "Festival Order" },
  { key: "community_event", backendValue: "other_event", label: "Community Event" },
  { key: "other_event", backendValue: "other_event", label: "Other Event" },
];

const DELIVERY_SLOTS = [
  "6:00 AM - 9:00 AM",
  "9:00 AM - 12:00 PM",
  "12:00 PM - 3:00 PM",
  "3:00 PM - 6:00 PM",
  "6:00 PM - 9:00 PM",
];

const TIP_OPTIONS = [20, 30, 50, 100];
const DEFAULT_BULK_CONTENT = {
  hero: {
    tag: "Bulk Order For Events",
    title: "Plan once. Get farm-fresh delivery for your event kitchen.",
    subtitle: "Wholesale pricing, flexible packs, and scheduled delivery for events and large kitchens.",
  },
  highlights: [
    {
      key: "bulk_event_1",
      title: "Farm-fresh picks for every guest",
      subtitle: "Vegetables, fruits, and staples in one booking.",
      tag: "Popular",
      color: "#166534",
      image: "/highlight/Event-1.png",
    },
    {
      key: "bulk_event_2",
      title: "Wholesale savings for event kitchens",
      subtitle: "Flexible kg pack sizes with better value.",
      tag: "Save More",
      color: "#1d4ed8",
      image: "/highlight/Event-2.png",
    },
    {
      key: "bulk_event_3",
      title: "Smart pre-planning for large event orders",
      subtitle: "Schedule in advance and get complete event-ready supply.",
      tag: "New",
      color: "#a16207",
      image: "/highlight/Event-3.png",
    },
  ],
};

const fmt = (value = 0) => `Rs ${Number(value || 0).toFixed(0)}`;
const today = () => new Date().toISOString().slice(0, 10);
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const getAddressLine = (address) =>
  [address?.flatNo, address?.building, address?.landmark, address?.mapAddress || address?.addressLine]
    .filter(Boolean)
    .join(", ");

const getByUiKey = (value = "") => EVENT_TYPES.find((item) => item.key === value) || EVENT_TYPES[0];

const getEligibleTiers = (product) =>
  (product?.priceTiers || []).filter((tier) => Number(tier.quantity || 0) >= 3);

const getEffectiveUnitPrice = (product, tier) => {
  const tierPrice = Number(tier?.unitPrice || 0);
  if (tierPrice > 0) return tierPrice;

  const retail = Number(product?.retailPrice || 0);
  if (retail > 0) {
    return Math.max(1, retail - Math.max(2, Math.round(retail * 0.12)));
  }
  return 1;
};

const getTierTotal = (product, tier) => getEffectiveUnitPrice(product, tier) * Number(tier?.quantity || 0);
const getVisualAsset = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/highlight/")) return path;
  return getAssetUrl(path);
};

export default function BulkOrder() {
  const navigate = useNavigate();
  const productsRef = useRef(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("divasa_user") || "null"));
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("divasa_token") || localStorage.getItem("customerToken") || localStorage.getItem("token")));
  const [catalog, setCatalog] = useState([]);
  const [bulkContent, setBulkContent] = useState(DEFAULT_BULK_CONTENT);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [eventProfiles, setEventProfiles] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [profile, setProfile] = useState(null);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [selectedTiers, setSelectedTiers] = useState({});
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [tip, setTip] = useState(null);
  const [customTip, setCustomTip] = useState("");

  const [scheduleType, setScheduleType] = useState("standard");
  const [scheduleDate, setScheduleDate] = useState(today());
  const [scheduleSlot, setScheduleSlot] = useState(DELIVERY_SLOTS[0]);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [locationLabel, setLocationLabel] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const [reg, setReg] = useState({
    eventType: "marriage",
    receiverName: "",
    receiverPhone: "",
    locationLabel: "",
    deliveryAddress: "",
    location: { lat: null, lng: null },
  });

  const storageKey = useMemo(() => {
    const phone = String(user?.phone || reg.receiverPhone || "guest").trim();
    return `bulk_active_event_${phone}`;
  }, [reg.receiverPhone, user?.phone]);

  const refreshUser = useCallback(() => {
    setUser(JSON.parse(localStorage.getItem("divasa_user") || "null"));
    setLoggedIn(Boolean(localStorage.getItem("divasa_token") || localStorage.getItem("customerToken") || localStorage.getItem("token")));
  }, []);

  useEffect(() => {
    window.addEventListener("userUpdated", refreshUser);
    return () => window.removeEventListener("userUpdated", refreshUser);
  }, [refreshUser]);

  useEffect(() => {
    if (!profile) return;
    setReceiverName(profile.receiverName || profile.ownerName || "");
    setReceiverPhone(profile.receiverPhone || profile.phone || "");
    setDeliveryAddress(profile.deliveryAddress || "");
  }, [profile]);

  const fetchAddresses = useCallback(async (currentUser) => {
    if (!currentUser?.phone) return;
    try {
      const res = await api.get(`/addresses/${currentUser.phone}`);
      const sorted = [...res.data].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
      setSavedAddresses(sorted);
      const firstAddress = sorted[0] || null;
      if (firstAddress) {
        setSelectedAddress(firstAddress);
      }
    } catch {
      setSavedAddresses([]);
      setSelectedAddress(null);
    }
  }, []);

  const fetchData = useCallback(async (forcedId = "") => {
    setLoading(true);
    try {
      const hasToken = Boolean(localStorage.getItem("divasa_token") || localStorage.getItem("customerToken") || localStorage.getItem("token"));
      if (!hasToken) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }

      setLoggedIn(true);
      const [catalogRes, businessRes] = await Promise.all([
        api.get("/bulk/catalog"),
        api.get("/bulk/businesses").catch(() => ({ data: { businesses: [] } })),
      ]);

      const products = catalogRes.data?.products || [];
      const backendCategories = catalogRes.data?.categories || [];
      const content = catalogRes.data?.bulkContent || {};
      setCatalog(products);
      setCategories(["All", ...backendCategories]);
      const sourceHighlights = Array.isArray(content.highlights) && content.highlights.length
        ? content.highlights
        : [];
      const normalizedHighlights = DEFAULT_BULK_CONTENT.highlights.map((fallback, index) => {
        const source = sourceHighlights[index] || {};
        return {
          ...fallback,
          ...source,
          key: source.key || fallback.key,
          image: fallback.image,
        };
      });
      setBulkContent({
        hero: { ...DEFAULT_BULK_CONTENT.hero, ...(content.hero || {}) },
        highlights: normalizedHighlights,
      });

      const events = (businessRes.data?.businesses || []).filter((entry) => entry.accountType === "event");
      setEventProfiles(events);

      const storedId = localStorage.getItem(storageKey) || "";
      const activeId = forcedId || storedId || events?.[0]?._id || "";
      setSelectedEventId(activeId);

      if (!activeId) {
        setProfile(null);
      } else {
        localStorage.setItem(storageKey, activeId);
        const profileRes = await api.get("/bulk/me", { params: { businessId: activeId } });
        const nextProfile = profileRes.data?.profile || null;
        if (nextProfile?.accountType === "event") {
          setProfile(nextProfile);
        } else {
          setProfile(null);
        }
      }

      await fetchAddresses(JSON.parse(localStorage.getItem("divasa_user") || "null"));
    } catch {
      setLoggedIn(false);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses, storageKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!selectedAddress) return;
    const line = getAddressLine(selectedAddress);
    const lat = Number(selectedAddress.lat ?? selectedAddress.latitude ?? 0) || null;
    const lng = Number(selectedAddress.lng ?? selectedAddress.longitude ?? 0) || null;

    if (profile) {
      if (!deliveryAddress) setDeliveryAddress(line);
      if (!locationLabel) setLocationLabel(selectedAddress.addressType || selectedAddress.building || "");
      if (!profile.location?.lat && !profile.location?.lng) {
        setProfile((current) => current ? { ...current, location: { lat, lng } } : current);
      }
    } else {
      setReg((current) => ({
        ...current,
        deliveryAddress: current.deliveryAddress || line,
        locationLabel: current.locationLabel || selectedAddress.addressType || selectedAddress.building || "",
        location: current.location?.lat || current.location?.lng ? current.location : { lat, lng },
        receiverName: current.receiverName || user?.name || "",
        receiverPhone: current.receiverPhone || user?.phone || "",
      }));
    }
  }, [deliveryAddress, locationLabel, profile, selectedAddress, user?.name, user?.phone]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog.filter((product) => {
      const tiers = getEligibleTiers(product);
      if (!tiers.length) return false;
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
      const queryMatch = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
      return categoryMatch && queryMatch;
    });
  }, [catalog, search, selectedCategory]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.lineTotal, 0), [cart]);
  const retailTotal = useMemo(() => cart.reduce((sum, item) => sum + item.retailPrice * item.quantity, 0), [cart]);

  const deliveryFee = subtotal >= 1500 ? 0 : subtotal >= 1000 ? 100 : subtotal >= 500 ? 150 : subtotal > 0 ? 200 : 0;
  const handlingFee = subtotal >= 1500 ? 0 : subtotal >= 1000 ? 10 : subtotal >= 500 ? 20 : subtotal > 0 ? 30 : 0;
  const tipAmount = tip !== null ? tip : (customTip ? parseFloat(customTip) || 0 : 0);
  const productSaving = Math.max(0, retailTotal - subtotal);
  const deliverySaving = subtotal >= 1500 ? 200 : 0;
  const handlingSaving = subtotal > 0 ? 30 - handlingFee : 0;
  const totalSavings = Math.max(0, productSaving + deliverySaving + handlingSaving + couponDiscount);
  const grandTotal = Math.max(0, subtotal + deliveryFee + handlingFee + tipAmount - couponDiscount);
  const totalPacks = cart.reduce((sum, item) => sum + item.packCount, 0);

  const canCheckout = Boolean(profile && cart.length > 0);
  const highlightCards = (bulkContent.highlights || DEFAULT_BULK_CONTENT.highlights).slice(0, 3);

  useEffect(() => {
    if (highlightCards.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setHighlightIndex((current) => (current + 1) % highlightCards.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [highlightCards.length]);

  useEffect(() => {
    if (highlightIndex > highlightCards.length - 1) {
      setHighlightIndex(0);
    }
  }, [highlightCards.length, highlightIndex]);

  const goToProducts = useCallback(() => {
    setSelectedCategory("All");
    setSearch("");
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const applyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponCode(couponInput.trim().toUpperCase());
    setCouponDiscount(25);
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponInput("");
  };

  const changeCartCount = (product, delta) => {
    const tiers = getEligibleTiers(product);
    const selectedTierIndex = selectedTiers[product._id] || 0;
    const tier = tiers[selectedTierIndex] || tiers[0];
    if (!tier) return;

    const unitPrice = getEffectiveUnitPrice(product, tier);
    const lineTotal = getTierTotal(product, tier);

    setCart((current) => {
      const index = current.findIndex((entry) => entry.productId === product._id && entry.selectedTierLabel === tier.label);
      if (index < 0) {
        if (delta < 0) return current;
        return [
          ...current,
          {
            productId: product._id,
            name: product.name,
            image: product.image,
            category: product.category,
            quantity: tier.quantity,
            unit: tier.unit,
            unitPrice,
            retailPrice: Number(product.retailPrice || 0),
            selectedTierLabel: tier.label,
            lineTotal,
            packSize: tier.quantity,
            packCount: 1,
          },
        ];
      }

      const next = [...current];
      const nextCount = Number(next[index].packCount || 1) + delta;
      if (nextCount <= 0) {
        return next.filter((_, itemIndex) => itemIndex !== index);
      }

      next[index] = {
        ...next[index],
        unitPrice,
        packCount: nextCount,
        quantity: tier.quantity * nextCount,
        lineTotal: lineTotal * nextCount,
      };
      return next;
    });
  };

  const registerEvent = async () => {
    if (!reg.receiverName.trim() || !reg.receiverPhone.trim() || !reg.locationLabel.trim() || !reg.deliveryAddress.trim()) {
      alert("Please complete all receiver and delivery details.");
      return;
    }

    setSavingProfile(true);
    try {
      const eventSelection = getByUiKey(reg.eventType);
      const response = await api.post("/bulk/register", {
        accountType: "event",
        businessName: eventSelection.label,
        ownerName: reg.receiverName.trim(),
        phone: reg.receiverPhone.trim(),
        eventType: eventSelection.backendValue,
        billingCycle: "monthly",
        deliveryPreference: "one_time",
        deliveryAddress: reg.deliveryAddress.trim(),
        location: reg.location,
        receiverName: reg.receiverName.trim(),
        receiverPhone: reg.receiverPhone.trim(),
      });

      const eventId = response.data?.business?._id || "";
      setReg((current) => ({ ...current, locationLabel: "", deliveryAddress: "" }));
      await fetchData(eventId);
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to create event bulk profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const buildBulkOrderPayload = () => {
    const resolvedDate = scheduleType === "scheduled" ? scheduleDate : scheduleType === "next_day" ? tomorrow() : "";
    const resolvedLocation = profile?.location || { lat: null, lng: null };
    return {
      businessId: profile?._id,
      orderType: "one_time",
      scheduleType,
      scheduleDate: resolvedDate,
      scheduleSlot: scheduleType === "standard" ? "20-30 mins" : scheduleSlot,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      location: resolvedLocation,
      locationLabel: locationLabel.trim(),
      paymentMethod,
      paymentMode: paymentMethod === "online" ? "pay_now" : "pay_later",
      deliveryNotes: deliveryNotes.trim(),
      tipAmount,
      couponCode,
      couponDiscount,
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        retailPrice: item.retailPrice,
        selectedTierLabel: item.selectedTierLabel,
      })),
    };
  };

  const syncEventProfile = async (payload) => {
    await api.put(
      "/bulk/me",
      {
        businessId: profile._id,
        ownerName: payload.receiverName,
        receiverName: payload.receiverName,
        receiverPhone: payload.receiverPhone,
        deliveryAddress: payload.deliveryAddress,
        location: payload.location,
      },
      { params: { businessId: profile._id } }
    );
  };

  const completePostOrderState = () => {
    setCart([]);
    setCheckoutOpen(false);
    removeCoupon();
    setTip(null);
    setCustomTip("");
    setDeliveryNotes("");
    navigate("/order-success?type=bulk");
  };

  const submitBulkOrder = async () => {
    const payload = buildBulkOrderPayload();
    await api.post("/bulk/orders", payload, { params: { businessId: profile._id } });
    await syncEventProfile(payload);
    completePostOrderState();
  };

  const launchBulkOnlinePayment = async () => {
    const cashfree = await loadCashfreeClient();

    const orderRes = await api.post("/payment/create-order", {
      amount: grandTotal,
      currency: "INR",
      receipt: `bulk_${profile._id}_${Date.now()}`,
    });

    const { order_id, payment_session_id } = orderRes.data || {};
    if (!order_id || !payment_session_id) {
      throw new Error("Invalid payment order response");
    }

    const checkoutResult = await cashfree.checkout({
      paymentSessionId: payment_session_id,
      redirectTarget: "_modal",
    });

    if (checkoutResult?.error) {
      throw new Error(checkoutResult.error.message || "Payment failed. Please try again.");
    }

    const verifyRes = await api.post("/payment/verify", {
      cashfree_order_id: order_id,
    });

    if (!verifyRes?.data?.success) {
      throw new Error("Payment verification failed");
    }

    await submitBulkOrder();
  };

  const placeBulkOrder = async () => {
    if (!profile) return;
    if (!cart.length) {
      alert("Add products first.");
      return;
    }
    if (!deliveryAddress.trim() || !locationLabel.trim()) {
      alert("Please fill delivery location details.");
      return;
    }
    if (!receiverName.trim() || !receiverPhone.trim()) {
      alert("Please fill receiver details.");
      return;
    }

    setPlacingOrder(true);
    try {
      if (paymentMethod === "online") {
        await launchBulkOnlinePayment();
        return;
      }
      await submitBulkOrder();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to place bulk order.");
      if (paymentMethod === "online") {
        setPlacingOrder(false);
      }
    } finally {
      if (paymentMethod !== "online") {
        setPlacingOrder(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="bulk-page-root">
        <Header />
        <div className="bulk-loading">Loading bulk order dashboard...</div>
      </div>
    );
  }

  if (!loggedIn || !user) {
    return (
      <div className="bulk-page-root">
        <Header />
        <div className="bulk-gate">
          <h2>Login required for event bulk ordering</h2>
          <p>Sign in to create event profiles, add bulk items, and place scheduled orders.</p>
          <button type="button" onClick={() => setShowLoginModal(true)}>Login to continue</button>
        </div>
        <CustomerLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            refreshUser();
            setShowLoginModal(false);
            fetchData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="bulk-page-root">
      <Header />

      <main className="bulk-wrap">
        <section className="bulk-hero">
          <div>
            <p className="bulk-hero-tag">{bulkContent.hero?.tag || DEFAULT_BULK_CONTENT.hero.tag}</p>
            <h1>{bulkContent.hero?.title || DEFAULT_BULK_CONTENT.hero.title}</h1>
            <p>{bulkContent.hero?.subtitle || DEFAULT_BULK_CONTENT.hero.subtitle}</p>
            <div className="bulk-hero-pill-row">
              <span>Event-ready delivery</span>
              <span>Smart pack filters</span>
              <span>Quick repeat ordering</span>
            </div>
          </div>
          <div className="bulk-hero-stats">
            <div>
              <span>Profiles</span>
              <strong>{eventProfiles.length}</strong>
            </div>
            <div>
              <span>Products</span>
              <strong>{catalog.length}</strong>
            </div>
            <div>
              <span>Bulk Savings</span>
              <strong>{fmt(totalSavings)}</strong>
            </div>
          </div>
        </section>

        <section className="bulk-highlight-carousel" aria-label="Bulk highlights">
          <div className="bulk-highlight-viewport">
            <div
              className="bulk-highlight-track"
              style={{ transform: `translateX(-${highlightIndex * 100}%)` }}
            >
              {highlightCards.map((card, idx) => (
                <button
                  key={card.key || `${card.title}_${idx}`}
                  type="button"
                  className="bulk-highlight-card"
                  onClick={goToProducts}
                >
                  {card.image ? (
                    <img src={getVisualAsset(card.image)} alt={card.title || "Bulk highlight"} />
                  ) : (
                    <div className="bulk-highlight-fallback">DF</div>
                  )}
                  <span className="bulk-highlight-cta">Order Now</span>
                </button>
              ))}
            </div>
          </div>

          {highlightCards.length > 1 && (
            <>
              <button
                type="button"
                className="bulk-highlight-nav prev"
                onClick={() =>
                  setHighlightIndex((current) =>
                    current === 0 ? highlightCards.length - 1 : current - 1
                  )
                }
                aria-label="Previous highlight"
              >
                ‹
              </button>
              <button
                type="button"
                className="bulk-highlight-nav next"
                onClick={() =>
                  setHighlightIndex((current) => (current + 1) % highlightCards.length)
                }
                aria-label="Next highlight"
              >
                ›
              </button>

              <div className="bulk-highlight-dots">
                {highlightCards.map((card, idx) => (
                  <button
                    key={`dot_${card.key || idx}`}
                    type="button"
                    className={idx === highlightIndex ? "active" : ""}
                    onClick={() => setHighlightIndex(idx)}
                    aria-label={`Go to highlight ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {!profile ? (
          <section className="bulk-card bulk-register">
            <h2>Create Event Profile</h2>
            <p>Complete this once to unlock bulk catalog and checkout.</p>

            <div className="bulk-form-grid">
              <label>
                Event type
                <select
                  value={reg.eventType}
                  onChange={(e) => setReg((current) => ({ ...current, eventType: e.target.value }))}
                >
                  {EVENT_TYPES.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Receiver name
                <input
                  value={reg.receiverName}
                  onChange={(e) => setReg((current) => ({ ...current, receiverName: e.target.value }))}
                  placeholder="Enter receiver name"
                />
              </label>

              <label>
                Receiver phone
                <input
                  value={reg.receiverPhone}
                  onChange={(e) => setReg((current) => ({ ...current, receiverPhone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Location label
                <input
                  value={reg.locationLabel}
                  onChange={(e) => setReg((current) => ({ ...current, locationLabel: e.target.value }))}
                  placeholder="Office, Hall, Venue"
                />
              </label>
            </div>

            <label className="bulk-full-width">
              Delivery address
              <textarea
                value={reg.deliveryAddress}
                onChange={(e) => setReg((current) => ({ ...current, deliveryAddress: e.target.value }))}
                placeholder="Enter complete delivery address"
              />
            </label>

            {savedAddresses.length > 0 && (
              <div className="bulk-address-list">
                {savedAddresses.slice(0, 3).map((address) => (
                  <button
                    key={address._id}
                    type="button"
                    className={`bulk-address-chip ${selectedAddress?._id === address._id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedAddress(address);
                      const line = getAddressLine(address);
                      const lat = Number(address.lat ?? address.latitude ?? 0) || null;
                      const lng = Number(address.lng ?? address.longitude ?? 0) || null;
                      setReg((current) => ({
                        ...current,
                        deliveryAddress: line,
                        locationLabel: current.locationLabel || address.addressType || address.building || "",
                        location: { lat, lng },
                        receiverName: current.receiverName || user.name || "",
                        receiverPhone: current.receiverPhone || user.phone || "",
                      }));
                    }}
                  >
                    <strong>{address.addressType || "Address"}</strong>
                    <span>{getAddressLine(address)}</span>
                  </button>
                ))}
              </div>
            )}

            <button type="button" className="bulk-primary-btn" disabled={savingProfile} onClick={registerEvent}>
              {savingProfile ? "Creating Profile..." : "Create Event Bulk Profile"}
            </button>
          </section>
        ) : (
          <>
            <section className="bulk-card bulk-profile-strip">
              <div>
                <p className="bulk-hero-tag">Active Event</p>
                <h2>{profile.businessName || "Event Profile"}</h2>
                <p>{profile.deliveryAddress || "Add delivery address in checkout"}</p>
              </div>
              <div className="bulk-profile-actions">
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedEventId(nextId);
                    localStorage.setItem(storageKey, nextId);
                    fetchData(nextId);
                  }}
                >
                  {eventProfiles.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.businessName || item.receiverName || item.ownerName}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => setCheckoutOpen(true)} disabled={!canCheckout}>
                  Checkout ({totalPacks} packs)
                </button>
              </div>
            </section>

            <section className="bulk-toolbar">
              <div className="bulk-toolbar-head">
                <div>
                  <p>Catalog Filters</p>
                  <h3>Find packs quickly by category</h3>
                </div>
                <span>{filteredProducts.length} items</span>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or category"
              />
              <div className="bulk-cat-scroll">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={selectedCategory === category ? "active" : ""}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            <section className="bulk-product-grid" ref={productsRef}>
              {filteredProducts.map((product) => {
                const tiers = getEligibleTiers(product);
                if (!tiers.length) return null;
                const selectedTierIndex = selectedTiers[product._id] || 0;
                const selectedTier = tiers[selectedTierIndex] || tiers[0];
                const cartEntry = cart.find((item) => item.productId === product._id && item.selectedTierLabel === selectedTier.label);
                const mrpTotal = Number(product.retailPrice || 0) * Number(selectedTier.quantity || 0);

                return (
                  <article key={product._id} className="bulk-product-card">
                    <div className="bulk-product-image-wrap">
                      {resolveImagePath(product) ? (
                        (() => {
                          const candidates = getAssetCandidates(resolveImagePath(product));
                          return (
                            <img
                              src={candidates[0] || "/vite.svg"}
                              alt={product.name}
                              className="bulk-product-image"
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
                      ) : (
                        <div className="bulk-product-image-placeholder">No Image</div>
                      )}
                    </div>

                    <div className="bulk-product-body">
                      <h3>{product.name}</h3>

                      <div className="bulk-price-row">
                        <span className="bulk-mrp">{fmt(mrpTotal)}</span>
                        <strong>{fmt(getTierTotal(product, selectedTier))}</strong>
                      </div>

                      <div className="bulk-tier-list">
                        {tiers.map((tier, index) => (
                          <button
                            key={`${product._id}_${tier.label}`}
                            type="button"
                            className={selectedTierIndex === index ? "active" : ""}
                            onClick={() => setSelectedTiers((current) => ({ ...current, [product._id]: index }))}
                          >
                            {tier.label}
                          </button>
                        ))}
                      </div>

                      {cartEntry ? (
                        <div className="bulk-stepper">
                          <button type="button" onClick={() => changeCartCount(product, -1)}>-</button>
                          <span>{cartEntry.packCount}</span>
                          <button type="button" onClick={() => changeCartCount(product, 1)}>+</button>
                        </div>
                      ) : (
                        <button type="button" className="bulk-add-btn" onClick={() => changeCartCount(product, 1)}>
                          Add Pack
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </main>

      {profile && cart.length > 0 && (
        <button type="button" className="bulk-sticky-checkout" onClick={() => setCheckoutOpen(true)}>
          <span>{totalPacks} packs</span>
          <strong>{fmt(grandTotal)}</strong>
          <span>Checkout</span>
        </button>
      )}

      {checkoutOpen && (
        <div className="bulk-modal-backdrop" onClick={() => setCheckoutOpen(false)}>
          <div className="bulk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bulk-modal-head">
              <h3>Bulk Checkout</h3>
              <button type="button" onClick={() => setCheckoutOpen(false)}>x</button>
            </div>

            <div className="bulk-modal-body">
              <section className="bulk-checkout-card">
                <h4>Receiver & Address</h4>
                <div className="bulk-inline-grid">
                  <label>
                    Receiver Name
                    <input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
                  </label>
                  <label>
                    Receiver Phone
                    <input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} />
                  </label>
                  <label>
                    Location Label
                    <input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Hall A, Kitchen Entry" />
                  </label>
                </div>
                <label>
                  Delivery Address
                  <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
                </label>
              </section>

              <section className="bulk-checkout-card">
                <h4>Delivery & Payment</h4>
                <div className="bulk-inline-grid">
                  <label>
                    Delivery Mode
                    <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}>
                      <option value="standard">Standard (20-30 mins)</option>
                      <option value="scheduled">Scheduled Delivery</option>
                      <option value="next_day">Next Day</option>
                    </select>
                  </label>

                  {scheduleType !== "standard" && (
                    <label>
                      Delivery Date
                      <input
                        type="date"
                        min={today()}
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </label>
                  )}

                  {scheduleType !== "standard" && (
                    <label>
                      Delivery Slot
                      <select value={scheduleSlot} onChange={(e) => setScheduleSlot(e.target.value)}>
                        {DELIVERY_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label>
                    Payment Method
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="cod">Cash On Delivery</option>
                      <option value="online">Pay Online </option>
                    </select>
                  </label>

                  <label>
                    Coupon
                    {!couponCode ? (
                      <div className="bulk-coupon-row">
                        <input
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Coupon code"
                        />
                        <button type="button" onClick={applyCoupon}>Apply</button>
                      </div>
                    ) : (
                      <div className="bulk-coupon-applied">
                        <span>{couponCode} applied</span>
                        <button type="button" onClick={removeCoupon}>Remove</button>
                      </div>
                    )}
                  </label>
                </div>
              </section>

              <section className="bulk-checkout-card">
                <h4>Tip & Notes</h4>
                <p>100% goes to delivery partner. Tap selected tip again to remove.</p>
                <div className="bulk-tip-row">
                  {TIP_OPTIONS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className={tip === amount ? "active" : ""}
                      onClick={() => {
                        if (tip === amount) {
                          setTip(null);
                          return;
                        }
                        setTip(amount);
                        setCustomTip("");
                      }}
                    >
                      {fmt(amount)}
                    </button>
                  ))}
                  <input
                    placeholder="Custom tip"
                    value={customTip}
                    onChange={(e) => {
                      setCustomTip(e.target.value);
                      setTip(null);
                    }}
                  />
                </div>

                <label>
                  Delivery Notes
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Gate number, landmark, special notes"
                  />
                </label>
              </section>

              <div className="bulk-bill">
                <div><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
                <div><span>Delivery Fee</span><strong>{deliveryFee === 0 ? "FREE" : fmt(deliveryFee)}</strong></div>
                <div><span>Handling Fee</span><strong>{handlingFee === 0 ? "FREE" : fmt(handlingFee)}</strong></div>
                {tipAmount > 0 && <div><span>Tip</span><strong>{fmt(tipAmount)}</strong></div>}
                {couponDiscount > 0 && <div><span>Coupon Discount</span><strong>-{fmt(couponDiscount)}</strong></div>}
                <div className="total"><span>Total Payable</span><strong>{fmt(grandTotal)}</strong></div>
              </div>
            </div>

            <div className="bulk-modal-foot">
              <button type="button" onClick={() => setCheckoutOpen(false)}>Cancel</button>
              <button type="button" className="bulk-primary-btn" disabled={placingOrder} onClick={placeBulkOrder}>
                {placingOrder ? "Processing..." : paymentMethod === "online" ? `Pay & Place ${fmt(grandTotal)}` : `Place Order ${fmt(grandTotal)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          refreshUser();
          setShowLoginModal(false);
          fetchData();
        }}
      />
    </div>
  );
}
