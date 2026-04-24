import React, { useEffect, useState } from "react";
import api from "../services/api";
import MapSelector from "../components/MapSelector";
import { useLocation, useNavigate } from "react-router-dom";
import AccountSidebar from "../components/AccountSidebar";
import Header from "../components/Header";

const MOBILE_STYLE = `
@media (max-width: 768px) {
  .db-wrap { flex-direction: column !important; padding-top: 136px !important; }
  .db-sidebar { width: 100% !important; height: auto !important; position: relative !important; top: auto !important; border-right: none !important; border-bottom: 1px solid #e5e7eb !important; padding: 12px 0 0 0 !important; }
  .db-nav { flex-direction: row !important; overflow-x: auto !important; padding: 0 8px 10px !important; gap: 4px !important; scrollbar-width: none !important; }
  .db-nav::-webkit-scrollbar { display: none; }
  .db-nav > div { padding: 7px 12px !important; font-size: 12px !important; white-space: nowrap !important; border-radius: 20px !important; border-right: none !important; background: #f9fafb !important; flex-shrink: 0 !important; }
  .db-main { padding: 16px !important; }
  .modal-full { width: 95vw !important; max-height: 92vh !important; }
}
`;

export default function SavedAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMapConfirmed, setIsMapConfirmed] = useState(false);
  // Fix: track selectedLocation inside the component correctly
  const [selectedLocation, setSelectedLocation] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("divasa_user")) || null;

  const [newAddress, setNewAddress] = useState({
    flatNo: "", building: "", street: "", area: "", landmark: "", customAddressType: "",
    addressType: "Home", buildingType: "Society",
  });

  const UNIQUE_ADDRESS_TYPES = ["home", "work", "friend"];

  const normalizeAddressType = (value = "") => String(value).trim().toLowerCase();
  const isUniqueAddressType = (value = "") => UNIQUE_ADDRESS_TYPES.includes(normalizeAddressType(value));

  async function fetchAddresses() {
    try {
      const user = JSON.parse(localStorage.getItem("divasa_user"));
      if (!user?.phone) return;
      const res = await api.get(`/addresses/${user.phone}`);
      setAddresses(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.phone) fetchAddresses();
    else setLoading(false);
  }, [user?.phone]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") !== "add") return;

    setEditingId(null);
    setSelectedLocation(null);
    setShowForm(true);
    setIsMapConfirmed(false);
    setNewAddress({
      flatNo: "",
      building: "",
      street: "",
      area: "",
      landmark: "",
      customAddressType: "",
      addressType: "Home",
      buildingType: "Society",
    });
  }, [location.search]);

  const handleSave = async () => {
    if (!newAddress.flatNo) {
      alert("Please fill in the flat / house number");
      return;
    }

    if (!newAddress.building?.trim()) {
      alert("Please fill in the building name / area");
      return;
    }

    if (!selectedLocation && !editingId) {
      alert("Please select a location on the map first");
      return;
    }

    const selectedAddressType = String(newAddress.addressType || "").trim();
    const customAddressType = String(newAddress.customAddressType || "").trim();
    const finalAddressType = selectedAddressType === "Others" ? customAddressType : selectedAddressType;

    if (!finalAddressType) {
      alert("Please enter a label for Others");
      return;
    }

    if (isUniqueAddressType(finalAddressType)) {
      const alreadyExists = addresses.some((addr) => {
        const sameType = normalizeAddressType(addr.addressType) === normalizeAddressType(finalAddressType);
        const isOtherRecord = editingId ? String(addr._id) !== String(editingId) : true;
        return sameType && isOtherRecord;
      });

      if (alreadyExists) {
        alert(`${finalAddressType} address already exists. Please choose another type or edit the existing one.`);
        return;
      }
    }

    try {
      const payload = {
        phone: user.phone,
        fullName: user.name || "Customer",
        receiverPhone: user.phone,
        flatNo: newAddress.flatNo,
        building: newAddress.building || "",
        area: newAddress.area || "",
        landmark: newAddress.landmark || "",
        mapAddress: selectedLocation?.name || selectedLocation?.fullAddress || newAddress.area || "",
        lat: selectedLocation?.lat !== undefined ? selectedLocation.lat : null,
        lng: selectedLocation?.lng !== undefined ? selectedLocation.lng : null,
        addressType: finalAddressType,
        buildingType: newAddress.buildingType,
        isDefault: addresses.length === 0, // auto-default first address
      };

      if (editingId) {
        console.log("SENDING ADDRESS PAYLOAD (UPDATE):", payload);
        await api.put(`/addresses/${editingId}`, payload);
      } else {
        console.log("SENDING ADDRESS PAYLOAD (CREATE):", payload);
        await api.post(`/addresses`, payload);
      }

      setShowForm(false);
      setEditingId(null);
      setSelectedLocation(null);
      setNewAddress({ flatNo: "", building: "", street: "", area: "", landmark: "", customAddressType: "", addressType: "Home", buildingType: "Society" });
      setIsMapConfirmed(false);
      fetchAddresses();

    } catch (err) {
      console.log("SAVE ADDRESS ERROR:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      if (err.response?.status === 401 || String(errorMessage).toLowerCase().includes("token")) {
        window.dispatchEvent(new Event("openLoginModal"));
        alert("Session expired. Please login again to save address.");
        navigate("/");
        return;
      }
      alert("Failed to save address: " + errorMessage);
    }
  };

  const deleteAddress = async (id) => {
    if (window.confirm("Delete this address?")) { await api.delete(`/addresses/${id}`); fetchAddresses(); }
  };

  const getAddressTypeIcon = (type) => {
    const normalized = normalizeAddressType(type);
    if (normalized === "home") return "🏠";
    if (normalized === "work") return "💼";
    if (normalized === "friend") return "👥";
    return "📍";
  };

  if (!user) return <div style={{ padding: 40, textAlign: "center" }}>Please Login</div>;
  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <>
      <style>{MOBILE_STYLE}</style>
      <Header />
      <div className="db-wrap" style={dashboardContainer}>
        <AccountSidebar user={user} activePath="/saved-addresses" />

        {/* MAIN */}
        <div className="db-main" style={mainContentArea}>
          <div style={{ maxWidth: "700px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px", color: "#1f2937" }}>Manage Address</h2>
            <button onClick={() => {
              setEditingId(null);
              setNewAddress({ flatNo: "", building: "", street: "", landmark: "", area: "", customAddressType: "", addressType: "Home", buildingType: "Society" });
              setSelectedLocation(null);
              setShowForm(true);
              setIsMapConfirmed(false);
            }} style={addNewBtnStyle}>
              + Add New Address
            </button>

            {addresses.map((addr) => (
              <div key={addr._id} style={cardStyle}>
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "24px" }}>{getAddressTypeIcon(addr.addressType)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700", fontSize: "16px" }}>{addr.addressType}</span>
                      {addr.isDefault && <span style={badgeStyle}>Default</span>}
                    </div>
                    <p style={addressTextStyle}>{addr.flatNo}{addr.landmark ? `, ${addr.landmark}` : ""}</p>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>{addr.mapAddress || addr.area}</p>
                  </div>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setActiveMenu(activeMenu === addr._id ? null : addr._id)} style={menuDotsStyle}>⋮</button>
                    {activeMenu === addr._id && (
                      <div style={dropdownStyle}>
                        <button style={dropdownItem} onClick={() => {
                          setActiveMenu(null);
                          setEditingId(addr._id);
                          const existingType = String(addr.addressType || "").trim();
                          const normalizedType = normalizeAddressType(existingType);
                          const isPredefinedType = ["home", "work", "friend"].includes(normalizedType);
                          setNewAddress({
                            flatNo: addr.flatNo || "",
                            building: addr.building || "",
                            street: addr.street || "",
                            landmark: addr.landmark || "",
                            area: addr.area || addr.mapAddress || addr.addressLine || "",
                            customAddressType: isPredefinedType ? "" : existingType,
                            addressType: isPredefinedType ? existingType : "Others",
                            buildingType: addr.buildingType || "Society",
                          });
                          setSelectedLocation({
                            lat: addr.lat ?? addr.latitude,
                            lng: addr.lng ?? addr.longitude,
                            name: addr.mapAddress || addr.addressLine || addr.area || "",
                            fullAddress: addr.mapAddress || addr.addressLine || addr.area || "",
                          });
                          setIsMapConfirmed(true);
                          setShowForm(true);
                        }}>Edit</button>
                        <button style={{ ...dropdownItem, color: 'red' }} onClick={() => { setActiveMenu(null); deleteAddress(addr._id); }}>Delete</button>
                        <button style={dropdownItem} onClick={async () => {
                          try {
                            await api.put(`/addresses/${addr._id}/default`, { phone: user.phone });
                            setActiveMenu(null);
                            fetchAddresses();
                          } catch (err) { console.error("Error setting default address:", err); }
                        }}>Set as Default</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {showForm && (
          <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <div className="modal-full" style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeader}>
                <h3 style={{ margin: 0 }}>{isMapConfirmed ? "Add Address Details" : "Select Location"}</h3>
                <button onClick={() => setShowForm(false)} style={closeBtn}>✕</button>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
                {!isMapConfirmed ? (
                  <div style={{ height: "450px", width: "100%", position: "relative" }}>
                    <MapSelector
                      onLocationSelect={(position) => {
                        setSelectedLocation(position);
                        setNewAddress((prev) => ({
                          ...prev,
                          area: position.name || position.fullAddress || `Lat: ${position.lat?.toFixed(4)}, Lng: ${position.lng?.toFixed(4)}`
                        }));
                        setIsMapConfirmed(true);
                      }}
                      onClose={() => setShowForm(false)}
                    />
                  </div>
                ) : (
                  <div style={{ padding: "20px" }}>
                    <div style={locationPreviewCard}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>📍</span>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px" }}>Location Selected</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>{newAddress.area}</div>
                        </div>
                      </div>
                      <button onClick={() => setIsMapConfirmed(false)} style={editMapBtnStyle}>EDIT</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <div>
                        <label style={labelStyle}>Save Address as</label>
                        <div style={chipGroup}>
                          {["Home", "Work", "Friend", "Others"].map((type) => (
                            <button key={type} onClick={() => setNewAddress({ ...newAddress, addressType: type })} style={newAddress.addressType === type ? activeChip : chip}>{type}</button>
                          ))}
                        </div>
                      </div>
                      {newAddress.addressType === "Others" && (
                        <input
                          value={newAddress.customAddressType || ""}
                          placeholder="Type custom label (e.g. Aunty Home)"
                          style={inputStyle}
                          onChange={(e) => setNewAddress({ ...newAddress, customAddressType: e.target.value })}
                        />
                      )}
                      <input
                        value={newAddress.flatNo}
                        placeholder="Flat / House No. / Floor *"
                        style={inputStyle}
                        onChange={(e) => setNewAddress({ ...newAddress, flatNo: e.target.value })}
                      />
                      <input
                        value={newAddress.building || ""}
                        placeholder="Building Name / Area *"
                        style={inputStyle}
                        onChange={(e) => setNewAddress({ ...newAddress, building: e.target.value })}
                      />
                      <input
                        value={newAddress.area || ""}
                        placeholder="Area"
                        style={inputStyle}
                        onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                      />
                      <input
                        value={newAddress.landmark || ""}
                        placeholder="Landmark (Optional)"
                        style={inputStyle}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      />
                      <button onClick={handleSave} style={saveBtn}>Save Address</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
       </div>
    </>
  );
}

const dashboardContainer = { display: "flex", minHeight: "calc(100vh - 78px)", background: "#f9fafb", paddingTop: "78px" };
const sidebarStyle = { width: "280px", background: "#fff", borderRight: "1px solid #e5e7eb", padding: "40px 0", position: "sticky", top: 0, height: "100vh" };
const mainContentArea = { flex: 1, padding: "40px 60px", overflowY: "auto" };
const navStyle = { display: "flex", flexDirection: "column", height: "calc(100% - 50px)" };
const navItem = { padding: "14px 25px", cursor: "pointer", fontSize: "15px", color: "#4b5563", transition: "0.2s", fontWeight: "500" };
const activeNavItem = { ...navItem, background: "#f0fdf4", color: "#16a34a", fontWeight: "700", borderRight: "4px solid #16a34a" };
const addNewBtnStyle = { width: "100%", padding: "16px", borderRadius: "12px", border: "1px dashed #16a34a", background: "#fff", color: "#16a34a", fontWeight: "600", cursor: "pointer", marginBottom: "25px" };
const cardStyle = { position: "relative", background: "#fff", padding: "20px", borderRadius: "16px", marginBottom: "15px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #f3f4f6" };
const badgeStyle = { background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" };
const addressTextStyle = { fontSize: "15px", color: "#1f2937", margin: "6px 0 0 0", fontWeight: "500" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" };
const modalStyle = { width: "100%", maxWidth: "500px", background: "#fff", borderRadius: "24px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh" };
const modalHeader = { padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6" };
const locationPreviewCard = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", background: "#f9fafb", borderRadius: "14px", border: "1px solid #e5e7eb", marginBottom: "20px" };
const editMapBtnStyle = { color: "#ef4444", background: "none", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "13px" };
const menuDotsStyle = { background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "22px", padding: "0 5px" };
const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#6b7280", marginBottom: "10px", display: "block" };
const chipGroup = { display: "flex", gap: "10px" };
const chip = { padding: "8px 18px", borderRadius: "20px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#4b5563" };
const activeChip = { ...chip, borderColor: "#16a34a", background: "#f0fdf4", color: "#16a34a", fontWeight: "600" };
const inputStyle = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db", outline: "none", fontSize: "15px", transition: "border 0.2s", boxSizing: "border-box" };
const saveBtn = { width: "100%", padding: "16px", borderRadius: "12px", border: "none", background: "#16a34a", color: "#fff", fontWeight: "700", cursor: "pointer", marginTop: "10px", fontSize: "16px" };
const closeBtn = { background: "#f3f4f6", border: "none", fontSize: "18px", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" };
const dropdownStyle = { position: "absolute", right: "0", top: "30px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", zIndex: 100, minWidth: "150px", overflow: "hidden" };
const dropdownItem = { padding: "14px 16px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: "14px", borderBottom: "1px solid #f3f4f6", color: "#374151" };
