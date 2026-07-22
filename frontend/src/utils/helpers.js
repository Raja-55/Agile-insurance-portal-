// src/utils/helpers.js

export const statusClass = (status) => {
  const v = String(status).toLowerCase();
  if (v.includes("approved") || v.includes("active") || v.includes("ready") || v.includes("logged in"))
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (v.includes("reject") || v.includes("inactive") || v.includes("re-upload"))
    return "bg-rose-50 text-rose-700 ring-rose-200";
  if (v.includes("open") || v.includes("high") || v.includes("pending") || v.includes("review"))
    return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
};

export const rowKey = (row) => row.id || row.name || row.user || row.type;

export const fileToDataUrl = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => callback(String(reader.result || ""));
  reader.readAsDataURL(file);
};

export const safeJsonParse = (value, fallback) => {
  try { return JSON.parse(value); } catch { return fallback; }
};

export const pageTitles = {
  dashboard: "Admin Dashboard",
  users: "User Management",
  claims: "Claims Management",
  // requirements: "Requirement Management",
  support: "Support Center",
  policies: "Policy Management",
  documents: "Document Verification",
  notifications: "Notification Center",
  reports: "Reports & Analytics",
  profile: "Admin Profile",
  auditlog: "Audit Log",
  settings: "System Settings",
  "setting-detail": "System Setting",
};

export const navItems = [
  { id: "dashboard", label: "Dashboard", roles: ["Super Admin", "Insurance Manager", "Claims Officer", "Support Executive"] },
  { id: "users", label: "User Management", roles: ["Super Admin", "Insurance Manager"] },
  { id: "claims", label: "Claims Management", roles: ["Super Admin", "Claims Officer"] },
  // { id: "requirements", label: "Requirements", roles: ["Super Admin", "Insurance Manager"] },
  { id: "support", label: "Support Center", roles: ["Super Admin", "Support Executive"] },
  { id: "policies", label: "Policy Management", roles: ["Super Admin", "Insurance Manager"] },
  { id: "documents", label: "Document Verification", roles: ["Super Admin", "Claims Officer"] },
  { id: "reports", label: "Reports & Analytics", roles: ["Super Admin", "Insurance Manager"] },
  { id: "profile", label: "Admin Profile", roles: ["Super Admin", "Insurance Manager", "Claims Officer", "Support Executive"] },
  { id: "auditlog", label: "Audit Log", roles: ["Super Admin", "Insurance Manager", "Claims Officer", "Support Executive"] },
  { id: "settings", label: "System Settings", roles: ["Super Admin"] },
];
