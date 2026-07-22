<<<<<<< HEAD
import { useMemo, useState, useEffect } from "react";
import { Bell, ShieldCheck, Sparkles } from "lucide-react";
import { load } from "../../utils/storage";
=======
import { useEffect, useMemo, useState } from "react";
import { Bell, Loader2, ShieldCheck, Sparkles } from "lucide-react";
>>>>>>> raj
import { apiRequest } from "../../utils/api";

// Notification titles, alert body text, and empty/default notification copy are generated here.
const DashboardNotifications = () => {
  const [purchases, setPurchases] = useState([]);
<<<<<<< HEAD
  const claims = useMemo(() => load("claims", []), []);
=======
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchasesRes, claimsRes] = await Promise.all([
          apiRequest("/api/purchases/my"),
          apiRequest("/api/claims/my"),
        ]);
        setPurchases(purchasesRes?.data || []);
        setClaims(claimsRes?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
>>>>>>> raj

  useEffect(() => {
    apiRequest("/api/user/my-policies")
      .then((res) => setPurchases(res.data || []))
      .catch((err) => console.error("Notifications error:", err));
  }, []);

  const items = useMemo(() => {
    const list = [];
    if (!purchases.length) {
      list.push({ type: "offer", title: "Welcome offer", body: "Explore Health Insurance plans with AI recommendations." });
    }
    purchases.slice(0, 3).forEach((p) => {
      const pNum = p.purchase_number || p.policyNumber || "Policy";
      list.push({
        type: "renewal",
        title: "Policy active",
<<<<<<< HEAD
        body: `Your policy ${pNum} is active. Documents are available in Documents Center.`,
=======
        body: `Your policy ${p.purchase_number} is active. Documents are available in Documents Center.`,
>>>>>>> raj
      });
    });

    claims.slice(0, 3).forEach((c) => {
      list.push({
        type: "claim",
        title: "Claim update",
        body: `Claim ${c.claim_number} status: ${c.claim_status}. Verification: ${c.ai_status || "Pending"}.`,
      });
    });
    list.push({
      type: "fraud",
      title: "Fraud alert monitor",
      body: "Agile Insurance monitors claim and policy activity for important account alerts.",
    });
    return list;
  }, [purchases, claims]);

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
              Notifications - Reminders - Account alerts
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Notifications</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Payment reminders, claim updates and AI suggestions.</p>
          </div>
          <span className="rounded-2xl bg-blue-600/10 px-5 py-4 text-sm font-black text-blue-700 dark:text-blue-300">
            {items.length} alerts
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        <div className="space-y-4">
          {items.map((n, idx) => (
            <div
              key={`${n.title}_${idx}`}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.2rem] sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                    <Bell size={16} className="text-blue-600 dark:text-blue-400" />
                    {n.title}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{n.body}</div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-2 text-xs font-black text-indigo-700 dark:text-indigo-300">
                  <Sparkles size={14} />
                  AI
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardNotifications;
