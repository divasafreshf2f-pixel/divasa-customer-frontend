function dateParts(value) {
  const d = value ? new Date(value) : new Date();
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  return {
    year: String(safe.getFullYear()).slice(-2),
    month: String(safe.getMonth() + 1),
  };
}

export function inferOrderTypeCode(order) {
  if (order?.isSubscriptionOrder || order?.subscriptionId || order?.subscriptionPlan) return "S";
  const bulkType = typeof order?.bulkCustomerId === "object" ? order.bulkCustomerId?.accountType : "";
  if (bulkType === "event" || order?.accountType === "event") return "E";
  if (order?.bulkCustomerId || order?.businessType || order?.accountType === "business") return "H";
  return "N";
}

export function getOrderDisplayId(order, typeCode) {
  const provided = String(order?.displayOrderId || "").trim().toUpperCase();
  if (provided) return provided;
  const code = typeCode || inferOrderTypeCode(order);
  const { year, month } = dateParts(order?.createdAt || order?.deliveryDate || order?.date);
  const raw = String(order?._id || order?.id || "");
  const parsed = raw ? parseInt(raw.slice(-6), 16) : 0;
  const serial = Number.isFinite(parsed) ? (parsed % 9889) + 111 : 111;
  return `DF${year}${code}${month}${String(serial).padStart(4, "0")}`;
}
