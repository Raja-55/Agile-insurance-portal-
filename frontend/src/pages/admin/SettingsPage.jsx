// src/components/pages/SettingsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings, UserCog, Bell, CreditCard, KeyRound, ClipboardCheck,
  Edit3, AlertTriangle, LineChart, FileText, ShieldCheck, Users, ArrowLeft, Search,
  UserPlus, Loader2, CheckCircle2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { SectionTitle } from "../../components/admin/shared";

import { setSelectedSettingId, mergeSettings, setSaving } from "../../store/slices/settingsSlice";
import { useAdminActions } from "../../hooks/useAdminActions";
import { apiRequest } from "../../utils/api";

// ─── Static config ────────────────────────────────────────────────────────────

// Mirrors Admin.PLATFORM_FEATURES on the backend (Models/admin.model.js) — the
// list of platform areas a SuperAdmin can grant a new admin access to.
const PLATFORM_FEATURES = [
  { id: "users", label: "User Management" },
  { id: "policies", label: "Policy Management" },
  { id: "claims", label: "Claims Management" },
  { id: "documents", label: "Document Vault" },
  { id: "kyc", label: "KYC Requests" },
  { id: "payments", label: "Payments & Purchases" },
  { id: "support", label: "Support Tickets" },
  { id: "audit_logs", label: "Audit Logs" },
  { id: "settings", label: "System Settings" },
];

// Built-in roles shown by default in the role dropdown. SuperAdmin can still
// type a brand-new role name into the same field (see "New Admin Role").
const BUILT_IN_ROLES = ["Insurance Manager", "Claims Officer", "Support Executive"];

const adminSettingCards = [
  { id: "general",       title: "General Setting",        description: "Configure the fundamental information of the site.",                             icon: Settings },
  { id: "configuration", title: "System Configuration",   description: "Control all of the basic modules of the system.",                               icon: UserCog },
  { id: "notifications", title: "Notification Setting",   description: "Control and configure overall notification elements of the system.",             icon: Bell },
  { id: "paymentGateways",       title: "Payment Gateways",       description: "Configure automatic or manual payment gateways to accept payment from users.",   icon: CreditCard },
  { id: "withdrawals",   title: "Withdrawals Methods",    description: "Set up manual withdrawal methods for payout requests.",                         icon: KeyRound },
  { id: "forms",         title: "Policy Forms",           description: "Generate forms for different policies.",                                        icon: ClipboardCheck },
  { id: "features",      title: "Manage Features",        description: "Generate features for different plans.",                                        icon: Edit3 },
  { id: "regulations",   title: "Policy Regulations",     description: "Define what will and will not be covered in plans.",                            icon: AlertTriangle },
  // { id: "seo",           title: "SEO Configuration",      description: "Configure meta title, description, and keywords.",                              icon: LineChart },
  { id: "pages",         title: "Manage Pages",           description: "Control dynamic and static pages of the system.",                               icon: FileText },
  { id: "kyc",           title: "KYC Setting",            description: "Configure client information fields.",                                          icon: ShieldCheck },
  { id: "social",        title: "Social Login Setting",   description: "Provide required social login information.",                                    icon: Users },
  { id: "maintenanceMode",   title: "Maintenance Mode",       description: "Enable or disable maintenance mode when required.",                             icon: Settings },
  // Only visible to Super Admin — rendered conditionally below, not part of
  // the static grid everyone sees.
];

const adminRegistrationCard = {
  id: "adminRegistration",
  title: "Admin Registration",
  description: "Create new admin accounts and assign roles & platform access. Super Admin only.",
  icon: UserPlus,
};



const settingFieldGroups = {

  general: [
    { name: "companyName", label: "Company Name", type: "text", defaultValue: "Agile Insurance" },
    { name: " ", label: "Support Email", type: "text", defaultValue: "support@agileinsure.in" },
    { name: "supportPhone", label: "Support Phone", type: "text", defaultValue: "+91 98765 43210" },
    { name: "serviceTaxRate", label: "Service Tax Rate (%)", type: "number", defaultValue: 18 },
  ],



  // branding: [
  //   { name: "logo", label: "Logo", type: "file", accept: "image/*", defaultValue: "" },
  //   { name: "favicon", label: "Favicon", type: "file", accept: "image/*", defaultValue: "" },
  //   { name: "brandColor", label: "Brand Color", type: "color", defaultValue: "#2563eb" },
  // ],
  configuration: [
    { name: "claimsModule", label: "Claims Module", type: "boolean", defaultValue: true },
    { name: "paymentsModule", label: "Payments Module", type: "boolean", defaultValue: true },
    { name: "documentsModule", label: "Document Vault", type: "boolean", defaultValue: true },
    { name: "supportModule", label: "Support Center", type: "boolean", defaultValue: true },
  ],



  notifications: [
    { name: "emailEnabled", label: "Email Notifications", type: "boolean", defaultValue: true },
    { name: "smsEnabled", label: "SMS Notifications", type: "boolean", defaultValue: true },
    { name: "pushEnabled", label: "Push Notifications", type: "boolean", defaultValue: false },
    { name: "renewalReminderDays", label: "Renewal Reminder Days", type: "number", defaultValue: 15 },
  ],



  paymentGateways: [
    { name: "netBanking", label: "Net Banking", type: "boolean", defaultValue: true },
    { name: "upi", label: "UPI Payments", type: "boolean", defaultValue: true },
    { name: "cards", label: "Card Payments", type: "boolean", defaultValue: true },
    { name: "wallets", label: "Wallets", type: "boolean", defaultValue: true },
    { name: "minimumPayment", label: "Minimum Payment", type: "number", defaultValue: 500 },
  ],



  withdrawals: [
    { name: "bankTransfer", label: "Bank Transfer", type: "boolean", defaultValue: true },
    { name: "upiPayout", label: "UPI Payout", type: "boolean", defaultValue: true },
    { name: "minimumWithdrawal", label: "Minimum Withdrawal", type: "number", defaultValue: 1000 },
    { name: "payoutNote", label: "Payout Instructions", type: "textarea", defaultValue: "Verify bank details before approving payouts." },
  ],



  forms: [
    { name: "healthForm", label: "Health Policy Form", type: "boolean", defaultValue: true },
    { name: "motorForm", label: "Motor Policy Form", type: "boolean", defaultValue: true },
    { name: "lifeForm", label: "Life Policy Form", type: "boolean", defaultValue: true },
    { name: "requiredFields", label: "Required Fields", type: "textarea", defaultValue: "Full name, phone, email, policy type, ID proof" },
  ],


  features: [
    
    { name: "aiAssistant", label: "AI Assistant", type: "boolean", defaultValue: true },
    { name: "policyCompare", label: "Policy Compare", type: "boolean", defaultValue: true },
    { name: "claimTracking", label: "Claim Tracking", type: "boolean", defaultValue: true },
  ],


  regulations: [
    { name: "coveredItems", label: "Covered Items", type: "textarea", defaultValue: "Hospitalization, accident damage, policy benefits, verified expenses" },
    { name: "excludedItems", label: "Excluded Items", type: "textarea", defaultValue: "Fraudulent claims, expired policies, missing documents" },
    { name: "highValueReviewAmount", label: "High Value Review Amount", type: "number", defaultValue: 100000 },
  ],



  // seo: [
  //   { name: "metaTitle", label: "Meta Title", type: "text", defaultValue: "Agile Insurance Portal" },
  //   { name: "metaDescription", label: "Meta Description", type: "textarea", defaultValue: "Compare, buy, and manage insurance policies online." },
  //   { name: "keywords", label: "Meta Keywords", type: "textarea", defaultValue: "insurance, claims, policy, health insurance, car insurance" },
  // ],



  // frontend: [
  //   { name: "heroTitle", label: "Home Hero Title", type: "text", defaultValue: "Smart Insurance for Every Need" },
  //   { name: "primaryCta", label: "Primary CTA", type: "text", defaultValue: "Explore Policies" },
  //   { name: "showTestimonials", label: "Show Testimonials", type: "boolean", defaultValue: true },
  // ],
  pages: [
  { name: "aboutPage", label: "About Page", type: "boolean", defaultValue: true },
  { name: "contactPage", label: "Contact Page", type: "boolean", defaultValue: true },
  { name: "articlesPage", label: "Articles Page", type: "boolean", defaultValue: true },

  { name: "generalInsurancePage", label: "General Insurance", type: "boolean", defaultValue: true },
  { name: "lifeInsurancePage", label: "Life Insurance", type: "boolean", defaultValue: true },
  { name: "termInsurancePage", label: "Term Insurance", type: "boolean", defaultValue: true },
  { name: "investmentPage", label: "Investment", type: "boolean", defaultValue: true },
  { name: "healthInsurancePage", label: "Health Insurance", type: "boolean", defaultValue: true },
  { name: "otherInsurancePage", label: "Other Insurance", type: "boolean", defaultValue: true },

  { name: "reviewsPage", label: "Customer Reviews", type: "boolean", defaultValue: true },
  { name: "companiesPage", label: "Insurance Companies", type: "boolean", defaultValue: true },
  { name: "newsroomPage", label: "Newsroom", type: "boolean", defaultValue: true },
  { name: "awardsPage", label: "Awards", type: "boolean", defaultValue: true },

  { name: "careersPage", label: "Careers", type: "boolean", defaultValue: true },
  { name: "legalPoliciesPage", label: "Legal Policies", type: "boolean", defaultValue: true },

  { name: "pageNotice", label: "Page Notice", type: "textarea", defaultValue: "Static pages are managed by the admin team." },


 
    { name: "premiumCalculator", label: "Insurance Premium Calculator", type: "boolean", defaultValue: true },
    { name: "termCalculator", label: "Term Insurance Calculator", type: "boolean", defaultValue: true },
    { name: "emiCalculator", label: "EMI Calculator", type: "boolean", defaultValue: true },
    { name: "carCalculator", label: "Car Insurance Calculator", type: "boolean", defaultValue: true },
  
],


  kyc: [
    { name: "aadhaarRequired", label: "Aadhaar Required", type: "boolean", defaultValue: true },
    { name: "panRequired", label: "PAN Required", type: "boolean", defaultValue: true },
    { name: "selfieRequired", label: "Selfie Required", type: "boolean", defaultValue: false },
    { name: "autoRejectIncomplete", label: "Auto Reject Incomplete KYC", type: "boolean", defaultValue: false },
  ],



  social: [
    { name: "googleLogin", label: "Google Login", type: "boolean", defaultValue: true },
    { name: "facebookLogin", label: "Facebook Login", type: "boolean", defaultValue: false },
    { name: "clientId", label: "OAuth Client ID", type: "text", defaultValue: "" },
  ],
  // language: [
  //   { name: "defaultLanguage", label: "Default Language", type: "select", defaultValue: "English", options: ["English", "Hindi", "Tamil", "Bengali"] },
  //   { name: "multiLanguage", label: "Enable Multi Language", type: "boolean", defaultValue: false },
  // ],
  // extensions: [
  //   { name: "analytics", label: "Analytics Extension", type: "boolean", defaultValue: true },
  //   { name: "chatbot", label: "Chatbot Extension", type: "boolean", defaultValue: true },
  //   { name: "documentScanner", label: "Document Scanner", type: "boolean", defaultValue: false },
  // ],
  // policyPages: [
  //   { name: "terms", label: "Terms and Conditions", type: "textarea", defaultValue: "Policy terms are subject to verification and approval." },
  //   { name: "privacy", label: "Privacy Policy", type: "textarea", defaultValue: "Customer data is stored securely for insurance operations." },
  // ],
  maintenanceMode: [
    {
        name: "enabled",
        label: "Maintenance Mode",
        type: "boolean",
        defaultValue: false
    },
    {
        name: "message",
        label: "Maintenance Message",
        type: "textarea",
        defaultValue: "The portal is temporarily under maintenance."
    }
]
 
};

// ─── Field value helpers ───────────────────────────────────────────────────────

const getValue = (data, settingId, field) => {
  return data?.modules?.[settingId]?.[field.name]
    ?? data?.[settingId]?.[field.name]
    ?? data?.[field.name]
    ?? field.defaultValue
    ?? "";
};

// ─── SettingField ─────────────────────────────────────────────────────────────

const SettingField = ({ settingId, field, value, onChange }) => {
  if (field.type === "boolean") {
    return (
      <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
        <span>
          <span className="block text-sm font-black text-slate-800">{field.label}</span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">{value ? "Enabled" : "Disabled"}</span>
        </span>
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 cursor-pointer rounded border-slate-300" />
      </label>
    );
  }
  if (field.type === "textarea") {
    return (
      <label className="block rounded-lg border border-slate-200 bg-white p-4">
        <span className="text-xs font-black uppercase tracking-wide text-slate-500">{field.label}</span>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold outline-none focus:border-blue-500" />
      </label>
    );
  }
  return (
    <label className="block rounded-lg border border-slate-200 bg-white p-4">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{field.label}</span>
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-500"
      />
    </label>
  );
};

// ─── SettingDetail view ───────────────────────────────────────────────────────

const SettingDetail = ({ card, onBack }) => {
  const dispatch = useDispatch();
  const { panel, log } = useAdminActions();
  const { data: systemSettings, saving } = useSelector((s) => s.settings);
  const fields = settingFieldGroups[card.id] || [];
  const Icon = card.icon;

  const handleChange = (field, value) => {
    const patch = { [card.id]: { [field.name]: value } };
    dispatch(mergeSettings(patch));
    log(`/api/v4/settings/update -> ${card.id}.${field.name}`);
    panel("Setting applied", `${field.label} updated.`);
  };

  const handleSave = async () => {
    dispatch(setSaving(true));
    try {
      const sectionValues = fields.reduce((acc, f) => {
        acc[f.name] = getValue(systemSettings, card.id, f);
        return acc;
      }, {});
      const res = await apiRequest("/api/admin/settings", {
        useAdminToken: true,
        method: "PATCH",

        body: JSON.stringify({ [card.id]: sectionValues }),
      });
      if (res?.data) dispatch(mergeSettings(res.data));
      log(`/api/v4/settings/save -> ${card.id}`);
      panel("Settings saved", `${card.title} section saved to backend.`);
    } catch {
      panel("Save failed", "Could not save to backend. Changes are stored locally.");
    } finally {
      dispatch(setSaving(false));
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle
        icon={Icon}
        title={card.title}
        action={
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
            <ArrowLeft size={16} />Back to Settings
          </button>
        }
      />

      <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-blue-800">
        {card.description} Changes save instantly and persist in local storage.
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
          <div className="text-sm font-black text-slate-900">Save this section</div>
          <div className="text-xs font-semibold text-slate-500">Store the latest values in MongoDB and push to the live portal.</div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {fields.map((field) => (
          <SettingField
            key={field.name}
            settingId={card.id}
            field={field}
            value={getValue(systemSettings, card.id, field)}
            onChange={(val) => handleChange(field, val)}
          />
        ))}
      </div>
    </section>
  );
};

// ─── AdminRegistrationDetail (Super Admin only) ────────────────────────────────
// Matches the design: "Admin Registration" lives inside System Settings and is
// only reachable/usable by Super Admin. Replaces the old public registration
// page. Form fields: Full Name, Email, Phone No., Password, Role, Accessible
// Platform Features, "Add New Admin" button — plus a list of existing admins.

const emptyAdminForm = { fullName: "", email: "", phone: "", password: "", role: "Support Executive", customRole: "", permissions: [] };

const AdminRegistrationDetail = ({ onBack }) => {
  const { panel, log } = useAdminActions();
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [form, setForm] = useState(emptyAdminForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await apiRequest("/api/admin/admins", { useAdminToken: true });
      setAdmins(res?.data || []);
    } catch (err) {
      setError(err?.message || "Could not load admin accounts.");
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const togglePermission = (id) => {
    setForm((p) => ({
      ...p,
      permissions: p.permissions.includes(id) ? p.permissions.filter((x) => x !== id) : [...p.permissions, id],
    }));
  };

  const resolvedRole = form.role === "__new__" ? form.customRole.trim() : form.role;

  const validate = () => {
    if (!form.fullName.trim()) return "Full Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\d{10}$/.test(form.phone.trim())) return "Enter a valid 10-digit phone number.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (!resolvedRole) return "Role is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) return setError(v);

    setSubmitting(true);
    try {
      const res = await apiRequest("/api/admin/admins", {
        useAdminToken: true,
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: resolvedRole,
          permissions: form.permissions,
        }),
      });

      if (res?.success) {
        setSuccess(`${form.fullName} was added as ${resolvedRole}.`);
        setForm(emptyAdminForm);
        log(`/api/admin/admins -> created admin (${resolvedRole})`);
        panel("Admin created", `${form.fullName} can now sign in as ${resolvedRole}.`);
        fetchAdmins();
      } else {
        setError(res?.message || "Could not create admin.");
      }
    } catch (err) {
      setError(err?.message || "Could not create admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (admin) => {
    setUpdatingId(admin._id);
    try {
      await apiRequest(`/api/admin/admins/${admin._id}`, {
        useAdminToken: true,
        method: "PATCH",
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      log(`/api/admin/admins/${admin._id} -> isActive=${!admin.isActive}`);
      fetchAdmins();
    } catch (err) {
      setError(err?.message || "Could not update admin.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle
        icon={UserPlus}
        title="Admin Registration"
        action={
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
            <ArrowLeft size={16} />Back to Settings
          </button>
        }
      />

      <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-blue-800">
        Only Super Admin can create new admin accounts and grant platform access. Admin self-registration has been removed from the login page.
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        {/* Existing admins */}
        <div>
          <div className="text-sm font-black text-slate-900">Existing Admins</div>
          {loadingAdmins ? (
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 className="animate-spin" size={18} />Loading…
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {admins.map((a) => (
                <div key={a._id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-900">{a.fullName}</div>
                    <div className="truncate text-xs font-semibold text-slate-500">{a.email} • {a.role}</div>
                    {Array.isArray(a.permissions) && a.permissions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {a.permissions.map((p) => (
                          <span key={p} className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleActive(a)}
                    disabled={updatingId === a._id}
                    title={a.isActive ? "Deactivate" : "Activate"}
                    className="shrink-0 text-slate-500 hover:text-blue-700 disabled:opacity-50"
                  >
                    {a.isActive ? <ToggleRight size={28} className="text-emerald-600" /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              ))}
              {!admins.length && <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-400">No admin accounts yet.</div>}
            </div>
          )}
        </div>

        {/* Add new admin form */}
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="text-sm font-black text-slate-900">Add New Admin</div>

          <div className="mt-4 space-y-4">
            {[
              ["Full Name", "text", "fullName"],
              ["Email", "email", "email"],
              ["Phone No.", "text", "phone"],
              ["Password", "password", "password"],
            ].map(([label, type, key]) => (
              <label key={key} className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
                <input
                  type={type}
                  required
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-500"
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                />
              </label>
            ))}

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Role</span>
              <select
                className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-500"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                {BUILT_IN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                <option value="Super Admin">Super Admin</option>
                <option value="__new__">+ New Admin Role…</option>
              </select>
            </label>

            {form.role === "__new__" && (
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">New Role Name</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Underwriting Lead"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-500"
                  value={form.customRole}
                  onChange={(e) => setForm((p) => ({ ...p, customRole: e.target.value }))}
                />
              </label>
            )}

            <div>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Accessible Platform Features</span>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PLATFORM_FEATURES.map((f) => (
                  <label key={f.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(f.id)}
                      onChange={() => togglePermission(f.id)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300"
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</div>}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={16} />{success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              Add New Admin
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

// ─── SettingsPage (card grid) ─────────────────────────────────────────────────

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { activePage } = useSelector((s) => s.ui);
  const { selectedSettingId } = useSelector((s) => s.settings);
  const { selectedProfile } = useSelector((s) => s.auth);
  const isSuperAdmin = selectedProfile?.role === "Super Admin";

  const visibleCards = isSuperAdmin ? [...adminSettingCards, adminRegistrationCard] : adminSettingCards;

  // Show detail view when activePage is "setting-detail"
  if (activePage === "setting-detail") {
    if (selectedSettingId === "adminRegistration") {
      // Defense in depth: even if a non-SuperAdmin somehow lands here (e.g. a
      // stale deep link), don't render the panel — the backend route is
      // SuperAdmin-gated too, but this avoids exposing the UI at all.
      if (!isSuperAdmin) {
        return (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={ShieldCheck} title="Access restricted" />
            <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              Admin Registration is only accessible to Super Admin.
            </div>
            <button
              onClick={() => dispatch({ type: "ui/setActivePage", payload: "settings" })}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />Back to Settings
            </button>
          </section>
        );
      }
      return <AdminRegistrationDetail onBack={() => dispatch({ type: "ui/setActivePage", payload: "settings" })} />;
    }

    const card = adminSettingCards.find((c) => c.id === selectedSettingId) || adminSettingCards[0];
    return (
      <SettingDetail
        card={card}
        onBack={() => dispatch({ type: "ui/setActivePage", payload: "settings" })}
      />
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle icon={Settings} title="System Settings" />

      <div className="mt-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Search settings…" />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => {
                  dispatch(setSelectedSettingId(card.id));
                  dispatch({ type: "ui/setActivePage", payload: "setting-detail" });
                }}
                className="group flex min-h-24 items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-blue-600 text-white transition group-hover:bg-blue-700">
                  <Icon size={25} />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-black text-slate-900">{card.title}</span>
                  <span className="mt-1 block text-sm font-semibold leading-5 text-slate-500">{card.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;
