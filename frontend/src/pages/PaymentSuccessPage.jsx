import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Download,
  FileText,
  Home,
  Sparkles,
  Shield,
  Star,
  ArrowRight,
  Calendar,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { load } from "../utils/storage";
import { getPolicyById } from "../data/catalog";
import { apiRequest } from "../utils/api";
import { normalizeBackendPolicy } from "./CheckoutPage";


const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

/* ─── Seeded random helpers for deterministic confetti ────────── */
const hashSeed = (seed) => {
  let h = 2166136261;
  const s = String(seed || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const lcg = (state) => {
  const next = (Math.imul(1664525, state) + 1013904223) >>> 0;
  return { next, value: next / 4294967296 };
};

/* ─── Confetti ─────────────────────────────────────────────────── */
const Confetti = ({ seed = "agile" }) => {
  const pieces = useMemo(() => {
    let state = hashSeed(seed);
    const colors = ["#2563EB", "#4F46E5", "#22C55E", "#F59E0B", "#38BDF8", "#EC4899", "#8B5CF6"];
    return Array.from({ length: 40 }).map((_, i) => {
      const a = lcg(state); state = a.next;
      const b = lcg(state); state = b.next;
      const c = lcg(state); state = c.next;
      const d = lcg(state); state = d.next;
      const e = lcg(state); state = e.next;
      return {
        id: i,
        left: a.value * 100,
        delay: b.value * 1.2,
        duration: 3 + c.value * 2.5,
        rotate: d.value * 360,
        size: 7 + e.value * 11,
        color: colors[i % colors.length],
        shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "rect" : "diamond",
      };
    });
  }, [seed]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{
            y: 900,
            opacity: [0, 1, 1, 0],
            rotate: p.rotate + 360,
          }}
          transition={{
            delay: p.delay,
            duration: p.duration,
            ease: "easeIn",
            opacity: { times: [0, 0.1, 0.85, 1] },
          }}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * (p.shape === "rect" ? 1.6 : 1)}px`,
            background: p.color,
            position: "absolute",
            top: 0,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "diamond" ? "0" : "3px",
            transform: p.shape === "diamond" ? `rotate(45deg)` : undefined,
          }}
        />
      ))}
    </div>
  );
};

/* ─── Pulse ring animation ──────────────────────────────────────── */
const PulseRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border-2 border-emerald-400/30"
        initial={{ width: 80, height: 80, opacity: 0.8 }}
        animate={{ width: 80 + i * 60, height: 80 + i * 60, opacity: 0 }}
        transition={{
          repeat: Infinity,
          duration: 2,
          delay: i * 0.5,
          ease: "easeOut",
        }}
      />
    ))}
  </div>
);

/* ─── Main Success Page ─────────────────────────────────────────── */
const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(8);
  const [showReceipt, setShowReceipt] = useState(false);
  const [rawPurchase, setRawPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const purchaseNumber = queryParams.get("purchaseNumber") || "";
  const purchaseId = queryParams.get("purchaseId") || "";

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("/api/user/my-policies");
        const list = res.data || [];
        
        // Find by purchaseNumber or purchaseId
        const found = list.find(
          (p) =>
            (purchaseNumber && p.purchase_number === purchaseNumber) ||
            (purchaseId && (p._id === purchaseId || p.id === purchaseId))
        );

        if (!found) {
          setError("Policy purchase record not found.");
        } else {
          setRawPurchase(found);
        }
      } catch (err) {
        console.error("Failed to load purchase details:", err);
        setError(err.message || "Failed to load purchase details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [purchaseNumber, purchaseId]);

  const purchase = useMemo(() => {
    if (!rawPurchase) return null;
    return {
      ...rawPurchase,
      amount: rawPurchase.payment?.final_amount || rawPurchase.amount || 0,
      policyNumber: rawPurchase.purchase_number || rawPurchase.policyNumber || "—",
      invoiceNumber: rawPurchase.payment?.invoice_number || rawPurchase.invoiceNumber || "—",
      premium: rawPurchase.payment?.amount || rawPurchase.premium || 0,
      activatedAt: rawPurchase.start_date || rawPurchase.activatedAt || new Date().toISOString(),
      renewalAt: rawPurchase.end_date || rawPurchase.renewalAt || new Date().toISOString(),
      paymentMethod: rawPurchase.payment?.payment_method || rawPurchase.paymentMethod || "upi",
      nominee: {
        name: rawPurchase.nominee?.fullName || rawPurchase.nominee?.name || "",
        relation: rawPurchase.nominee?.relation || "",
        phone: rawPurchase.nominee?.phone || "",
      }
    };
  }, [rawPurchase]);

  // Try static catalog first; for backend (MongoDB) policies fall back to a
  // synthetic object built from the data we saved in the purchase snapshot.
  const policy = useMemo(() => {
    if (!purchase) return null;
    if (purchase.policy && typeof purchase.policy === "object") {
      return normalizeBackendPolicy(purchase.policy);
    }
    const catalogPolicy = getPolicyById(purchase.policyId);
    if (catalogPolicy) return catalogPolicy;
    // Build synthetic policy from purchase snapshot
    return {
      id: purchase.policyId,
      policyName: purchase.policySnapshot?.policyName || purchase.policyName || "Insurance Policy",
      company: purchase.policySnapshot?.company || purchase.company || "Provider",
      companyBrand: purchase.policySnapshot?.companyBrand || { initials: "IN", color: "bg-blue-600" },
      coverageLabel: purchase.policySnapshot?.coverageLabel || "—",
      keyBenefits: purchase.policySnapshot?.keyBenefits || [],
    };
  }, [purchase]);

  useEffect(() => {
    if (!purchase) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    const redirect = setTimeout(() => navigate("/dashboard", { replace: true }), 8200);
    const receipt = setTimeout(() => setShowReceipt(true), 600);
    return () => {
      clearInterval(t);
      clearTimeout(redirect);
      clearTimeout(receipt);
    };
  }, [purchase, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="mx-auto h-12 w-12 text-blue-500"
          >
            <Loader2 size={48} />
          </motion.div>
          <p className="mt-4 text-sm font-semibold text-white/70">Confirming payment and activation status…</p>
        </div>
      </div>
    );
  }

  if (error || !purchase || !policy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-lg backdrop-blur-xl">
          <h1 className="text-2xl font-black text-white">Record Not Found</h1>
          <p className="mt-2 text-white/60">{error || "Return to dashboard to view your active policies."}</p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-blue-600/30"
          >
            Open Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 px-4 py-12 sm:px-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute left-1/4 top-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* Confetti */}
      <Confetti seed={purchaseId || "agile"} />

      <div className="relative mx-auto max-w-4xl">
        {/* Success hero */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", damping: 20 }}
          className="text-center"
        >
          {/* Check icon with pulse */}
          <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
            <PulseRings />
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 200 }}
              className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/40"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <BadgeCheck size={48} className="text-white" strokeWidth={2.5} />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-sm font-bold text-emerald-400">
              <Sparkles size={14} />
              Payment Successful
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Policy Activated! 🎉
            </h1>
            <p className="mt-3 text-lg font-medium text-white/60">
              Your coverage is now live. Redirecting to dashboard in{" "}
              <span className="font-black text-white">{countdown}s</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Receipt card */}
        <AnimatePresence>
          {showReceipt && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", damping: 22 }}
              className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.4)]"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${policy.companyBrand?.color || "bg-blue-600"} text-sm font-black text-white shadow-lg`}
                  >
                    {policy.companyBrand?.initials || "AI"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/50">{policy.company}</p>
                    <p className="text-sm font-black text-white">{policy.policyName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white/50">Total Paid</p>
                  <p className="text-2xl font-black text-emerald-400">{formatInr(purchase.amount)}</p>
                </div>
              </div>

              {/* Receipt grid */}
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
                {[
                  { label: "Policy No.", value: purchase.policyNumber, icon: Shield },
                  { label: "Invoice", value: purchase.invoiceNumber, icon: FileText },
                  { label: "Premium", value: formatInr(purchase.premium), icon: IndianRupee },
                  { label: "Coverage", value: policy.coverageLabel, icon: BadgeCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <Icon size={12} className="text-white/40" />
                        <span className="text-[11px] font-bold uppercase tracking-wide text-white/40">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-sm font-black text-white truncate">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* More details */}
              <div className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
                    Activated On
                  </div>
                  <p className="text-sm font-black text-white">
                    {new Date(purchase.activatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
                    Renewal Date
                  </div>
                  <p className="text-sm font-black text-white">
                    {new Date(purchase.renewalAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
                    Payment Method
                  </div>
                  <p className="text-sm font-black text-white capitalize">
                    {purchase.paymentMethod === "upi"
                      ? "UPI"
                      : purchase.paymentMethod === "cards"
                      ? "Card"
                      : purchase.paymentMethod === "wallets"
                      ? "Wallet"
                      : purchase.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Nominee */}
              {purchase.nominee?.name && (
                <div className="mx-6 mb-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-blue-400 mb-1">
                    Nominee
                  </p>
                  <p className="text-sm font-black text-white">
                    {purchase.nominee.name}{" "}
                    <span className="text-xs font-semibold text-white/50">({purchase.nominee.relation})</span>
                  </p>
                </div>
              )}

              {/* Key benefits */}
              <div className="border-t border-white/10 px-6 py-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
                  Your Coverage Includes
                </p>
                <div className="flex flex-wrap gap-2">
                  {policy.keyBenefits.map((benefit, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70"
                    >
                      <Star size={10} className="text-amber-400" fill="#F59E0B" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-white/10 px-6 py-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => window.alert("Invoice download is mocked in this demo.")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-sm transition-all hover:bg-white/15"
                  >
                    <Download size={16} />
                    Download Invoice
                  </button>
                  <button
                    onClick={() => window.alert("Policy document download is mocked in this demo.")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-sm font-black text-white backdrop-blur-sm transition-all hover:bg-white/15"
                  >
                    <FileText size={16} />
                    Download Policy
                  </button>
                  <button
                    onClick={() => navigate("/dashboard", { replace: true })}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl"
                  >
                    <Sparkles size={16} />
                    Go to Dashboard
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back home link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white/70 transition-colors"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
