import { useState, useEffect } from "react";
import api, { getAssetCandidates, resolveImagePath } from "../services/api";
import { getCart, clearCart } from "../utils/cartStorage";
import { useNavigate } from "react-router-dom";
import CustomerLoginModal from "../components/CustomerLoginModal";
import MapSelector from "../components/MapSelector";
import { formatPrice, getReferenceMarketPrice, getReferenceMarketSubtotal } from "../utils/pricing";
import { loadCashfreeClient } from "../utils/loadCashfree";
import { REVIEW_DEFAULT_ADDRESS, REVIEW_MODE_ENABLED, REVIEW_PHONE } from "../config/reviewMode";



export default function Cart() {
  const [cart, setCart] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [freeDeliveryMinAmount, setFreeDeliveryMinAmount] = useState(0);

  const [couponApplied, setCouponApplied] = useState(false);
  const [noBag, setNoBag] = useState(false);
  const [animatedSavings, setAnimatedSavings] = useState(0);
  const [showSavingsToast, setShowSavingsToast] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
 const [showConfetti, setShowConfetti] = useState(false);
 const [checkoutStep, setCheckoutStep] = useState(null);
 const [showLoginModal, setShowLoginModal] = useState(false);
 const [isProcessingPayment, setIsProcessingPayment] = useState(false);
 const [savedAddresses, setSavedAddresses] = useState([]);
 const [activeAddressMenu, setActiveAddressMenu] = useState(null);
 
const [newAddressLocation, setNewAddressLocation] = useState(null);


  // Checkout Flow States
 
  const [addressDetails, setAddressDetails] = useState({
  flatNo: "",
  building: "",
  landmark: "",
  type: "Home"
});
const [selectedAddress, setSelectedAddress] = useState(null);
  const [receiverDetails, setReceiverDetails] = useState({ name: "", phone: "" });

  

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("divasa_user")));

  const normalizeCategoryKey = (category = "") =>
    String(category).trim().toLowerCase();

  const isMealCategory = (category = "") =>
    normalizeCategoryKey(category).includes("meal");

  const isJuiceCategory = (category = "") =>
    normalizeCategoryKey(category).includes("juice");

  const isWeightCategory = (category = "") => {
    const normalized = normalizeCategoryKey(category);
    return normalized.includes("vegetable") || normalized.includes("fruit");
  };

  const getVariantWeightInGrams = (name = "") => {
    const normalized = String(name).trim().toLowerCase();
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|gram|grams)/i);
    if (!match) return Number.MAX_SAFE_INTEGER;

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (!Number.isFinite(value)) return Number.MAX_SAFE_INTEGER;
    if (unit === "kg") return value * 1000;
    return value;
  };

  const getDisplayVariants = (product) => {
    if (!Array.isArray(product?.variants)) return [];

    const normalizedVariants = product.variants
      .filter((variant) => variant && variant._id && variant.name !== undefined && variant.price !== undefined)
      .map((variant) => ({
        ...variant,
        price: Number(variant.price),
        actualVariantId: variant._id,
        weightMultiplier: 1,
      }))
      .filter((variant) => Number.isFinite(variant.price))
      .sort((a, b) => {
        const weightDiff = getVariantWeightInGrams(a.name) - getVariantWeightInGrams(b.name);
        if (weightDiff !== 0) return weightDiff;
        return String(a.name).localeCompare(String(b.name));
      });

    const baseVariant = normalizedVariants[0];
    const normalizedBaseName = String(baseVariant?.name || "").replace(/\s+/g, "").toLowerCase();
    const isSingleKgBase = normalizedVariants.length === 1 && (normalizedBaseName === "kg" || normalizedBaseName === "1kg");

    if (isSingleKgBase && isWeightCategory(product?.category)) {
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
  };

  const isSingleKgVariant = (variant) => {
    const normalized = String(variant?.name || "").replace(/\s+/g, "").toLowerCase();
    return normalized === "kg" || normalized === "1kg";
  };

  const normalizeVariantLabel = (value = "") =>
    String(value || "").trim().toLowerCase().replace(/\s+/g, "");

  const resolveBackendVariantId = (item) => {
    const product = allProducts.find((p) => String(p?._id) === String(item?.productId));
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (!product || variants.length === 0) {
      throw new Error(`Product not available in catalog: ${item?.name || "Unknown item"}`);
    }

    const idCandidates = [
      String(item?.actualVariantId || "").trim(),
      String(item?.variantId || "").trim(),
      String(item?.variantId || "").split("_")[0].trim(),
    ].filter(Boolean);

    for (const candidate of idCandidates) {
      const matched = variants.find((v) => String(v?._id) === candidate);
      if (matched?._id) return String(matched._id);
    }

    const itemVariantLabel = normalizeVariantLabel(item?.variantName);
    if (itemVariantLabel) {
      const byName = variants.find((v) => normalizeVariantLabel(v?.name) === itemVariantLabel);
      if (byName?._id) return String(byName._id);
    }

    if (variants.length === 1) {
      return String(variants[0]._id);
    }

    throw new Error(`Variant not found for ${item?.name || "selected product"}. Please remove and add again.`);
  };

  const getDefaultListingVariant = (product, variants) => {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    if (!isWeightCategory(product?.category)) return variants[0];

    const exactOneKg = variants.find((variant) => isSingleKgVariant(variant));
    if (exactOneKg) return exactOneKg;

    const oneKgOrMore = variants
      .filter((variant) => getVariantWeightInGrams(variant.name) >= 1000)
      .sort((a, b) => getVariantWeightInGrams(a.name) - getVariantWeightInGrams(b.name));
    if (oneKgOrMore.length > 0) return oneKgOrMore[0];

    return variants[variants.length - 1];
  };

 useEffect(() => {
  if (!currentUser?.phone && !REVIEW_MODE_ENABLED) {
    setShowLoginModal(true);
    return;
  }
  if (!currentUser?.phone && REVIEW_MODE_ENABLED) {
    setShowLoginModal(false);
    setSelectedAddress(REVIEW_DEFAULT_ADDRESS);
    setReceiverDetails({ name: "Cashfree Reviewer", phone: REVIEW_PHONE });
  }

  setCart(getCart());

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setAllProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setFreeDeliveryMinAmount(res.data.freeDeliveryMinAmount);
    } catch (err) {
      console.error("Failed to fetch settings");
    }
  };

  const fetchAddresses = async () => {
  try {
    if (!currentUser?.phone) {
      if (REVIEW_MODE_ENABLED) {
        setSelectedAddress(REVIEW_DEFAULT_ADDRESS);
        setSavedAddresses([REVIEW_DEFAULT_ADDRESS]);
      }
      return;
    }

    const res = await api.get(`/addresses/${currentUser.phone}`);
    const sorted = [...res.data].sort((a, b) => b.isDefault - a.isDefault);

    setSavedAddresses(sorted);

    const defaultOrFirstAddress = sorted.find((a) => a.isDefault) || sorted[0] || null;
    if (defaultOrFirstAddress) {
      setSelectedAddress(defaultOrFirstAddress);
      setReceiverDetails({
        name: defaultOrFirstAddress.fullName || "",
        phone: defaultOrFirstAddress.receiverPhone || defaultOrFirstAddress.phone || ""
      });
      return;
    }

    const fallbackLocationName = localStorage.getItem("divasa_location_name");
    const fallbackLat = Number(localStorage.getItem("divasa_location_lat"));
    const fallbackLng = Number(localStorage.getItem("divasa_location_lng"));

    if (fallbackLocationName && Number.isFinite(fallbackLat) && Number.isFinite(fallbackLng)) {
      setSelectedAddress({
        _id: "selected-location-fallback",
        addressType: "Selected Location",
        flatNo: "",
        landmark: "",
        mapAddress: fallbackLocationName,
        addressLine: fallbackLocationName,
        lat: fallbackLat,
        lng: fallbackLng,
        isDefault: true,
      });
      setReceiverDetails({
        name: currentUser?.name || "Customer",
        phone: currentUser?.phone || ""
      });
    }
  } catch (err) {
    console.error("Failed to fetch addresses", err);
    if (REVIEW_MODE_ENABLED) {
      setSelectedAddress(REVIEW_DEFAULT_ADDRESS);
      setSavedAddresses([REVIEW_DEFAULT_ADDRESS]);
      setReceiverDetails({
        name: currentUser?.name || "Cashfree Reviewer",
        phone: currentUser?.phone || REVIEW_PHONE,
      });
    }
  }
};

  fetchProducts();
  fetchSettings();
  fetchAddresses();

}, [currentUser?.phone]);

 useEffect(() => {
  if (!REVIEW_MODE_ENABLED) return;
  if (!selectedAddress) {
    setSelectedAddress(REVIEW_DEFAULT_ADDRESS);
  }
 }, [selectedAddress]);

 useEffect(() => {
  const syncUser = () => {
    setCurrentUser(JSON.parse(localStorage.getItem("divasa_user")));
  };
  window.addEventListener("userUpdated", syncUser);
  return () => window.removeEventListener("userUpdated", syncUser);
}, []);

  const freeDeliveryTarget = 199;
  const totalAmount = cart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const remainingForFreeDelivery = freeDeliveryMinAmount - totalAmount;
  const progressPercent = freeDeliveryMinAmount > 0 ? Math.min((totalAmount / freeDeliveryMinAmount) * 100, 100) : 0;
 
  let deliveryFee = 0;
let handlingFee = 0;

if (totalAmount < 99) {
  deliveryFee = 25;
  handlingFee = 9;
} else if (totalAmount >= 100 && totalAmount <= 150) {
  deliveryFee = 20;
  handlingFee = 7;
} else if (totalAmount > 150 && totalAmount < freeDeliveryTarget) {
  deliveryFee = 15;
  handlingFee = 5;
} else if (totalAmount >= freeDeliveryTarget) {
  deliveryFee = 0;
  handlingFee = 0;
}


const bagFee = noBag ? 0 : 5;


  const cartCategories = cart.map(item => {
    const product = allProducts.find(p => p._id === item.productId);
    return product?.category;
  }).filter(Boolean);

  const hasMeal = cartCategories.some((category) => isMealCategory(category));
  const hasJuice = cartCategories.some((category) => isJuiceCategory(category));

  const couponDiscount = couponApplied ? 25 : 0;
  const juiceUpsellDiscount = hasMeal && hasJuice ? 20 : 0;

  // Apply discounts BEFORE GST
const discountedSubtotal = Math.max(
  totalAmount - couponDiscount - juiceUpsellDiscount,
  0
);

// GST calculated on discounted amount
// Calculate GST only for taxable products
let gst = 0;


const grandTotal =
  discountedSubtotal +
  handlingFee +
  deliveryFee +
  bagFee;

  
 const couponSavings = couponDiscount;
const juiceSavings = juiceUpsellDiscount;

// Maximum possible charges (below ₹99 slab)
const maxDeliveryCharge = 25;
const maxHandlingCharge = 9;

const currentCharges = deliveryFee + handlingFee;
const maxCharges = maxDeliveryCharge + maxHandlingCharge;

// Savings from slab difference
const slabSavings = maxCharges - currentCharges;

// No bag saving
const bagSavings = noBag ? 5 : 0;

const totalSavings = couponSavings + juiceSavings + slabSavings + bagSavings;



  useEffect(() => {
    if (totalSavings > 0) {
      setShowSavingsToast(true);
      setTimeout(() => setShowSavingsToast(false), 2000);
    }

    if (deliveryFee === 0 || noBag) {
  setShowConfetti(true);
  setTimeout(() => setShowConfetti(false), 30000);
}


    let start = 0;
    const duration = 500;
    const increment = totalSavings / (duration / 16);
    const counter = setInterval(() => {
      start += increment;
      if (start >= totalSavings) {
        start = totalSavings;
        clearInterval(counter);
      }
      
      setAnimatedSavings(Math.floor(start));
    }, 16);
    return () => clearInterval(counter);
  }, [totalSavings]);

  useEffect(() => {
    if (hasMeal && hasJuice) {
      setShowGlow(true);
      const timer = setTimeout(() => setShowGlow(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasMeal, hasJuice]);

  const updateCart = (updated) => {
    setCart(updated);
    localStorage.setItem("divasa_cart", JSON.stringify(updated));
  };

  const handleAddToCart = (product) => {
    const availableVariants = getDisplayVariants(product);
    if (!availableVariants.length) return;

    const selectedVariantId = selectedVariants[product._id];
    const variant =
      availableVariants.find((v) => String(v._id) === String(selectedVariantId)) ||
      getDefaultListingVariant(product, availableVariants) ||
      availableVariants[0];

    if (!variant) return;

    const baseVariant = product.variants?.find((v) => String(v._id) === String(variant.actualVariantId || variant._id));
    const stockLimit = Number(baseVariant?.stock);
    const weightMultiplier = Number(variant.weightMultiplier) || 1;
    const maxQtyForVariant = Number.isFinite(stockLimit) && stockLimit > 0
      ? Math.floor(stockLimit / weightMultiplier)
      : null;

    const existingItem = cart.find(item => item.productId === product._id && item.variantId === variant._id);
    if (existingItem && Number.isFinite(maxQtyForVariant) && maxQtyForVariant > 0 && existingItem.quantity >= maxQtyForVariant) {
      alert("Maximum stock reached");
      return;
    }

    if (existingItem) {
      const updatedCart = cart.map(item => item.productId === product._id && item.variantId === variant._id ? { ...item, quantity: item.quantity + 1 } : item);
      updateCart(updatedCart);
    } else {
      updateCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: variant.price,
          quantity: 1,
          variantId: variant._id,
          actualVariantId: variant.actualVariantId || variant._id,
          weightMultiplier: Number(variant.weightMultiplier) || 1,
          variantName: variant.name,
          image: resolveImagePath(product) || "",
        },
      ]);
    }
  };

  const buildOrderPayload = (paymentMethod = "COD") => {
    const effectiveAddress = selectedAddress || (REVIEW_MODE_ENABLED ? REVIEW_DEFAULT_ADDRESS : null);
    if (!effectiveAddress) {
      throw new Error("Address is required");
    }

    const user = JSON.parse(localStorage.getItem("divasa_user"));
    if (!user || !(user.customerId || user.id)) {
      throw new Error("User not logged in properly");
    }

    for (const item of cart) {
      if (!item.productId || !item.variantId || !item.quantity) {
        throw new Error("Cart contains invalid item. Please remove and re-add product.");
      }
    }

    const currentTotal = cart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    let finalHandlingFee = 0;
    let finalDeliveryFee = 0;
    if (currentTotal < 100) {
      finalDeliveryFee = 25;
      finalHandlingFee = 9;
    } else if (currentTotal <= 150) {
      finalDeliveryFee = 20;
      finalHandlingFee = 7;
    } else if (currentTotal < 199) {
      finalDeliveryFee = 15;
      finalHandlingFee = 5;
    } else {
      finalDeliveryFee = 0;
      finalHandlingFee = 0;
    }

    const finalBagFee = noBag ? 0 : 5;
    const finalCouponDiscount = couponApplied ? 25 : 0;

    const cartCats = cart
      .map((item) => {
        const product = allProducts.find((p) => p._id === item.productId);
        return product?.category;
      })
      .filter(Boolean);

    const finalJuiceDiscount =
      cartCats.some((category) => isMealCategory(category)) &&
      cartCats.some((category) => isJuiceCategory(category))
        ? 20
        : 0;

    const discountedSubtotal = Math.max(
      currentTotal - finalCouponDiscount - finalJuiceDiscount,
      0
    );
    const finalGrandTotal =
      discountedSubtotal +
      finalHandlingFee +
      finalDeliveryFee +
      finalBagFee;

    const finalName = receiverDetails.name?.trim() || user.name || "Customer";
    const finalPhone = receiverDetails.phone?.trim() || user.phone;

    return {
      customerName: finalName,
      customerPhone: finalPhone,
      customerAddress: {
        addressLine: effectiveAddress.addressLine || effectiveAddress.mapAddress,
        landmark: effectiveAddress.landmark || "",
        city: effectiveAddress.city || "Bangalore",
        pincode: effectiveAddress.pincode || "560049",
        latitude: effectiveAddress.latitude || effectiveAddress.lat,
        longitude: effectiveAddress.longitude || effectiveAddress.lng,
      },
      items: cart.map((item) => ({
        productId: item.productId,
        variantId: resolveBackendVariantId(item),
        quantity: Number(item.quantity),
      })),
      handlingFee: finalHandlingFee,
      deliveryFee: finalDeliveryFee,
      bagFee: finalBagFee,
      couponDiscount: finalCouponDiscount,
      juiceDiscount: finalJuiceDiscount,
      mealDiscount: 0,
      grandTotal: finalGrandTotal,
      paymentMethod,
    };
  };

  const placeOrder = async () => {
    try {
      const payload = buildOrderPayload("COD");
      await api.post("/orders", payload);
      clearCart();
      setCart([]);
      setCheckoutStep(null);
      navigate("/order-success");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to place order");
    }
  };

  const handleOnlinePayment = async () => {
    try {
      if (REVIEW_MODE_ENABLED) {
        setIsProcessingPayment(true);
        const payload = buildOrderPayload("ONLINE");
        await api.post("/orders", payload);
        clearCart();
        setCart([]);
        setCheckoutStep(null);
        navigate("/order-success");
        return;
      }

      setIsProcessingPayment(true);
      const payload = buildOrderPayload("ONLINE");

      const orderRes = await api.post("/payment/create-order", {
        orderPayload: payload,
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });

      const { order_id, payment_session_id } = orderRes.data || {};
      const gatewayMode = String(orderRes?.data?.gateway_mode || "").toLowerCase();
      if (!order_id || !payment_session_id) {
        throw new Error("Invalid payment order response");
      }
      const cashfree = await loadCashfreeClient(gatewayMode);

      const checkoutResult = await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal",
      });

      if (checkoutResult?.error) {
        throw new Error(checkoutResult.error.message || "Payment failed. Please try again.");
      }

      await api.post("/payment/verify", {
        cashfree_order_id: order_id,
        orderPayload: payload,
      });

      clearCart();
      setCart([]);
      setCheckoutStep(null);
      navigate("/order-success");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to start online payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const scrollToCategory = (categoryName) => {
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
    }
  };

  if (!currentUser && !REVIEW_MODE_ENABLED) {
    return (
      <div style={{ padding: "110px 20px", background: "#f1f8f3", minHeight: "100vh" }}>
        <h2 style={{ marginBottom: 8 }}>Login Required</h2>
        <p style={{ color: "#556", marginBottom: 16 }}>Please login first to continue shopping.</p>
        <button onClick={() => setShowLoginModal(true)} style={{ padding: "10px 20px", background: "#57b15f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Login
        </button>
        {showLoginModal && (
          <CustomerLoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={() => {
              setCurrentUser(JSON.parse(localStorage.getItem("divasa_user")));
              setShowLoginModal(false);
            }}
          />
        )}
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ padding: "110px 20px", background: "#f1f8f3", minHeight: "100vh" }}>
        <h2>Your cart is empty 🛒</h2>
        <button onClick={() => navigate("/")} style={{ padding: '10px 20px', background: '#57b15f', color: '#fff', border: 'none', borderRadius: 8 }}>Go to Home</button>
      </div>
    );
  }

  const cartProductIds = cart.map(item => item.productId);
  const preferredCategoryCount = cart.reduce((acc, item) => {
    const product = allProducts.find((p) => p._id === item.productId);
    const key = normalizeCategoryKey(product?.category || "");
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const groupedProducts = {};
  allProducts.forEach(product => {
    if (!product.category || product.isDeleted || product.isActive === false) return;
    if (!product.variants || product.variants.length === 0) return;
    if (isMealCategory(product.category)) return;

    const hasExplicitStock = product.variants.some((variant) => variant?.stock !== undefined && variant?.stock !== null);
    const hasSellableStock = !hasExplicitStock || product.variants.some((variant) => Number(variant?.stock) > 0);
    if (!hasSellableStock) return;

    if (!groupedProducts[product.category]) groupedProducts[product.category] = [];
    if (!cartProductIds.includes(product._id)) groupedProducts[product.category].push(product);
  });

  const orderedCategories = Object.keys(groupedProducts).sort((a, b) => {
    const scoreA = preferredCategoryCount[normalizeCategoryKey(a)] || 0;
    const scoreB = preferredCategoryCount[normalizeCategoryKey(b)] || 0;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.localeCompare(b);
  });

  const remainingToFreeDelivery = Math.max(0, Number((freeDeliveryTarget - totalAmount).toFixed(2)));

  const recommendationPool = allProducts
    .filter((product) => {
      if (!product.category || product.isDeleted || product.isActive === false) return false;
      if (isMealCategory(product.category)) return false;
      if (cartProductIds.includes(product._id)) return false;
      return getDisplayVariants(product).length > 0;
    })
    .map((product) => {
      const availableVariants = getDisplayVariants(product);
      const selectedVariantId = selectedVariants[product._id];
      const variant =
        availableVariants.find((v) => String(v._id) === String(selectedVariantId)) ||
        getDefaultListingVariant(product, availableVariants) ||
        availableVariants[0];

      return { product, availableVariants, variant };
    })
    .filter((entry) => entry.variant);

  const nearFreeDeliverySuggestions = recommendationPool
    .filter((entry) => {
      if (remainingToFreeDelivery <= 0) return false;
      return entry.variant.price <= remainingToFreeDelivery + 30;
    })
    .sort((a, b) => {
      const distanceA = Math.abs(remainingToFreeDelivery - a.variant.price);
      const distanceB = Math.abs(remainingToFreeDelivery - b.variant.price);
      return distanceA - distanceB;
    })
    .slice(0, 10);

  const qtyBtnStyle = {
    background: "transparent",
    border: "none",
    color: "#57b15f",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "0 10px"
  };

  // Modal Styles
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
  const modalContentStyle = { background: '#fff', borderRadius: '20px', width: 'min(400px, 95vw)', maxHeight: '90vh', overflow: 'hidden', position: 'relative' };

  return (
    <div className="cart-page-root" style={{ padding: "10px 24px 10px 24px", width: "100%", boxSizing: "border-box", background: "#f1f8f3", color: "#333", minHeight: "100vh", height: "100vh", overflow: "hidden" }}>
      <div className="cart-layout" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, height: "100%", overflow: "hidden" }}>
        
        {/* LEFT SIDE - CART & BILLING */}
        <div className="cart-left" style={{ flex: "0 0 430px", position: "relative", height: "100%", overflowY: "auto", paddingRight: 8 }}>
          <h2 style={{ marginBottom: 20 }}>Your Cart</h2>

          {/* ✅ GREETING + ADDRESS HEADER */}
{selectedAddress && (
  <div style={{
    background: "#ffffff",
    padding: "14px",
    borderRadius: 14,
    marginBottom: 15,
    border: "1px solid #e5e7eb",
    cursor: "pointer"
  }}
  onClick={() => {
    if (REVIEW_MODE_ENABLED) return;
    setCheckoutStep("address");
  }}
  >
    
    {/* USER NAME */}
    <div style={{
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 4
    }}>
      Delivering to {currentUser?.name || "Customer"} 👋
    </div>

    {/* ADDRESS */}
    <div style={{
      fontSize: 12,
      color: "#555",
      lineHeight: "1.4"
    }}>
      {selectedAddress.flatNo}, {selectedAddress.landmark},{" "}
      {selectedAddress.mapAddress
        ? selectedAddress.mapAddress.split(",").slice(0, 2).join(",")
        : ""}
    </div>

  </div>
)}

{totalSavings > 0 && (
  <div
    style={{
      position: "sticky",
      top: 0,
      background: "#e8f5e9",
      padding: "8px 12px",
      borderRadius: 8,
      marginBottom: 15,
      border: "1px solid #81c784",
      color: "#2e7d32",
      fontWeight: 600,
      fontSize: 14,
      zIndex: 5,
      overflow: "hidden"
    }}
  >
    🎉 You saved ₹{totalSavings} on this order

    {showConfetti && (
      <div className="confetti-container">
        🎉 ✨ 🎊 💚 ✨ 🎉 🎊
      </div>
    )}
  </div>
)}




          <button
  onClick={() => navigate("/")}
  style={{
    marginBottom: 15,
    padding: "8px 14px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer"
  }}
>
  ← Back to Home
</button>


          {cart.map((item, index) => (
            <div className="cart-item" key={index} style={{ display: "flex", justifyContent: "space-between", background: "#fff", padding: 15, borderRadius: 16, marginBottom: 15, border: "1px solid #e0e0e0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: 15 }}>
                {item.image && (() => {
                  const candidates = getAssetCandidates(item.image);
                  return (
                    <img
                      src={candidates[0] || "/vite.svg"}
                      alt={item.name}
                      style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 10 }}
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
                  <div style={{ fontWeight: "600" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{item.variantName}</div>
                  <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {getReferenceMarketPrice(item.price) ? (
                      <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", fontWeight: 600 }}>
                        ₹{formatPrice(getReferenceMarketPrice(item.price))}
                      </span>
                    ) : null}
                    <span>₹{formatPrice(item.price)} × {item.quantity}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {getReferenceMarketSubtotal(item.price, item.quantity) ? (
                  <div style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", fontWeight: 600 }}>
                    ₹{formatPrice(getReferenceMarketSubtotal(item.price, item.quantity))}
                  </div>
                ) : null}
                <div style={{ fontWeight: 600 }}>₹{formatPrice(Number(item.price) * item.quantity)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, background: "#f1f8f3", padding: "4px 8px", borderRadius: 8 }}>
                  <button style={qtyBtnStyle} onClick={() => {
                    let updated = item.quantity === 1 ? cart.filter((_, i) => i !== index) : cart.map((c, i) => i === index ? { ...c, quantity: c.quantity - 1 } : c);
                    updateCart(updated);
                  }}>−</button>
                  <span style={{ fontWeight: "bold" }}>{item.quantity}</span>
                  <button style={qtyBtnStyle} onClick={() => {
                    const lookupVariantId = item.actualVariantId || item.variantId;
                    const variant = allProducts.find(p => p._id === item.productId)?.variants.find(v => v._id === lookupVariantId);
                    if (variant && item.quantity >= variant.stock) { alert("Maximum stock reached"); return; }
                    updateCart(cart.map((c, i) => i === index ? { ...c, quantity: c.quantity + 1 } : c));
                  }}>+</button>
                </div>
              </div>
            </div>
          ))}

          {/* Smart Savings Breakdown */}
          {totalSavings > 0 && (
            <div style={{ background: "linear-gradient(135deg,#e8f5e9,#c8e6c9)", padding: 15, borderRadius: 16, marginBottom: 15, border: "1px solid #81c784", color: "#2e7d32" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>🎉 You Saved Today:</div>
              {couponSavings > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Coupon</span><span>₹{couponSavings}</span></div>}
              {juiceSavings > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Meal + Juice Offer</span><span>₹{juiceSavings}</span></div>}
{slabSavings > 0 && 
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
    <span>Delivery & Handling Benefit</span>
    <span>₹{slabSavings}</span>
  </div>
}

{bagSavings > 0 &&
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
    <span>No Carry Bag</span>
    <span>₹{bagSavings}</span>
  </div>
}
              <hr style={{ borderColor: "#81c784", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span>Total Saved</span><span>₹{animatedSavings}</span></div>
            </div>
          )}

         {/* Free Delivery Progress */}
{totalAmount < freeDeliveryTarget && (
  <div style={{ background: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, border: "1px solid #e0e0e0" }}>
    <div>
      Add ₹{remainingToFreeDelivery} more for FREE Delivery 🚚
    </div>

    <div style={{ height: 8, background: "#eee", borderRadius: 5, overflow: "hidden", marginTop: 8 }}>
      <div 
        style={{ 
          width: `${Math.min((totalAmount / freeDeliveryTarget) * 100, 100)}%`, 
          height: "100%", 
          background: "#57b15f" 
        }} 
      />
    </div>
  </div>
)}

{totalAmount >= freeDeliveryTarget && (
  <div style={{ background: "#e8f5e9", padding: 15, borderRadius: 12, marginBottom: 15, border: "1px solid #81c784", color: "#2e7d32" }}>
    🎉 FREE Delivery Unlocked!
  </div>
)}


          {/* Meal + Juice Upsell logic */}
          {hasMeal && !hasJuice && (
            <div
            onMouseEnter={(e) => e.currentTarget.style.background = "#e8f5e9"}
onMouseLeave={(e) => e.currentTarget.style.background = "#f1f8f3"}

            onClick={() => scrollToCategory("juice")} style={{
  background: "#f1f8f3",
  padding: 14,
  borderRadius: 12,
  marginBottom: 15,
  border: "1px solid #c8e6c9",
  cursor: "pointer",
  transition: "all 0.2s ease",
}}
>
              <div style={{ fontWeight: 600, color: "#2e7d32", fontSize: 14 }}>
  Add Juice & Save ₹20
</div>
<div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>
  Unlock combo savings on your order
</div>

            </div>
          )}
          {/* Coupon */}
          <div style={{ background: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, border: "1px solid #e0e0e0", cursor: "pointer" }} onClick={() => setCouponApplied(!couponApplied)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <strong>Apply Coupon</strong>
                    <div style={{ fontSize: 13, color: '#666' }}>{couponApplied ? "Coupon Applied: ₹25 Discount" : "Tap to apply coupon"}</div>
                </div>
                <div style={{ color: '#57b15f', fontWeight: 'bold' }}>{couponApplied ? "REMOVE" : "APPLY"}</div>
            </div>
          </div>

          {/* No Bag */}
          <div style={{ background: "#e8f5e9", padding: 15, borderRadius: 12, marginBottom: 15, border: "1px solid #c8e6c9", display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
            <span>No Carry Bag (Save ₹5)</span>
            <input type="checkbox" checked={noBag} onChange={() => setNoBag(!noBag)} style={{ width: 18, height: 18, accentColor: '#57b15f' }} />
          </div>

{/* Ordering For Someone Else */}
<div 
  onClick={() => setCheckoutStep("receiver")}
  style={{
    background: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    border: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer"
  }}
>
  <div>
    <div style={{ fontWeight: 600, fontSize: 14 }}>
      Ordering for someone else?
    </div>
    <div style={{ fontSize: 12, color: "#666" }}>
      Add receiver name & phone
    </div>
  </div>

  <div style={{ fontSize: 18 }}>
    ➕
  </div>
</div>



          {/* Bill Details */}
          <div className="cart-bill" style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #e0e0e0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", animation: showGlow ? "greenGlow 1.5s ease" : "none" }}>
            <h3 style={{ marginBottom: 15 }}>BILL DETAILS</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Item Total</span><span>₹{totalAmount}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Handling Fee</span><span>₹{handlingFee}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Delivery Fee</span><span>{deliveryFee === 0 ? <span style={{ color: "#57b15f", fontWeight: "bold" }}>FREE</span> : `₹${deliveryFee}`}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
 
</div>
            {!noBag && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Carry Bag Fee</span><span>₹{bagFee}</span></div>}
            {couponApplied && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#2e7d32" }}><span>Coupon Discount</span><span>-₹{couponDiscount}</span></div>}
            {juiceUpsellDiscount > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#2e7d32" }}><span>Meal + Juice Offer</span><span>-₹{juiceUpsellDiscount}</span></div>}
            <hr style={{ border: "0.5px solid #eee", margin: '15px 0' }} />
            {/* FREE DELIVERY MESSAGE ABOVE TO PAY */}
{totalAmount < freeDeliveryTarget && (
  <div style={{
    fontSize: 13,
    color: "#1a73e8",
    marginBottom: 10,
    fontWeight: 500
  }}>
    Add ₹{remainingToFreeDelivery} more to get FREE Delivery
  </div>
)}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 18 }}><span>To Pay</span><span>₹{grandTotal}</span></div>
          </div>

          {/* ADDRESS FOOTER LOGIC */}
          {!selectedAddress ? (
            <button 
             onClick={() => {
  const user = JSON.parse(localStorage.getItem("divasa_user"));

  if (!user) {
  setShowLoginModal(true);
  return;
}

  if (REVIEW_MODE_ENABLED) {
    setSelectedAddress(REVIEW_DEFAULT_ADDRESS);
    setCheckoutStep("codConfirm");
    return;
  }
  setCheckoutStep("address");
}}

              style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#ff3269", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 20 }}>
              Proceed to Pay ₹{grandTotal}
            </button>
          ) : (
           <div style={{ marginTop: 20 }}>

  {/* SELECTED ADDRESS CARD */}
  <div
  style={{
  background: "#ffffff",
  border: selectedAddress?.isDefault
    ? "2px solid #16a34a"
    : "1px solid #e0e0e0",
  borderRadius: 16,
  padding: 15,
  marginBottom: 15,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  width: "100%",
  boxSizing: "border-box"
}}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ fontSize: 20 }}>
          {selectedAddress.addressType === "Home"
            ? "🏠"
            : selectedAddress.addressType === "Work"
            ? "💼"
            : "📍"}
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {selectedAddress.addressType}
          </div>

          <div style={{ fontSize: 12, color: "#555", lineHeight: "1.4" }}>
  {selectedAddress.flatNo},{" "}
  {selectedAddress.landmark},{" "}
  {selectedAddress.mapAddress
    ? selectedAddress.mapAddress.split(",").slice(0, 2).join(",")
    : ""}
</div>
        </div>
      </div>

      <span
        onClick={() => {
          if (REVIEW_MODE_ENABLED) return;
          setCheckoutStep("address");
        }}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#ff3269",
          cursor: "pointer"
        }}
      >
        Change
      </span>
    </div>
  </div>

  {/* RECEIVER INFO */}
  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
    Ordering for <strong>{receiverDetails.name || "Customer"}</strong>,{" "}
    {receiverDetails.phone || JSON.parse(localStorage.getItem("divasa_user"))?.phone}
    <span
      onClick={() => setCheckoutStep("receiver")}
      style={{ color: '#ff3269', cursor: 'pointer', float: 'right' }}
    >
      Edit
    </span>
  </div>

  {/* PAY BUTTON */}
  <button
    onClick={() => {
      const user = JSON.parse(localStorage.getItem("divasa_user"));
      if (!user) {
        setShowLoginModal(true);
        return;
      }
     setCheckoutStep("codConfirm");
    }}
    style={{
      width: "100%",
      padding: "14px",
      borderRadius: 12,
      background: "#128e6d",
      color: "#fff",
      border: "none",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
    Click to Pay ₹{grandTotal}
  </button>




<div style={{ fontSize: 12, color: "#666", marginTop: 10, lineHeight: "18px" }}>
  <strong>NOTE:</strong> Orders cannot be cancelled and are non-refundable once packed for delivery.{" "}
  <span
    onClick={() => navigate("/terms")}
                  

    style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
  >
    Read cancellation policy
  </span>
</div>


            </div>
          )}
        </div>

                {/* RIGHT SIDE - RECOMMENDATIONS */}
        <div className="cart-right" style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
          {nearFreeDeliverySuggestions.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ marginBottom: 8 }}>
                Add ₹{remainingToFreeDelivery} More For FREE Delivery
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280" }}>
                Quick picks near your target amount
              </p>
              <div className="cart-recommend-scroll" style={{ display: "flex", gap: 15, overflowX: "auto", paddingBottom: 15 }}>
                {nearFreeDeliverySuggestions.map(({ product, availableVariants, variant }) => (
                  <div className="cart-rec-card" key={`target-${product._id}`} style={{ minWidth: 190, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 16, padding: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                    {resolveImagePath(product) && (() => {
                      const candidates = getAssetCandidates(resolveImagePath(product));
                      return (
                        <img
                          src={candidates[0] || "/vite.svg"}
                          alt={product.name}
                          style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 12, marginBottom: 8 }}
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
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</div>
                    {availableVariants.length > 1 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "6px 0" }}>
                        {availableVariants.map((option) => (
                          <button
                            key={option._id}
                            onClick={() => setSelectedVariants((prev) => ({ ...prev, [product._id]: option._id }))}
                            style={{
                              border: String(option._id) === String(variant._id) ? "1.5px solid #16a34a" : "1px solid #e5e7eb",
                              background: String(option._id) === String(variant._id) ? "#f0fdf4" : "#fff",
                              borderRadius: 20,
                              fontSize: 10,
                              padding: "3px 8px",
                              cursor: "pointer",
                            }}
                          >
                            {option.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {availableVariants.length <= 1 && <div style={{ fontSize: 11, color: "#888" }}>{variant.name}</div>}
                    <div style={{ margin: "5px 0", display: "flex", alignItems: "center", gap: 6 }}>
                      {getReferenceMarketPrice(variant.price) ? (
                        <span style={{ fontSize: 11, color: "#9ca3af", textDecoration: "line-through", fontWeight: 600 }}>
                          ₹{formatPrice(getReferenceMarketPrice(variant.price))}
                        </span>
                      ) : null}
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#57b15f" }}>₹{formatPrice(variant.price)}</span>
                    </div>
                    <button onClick={() => handleAddToCart(product)} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", color: "#fff", background: "#57b15f", fontWeight: "600", cursor: "pointer" }}>ADD</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orderedCategories.map(category => (
            <div key={category} id={`category-${category}`} style={{ marginBottom: 30 }}>
              <h3 style={{ marginBottom: 15 }}>{category}</h3>
              <div className="cart-recommend-scroll" style={{ display: "flex", gap: 15, overflowX: "auto", paddingBottom: 15 }}>
                {groupedProducts[category].map(product => {
                  const availableVariants = getDisplayVariants(product);
                  if (!availableVariants.length) return null;

                  const selectedVariantId = selectedVariants[product._id];
                  const selectedVariant =
                    availableVariants.find((v) => String(v._id) === String(selectedVariantId)) ||
                    getDefaultListingVariant(product, availableVariants) ||
                    availableVariants[0];

                  return (
                    <div className="cart-rec-card" key={product._id} style={{ minWidth: 190, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 16, padding: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                      {resolveImagePath(product) && (() => {
                        const candidates = getAssetCandidates(resolveImagePath(product));
                        return (
                          <img
                            src={candidates[0] || "/vite.svg"}
                            alt={product.name}
                            style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 12, marginBottom: 8 }}
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
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</div>
                      {availableVariants.length > 1 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "6px 0" }}>
                          {availableVariants.map((variant) => (
                            <button
                              key={variant._id}
                              onClick={() => setSelectedVariants((prev) => ({ ...prev, [product._id]: variant._id }))}
                              style={{
                                border: String(selectedVariant._id) === String(variant._id) ? "1.5px solid #16a34a" : "1px solid #e5e7eb",
                                background: String(selectedVariant._id) === String(variant._id) ? "#f0fdf4" : "#fff",
                                borderRadius: 20,
                                fontSize: 10,
                                padding: "3px 8px",
                                cursor: "pointer",
                              }}
                            >
                              {variant.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: "#888" }}>{selectedVariant.name}</div>
                      )}
                      <div style={{ margin: "5px 0", display: "flex", alignItems: "center", gap: 6 }}>
                        {getReferenceMarketPrice(selectedVariant.price) ? (
                          <span style={{ fontSize: 11, color: "#9ca3af", textDecoration: "line-through", fontWeight: 600 }}>
                            ₹{formatPrice(getReferenceMarketPrice(selectedVariant.price))}
                          </span>
                        ) : null}
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#57b15f" }}>₹{formatPrice(selectedVariant.price)}</span>
                      </div>
                      <button onClick={() => handleAddToCart(product)} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", color: "#fff", background: "#57b15f", fontWeight: "600", cursor: "pointer" }}>ADD</button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    {/* STEP 1: SELECT ADDRESS MODAL */}
{checkoutStep === "address" && !REVIEW_MODE_ENABLED && (
  <div className="cart-modal-overlay" style={modalOverlayStyle} onClick={() => setCheckoutStep(null)}>
    <div className="cart-modal-sheet" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 18 }}>Select Address</span>
        <span onClick={() => setCheckoutStep(null)} style={{ cursor: 'pointer', fontSize: 20 }}>✕</span>
      </div>

      <div style={{ padding: 20, maxHeight: '400px', overflowY: 'auto' }}>
        <p style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 10 }}>
          SAVED ADDRESSES
        </p>

       {savedAddresses.map((addr) => (
  <div
    key={addr._id}
    style={{
      position: "relative",
      display: "flex",
      gap: 12,
      padding: "15px",
      borderRadius: 12,
      border:
        selectedAddress?._id === addr._id
          ? "2px solid #119e5a"
          : "1px solid #f0f0f0",
      background:
        selectedAddress?._id === addr._id
          ? "#f0fdf4"
          : "#fff",
      marginBottom: 10
    }}
  >
    {/* CLICKABLE AREA */}
    <div
     onClick={() => {
  setSelectedAddress(addr);
  
  // ✅ Auto fill receiver also (NEW)
  setReceiverDetails({
    name: addr.fullName || "",
    phone: addr.receiverPhone || addr.phone || ""
  });

  setCheckoutStep(null);
}}
      style={{ flex: 1, cursor: "pointer", display: "flex", gap: 12 }}
    >
      <div style={{ fontSize: 20 }}>
        {addr.addressType === "Home"
          ? "🏠"
          : addr.addressType === "Work"
          ? "🏢"
          : "📍"}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>
            {addr.addressType}
          </span>

          {addr.isDefault && (
            <span
              style={{
                background: "#e8f5e9",
                color: "#2e7d32",
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 6,
                fontWeight: 700
              }}
            >
              DEFAULT
            </span>
          )}
        </div>

        <div style={{ fontSize: 12, color: "#666" }}>
          {addr.flatNo}, {addr.landmark}
        </div>
      </div>
    </div>

    {/* THREE DOT MENU */}
    <div style={{ position: "relative" }}>
      <span
        onClick={() =>
          setActiveAddressMenu(
            activeAddressMenu === addr._id
              ? null
              : addr._id
          )
        }
        style={{ cursor: "pointer", fontSize: 18 }}
      >
        ⋮
      </span>

      {activeAddressMenu === addr._id && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 25,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: 150,
            zIndex: 10
          }}
        >
          <div
            onClick={() => {
              setSelectedAddress(addr);
              setCheckoutStep("details");
              setActiveAddressMenu(null);
            }}
            style={{ padding: 10, cursor: "pointer", fontSize: 13 }}
          >
            ✏️ Edit
          </div>

          {!addr.isDefault && (
            <div
              onClick={async () => {
                await api.put(`/addresses/${addr._id}/default`);

                const user = JSON.parse(localStorage.getItem("divasa_user"));
                const res = await api.get(`/addresses/${user.phone}`);

                setSavedAddresses(
                  [...res.data].sort((a, b) => b.isDefault - a.isDefault)
                );

                setActiveAddressMenu(null);
              }}
              style={{ padding: 10, cursor: "pointer", fontSize: 13 }}
            >
              ⭐ Set as Default
            </div>
          )}

          <div
            onClick={async () => {
              await api.delete(`/addresses/${addr._id}`);

              const user = JSON.parse(localStorage.getItem("divasa_user"));
              const res = await api.get(`/addresses/${user.phone}`);

              setSavedAddresses(
                [...res.data].sort((a, b) => b.isDefault - a.isDefault)
              );

              setActiveAddressMenu(null);
            }}
            style={{
              padding: 10,
              cursor: "pointer",
              fontSize: 13,
              color: "#e53935"
            }}
          >
            🗑 Delete
          </div>
        </div>
      )}
    </div>
  </div>
))}
      </div>
    </div>
  </div>
)}

{/* STEP 2: FULL MAP MODAL */}
{checkoutStep === "map" && !REVIEW_MODE_ENABLED && (
  <div className="cart-modal-overlay" style={modalOverlayStyle} onClick={() => setCheckoutStep("address")}>
    <div className="cart-modal-map" style={{
      background: "#fff",
      width: "min(500px, 95vw)",
      height: "min(650px, 85vh)",
borderRadius: "20px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 15 }}>
        <span onClick={() => setCheckoutStep("address")} style={{ cursor: 'pointer', fontSize: 20 }}>←</span>
        <span style={{ fontWeight: 700 }}>Confirm Location</span>
      </div>

      <div style={{ flex: 1 }}>
        <MapSelector
  onLocationSelect={(location) => {
    if (!location) return;
    setNewAddressLocation(location);
    setCheckoutStep("details");
  }}
  onClose={() => setCheckoutStep("address")}
/>
      </div>
    </div>
  </div>
)}

{/* STEP 3: ADDRESS DETAILS FORM */}
{checkoutStep === "details" && !REVIEW_MODE_ENABLED && (
  <div className="cart-modal-overlay" style={modalOverlayStyle} onClick={() => setCheckoutStep(null)}>
    <div className="cart-modal-sheet" style={{ ...modalContentStyle, padding: '25px' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
        <span onClick={() => setCheckoutStep("map")} style={{ cursor: 'pointer' }}>←</span>
        <span style={{ fontWeight: 800 }}>Enter Address Details</span>
      </div>

      {newAddressLocation && (
  <div
    style={{
      background: "#f5f5f5",
      padding: "14px",
      borderRadius: 14,
      marginBottom: 20,
      border: "1px solid #e5e5e5"
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          📍 Location Selected
        </div>

        <div style={{ fontSize: 13, color: "#333", lineHeight: "1.4" }}>
          {newAddressLocation.fullAddress
            ? newAddressLocation.fullAddress.split(",").slice(0, 3).join(",")
            : `${newAddressLocation.lat}, ${newAddressLocation.lng}`}
        </div>
      </div>

      <span
        onClick={() => setCheckoutStep("map")}
        style={{
          color: "#ff3269",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        EDIT
      </span>
    </div>
  </div>
)}

    <input
  placeholder="Flat / House / Floor *"
  style={{
    width: '100%',
    padding: '14px',
    marginBottom: 12,
    borderRadius: 12,
    border: '1px solid #eee',
    background: "#f9f9f9",
    boxSizing: 'border-box'
  }}
  onChange={(e) =>
    setAddressDetails({ ...addressDetails, flatNo: e.target.value })
  }
/>

<input
  placeholder="Building Name"
  style={{
    width: '100%',
    padding: '14px',
    marginBottom: 12,
    borderRadius: 12,
    border: '1px solid #eee',
    background: "#f9f9f9",
    boxSizing: 'border-box'
  }}
  onChange={(e) =>
    setAddressDetails({ ...addressDetails, building: e.target.value })
  }
/>

<input
  placeholder="Landmark (Optional)"
  style={{
    width: '100%',
    padding: '14px',
    marginBottom: 20,
    borderRadius: 12,
    border: '1px solid #eee',
    background: "#f9f9f9",
    boxSizing: 'border-box'
  }}
  onChange={(e) =>
    setAddressDetails({ ...addressDetails, landmark: e.target.value })
  }
/>

      <p style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10 }}>
        SAVE AS
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 25 }}>
      {['Home', 'Work', 'Others'].map(type => (
  <button
    key={type}
    onClick={() => setAddressDetails({ ...addressDetails, type })}
    style={{
      padding: '8px 20px',
      borderRadius: '20px',
      border: addressDetails.type === type ? '1px solid #ff3269' : '1px solid #eee',
      background: addressDetails.type === type ? '#fff5f7' : '#fff',
      color: addressDetails.type === type ? '#ff3269' : '#333',
      cursor: 'pointer'
    }}
  >
    {type === "Home" && "🏠 "}
    {type === "Work" && "💼 "}
    {type === "Others" && "🤔 "}
    {type}
  </button>
))}
      </div>

      <button
        onClick={async () => {
          const user = JSON.parse(localStorage.getItem("divasa_user"));
          if (!user?.phone || !newAddressLocation) {
            if (!user?.phone) { alert("Please login first"); return; }
            alert("Please pick a location on the map first"); return;
          }
          if (!addressDetails.flatNo?.trim()) { alert("Please enter your flat / house number"); return; }
          try {

      

            const newAddr = {
              phone: user.phone,
              fullName: user.name || "Customer",
              receiverPhone: receiverDetails.phone?.trim() || user.phone,
              flatNo: addressDetails.flatNo,
              building: addressDetails.building || "",
              landmark: addressDetails.landmark || "",
              mapAddress: newAddressLocation.fullAddress || newAddressLocation.name || "",
              lat: newAddressLocation.lat,
              lng: newAddressLocation.lng,
              addressType: addressDetails.type || "Home",
              isDefault: savedAddresses.length === 0,
            };

            const res = await api.post("/addresses", newAddr);
            setSelectedAddress(res.data);
            setCheckoutStep(null);
            setNewAddressLocation(null);
            setAddressDetails({ flatNo: "", building: "", landmark: "", type: "Home" });
            const list = await api.get(`/addresses/${user.phone}`);
            setSavedAddresses([...list.data].sort((a, b) => b.isDefault - a.isDefault));
          } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Unknown error";
            if (err.response?.status === 401 || String(errorMessage).toLowerCase().includes("token")) {
              setShowLoginModal(true);
              alert("Session expired. Please login again to save address.");
              return;
            }
            alert("Failed to save address: " + errorMessage);
          }
        }}
        style={{
          width: '100%',
          padding: '16px',
          background: '#119e5a',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        Save Address & Proceed
      </button>
    </div>
  </div>
)}


{/* STEP 4: RECEIVER DETAILS MODAL */}
{checkoutStep === "receiver" && (
  <div className="cart-modal-overlay" style={modalOverlayStyle} onClick={() => setCheckoutStep(null)}>
    <div className="cart-modal-sheet" style={{ ...modalContentStyle, padding: 25 }} onClick={(e) => e.stopPropagation()}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 20
      }}>
        <span style={{ fontWeight: 800 }}>Receiver Details</span>
        <span 
          onClick={() => setCheckoutStep(null)} 
          style={{ cursor: "pointer", fontSize: 20 }}
        >
          ✕
        </span>
      </div>

      <input
        placeholder="Receiver Name"
        value={receiverDetails.name}
        onChange={(e) =>
          setReceiverDetails({
            ...receiverDetails,
            name: e.target.value
          })
        }
        style={{
          width: "100%",
          padding: 14,
          marginBottom: 12,
          borderRadius: 12,
          border: "1px solid #eee",
          background: "#f9f9f9"
        }}
      />

      <input
        placeholder="Receiver Phone"
        value={receiverDetails.phone}
        onChange={(e) =>
          setReceiverDetails({
            ...receiverDetails,
            phone: e.target.value
          })
        }
        style={{
          width: "100%",
          padding: 14,
          marginBottom: 20,
          borderRadius: 12,
          border: "1px solid #eee",
          background: "#f9f9f9"
        }}
      />

      <button
        onClick={() => {
         
          setCheckoutStep(null);
        }}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          background: "#119e5a",
          color: "#fff",
          border: "none",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        Save Receiver
      </button>

{receiverDetails.name || receiverDetails.phone ? (
  <button
    onClick={() => {
      setReceiverDetails({ name: "", phone: "" });
      setCheckoutStep(null);
    }}
    style={{
      width: "100%",
      padding: 12,
      marginTop: 10,
      borderRadius: 12,
      background: "#fff",
      color: "#ff3269",
      border: "1px solid #ff3269",
      fontWeight: 600,
      cursor: "pointer"
    }}
  >
    Remove Receiver
  </button>
) : null}


    </div>
  </div>
)}


{checkoutStep === "codConfirm" && (
  <div style={modalOverlayStyle} onClick={() => setCheckoutStep(null)}>
    <div style={{ ...modalContentStyle, padding: 25 }} onClick={(e) => e.stopPropagation()}>
      
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <span style={{ fontWeight: 800 }}>Confirm Order</span>
        <span
          onClick={() => setCheckoutStep(null)}
          style={{ cursor: "pointer", fontSize: 20 }}
        >
          ✕
        </span>
      </div>

      <div style={{
        background: "#f8fafc",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20
      }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          Payment Method
        </div>
        <div style={{ marginTop: 6 }}>
          Cash on Delivery or Online Payment
        </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontWeight: 700,
        fontSize: 16,
        marginBottom: 20
      }}>
        <span>Total Amount</span>
        <span>₹{grandTotal}</span>
      </div>

            <button
        disabled={isProcessingPayment}
        onClick={async () => {
          setIsProcessingPayment(true);
          await placeOrder();
          setIsProcessingPayment(false);
        }}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          background: "#119e5a",
          color: "#fff",
          border: "none",
          fontWeight: 700,
          cursor: isProcessingPayment ? "not-allowed" : "pointer",
          opacity: isProcessingPayment ? 0.7 : 1
        }}
      >
        {isProcessingPayment ? "Processing..." : "Confirm COD Order"}
      </button>

      <button
        disabled={isProcessingPayment}
        onClick={handleOnlinePayment}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          background: "#0f172a",
          color: "#fff",
          border: "none",
          fontWeight: 700,
          cursor: isProcessingPayment ? "not-allowed" : "pointer",
          opacity: isProcessingPayment ? 0.7 : 1,
          marginTop: 10
        }}
      >
        {isProcessingPayment ? "Processing..." : `Pay Online Rs ${grandTotal}`}
      </button>

    </div>
  </div>
)}





      {/* LOGIN MODAL */}
{showLoginModal && (
  <CustomerLoginModal
    isOpen={showLoginModal}
    onClose={() => setShowLoginModal(false)}
    onSuccess={() => setShowLoginModal(false)}
  />
)}

      
      <style>{`

        .cart-page-root,
        .cart-layout,
        .cart-left,
        .cart-right {
          max-width: 100%;
        }

        .cart-recommend-scroll {
          scrollbar-width: none;
        }

        .cart-recommend-scroll::-webkit-scrollbar {
          display: none;
        }

        /* ── Existing desktop animations ── */
        @keyframes greenGlow {
          0%   { box-shadow: 0 0 0px #57b15f; }
          50%  { box-shadow: 0 0 20px #57b15f; }
          100% { box-shadow: 0 0 0px #57b15f; }
        }

        @keyframes celebrateGlow {
          0%   { transform: scale(1);    box-shadow: 0 0 0px  #4caf50; }
          30%  { transform: scale(1.05); box-shadow: 0 0 20px #4caf50; }
          60%  { transform: scale(1.02); box-shadow: 0 0 30px #66bb6a; }
          100% { transform: scale(1);    box-shadow: 0 0 0px  #4caf50; }
        }

        .confetti-container {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          pointer-events: none;
          font-size: 18px;
          animation: confettiBlast 3.5s ease forwards;
        }

        @keyframes confettiBlast {
          0%   { transform: translateY(0px)   scale(1);   opacity: 1; }
          50%  { transform: translateY(-30px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-60px) scale(0.8); opacity: 0; }
        }

        /* ============================================================
           CART — MOBILE  ≤ 768px  (Zepto / Blinkit app style)
           Desktop untouched — all rules scoped inside media query.
           ============================================================ */
        @media (max-width: 768px) {

          /* Root wrapper */
          .cart-page-root {
            padding: 0 0 90px 0 !important;
            background: #f4f6f3 !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Stack panels vertically */
          .cart-layout {
            flex-direction: column !important;
            gap: 0 !important;
            padding: 0 !important;
            align-items: stretch !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Left panel — full width, natural height, scrollable page */
          .cart-left {
            flex: none !important;
            width: 100% !important;
            position: relative !important;
            height: auto !important;
            overflow-y: visible !important;
            overflow-x: hidden !important;
            padding: 56px 14px 20px 14px !important;
            box-sizing: border-box !important;
            padding-right: 14px !important;
          }

          .cart-left h2 {
            font-size: 18px !important;
            margin-bottom: 10px !important;
            margin-top: 4px !important;
          }

          /* Right panel — full width below, separated from cart-left */
          .cart-right {
            flex: none !important;
            width: 100% !important;
            padding: 16px 14px 14px 14px !important;
            box-sizing: border-box !important;
            margin-top: 16px !important;
            border-top: 6px solid #e4ebe4 !important;
            height: auto !important;
            overflow: visible !important;
          }

          .cart-right h3 {
            font-size: 13px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.4px !important;
            color: #666 !important;
            margin-bottom: 10px !important;
          }

          /* Cart item cards — compact */
          .cart-item {
            padding: 12px !important;
            border-radius: 14px !important;
            margin-bottom: 10px !important;
          }

          .cart-item img {
            width: 56px !important;
            height: 56px !important;
            border-radius: 10px !important;
          }

          /* Bill details card */
          .cart-bill {
            padding: 14px !important;
            border-radius: 14px !important;
            margin-bottom: 10px !important;
          }

          .cart-bill h3 {
            font-size: 12px !important;
            letter-spacing: 0.6px !important;
            color: #999 !important;
            margin-bottom: 10px !important;
          }

          /* Recommendation cards — horizontal scroll */
          .cart-rec-card {
            min-width: 138px !important;
            max-width: 138px !important;
            padding: 10px !important;
            border-radius: 14px !important;
            flex-shrink: 0 !important;
          }

          .cart-rec-card img {
            width: 100% !important;
            height: 100px !important;
            object-fit: cover !important;
            display: block !important;
            border-radius: 10px !important;
            overflow: hidden !important;
          }

          .cart-rec-card button {
            padding: 7px 0 !important;
            font-size: 12px !important;
            border-radius: 8px !important;
          }

          /* All modals → bottom sheet */
          .cart-modal-overlay {
            align-items: flex-end !important;
          }

          .cart-modal-sheet {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 88vh !important;
            overflow-y: auto !important;
          }

          /* Map modal → full screen */
          .cart-modal-map {
            width: 100% !important;
            height: 100vh !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
        }

        /* Extra-small ≤ 360px */
        @media (max-width: 360px) {
          .cart-left  { padding: 56px 12px 0 12px !important; }
          .cart-right { padding: 0 12px 12px 12px !important; }
          .cart-rec-card { min-width: 126px !important; max-width: 126px !important; }
        }

      `}</style>

      
    </div>
  );
}










