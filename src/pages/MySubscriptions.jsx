import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import AccountSidebar from "../components/AccountSidebar";

/* â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fmtShort = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })
    : "—";

/* actual delivery start = subscription startDate from backend */
const getDeliveryStart = (sub) => {
  return sub.startDate ? new Date(sub.startDate) : new Date(sub.createdAt);
};

/* progress percent purely on deliveries */
const pct = (done, total) =>
  total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

/* motivational streak messages */
const getStreakMsg = (done, total) => {
  if (done === 0) return { emoji: "🚀", text: "First delivery tomorrow — your streak starts!" };
  if (done === 1) return { emoji: "🌱", text: "Day 1 done! One step closer to your goal." };
  if (done < total * 0.25) return { emoji: "💪", text: `${done} deliveries in — keep the momentum!` };
  if (done < total * 0.5)  return { emoji: "🔥", text: `${done} done! You're building a real habit.` };
  if (done < total * 0.75) return { emoji: "⚡", text: `Halfway hero! ${total - done} to go — finish strong.` };
  if (done < total)        return { emoji: "🏁", text: `Almost there! Only ${total - done} deliveries left.` };
  return { emoji: "🏆", text: "Subscription complete — you crushed it!" };
};

/* STATUS config */
const STATUS_CFG = {
  active:    { label: "Active",    bg: "#dcfce7", color: "#15803d", dot: "#16a34a", bar: "#16a34a" },
  paused:    { label: "Paused",    bg: "#fef9c3", color: "#854d0e", dot: "#eab308", bar: "#f59e0b" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", bar: "#ef4444" },
  completed: { label: "Completed", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", bar: "#3b82f6" },
};

const MEAL_LABEL = { lunch: "Lunch only", dinner: "Dinner only", both: "Lunch + Dinner", na: "" };
const SLOT_ICON  = { morning: "🌄", afternoon: "☀️", evening: "🌆", lunch: "🍽️", dinner: "🌙" };

/* â”€â”€â”€ CSS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green:   #16a34a;
    --green-l: #dcfce7;
    --green-m: #bbf7d0;
    --green-d: #15803d;
    --amber:   #d97706;
    --amber-l: #fef9c3;
    --blue:    #2563eb;
    --blue-l:  #dbeafe;
    --red:     #ef4444;
    --red-l:   #fee2e2;
    --border:  #e5e7eb;
    --bg:      #f9fafb;
    --white:   #ffffff;
    --text:    #111827;
    --muted:   #6b7280;
    --font:    'DM Sans', system-ui, sans-serif;
  }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes barFill { from{width:0} to{width:var(--bar-w)} }
  @keyframes popIn   { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }

  /* â”€â”€ LAYOUT â”€â”€ */
  .ms-shell { display:flex; min-height:100vh; background:var(--bg); font-family:var(--font); color:var(--text); padding-top:78px; }

  /* â”€â”€ SIDEBAR â”€â”€ */
  .ms-sidebar {
    width:280px; background:var(--white); border-right:1px solid var(--border);
    padding:36px 0; position:sticky; top:78px;
    height:calc(100vh - 78px); flex-shrink:0; overflow-y:auto;
  }
  .ms-sb-phone  { padding:0 24px 20px; border-bottom:1px solid var(--border); margin-bottom:12px; }
  .ms-sb-num    { font-size:16px; font-weight:700; color:#111; }
  .ms-sb-name   { font-size:12px; color:var(--muted); margin-top:2px; font-weight:500; }
  .ms-sb-back   {
    padding:13px 24px; cursor:pointer; font-size:14px; font-weight:600;
    color:var(--green); display:flex; align-items:center; gap:7px;
    border-bottom:1px solid #f1f5f9; margin-bottom:8px; transition:background .15s;
  }
  .ms-sb-back:hover { background:#f0fdf4; }
  .ms-nav-item  {
    padding:13px 24px; cursor:pointer; font-size:14.5px; color:#4b5563;
    font-weight:500; transition:all .15s; display:flex; align-items:center; gap:8px;
  }
  .ms-nav-item:hover { background:#f9fafb; color:var(--text); }
  .ms-nav-item.active { background:#f0fdf4; color:var(--green); font-weight:700; border-right:4px solid var(--green); }
  .ms-nav-item.danger { color:#ef4444; }
  .ms-nav-item.danger:hover { background:#fef2f2; }

  /* â”€â”€ MAIN â”€â”€ */
  .ms-main { flex:1; padding:36px 48px; overflow-y:auto; }
  .ms-page-title { font-size:26px; font-weight:800; color:var(--text); letter-spacing:-.5px; margin-bottom:4px; }
  .ms-page-sub   { font-size:13.5px; color:var(--muted); font-weight:500; margin-bottom:28px; }

  /* â”€â”€ STREAK BANNER (top motivation) â”€â”€ */
  .ms-streak-banner {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
    border-radius:16px; padding:18px 22px; margin-bottom:24px;
    display:flex; align-items:center; gap:16px;
    animation:fadeUp .4s ease both;
    box-shadow:0 4px 20px rgba(6,78,59,.25);
  }
  .ms-streak-emoji { font-size:36px; flex-shrink:0; }
  .ms-streak-text  { color:#fff; }
  .ms-streak-head  { font-size:15px; font-weight:800; margin-bottom:2px; }
  .ms-streak-sub   { font-size:12.5px; opacity:.8; font-weight:500; }
  .ms-streak-right { margin-left:auto; text-align:right; flex-shrink:0; }
  .ms-streak-num   { font-size:28px; font-weight:800; color:#6ee7b7; line-height:1; }
  .ms-streak-lbl   { font-size:10px; color:rgba(255,255,255,.7); font-weight:600; text-transform:uppercase; letter-spacing:.6px; }

  /* â”€â”€ SUMMARY CHIPS â”€â”€ */
  .ms-chips { display:flex; gap:10px; margin-bottom:24px; flex-wrap:wrap; animation:fadeUp .4s ease .06s both; }
  .ms-chip  {
    background:var(--white); border:1px solid var(--border); border-radius:14px;
    padding:14px 18px; min-width:120px; cursor:default;
    transition:transform .2s, box-shadow .2s;
  }
  .ms-chip:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,.07); }
  .ms-chip-val { font-size:26px; font-weight:800; letter-spacing:-1px; line-height:1; margin-bottom:3px; }
  .ms-chip-lbl { font-size:10.5px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.7px; }

  /* â”€â”€ TABS â”€â”€ */
  .ms-tabs {
    display:flex; gap:4px; margin-bottom:22px;
    background:var(--white); border:1px solid var(--border);
    border-radius:12px; padding:4px; width:fit-content;
    animation:fadeUp .4s ease .1s both;
  }
  .ms-tab {
    padding:7px 16px; border-radius:9px; font-size:13px; font-weight:600;
    cursor:pointer; border:none; background:none; color:var(--muted);
    font-family:var(--font); transition:all .15s;
  }
  .ms-tab.active {
    background:var(--white); color:var(--green); font-weight:700;
    box-shadow:0 1px 6px rgba(0,0,0,.08); border:1px solid var(--border);
  }
  .ms-tab-count {
    margin-left:5px; font-size:10px; font-weight:700;
    padding:1px 6px; border-radius:20px; display:inline-block;
  }

  /* â”€â”€ SUBSCRIPTION CARD â”€â”€ */
  .ms-card {
    background:var(--white); border:1px solid var(--border);
    border-radius:18px; margin-bottom:18px; overflow:hidden;
    animation:fadeUp .45s ease both; transition:box-shadow .2s, transform .2s;
  }
  .ms-card:hover { box-shadow:0 8px 28px rgba(0,0,0,.08); transform:translateY(-1px); }
  .ms-card-topbar { height:4px; width:100%; }

  /* card header */
  .ms-card-hd { padding:20px 22px 0; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
  .ms-card-hd-left { display:flex; align-items:flex-start; gap:14px; }
  .ms-plan-icon  { width:50px; height:50px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; border:1px solid; }
  .ms-plan-name  { font-size:17px; font-weight:800; color:var(--text); margin-bottom:5px; }
  .ms-tags       { display:flex; flex-wrap:wrap; gap:6px; }
  .ms-tag        { display:inline-flex; align-items:center; gap:3px; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:700; border:1px solid; }
  .ms-status-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:700; flex-shrink:0; }
  .ms-status-dot   { width:7px; height:7px; border-radius:50%; }

  /* delivery countdown ring area */
  .ms-delivery-box {
    margin:16px 22px 0; padding:14px 18px;
    background:#f8fafc; border-radius:14px; border:1px solid #f0f2f5;
    display:flex; align-items:center; gap:20px;
  }
  .ms-ring-wrap { position:relative; width:68px; height:68px; flex-shrink:0; }
  .ms-ring-svg  { transform:rotate(-90deg); }
  .ms-ring-bg   { fill:none; stroke:#e2e8f0; stroke-width:7; }
  .ms-ring-fill { fill:none; stroke-width:7; stroke-linecap:round; transition:stroke-dashoffset .8s ease; }
  .ms-ring-label {
    position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
  }
  .ms-ring-num  { font-size:17px; font-weight:800; line-height:1; }
  .ms-ring-pct  { font-size:9px; font-weight:700; color:var(--muted); }
  .ms-delivery-info { flex:1; }
  .ms-del-big   { font-size:22px; font-weight:800; color:var(--text); line-height:1; margin-bottom:3px; }
  .ms-del-sub   { font-size:12px; color:var(--muted); font-weight:500; margin-bottom:10px; }
  .ms-del-bar   { width:100%; height:7px; background:#e2e8f0; border-radius:99px; overflow:hidden; }
  .ms-del-fill  { height:100%; border-radius:99px; animation:barFill .8s cubic-bezier(.4,0,.2,1) .2s both; }

  /* motivation message per card */
  .ms-card-motivation {
    margin:10px 22px 0; padding:9px 14px;
    border-radius:10px; font-size:12.5px; font-weight:600;
    display:flex; align-items:center; gap:8px;
  }

  /* info row */
  .ms-info-row {
    display:grid; grid-template-columns:repeat(3,1fr);
    border-top:1px solid #f4f6f4; border-bottom:1px solid #f4f6f4;
    margin:14px 0 0;
  }
  .ms-info-cell { padding:13px 22px; border-right:1px solid #f4f6f4; }
  .ms-info-cell:last-child { border-right:none; }
  .ms-info-lbl  { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.7px; color:var(--muted); margin-bottom:4px; }
  .ms-info-val  { font-size:13px; font-weight:700; color:var(--text); }
  .ms-info-sub  { font-size:11px; color:var(--muted); font-weight:500; margin-top:1px; }

  /* address row */
  .ms-addr { margin:0 22px; padding:11px 14px; background:#f9fafb; border-radius:10px; border:1px solid #f0f2f5; display:flex; align-items:flex-start; gap:10px; }
  .ms-addr-name { font-size:13px; font-weight:700; margin-bottom:2px; }
  .ms-addr-text { font-size:12px; color:#374151; font-weight:500; line-height:1.5; }

  /* paused notice */
  .ms-paused-notice {
    margin:12px 22px 0; padding:10px 14px; background:#fffbeb;
    border:1px solid #fde68a; border-radius:10px;
    font-size:12.5px; font-weight:600; color:#92400e;
    display:flex; align-items:center; gap:8px; animation:slideIn .2s ease;
  }

  /* actions */
  .ms-actions { padding:16px 22px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .ms-actions-l { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  .ms-actions-r { font-size:12px; color:var(--muted); font-weight:600; display:flex; align-items:center; gap:5px; }

  .btn-pause  { padding:9px 20px; border-radius:10px; border:1.5px solid #fde68a; background:#fef9c3; color:#92400e; font-size:13px; font-weight:700; cursor:pointer; font-family:var(--font); display:inline-flex; align-items:center; gap:6px; transition:all .15s; }
  .btn-pause:hover { background:#fde68a; }
  .btn-pause:disabled { opacity:.5; cursor:not-allowed; }
  .btn-resume { padding:9px 20px; border-radius:10px; border:1.5px solid var(--green-m); background:var(--green-l); color:var(--green-d); font-size:13px; font-weight:700; cursor:pointer; font-family:var(--font); display:inline-flex; align-items:center; gap:6px; transition:all .15s; }
  .btn-resume:hover { background:var(--green-m); }
  .btn-resume:disabled { opacity:.5; cursor:not-allowed; }
  .btn-renew  { padding:9px 22px; border-radius:10px; border:none; background:var(--green); color:#fff; font-size:13px; font-weight:700; cursor:pointer; font-family:var(--font); display:inline-flex; align-items:center; gap:6px; transition:opacity .15s; }
  .btn-renew:hover { opacity:.88; }

  /* â”€â”€ SKELETON â”€â”€ */
  .ms-skeleton { background:var(--white); border:1px solid var(--border); border-radius:18px; margin-bottom:18px; overflow:hidden; }
  .ms-sk-inner { padding:22px; }
  .ms-sk-line  { border-radius:6px; margin-bottom:10px; background:linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%); background-size:400px 100%; animation:shimmer 1.4s ease infinite; }

  /* â”€â”€ EMPTY â”€â”€ */
  .ms-empty { text-align:center; padding:72px 20px; animation:fadeUp .5s ease both; }
  .ms-empty-icon { font-size:60px; margin-bottom:14px; }
  .ms-empty-title { font-size:22px; font-weight:800; margin-bottom:8px; }
  .ms-empty-sub { font-size:14px; color:var(--muted); margin-bottom:28px; line-height:1.7; max-width:360px; margin-left:auto; margin-right:auto; }

  /* â”€â”€ CONFIRM MODAL â”€â”€ */
  .ms-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:3000; padding:20px; animation:fadeUp .2s ease; }
  .ms-modal   { background:var(--white); border-radius:20px; padding:30px; width:100%; max-width:400px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,.18); animation:popIn .25s ease; }
  .ms-modal-icon  { font-size:40px; margin-bottom:14px; }
  .ms-modal-title { font-size:20px; font-weight:800; margin-bottom:8px; }
  .ms-modal-sub   { font-size:14px; color:var(--muted); margin-bottom:24px; line-height:1.55; }
  .ms-modal-btns  { display:flex; gap:10px; justify-content:center; }
  .btn-mc { padding:11px 24px; border-radius:10px; border:1.5px solid var(--border); background:#f9fafb; color:#4b5563; font-weight:600; cursor:pointer; font-family:var(--font); font-size:14px; }
  .btn-mp { padding:11px 24px; border-radius:10px; border:none; background:#f59e0b; color:#fff; font-weight:700; cursor:pointer; font-family:var(--font); font-size:14px; }
  .btn-mr { padding:11px 24px; border-radius:10px; border:none; background:var(--green); color:#fff; font-weight:700; cursor:pointer; font-family:var(--font); font-size:14px; }

  /* â”€â”€ TOAST â”€â”€ */
  .ms-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); padding:12px 24px; border-radius:14px; font-size:14px; font-weight:700; color:#fff; z-index:9999; box-shadow:0 8px 28px rgba(0,0,0,.2); animation:slideIn .25s ease; font-family:var(--font); display:flex; align-items:center; gap:8px; white-space:nowrap; }

  /* â”€â”€ SPINNER â”€â”€ */
  .ms-spin { width:14px; height:14px; border:2px solid rgba(0,0,0,.15); border-top-color:currentColor; border-radius:50%; animation:spin .6s linear infinite; }

  /* â”€â”€ RESPONSIVE â”€â”€ */
  @media (max-width:768px) {
    .ms-shell { flex-direction:column; padding-top:136px; }
    .ms-sidebar { width:100%; height:auto; position:relative; top:auto; border-right:none; border-bottom:1px solid var(--border); padding:12px 0 0; }
    .ms-sb-phone { padding:0 16px 10px; }
    .ms-nav-list { flex-direction:row !important; overflow-x:auto; padding:0 8px 10px; gap:4px; scrollbar-width:none; }
    .ms-nav-list::-webkit-scrollbar { display:none; }
    .ms-nav-item { padding:7px 14px !important; font-size:12px !important; border-radius:20px !important; border-right:none !important; background:#f9fafb; flex-shrink:0; white-space:nowrap; }
    .ms-nav-item.active { border-right:none !important; }
    .ms-main { padding:18px 16px; }
    .ms-chips { gap:8px; }
    .ms-chip  { min-width:100px; padding:12px 14px; }
    .ms-card-hd { flex-direction:column; gap:10px; }
    .ms-info-row { grid-template-columns:1fr 1fr; }
    .ms-info-cell:last-child { grid-column:1/-1; border-right:none; border-top:1px solid #f4f6f4; }
    .ms-delivery-box { flex-direction:column; align-items:flex-start; gap:12px; }
    .ms-ring-wrap { width:56px; height:56px; }
    .ms-ring-num  { font-size:14px; }
    .ms-streak-banner { padding:14px 16px; gap:12px; }
    .ms-streak-emoji { font-size:28px; }
  }
`;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function MySubscriptions() {
  const navigate = useNavigate();
  const [user]          = useState(() => JSON.parse(localStorage.getItem("divasa_user")));
  const [subscriptions, setSubs] = useState([]);
  const [loading, setLoading]    = useState(true);
  const [tab, setTab]            = useState("all");
  const [confirm, setConfirm]    = useState(null);   // { type, sub }
  const [actionId, setActionId]  = useState(null);
  const [toast, setToast]        = useState(null);

  const showToast = (msg, color = "#16a34a") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const res = await api.get("/subscriptions/my");
      setSubs(res.data || []);
    } catch { console.error("Failed to load subscriptions"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* â”€â”€ actions â”€â”€ */
  const doPause = async (sub) => {
    setActionId(sub._id);
    try {
      await api.put(`/subscriptions/pause/${sub._id}`);
      showToast("⏸ Subscription paused from tomorrow");
      load();
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to pause", "#ef4444");
    }
    finally { setActionId(null); setConfirm(null); }
  };

  const doResume = async (sub) => {
    setActionId(sub._id);
    try {
      await api.put(`/subscriptions/resume/${sub._id}`);
      showToast("▶ Subscription resumed!");
      load();
    } catch { showToast("Failed to resume", "#ef4444"); }
    finally { setActionId(null); setConfirm(null); }
  };

  /* â”€â”€ derived â”€â”€ */
  const TABS = [
    { key: "all",       label: "All" },
    { key: "active",    label: "Active" },
    { key: "paused",    label: "Paused" },
    { key: "completed", label: "Completed" },
  ];

  const filtered     = tab === "all" ? subscriptions : subscriptions.filter(s => s.status === tab);
  const activeCnt    = subscriptions.filter(s => s.status === "active").length;
  const totalDone    = subscriptions.reduce((a, s) => a + (s.deliveriesCompleted || 0), 0);
  const totalSpent   = subscriptions.reduce((a, s) => a + (s.totalAmount || 0), 0);
  const activeSubs   = subscriptions.filter(s => s.status === "active");
  /* overall motivation banner uses the most-progressed active sub */
  const heroSub      = activeSubs.sort((a,b) => (b.deliveriesCompleted||0)-(a.deliveriesCompleted||0))[0];
  const heroMsg      = heroSub ? getStreakMsg(heroSub.deliveriesCompleted||0, heroSub.totalDeliveries||0) : null;

  /* â”€â”€ not logged in â”€â”€ */
  if (!user) {
    return (
      <>
        <style>{STYLES}</style>
        <Header />
        <div style={{ textAlign:"center", padding:"120px 20px", fontFamily:"'DM Sans',sans-serif" }}>
          <div style={{ fontSize:60, marginBottom:16 }}>🔒</div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:10 }}>Please login to continue</h2>
          <p style={{ color:"#6b7280", marginBottom:24 }}>You need to be logged in to view your subscriptions.</p>
          <button className="btn-renew" onClick={() => navigate("/")}>← Back to Home</button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <Header />

      <div className="ms-shell">

        <AccountSidebar
          user={user}
          activePath="/my-subscriptions"
          className="ms-sidebar"
          navClassName="ms-nav-list"
          phoneClassName="ms-sb-phone"
          backClassName="ms-sb-back"
          itemClassName="ms-nav-item"
          activeItemClassName="active"
          dangerItemClassName="danger"
          useClassOnly
        />

        {/* â”€â”€â”€ MAIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="ms-main">

          <div className="ms-page-title">My Subscriptions</div>
          <div className="ms-page-sub">Track deliveries and manage your active plans</div>

          {/* Motivation hero banner â€” only when active subscriptions exist */}
          {!loading && heroMsg && (
            <div className="ms-streak-banner">
              <div className="ms-streak-emoji">{heroMsg.emoji}</div>
              <div className="ms-streak-text">
                <div className="ms-streak-head">{heroMsg.text}</div>
                <div className="ms-streak-sub">
                  {heroSub.planName} · {heroSub.deliveriesCompleted || 0} of {heroSub.totalDeliveries} delivered
                </div>
              </div>
              <div className="ms-streak-right">
                <div className="ms-streak-num">{totalDone}</div>
                <div className="ms-streak-lbl">Total Deliveries<br/>Received</div>
              </div>
            </div>
          )}

          {/* Summary chips */}
          {!loading && subscriptions.length > 0 && (
            <div className="ms-chips">
              {[
                { val: activeCnt,                                       lbl:"Active Plans",     color:"#16a34a" },
                { val: totalDone,                                        lbl:"Deliveries Done",  color:"#2563eb" },
                { val: `₹${totalSpent.toLocaleString("en-IN")}`,        lbl:"Total Invested",   color:"#d97706" },
              ].map((c,i) => (
                <div className="ms-chip" key={i}>
                  <div className="ms-chip-val" style={{ color:c.color }}>{c.val}</div>
                  <div className="ms-chip-lbl">{c.lbl}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          {!loading && subscriptions.length > 0 && (
            <div className="ms-tabs">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`ms-tab${tab === t.key ? " active" : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  {t.key !== "all" && (
                    <span className="ms-tab-count" style={{
                      background: tab === t.key ? "#dcfce7" : "#f3f4f6",
                      color: tab === t.key ? "#15803d" : "#9ca3af",
                    }}>
                      {subscriptions.filter(s => s.status === t.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* â”€â”€ LOADING SKELETONS â”€â”€ */}
          {loading && [1,2].map(k => (
            <div className="ms-skeleton" key={k}>
              <div className="ms-sk-inner">
                <div className="ms-sk-line" style={{ height:20, width:"40%", marginBottom:14 }} />
                <div className="ms-sk-line" style={{ height:11, width:"65%" }} />
                <div className="ms-sk-line" style={{ height:11, width:"50%" }} />
                <div className="ms-sk-line" style={{ height:7, width:"100%", marginTop:18 }} />
              </div>
            </div>
          ))}

          {/* â”€â”€ EMPTY â”€â”€ */}
          {!loading && filtered.length === 0 && (
            <div className="ms-empty">
              {tab !== "all" ? (
                <>
                  <div className="ms-empty-icon">🔍</div>
                  <div className="ms-empty-title">No {tab} subscriptions</div>
                  <div className="ms-empty-sub">Switch tabs to view other plans.</div>
                  <button className="btn-renew" onClick={() => setTab("all")}>View All</button>
                </>
              ) : (
                <>
                  <div className="ms-empty-icon">🌿</div>
                  <div className="ms-empty-title">No subscriptions yet</div>
                  <div className="ms-empty-sub">
                    Subscribe to daily fresh fruits or healthy meals and get them delivered right to your door — starting tomorrow!
                  </div>
                  <button className="btn-renew" onClick={() => navigate("/subscribe")}>
                    🌿 Explore Plans
                  </button>
                </>
              )}
            </div>
          )}

          {/* â”€â”€ SUBSCRIPTION CARDS â”€â”€ */}
          {!loading && filtered.map((sub, idx) => {
            const cfg         = STATUS_CFG[sub.status] || STATUS_CFG.active;
            const done        = sub.deliveriesCompleted || 0;
            const total       = sub.totalDeliveries    || 0;
            const remaining   = total - done;
            const progress    = pct(done, total);
            const isMeal      = sub.planCategory === "meal";
            const isActioning = actionId === sub._id;

            /* delivery start = ordered date + 1 day */
            const deliveryStart = getDeliveryStart(sub);

            /* category accent */
            const accent  = isMeal ? "#7c3aed" : "#16a34a";
            const accentL = isMeal ? "#ede9fe"  : "#dcfce7";
            const accentB = isMeal ? "#ddd6fe"  : "#bbf7d0";

            /* per-card motivation */
            const cardMsg = getStreakMsg(done, total);

            /* SVG ring */
            const R = 28, CIRC = 2 * Math.PI * R;
            const dashOffset = CIRC - (progress / 100) * CIRC;

            return (
              <div
                className="ms-card"
                key={sub._id}
                style={{ animationDelay:`${0.1 + idx * 0.07}s` }}
              >
                {/* top accent bar */}
                <div
                  className="ms-card-topbar"
                  style={{ background: sub.status === "active"
                    ? `linear-gradient(90deg,${accent},${accent}88)`
                    : cfg.bar
                    ? `linear-gradient(90deg,${cfg.bar},${cfg.bar}66)`
                    : "#e5e7eb"
                  }}
                />

                {/* â”€â”€ header â”€â”€ */}
                <div className="ms-card-hd">
                  <div className="ms-card-hd-left">
                    <div
                      className="ms-plan-icon"
                      style={{ background:accentL, borderColor:accentB }}
                    >
                      {isMeal ? "🍱" : "🍎"}
                    </div>
                    <div>
                      <div className="ms-plan-name">{sub.planName}</div>
                      <div className="ms-tags">
                        <span className="ms-tag" style={{ background:accentL, color:accent, borderColor:accentB }}>
                          {isMeal ? "🍱 Meal" : "🍎 Fruit"}
                        </span>
                        {sub.mealType && sub.mealType !== "na" && (
                          <span className="ms-tag" style={{ background:"#f5f3ff", color:"#7c3aed", borderColor:"#ddd6fe" }}>
                            {MEAL_LABEL[sub.mealType]}
                          </span>
                        )}
                        <span className="ms-tag" style={{ background:"#f0fdf4", color:"#15803d", borderColor:"#bbf7d0" }}>
                          {sub.daysPerWeek}d / week
                        </span>
                        {sub.deliverySlot && (
                          <span className="ms-tag" style={{ background:"#f8fafc", color:"#475569", borderColor:"#e2e8f0" }}>
                            {SLOT_ICON[sub.deliverySlot] || "🕐"} {sub.deliverySlot}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* status badge */}
                  <div
                    className="ms-status-badge"
                    style={{ background:cfg.bg, color:cfg.color }}
                  >
                    <span className="ms-status-dot" style={{ background:cfg.dot }} />
                    {cfg.label}
                  </div>
                </div>

                {/* â”€â”€ delivery progress ring + bar â”€â”€ */}
                <div className="ms-delivery-box">
                  {/* SVG ring */}
                  <div className="ms-ring-wrap">
                    <svg className="ms-ring-svg" width="68" height="68" viewBox="0 0 68 68">
                      <circle className="ms-ring-bg" cx="34" cy="34" r={R} />
                      <circle
                        className="ms-ring-fill"
                        cx="34" cy="34" r={R}
                        stroke={sub.status === "completed" ? "#3b82f6" : sub.status === "paused" ? "#f59e0b" : accent}
                        strokeDasharray={CIRC}
                        strokeDashoffset={dashOffset}
                      />
                    </svg>
                    <div className="ms-ring-label">
                      <span className="ms-ring-num" style={{ color: sub.status === "completed" ? "#3b82f6" : accent }}>
                        {progress}%
                      </span>
                      <span className="ms-ring-pct">done</span>
                    </div>
                  </div>

                  {/* text side */}
                  <div className="ms-delivery-info">
                    <div className="ms-del-big">
                      {done} <span style={{ fontSize:15, fontWeight:600, color:"#6b7280" }}>of {total} delivered</span>
                    </div>
                    <div className="ms-del-sub">
                      {sub.status === "completed"
                        ? "All deliveries completed 🎉"
                        : sub.status === "paused"
                        ? "Deliveries on hold"
                        : remaining === 1
                        ? "1 delivery remaining"
                        : `${remaining} deliveries remaining`}
                    </div>
                    <div className="ms-del-bar">
                      <div
                        className="ms-del-fill"
                        style={{
                          "--bar-w": `${progress}%`,
                          width: `${progress}%`,
                          background: sub.status === "completed" ? "#3b82f6" : sub.status === "paused" ? "#f59e0b" : accent,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* â”€â”€ per-card motivation â”€â”€ */}
                {sub.status === "active" && (
                  <div
                    className="ms-card-motivation"
                    style={{ background: accentL, color: accent }}
                  >
                    <span>{cardMsg.emoji}</span>
                    <span>{cardMsg.text}</span>
                  </div>
                )}

                {/* â”€â”€ paused notice â”€â”€ */}
                {sub.status === "paused" && sub.pauseStartDate && (
                  <div className="ms-paused-notice">
                    ⏸ Paused from {fmtShort(sub.pauseStartDate)} — tap Resume to restart
                  </div>
                )}

                {/* â”€â”€ info row â”€â”€ */}
                <div className="ms-info-row">
                  <div className="ms-info-cell">
                    <div className="ms-info-lbl">Delivery Starts</div>
                    <div className="ms-info-val">{fmtShort(deliveryStart)}</div>
                    <div className="ms-info-sub">{sub.durationType}</div>
                  </div>
                  <div className="ms-info-cell">
                    <div className="ms-info-lbl">Subscribed On</div>
                    <div className="ms-info-val">{fmtShort(sub.createdAt || sub.startDate)}</div>
                  </div>
                  <div className="ms-info-cell">
                    <div className="ms-info-lbl">Amount</div>
                    <div className="ms-info-val">₹{(sub.totalAmount || 0).toLocaleString("en-IN")}</div>
                    <div
                      className="ms-info-sub"
                      style={{ color: sub.paymentStatus === "paid" ? "#16a34a" : "#d97706", fontWeight:700 }}
                    >
                      {sub.paymentStatus === "paid"
                        ? `✓ Paid${sub.paymentCollectedVia ? ` (${sub.paymentCollectedVia})` : ""}`
                        : `⏳ One-time COD${sub.paymentDueDate ? ` · Due ${fmtShort(sub.paymentDueDate)}` : ""}`} · {sub.paymentType?.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* â”€â”€ delivery address â”€â”€ */}
                {sub.deliveryDetails?.addressLine && (
                  <div className="ms-addr" style={{ marginTop:14 }}>
                    <span style={{ fontSize:16, flexShrink:0 }}>📍</span>
                    <div style={{ flex:1 }}>
                      <div className="ms-addr-name">{sub.deliveryDetails.name}</div>
                      <div className="ms-addr-text">
                        {[
                          sub.deliveryDetails.addressLine,
                          sub.deliveryDetails.landmark,
                          sub.deliveryDetails.city,
                          sub.deliveryDetails.pincode,
                        ].filter(Boolean).join(", ")}
                      </div>
                    </div>
                    {sub.deliveryDetails.phone && (
                      <div style={{ fontSize:12, color:"#6b7280", fontWeight:600, flexShrink:0 }}>
                        📞 {sub.deliveryDetails.phone}
                      </div>
                    )}
                  </div>
                )}

                {/* â”€â”€ action row â”€â”€ */}
                <div className="ms-actions">
                  <div className="ms-actions-l">
                    {sub.status === "active" && (
                      <button
                        className="btn-pause"
                        disabled={isActioning}
                        onClick={() => setConfirm({ type:"pause", sub })}
                      >
                        {isActioning ? <span className="ms-spin" /> : "⏸"} Pause
                      </button>
                    )}
                    {sub.status === "paused" && (
                      <button
                        className="btn-resume"
                        disabled={isActioning}
                        onClick={() => setConfirm({ type:"resume", sub })}
                      >
                        {isActioning ? <span className="ms-spin" /> : "▶"} Resume
                      </button>
                    )}
                    {(sub.status === "completed" || sub.status === "cancelled") && (
                      <button className="btn-renew" onClick={() => navigate("/subscribe")}>
                        🔄 Renew Plan
                      </button>
                    )}
                  </div>
                  <div className="ms-actions-r">
                    {sub.nextDeliveryDate && sub.status === "active" && (
                      <>📅 Next delivery: {fmtShort(sub.nextDeliveryDate)}</>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* bottom CTA */}
          {!loading && subscriptions.length > 0 && (
            <div style={{ textAlign:"center", padding:"20px 0 40px" }}>
              <button
                className="btn-renew"
                style={{ padding:"12px 30px", fontSize:14 }}
                onClick={() => navigate("/subscribe")}
              >
                🌿 Explore More Plans
              </button>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ CONFIRM MODAL â”€â”€ */}
      {confirm && (
        <div
          className="ms-overlay"
          onClick={e => e.target === e.currentTarget && setConfirm(null)}
        >
          <div className="ms-modal">
            <div className="ms-modal-icon">
              {confirm.type === "pause" ? "⏸" : "▶"}
            </div>
            <div className="ms-modal-title">
              {confirm.type === "pause" ? "Pause Subscription?" : "Resume Subscription?"}
            </div>
            <div className="ms-modal-sub">
              {confirm.type === "pause"
                ? `"${confirm.sub.planName}" will be paused starting tomorrow. Please pause at least 2 hours before tomorrow's delivery window.`
                : `"${confirm.sub.planName}" will resume immediately and deliveries will restart.`}
            </div>
            <div className="ms-modal-btns">
              <button className="btn-mc" onClick={() => setConfirm(null)}>Keep It</button>
              {confirm.type === "pause"
                ? <button className="btn-mp" onClick={() => doPause(confirm.sub)}>Yes, Pause</button>
                : <button className="btn-mr" onClick={() => doResume(confirm.sub)}>Yes, Resume</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ TOAST â”€â”€ */}
      {toast && (
        <div className="ms-toast" style={{ background:toast.color }}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
