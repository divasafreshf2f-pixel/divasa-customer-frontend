let cashfreeLoaderPromise = null;
let cashfreeInstance = null;

function getCashfreeMode() {
  const envMode = String(import.meta.env.VITE_CASHFREE_ENV || "").toLowerCase();
  if (envMode === "production") return "production";
  if (envMode === "sandbox") return "sandbox";
  return import.meta.env.DEV ? "sandbox" : "production";
}

export function loadCashfreeClient() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  if (cashfreeInstance) {
    return Promise.resolve(cashfreeInstance);
  }

  if (cashfreeLoaderPromise) {
    return cashfreeLoaderPromise;
  }

  cashfreeLoaderPromise = new Promise((resolve, reject) => {
    const initialize = () => {
      if (typeof window.Cashfree !== "function") {
        reject(new Error("Cashfree SDK did not initialize"));
        return;
      }
      cashfreeInstance = window.Cashfree({ mode: getCashfreeMode() });
      resolve(cashfreeInstance);
    };

    const existing = document.querySelector('script[data-cashfree-checkout="true"]');
    if (existing) {
      if (typeof window.Cashfree === "function") {
        initialize();
        return;
      }
      existing.addEventListener("load", initialize, { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Cashfree SDK")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.setAttribute("data-cashfree-checkout", "true");
    script.onload = initialize;
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.body.appendChild(script);
  }).catch((error) => {
    cashfreeLoaderPromise = null;
    cashfreeInstance = null;
    throw error;
  });

  return cashfreeLoaderPromise;
}
