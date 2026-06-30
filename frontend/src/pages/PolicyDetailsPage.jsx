import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Download,
  FileText,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
} from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { apiRequest } from "../utils/api";

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;


const GENERIC_EXCLUSIONS = [
  "Fraudulent or pre-disclosed false claims",
  "Intentional self-inflicted injuries/damages",
  "War, nuclear events, and illegal activities",
];

const GENERIC_CLAIM_PROCESS = [
  "Initiate claim via Agile AI Assistant",
  "Upload documents + smart verification",
  "Survey & review by claim team",
  "Approval with instant payout tracking",
];

const GENERIC_REVIEWS = [
  { name: "Riya Mehta", rating: 5, text: "Smooth checkout and super premium UI. Love the AI recommendations." },
  { name: "Aman Verma", rating: 4, text: "Claim timeline is clear. Filter + compare is very helpful." },
  { name: "Neha Kapoor", rating: 5, text: "Looks like a real enterprise portal. Feels trustworthy." },
];

const buildFaqs = (policy) => [
  { q: "How fast can claims be processed?", a: "Most claims are verified within 24–72 hours in this demo flow." },
  { q: "Is EMI available on this plan?", a: policy?.emiAvailable ? "Yes — monthly EMI is supported." : "This plan is pay-in-full only." },
  { q: "What affects the policy health score?", a: "Premium consistency, claim history, risk score, and coverage utilization." },
];

// Normalize a raw backend Policy document into the shape this page renders.
const normalizePolicy = (p) => {
  if (!p) return null;
  const premiumYearly = p.premiumAmount || 0;
  const premiumMonthly = Math.round(premiumYearly / 12);
  return {
    id: p._id,
    company: p.companyName,
    companyBrand: { color: "bg-blue-600" },
    policyName: p.policyName,
    premiumMonthly,
    premiumYearly,
    coverageAmount: p.coverageAmount,
    coverageLabel: formatInr(p.coverageAmount),
    claimSettlementRatio: p.claimRatio,
    validityYears: p.validityYears,
    emiAvailable: !!p.emiAvailable,
    rating: p.rating || 4.2,
    policyType: p.policyType,
    categorySlug: `${p.category}-insurance`,
    keyBenefits: p.features && p.features.length ? p.features : ["Comprehensive coverage", "Fast digital claims", "24/7 support"],
    exclusions: GENERIC_EXCLUSIONS,
    claimProcess: GENERIC_CLAIM_PROCESS,
    reviews: GENERIC_REVIEWS,
  };
};

// Most plan-specific copy comes from the backend Policy document; this file controls detail page section headings and CTAs.
const RatingStars = ({ rating }) => {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < full ? "text-amber-500" : "text-slate-300"}
          fill={i < full ? "#F59E0B" : "none"}
        />
      ))}
    </div>
  );
};

const PolicyDetailsPage = () => {
  const { policyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [policy, setPolicy] = useState(null);
  const [comparePolicies, setComparePolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const compareIds = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("compare") || "";
    const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return Array.from(new Set([policyId, ...ids])).slice(0, 3);
  }, [location.search, policyId]);

  useEffect(() => {
    let mounted = true;
    const fetchPolicies = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          compareIds.map((id) =>
            apiRequest(`/api/policies/${id}`)
              .then((res) => normalizePolicy(res?.data))
              .catch(() => null),
          ),
        );
        if (!mounted) return;
        const valid = results.filter(Boolean);
        setPolicy(valid.find((p) => p.id === policyId) || valid[0] || null);
        setComparePolicies(valid);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPolicies();
    return () => (mounted = false);
  }, [compareIds, policyId]);

  const [billing, setBilling] = useState("monthly");
  const [faqOpen, setFaqOpen] = useState(0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-[70vh] bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:rounded-[2.5rem] sm:p-10">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Policy not found</h1>
          <p className="mt-2 text-slate-600">Go back to browse plans.</p>
          <div className="mt-8">
            <Link to="/health-insurance" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">
              Browse Health Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const faqs = buildFaqs(policy);
  const price = billing === "monthly" ? policy.premiumMonthly : policy.premiumYearly;

  const onBuy = () => {
    const target = `/checkout/${policy.id}`;
    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent(target)}`);
      return;
    }
    navigate(target);
  };

  return (
    <div className="bg-slate-50 pb-28 lg:pb-0">
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white to-slate-50">
        <div className="pointer-events-none absolute -top-48 right-0 h-[560px] w-[560px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {/* Detail page hero badge and summary metric labels. */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
                <ShieldCheck size={16} className="text-blue-600" />
                Plan details • Comparison ready
              </div>
              <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{policy.policyName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                  <span className={`h-2 w-2 rounded-full ${policy.companyBrand?.color || "bg-blue-600"}`} />
                  {policy.company}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                  <Sparkles size={14} className="text-blue-600" />
                  AI Health Score: {Math.round(78 + policy.rating * 4)}/100
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                  <Timer size={14} className="text-blue-600" />
                  Claim timeline: 24–72 hrs (demo)
                </span>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "Coverage", value: policy.coverageLabel },
                  { label: "Claim Settlement", value: `${policy.claimSettlementRatio}%` },
                  { label: "Policy Validity", value: `${policy.validityYears} year(s)` },
                ].map((x) => (
                  <div key={x.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-xs font-bold text-slate-500">{x.label}</div>
                    <div className="mt-2 text-xl font-black text-slate-900">{x.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500">Premium</div>
                  <div className="mt-2 text-3xl font-black text-slate-900">{formatInr(price)}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-600">
                    {billing === "monthly" ? "per month" : "per year"} • GST included (demo)
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-slate-500">Rating</div>
                  <div className="mt-2 flex items-center gap-2 sm:justify-end">
                    <RatingStars rating={policy.rating} />
                    <span className="text-sm font-black text-slate-800">{policy.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setBilling("monthly")}
                  className={[
                    "flex-1 rounded-2xl border px-4 py-3 text-sm font-black shadow-sm transition",
                    billing === "monthly"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={[
                    "flex-1 rounded-2xl border px-4 py-3 text-sm font-black shadow-sm transition",
                    billing === "yearly"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Yearly
                </button>
              </div>

              {/* Purchase card button labels and mocked brochure alert text. */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={onBuy}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => window.alert("Brochure download is mocked in this frontend-only demo.")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  <Download size={18} />
                  Brochure
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                  <BadgeCheck size={14} />
                  Verified plan data (mock)
                </span>
                {policy.emiAvailable ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700">
                    <Sparkles size={14} />
                    EMI Available
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_420px]">
        <section className="space-y-8">
          {/* Section titles below can be renamed without changing policy data. */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Info size={18} className="text-blue-600" />
              Included features
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {policy.keyBenefits.map((b) => (
                <div key={b} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <BadgeCheck size={18} className="text-blue-600" />
                  <div className="text-sm font-semibold text-slate-700">{b}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <FileText size={18} className="text-blue-600" />
              Excluded conditions
            </div>
            <ul className="mt-6 space-y-3">
              {policy.exclusions.map((x) => (
                <li key={x} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Timer size={18} className="text-blue-600" />
              Claim settlement timeline
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {policy.claimProcess.map((step, idx) => (
                <div key={step} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-black text-blue-700">Step {idx + 1}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-black text-slate-900">Policy FAQ</div>
              <div className="text-xs font-semibold text-slate-500">AI curated answers</div>
            </div>
            <div className="mt-6 space-y-3">
              {faqs.map((f, idx) => {
                const open = faqOpen === idx;
                return (
                  <div key={f.q} className="rounded-3xl border border-slate-200 bg-slate-50">
                    <button
                      onClick={() => setFaqOpen((v) => (v === idx ? -1 : idx))}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-800"
                    >
                      {f.q}
                      <span className="text-blue-600">{open ? "—" : "+"}</span>
                    </button>
                    <AnimatePresence>
                      {open ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden px-5 pb-5 text-sm font-semibold text-slate-600"
                        >
                          {f.a}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-black text-slate-900">Customer reviews</div>
              <div className="text-xs font-semibold text-slate-500">Latest (mock)</div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {policy.reviews.map((r) => (
                <div key={r.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-black text-slate-900">{r.name}</div>
                    <div className="text-xs font-black text-amber-700">{r.rating}/5</div>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-600">{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="sticky top-28 space-y-6">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-black text-slate-900">Insurance comparison table</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">Showing {comparePolicies.length} plan(s)</div>

              <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
                <div className="grid grid-cols-[1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-black text-slate-700">
                  <div>Metric</div>
                  <div>Selected</div>
                </div>
                {[
                  { k: "Monthly premium", v: formatInr(policy.premiumMonthly) },
                  { k: "Yearly premium", v: formatInr(policy.premiumYearly) },
                  { k: "Coverage", v: policy.coverageLabel },
                  { k: "Claim ratio", v: `${policy.claimSettlementRatio}%` },
                  { k: "EMI", v: policy.emiAvailable ? "Available" : "Not available" },
                ].map((row) => (
                  <div key={row.k} className="grid grid-cols-[1fr_1fr] px-4 py-3 text-xs font-semibold text-slate-700">
                    <div className="text-slate-500">{row.k}</div>
                    <div className="font-black text-slate-900">{row.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={onBuy}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
                >
                  Buy policy
                </button>
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("agile-ai-prompt", {
                        detail: { text: `Help me understand ${policy.policyName} and whether it fits my needs.` },
                      }),
                    )
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Ask AI
                </button>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-[0_40px_120px_rgba(2,6,23,0.35)]">
              <div className="text-sm font-black">AI Smart Recommendation</div>
              <div className="mt-2 text-sm text-white/75">
                This plan scores high on claim confidence and benefits-fit. Compare other {policy.policyType || "similar"} plans
                from top insurers to find the best fit for your needs.
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-white/85">
                <Sparkles size={16} />
                Personalized using your browsing pattern (demo)
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-slate-500">{billing === "monthly" ? "Monthly" : "Yearly"} premium</div>
            <div className="truncate text-lg font-black text-slate-900">{formatInr(price)}</div>
          </div>
          <button onClick={onBuy} className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-sm hover:opacity-95">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetailsPage;
