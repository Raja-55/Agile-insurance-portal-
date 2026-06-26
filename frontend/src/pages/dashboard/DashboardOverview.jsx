import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  FileText,
  LineChart,
  ShieldCheck,
  Sparkles,
  Target,
  Loader2,
} from "lucide-react";
import { load } from "../../utils/storage";
import { getPolicyById } from "../../data/catalog";
import { useAuth } from "../../contexts/useAuth";
import { apiRequest } from "../../utils/api";


const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Dashboard overview labels, summary cards, quick actions, and activity text are managed here.
const MiniLine = ({ values = [] }) => {
  const pts = useMemo(() => {
    if (!values.length) return "";
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(1, max - min);
    return values
      .map((v, i) => {
        const x = (i / Math.max(1, values.length - 1)) * 120;
        const y = 40 - ((v - min) / range) * 36;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [values]);

  return (
    <svg width="120" height="44" viewBox="0 0 120 44" className="opacity-95">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StatCard = ({ icon: Icon, title, value, hint, onClick, accent = "from-blue-600 to-indigo-600", chart }) => (
  <button
    onClick={onClick}
    className="group w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(2,6,23,0.10)] dark:border-white/10 dark:bg-white/5 sm:rounded-[2.2rem] sm:p-6"
  >
    <div className="flex items-start justify-between gap-4">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r ${accent} text-white shadow-sm`}>
        <Icon size={18} />
      </span>
      <span className="text-blue-600 dark:text-blue-400">{chart}</span>
    </div>
    <div className="mt-5 text-xs font-bold text-slate-500 dark:text-slate-400">{title}</div>
    <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
    <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{hint}</div>
  </button>
);

const mapPurchaseToUI = (p) => ({
  ...p,
  id: p._id || p.id,
  policyId: p.policy?._id || p.policyId,
  policyNumber: p.purchase_number || p.policyNumber,
  status: p.purchase_status === "active" ? "Active" : (p.purchase_status === "expired" ? "Expired" : (p.purchase_status || "Active")),
  amount: p.payment?.final_amount || p.amount || 0,
  premium: p.payment?.amount || p.premium || 0,
  activatedAt: p.start_date || p.activatedAt,
  renewalAt: p.end_date || p.renewalAt,
  paymentMethod: p.payment?.payment_method || p.paymentMethod,
  nominee: {
    name: p.nominee?.fullName || p.nominee?.name || "",
    relation: p.nominee?.relation || "",
  }
});

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rawPurchases, setRawPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("/api/user/my-policies");
        setRawPurchases(res.data || []);
      } catch (err) {
        console.error("DashboardOverview error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const purchases = useMemo(() => rawPurchases.map(mapPurchaseToUI), [rawPurchases]);
  const payments = useMemo(() => purchases.map((p) => p.payment).filter(Boolean).map(pay => ({
    ...pay,
    status: pay.payment_status === "success" ? "Success" : (pay.payment_status || "Success")
  })), [purchases]);
  
  const claims = useMemo(() => load("claims", []), []);

  const activePolicies = purchases.filter((p) => p.status === "Active");
  const totalInvestment = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter((p) => p.status !== "Success");
  const approvedClaims = claims.filter((c) => c.status === "Approved");
  const rewardPoints = Math.round(totalInvestment / 800);

  const upcomingRenewals = purchases
    .filter((p) => p.renewalAt)
    .sort((a, b) => new Date(a.renewalAt).getTime() - new Date(b.renewalAt).getTime())
    .slice(0, 3);

  const policyHealthScore = Math.round(72 + Math.min(22, activePolicies.length * 4) + Math.min(6, approvedClaims.length * 2));

  const recPolicy = useMemo(() => {
    const last = purchases[0];
    if (!last) return null;
    if (last.policy && typeof last.policy === "object") {
      const company = last.policy.companyName || last.policy.company_name || "Unknown Provider";
      const policyName = last.policy.policyName || last.policy.policy_name || "Policy";
      const companyBrand = {
        initials: company.trim().split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "IN",
        color: "bg-blue-600",
      };
      return {
        company,
        policyName,
        companyBrand
      };
    }
    return getPolicyById(last.policyId);
  }, [purchases]);

  const sparkline = useMemo(() => {
    const base = Math.max(2, activePolicies.length + 1);
    return Array.from({ length: 10 }).map((_, i) => Math.round(base * 60 + i * 18 + (i % 2 ? 22 : -10)));
  }, [activePolicies.length]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 text-blue-600 animate-spin"
        >
          <Loader2 size={40} />
        </motion.div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your dashboard data…</p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm dark:border-white/10 dark:from-white/5 dark:to-white/0 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Secure member access
            </div>
            <h1 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
              Welcome, <span className="text-slate-900 dark:text-white">{user?.fullName ?? "Member"}</span>
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Your policies, claims, payments, and documents — unified in one enterprise-grade portal.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Active policies", value: activePolicies.length, icon: BadgeCheck },
                { label: "Policy health score", value: `${policyHealthScore}/100`, icon: Target },
                { label: "Upcoming renewals", value: upcomingRenewals.length, icon: Bell },
              ].map((x) => {
                const Icon = x.icon;
                return (
                  <div key={x.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Icon size={16} className="text-blue-600 dark:text-blue-400" />
                      {x.label}
                    </div>
                    <div className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">{x.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 text-white shadow-[0_40px_120px_rgba(2,6,23,0.35)] dark:border-white/10 sm:rounded-[2.6rem] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-bold text-white/70">Policy recommendation</div>
                <div className="mt-2 text-2xl font-black tracking-tight">Personalized recommendations</div>
                <div className="mt-2 text-sm font-semibold text-white/70">
                  {recPolicy
                    ? `Your latest plan is ${recPolicy.company} • ${recPolicy.policyName}. Explore plans that fit your profile.`
                    : "Buy your first policy to unlock personalized recommendations."}
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-black">
                <Sparkles size={16} />
                Active
              </span>
            </div>

            <div className="mt-6">
              <Link
                to="/health-insurance"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
              >
                <LineChart size={18} />
                Explore plans
              </Link>
            </div>

            {upcomingRenewals.length ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs font-bold text-white/70">Upcoming renewal reminder</div>
                <div className="mt-2 space-y-2">
                  {upcomingRenewals.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-4 text-sm font-semibold text-white/85">
                      <span className="truncate">{u.policyNumber}</span>
                      <span className="text-xs font-black text-emerald-300">
                        {new Date(u.renewalAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm font-semibold text-white/70">
                No renewals yet — activate a policy to see renewal reminders.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={LineChart}
          title="Total Insurance Investment"
          value={formatInr(totalInvestment)}
          hint="Interactive analytics"
          onClick={() => navigate("/dashboard/payments")}
          chart={<MiniLine values={sparkline} />}
        />
        <StatCard
          icon={BadgeCheck}
          title="Active Policies"
          value={`${activePolicies.length}`}
          hint="Manage renewals & downloads"
          onClick={() => navigate("/dashboard/policies")}
          chart={<MiniLine values={sparkline.map((v) => v - 40)} />}
          accent="from-emerald-600 to-teal-500"
        />
        <StatCard
          icon={CreditCard}
          title="Pending Premium Payments"
          value={`${pendingPayments.length}`}
          hint="Invoices & payment options"
          onClick={() => navigate("/dashboard/payments")}
          chart={<MiniLine values={sparkline.map((v) => v - 80)} />}
          accent="from-amber-500 to-orange-600"
        />
        <StatCard
          icon={FileText}
          title="Approved Claims"
          value={`${approvedClaims.length}`}
          hint="Timeline + tracking"
          onClick={() => navigate("/dashboard/claims")}
          chart={<MiniLine values={sparkline.map((v) => v - 60)} />}
          accent="from-indigo-600 to-blue-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">Policy distribution</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Split by category based on your purchases
              </div>
            </div>
            <Link to="/dashboard/policies" className="text-sm font-black text-blue-600 dark:text-blue-400">
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {["health-insurance", "car-insurance", "term-insurance", "travel-insurance"].map((slug) => {
              const count = purchases.filter((x) => getPolicyById(x.policyId)?.categorySlug === slug).length;
              return (
                <div key={slug} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{slug.replace("-", " ")}</div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{count}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {count ? "Active in portfolio" : "No policies yet"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">Quick actions</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Open policies, claims, payments, documents, or support
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { title: "File new claim", desc: "Guided 7-step workflow", to: "/dashboard/claims", icon: Sparkles },
              { title: "Download documents", desc: "Policy vault + KYC status", to: "/dashboard/documents", icon: FileText },
              { title: "Pay invoices", desc: "History + pending payments", to: "/dashboard/payments", icon: CreditCard },
            ].map((x) => {
              const Icon = x.icon;
              return (
                <button
                  key={x.to}
                  onClick={() => navigate(x.to)}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(2,6,23,0.10)] dark:border-white/10 dark:bg-white/5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Icon size={18} />
                    </span>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">Open</span>
                  </div>
                  <div className="mt-5 text-sm font-black text-slate-900 dark:text-slate-100">{x.title}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{x.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Reward points</div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{rewardPoints}</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600/10 px-4 py-3 text-xs font-black text-emerald-700 dark:text-emerald-300">
                <Sparkles size={16} />
                Loyalty benefits
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
