<<<<<<< HEAD
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Calendar, Download, ExternalLink, RefreshCw, ShieldCheck, Loader2 } from "lucide-react";
import { getPolicyById } from "../../data/catalog";
import { load, save, uid } from "../../utils/storage";
import { makeInvoiceNumber } from "../../utils/ids";
import { apiRequest } from "../../utils/api";
import { normalizeBackendPolicy } from "../CheckoutPage";

=======
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Calendar, Download, ExternalLink, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { apiRequest } from "../../utils/api";
>>>>>>> raj

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// My Policies screen labels, renewal button text, and policy table/card copy are managed here.
const daysBetween = (a, b) => Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));

const DashboardPolicies = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/api/user/my-policies");
      setPurchases(res.data || []);
    } catch (err) {
      console.error("Failed to load user policies:", err);
=======
  const [renewingId, setRenewingId] = useState(null);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/purchases/my");
      setPurchases(res?.data || []);
    } catch (err) {
      console.error(err);
>>>>>>> raj
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const enriched = useMemo(
    () =>
      purchases
        .map((p) => {
<<<<<<< HEAD
          let policy = null;
          if (p.policy && typeof p.policy === "object") {
            policy = normalizeBackendPolicy(p.policy);
          } else {
            policy = getPolicyById(p.policyId);
          }
          if (!policy) return null;
          
          const uiPurchase = {
            ...p,
            id: p._id || p.id,
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
          };

          const renewalAt = uiPurchase.renewalAt ? new Date(uiPurchase.renewalAt) : null;
=======
          const policy = p.policy;
          if (!policy) return null;
          const renewalAt = p.end_date ? new Date(p.end_date) : null;
>>>>>>> raj
          const remainingDays = renewalAt ? daysBetween(new Date(), renewalAt) : null;
          return { purchase: uiPurchase, policy, remainingDays };
        })
        .filter(Boolean),
    [purchases],
  );

<<<<<<< HEAD
  const renew = async (purchaseId) => {
    window.alert("Renewal request processed successfully. Premium paid via auto-pay.");
  };


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
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your policies…</p>
=======
  // Renewal currently re-runs the same purchase flow on the backend (extends
  // the policy by another billing cycle and records a fresh payment).
  const renew = async (policyId) => {
    setRenewingId(policyId);
    try {
      window.alert("To renew, please complete checkout again for this policy from the plan page.");
      navigate(`/policies/${policyId}`);
    } finally {
      setRenewingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
>>>>>>> raj
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
              My Policies • Manage renewals & downloads
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Policy management</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">All your active policies in one place.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
            <Link
              to="/health-insurance"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
            >
              Add a policy
            </Link>
            <button
              onClick={fetchPurchases}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {!enriched.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
            <BadgeCheck size={26} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900 dark:text-white">No active policies yet</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Explore plans and purchase a policy to see it here.</p>
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {enriched.map(({ purchase, policy, remainingDays }) => (
            <motion.div
              key={purchase._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.4rem]"
            >
              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Policy number</div>
                    <div className="mt-2 truncate text-lg font-black text-slate-900 dark:text-white">
                      {purchase.purchase_number}
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {policy.companyName} • {policy.policyName}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-600/10 px-3 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                    {purchase.purchase_status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Coverage</div>
                    <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">{formatInr(policy.coverageAmount)}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Premium</div>
                    <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">{formatInr(policy.premiumAmount)}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Renewal date</div>
                    <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">
                      {purchase.end_date ? new Date(purchase.end_date).toLocaleDateString() : "—"}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Remaining validity</div>
                    <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">
                      {remainingDays != null ? `${remainingDays} days` : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    onClick={() => window.alert("Policy document is being prepared.")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={() => navigate(`/policies/${policy._id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                  >
                    <ExternalLink size={16} />
                    Details
                  </button>
                  <button
                    onClick={() => renew(policy._id)}
                    disabled={renewingId === policy._id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-sm hover:opacity-95 disabled:opacity-70"
                  >
                    <Calendar size={16} />
                    Renew
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPolicies;
