// TEMPORARY: Cashfree reviewer bypass mode.
// Set VITE_REVIEW_MODE=false to disable quickly after approval.
export const REVIEW_MODE_ENABLED = String(import.meta.env.VITE_REVIEW_MODE || "true").toLowerCase() === "true";
export const REVIEW_PHONE = "9999999999";
export const REVIEW_OTP = "123456";

export const REVIEW_DEFAULT_LOCATION = {
  name: "Bidarahalli, Bangalore",
  lat: 13.0665,
  lng: 77.7316,
};

export const REVIEW_DEFAULT_ADDRESS = {
  _id: "review-default-address",
  addressType: "Home",
  fullName: "Cashfree Reviewer",
  receiverPhone: REVIEW_PHONE,
  phone: REVIEW_PHONE,
  flatNo: "Divasa Review Address",
  landmark: "Bidarahalli, Bangalore",
  mapAddress: "Bidarahalli, Bangalore",
  addressLine: "Bidarahalli, Bangalore",
  city: "Bangalore",
  pincode: "560049",
  lat: REVIEW_DEFAULT_LOCATION.lat,
  lng: REVIEW_DEFAULT_LOCATION.lng,
  latitude: REVIEW_DEFAULT_LOCATION.lat,
  longitude: REVIEW_DEFAULT_LOCATION.lng,
  isDefault: true,
};

