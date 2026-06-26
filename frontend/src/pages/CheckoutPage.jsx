import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Wallet,
  User,
  Phone,
  Calendar,
  Star,
  Lock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  BadgeCheck,
  Clock,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { getPolicyById as getCatalogPolicyById } from "../data/catalog";
import { apiRequest } from "../utils/api";
import { load, save, uid } from "../utils/storage";
import { useAuth } from "../contexts/useAuth";

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const calcGst = (amount) => Math.round(amount * 0.18);

/* ─── Payment Processing Overlay ─────────────────────────────── */
const PaymentOverlay = ({ method, amount, onDone }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { label: "Connecting to payment gateway…", icon: "🔗" },
    { label: "Verifying your details…", icon: "🔍" },
    { label: "Processing payment…", icon: "💳" },
    { label: "Securing transaction…", icon: "🔐" },
    { label: "Payment successful!", icon: "✅" },
  ];

  useEffect(() => {
    let i = 0;
    const advance = () => {
      i += 1;
      setStep(i);
      if (i < steps.length - 1) {
        setTimeout(advance, 700 + Math.random() * 400);
      } else {
        setTimeout(onDone, 900);
      }
    };
    const t = setTimeout(advance, 600);
    return () => clearTimeout(t);
  }, []);

  const methodLabels = {
    upi: "UPI",
    cards: "Credit / Debit Card",
    wallets: "Wallet",
    netBanking: "Net Banking",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backdropFilter: "blur(12px)", background: "rgba(2,6,23,0.75)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-[0_60px_200px_rgba(2,6,23,0.5)]"
      >
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-500/15 blur-[80px]" />

        <div className="relative">
          {/* Spinning ring + icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute h-24 w-24">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="url(#payGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="276"
                  animate={{
                    strokeDashoffset: step >= steps.length - 1 ? 0 : 276 - (276 * step) / (steps.length - 1),
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="payGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <motion.span
              key={step}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative text-4xl"
            >
              {steps[Math.min(step, steps.length - 1)].icon}
            </motion.span>
          </div>

          <h2 className="text-center text-xl font-black text-slate-900">
            {step >= steps.length - 1 ? "Payment Done!" : "Processing Payment"}
          </h2>
          <p className="mt-1 text-center text-sm font-medium text-slate-500">
            {methodLabels[method] || method} • {formatInr(amount)}
          </p>

          {/* Steps */}
          <div className="mt-8 space-y-2.5">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-black transition-all duration-500 ${
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    i <= step ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
                {i === step && step < steps.length - 1 && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="ml-auto"
                  >
                    <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {step >= steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center text-sm font-bold text-emerald-700"
            >
              🎉 Policy activated! Redirecting…
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Policy Logo Badge ───────────────────────────────────────── */
const PolicyLogo = ({ brand, size = "lg" }) => {
  const sz = size === "lg" ? "h-16 w-16 text-base" : "h-10 w-10 text-xs";
  return (
    <div
      className={`${sz} ${brand?.color || "bg-blue-600"} grid place-items-center rounded-2xl text-white font-black shadow-lg`}
    >
      {brand?.initials || "AI"}
    </div>
  );
};

/* ─── Normalize a backend MongoDB policy doc into the UI shape ── */
export const normalizeBackendPolicy = (p) => {

  const company = p.companyName || p.company_name || "Unknown Provider";
  const policyName = p.policyName || p.policy_name || p.name || "Policy";
  const premiumMonthly = Number(p.premium_amount ?? p.premiumAmount ?? p.monthlyPremium ?? 0);
  const coverageAmount = Number(p.coverage_amount ?? p.coverageAmount ?? 0);
  const rating = Number(p.rating) || 4.0;
  const validityYears = p.validityYears || 1;
  const emiAvailable = !!p.emiAvailable;
  const policyType = p.policyType || p.policy_type || "Standard";
  const keyBenefits = Array.isArray(p.features) ? p.features : [];
  const rawClaim = Number(p.claimRatio ?? p.claim_ratio ?? 90);
  const claimSettlementRatio = rawClaim <= 1 ? Math.round(rawClaim * 100) : rawClaim;
  const companyBrand = {
    initials: company.trim().split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "IN",
    color: "bg-blue-600",
  };
  const formatInrLocal = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  return {
    id: p._id || p.id,
    company,
    companyBrand,
    policyName,
    premiumMonthly,
    premiumYearly: Math.round(premiumMonthly * 12 * 0.92),
    premiumLabel: formatInrLocal(premiumMonthly),
    coverageAmount,
    coverageLabel: formatInrLocal(coverageAmount),
    claimSettlementRatio,
    validityYears,
    emiAvailable,
    policyType,
    rating,
    keyBenefits,
    aiBadge: p.aiBadge || null,
    claimProcess: [
      "Initiate claim via Agile AI Assistant",
      "Upload documents + smart verification",
      "Survey & review by claim team",
      "Approval with instant payout tracking",
    ],
  };
};

/* ─── Detect whether an ID is a MongoDB ObjectId ─────────────── */
const isMongoId = (id) => /^[a-f\d]{24}$/i.test(id);

/* ─── Main Checkout Page ──────────────────────────────────────── */
const CheckoutPage = () => {
  const { policyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Policy state — may come from static catalog OR backend API
  const [policy, setPolicy] = useState(() => {
    // Try static catalog immediately for instant render
    if (!isMongoId(policyId)) return getCatalogPolicyById(policyId) || null;
    return null;
  });
  const [policyLoading, setPolicyLoading] = useState(() => isMongoId(policyId));
  const [policyError, setPolicyError] = useState("");

  // Fetch from backend when it's a MongoDB ObjectId
  useEffect(() => {
    if (!isMongoId(policyId)) return;
    let cancelled = false;
    const fetch = async () => {
      setPolicyLoading(true);
      setPolicyError("");
      try {
        const res = await apiRequest(`/api/policies/${policyId}`);
        const raw = res?.data || res?.policy || res;
        if (!cancelled && raw) {
          setPolicy(normalizeBackendPolicy(raw));
        } else if (!cancelled) {
          setPolicyError("Policy not found.");
        }
      } catch (e) {
        if (!cancelled) setPolicyError(e?.message || "Failed to load policy.");
      } finally {
        if (!cancelled) setPolicyLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [policyId]);

  const [busy, setBusy] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [billingCycle, setBillingCycle] = useState("yearly");

  const [settingsPayments, setSettingsPayments] = useState({
    netBanking: true,
    upi: true,
    cards: true,
    wallets: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiRequest("/api/admin/settings");
        const settings = response?.data;
        setSettingsPayments(settings?.paymentGateways || { netBanking: true, upi: true, cards: true, wallets: true });
      } catch {
        // keep defaults
      }
    };
    fetchSettings();
  }, []);

  const [form, setForm] = useState({
    nomineeName: "",
    nomineeRelation: "Spouse",
    nomineePhone: "",
    nomineeDob: "",
  });

  // UPI sub-form
  const [upiId, setUpiId] = useState("");
  // Card sub-form
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", holder: "" });
  // Wallet sub-form
  const [wallet, setWallet] = useState("PhonePe");

  const premium = useMemo(
    () => (billingCycle === "yearly" ? policy?.premiumYearly ?? 0 : policy?.premiumMonthly ?? 0),
    [policy, billingCycle]
  );
  const gst = useMemo(() => calcGst(premium), [premium]);
  const total = premium + gst;

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.nomineeName.trim()) return "Nominee name is required.";
    if (!form.nomineeRelation.trim()) return "Nominee relation is required.";
    if (!/^\d{10}$/.test(String(form.nomineePhone || "").trim())) return "Nominee phone must be 10 digits.";
    if (!form.nomineeDob) return "Nominee date of birth is required.";
    if (paymentMethod === "upi" && !upiId.trim()) return "UPI ID is required.";
    if (paymentMethod === "cards") {
      if (card.number.replace(/\s/g, "").length < 16) return "Enter a valid 16-digit card number.";
      if (!card.expiry.trim()) return "Card expiry is required.";
      if (!card.cvv.trim() || card.cvv.length < 3) return "Enter a valid CVV.";
      if (!card.holder.trim()) return "Cardholder name is required.";
    }
    return "";
  };

  const onPay = async () => {
    setError("");
    const v = validate();
    if (v) return setError(v);

    setBusy(true);
    setShowOverlay(true);
  };

  const handlePaymentDone = async () => {
    try {
      const isStatic = !isMongoId(policy.id);
      const res = await apiRequest("/api/purchases", {
        method: "POST",
        body: JSON.stringify({
          policyId: policy.id,
          paymentMethod,
          billingCycle,
          nominee: {
            fullName: form.nomineeName,
            relation: form.nomineeRelation,
            phone: form.nomineePhone,
            dob: form.nomineeDob,
          },
          ...(isStatic && {
            policyDetails: {
              companyName: policy.company,
              policyName: policy.policyName,
              premiumAmount: policy.premiumMonthly,
              coverageAmount: policy.coverageAmount,
              category: policy.categorySlug ? policy.categorySlug.replace("-insurance", "") : "health",
              policyType: policy.policyType,
              description: policy.description || `Comprehensive ${policy.policyName} from ${policy.company}.`,
              features: policy.keyBenefits || [],
              emiAvailable: policy.emiAvailable,
              validityYears: policy.validityYears,
              rating: policy.rating,
              claimRatio: policy.claimSettlementRatio,
            }
          })
        }),
      });

      navigate(`/purchase-success?purchaseNumber=${encodeURIComponent(res.purchaseNumber)}`, { replace: true });
    } catch (e) {
      setShowOverlay(false);
      setBusy(false);
      setError(e?.message || "Payment failed. Please try again.");
    }
  };


  // Loading state — shown while fetching from backend API
  if (policyLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-slate-50 px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12"
        >
          <Loader2 size={48} className="text-blue-600" />
        </motion.div>
        <p className="text-base font-semibold text-slate-600">Loading policy details…</p>
      </div>
    );
  }

  // Error state — shown if backend fetch failed
  if (policyError || !policy) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">
            {policyError ? "Error loading policy" : "Policy not found"}
          </h1>
          <p className="mt-2 text-slate-600">
            {policyError || "This policy does not exist or has been removed."}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              ← Go Back
            </button>
            <Link
              to="/health-insurance"
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white"
            >
              Browse Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
    { id: "cards", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
    { id: "wallets", label: "Wallet", icon: Wallet, desc: "Paytm, Mobikwik, Freecharge" },
  ].filter((m) => settingsPayments?.[m.id]);

  return (
    <>
      {/* Payment overlay */}
      <AnimatePresence>
        {showOverlay && (
          <PaymentOverlay method={paymentMethod} amount={total} onDone={handlePaymentDone} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {/* Top bar */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Lock size={15} className="text-blue-600" />
              Secure Checkout
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-700">
                SSL Encrypted
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Complete Your Purchase
            </h1>
            <p className="mt-2 text-slate-500">
              Review your policy and fill in nominee details to activate coverage instantly.
            </p>
          </div>

          {/* Main two-column layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_460px]">
            {/* ═══ LEFT: Policy Summary ═══════════════════════════════ */}
            <div className="space-y-6">
              {/* Policy Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/8 blur-[60px]" />

                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                  <ShieldCheck size={13} />
                  Policy Summary
                </div>

                {/* Logo + name + badges */}
                <div className="flex items-start gap-5">
                  <PolicyLogo brand={policy.companyBrand} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{policy.company}</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900 leading-tight">
                      {policy.policyName}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {policy.aiBadge && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-black text-white">
                          <Sparkles size={10} />
                          {policy.aiBadge}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        <Star size={10} className="text-amber-500" fill="#F59E0B" />
                        {policy.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <BadgeCheck size={10} />
                        {policy.claimSettlementRatio}% CSR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing toggle */}
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Billing:</span>
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {["monthly", "yearly"].map((b) => (
                      <button
                        key={b}
                        onClick={() => setBillingCycle(b)}
                        className={`rounded-lg px-3 py-1 text-xs font-black capitalize transition-all ${
                          billingCycle === b
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {b}
                        {b === "yearly" && (
                          <span className="ml-1 text-[10px] opacity-80">-8%</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key stats grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Premium",
                      value: formatInr(billingCycle === "yearly" ? policy.premiumYearly : policy.premiumMonthly),
                      sub: billingCycle === "yearly" ? "/ year" : "/ month",
                      highlight: true,
                    },
                    { label: "Coverage", value: policy.coverageLabel, sub: "sum insured" },
                    {
                      label: "Duration",
                      value: `${policy.validityYears} Year${policy.validityYears > 1 ? "s" : ""}`,
                      sub: "validity",
                    },
                    { label: "Type", value: policy.policyType, sub: "plan type" },
                    { label: "Claim Ratio", value: `${policy.claimSettlementRatio}%`, sub: "settlement" },
                    { label: "EMI", value: policy.emiAvailable ? "Available" : "Not available", sub: "monthly option" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`rounded-2xl border p-4 transition-all ${
                        stat.highlight
                          ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {stat.label}
                      </div>
                      <div
                        className={`mt-1.5 text-base font-black ${
                          stat.highlight ? "text-blue-700" : "text-slate-900"
                        }`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Features / Key Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-4 text-sm font-black text-slate-900">Key Benefits & Features</div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {policy.keyBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      <span className="text-sm font-semibold text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Claim process */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-blue-950 p-6 shadow-sm sm:p-8"
              >
                <div className="mb-5 text-sm font-black text-white">Claim Process</div>
                <div className="space-y-3">
                  {policy.claimProcess.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                        {i + 1}
                      </div>
                      <span className="mt-0.5 text-sm font-semibold text-white/85">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ═══ RIGHT: Nominee + Payment + Order Summary ══════════ */}
            <div className="space-y-6">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Nominee Details */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-white">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-900">Nominee Details</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-600">
                        Nominee Full Name *
                      </label>
                      <input
                        value={form.nomineeName}
                        onChange={(e) => update("nomineeName", e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-600">Relation *</label>
                      <select
                        value={form.nomineeRelation}
                        onChange={(e) => update("nomineeRelation", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                      >
                        {["Spouse", "Parent", "Child", "Sibling", "Other"].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-600">
                        Nominee Phone *
                      </label>
                      <div className="relative">
                        <Phone
                          size={15}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          value={form.nomineePhone}
                          onChange={(e) =>
                            update("nomineePhone", e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                          placeholder="10-digit number"
                          inputMode="numeric"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-600">
                        Nominee Date of Birth *
                      </label>
                      <div className="relative">
                        <Calendar
                          size={15}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="date"
                          value={form.nomineeDob}
                          onChange={(e) => update("nomineeDob", e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>
                  </div>

                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white">
                      <CreditCard size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-900">Payment Method</span>
                  </div>

                  <div className="space-y-2.5">
                    {paymentMethods.map((m) => {
                      const Icon = m.icon;
                      const active = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={`group w-full rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 ${
                            active
                              ? "border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${
                                  active ? "bg-blue-600 shadow-lg shadow-blue-600/25" : "bg-slate-100"
                                }`}
                              >
                                <Icon size={18} className={active ? "text-white" : "text-slate-600"} />
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-black transition-colors ${
                                    active ? "text-blue-700" : "text-slate-800"
                                  }`}
                                >
                                  {m.label}
                                </div>
                                <div className="text-[11px] font-medium text-slate-500">{m.desc}</div>
                              </div>
                            </div>
                            <div
                              className={`h-5 w-5 rounded-full border-2 transition-all ${
                                active ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                              } flex items-center justify-center`}
                            >
                              {active && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-forms */}
                  <AnimatePresence mode="wait">
                    {paymentMethod === "upi" && (
                      <motion.div
                        key="upi"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                          <label className="mb-2 block text-xs font-bold text-blue-800">UPI ID</label>
                          <input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@upi"
                            className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          />
                          <p className="mt-1.5 text-[11px] font-medium text-blue-600">
                            e.g. 9876543210@okaxis
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === "cards" && (
                      <motion.div
                        key="cards"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-bold text-slate-600">Card Number</label>
                            <input
                              value={card.number}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                                setCard((c) => ({
                                  ...c,
                                  number: val.replace(/(.{4})/g, "$1 ").trim(),
                                }));
                              }}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1.5 block text-xs font-bold text-slate-600">Expiry</label>
                              <input
                                value={card.expiry}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                  if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                                  setCard((c) => ({ ...c, expiry: val }));
                                }}
                                placeholder="MM/YY"
                                maxLength={5}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs font-bold text-slate-600">CVV</label>
                              <input
                                type="password"
                                value={card.cvv}
                                onChange={(e) =>
                                  setCard((c) => ({
                                    ...c,
                                    cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                                  }))
                                }
                                placeholder="•••"
                                maxLength={4}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-bold text-slate-600">
                              Cardholder Name
                            </label>
                            <input
                              value={card.holder}
                              onChange={(e) => setCard((c) => ({ ...c, holder: e.target.value }))}
                              placeholder="As on card"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === "wallets" && (
                      <motion.div
                        key="wallets"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <label className="mb-2 block text-xs font-bold text-slate-600">Select Wallet</label>
                          <div className="grid grid-cols-3 gap-2">
                            {["PhonePe", "Paytm", "Mobikwik"].map((w) => (
                              <button
                                key={w}
                                onClick={() => setWallet(w)}
                                className={`rounded-xl border px-2 py-2 text-xs font-bold transition-all ${
                                  wallet === w
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                                }`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Order Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white">
                      <IndianRupee size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-900">Order Summary</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Premium{" "}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                          {billingCycle}
                        </span>
                      </span>
                      <span className="text-sm font-black text-slate-900">{formatInr(premium)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">GST (18%)</span>
                      <span className="text-sm font-black text-slate-900">{formatInr(gst)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Platform fee</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-slate-900">Total Payable</span>
                      <span className="text-xl font-black text-blue-700">{formatInr(total)}</span>
                    </div>
                  </div>

                  {/* Validity badge */}
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                    <Calendar size={14} className="text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">
                      Valid for {policy.validityYears} year{policy.validityYears > 1 ? "s" : ""} from activation
                    </span>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pay Now button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={busy}
                    onClick={onPay}
                    className="mt-5 group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      <Lock size={17} />
                      {busy ? "Processing…" : `Pay ${formatInr(total)}`}
                      <ChevronRight size={17} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </motion.button>

                  <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Lock size={10} />
                      256-bit SSL
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      Instant activation
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={10} />
                      PCI-DSS
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
