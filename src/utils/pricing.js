const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const formatPrice = (value) => {
  const price = toNumber(value, 0);
  return Number.isInteger(price) ? String(price) : price.toFixed(2).replace(/\.?0+$/, "");
};

export const getReferenceMarketPrice = (value) => {
  const price = toNumber(value, 0);
  if (price <= 0) return null;
  const multiplier = price < 20 ? 1.6 : price < 50 ? 1.45 : 1.35;
  const computed = Math.ceil(price * multiplier);
  return computed > price ? computed : Math.ceil(price + 1);
};

export const getReferenceMarketSubtotal = (unitPrice, quantity = 1) => {
  const ref = getReferenceMarketPrice(unitPrice);
  if (!ref) return null;
  return ref * Math.max(1, toNumber(quantity, 1));
};

const fallbackItemTotal = (order = {}) =>
  Array.isArray(order.items)
    ? order.items.reduce((sum, item) => {
        const subtotal = toNumber(item?.subtotal, NaN);
        if (Number.isFinite(subtotal)) return sum + subtotal;
        return sum + toNumber(item?.price, 0) * toNumber(item?.quantity, 0);
      }, 0)
    : 0;

export const computeOrderTotals = (order = {}) => {
  const itemTotalRaw = toNumber(order.totalAmount, NaN);
  const itemTotal = Number.isFinite(itemTotalRaw) ? itemTotalRaw : fallbackItemTotal(order);
  const handlingFee = toNumber(order.handlingFee, 0);
  const deliveryFee = toNumber(order.deliveryFee, 0);
  const bagFee = toNumber(order.bagFee, 0);
  const couponDiscount = toNumber(order.couponDiscount, 0);
  const juiceDiscount = toNumber(order.juiceDiscount, 0);
  const mealDiscount = toNumber(order.mealDiscount, 0);

  const computedGrand = Math.max(
    itemTotal + handlingFee + deliveryFee + bagFee - couponDiscount - juiceDiscount - mealDiscount,
    0
  );
  const grandTotal = toNumber(order.grandTotal, 0) > 0 ? toNumber(order.grandTotal, 0) : computedGrand;

  return {
    itemTotal,
    handlingFee,
    deliveryFee,
    bagFee,
    couponDiscount,
    juiceDiscount,
    mealDiscount,
    grandTotal,
  };
};

export const getOrderDisplayAddress = (order = {}) => {
  const address = order.customerAddress;
  if (!address) return "";

  if (typeof address === "string") return address;

  const line = [
    address.flatNo,
    address.building,
    address.addressLine || address.mapAddress,
    address.landmark,
    address.area,
    address.city,
    address.pincode,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");

  if (line) return line;

  const lat = toNumber(address.latitude ?? address.lat, NaN);
  const lng = toNumber(address.longitude ?? address.lng, NaN);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  return "";
};

