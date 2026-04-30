import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import MapSelector from "../components/MapSelector";
import Header from "../components/Header";
import { loadCashfreeClient } from "../utils/loadCashfree";
import { REVIEW_MODE_ENABLED } from "../config/reviewMode";


const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fruitPlansRef = useRef(null);
  const mealPlansRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [step, setStep] = useState("plans");
  const [selectedPlanType, setSelectedPlanType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [createdSubscription, setCreatedSubscription] = useState(null);

  const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [fruitSelections, setFruitSelections] = useState({
  "fresh-start": { duration: "monthly", days: 5 },
  "stay-on": { days: 5 },
  "level-up": { days: 5 },
});

const [mealSelections, setMealSelections] = useState({
  "power-routine": { days: 5, meals: 1, slot: "lunch" },
  "no-excuses": { days: 5, meals: 1, slot: "lunch" },
  "on-track": { days: 5, meals: 1, slot: "lunch" },
});

  const [formData, setFormData] = useState({
    durationType: "monthly",
    startDate: getTomorrowDateString(),
    deliverySlot: "morning",
    paymentType: "cod",
    deliveryDetails: {
      name: "",
      phone: "",
      addressLine: "",
      landmark: "",
      city: "",
      pincode: "",
      latitude: null,
      longitude: null,
    },
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [showMapPinModal, setShowMapPinModal] = useState(false);
  const [showAddressFormModal, setShowAddressFormModal] = useState(false);
  const [newAddressLocation, setNewAddressLocation] = useState(null);
  const [newAddressDetails, setNewAddressDetails] = useState({
    flatNo: "",
    building: "",
    area: "",
    landmark: "",
    type: "Home",
    customType: "",
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [showMealMenu, setShowMealMenu] = useState(false);
  const [showNoExcusesMenu, setShowNoExcusesMenu] = useState(false);
  const [showOnTrackMenu, setShowOnTrackMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  const normalizeAddressType = (value = "") => String(value).trim().toLowerCase();
  const uniqueAddressTypes = ["home", "work", "friend"];

  useEffect(() => {
    if (step !== "plans") return;

    const params = new URLSearchParams(location.search);
    const planCategory = String(params.get("planCategory") || "").toLowerCase();

    if (planCategory === "meal" && mealPlansRef.current) {
      mealPlansRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (planCategory === "fruit" && fruitPlansRef.current) {
      fruitPlansRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.search, step]);

  const FRUIT_PLANS = [
    {
      id: "fresh-start",
      name: "Fresh Start",
      tagline: "For the day you decide to begin.",
      deliveriesPerDay: 1,
      daysPerWeek: 5,
      pricePerUnit: 180,
      description: "A structured daily fruit bowl designed to rebuild consistency.",
      features: ["A bowl every day", "5 days a week", "Scheduled delivery", "Build momentum","Don’t restart again. Stay consistent"],
      badge: "ENTRY PLAN"
    },
    {
      id: "stay-on",
      name: "Stay On",
      tagline: "Because consistency feels better than regret.",
      deliveriesPerDay: 1,
      daysPerWeek: 6,
      pricePerUnit: 160,
      description: "A more committed schedule for people serious about staying consistent.",
      features: ["Fresh. Daily. Consistent",
 "6 days a week","Nuts, Fruits, Vegetables, Dry fruits & seeds", "Premium selection", "Consistency feels better than regret"],
      badge: "POPULAR",
      highlighted: true
    },
    {
      id: "level-up",
      name: "Level Up",
      tagline: "Raise your standard. Stay there.",
      deliveriesPerDay: 1,
      daysPerWeek: 6,
      pricePerUnit: 150,
      description: "A structured daily fruit bowl designed to rebuild consistency.",
      features: ["Fresh fuel. Every day", "6 days a week", "Premium variety",  "Free cold-pressed juice inculded with the plan",
 "Maximum consistency","Progress isn’t enough. Upgrade it."],
      badge: "PREMIUM"
    },
  ];


  const FRUIT_PRICING = {
  "fresh-start": {
    weekly: {
      5: { mrp: 666, offer: 599, discount: "10% OFF" },
      6: { mrp: 810, offer: 649, discount: "20% OFF" },
    },
    monthly: {
      5: { mrp: 2660, offer: 1999, discount: "25% OFF" },
      6: { mrp: 3070, offer: 2149, discount: "30% OFF" },
    },
  },
  "stay-on": {
    5: { mrp: 3059, offer: 2599, discount: "15% OFF" },
    6: { mrp: 3499, offer: 2799, discount: "20% OFF" },
  },
  "level-up": {
    5: { mrp: 4375, offer: 3499, discount: "20% OFF" },
    6: { mrp: 5250, offer: 3949, discount: "25% OFF" },
  },
};


  const MEAL_PLANS = [
    {
      id: "power-routine",
      name: "Power Routine",
      tagline: "Built for daily structure.",
      mealType: "lunch",
      deliveriesPerDay: 1,
      daysPerWeek: 5,
      pricePerUnit: 280,
      description: "Build the base. Stay on track.",
      features: ["1 lunch per day", "5 days a week", "Freshly prepared", "Balanced nutrition"],
      badge: "START HERE"
    },
    {
      id: "no-excuses",
      name: "No Excuses",
      tagline: "Show up. Every day.",
      mealType: "both",
      deliveriesPerDay: 1,
      daysPerWeek: 6,
      pricePerUnit: 240,
      description: "No more gaps. No more excuses.",
      features: ["2 meals per day", "6 days a week", "Consistent nutrition", "Full day coverage"],
      badge: "MOST POPULAR",
      highlighted: true
    },
    {
      id: "on-track",
      name: "On Track",
      tagline: "Stay aligned. Stay moving.",
      mealType: "both",
      deliveriesPerDay: 1,
      daysPerWeek: 6,
      pricePerUnit: 220,
      description: "When your plate is structured, your day follows.",
      features: ["3 meals per day", "6 days a week", "Highest commitment", "Maximum nutrition"],
      badge: "ELITE"
    },
  ];

 const MEAL_PRICING = {
  "power-routine": {
    5: {
      1: { mrp: 3899, offer: 3299, discount: "15% OFF" },
      2: { mrp: 7798, offer: 6239, discount: "20% OFF" },
    },
    6: {
      1: { mrp: 4699, offer: 3749, discount: "20% OFF" },
      2: { mrp: 9398, offer: 7049, discount: "25% OFF" },
    },
  },

  "no-excuses": {
    5: {
      1: { mrp: 4299, offer: 3649, discount: "15% OFF" },
      2: { mrp: 8598, offer: 6878, discount: "20% OFF" },
    },
    6: {
      1: { mrp: 5199, offer: 4159, discount: "20% OFF" },
      2: { mrp: 10398, offer: 7799, discount: "25% OFF" },
    },
  },

  "on-track": {
    5: {
      1: { mrp: 4800, offer: 4099, discount: "15% OFF" },
      2: { mrp: 9600, offer: 7680, discount: "20% OFF" },
    },
    6: {
      1: { mrp: 5760, offer: 4599, discount: "20% OFF" },
      2: { mrp: 11520, offer: 8640, discount: "25% OFF" },
    },
  },
};
  const MOTIVATION_CARDS = [
    {
      icon: "🎯",
      title: "Stop Postponing",
      description: "Your meals are ready. No decision needed."
    },
    {
      icon: "📈",
      title: "Stay Consistent",
      description: "Build routines that stick with you."
    },
    {
      icon: "💪",
      title: "Take Control",
      description: "When your plate is structured, your day follows."
    },
  ];

  const HERO_CONTENT = {
  badge: "Subscription Plans",
  titleLine1: "Stop Restarting.",
  titleHighlight: "Start Structuring.",
  features: ["Build It Daily", "Stay On Track", "Keep Going"],
  primaryBtn: "Commit To Consistency",
  secondaryBtn: "Find Your Plan",
  image: "/subscription-hero.png",
};

  const applyAddressToDeliveryDetails = useCallback((address, currentUser) => {
    setFormData((prev) => ({
      ...prev,
      deliveryDetails: {
        ...prev.deliveryDetails,
        name: currentUser?.name || prev.deliveryDetails.name || "",
        phone: currentUser?.phone || prev.deliveryDetails.phone || "",
        addressLine: address?.addressLine || address?.mapAddress || "",
        landmark: address?.landmark || "",
        city: address?.city || "Bengaluru",
        pincode: address?.pincode || "560049",
        latitude: address?.latitude ?? address?.lat ?? null,
        longitude: address?.longitude ?? address?.lng ?? null,
      },
    }));
  }, []);

  const fetchSavedAddresses = useCallback(async (currentUser) => {
    if (!currentUser?.phone) return;

    try {
      const res = await api.get(`/addresses/${currentUser.phone}`);
      const sorted = Array.isArray(res.data)
        ? [...res.data].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
        : [];

      setSavedAddresses(sorted);

      const defaultOrFirst = sorted.find((addr) => addr.isDefault) || sorted[0] || null;
      if (defaultOrFirst) {
        setSelectedAddress(defaultOrFirst);
        applyAddressToDeliveryDetails(defaultOrFirst, currentUser);
        return;
      }

      const fallbackLocationName = localStorage.getItem("divasa_location_name");
      const fallbackLat = Number(localStorage.getItem("divasa_location_lat"));
      const fallbackLng = Number(localStorage.getItem("divasa_location_lng"));

      if (fallbackLocationName && Number.isFinite(fallbackLat) && Number.isFinite(fallbackLng)) {
        const fallbackAddress = {
          _id: "selected-location-fallback",
          addressType: "Selected Location",
          addressLine: fallbackLocationName,
          mapAddress: fallbackLocationName,
          city: "Bengaluru",
          pincode: "560049",
          lat: fallbackLat,
          lng: fallbackLng,
          isDefault: true,
        };
        setSelectedAddress(fallbackAddress);
        applyAddressToDeliveryDetails(fallbackAddress, currentUser);
      }
    } catch (error) {
      console.error("Failed to fetch saved addresses:", error);
    }
  }, [applyAddressToDeliveryDetails]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("divasa_user"));
    if (userData) {
      setUser(userData);
      fetchSavedAddresses(userData);
    } else {
      setMessage("Please log in to create a subscription.");
      setMessageType("error");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [navigate, fetchSavedAddresses]);

  const handlePlanSelect = (plan, type) => {
    setSelectedPlan(plan);
    setSelectedPlanType(type);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("delivery.")) {
      const field = name.replace("delivery.", "");
      setFormData((prev) => ({
        ...prev,
        deliveryDetails: {
          ...prev.deliveryDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectSavedAddress = (address) => {
    setSelectedAddress(address);
    applyAddressToDeliveryDetails(address, user);
    setShowAddressBookModal(false);
  };

  const handleNewAddressMapSelect = (location) => {
    setNewAddressLocation(location);
  };

  const openAddNewAddressFlow = () => {
    setShowAddressBookModal(false);
    setShowAddressFormModal(false);
    setNewAddressLocation(null);
    setNewAddressDetails({ flatNo: "", building: "", area: "", landmark: "", type: "Home", customType: "" });
    setShowMapPinModal(true);
  };

  const proceedFromMapToAddressForm = () => {
    if (!newAddressLocation?.lat || !newAddressLocation?.lng) {
      setMessage("Please pin location on map to continue.");
      setMessageType("error");
      return;
    }
    setShowMapPinModal(false);
    setShowAddressFormModal(true);
  };

  const handleSaveNewAddress = async () => {
    if (!user?.phone) {
      setMessage("Please login again to save address.");
      setMessageType("error");
      return;
    }
    if (!newAddressLocation?.lat || !newAddressLocation?.lng) {
      setMessage("Please pin location on map.");
      setMessageType("error");
      return;
    }
    if (!newAddressDetails.flatNo?.trim()) {
      setMessage("Please enter flat / house number.");
      setMessageType("error");
      return;
    }
    if (!newAddressDetails.building?.trim()) {
      setMessage("Please enter building name / area.");
      setMessageType("error");
      return;
    }

    const selectedType = String(newAddressDetails.type || "").trim();
    const customType = String(newAddressDetails.customType || "").trim();
    const finalAddressType = selectedType === "Others" ? customType : selectedType;

    if (!finalAddressType) {
      setMessage("Please enter a custom label for Others.");
      setMessageType("error");
      return;
    }

    if (uniqueAddressTypes.includes(normalizeAddressType(finalAddressType))) {
      const alreadyExists = savedAddresses.some(
        (address) => normalizeAddressType(address.addressType) === normalizeAddressType(finalAddressType)
      );
      if (alreadyExists) {
        setMessage(`${finalAddressType} address already exists. Please use another type.`);
        setMessageType("error");
        return;
      }
    }

    try {
      setIsSavingAddress(true);
      const payload = {
        fullName: user.name || "Customer",
        receiverPhone: user.phone,
        flatNo: newAddressDetails.flatNo.trim(),
        building: newAddressDetails.building?.trim() || "",
        area: newAddressDetails.area?.trim() || "",
        landmark: newAddressDetails.landmark?.trim() || "",
        mapAddress: newAddressLocation.fullAddress || newAddressLocation.name || "",
        lat: newAddressLocation.lat,
        lng: newAddressLocation.lng,
        addressType: finalAddressType,
        buildingType: "Society",
        isDefault: !savedAddresses.length,
      };

      const res = await api.post("/addresses", payload);
      const createdAddress = res.data;
      await fetchSavedAddresses(user);
      if (createdAddress?._id) {
        handleSelectSavedAddress(createdAddress);
      }
      setNewAddressDetails({ flatNo: "", building: "", area: "", landmark: "", type: "Home", customType: "" });
      setNewAddressLocation(null);
      setShowAddressFormModal(false);
      setMessage("Address saved successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save new address.");
      setMessageType("error");
    } finally {
      setIsSavingAddress(false);
    }
  };


  const getSelectedFruitPrice = () => {
  if (!selectedPlan || selectedPlanType !== "fruit") return 0;

  if (selectedPlan.id === "fresh-start") {
    const sel = fruitSelections["fresh-start"];
    return FRUIT_PRICING["fresh-start"][sel.duration][sel.days].offer;
  } else {
    const sel = fruitSelections[selectedPlan.id];
    return FRUIT_PRICING[selectedPlan.id][sel.days].offer;
  }
};

const calculateTotal = () => {
  if (!selectedPlan) return 0;

  if (selectedPlanType === "fruit") {
    return getSelectedFruitPrice();
  }

  if (selectedPlanType === "meal") {
    const sel = mealSelections[selectedPlan.id];
    return MEAL_PRICING[selectedPlan.id][sel.days][sel.meals].offer;
  }

  return 0;
};

const getEffectiveDurationType = () => {
  if (selectedPlanType === "fruit" && selectedPlan?.id === "fresh-start") {
    return fruitSelections["fresh-start"]?.duration || "monthly";
  }
  if (selectedPlanType === "meal") return "monthly";
  return formData.durationType;
};

const getDerivedMealSlot = () => {
  if (selectedPlanType !== "meal" || !selectedPlan?.id) return formData.deliverySlot;
  const meals = mealSelections[selectedPlan.id]?.meals || 1;
  const mealSlot = mealSelections[selectedPlan.id]?.slot || "lunch";
  return meals >= 2 ? "lunch-dinner" : mealSlot;
};

const validateAndProceed = () => {
    if (!selectedPlan) {
      setMessage("Please select a plan first.");
      setMessageType("error");
      return;
    }

    if (step === "plans") {
      setStep("details");
      window.scrollTo(0, 0);
    } else if (step === "details") {
      const { name, phone, addressLine, city, pincode, latitude, longitude } = formData.deliveryDetails;
      if (!selectedAddress || !name || !phone || !addressLine || !city || !pincode || latitude == null || longitude == null) {
        setMessage("Please select your delivery address to continue.");
        setMessageType("error");
        return;
      }

      // Auto-set delivery slot for meal plans
      if (selectedPlanType === "meal") {
        setFormData(prev => ({ ...prev, deliverySlot: getDerivedMealSlot(), durationType: "monthly" }));
      }

      setStep("review");
      window.scrollTo(0, 0);
    }
  };



  const handleCreateSubscription = async () => {
    try {
      setLoading(true);

      const minStartDate = getTomorrowDateString();
      const effectiveStartDate = formData.startDate >= minStartDate ? formData.startDate : minStartDate;
      const totalAmount = selectedPlanType === "fruit" ? getSelectedFruitPrice() : calculateTotal();
      const payload = {
        planCategory: selectedPlanType,
        planName: selectedPlan.name,
        deliveriesPerDay: selectedPlan.deliveriesPerDay,
        mealType:
          selectedPlanType === "meal"
            ? ((mealSelections[selectedPlan.id]?.meals || 1) >= 2
              ? "both"
              : (mealSelections[selectedPlan.id]?.slot || "lunch"))
            : (selectedPlan.mealType || "na"),
        daysPerWeek:
          selectedPlanType === "fruit"
            ? fruitSelections[selectedPlan.id].days
            : mealSelections[selectedPlan.id].days,
        durationType: getEffectiveDurationType(),
        startDate: effectiveStartDate,
        deliverySlot: selectedPlanType === "meal" ? getDerivedMealSlot() : formData.deliverySlot,
        pricePerUnit: totalAmount,
        totalPrice: totalAmount,
        paymentType: formData.paymentType,
        deliveryDetails: {
          name: formData.deliveryDetails.name,
          phone: formData.deliveryDetails.phone,
          addressLine: formData.deliveryDetails.addressLine,
          landmark: formData.deliveryDetails.landmark || "",
          city: formData.deliveryDetails.city || "Bengaluru",
          pincode: formData.deliveryDetails.pincode || "560049",
          latitude: formData.deliveryDetails.latitude,
          longitude: formData.deliveryDetails.longitude,
        },
        fruitConfig: selectedPlanType === "fruit" ? fruitSelections[selectedPlan.id] : null,
        mealConfig: selectedPlanType === "meal" ? mealSelections[selectedPlan.id] : null,
      };

      if (formData.paymentType === "full" && !REVIEW_MODE_ENABLED) {
        const orderRes = await api.post("/payment/create-order", {
          amount: totalAmount,
          currency: "INR",
          receipt: `sub_${Date.now()}`,
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

        const verifyRes = await api.post("/payment/verify", {
          cashfree_order_id: order_id,
        });
        if (!verifyRes?.data?.success) {
          throw new Error("Payment verification failed");
        }
      }

      const created = await api.post("/subscriptions", payload);
      setCreatedSubscription(created?.data?.subscription || null);

      setMessage("Subscription created successfully!");
      setMessageType("success");
      setStep("success");
    } catch (error) {
      console.error("Error creating subscription:", error);
      setMessage(error.response?.data?.message || error.message || "Failed to create subscription");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

const PLAN_IMAGES = {
  "fresh-start": "/plan-fresh.jpg",
  "stay-on": "/plan-stay.jpg",
  "level-up": "/plan-level.jpg",

  "power-routine": "/plan-power.jpg",
  "no-excuses": "/plan-noexcuses.jpg",
  "on-track": "/plan-ontrack.jpg",
};

  // ============ INLINE STYLES ============
  const styles = {
  pageContainer: {
  background: "linear-gradient(160deg, #f0fdf4 0%, #ffffff 30%, #f8faff 60%, #f0fdf4 100%)",
  minHeight: "100vh",
  overflowX: "hidden",
},
   container: {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: "#1f2937",
  position: "relative",
  zIndex: 1,
},
heroSection: {
  width: "100%",
  minHeight: isMobile ? "520px" : "590px",

  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0) 35%, rgba(255,255,255,0.1)), url('/subscription-hero.png')",

  backgroundSize: "cover",
  backgroundPosition: isMobile ? "65% center" : "75% center",
  backgroundRepeat: "no-repeat",

  display: "flex",
  alignItems: "center",
  padding: isMobile ? "0 10px" : "0 28px",
  boxSizing: "border-box",
},
heroContent: {
  width: "100%",
},
   heroMainTitle: {
  fontSize: "56px",
  fontWeight: 900,
  lineHeight: 1.05,
  color: "#0a0a0a",
  margin: "0 0 20px 0",
  letterSpacing: "-2px",
},

    heroSubtitle: {
      fontSize: "24px",
      fontWeight: 600,
      color: "#22c55e",
      margin: "0 0 20px 0",
      letterSpacing: "-0.3px",
    },
    heroDescription: {
      fontSize: "16px",
      color: "#6b7280",
      margin: "0 0 30px 0",
      lineHeight: 1.7,
    },
    ctaButton: {
      fontSize: "16px",
      fontWeight: 700,
      color: "#22c55e",
      margin: "0",
      padding: "0",
      background: "none",
      border: "none",
      cursor: "pointer",
    },
    motivationCardsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "20px",
      margin: "60px 0",
    },
    motivationCard: {
      padding: "30px 20px",
      background: "#f9fafb",
      borderRadius: "12px",
      textAlign: "center",
      border: "1px solid #e5e7eb",
      transition: "all 0.3s ease",
    },
    motivationCardIcon: {
      fontSize: "40px",
      marginBottom: "12px",
    },
    motivationCardTitle: {
      fontSize: "16px",
      fontWeight: 700,
      color: "#111827",
      margin: "0 0 8px 0",
    },
    motivationCardDesc: {
      fontSize: "13px",
      color: "#6b7280",
      margin: "0",
      lineHeight: 1.5,
    },
    alertContainer: {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "16px 20px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease-out",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    alertSuccess: {
      background: "#d1fae5",
      color: "#065f46",
      border: "1px solid #a7f3d0",
    },
    alertError: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    closeAlert: {
      background: "none",
      border: "none",
      fontSize: "18px",
      cursor: "pointer",
      padding: "0",
      minWidth: "auto",
    },
  stepIndicator: {
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  alignItems: "center",
  justifyContent: "center",
  gap: isMobile ? "16px" : "0px",
  margin: "40px 0",
  padding: "0",
  background: "transparent",
  border: "none",
  boxShadow: "none",
},

  step: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  position: "relative",
  flex: 1,
  cursor: "default",
},

    stepActive: {
      opacity: 1,
    },
   stepNumber: {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  background: "#f3f4f6",
  color: "#9ca3af",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "18px",
  border: "2px solid #e5e7eb",
  transition: "all 0.4s ease",
},

   stepNumberActive: {
  background: "linear-gradient(135deg, #16a34a, #22c55e)",
  color: "#ffffff",
  border: "2px solid transparent",
  boxShadow: "0 6px 20px rgba(34, 197, 94, 0.45)",
  transform: "scale(1.1)",
},
stepLabel: {
  fontSize: "13px",
  fontWeight: 700,
  color: "#9ca3af",
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  textAlign: "center",
},

stepLabelActive: {
  color: "#111827",
  fontWeight: 800,
},

stepDivider: {
  flex: 1,
  height: "2px",
  background: "#e5e7eb",
  margin: "0 8px",
  marginBottom: "28px",
  borderRadius: "2px",
  transition: "background 0.4s ease",
},

    sectionHeader: {
  textAlign: "center",
  marginBottom: "50px",
  paddingTop: "60px",
},

   sectionTitle: {
  fontSize: isMobile ? "28px" : "40px",
  fontWeight: 800,
  color: "#111827",
  margin: "0 0 12px 0",
  letterSpacing: "-0.5px",
},

   sectionSubtitle: {
  fontSize: "16px",
  color: "#6b7280",
  margin: "0 auto",
  fontWeight: 500,
  maxWidth: "500px",
  lineHeight: 1.6,
},

    plansSection: {
  marginBottom: "80px",
  position: "relative",
},
    planCategory: {
      marginBottom: "80px",
    },
   plansGrid: {
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
  gap: "24px",
  marginBottom: "40px",
},
 planCard: {
  borderRadius: "18px",
  padding: "30px 24px",
  cursor: "pointer",
  transition: "all 0.4s ease",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  minHeight: "500px",
  overflow: "hidden",

  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",

  color: "#ffffff",
},
   planCardHighlighted: {
  borderColor: "#22c55e",
  boxShadow: "0 16px 32px rgba(34, 197, 94, 0.25)",
  transform: "translateY(-8px)",
},
    planCardSelected: {
  borderColor: "#22c55e",
  // REMOVE: background: "#f0fdf4",  ? this was overriding your bg image
  boxShadow: "0 0 0 3px #22c55e, 0 16px 40px rgba(34, 197, 94, 0.3)",
},
    planBadge: {
      position: "absolute",
      top: "16px",
      right: "16px",
      background: "#22c55e",
      color: "#ffffff",
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    planName: {
  fontSize: "22px",
  fontWeight: 800,
  color: "#ffffff",
  margin: "0 0 8px 0",
  letterSpacing: "-0.3px",
  textShadow: "0 2px 8px rgba(0,0,0,0.8)",  // ADD THIS
},

planTagline: {
  fontSize: "13px",
  color: "#86efac",
  fontWeight: 700,           // change from 600
  margin: "0 0 16px 0",
  fontStyle: "italic",
  textShadow: "0 1px 4px rgba(0,0,0,0.6)",  // ADD THIS
},

   planDescription: {
  fontSize: "14px",
  color: "#ffffff",          // change from #e5e7eb
  lineHeight: 1.6,
  margin: "0 0 24px 0",
  fontWeight: 600,           // ADD THIS
  textShadow: "0 1px 4px rgba(0,0,0,0.7)",  // ADD THIS
},

  planSpecs: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginBottom: "24px",
  padding: "16px",
  background: "rgba(255,255,255,0.92)",  // change from #ffffff
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.3)",
},
    spec: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
   specLabel: {
  fontSize: "11px",
  textTransform: "uppercase",
  color: "#9ca3af",
  fontWeight: 700,
  letterSpacing: "0.5px",
},
specValue: {
  fontSize: "14px",
  fontWeight: 800,           // change from 700
  color: "#111827",          // keep dark since white bg
},

    planFeatures: {
      flexGrow: 1,
      marginBottom: "24px",
    },
    feature: {
      display: "flex",
      gap: "10px",
      marginBottom: "12px",
      alignItems: "flex-start",
      fontSize: "13px",
    },
    featureIcon: {
      color: "#22c55e",
      fontWeight: 700,
      flexShrink: 0,
      marginTop: "2px",
    },
   featureText: {
  color: "#ffffff",          // change from #f3f4f6
  lineHeight: 1.4,
  fontWeight: 600,           // ADD THIS
  textShadow: "0 1px 4px rgba(0,0,0,0.7)",  // ADD THIS
},

    selectBtn: {
      width: "100%",
      padding: "14px 16px",
      border: "2px solid #22c55e",
      background: "#22c55e",
      color: "#ffffff",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    selectBtnUnselected: {
      background: "#ffffff",
      color: "#22c55e",
      border: "2px solid #e5e7eb",
    },
    detailsSection: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "60px 0",
    },
    sectionTitleDetails: {
      fontSize: "40px",
      fontWeight: 800,
      color: "#111827",
      textAlign: "center",
      margin: "0 0 50px 0",
      letterSpacing: "-0.5px",
    },
   detailsGrid: {
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
  gap: "40px",
  marginBottom: "40px",
},
    detailsGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    detailsGroupTitle: {
      fontSize: "14px",
      fontWeight: 800,
      margin: "0 0 8px 0",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      color: "#6b7280",
    },
    inputField: {
      padding: "12px 16px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "14px",
      fontFamily: "inherit",
      background: "#f9fafb",
      color: "#111827",
      transition: "all 0.3s ease",
      width: "100%",
      boxSizing: "border-box",
    },
    row2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    btnMap: {
      padding: "14px 16px",
      border: "2px solid #22c55e",
      background: "#f0fdf4",
      color: "#22c55e",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s ease",
      width: "100%",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    locationDisplay: {
      padding: "12px 16px",
      background: "#f0fdf4",
      border: "1px solid #a7f3d0",
      borderRadius: "8px",
    },
    locationText: {
      margin: "4px 0",
      fontSize: "13px",
      color: "#065f46",
    },
    optionRow: {
      display: "flex",
      flexDirection: "column",
    },
    optionLabel: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "14px",
      fontWeight: 500,
      color: "#111827",
    },
    reviewSection: {
      background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      borderRadius: "20px",
      padding: "60px 0",
    },
    reviewGrid: {
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
  gap: "24px",
  marginBottom: "40px",
},
    reviewCard: {
      padding: "24px",
      background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
      borderRadius: "16px",
      border: "1px solid #dbe3ec",
      boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
    },
    reviewCardTitle: {
      fontSize: "15px",
      fontWeight: 900,
      margin: "0 0 20px 0",
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: "#334155",
    },
    reviewItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: "13px 0",
      borderBottom: "1px solid #e2e8f0",
      fontSize: "14px",
    },
    reviewItemLabel: {
      color: "#64748b",
      fontWeight: 700,
    },
    reviewItemValue: {
      color: "#111827",
      fontWeight: 800,
      textAlign: "right",
      flex: 1,
      marginLeft: "16px",
    },
    pricingCard: {
      background: "linear-gradient(135deg, #ecfdf5 0%, #f8fffb 60%, #ffffff 100%)",
      border: "2px solid #86efac",
      boxShadow: "0 14px 30px rgba(34,197,94,0.16)",
    },
    pricingBreakdown: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    priceItem: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "13px",
      color: "#6b7280",
    },
    priceItemAmount: {
      fontWeight: 700,
      color: "#111827",
    },
    divider: {
      height: "2px",
      background: "#86efac",
      margin: "12px 0",
    },

 heroWrapper: {
  width: "100%",
  maxWidth: "1200px",
},
heroLeft: {
  flex: 1,
},


heroBadge: {
  display: "inline-block",
  padding: "8px 18px",
  borderRadius: "30px",
  background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
  color: "#15803d",
  fontWeight: 700,
  fontSize: "13px",
  marginBottom: "20px",
  border: "1px solid #86efac",
  letterSpacing: "1px",
  textTransform: "uppercase",
},




heroHighlight: {
  color: "#16a34a",
  background: "linear-gradient(135deg, #16a34a, #22c55e)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
},


heroTextWrapper: {
  marginTop: "20px",
  marginBottom: "45px",
  maxWidth: "600px",
},

heroLine1: {
  fontSize: isMobile ? "16px" : "18px",
  color: "#6b7280",
  marginBottom: "14px",
  fontWeight: 500,
  letterSpacing: "0.3px",
},


heroLine2: {
  fontSize: isMobile ? "20px" : "24px",
  color: "#111827",
  fontWeight: 700,
  lineHeight: 1.5,
},

heroStrong: {
  fontWeight: 900,
  color: "#111827",
  borderBottom: "3px solid #22c55e",
  paddingBottom: "2px",
},


heroFeatures: {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "30px",
},

featurePill: {
  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
  padding: "10px 18px",
  borderRadius: "30px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#15803d",
  border: "1.5px solid #86efac",
  letterSpacing: "0.3px",
},

heroButtons: {
  display: "flex",
  gap: "16px",
  flexDirection: isMobile ? "column" : "row",
},

heroPrimaryBtn: {
  padding: "15px 30px",
  background: "linear-gradient(135deg, #16a34a, #22c55e)",
  color: "#fff",
  border: "none",
  borderRadius: "30px",
  fontWeight: 800,
  fontSize: "15px",
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(34,197,94,0.4)",
  letterSpacing: "0.3px",
},

heroSecondaryBtn: {
  padding: "15px 30px",
  background: "#ffffff",
  border: "2px solid #d1d5db",
  borderRadius: "30px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  color: "#374151",
  letterSpacing: "0.3px",
},


    priceTotal: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "16px",
      fontWeight: 800,
      color: "#111827",
    },
    amount: {
      color: "#22c55e",
      fontSize: "24px",
    },
    paymentMethod: {
      marginTop: "20px",
      paddingTop: "20px",
      borderTop: "1px solid #e5e7eb",
    },
    paymentMethodText: {
      margin: 0,
      fontSize: "13px",
      color: "#111827",
      fontWeight: 600,
    },
    brandMessage: {
      background: "linear-gradient(135deg, #f0fdf4 0%, #f8fffe 100%)",
      border: "2px solid #a7f3d0",
      borderRadius: "12px",
      padding: "40px",
      textAlign: "center",
      marginBottom: "40px",
    },
    messageTitle: {
      fontSize: "20px",
      fontWeight: 800,
      color: "#111827",
      margin: "0 0 12px 0",
      letterSpacing: "-0.3px",
    },
    messageText: {
      fontSize: "14px",
      color: "#6b7280",
      margin: "0",
      lineHeight: 1.6,
    },
    successSection: {
      textAlign: "center",
      padding: "80px 0",
    },
    successIcon: {
      fontSize: "80px",
      marginBottom: "20px",
    },
    successTitle: {
      fontSize: "32px",
      fontWeight: 800,
      color: "#111827",
      margin: "0 0 12px 0",
    },
    successSubtitle: {
      fontSize: "16px",
      color: "#6b7280",
      margin: "0 0 30px 0",
    },
    successDetails: {
      background: "#f0fdf4",
      border: "2px solid #a7f3d0",
      borderRadius: "12px",
      padding: "20px",
      margin: "30px auto",
      display: "inline-block",
      minWidth: "300px",
    },
    successDetailsText: {
      fontSize: "14px",
      color: "#065f46",
      margin: "8px 0",
    },

    heroCard: {
  borderRadius: "24px",
  overflow: "hidden",
},

heroImage: {
  width: "100%",
  display: "block",
},
    actionButtons: {
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      marginTop: "40px",
    },
    btnPrimary: {
      padding: "14px 40px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "none",
      background: "#22c55e",
      color: "#ffffff",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    btnPrimaryHover: {
      background: "#16a34a",
      boxShadow: "0 8px 16px rgba(34, 197, 94, 0.3)",
    },
    btnSecondary: {
      padding: "14px 40px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "2px solid #e5e7eb",
      background: "#ffffff",
      color: "#111827",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    btnLarge: {
      padding: "16px 50px",
      fontSize: "16px",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      padding: "20px",
    },
    modalContent: {
      background: "#ffffff",
      borderRadius: "12px",
      maxWidth: "800px",
      width: "100%",
      maxHeight: "90vh",
      overflowY: "auto",
      position: "relative",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    },
    modalClose: {
      position: "absolute",
      top: "16px",
      right: "16px",
      background: "#f3f4f6",
      border: "none",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      fontSize: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      transition: "all 0.3s ease",
    },
  };

  const mergeStyles = (...styleObjects) => {
    return Object.assign({}, ...styleObjects);
  };

 return (
    <div style={styles.pageContainer}>
      <Header />
      <div style={{ paddingTop: "80px" }}></div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
input[type="date"] {
  color-scheme: dark;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

input[type="date"]:focus {
  background: rgba(255,255,255,0.12) !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(34,197,94,0.2) !important;
  border-color: #22c55e !important;
}


        input:focus {
          outline: none;
          border-color: #22c55e !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
        }
        
        select:focus {
          outline: none;
          border-color: #22c55e !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
        }

        @media (max-width: 1024px) {
          body { font-size: 14px; }
        }
        
        @media (max-width: 768px) {
          body { font-size: 13px; }
        }

        @media (max-width: 480px) {
          body { font-size: 12px; }
        }

        body {
          background: linear-gradient(160deg, #f0fdf4 0%, #ffffff 30%, #f8faff 60%, #f0fdf4 100%);
        }

        .page-blob-1 {
          position: fixed;
          top: -150px;
          right: -150px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .page-blob-2 {
          position: fixed;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .page-blob-3 {
          position: fixed;
          top: 40%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(34,197,94,0.04) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* Background blobs */}
      <div className="page-blob-1" />
      <div className="page-blob-2" />
      <div className="page-blob-3" />

     {/* HERO SECTION */}
{step === "plans" && (
  <div style={styles.heroSection}>
    <div style={styles.heroWrapper}>
      {/* LEFT CONTENT */}
      <div style={styles.heroLeft}>
        <div style={styles.heroBadge}>
          {HERO_CONTENT.badge}
        </div>

       <h1 style={styles.heroMainTitle}>
          {HERO_CONTENT.titleLine1}
          <br />
          <span style={styles.heroHighlight}>
            {HERO_CONTENT.titleHighlight}
          </span>
        </h1>

       <div style={styles.heroTextWrapper}>
  <div style={styles.heroLine1}>
    Disciplined meals. Defined results.
  </div>

  <div style={styles.heroLine2}>
    Give your body what it needs.
    <span style={styles.heroStrong}> Watch it respond.</span>
  </div>
</div>

        <div style={styles.heroFeatures}>
          {HERO_CONTENT.features.map((item, i) => (
            <div key={i} style={styles.featurePill}>
              ✓ {item}
            </div>
          ))}
        </div>

        <div style={styles.heroButtons}>
          <button
            style={styles.heroPrimaryBtn}
            onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
          >
            {HERO_CONTENT.primaryBtn}
          </button>

          <button style={styles.heroSecondaryBtn}>
            {HERO_CONTENT.secondaryBtn}
          </button>
        </div>
      </div>

    
    </div>
  </div>
)}

      

      {/* MESSAGE ALERT */}
      {message && (
        <div style={mergeStyles(styles.alertContainer, messageType === "success" ? styles.alertSuccess : styles.alertError)}>
          <span>{message}</span>
          <button style={styles.closeAlert} onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}

      <div style={styles.container}>
        {/* STEP INDICATOR */}
      {step !== "success" && (
  <div style={styles.stepIndicator}>

    {/* Step 1 */}
    <div style={mergeStyles(styles.step, step === "plans" ? styles.stepActive : {})}>
      <div style={mergeStyles(styles.stepNumber, step === "plans" ? styles.stepNumberActive : 
        (step === "details" || step === "review") ? { background: "#dcfce7", color: "#16a34a", border: "2px solid #86efac" } : {})}>
        {(step === "details" || step === "review") ? "✓" : "1"}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={mergeStyles(styles.stepLabel, step === "plans" ? styles.stepLabelActive : {})}>
          Choose Plan
        </p>
        <p style={{ fontSize: "11px", color: step === "plans" ? "#22c55e" : "#9ca3af", margin: "2px 0 0 0", fontWeight: 500 }}>
          Pick your structure
        </p>
      </div>
    </div>

    {/* Divider 1-2 */}
    <div style={{
      ...styles.stepDivider,
      background: (step === "details" || step === "review") ? "linear-gradient(90deg, #22c55e, #86efac)" : "#e5e7eb",
    }} />

    {/* Step 2 */}
    <div style={mergeStyles(styles.step, step === "details" ? styles.stepActive : {})}>
      <div style={mergeStyles(styles.stepNumber, step === "details" ? styles.stepNumberActive :
        step === "review" ? { background: "#dcfce7", color: "#16a34a", border: "2px solid #86efac" } : {})}>
        {step === "review" ? "✓" : "2"}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={mergeStyles(styles.stepLabel, step === "details" ? styles.stepLabelActive : {})}>
          Your Details
        </p>
        <p style={{ fontSize: "11px", color: step === "details" ? "#22c55e" : "#9ca3af", margin: "2px 0 0 0", fontWeight: 500 }}>
          Lock your routine
        </p>
      </div>
    </div>

    {/* Divider 2-3 */}
    <div style={{
      ...styles.stepDivider,
      background: step === "review" ? "linear-gradient(90deg, #22c55e, #86efac)" : "#e5e7eb",
    }} />

    {/* Step 3 */}
    <div style={mergeStyles(styles.step, step === "review" ? styles.stepActive : {})}>
      <div style={mergeStyles(styles.stepNumber, step === "review" ? styles.stepNumberActive : {})}>
        3
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={mergeStyles(styles.stepLabel, step === "review" ? styles.stepLabelActive : {})}>
          Review & Pay
        </p>
        <p style={{ fontSize: "11px", color: step === "review" ? "#22c55e" : "#9ca3af", margin: "2px 0 0 0", fontWeight: 500 }}>
          Lock your commitment
        </p>
      </div>
    </div>

  </div>
)}

     {/* STEP 1: PLAN SELECTION */}
{step === "plans" && (
  <div style={styles.plansSection}>
    
    {/* FRUIT PLANS */}
    <div ref={fruitPlansRef} style={styles.planCategory}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>🍓 Fruit Subscriptions</h2>
        <p style={styles.sectionSubtitle}>
          Because One Good Day Should Become Five.
        </p>
      </div>

      <div style={styles.plansGrid}>
        {FRUIT_PLANS.map((plan) => {
          return (
           <div
  key={plan.id}
  style={{
    ...styles.planCard,
  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.75) 100%), url(${PLAN_IMAGES[plan.id]})`,
    ...(plan.highlighted && styles.planCardHighlighted),
    ...(selectedPlan?.id === plan.id && styles.planCardSelected),
  }}
  onClick={() => handlePlanSelect(plan, "fruit")}
  onMouseEnter={(e) => {
    if (!plan.highlighted && selectedPlan?.id !== plan.id) {
      e.currentTarget.style.borderColor = "#22c55e";
      e.currentTarget.style.boxShadow =
        "0 8px 16px rgba(34, 197, 94, 0.1)";
    }
  }}
  onMouseLeave={(e) => {
    if (!plan.highlighted && selectedPlan?.id !== plan.id) {
      e.currentTarget.style.borderColor = "#e5e7eb";
      e.currentTarget.style.boxShadow = "none";
    }
  }}
>

  
              <div style={styles.planBadge}>{plan.badge}</div>
            <h3 style={{ ...styles.planName, color: "#ffffff" }}>
  {plan.name}
</h3>
              <p style={styles.planTagline}>{plan.tagline}</p>
              <p style={styles.planDescription}>{plan.description}</p>

             {(() => {
  const sel = fruitSelections[plan.id];

  return (
    <div style={styles.planSpecs}>
      <div style={styles.spec}>
        <span style={styles.specLabel}>Deliveries</span>
        <span style={styles.specValue}>
          1x/day
        </span>
      </div>

      <div style={styles.spec}>
        <span style={styles.specLabel}>Schedule</span>
        <span style={styles.specValue}>
          {sel.days}x/week
        </span>
      </div>
        
    </div>
  );
})()}

             <div style={styles.planFeatures}>
  {plan.features.map((feature, idx) => {
    let dynamicFeature = feature;

    // Replace "5 days a week" dynamically
    if (feature.toLowerCase().includes("days a week")) {
      dynamicFeature = `${fruitSelections[plan.id].days} days a week`;
    }

    return (
      <div key={idx} style={styles.feature}>
        <span style={styles.featureIcon}>✓</span>
      <span style={{
  ...styles.featureText,
  ...(idx === 0 || idx === plan.features.length - 1 ? {
    background: "rgba(34,197,94,0.25)",
    padding: "2px 8px",
    borderRadius: "4px",
    color: "#bbf7d0",
    fontWeight: 700,
  } : {})
}}>{dynamicFeature}</span>
      </div>
    );
  })}
</div>

              {/* Pricing & Selection Area */}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "16px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                {/* Duration dropdown only for Fresh Start */}
                {plan.id === "fresh-start" && (
                  <select
                    value={fruitSelections["fresh-start"].duration}
                    onChange={(e) =>
                      setFruitSelections((prev) => ({
                        ...prev,
                        "fresh-start": {
                          ...prev["fresh-start"],
                          duration: e.target.value,
                        },
                      }))
                    }
                    style={{
                      ...styles.inputField,
                      marginBottom: "10px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}

                {/* Days dropdown */}
                <select
                  value={fruitSelections[plan.id].days}
                  onChange={(e) =>
                    setFruitSelections((prev) => ({
                      ...prev,
                      [plan.id]: {
                        ...prev[plan.id],
                        days: Number(e.target.value),
                      },
                    }))
                  }
                  style={{
                    ...styles.inputField,
                    marginBottom: "12px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value={5}>5 Days / Week</option>
                  <option value={6}>6 Days / Week</option>
                </select>

                {/* Dynamic Pricing */}
                {(() => {
                  let pricing;

                  if (plan.id === "fresh-start") {
                    const sel = fruitSelections["fresh-start"];
                    pricing =
                      FRUIT_PRICING["fresh-start"][sel.duration][sel.days];
                  } else {
                    const sel = fruitSelections[plan.id];
                    pricing = FRUIT_PRICING[plan.id][sel.days];
                  }

                  return (
                    <>
                      <div
                        style={{
                          textDecoration: "line-through",
                          color: "#9ca3af",
                          fontSize: "14px",
                        }}
                      >
                        ₹{pricing.mrp}
                      </div>

                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: 800,
                          color: "#22c55e",
                          marginBottom: "4px",
                        }}
                      >
                        ₹{pricing.offer}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          color: "#16a34a",
                          fontWeight: 600,
                        }}
                      >
                        {pricing.discount}
                      </div>
                    </>
                  );
                })()}
                <button
                  style={mergeStyles(
                    styles.selectBtn,
                    selectedPlan?.id !== plan.id && styles.selectBtnUnselected
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan, "fruit");
                  }}
                >
                  {selectedPlan?.id === plan.id
                    ? "✓ Locked In"
                    : plan.id === "fresh-start"
                    ? "Start Fresh Today"
                    : plan.id === "stay-on"
                    ? "Stay Consistent"
                    : "Level Yourself Up"}
                </button>

            

              
              </div>
            </div>
          );
        })}
      </div>
    </div>

            {/* MEAL PLANS */}
            <div ref={mealPlansRef} style={styles.planCategory}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>🍱 Meal Subscriptions</h2>
                <p style={styles.sectionSubtitle}>
                  When You Control Your Plate, You Control Your Progress.
                </p>
              </div>

              <div style={styles.plansGrid}>
                {MEAL_PLANS.map((plan) => (
                 <div
  key={plan.id}
  style={{
    ...styles.planCard,
  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.75) 100%), url(${PLAN_IMAGES[plan.id]})`,
    ...(plan.highlighted && styles.planCardHighlighted),
    ...(selectedPlan?.id === plan.id && styles.planCardSelected),
  }}
                    onClick={() => handlePlanSelect(plan, "meal")}
                    onMouseEnter={(e) => {
                      if (!plan.highlighted && selectedPlan?.id !== plan.id) {
                        e.currentTarget.style.borderColor = "#22c55e";
                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(34, 197, 94, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!plan.highlighted && selectedPlan?.id !== plan.id) {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    <div style={styles.planBadge}>{plan.badge}</div>
                    <h3 style={styles.planName}>{plan.name}</h3>
                    <p style={styles.planTagline}>{plan.tagline}</p>
                    <p style={styles.planDescription}>{plan.description}</p>

                   {(() => {
  const sel = mealSelections[plan.id];

  return (
    <div style={styles.planSpecs}>
      <div style={styles.spec}>
        <span style={styles.specLabel}>Type</span>
       <span style={styles.specValue}>
  {sel.meals === 1 ? "Lunch" : "Lunch / Dinner"}
</span>
      </div>

      <div style={styles.spec}>
        <span style={styles.specLabel}>Schedule</span>
        <span style={styles.specValue}>
          {sel.days}x/week
        </span>
      </div>
    </div>
  );
})()}

                   {(() => {
  const sel = mealSelections[plan.id];

  return (
    <div style={styles.planFeatures}>
      <div style={styles.feature}>
        <span style={styles.featureIcon}>✓</span>
        <span style={styles.featureText}>
          {sel.meals === 1
            ? `1 ${sel.slot === "dinner" ? "dinner" : "lunch"} per day`
            : "1 lunch & 1 dinner per day"}
        </span>
      </div>

      <div style={styles.feature}>
        <span style={styles.featureIcon}>✓</span>
        <span style={styles.featureText}>
          {sel.days} days a week
        </span>
      </div>

      <div style={styles.feature}>
        <span style={styles.featureIcon}>✓</span>
        <span style={styles.featureText}>
          Consistent nutrition
        </span>
      </div>

      <div style={styles.feature}>
        <span style={styles.featureIcon}>✓</span>
        <span style={styles.featureText}>
          Structured daily meals
        </span>
      </div>
    </div>
  );
})()}

                   <div style={{marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e5e7eb"}}>

  {/* Days Dropdown */}
  <select
    value={mealSelections[plan.id].days}
    onChange={(e) =>
      setMealSelections(prev => ({
        ...prev,
        [plan.id]: {
          ...prev[plan.id],
          days: Number(e.target.value)
        }
      }))
    }
    style={{ ...styles.inputField, marginBottom: "10px" }}
    onClick={(e) => e.stopPropagation()}
  >
    <option value={5}>5 Days / Week</option>
    <option value={6}>6 Days / Week</option>
  </select>

  {/* Meals Per Day Dropdown */}
  <select
    value={mealSelections[plan.id].meals}
    onChange={(e) =>
      setMealSelections(prev => ({
        ...prev,
        [plan.id]: {
          ...prev[plan.id],
          meals: Number(e.target.value),
          slot: Number(e.target.value) >= 2
            ? "both"
            : (prev[plan.id]?.slot === "dinner" ? "dinner" : "lunch"),
        }
      }))
    }
    style={{ ...styles.inputField, marginBottom: "12px" }}
    onClick={(e) => e.stopPropagation()}
  >
    <option value={1}>1 Meal / Day</option>
    <option value={2}>2 Meals / Day</option>
  </select>

  {mealSelections[plan.id].meals === 1 && (
    <select
      value={mealSelections[plan.id].slot || "lunch"}
      onChange={(e) =>
        setMealSelections(prev => ({
          ...prev,
          [plan.id]: {
            ...prev[plan.id],
            slot: e.target.value === "dinner" ? "dinner" : "lunch",
          }
        }))
      }
      style={{ ...styles.inputField, marginBottom: "12px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <option value="lunch">Lunch</option>
      <option value="dinner">Dinner</option>
    </select>
  )}

  {/* Dynamic Price */}
 {(() => {
  const sel = mealSelections[plan.id];
  const pricing = MEAL_PRICING[plan.id][sel.days][sel.meals];

  return (
    <>
      <div
        style={{
          textDecoration: "line-through",
          color: "#9ca3af",
          fontSize: "14px",
        }}
      >
        ₹{pricing.mrp}
      </div>

      <div
        style={{
          fontSize: "22px",
          fontWeight: 800,
          color: "#22c55e",
          marginBottom: "4px",
        }}
      >
        ₹{pricing.offer}
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#16a34a",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        {pricing.discount}
      </div>
    </>
  );
})()}


{plan.id === "power-routine" && (
    <button
      onClick={(e) => { e.stopPropagation(); setShowMealMenu(true); }}
      style={{
        width: "100%", padding: "10px 16px", marginBottom: "8px",
        border: "1px solid rgba(34,197,94,0.5)",
        background: "rgba(34,197,94,0.1)", color: "#4ade80",
        borderRadius: "8px", fontSize: "13px", fontWeight: 700,
        cursor: "pointer", letterSpacing: "0.3px",
      }}
    >
      📋 View Weekly Menu
    </button>
  )}

  {plan.id === "no-excuses" && (
    <button
      onClick={(e) => { e.stopPropagation(); setShowNoExcusesMenu(true); }}
      style={{
        width: "100%", padding: "10px 16px", marginBottom: "8px",
        border: "1px solid rgba(99,102,241,0.5)",
        background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
        borderRadius: "8px", fontSize: "13px", fontWeight: 700,
        cursor: "pointer", letterSpacing: "0.3px",
      }}
    >
      📋 View Weekly Menu
    </button>
  )}

  {plan.id === "on-track" && (
    <button
      onClick={(e) => { e.stopPropagation(); setShowOnTrackMenu(true); }}
      style={{
        width: "100%", padding: "10px 16px", marginBottom: "8px",
        border: "1px solid rgba(251,146,60,0.5)",
        background: "rgba(251,146,60,0.1)", color: "#fdba74",
        borderRadius: "8px", fontSize: "13px", fontWeight: 700,
        cursor: "pointer", letterSpacing: "0.3px",
      }}
    >
      📋 View Weekly Menu
    </button>
  )}



  <button
    style={mergeStyles(
      styles.selectBtn,
      selectedPlan?.id !== plan.id && styles.selectBtnUnselected
    )}
  >
    {selectedPlan?.id === plan.id
  ? "✓ Locked In"
  : plan.id === "power-routine"
  ? "Start With Strength"
  : plan.id === "no-excuses"
  ? "Break Your Limits"
  : "Operate At Peak"}
  </button>
</div>


                      
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.actionButtons}>
              <button style={styles.btnSecondary} onClick={() => navigate("/")}>
                Continue Shopping
              </button>
              <button
                style={styles.btnPrimary}
                onClick={validateAndProceed}
                disabled={!selectedPlan}
              >
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DELIVERY DETAILS */}
     {step === "details" && (
  <div style={{ padding: "40px 0" }}>

    {/* Title */}
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <div style={{
        display: "inline-block", padding: "6px 16px", borderRadius: "30px",
        background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
        color: "#15803d", fontWeight: 700, fontSize: "12px",
        letterSpacing: "2px", textTransform: "uppercase",
        marginBottom: "16px", border: "1px solid #86efac"
      }}>Step 2 of 3</div>
      <h2 style={{
        fontSize: isMobile ? "26px" : "38px", fontWeight: 900,
        color: "#111827", margin: "0 0 8px 0", letterSpacing: "-1px"
      }}>Lock In Your Routine.</h2>
      <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>
        Fill in your details and we'll handle the rest.
      </p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>

      {/* LEFT COLUMN */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Delivery address card */}
        <div style={{
          background: "linear-gradient(145deg, #ffffff 0%, #f8fffa 100%)",
          borderRadius: "20px",
          padding: "30px",
          border: "1px solid #dcfce7",
          boxShadow: "0 10px 30px rgba(16,185,129,0.08)",
        }}>
          <h3 style={{
            margin: "0 0 14px 0",
            fontSize: "13px",
            fontWeight: 800,
            color: "#166534",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
          }}>
            Delivery Contact & Address
          </h3>

          <div style={{
            margin: "0 0 18px 0",
            borderRadius: "14px",
            padding: "14px 16px",
            background: "linear-gradient(135deg, #14532d 0%, #166534 65%, #22c55e 100%)",
            border: "1px solid rgba(187,247,208,0.5)",
            boxShadow: "0 12px 24px rgba(22,163,74,0.25)",
          }}>
            <div style={{
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#bbf7d0",
              fontWeight: 800,
              marginBottom: "8px",
            }}>
              Daily Health Commitment
            </div>
            <div style={{
              margin: 0,
              fontSize: isMobile ? "16px" : "18px",
              lineHeight: 1.5,
              color: "#ffffff",
              fontWeight: 800,
              letterSpacing: "0.1px",
            }}>
              Hi <span style={{ color: "#86efac" }}>{user?.name || "there"}</span>, this step today can transform your daily health. Start your fresh routine with <span style={{ color: "#dcfce7" }}>Divasa Fresh</span>.
            </div>
          </div>

          <div style={{
            border: "1px solid #d1fae5",
            background: "#ffffff",
            borderRadius: "14px",
            padding: "14px",
            marginBottom: "12px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>
                  {formData.deliveryDetails.name || user?.name || "Customer"}
                </div>
                <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "2px" }}>
                  {formData.deliveryDetails.phone || user?.phone || ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setShowAddressBookModal(true)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #86efac",
                    background: "#f0fdf4",
                    color: "#166534",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Change
                </button>
                <button
                  onClick={openAddNewAddressFlow}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #bbf7d0",
                    background: "#ffffff",
                    color: "#166534",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Add New
                </button>
              </div>
            </div>
            <div style={{ marginTop: "10px", fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>
              {formData.deliveryDetails.addressLine || "No delivery address selected"}
              {formData.deliveryDetails.landmark ? `, ${formData.deliveryDetails.landmark}` : ""}
              <br />
              {formData.deliveryDetails.city || "Bengaluru"} - {formData.deliveryDetails.pincode || "560049"}
            </div>
          </div>
        </div>

        {/* Payment card */}
        <div style={{
          background: "#ffffff", borderRadius: "20px", padding: "28px",
          border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
        }}>
          <h3 style={{
            margin: "0 0 16px 0", fontSize: "13px", fontWeight: 800,
            color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1.5px"
          }}>💳 Payment Method</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { value: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay on arrival" },
              { value: "full", label: "Pay Now", icon: "💳", desc: "Secure & instant" },
            ].map((option) => (
              <div key={option.value}
                onClick={() => setFormData(prev => ({ ...prev, paymentType: option.value }))}
                style={{
                  padding: "16px", borderRadius: "14px", cursor: "pointer",
                  border: formData.paymentType === option.value
                    ? "2px solid #22c55e" : "2px solid #e5e7eb",
                  background: formData.paymentType === option.value ? "#f0fdf4" : "#f9fafb",
                  transition: "all 0.2s ease", position: "relative",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{option.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#111827" }}>{option.label}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{option.desc}</div>
                {formData.paymentType === option.value && (
                  <div style={{
                    position: "absolute", top: "10px", right: "10px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#22c55e", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700
                  }}>✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN - Plan summary dark card */}
      <div style={{
        background: "linear-gradient(160deg, #0f1a0f 0%, #1a2e1a 100%)",
        borderRadius: "20px", padding: "30px",
        border: "1px solid rgba(34,197,94,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column", gap: "16px",
        position: isMobile ? "static" : "sticky",
        top: "100px", alignSelf: "start",
      }}>
        <h3 style={{
          margin: "0 0 4px 0", fontSize: "13px", fontWeight: 800,
          color: "#4ade80", textTransform: "uppercase", letterSpacing: "1.5px"
        }}>📋 Your Plan Details</h3>

        {/* Plan name */}
        <div style={{
          padding: "16px", borderRadius: "14px",
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.2)",
        }}>
          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Selected Plan</div>
          <div style={{ fontSize: "18px", color: "#ffffff", fontWeight: 900 }}>{selectedPlan?.name}</div>
          <div style={{ fontSize: "12px", color: "#4ade80", marginTop: "4px", fontWeight: 600, textTransform: "capitalize" }}>{selectedPlanType} Plan</div>
        </div>

        {/* Duration */}
        <div style={{
          padding: "16px", borderRadius: "14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Duration</div>
          {selectedPlanType === "fruit" ? (
            <select
              name="durationType"
              value={fruitSelections[selectedPlan?.id]?.duration || formData.durationType}
              onChange={(e) => {
                const value = e.target.value;
                setFruitSelections((prev) => ({
                  ...prev,
                  "fresh-start": {
                    ...prev["fresh-start"],
                    duration: value,
                  },
                }));
                setFormData((prev) => ({ ...prev, durationType: value }));
              }}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                background: "rgba(255,255,255,0.08)", color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.15)", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              <option value="weekly" style={{ background: "#1a2e1a" }}>Weekly</option>
              <option value="monthly" style={{ background: "#1a2e1a" }}>Monthly</option>
            </select>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", color: "#4ade80", fontWeight: 800 }}>Monthly</span>
              <span style={{
                background: "rgba(34,197,94,0.15)", color: "#4ade80",
                padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700
              }}>Auto</span>
            </div>
          )}
        </div>

        {/* Delivery Slot */}
        <div style={{
          padding: "16px", borderRadius: "14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Delivery Slot</div>
          {selectedPlanType === "fruit" ? (
            <select
              name="deliverySlot"
              value={formData.deliverySlot}
              onChange={handleInputChange}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                background: "rgba(255,255,255,0.08)", color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.15)", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              <option value="morning" style={{ background: "#1a2e1a" }}>Morning (6–10 AM)</option>
              <option value="afternoon" style={{ background: "#1a2e1a" }}>Afternoon (12–4 PM)</option>
              <option value="evening" style={{ background: "#1a2e1a" }}>Evening (4–8 PM)</option>
            </select>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(mealSelections[selectedPlan?.id]?.meals || 1) === 1 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)"
                }}>
                  <span style={{ fontSize: 18 }}>
                    {(mealSelections[selectedPlan?.id]?.slot || "lunch") === "dinner" ? "🌙" : "🍽️"}
                  </span>
                  <div>
                    <div style={{ fontSize: "13px", color: "#fbbf24", fontWeight: 700 }}>
                      {(mealSelections[selectedPlan?.id]?.slot || "lunch") === "dinner" ? "Dinner" : "Lunch"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {(mealSelections[selectedPlan?.id]?.slot || "lunch") === "dinner" ? "7:00 – 8:30 PM" : "12:30 – 2:00 PM"}
                    </div>
                  </div>
                </div>
              )}
              {(mealSelections[selectedPlan?.id]?.meals || 1) >= 2 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)"
                }}>
                  <span>🍽️</span>
                  <div>
                    <div style={{ fontSize: "13px", color: "#fbbf24", fontWeight: 700 }}>Lunch</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>12:30 – 2:00 PM</div>
                  </div>
                </div>
              )}
              {(mealSelections[selectedPlan?.id]?.meals || 1) >= 2 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)"
                }}>
                  <span>🌙</span>
                  <div>
                    <div style={{ fontSize: "13px", color: "#818cf8", fontWeight: 700 }}>Dinner</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>7:00 – 8:30 PM</div>
                  </div>
                </div>
              )}
              <div style={{ fontSize: "11px", color: "#4b5563", marginTop: "2px", fontStyle: "italic" }}>
                {(mealSelections[selectedPlan?.id]?.meals || 1) >= 2
                  ? "Auto-set to lunch + dinner for 2 meals/day"
                  : "Slot follows your 1-meal selection"}
              </div>
            </div>
          )}
        </div>

        {/* Start Date */}
        <div style={{
          padding: "16px", borderRadius: "14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Start Date</div>
          <input
            type="date" name="startDate"
            value={formData.startDate} onChange={handleInputChange}
            min={getTomorrowDateString()}
           style={{
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  background: "rgba(255,255,255,0.08)", color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.15)", fontSize: "14px",
  fontWeight: 600, boxSizing: "border-box",
  colorScheme: "dark",
  WebkitTextFillColor: "#ffffff",
}}
          />
        </div>

        {/* Price summary */}
        <div style={{
          padding: "16px", borderRadius: "14px",
          background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
          border: "1px solid rgba(34,197,94,0.25)",
          marginTop: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#86efac", fontWeight: 600 }}>Total Amount</span>
            <span style={{ fontSize: "22px", color: "#4ade80", fontWeight: 900 }}>
              ₹{selectedPlanType === "fruit" ? getSelectedFruitPrice() : calculateTotal()}
            </span>
          </div>
        </div>

      </div>

    </div>

    <div style={{ ...styles.actionButtons, marginTop: "32px" }}>
      <button style={styles.btnSecondary} onClick={() => setStep("plans")}>
        ← Back to Plans
      </button>
      <button style={styles.btnPrimary} onClick={validateAndProceed}>
        Review & Confirm
      </button>
    </div>
  </div>
)}


        {/* STEP 3: REVIEW & CHECKOUT */}
        {step === "review" && (
          <div style={styles.reviewSection}>
            <h2 style={styles.sectionTitleDetails}>No More Gaps. No More Excuses.</h2>

            <div style={styles.reviewGrid}>
              <div style={styles.reviewCard}>
                <h3 style={styles.reviewCardTitle}>📌 Plan Summary</h3>
                <div style={mergeStyles(styles.reviewItem)}>
                  <span style={styles.reviewItemLabel}>Plan:</span>
                  <span style={styles.reviewItemValue}>{selectedPlan.name}</span>
                </div>
                <div style={mergeStyles(styles.reviewItem)}>
                  <span style={styles.reviewItemLabel}>Category:</span>
                  <span style={mergeStyles(styles.reviewItemValue, {textTransform: "capitalize"})}>
                    {selectedPlanType}
                  </span>
                </div>
                <div style={mergeStyles(styles.reviewItem)}>
                  <span style={styles.reviewItemLabel}>Deliveries:</span>
                  <span style={styles.reviewItemValue}>
                   {selectedPlan.deliveriesPerDay}x day,{" "}
{selectedPlanType === "fruit"
  ? fruitSelections[selectedPlan.id].days
  : mealSelections[selectedPlan.id].days}x week
                  </span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewItemLabel}>Duration:</span>
                  <span style={mergeStyles(styles.reviewItemValue, {textTransform: "capitalize"})}>
                    {getEffectiveDurationType()}
                  </span>
                </div>
              </div>

              <div style={styles.reviewCard}>
                <h3 style={styles.reviewCardTitle}>📦 Delivery Info</h3>
                <div style={mergeStyles(styles.reviewItem)}>
                  <span style={styles.reviewItemLabel}>Name:</span>
                  <span style={styles.reviewItemValue}>{formData.deliveryDetails.name}</span>
                </div>
                <div style={mergeStyles(styles.reviewItem)}>
                  <span style={styles.reviewItemLabel}>Phone:</span>
                  <span style={styles.reviewItemValue}>{formData.deliveryDetails.phone}</span>
                </div>
                <div style={mergeStyles(styles.reviewItem)}>
                  <span style={styles.reviewItemLabel}>Address:</span>
                  <span style={styles.reviewItemValue}>
                    {formData.deliveryDetails.addressLine}
                  </span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewItemLabel}>City:</span>
                  <span style={styles.reviewItemValue}>
                    {formData.deliveryDetails.city} - {formData.deliveryDetails.pincode}
                  </span>
                </div>
              </div>

              <div style={mergeStyles(styles.reviewCard, styles.pricingCard)}>
               <div style={styles.pricingBreakdown}>
  {selectedPlanType === "fruit" ? (
    <div style={styles.priceItem}>
      <span>Plan Price:</span>
      <span style={styles.priceItemAmount}>
        ₹{getSelectedFruitPrice()}
      </span>
    </div>
 ) : (
   <>
  <div style={styles.priceItem}>
    <span>Days per week:</span>
    <span style={styles.priceItemAmount}>
      {mealSelections[selectedPlan.id].days}
    </span>
  </div>
  <div style={styles.priceItem}>
    <span>Meals per day:</span>
    <span style={styles.priceItemAmount}>
      {mealSelections[selectedPlan.id].meals}
    </span>
  </div>
  {mealSelections[selectedPlan.id].meals === 1 && (
    <div style={styles.priceItem}>
      <span>Selected slot:</span>
      <span style={styles.priceItemAmount}>
        {mealSelections[selectedPlan.id].slot === "dinner" ? "Dinner" : "Lunch"}
      </span>
    </div>
  )}
  <div style={styles.priceItem}>
    <span>MRP:</span>
    <span style={{ ...styles.priceItemAmount, textDecoration: "line-through", color: "#9ca3af" }}>
      ₹{MEAL_PRICING[selectedPlan.id][mealSelections[selectedPlan.id].days][mealSelections[selectedPlan.id].meals].mrp}
    </span>
  </div>
  <div style={styles.priceItem}>
    <span>Discount:</span>
    <span style={{ ...styles.priceItemAmount, color: "#16a34a" }}>
      {MEAL_PRICING[selectedPlan.id][mealSelections[selectedPlan.id].days][mealSelections[selectedPlan.id].meals].discount}
    </span>
  </div>
</>
  )}

  <div style={styles.divider}></div>

  <div style={styles.priceTotal}>
    <span>Total:</span>
    <span style={styles.amount}>₹{calculateTotal()}</span>
  </div>
</div>

                <div style={styles.paymentMethod}>
                  <p style={styles.paymentMethodText}>
                    Payment: {formData.paymentType === "cod" ? "One-time COD (pay within 3 days)" : "Pay Now"}
                  </p>
                </div>
              </div>
            </div>

           <div style={{
  borderRadius: "20px",
  padding: "40px 48px",
  marginBottom: "40px",
  background: "linear-gradient(135deg, #0f1a0f 0%, #1a2e1a 60%, #0f2318 100%)",
  border: "1px solid rgba(34,197,94,0.25)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  position: "relative",
  overflow: "hidden",
}}>
  {/* Decorative glow */}
  <div style={{
    position: "absolute", top: "-60px", right: "-60px",
    width: "200px", height: "200px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  }} />
  <div style={{
    position: "absolute", bottom: "-40px", left: "-40px",
    width: "160px", height: "160px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  }} />

  <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
    {/* Top label */}
    <div style={{
      display: "inline-block",
      padding: "5px 14px", borderRadius: "20px",
      background: "rgba(34,197,94,0.15)",
      border: "1px solid rgba(34,197,94,0.3)",
      color: "#4ade80", fontSize: "11px", fontWeight: 800,
      letterSpacing: "2px", textTransform: "uppercase",
      marginBottom: "20px",
    }}>
      Your Commitment Starts Now
    </div>

    {/* Main headline */}
    <div style={{
      fontSize: isMobile ? "22px" : "30px",
      fontWeight: 900,
      color: "#ffffff",
      lineHeight: 1.2,
      marginBottom: "6px",
      letterSpacing: "-0.5px",
    }}>
      Show Up Every Day.
    </div>
    <div style={{
      fontSize: isMobile ? "22px" : "30px",
      fontWeight: 900,
      background: "linear-gradient(135deg, #4ade80, #22c55e)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      lineHeight: 1.2,
      marginBottom: "24px",
      letterSpacing: "-0.5px",
    }}>
      Even When You Don't Feel Like It.
    </div>

    {/* 3 punchy stats */}
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    }}>
      {[
        { icon: "🍱", stat: "Meals Ready", desc: "No decision fatigue" },
        { icon: "🚚", stat: "Delivery Booked", desc: "Arrives on time, every time" },
        { icon: "📈", stat: "Progress Locked", desc: "Your streak starts today" },
      ].map((item, i) => (
        <div key={i} style={{
          padding: "16px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: "24px", marginBottom: "6px" }}>{item.icon}</div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>
            {item.stat}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
            {item.desc}
          </div>
        </div>
      ))}
    </div>

    {/* Bottom line */}
    <p style={{
      fontSize: "14px",
      color: "#86efac",
      margin: 0,
      fontWeight: 600,
      fontStyle: "italic",
      letterSpacing: "0.2px",
    }}>
      "Don't wait for tomorrow. Your progress starts the moment you confirm."
    </p>
  </div>
</div>

            <div style={styles.actionButtons}>
              <button style={styles.btnSecondary} onClick={() => setStep("details")}>
                Back to Details
              </button>
              <button
                style={mergeStyles(styles.btnPrimary, styles.btnLarge)}
                onClick={handleCreateSubscription}
                disabled={loading}
              >
                {loading ? "Creating..." : "✅ CONFIRM & SUBSCRIBE"}
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div style={styles.successSection}>
            <div style={styles.successIcon}>🏆</div>
            <h2 style={styles.successTitle}>Subscription Created!</h2>
            <p style={styles.successSubtitle}>Your journey to consistency starts now.</p>
            <div style={styles.successDetails}>
              <p style={styles.successDetailsText}>
                First delivery: <strong>{new Date(createdSubscription?.startDate || formData.startDate).toLocaleDateString("en-IN")}</strong>
              </p>
              <p style={styles.successDetailsText}>
                Plan: <strong>{selectedPlan.name}</strong>
              </p>
              <p style={styles.successDetailsText}>
                Amount: <strong>₹{calculateTotal()}</strong>
              </p>
            </div>
            <div style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(59,130,246,0.12))",
              border: "1px solid rgba(34,197,94,0.25)",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "10px",
              textAlign: "left",
            }}>
              {[
                { icon: "💪", title: "Strength Routine", text: "Consistency builds real transformation." },
                { icon: "🔥", title: "Momentum Mode", text: "Each delivery keeps your streak alive." },
                { icon: "🏃", title: "Action Over Mood", text: "Show up daily and progress follows." },
              ].map((card) => (
                <div key={card.title} style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(255,255,255,0.75)",
                }}>
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{card.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#14532d" }}>{card.title}</div>
                  <div style={{ fontSize: "12px", color: "#374151", marginTop: "4px" }}>{card.text}</div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "14px", color: "#166534", fontWeight: 700, fontSize: "13px" }}>
              No shortcuts. Just daily wins. Keep going.
            </p>
            <button style={styles.btnPrimary} onClick={() => navigate("/my-subscriptions")}>
              View My Subscriptions
            </button>
          </div>
        )}
      </div>

      {showAddressBookModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddressBookModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: "620px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowAddressBookModal(false)}>✕</button>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "20px", fontWeight: 900, color: "#111827" }}>Choose Delivery Address</h3>
            <p style={{ margin: "0 0 16px 0", color: "#6b7280", fontSize: "13px" }}>Select an existing address or add a new one.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "50vh", overflowY: "auto", paddingRight: "4px" }}>
              {savedAddresses.length ? savedAddresses.map((addr) => {
                const isActive = selectedAddress?._id && addr._id === selectedAddress._id;
                return (
                  <button
                    key={addr._id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    style={{
                      textAlign: "left",
                      padding: "14px",
                      borderRadius: "12px",
                      border: isActive ? "2px solid #22c55e" : "1px solid #e5e7eb",
                      background: isActive ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>
                      {addr.addressType || "Address"}{addr.isDefault ? " - Default" : ""}
                    </div>
                    <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px", lineHeight: 1.5 }}>
                      {addr.addressLine || addr.mapAddress}
                    </div>
                  </button>
                );
              }) : (
                <div style={{ fontSize: "13px", color: "#6b7280", padding: "10px 0" }}>
                  No saved addresses found.
                </div>
              )}
            </div>

            <button
              onClick={openAddNewAddressFlow}
              style={{
                width: "100%",
                marginTop: "14px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #86efac",
                background: "#ecfdf5",
                color: "#166534",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              + Add New Address
            </button>
          </div>
        </div>
      )}

      {showMapPinModal && (
        <div style={styles.modalOverlay} onClick={() => setShowMapPinModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: "760px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowMapPinModal(false)}>✕</button>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: 900, color: "#111827" }}>Pin New Address Location</h3>
            <div style={{ height: "380px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
              <MapSelector onLocationSelect={handleNewAddressMapSelect} />
            </div>
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
              {newAddressLocation
                ? (newAddressLocation.fullAddress || newAddressLocation.name || `${newAddressLocation.lat}, ${newAddressLocation.lng}`)
                : "Pin location on map to continue"}
            </div>
            <button
              onClick={proceedFromMapToAddressForm}
              style={{
                width: "100%",
                marginTop: "14px",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "#166534",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Continue to Address Form
            </button>
          </div>
        </div>
      )}

      {showAddressFormModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddressFormModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: "560px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowAddressFormModal(false)}>✕</button>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "20px", fontWeight: 900, color: "#111827" }}>Add Address Details</h3>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
              <input
                type="text"
                placeholder="Flat / House / Floor *"
                value={newAddressDetails.flatNo}
                onChange={(e) => setNewAddressDetails((prev) => ({ ...prev, flatNo: e.target.value }))}
                style={{ ...styles.inputField, borderRadius: "10px" }}
              />
              <input
                type="text"
                placeholder="Building Name *"
                value={newAddressDetails.building}
                onChange={(e) => setNewAddressDetails((prev) => ({ ...prev, building: e.target.value }))}
                style={{ ...styles.inputField, borderRadius: "10px" }}
              />
            </div>
            <input
              type="text"
              placeholder="Area"
              value={newAddressDetails.area}
              onChange={(e) => setNewAddressDetails((prev) => ({ ...prev, area: e.target.value }))}
              style={{ ...styles.inputField, borderRadius: "10px", marginTop: "10px" }}
            />
            <input
              type="text"
              placeholder="Landmark (Optional)"
              value={newAddressDetails.landmark}
              onChange={(e) => setNewAddressDetails((prev) => ({ ...prev, landmark: e.target.value }))}
              style={{ ...styles.inputField, borderRadius: "10px", marginTop: "10px" }}
            />

            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              {["Home", "Work", "Friend", "Others"].map((type) => (
                <button
                  key={type}
                  onClick={() => setNewAddressDetails((prev) => ({ ...prev, type }))}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: newAddressDetails.type === type ? "1px solid #22c55e" : "1px solid #d1d5db",
                    background: newAddressDetails.type === type ? "#f0fdf4" : "#fff",
                    color: "#111827",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            {newAddressDetails.type === "Others" && (
              <input
                type="text"
                placeholder="Custom label (e.g. Aunty Home)"
                value={newAddressDetails.customType}
                onChange={(e) => setNewAddressDetails((prev) => ({ ...prev, customType: e.target.value }))}
                style={{ ...styles.inputField, borderRadius: "10px", marginTop: "10px" }}
              />
            )}

            <button
              disabled={isSavingAddress}
              onClick={handleSaveNewAddress}
              style={{
                width: "100%",
                marginTop: "14px",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "#166534",
                color: "#fff",
                fontWeight: 800,
                cursor: isSavingAddress ? "not-allowed" : "pointer",
                opacity: isSavingAddress ? 0.75 : 1,
              }}
            >
              {isSavingAddress ? "Saving Address..." : "Save Address"}
            </button>
          </div>
        </div>
      )}


      {/* MEAL MENU MODAL */}
      {showMealMenu && (
        <div
          onClick={() => setShowMealMenu(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 3000, padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0f1a0f",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "860px",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid rgba(34,197,94,0.2)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.1)",
              position: "relative",
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
              padding: "28px 32px",
              borderRadius: "24px 24px 0 0",
              position: "sticky", top: 0, zIndex: 10,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{
                    fontSize: "11px", fontWeight: 800, letterSpacing: "3px",
                    textTransform: "uppercase", color: "#86efac", marginBottom: "6px"
                  }}>
                    Power Routine Plan
                  </div>
                  <h2 style={{
                    fontSize: "26px", fontWeight: 900, color: "#ffffff",
                    margin: 0, letterSpacing: "-0.5px"
                  }}>
                    Weekly Meal Menu 🍱
                  </h2>
                  <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#bbf7d0", fontWeight: 500 }}>
                    Fresh · Balanced · Delivered to you
                  </p>
                </div>
                <button
                  onClick={() => setShowMealMenu(false)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff", width: "40px", height: "40px",
                    borderRadius: "50%", cursor: "pointer",
                    fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Meal Table */}
            <div style={{ padding: "24px 28px" }}>

              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "120px 1fr 1fr",
                gap: "12px", marginBottom: "12px", padding: "0 4px"
              }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#4ade80", textTransform: "uppercase", letterSpacing: "1px" }}>Day</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1px" }}>🍽️ Lunch (12:30–2:00 PM)</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "1px" }}>🌙 Dinner (7:00–8:30 PM)</div>
              </div>

              {/* Rows */}
              {[
                {
                  day: "Monday",
                  lunch: "Foxtail Millet Veg Khichdi + Cucumber Mint Salad + Buttermilk",
                  dinner: "Oats Vegetable Upma + Steamed Broccoli + Sprouts",
                },
                {
                  day: "Tuesday",
                  lunch: "Brown Rice + Mixed Veg Curry + Carrot Sticks + Curd",
                  dinner: "Savory Oats Bowl (Peas, Corn, Seeds) + Stir-fried Zucchini",
                },
                {
                  day: "Wednesday",
                  lunch: "Quinoa Vegetable Pulao + Beetroot Salad + Mint Buttermilk",
                  dinner: "Millet Lemon Rice + Steamed Mixed Veg + Roasted Peanuts",
                },
                {
                  day: "Thursday",
                  lunch: "Vegetable Oats Khichdi + Cabbage Slaw + Curd",
                  dinner: "Brown Rice + Light Dal Tadka + Beans & Capsicum Stir Fry",
                },
                {
                  day: "Friday",
                  lunch: "Millet Vegetable Pongal + Tomato Onion Salad + Buttermilk",
                  dinner: "Oats & Moong Dal Chilla (2 pcs) + Mint Chutney + Steamed Veg",
                },
                {
                  day: "Saturday",
                  lunch: "Brown Rice + Rajma (Controlled Portion) + Cucumber Salad + Curd",
                  dinner: "Quinoa Veg Stir Fry + Pumpkin Seeds + Light Clear Soup",
                },
              ].map((row, idx) => (
                <div
                  key={row.day}
                  style={{
                    display: "grid", gridTemplateColumns: "120px 1fr 1fr",
                    gap: "12px", padding: "16px",
                    background: idx % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(34,197,94,0.04)",
                    borderRadius: "12px", marginBottom: "8px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(34,197,94,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(34,197,94,0.04)"}
                >
                  <div style={{
                    fontWeight: 800, fontSize: "14px", color: "#4ade80",
                    display: "flex", alignItems: "center",
                  }}>
                    {row.day}
                  </div>
                  <div style={{ fontSize: "13px", color: "#e5e7eb", lineHeight: 1.5, fontWeight: 500 }}>
                    {row.lunch}
                  </div>
                  <div style={{ fontSize: "13px", color: "#c7d2fe", lineHeight: 1.5, fontWeight: 500 }}>
                    {row.dinner}
                  </div>
                </div>
              ))}

              {/* Footer note */}
              <div style={{
                marginTop: "20px", padding: "16px 20px",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "12px",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <span style={{ fontSize: "22px" }}>🌿</span>
                <p style={{ margin: 0, fontSize: "13px", color: "#86efac", lineHeight: 1.5, fontWeight: 500 }}>
                  Menu rotates weekly for variety. All meals are freshly prepared with no preservatives. Calorie-conscious portions designed for active lifestyles.
                </p>
              </div>

              {/* Bottom buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowMealMenu(false)}
                  style={{
                    padding: "12px 24px", borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "transparent", color: "#9ca3af",
                    fontWeight: 600, fontSize: "14px", cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    setShowMealMenu(false);
                    handlePlanSelect(MEAL_PLANS.find(p => p.id === "power-routine"), "meal");
                  }}
                  style={{
                    padding: "12px 28px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #16a34a, #22c55e)",
                    border: "none", color: "#ffffff",
                    fontWeight: 700, fontSize: "14px", cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(34,197,94,0.35)",
                  }}
                >
                  Select This Plan ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* NO EXCUSES MEAL MENU MODAL */}
      {showNoExcusesMenu && (
        <div
          onClick={() => setShowNoExcusesMenu(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 3000, padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0d0f1f",
              borderRadius: "24px", width: "100%", maxWidth: "860px",
              maxHeight: "90vh", overflowY: "auto",
              border: "1px solid rgba(99,102,241,0.2)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              position: "relative",
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)",
              padding: "28px 32px", borderRadius: "24px 24px 0 0",
              position: "sticky", top: 0, zIndex: 10,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", color: "#a5b4fc", marginBottom: "6px" }}>
                    No Excuses Plan
                  </div>
                  <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
                    Weekly Meal Menu 💪
                  </h2>
                  <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#c7d2fe", fontWeight: 500 }}>
                    High Protein · Plant-Powered · No Gaps
                  </p>
                </div>
                <button
                  onClick={() => setShowNoExcusesMenu(false)}
                  style={{
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff", width: "40px", height: "40px", borderRadius: "50%",
                    cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >✕</button>
              </div>
            </div>

            {/* Table */}
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: "12px", marginBottom: "12px", padding: "0 4px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "1px" }}>Day</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1px" }}>🍽️ Lunch (12:30–2:00 PM)</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "1px" }}>🌙 Dinner (7:00–8:30 PM)</div>
              </div>

              {[
                { day: "Monday", lunch: "Grilled Paneer Power Salad (Spinach, Lettuce, Corn, Seeds) + Mint Buttermilk", dinner: "Moong Sprouts & Paneer Bowl + Cucumber Raita" },
                { day: "Tuesday", lunch: "Brown Rice + Rajma + Carrot-Cucumber Salad", dinner: "Tofu & Stir-Fried Veg Bowl + Pumpkin Seeds" },
                { day: "Wednesday", lunch: "Quinoa + Mixed Bean Salad + Yogurt Dressing", dinner: "Paneer Bhurji (Low Oil) + Millet Roti (1–2) + Steamed Broccoli" },
                { day: "Thursday", lunch: "Chickpea (Chole) Protein Bowl + Fresh Salad + Curd", dinner: "High-Protein Sprouts Chaat + Vegetable Clear Soup" },
                { day: "Friday", lunch: "Paneer & Sweet Corn Salad + Brown Rice (Small Portion)", dinner: "Tofu Veg Stir Fry + Flax & Chia Sprinkle" },
                { day: "Saturday", lunch: "Millet Veg Pulao + Grilled Paneer Cubes + Curd", dinner: "Lentil & Sprout Bowl + Avocado Slice + Light Soup" },
              ].map((row, idx) => (
                <div key={row.day}
                  style={{
                    display: "grid", gridTemplateColumns: "120px 1fr 1fr",
                    gap: "12px", padding: "16px",
                    background: idx % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(99,102,241,0.05)",
                    borderRadius: "12px", marginBottom: "8px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(99,102,241,0.05)"}
                >
                  <div style={{ fontWeight: 800, fontSize: "14px", color: "#a5b4fc", display: "flex", alignItems: "center" }}>{row.day}</div>
                  <div style={{ fontSize: "13px", color: "#e5e7eb", lineHeight: 1.5, fontWeight: 500 }}>{row.lunch}</div>
                  <div style={{ fontSize: "13px", color: "#c7d2fe", lineHeight: 1.5, fontWeight: 500 }}>{row.dinner}</div>
                </div>
              ))}

              <div style={{ marginTop: "20px", padding: "16px 20px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "22px" }}>🔥</span>
                <p style={{ margin: 0, fontSize: "13px", color: "#c7d2fe", lineHeight: 1.5, fontWeight: 500 }}>
                  High-protein plant-based meals. No excuses — every meal is prepped, portioned and delivered on time.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowNoExcusesMenu(false)}
                  style={{ padding: "12px 24px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
                >← Back</button>
                <button
                  onClick={() => { setShowNoExcusesMenu(false); handlePlanSelect(MEAL_PLANS.find(p => p.id === "no-excuses"), "meal"); }}
                  style={{ padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #4338ca, #6366f1)", border: "none", color: "#ffffff", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.35)" }}
                >Select This Plan ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ON TRACK MEAL MENU MODAL */}
      {showOnTrackMenu && (
        <div
          onClick={() => setShowOnTrackMenu(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 3000, padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1a0f00",
              borderRadius: "24px", width: "100%", maxWidth: "860px",
              maxHeight: "90vh", overflowY: "auto",
              border: "1px solid rgba(251,146,60,0.2)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              position: "relative",
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)",
              padding: "28px 32px", borderRadius: "24px 24px 0 0",
              position: "sticky", top: 0, zIndex: 10,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", color: "#fdba74", marginBottom: "6px" }}>
                    On Track Plan
                  </div>
                  <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
                    Weekly Meal Menu 🔥
                  </h2>
                  <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#fed7aa", fontWeight: 500 }}>
                    Performance Fuel · Chicken & Protein · Elite Nutrition
                  </p>
                </div>
                <button
                  onClick={() => setShowOnTrackMenu(false)}
                  style={{
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff", width: "40px", height: "40px", borderRadius: "50%",
                    cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >✕</button>
              </div>
            </div>

            {/* Table */}
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: "12px", marginBottom: "12px", padding: "0 4px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#fdba74", textTransform: "uppercase", letterSpacing: "1px" }}>Day</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1px" }}>🍽️ Lunch (12:30–2:00 PM)</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: "1px" }}>🌙 Dinner (7:00–8:30 PM)</div>
              </div>

              {[
                { day: "Monday", lunch: "Grilled Chicken Breast + Quinoa + Steamed Broccoli + Avocado", dinner: "Sautéed Veg Bowl + Lemon Herb Chicken (Smaller Portion)" },
                { day: "Tuesday", lunch: "Brown Rice (Controlled) + Chicken Stir Fry (Bell Peppers, Zucchini)", dinner: "Tofu/Chicken Protein Salad + Pumpkin Seeds" },
                { day: "Wednesday", lunch: "Chicken & Sweet Potato Performance Bowl + Spinach Salad", dinner: "Garlic Grilled Chicken + Steamed Beans + Clear Soup" },
                { day: "Thursday", lunch: "Quinoa + Mixed Veg + Herb Chicken + Chia Sprinkle", dinner: "Paneer/Tofu + Broccoli + Avocado Bowl (Lower Carb)" },
                { day: "Friday", lunch: "Brown Rice + Chicken Breast + Carrot & Cucumber Salad", dinner: "Grilled Chicken Strips + Stir-Fried Zucchini + Seeds" },
                { day: "Saturday", lunch: "High-Protein Bowl (Chicken + Quinoa + Roasted Veg + Avocado)", dinner: "Light Protein Salad + Lemon Dressing + Clear Soup" },
              ].map((row, idx) => (
                <div key={row.day}
                  style={{
                    display: "grid", gridTemplateColumns: "120px 1fr 1fr",
                    gap: "12px", padding: "16px",
                    background: idx % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(251,146,60,0.05)",
                    borderRadius: "12px", marginBottom: "8px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(251,146,60,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(251,146,60,0.05)"}
                >
                  <div style={{ fontWeight: 800, fontSize: "14px", color: "#fdba74", display: "flex", alignItems: "center" }}>{row.day}</div>
                  <div style={{ fontSize: "13px", color: "#e5e7eb", lineHeight: 1.5, fontWeight: 500 }}>{row.lunch}</div>
                  <div style={{ fontSize: "13px", color: "#fed7aa", lineHeight: 1.5, fontWeight: 500 }}>{row.dinner}</div>
                </div>
              ))}

              <div style={{ marginTop: "20px", padding: "16px 20px", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "22px" }}>⚡</span>
                <p style={{ margin: 0, fontSize: "13px", color: "#fed7aa", lineHeight: 1.5, fontWeight: 500 }}>
                  Elite performance nutrition with lean proteins. Designed for maximum consistency and results. Stay on track, every single day.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowOnTrackMenu(false)}
                  style={{ padding: "12px 24px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
                >← Back</button>
                <button
                  onClick={() => { setShowOnTrackMenu(false); handlePlanSelect(MEAL_PLANS.find(p => p.id === "on-track"), "meal"); }}
                  style={{ padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #c2410c, #f97316)", border: "none", color: "#ffffff", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 6px 20px rgba(251,146,60,0.35)" }}
                >Select This Plan ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionPage;








