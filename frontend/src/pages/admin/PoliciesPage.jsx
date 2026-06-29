// src/components/pages/PoliciesPage.jsx
import { useMemo, useRef, useState } from "react";
import {
  Plus, Search, Eye, Edit2, Copy, Settings2, ListChecks, ShieldAlert,
  BarChart3, Trash2, MoreVertical, X, UploadCloud, CheckCircle2,
  RotateCcw, AlertTriangle,
} from "lucide-react";
 
/* ---------------------------------------------------------------------- */
/*  Mock seed data — replace with real API / props if you wire this up   */
/* ---------------------------------------------------------------------- */
 
const FEATURE_LIBRARY = [
  "Cashless Hospitalization", "Pre & Post Hospitalization", "Day Care Procedures",
  "Ambulance Cover", "No Claim Bonus", "Free Health Checkup", "Maternity Cover",
  "Critical Illness Cover", "Restoration Benefit", "Room Rent Waiver",
  "OPD Cover", "AYUSH Treatment", "Organ Donor Cover", "Domiciliary Treatment",
  "Air Ambulance", "Worldwide Cover", "Personal Accident Cover",
  "Engine Protection", "Zero Depreciation", "Roadside Assistance",
];
 
const makeSeedPolicies = () => {
  const base = [
    { policyNo: "POL-HLT-001", name: "Family Health Gold", category: "Health", type: "Individual", coverage: 500000, premium: 12000, status: "Active", createdDate: "2026-06-01" },
    { policyNo: "POL-MOT-002", name: "Vehicle Premium Policy", category: "Motor", type: "Individual", coverage: 300000, premium: 8500, status: "Active", createdDate: "2026-06-03" },
    { policyNo: "POL-LFE-003", name: "Life Secure Plus", category: "Life", type: "Individual", coverage: 1000000, premium: 15000, status: "Draft", createdDate: "2026-06-05" },
    { policyNo: "POL-HLT-004", name: "Senior Health Care", category: "Health", type: "Individual", coverage: 750000, premium: 18000, status: "Inactive", createdDate: "2026-06-07" },
    { policyNo: "POL-MOT-005", name: "Commercial Vehicle Policy", category: "Motor", type: "Commercial", coverage: 1500000, premium: 22000, status: "Active", createdDate: "2026-06-08" },
  ];
  const extra = Array.from({ length: 40 }, (_, i) => {
    const n = i + 6;
    const cat = ["Health", "Motor", "Life"][n % 3];
    return {
      policyNo: `POL-${cat.slice(0, 3).toUpperCase()}-${String(n).padStart(3, "0")}`,
      name: `${cat} Plan ${n}`,
      category: cat,
      type: n % 2 === 0 ? "Individual" : "Commercial",
      coverage: 200000 + n * 25000,
      premium: 6000 + n * 350,
      status: ["Active", "Draft", "Inactive"][n % 3],
      createdDate: "2026-06-09",
    };
  });
  return [...base, ...extra].map((p, idx) => ({
    id: `pol-${idx}`,
    policyCode: p.policyNo,
    description: "A comprehensive insurance policy for individuals and families.",
    minAge: 18,
    maxAge: 65,
    currency: "INR",
    image: "",
    features: FEATURE_LIBRARY.slice(0, 6 + (idx % 5)),
    customFeatures: [],
    premiumConfig: { base: p.premium, tax: Math.round(p.premium * 0.18), discount: 0 },
    regulations: "Subject to IRDAI guidelines. Pre-existing diseases covered after waiting period.",
    sales: { totalSales: 800 + idx * 7, revenue: (800 + idx * 7) * p.premium, monthly: [40, 55, 60, 48, 70, 65].map((v) => v + (idx % 10)) },
    ...p,
  }));
};
 
const STATUS_STYLES = {
  Active: "bg-emerald-100 text-emerald-700",
  Draft: "bg-amber-100 text-amber-700",
  Inactive: "bg-rose-100 text-rose-700",
};
const CATEGORY_STYLES = {
  Health: "bg-emerald-50 text-emerald-700",
  Motor: "bg-blue-50 text-blue-700",
  Life: "bg-violet-50 text-violet-700",
};
 
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => {
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
};
const fmtDateTime = () =>
  new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
 
const PAGE_SIZE = 5;
 
/* ---------------------------------------------------------------------- */
/*  Toast                                                                  */
/* ---------------------------------------------------------------------- */
 
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (message, tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  };
  const node = (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-lg ring-1 ${
            t.tone === "error" ? "bg-rose-600 text-white ring-rose-700" : "bg-slate-900 text-white ring-slate-800"
          }`}
        >
          <CheckCircle2 size={16} />
          {t.message}
        </div>
      ))}
    </div>
  );
  return { push, node };
}
 
/* ---------------------------------------------------------------------- */
/*  Generic modal shell                                                   */
/* ---------------------------------------------------------------------- */
 
function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className={`flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
 
const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-bold text-slate-600">{label}</span>
    {children}
  </label>
);
const inputCls = "h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-500";
 
/* ---------------------------------------------------------------------- */
/*  Main component                                                        */
/* ---------------------------------------------------------------------- */
 
const PolicyManagement = () => {
  const [policies, setPolicies] = useState(makeSeedPolicies);
 
  // ── Trash state ─────────────────────────────────────────────────────────
  const [trash, setTrash]           = useState([]);   // [{ policy, deletedAt }]
  const [showTrash, setShowTrash]   = useState(false);
 
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-12-31");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(null);
  const { push, node: toastNode } = useToasts();
  const formRef = useRef(null);
 
  const categories = useMemo(() => ["All Categories", ...new Set(policies.map((p) => p.category))], [policies]);
  const types = useMemo(() => ["All Types", ...new Set(policies.map((p) => p.type))], [policies]);
 
  const filtered = useMemo(() => {
    return policies.filter((p) => {
      if (search && !`${p.policyCode} ${p.name}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== "All Types" && p.type !== filterType) return false;
      if (filterCategory !== "All Categories" && p.category !== filterCategory) return false;
      if (filterStatus !== "All Status" && p.status !== filterStatus) return false;
      if (dateFrom && p.createdDate < dateFrom) return false;
      if (dateTo && p.createdDate > dateTo) return false;
      return true;
    });
  }, [policies, search, filterType, filterCategory, filterStatus, dateFrom, dateTo]);
 
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
 
  const summary = useMemo(() => {
    const totalSold = policies.reduce((s, p) => s + (p.sales?.totalSales || 0), 0);
    const active = policies.filter((p) => p.status === "Active").length;
    const claimsRaised = 234;
    const claimsApproved = 190;
    return { totalSold, active, claimsRaised, claimsApproved };
  }, [policies]);
 
  const closeMenu = () => setOpenMenuId(null);
 
  const openAction = (kind, policy) => {
    setModal({ kind, policy });
    closeMenu();
    if (kind === "edit" || kind === "clone") {
      setDraft(kind === "clone"
        ? { ...policy, policyCode: `${policy.policyCode}-COPY-${Math.floor(Math.random() * 900 + 100)}`, name: `${policy.name} (Copy)`, status: "Draft" }
        : { ...policy });
    } else if (kind === "premium") {
      setDraft({ ...policy.premiumConfig });
    } else if (kind === "features") {
      setDraft({ features: [...policy.features], custom: "" });
    } else if (kind === "regulations") {
      setDraft({ regulations: policy.regulations, minAge: policy.minAge, maxAge: policy.maxAge });
    } else if (kind === "add") {
      setDraft({
        policyCode: `POL-NEW-${Math.floor(Math.random() * 900 + 100)}`,
        name: "", category: "Health Insurance", type: "Individual",
        minAge: 18, maxAge: 65, currency: "INR", coverage: 500000, premium: 10000,
        status: "Active", description: "", features: [], customFeatures: [],
        premiumConfig: { base: 10000, tax: 1800, discount: 0 },
        regulations: "", sales: { totalSales: 0, revenue: 0, monthly: [0, 0, 0, 0, 0, 0] },
        createdDate: new Date().toISOString().slice(0, 10),
      });
    }
  };
 
  const closeModal = () => { setModal(null); setDraft(null); };
 
  const updateInTable = (policyCode, changes) =>
    setPolicies((rows) => rows.map((r) => (r.policyCode === policyCode ? { ...r, ...changes } : r)));
 
  const saveEdit = () => {
    updateInTable(modal.policy.policyCode, draft);
    push(`${draft.name} updated successfully`);
    closeModal();
  };
 
  const saveAdd = () => {
    if (!draft.name.trim()) { push("Policy name is required", "error"); return; }
    setPolicies((rows) => [{ id: `pol-${Date.now()}`, ...draft }, ...rows]);
    push(`${draft.name} added as Draft`);
    closeModal();
  };
 
  const saveClone = () => {
    setPolicies((rows) => [{ ...draft, id: `pol-${Date.now()}` }, ...rows]);
    push(`Cloned as ${draft.policyCode}`);
    closeModal();
  };
 
  const savePremium = () => {
    updateInTable(modal.policy.policyCode, { premiumConfig: draft, premium: draft.base + draft.tax - draft.discount });
    push("Premium configuration saved");
    closeModal();
  };
 
  const saveFeatures = () => {
    const customFeatures = draft.features.filter((f) => !FEATURE_LIBRARY.includes(f));
    updateInTable(modal.policy.policyCode, { features: draft.features, customFeatures });
    push("Features updated successfully");
    closeModal();
  };
 
  const saveRegulations = () => {
    updateInTable(modal.policy.policyCode, { regulations: draft.regulations, minAge: draft.minAge, maxAge: draft.maxAge });
    push("Regulations & exclusions saved");
    closeModal();
  };
 
  // ── Soft-delete: moves to Trash, does NOT permanently remove ────────────
  const confirmDelete = () => {
    setTrash((t) => [...t, { policy: modal.policy, deletedAt: fmtDateTime() }]);
    setPolicies((rows) => rows.filter((r) => r.policyCode !== modal.policy.policyCode));
    push(`${modal.policy.name} moved to Trash`, "error");
    closeModal();
  };
 
  // ── Restore from Trash back to active policy list ────────────────────────
  const handleRestore = (item) => {
    setPolicies((rows) => [item.policy, ...rows]);
    setTrash((t) => t.filter((x) => x.policy.policyCode !== item.policy.policyCode));
    push(`${item.policy.name} restored`);
  };
 
  // ── Permanent delete — removes from Trash only (already gone from table) ─
  const handlePurge = (item) => {
    setTrash((t) => t.filter((x) => x.policy.policyCode !== item.policy.policyCode));
    push(`${item.policy.name} permanently deleted`, "error");
  };
 
  // ── Empty entire Trash ───────────────────────────────────────────────────
  const handleEmptyTrash = () => {
    const count = trash.length;
    setTrash([]);
    push(`${count} polic${count === 1 ? "y" : "ies"} permanently deleted`, "error");
  };
 
  const toggleFeature = (feat) => {
    setDraft((d) => ({
      ...d,
      features: d.features.includes(feat) ? d.features.filter((f) => f !== feat) : [...d.features, feat],
    }));
  };
 
  const removeFeature = (feat) => {
    setDraft((d) => ({ ...d, features: d.features.filter((f) => f !== feat) }));
  };
 
  const addCustomFeature = () => {
    const value = draft.custom.trim();
    if (!value) return;
    if (draft.features.some((f) => f.toLowerCase() === value.toLowerCase())) {
      push("That feature is already added", "error");
      return;
    }
    setDraft((d) => ({ ...d, features: [...d.features, value], custom: "" }));
  };
 
  const menuActions = (p) => [
    { key: "view", label: "View Details", icon: Eye, onClick: () => openAction("view", p) },
    { key: "edit", label: "Edit Policy", icon: Edit2, onClick: () => openAction("edit", p) },
    { key: "clone", label: "Clone Policy", icon: Copy, onClick: () => openAction("clone", p) },
    { key: "premium", label: "Configure Premium", icon: Settings2, onClick: () => openAction("premium", p) },
    { key: "features", label: "Configure Features", icon: ListChecks, onClick: () => openAction("features", p) },
    { key: "regulations", label: "Configure Regulations", icon: ShieldAlert, onClick: () => openAction("regulations", p) },
    { key: "sales", label: "View Sales", icon: BarChart3, onClick: () => openAction("sales", p) },
    { key: "delete", label: "Delete Policy", icon: Trash2, danger: true, onClick: () => openAction("delete", p) },
  ];
 
  return (
    <div className="space-y-6" onClick={closeMenu}>
      {toastNode}
 
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">Policy Management</h2>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); openAction("add", null); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add New Policy
        </button>
      </div>
 
      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Search Policy">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by Policy No, Name..." className={`${inputCls} w-full pl-9`} />
            </div>
          </Field>
          <Field label="Policy Type">
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className={inputCls}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Policy Category">
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className={inputCls}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className={inputCls}>
              {["All Status", "Active", "Draft", "Inactive"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Created By">
            <select className={inputCls}><option>All Users</option></select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Field label="Date From"><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} /></Field>
          <Field label="Date To"><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} /></Field>
          <button onClick={() => setPage(1)} className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">Search</button>
          <button
            onClick={() => { setSearch(""); setFilterType("All Types"); setFilterCategory("All Categories"); setFilterStatus("All Status"); setPage(1); }}
            className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>
 
      {/* Table */}
      <div className="overflow-visible rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                {["Policy No", "Policy Name", "Category", "Type", "Coverage (₹)", "Premium (₹)", "Status", "Created Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => (
                <tr key={p.id} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50" onClick={() => openAction("view", p)}>
                  <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{p.policyCode}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{p.name}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_STYLES[p.category] || "bg-slate-100 text-slate-700"}`}>{p.category}</span></td>
                  <td className="px-4 py-3 text-slate-600">{p.type}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtINR(p.coverage)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtINR(p.premium)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(p.createdDate)}</td>
                  <td className="relative px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openAction("view", p); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">View</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }}
                        className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    {openMenuId === p.id && (
                      <div onClick={(e) => e.stopPropagation()} className="absolute right-4 top-12 z-20 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        {menuActions(p).map((a) => (
                          <button
                            key={a.key}
                            onClick={a.onClick}
                            className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold hover:bg-slate-50 ${a.danger ? "text-rose-600" : "text-slate-700"}`}
                          >
                            <a.icon size={15} /> {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">No policies match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
 
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`rounded-lg px-3 py-1.5 font-bold ${page === n ? "bg-blue-600 text-white" : "border border-slate-200"}`}>{n}</button>
            ))}
            {totalPages > 3 && <span className="px-1">…</span>}
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
 
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Policies Sold", value: summary.totalSold.toLocaleString("en-IN"), tone: "blue" },
          { label: "Active Policies", value: summary.active.toLocaleString("en-IN"), tone: "emerald" },
          { label: "Claims Raised", value: summary.claimsRaised, tone: "amber" },
          { label: "Claims Approved", value: summary.claimsApproved, tone: "violet" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{c.value}</p>
          </div>
        ))}
      </div>
 
      {/* ── Trash Bin ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-rose-200 bg-white overflow-hidden">
        {/* Toggle header */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowTrash((v) => !v); }}
          className="flex w-full items-center justify-between px-5 py-3.5 hover:bg-rose-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Trash2 size={16} className="text-rose-500" />
            <span className="text-sm font-black text-rose-700">Deleted Policies — Trash</span>
            {trash.length > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-black text-white">
                {trash.length}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-rose-400">{showTrash ? "▲ Hide" : "▼ Show"}</span>
        </button>
 
        {showTrash && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between border-t border-rose-100 bg-rose-50 px-5 py-2.5">
              <span className="text-xs font-semibold text-rose-500">
                {trash.length === 0
                  ? "Trash is empty"
                  : `${trash.length} deleted polic${trash.length === 1 ? "y" : "ies"} — restore or delete forever`}
              </span>
              {trash.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleEmptyTrash(); }}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  <Trash2 size={12} /> Empty Trash
                </button>
              )}
            </div>
 
            {/* Empty state */}
            {trash.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-slate-300">
                <Trash2 size={40} />
                <p className="text-sm font-semibold text-slate-400">No deleted policies</p>
              </div>
            )}
 
            {/* Trash table */}
            {trash.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-rose-100 text-left text-xs font-black uppercase tracking-wide text-slate-400 bg-slate-50">
                        {["Policy No", "Policy Name", "Category", "Type", "Coverage", "Premium", "Status", "Deleted At", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trash.map((item) => (
                        <tr key={item.policy.policyCode} className="border-t border-rose-100 hover:bg-rose-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Trash2 size={13} className="shrink-0 text-rose-300" />
                              <span className="font-bold text-slate-400 line-through">{item.policy.policyCode}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-400 line-through">{item.policy.name}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold opacity-50 ${CATEGORY_STYLES[item.policy.category] || "bg-slate-100 text-slate-700"}`}>
                              {item.policy.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{item.policy.type}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{fmtINR(item.policy.coverage)}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{fmtINR(item.policy.premium)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-500">
                              {item.policy.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{item.deletedAt}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRestore(item); }}
                                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                              >
                                <RotateCcw size={12} /> Restore
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePurge(item); }}
                                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                              >
                                <Trash2 size={12} /> Delete Forever
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Warning footer */}
                <div className="flex items-center gap-2 border-t border-rose-100 bg-amber-50 px-5 py-2.5 text-xs font-semibold text-amber-700">
                  <AlertTriangle size={13} className="shrink-0" />
                  Policies in trash are inactive and not visible to users. Restore to make them available again, or delete forever to remove permanently.
                </div>
              </>
            )}
          </>
        )}
      </div>
 
      {/* ── Modals ─────────────────────────────────────────────────────────── */}
 
      {modal?.kind === "add" && draft && (
        <Modal title="Add New Policy" wide onClose={closeModal} footer={<>
          <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={saveAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Publish Policy</button>
        </>}>
          <PolicyForm draft={draft} setDraft={setDraft} />
        </Modal>
      )}
 
      {modal?.kind === "edit" && draft && (
        <Modal title={`Edit Policy — ${modal.policy.policyCode}`} wide onClose={closeModal} footer={<>
          <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={saveEdit} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Save Changes</button>
        </>}>
          <PolicyForm draft={draft} setDraft={setDraft} />
        </Modal>
      )}
 
      {modal?.kind === "view" && (
        <Modal title={`Policy Details — ${modal.policy.policyCode}`} wide onClose={closeModal}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Policy Name" value={modal.policy.name} />
            <Detail label="Category" value={modal.policy.category} />
            <Detail label="Type" value={modal.policy.type} />
            <Detail label="Status" value={modal.policy.status} />
            <Detail label="Coverage" value={fmtINR(modal.policy.coverage)} />
            <Detail label="Premium" value={fmtINR(modal.policy.premium)} />
            <Detail label="Age Eligibility" value={`${modal.policy.minAge} - ${modal.policy.maxAge} yrs`} />
            <Detail label="Created" value={fmtDate(modal.policy.createdDate)} />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-600">Description</p>
          <p className="mt-1 text-sm text-slate-700">{modal.policy.description}</p>
          <p className="mt-4 text-sm font-bold text-slate-600">Features</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {modal.policy.features.map((f) => {
              const isCustom = !FEATURE_LIBRARY.includes(f);
              return (
                <span key={f} className={`rounded-full px-3 py-1 text-xs font-semibold ${isCustom ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : "bg-slate-100 text-slate-700"}`}>
                  {f}{isCustom && <span className="ml-1 text-[10px] font-bold uppercase text-blue-500">custom</span>}
                </span>
              );
            })}
            {modal.policy.features.length === 0 && <span className="text-xs text-slate-400">No features configured.</span>}
          </div>
        </Modal>
      )}
 
      {modal?.kind === "clone" && draft && (
        <Modal title="Clone Policy" onClose={closeModal} footer={<>
          <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={saveClone} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Create Clone</button>
        </>}>
          <div className="space-y-3">
            <Field label="New Policy Name"><input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field label="New Policy Code"><input className={inputCls} value={draft.policyCode} onChange={(e) => setDraft({ ...draft, policyCode: e.target.value })} /></Field>
            <p className="text-xs text-slate-500">Clone will be added as a new <span className="font-bold">Draft</span> row.</p>
          </div>
        </Modal>
      )}
 
      {modal?.kind === "premium" && draft && (
        <Modal title={`Configure Premium — ${modal.policy.policyCode}`} onClose={closeModal} footer={<>
          <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={savePremium} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Save</button>
        </>}>
          <div className="space-y-3">
            <Field label="Base Premium (₹)"><input type="number" className={inputCls} value={draft.base} onChange={(e) => setDraft({ ...draft, base: Number(e.target.value) })} /></Field>
            <Field label="Tax (₹)"><input type="number" className={inputCls} value={draft.tax} onChange={(e) => setDraft({ ...draft, tax: Number(e.target.value) })} /></Field>
            <Field label="Discount (₹)"><input type="number" className={inputCls} value={draft.discount} onChange={(e) => setDraft({ ...draft, discount: Number(e.target.value) })} /></Field>
            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">
              Final Premium: {fmtINR(draft.base + draft.tax - draft.discount)}
            </div>
          </div>
        </Modal>
      )}
 
      {modal?.kind === "features" && draft && (
        <Modal title={`Configure Features — ${modal.policy.policyCode}`} wide onClose={closeModal} footer={<>
          <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={saveFeatures} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Save</button>
        </>}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Standard Feature Library</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FEATURE_LIBRARY.map((f) => (
              <label key={f} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <input type="checkbox" checked={draft.features.includes(f)} onChange={() => toggleFeature(f)} />
                {f}
              </label>
            ))}
          </div>
          <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">
            Custom Features {`(${draft.features.filter((f) => !FEATURE_LIBRARY.includes(f)).length})`}
          </p>
          <div className="flex flex-wrap gap-2">
            {draft.features.filter((f) => !FEATURE_LIBRARY.includes(f)).length === 0 && (
              <span className="text-xs text-slate-400">No custom features added yet.</span>
            )}
            {draft.features.filter((f) => !FEATURE_LIBRARY.includes(f)).map((f) => (
              <span key={f} className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                {f}
                <button type="button" onClick={() => removeFeature(f)} className="rounded-full p-0.5 hover:bg-blue-100">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={draft.custom}
              onChange={(e) => setDraft({ ...draft, custom: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomFeature(); } }}
              placeholder="Add custom feature"
              className={`${inputCls} flex-1`}
            />
            <button type="button" onClick={addCustomFeature} className="rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800">Add</button>
          </div>
        </Modal>
      )}
 
      {modal?.kind === "regulations" && draft && (
        <Modal title={`Configure Regulations — ${modal.policy.policyCode}`} onClose={closeModal} footer={<>
          <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={saveRegulations} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Save</button>
        </>}>
          <div className="space-y-3">
            <Field label="Regulation Text">
              <textarea rows={5} className="rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" value={draft.regulations} onChange={(e) => setDraft({ ...draft, regulations: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Minimum Age"><input type="number" className={inputCls} value={draft.minAge} onChange={(e) => setDraft({ ...draft, minAge: Number(e.target.value) })} /></Field>
              <Field label="Maximum Age"><input type="number" className={inputCls} value={draft.maxAge} onChange={(e) => setDraft({ ...draft, maxAge: Number(e.target.value) })} /></Field>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              ⚠ Changes here affect eligibility checks across the policy lifecycle.
            </div>
          </div>
        </Modal>
      )}
 
      {modal?.kind === "sales" && (
        <SalesAnalysis policy={modal.policy} policies={policies} onClose={closeModal} />
      )}
 
      {/* ── Delete modal — now moves to Trash, not permanent ─────────────── */}
      {modal?.kind === "delete" && (
        <Modal title="Delete Policy" onClose={closeModal} footer={<>
          <button onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={confirmDelete} className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">
            <Trash2 size={14} /> Move to Trash
          </button>
        </>}>
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <Trash2 size={22} className="text-rose-600" />
            </div>
            <div>
              <p className="font-black text-slate-800">{modal.policy.name}</p>
              <p className="text-xs font-semibold text-slate-400">{modal.policy.policyCode}</p>
            </div>
            <p className="text-sm text-slate-600">
              This policy will be moved to the <span className="font-black text-rose-600">Trash</span> and hidden from the active list.
              You can <span className="font-bold text-emerald-600">restore</span> it any time, or delete it forever from the Trash bin below.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
 
const Detail = ({ label, value, big }) => (
  <div className={big ? "rounded-xl border border-slate-200 p-4" : ""}>
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className={big ? "mt-1 text-2xl font-black text-slate-950" : "mt-0.5 text-sm font-bold text-slate-800"}>{value}</p>
  </div>
);
 
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
 
function SalesAnalysis({ policy, policies, onClose }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const monthly = policy.sales.monthly;
  const maxMonth = Math.max(...monthly);
  const minMonth = Math.min(...monthly);
  const bestIdx = monthly.indexOf(maxMonth);
  const worstIdx = monthly.indexOf(minMonth);
  const firstVal = monthly[0];
  const lastVal = monthly[monthly.length - 1];
  const growthPct = firstVal === 0 ? 0 : Math.round(((lastVal - firstVal) / firstVal) * 100);
  const avgMonth = Math.round(monthly.reduce((s, v) => s + v, 0) / monthly.length);
  const portfolioMax = Math.max(...policies.map((p) => p.sales.totalSales));
  const portfolioAvg = Math.round(policies.reduce((s, p) => s + p.sales.totalSales, 0) / policies.length);
 
  return (
    <Modal title={`Sales Analysis — ${policy.policyCode}`} wide onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Detail label="Total Sales" value={policy.sales.totalSales.toLocaleString("en-IN")} big />
        <Detail label="Revenue" value={fmtINR(policy.sales.revenue)} big />
        <Detail label="Avg Premium" value={fmtINR(policy.premium)} big />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Jan → Jun Growth</p>
          <p className={`mt-0.5 text-sm font-black ${growthPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{growthPct >= 0 ? "▲" : "▼"} {Math.abs(growthPct)}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Best Month</p>
          <p className="mt-0.5 text-sm font-black text-slate-800">{MONTH_LABELS[bestIdx]} · {maxMonth} units</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Weakest Month</p>
          <p className="mt-0.5 text-sm font-black text-slate-800">{MONTH_LABELS[worstIdx]} · {minMonth} units</p>
        </div>
      </div>
      <p className="mt-6 text-sm font-bold text-slate-600">Monthly Sales (Units)</p>
      <div className="relative mt-3 h-48 rounded-lg border border-slate-100 bg-slate-50/50 px-4 pb-8 pt-6">
        <div className="absolute left-4 right-4 border-t border-dashed border-amber-400" style={{ bottom: `${32 + (avgMonth / maxMonth) * (192 - 56)}px` }}>
          <span className="absolute -top-2.5 right-0 bg-slate-50/50 px-1 text-[10px] font-bold text-amber-600">avg {avgMonth}</span>
        </div>
        <div className="relative flex h-full items-end gap-3">
          {monthly.map((v, i) => {
            const isBest = i === bestIdx;
            const isWorst = i === worstIdx;
            return (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1" onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx((h) => (h === i ? null : h))}>
                <span className={`text-xs font-black ${hoverIdx === i ? "text-blue-700" : "text-slate-500"}`}>{v}</span>
                <div className={`w-full rounded-t-md transition-all ${isBest ? "bg-emerald-500" : isWorst ? "bg-rose-400" : "bg-blue-500"} ${hoverIdx === i ? "opacity-100 ring-2 ring-offset-1 ring-blue-300" : "opacity-90"}`} style={{ height: `${(v / maxMonth) * 100}%`, minHeight: 4 }} />
                <span className="text-xs font-bold text-slate-500">{MONTH_LABELS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Monthly sales</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Best month</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-400" /> Weakest month</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-0 border-t border-dashed border-amber-400" /> 6-month average</span>
      </div>
      <p className="mt-6 text-sm font-bold text-slate-600">Total Sales vs Portfolio</p>
      <div className="mt-3 space-y-3">
        <ComparisonBar label="This Policy" value={policy.sales.totalSales} max={portfolioMax} tone="bg-blue-600" />
        <ComparisonBar label="Portfolio Average" value={portfolioAvg} max={portfolioMax} tone="bg-slate-400" />
        <ComparisonBar label="Portfolio Best" value={portfolioMax} max={portfolioMax} tone="bg-emerald-500" />
      </div>
    </Modal>
  );
}
 
function ComparisonBar({ label, value, max, tone }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{label}</span>
        <span className="text-slate-800">{value.toLocaleString("en-IN")}</span>
      </div>
      <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}
 
function PolicyForm({ draft, setDraft }) {
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Policy Name *"><input className={inputCls} value={draft.name} onChange={set("name")} /></Field>
      <Field label="Policy Code *"><input className={inputCls} value={draft.policyCode} onChange={set("policyCode")} /></Field>
      <Field label="Category *">
        <select className={inputCls} value={draft.category} onChange={set("category")}>
          {["Health", "Motor", "Life"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Type *">
        <select className={inputCls} value={draft.type} onChange={set("type")}>
          {["Individual", "Commercial"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Status *">
        <select className={inputCls} value={draft.status} onChange={set("status")}>
          {["Active", "Draft", "Inactive"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Currency"><input className={inputCls} value={draft.currency} onChange={set("currency")} /></Field>
      <Field label="Minimum Age"><input type="number" className={inputCls} value={draft.minAge} onChange={(e) => setDraft({ ...draft, minAge: Number(e.target.value) })} /></Field>
      <Field label="Maximum Age"><input type="number" className={inputCls} value={draft.maxAge} onChange={(e) => setDraft({ ...draft, maxAge: Number(e.target.value) })} /></Field>
      <Field label="Coverage (₹)"><input type="number" className={inputCls} value={draft.coverage} onChange={(e) => setDraft({ ...draft, coverage: Number(e.target.value) })} /></Field>
      <Field label="Premium (₹)"><input type="number" className={inputCls} value={draft.premium} onChange={(e) => setDraft({ ...draft, premium: Number(e.target.value) })} /></Field>
      <div className="sm:col-span-2">
        <Field label="Short Description">
          <textarea rows={3} className="rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" value={draft.description} onChange={set("description")} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <span className="text-sm font-bold text-slate-600">Policy Image</span>
        <label className="mt-1 flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400">
          <UploadCloud size={22} />
          <span className="text-xs font-bold">Click to upload image (PNG, JPG up to 2MB)</span>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>
    </div>
  );
}
 
export default PolicyManagement;
 