import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Download, FileText, Home, Sparkles, Loader2 } from "lucide-react";
import { apiRequest } from "../utils/api";

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Payment success page copy, receipt labels, and next-step buttons are defined in this file.
const hashSeed = (seed) => {
  let h = 2166136261;
  const s = String(seed || "");
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const lcg = (state) => {
  const next = (Math.imul(1664525, state) + 1013904223) >>> 0;
  return { next, value: next / 4294967296 };
};

const Confetti = ({ seed = "agile" }) => {
  const pieces = useMemo(() => {
    let state = hashSeed(seed);
    const colors = ["#2563EB", "#4F46E5", "#22C55E", "#F59E0B", "#38BDF8"];
    return Array.from({ length: 26 }).map((_, i) => {
      const a = lcg(state);
      state = a.next;
      const b = lcg(state);
      state = b.next;
      const c = lcg(state);
      state = c.next;
      const d = lcg(state);
      state = d.next;
      const e = lcg(state);
      state = e.next;
      return {
        id: i,
        left: a.value * 100,
        delay: b.value * 0.6,
        duration: 2.8 + c.value * 1.8,
        rotate: d.value * 360,
        size: 8 + e.value * 12,
        color: colors[i % colors.length],
      };
    });
  }, [seed]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
          className="absolute -top-10 rounded-md opacity-90 [animation-name:confetti-fall] [animation-timing-function:cubic-bezier(.2,.7,.2,1)] [animation-iteration-count:1] [animation-fill-mode:forwards]"
        />
      ))}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes confetti-fall {
            0% { transform: translateY(-40px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(820px) rotate(420deg); opacity: 0; }
          }
        `,
        }}
      />
    </div>
  );
};

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [purchase, setPurchase] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const purchaseNumber = useMemo(
    () => new URLSearchParams(location.search).get("purchaseNumber") || "",
    [location.search],
  );

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const res = await apiRequest("/api/purchases/my");
        const purchases = res?.data || [];
        const match = purchases.find((p) => p.purchase_number === purchaseNumber) || purchases[0] || null;
        setPurchase(match);
        setPolicy(match?.policy || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [purchaseNumber]);

  useEffect(() => {
    if (!purchase) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    const redirect = setTimeout(() => navigate("/dashboard", { replace: true }), 5200);
    return () => {
      clearInterval(t);
      clearTimeout(redirect);
    };
  }, [purchase, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!purchase || !policy) {
    return (
      <div className="min-h-[70vh] bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:rounded-[2.5rem] sm:p-10">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Payment session not found</h1>
          <p className="mt-2 text-slate-600">Return to dashboard to view your policies.</p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:flex">
            <Link to="/dashboard" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">
              Open Dashboard
            </Link>
            <Link to="/" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPaid = purchase.payment?.final_amount || 0;
  const invoiceNumber = purchase.payment?.invoice_number || "—";

  return (
    <div className="relative min-h-[85vh] overflow-hidden bg-gradient-to-b from-white to-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      <Confetti seed={purchaseNumber || purchase.purchase_number || "agile"} />

      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_40px_120px_rgba(2,6,23,0.12)] sm:rounded-[3rem] sm:p-10"
        >
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-emerald-500/10 blur-[90px]" />

          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-4 py-2 text-xs font-black text-emerald-700">
                <BadgeCheck size={16} />
                Payment Successful
              </div>
              <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Policy activated — welcome to Agile Insurance
              </h1>
              <p className="mt-2 text-slate-600">
                Your plan is now live. Redirecting to dashboard in{" "}
                <span className="font-black text-slate-900">{countdown}s</span>.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:rounded-[2.5rem] sm:p-6">
              <div className="text-xs font-bold text-slate-500">Total paid</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{formatInr(totalPaid)}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-[11px] font-bold text-slate-500">Invoice</div>
                  <div className="mt-1 font-black text-slate-900">{invoiceNumber}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-[11px] font-bold text-slate-500">Policy No.</div>
                  <div className="mt-1 font-black text-slate-900">{purchase.purchase_number}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Plan", value: policy.policyName },
              { label: "Company", value: policy.companyName },
              { label: "Coverage", value: formatInr(policy.coverageAmount) },
            ].map((x) => (
              <div key={x.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:rounded-[2.2rem] sm:p-6">
                <div className="text-xs font-bold text-slate-500">{x.label}</div>
                <div className="mt-2 truncate text-sm font-black text-slate-900">{x.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => window.alert("Invoice download is mocked in this frontend-only demo.")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
            >
              <Download size={18} />
              Download invoice
            </button>
            <button
              onClick={() => window.alert("Policy download is mocked in this frontend-only demo.")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50"
            >
              <FileText size={18} />
              Download policy
            </button>
            <button
              onClick={() => navigate("/dashboard", { replace: true })}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50"
            >
              <Sparkles size={18} className="text-blue-600" />
              Go to dashboard
            </button>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900">
              <Home size={18} />
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
