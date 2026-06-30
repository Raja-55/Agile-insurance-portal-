import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { apiRequest } from "../../utils/api";

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Renewal page headings, reminder text, and renewal action labels are controlled here.
const daysBetween = (a, b) => Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));

const DashboardRenewals = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/purchases/my");
      setPurchases(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const renewals = useMemo(() => {
    const now = new Date();
    return purchases
      .map((p) => {
        const policy = p.policy;
        if (!policy || !p.end_date) return null;
        const d = new Date(p.end_date);
        return { purchase: p, policy, days: daysBetween(now, d) };
      })
      .filter(Boolean)
      .sort((a, b) => a.days - b.days);
  }, [purchases]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Renewals - Reminders - One-click renew
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Renew policies</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Keep your coverage active with proactive renewals.</p>
          </div>
          <button
            onClick={fetchPurchases}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {!renewals.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
            <CalendarClock size={26} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900 dark:text-white">No renewals scheduled</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Buy a policy to see renewal reminders here.</p>
          <div className="mt-8">
            <Link
              to="/health-insurance"
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
            >
              Explore plans
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {renewals.map(({ purchase, policy, days }) => (
            <div
              key={purchase._id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-7"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Policy</div>
                  <div className="mt-2 truncate text-lg font-black text-slate-900 dark:text-white">{purchase.purchase_number}</div>
                  <div className="mt-1 truncate text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {policy.companyName} • {policy.policyName}
                  </div>
                </div>
                <span
                  className={[
                    "rounded-full px-4 py-2 text-xs font-black",
                    days <= 15 ? "bg-rose-600/10 text-rose-700 dark:text-rose-300" : "bg-blue-600/10 text-blue-700 dark:text-blue-300",
                  ].join(" ")}
                >
                  {days} days left
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Renewal date</div>
                  <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">
                    {new Date(purchase.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Coverage</div>
                  <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">{formatInr(policy.coverageAmount)}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
                <Link
                  to={`/policies/${policy._id}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm hover:opacity-95"
                >
                  Renew now
                </Link>
                <Link
                  to={`/policies/${policy._id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardRenewals;
