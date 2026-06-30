import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CreditCard,
  FileUp,
  Landmark,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
// import { getPolicyById } from "../data/catalog";
import { useAuth } from "../contexts/useAuth";
import { apiRequest } from "../utils/api";

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Checkout form labels, validation messages, payment method names, and success payload are managed here.
const calcGst = (amount) => Math.round(amount * 0.18);

const CheckoutPage = () => {
  const { policyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // const policy = getPolicyById(policyId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const [settingsPayments, setSettingsPayments] = useState({
  netBanking: true,
  upi: true,
  cards: true,
  wallets: true,
});

const normalizePolicy = (p) => ({
  id: p._id,
  company: p.companyName,
  policyName: p.policyName,
  premiumYearly: p.premiumAmount,
  coverageAmount: p.coverageAmount,
  coverageLabel: formatInr(p.coverageAmount),
  claimSettlementRatio: p.claimRatio,
  claimRatio: p.claimRatio,
  validityYears: p.validityYears,
  features: p.features,
});

useEffect(() => {
  const fetchPolicy = async () => {
    try {
      const res = await apiRequest(`/api/policies/${policyId}`);

      // depending on your controller
      setPolicy(normalizePolicy(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchPolicy();
}, [policyId]);


useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await apiRequest("/api/admin/settings");
      const settings = response?.data;

      setSettingsPayments(settings?.paymentGateways || {});
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
    }
  };

  fetchSettings();
}, []);






  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    nomineeName: "",
    nomineeRelation: "Spouse",
    nomineeDob: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    kycDocName: "",
  });

  const premium = useMemo(() => policy?.premiumYearly ?? 0, [policy]);
  const gst = useMemo(() => calcGst(premium), [premium]);
  const total = premium + gst;

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.fullName.trim()) return "Full Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\d{10}$/.test(String(form.phone || "").trim())) return "Enter a valid 10-digit phone number.";
    if (!form.nomineeName.trim()) return "Nominee name is required.";
    if (!form.nomineeDob.trim()) return "Nominee date of birth is required.";
    if (!form.addressLine1.trim()) return "Address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!/^\d{6}$/.test(String(form.pincode || "").trim())) return "Enter a valid 6-digit pincode.";
    if (!form.kycDocName.trim()) return "KYC upload is required (mock upload).";
    return "";
  };

  const onPay = async () => {
    setError("");
    const v = validate();
    if (v) return setError(v);

    setBusy(true);
    try {
      const res = await apiRequest("/api/purchases", {
        method: "POST",
        body: JSON.stringify({
          policyId: policy.id,
          paymentMethod,
          billingCycle: "yearly",
          nominee: {
            fullName: form.nomineeName,
            relation: form.nomineeRelation,
            phone: form.phone,
            dob: form.nomineeDob,
          },
        }),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Payment failed. Please try again.");
      }

      const purchaseNumber = res.purchaseNumber;
      navigate(`/payment/success?purchaseNumber=${encodeURIComponent(purchaseNumber)}`, { replace: true });
    } catch (e) {
      setError(e?.message || "Payment failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };
if (loading) {
  return <div>Loading...</div>;
}
  if (!policy) {
    return (
      <div className="min-h-[70vh] bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:rounded-[2.5rem] sm:p-10">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Checkout unavailable</h1>
          <p className="mt-2 text-slate-600">This policy does not exist.</p>
          <div className="mt-8">
            <Link to="/health-insurance" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">
              Browse Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
                <ShieldCheck size={16} className="text-blue-600" />
                Secure checkout • PCI-DSS aligned UX (demo)
              </div>
              <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Checkout</h1>
              <p className="mt-2 text-slate-600">Confirm details, upload KYC and complete payment.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-blue-600/10 px-4 py-3 text-xs font-black text-blue-700">
                <Lock size={16} />
                Encrypted session
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600/10 px-4 py-3 text-xs font-black text-emerald-700">
                <BadgeCheck size={16} />
                Trusted payments
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="text-sm font-black text-slate-900">Selected policy summary</div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Company", value: policy.company },
                { label: "Plan", value: policy.policyName },
                { label: "Coverage", value: policy.coverageLabel },
                { label: "Claim ratio", value: `${policy.claimRatio}%` },
              ].map((x) => (
                <div key={x.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-bold text-slate-500">{x.label}</div>
                  <div className="mt-2 text-sm font-black text-slate-900">{x.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <User size={18} className="text-blue-600" />
              User details
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Full Name</span>
                <input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                  inputMode="numeric"
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-700">Email</span>
                <input
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Sparkles size={18} className="text-blue-600" />
              Nominee details
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Nominee Name</span>
                <input
                  value={form.nomineeName}
                  onChange={(e) => update("nomineeName", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                  placeholder="e.g. Priya Sharma"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Relation</span>
                <select
                  value={form.nomineeRelation}
                  onChange={(e) => update("nomineeRelation", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                >
                  {["Spouse", "Parent", "Child", "Sibling", "Other"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Nominee Date of Birth</span>
                <input
                  type="date"
                  value={form.nomineeDob}
                  onChange={(e) => update("nomineeDob", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <MapPin size={18} className="text-blue-600" />
              Address
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-700">Address line</span>
                <input
                  value={form.addressLine1}
                  onChange={(e) => update("addressLine1", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                  placeholder="House/Flat, street, landmark…"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">City</span>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">State</span>
                <input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Pincode</span>
                <input
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
                  inputMode="numeric"
                />
              </label>
              <div className="hidden sm:block" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <FileUp size={18} className="text-blue-600" />
              KYC upload (mock)
            </div>
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="text-sm font-black text-slate-900">Upload PAN/Aadhaar (demo)</div>
                  <div className="mt-1 text-sm font-semibold text-slate-600">
                    No real upload happens — we only store a filename locally.
                  </div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:opacity-95">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => update("kycDocName", e.target.files?.[0]?.name ?? "")}
                  />
                  Choose file
                </label>
              </div>
              {form.kycDocName ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  Selected: <span className="font-black">{form.kycDocName}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-28 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-6">
              <div className="text-sm font-black text-slate-900">Payment methods</div>
              <div className="mt-5 space-y-3">
                {[
                  { id: "netBanking", label: "Net Banking", icon: Landmark },
                  { id: "upi", label: "UPI", icon: Wallet },
                  { id: "cards", label: "Credit/Debit Card", icon: CreditCard },
                  { id: "wallets", label: "Wallets", icon: Building2 },
                ]
                .filter((m) => settingsPayments?.[m.id])
.map((m) => {





                  const Icon = m.icon;
const active = paymentMethod === m.id;     

return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={[
                        "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left text-sm font-black shadow-sm transition",
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className={["grid h-10 w-10 place-items-center rounded-2xl", active ? "bg-white/15" : "bg-slate-100"].join(" ")}>
                          <Icon size={18} className={active ? "text-white" : "text-blue-600"} />
                        </span>
                        {m.label}
                      </span>
                      <span className={active ? "text-white/90" : "text-slate-400"}>●</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-6"
            >
              <div className="text-sm font-black text-slate-900">Payment summary</div>
              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Yearly premium</span>
                  <span className="font-black">{formatInr(premium)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-black">{formatInr(gst)}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total payable</span>
                  <span className="text-lg font-black text-slate-900">{formatInr(total)}</span>
                </div>
              </div>

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                disabled={busy}
                onClick={onPay}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-sm hover:opacity-95 disabled:opacity-70"
              >
                {busy ? "Processing payment…" : "Pay & Activate Policy"}
              </button>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  PCI-DSS Security (demo) • Trust badges • Fraud checks
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                  By paying you agree to policy T&C (mock). Your purchase is saved to your account.
                </div>
              </div>
            </motion.div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
