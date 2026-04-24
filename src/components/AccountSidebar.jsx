import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "My Orders", path: "/my-orders" },
  { label: "Bulk Orders", path: "/my-bulk-orders" },
  { label: "My Subscriptions", path: "/my-subscriptions" },
  { label: "Saved Addresses", path: "/saved-addresses" },
  { label: "My Favourites ❤️", path: "/my-favourites" },
  { label: "Loyalty Cards 🎁", path: "/loyalty-cards" },
  { label: "FAQ's 📧", path: "/faqs" },
  { label: "Account Privacy 👁️", path: "/account-privacy" },
];

export default function AccountSidebar({
  user,
  activePath,
  className = "db-sidebar",
  navClassName = "db-nav",
  phoneClassName = "db-sidebar-phone",
  backClassName = "",
  itemClassName = "",
  activeItemClassName = "",
  dangerItemClassName = "",
  useClassOnly = false,
  style,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = activePath || location.pathname;

  const safeUser = user || {};

  const doLogout = () => {
    localStorage.removeItem("divasa_token");
    localStorage.removeItem("customerToken");
    localStorage.removeItem("token");
    localStorage.removeItem("divasa_user");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/");
  };

  const defaultSidebarStyle = {
    width: "280px",
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    padding: "40px 0",
    position: "sticky",
    top: 0,
    height: "100vh",
  };
  const finalSidebarStyle = style || (useClassOnly ? undefined : defaultSidebarStyle);

  const phoneBlockStyle = useClassOnly ? undefined : { padding: "0 25px", marginBottom: "20px" };
  const backStyle = useClassOnly
    ? undefined
    : {
        padding: "14px 25px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "600",
        color: "#16a34a",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid #f1f5f9",
        marginBottom: "10px",
      };
  const navStyle = useClassOnly ? undefined : { display: "flex", flexDirection: "column" };
  const navItem = useClassOnly
    ? undefined
    : { padding: "14px 25px", cursor: "pointer", fontSize: "15px", color: "#4b5563", fontWeight: "500" };
  const activeNavItem = useClassOnly
    ? undefined
    : { ...navItem, background: "#f0fdf4", color: "#16a34a", fontWeight: "700", borderRight: "4px solid #16a34a" };
  const dangerNavItem = useClassOnly ? undefined : { ...navItem, color: "#ef4444" };

  return (
    <div className={className} style={finalSidebarStyle}>
      <div className={phoneClassName} style={phoneBlockStyle}>
        <div style={{ fontWeight: 700, fontSize: "16px", color: "#333" }}>
          Hello, {safeUser?.name || "Customer"} 👋
        </div>
        <div style={{ fontSize: "13px", color: "#666", marginTop: 4 }}>
          +91 {safeUser?.phone || ""}
        </div>
      </div>

      <div className={backClassName} style={backStyle} onClick={() => navigate("/")}>
        ← Back to Home
      </div>

      <nav className={navClassName} style={navStyle}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <div
              key={item.path}
              className={`${itemClassName}${isActive && activeItemClassName ? ` ${activeItemClassName}` : ""}`.trim()}
              style={isActive ? activeNavItem : navItem}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          );
        })}
        <div
          className={`${itemClassName}${dangerItemClassName ? ` ${dangerItemClassName}` : ""}`.trim()}
          style={dangerNavItem}
          onClick={doLogout}
        >
          Logout
        </div>
      </nav>
    </div>
  );
}
