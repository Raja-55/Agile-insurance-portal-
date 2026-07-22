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
  ArrowUpRight,
  ChevronRight,
  Wallet,
  Activity
} from "lucide-react";
import { load } from "../../utils/storage";
import { getPolicyById } from "../../data/catalog";
import { useAuth } from "../../contexts/useAuth";
import { apiRequest } from "../../utils/api";

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rawPurchases, setRawPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
<<<<<<< HEAD
        const res = await apiRequest("/api/user/my-policies");
=======
        // const res = await apiRequest("/api/user/my-policies");
        const res = await apiRequest("/api/user/purchases");
>>>>>>> raj
        setRawPurchases(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const purchases = useMemo(() => rawPurchases.map(p => ({
    ...p,
    id: p._id || p.id,
    status: p.purchase_status || "active",
    amount: p.payment?.final_amount || 0,
    renewalAt: p.end_date,
    policyNumber: p.purchase_number
  })), [rawPurchases]);

  const activePolicies = purchases.filter((p) => p.status === "active");
  const totalInvestment = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const claims = useMemo(() => load("claims", []), []);
  const approvedClaims = claims.filter((c) => c.status === "Approved");
  const upcomingRenewals = purchases.filter(p => p.renewalAt).slice(0, 2);
  const rewardPoints = Math.round(totalInvestment / 800);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">

      {/* HEADER SECTION: Clean & Minimal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Analytics <span className="text-slate-400">/</span> {user?.fullName?.split(' ')[0] || "Overview"}
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Your coverage is 84% optimized. <span className="text-blue-600 cursor-pointer">View Insights</span></p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Live Market Rates</span>
          </div>
        </div>
      </div>

      {/* MAIN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: PRIMARY DATA (8 Units) */}
        <div className="lg:col-span-8 space-y-6">

          {/* THE WEALTH CARD (High Impact) */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl md:p-10">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Total Portfolio Value</p>
                <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  Institutional Grade
<<<<<<< HEAD
                </div>
              </div>
              <h2 className="mt-4 text-5xl font-black tracking-tighter sm:text-6xl">
                {formatInr(totalInvestment)}
              </h2>
              <div className="mt-10 flex flex-wrap gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Active Policies</p>
                  <p className="text-xl font-black">{activePolicies.length}</p>
                </div>
                <div className="h-10 w-px bg-slate-700/50 hidden sm:block" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Claims Settled</p>
                  <p className="text-xl font-black">{approvedClaims.length}</p>
                </div>
                <div className="h-10 w-px bg-slate-700/50 hidden sm:block" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Loyalty Points</p>
                  <p className="text-xl font-black text-emerald-400">{rewardPoints} <span className="text-[10px] text-slate-400">PTS</span></p>
                </div>
              </div>
            </div>
            {/* Background design elements to look 'Human Made' */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 p-4 opacity-10">
              <ShieldCheck size={180} />
            </div>
          </div>

          {/* SECONDARY STATS: 3-column row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Activity size={20} />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">Health Score</p>
              <p className="text-2xl font-black text-slate-900">92 <span className="text-xs text-slate-400">/ 100</span></p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CreditCard size={20} />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">Pending Dues</p>
              <p className="text-2xl font-black text-slate-900">02 <span className="text-xs text-slate-400">Invoices</span></p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgeCheck size={20} />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">KYC Status</p>
              <p className="text-2xl font-black text-slate-900">Verified</p>
            </div>
          </div>

          {/* POLICY LISTING / CATEGORIES */}
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900">Portfolio Breakdown</h3>
              <Link to="/dashboard/policies" className="text-xs font-black text-blue-600 uppercase tracking-widest">Manage All</Link>
            </div>
            <div className="space-y-3">
              {["Health", "Auto", "Term", "Travel"].map(cat => (
                <div key={cat} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-sm font-black text-slate-800">{cat} Insurance</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-slate-500">{purchases.filter(p => p.categorySlug?.includes(cat.toLowerCase())).length} Active</span>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              ))}
=======
                </div>
              </div>
              <h2 className="mt-4 text-5xl font-black tracking-tighter sm:text-6xl">
                {formatInr(totalInvestment)}
              </h2>
              <div className="mt-10 flex flex-wrap gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Active Policies</p>
                  <p className="text-xl font-black">{activePolicies.length}</p>
                </div>
                <div className="h-10 w-px bg-slate-700/50 hidden sm:block" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Claims Settled</p>
                  <p className="text-xl font-black">{approvedClaims.length}</p>
                </div>
                <div className="h-10 w-px bg-slate-700/50 hidden sm:block" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Loyalty Points</p>
                  <p className="text-xl font-black text-emerald-400">{rewardPoints} <span className="text-[10px] text-slate-400">PTS</span></p>
                </div>
              </div>
            </div>
            {/* Background design elements to look 'Human Made' */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 p-4 opacity-10">
              <ShieldCheck size={180} />
>>>>>>> raj
            </div>
          </div>

          {/* SECONDARY STATS: 3-column row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Activity size={20} />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">Health Score</p>
              <p className="text-2xl font-black text-slate-900">92 <span className="text-xs text-slate-400">/ 100</span></p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CreditCard size={20} />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">Pending Dues</p>
              <p className="text-2xl font-black text-slate-900">02 <span className="text-xs text-slate-400">Invoices</span></p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgeCheck size={20} />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">KYC Status</p>
              <p className="text-2xl font-black text-slate-900">Verified</p>
            </div>
          </div>

          {/* POLICY LISTING / CATEGORIES */}
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900">Portfolio Breakdown</h3>
              <Link to="/dashboard/policies" className="text-xs font-black text-blue-600 uppercase tracking-widest">Manage All</Link>
            </div>
            <div className="space-y-3">



            {["Health", "Auto", "Term", "Travel"].map(cat => (
  <div key={cat} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100">
    <div className="flex items-center gap-4">
      <div className="h-2 w-2 rounded-full bg-blue-600" />
      <span className="text-sm font-black text-slate-800">{cat} Insurance</span>
    </div>
    <div className="flex items-center gap-6">
      <span className="text-xs font-bold text-slate-500">
        {purchases.filter(p =>
          (p.policy?.category || "").toLowerCase().includes(cat.toLowerCase())
        ).length} Active
      </span>
      <ChevronRight size={16} className="text-slate-300" />
    </div>
  </div>
))}



            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION SIDEBAR (4 Units) */}
        <div className="lg:col-span-4 space-y-6">

          {/* QUICK ACTION TILES */}
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => navigate("/dashboard/claims")}
              className="group flex items-center justify-between rounded-3xl bg-blue-600 p-6 text-left text-white transition hover:bg-blue-700 shadow-xl shadow-blue-900/10"
            >
              <div>
                <p className="text-lg font-black tracking-tight">File a Claim</p>
                <p className="text-xs font-medium text-blue-100/80 mt-1">Instant 7-step digital filing</p>
              </div>
              <div className="rounded-full bg-white/20 p-2 transition group-hover:rotate-45">
                <ArrowUpRight size={20} />
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard/documents")}
              className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:border-blue-200 shadow-sm"
            >
              <div>
                <p className="text-lg font-black tracking-tight text-slate-900">Document Vault</p>
                <p className="text-xs font-bold text-slate-400 mt-1">Policy PDFs & KYC Records</p>
              </div>
              <FileText size={20} className="text-slate-300 group-hover:text-blue-600" />
            </button>
          </div>

          {/* UPCOMING EVENTS FEED */}
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={18} className="text-blue-600" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Timeline</h3>
            </div>
            <div className="space-y-6">
              {upcomingRenewals.length > 0 ? upcomingRenewals.map(u => (
                <div key={u.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-amber-400">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Renewal Pending</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{u.policyNumber}</p>
                  <p className="text-xs font-bold text-blue-600 mt-2 cursor-pointer hover:underline">Complete Payment →</p>
                </div>
              )) : (
                <p className="text-xs font-bold text-slate-400 italic">No upcoming alerts for this month.</p>
              )}
            </div>
          </div>

          {/* PROMO CARD */}
          <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-800 p-8 text-white shadow-lg">
            <Sparkles className="text-blue-200 mb-4" size={28} />
            <h4 className="text-xl font-black leading-tight">Unlock AI Shortlisting</h4>
            <p className="mt-2 text-xs font-medium text-blue-100 opacity-80 leading-relaxed">
              Add one more policy to your portfolio to unlock the Agile AI automatic shortlisting feature.
            </p>
            <button
              onClick={() => navigate('/health-insurance')}
              className="mt-6 w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50"
            >
              Explore Marketplace
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTION SIDEBAR (4 Units) */}
        <div className="lg:col-span-4 space-y-6">

          {/* QUICK ACTION TILES */}
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => navigate("/dashboard/claims")}
              className="group flex items-center justify-between rounded-3xl bg-blue-600 p-6 text-left text-white transition hover:bg-blue-700 shadow-xl shadow-blue-900/10"
            >
              <div>
                <p className="text-lg font-black tracking-tight">File a Claim</p>
                <p className="text-xs font-medium text-blue-100/80 mt-1">Instant 7-step digital filing</p>
              </div>
              <div className="rounded-full bg-white/20 p-2 transition group-hover:rotate-45">
                <ArrowUpRight size={20} />
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard/documents")}
              className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:border-blue-200 shadow-sm"
            >
              <div>
                <p className="text-lg font-black tracking-tight text-slate-900">Document Vault</p>
                <p className="text-xs font-bold text-slate-400 mt-1">Policy PDFs & KYC Records</p>
              </div>
              <FileText size={20} className="text-slate-300 group-hover:text-blue-600" />
            </button>
          </div>

          {/* UPCOMING EVENTS FEED */}
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={18} className="text-blue-600" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Timeline</h3>
            </div>
            <div className="space-y-6">
              {upcomingRenewals.length > 0 ? upcomingRenewals.map(u => (
                <div key={u.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-amber-400">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Renewal Pending</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{u.policyNumber}</p>
                  <p className="text-xs font-bold text-blue-600 mt-2 cursor-pointer hover:underline">Complete Payment →</p>
                </div>
              )) : (
                <p className="text-xs font-bold text-slate-400 italic">No upcoming alerts for this month.</p>
              )}
            </div>
          </div>

          {/* PROMO CARD */}
          <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-800 p-8 text-white shadow-lg">
            <Sparkles className="text-blue-200 mb-4" size={28} />
            <h4 className="text-xl font-black leading-tight">Unlock AI Shortlisting</h4>
            <p className="mt-2 text-xs font-medium text-blue-100 opacity-80 leading-relaxed">
              Add one more policy to your portfolio to unlock the Agile AI automatic shortlisting feature.
            </p>
            <button
              onClick={() => navigate('/health-insurance')}
              className="mt-6 w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50"
            >
              Explore Marketplace
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;