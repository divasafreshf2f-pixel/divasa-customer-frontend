const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src', 'pages', 'Home.jsx');
let c = fs.readFileSync(homePath, 'utf8');

// ── 1. Remove meal from category images & add HIDDEN_CATEGORIES ─────────────
c = c.replace(
  `    meal: "/category-images/meal.png",\r\n    all: "/category-images/all.png"\r\n  };`,
  `    all: "/category-images/all.png"\r\n  };\r\n\r\n  // Meal category is subscription-only - never show in normal orders\r\n  const HIDDEN_CATEGORIES = ["meal"];`
);

// ── 2. Remove meal from category filter row ──────────────────────────────────
c = c.replace(
  `          { key: "fruit salad", label: "Salads", icon: "\uD83E\uDD57" },\r\n          { key: "meal", label: "Meals", icon: "\uD83C\uDF71" }`,
  `          { key: "fruit salad", label: "Salads", icon: "\uD83E\uDD57" }`
);

// ── 3. Add HIDDEN_CATEGORIES filter to product list ──────────────────────────
c = c.replace(
  `          .filter((product) => product.isActive === true || product.isActive === undefined)\r\n          .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))`,
  `          .filter((product) => product.isActive === true || product.isActive === undefined)\r\n          .filter((product) => !HIDDEN_CATEGORIES.includes(product.category?.toLowerCase()))\r\n          .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))`
);

// ── 4. Remove isWeightProduct variable (no longer needed) ────────────────────
// NOTE: We keep isWeightProduct check removal gentle - replace the usage block
// Replace the isWeightProduct select/text with clickable chip buttons
const oldBlock = `                {isWeightProduct ? (
                  <select
                    className="product-select"
                    value={selectedVariant._id}
                    onChange={(e) => {
                      const variant = availableVariants.find((v) => v._id === e.target.value);
                      setSelectedVariants({ ...selectedVariants, [product._id]: variant });
                    }}
                    style={{
                      width: "100%",
                      marginBottom: 8,
                      padding: "8px 10px",
                      borderRadius: 8,
                      backgroundColor: "#ffffff",
                      color: "#1b1b1b",
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      fontWeight: 500,
                      outline: "none"
                    }}
                  >
                    {availableVariants.map((variant) => (
                      <option key={variant._id} value={variant._id} style={{ color: "#000" }}>{variant.name}</option>
                    ))}
                  </select>
                ) : (
                  <p
                    className="product-variant-name"
                    style={{ margin: "6px 0", fontSize: 14, fontWeight: 500, color: "#222" }}
                  >
                    {selectedVariant.name}
                  </p>
                )}`;

const newBlock = `                {/* Variant chips - show clickable size/weight options */}
                {availableVariants.length > 1 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "6px 0" }}>
                    {availableVariants.map((variant) => {
                      const isActive = selectedVariant._id === variant._id;
                      return (
                        <button
                          key={variant._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVariants({ ...selectedVariants, [product._id]: variant });
                          }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            border: isActive ? "1.5px solid #16a34a" : "1px solid #e0e0e0",
                            background: isActive ? "#f0fdf4" : "#f9fafb",
                            color: isActive ? "#16a34a" : "#555",
                            fontSize: 11,
                            fontWeight: isActive ? 700 : 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
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
                )}`;

if (c.includes('isWeightProduct ?')) {
  // Normalize \r\n in old block for matching
  const oldBlockNorm = oldBlock.replace(/\n/g, '\r\n');
  if (c.includes(oldBlockNorm)) {
    c = c.replace(oldBlockNorm, newBlock);
    console.log('✅ Replaced variant block (CRLF match)');
  } else {
    // Try LF only
    c = c.replace(oldBlock, newBlock);
    console.log('✅ Replaced variant block (LF match)');
  }
} else {
  console.log('ℹ️ isWeightProduct not found, may already be updated');
}

// ── 5. Fix onMouseEnter crash when img is null ───────────────────────────────
c = c.replace(
  `                  e.currentTarget.querySelector("img").style.transform = "scale(1.1)";`,
  `                  const _img = e.currentTarget.querySelector("img"); if (_img) _img.style.transform = "scale(1.1)";`
);
c = c.replace(
  `                  e.currentTarget.querySelector("img").style.transform = "scale(1)";`,
  `                  const _img2 = e.currentTarget.querySelector("img"); if (_img2) _img2.style.transform = "scale(1)";`
);

// ── 6. Add App Store & Play Store buttons before Shop Now button ─────────────
const shopNowBtn = `          <button
            onClick={scrollToProducts}
            style={{
              padding: "14px 36px",
              borderRadius: 40,
              border: "none",
              background: "#1d8ae3",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
              transition: "0.2s ease"
            }}
            onMouseEnter={(e)=> e.currentTarget.style.transform="translateY(-3px)"}
            onMouseLeave={(e)=> e.currentTarget.style.transform="translateY(0)"}
          >
            Shop Now →
          </button>`;

const appStoreButtons = `          {/* App Store Download Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <a
              href="https://apps.apple.com/in/app/divasa-fresh/id6743688031"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#000", color: "#fff", padding: "10px 18px",
                borderRadius: 12, textDecoration: "none", fontWeight: 600,
                fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
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
                fontSize: 13, boxShadow: "0 4px 12px rgba(1,135,95,0.25)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M3.18 23.76c.33.18.7.18 1.04 0l10.2-5.88-2.15-2.15-9.09 8.03zM.09 2.07C.04 2.26 0 2.47 0 2.7v18.6c0 .23.04.44.09.63l.04.04 10.42-10.42v-.24L.13 1.97l-.04.1zM20.45 10.4l-2.9-1.67-2.4 2.4 2.4 2.4 2.91-1.67c.83-.48.83-1.97-.01-2.46zM4.22.24L14.43 6.12l-2.15 2.15L2.18.24C2.52.06 2.89.06 3.22.24l1 0z"/></svg>
              Play Store
            </a>
          </div>

          <button
            onClick={scrollToProducts}
            style={{
              padding: "14px 36px",
              borderRadius: 40,
              border: "none",
              background: "#1d8ae3",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
              transition: "0.2s ease"
            }}
            onMouseEnter={(e)=> e.currentTarget.style.transform="translateY(-3px)"}
            onMouseLeave={(e)=> e.currentTarget.style.transform="translateY(0)"}
          >
            Shop Now →
          </button>`;

// Try CRLF match first, then LF
const shopNowCRLF = shopNowBtn.replace(/\n/g, '\r\n');
if (c.includes(shopNowCRLF)) {
  c = c.replace(shopNowCRLF, appStoreButtons.replace(/\n/g, '\r\n'));
  console.log('✅ Added app store buttons (CRLF)');
} else if (c.includes(shopNowBtn)) {
  c = c.replace(shopNowBtn, appStoreButtons);
  console.log('✅ Added app store buttons (LF)');
} else {
  console.log('⚠️ Could not find Shop Now button to inject store badges');
}

fs.writeFileSync(homePath, c, 'utf8');
console.log('✅ Home.jsx patched successfully');
