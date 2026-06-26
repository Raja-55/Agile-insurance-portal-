import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CreditCard, Download, ShieldCheck, Sparkles, Wallet, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { load, save } from "../../utils/storage";
import { apiRequest } from "../../utils/api";


const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Payment page headings, invoice labels, autopay text, and chart labels are controlled here.
const DashboardPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autopay, setAutopay] = useState(() => load("autopay", { enabled: true }).enabled);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/api/user/my-policies");
      const list = res.data || [];
      const extracted = list
        .map((p) => {
          if (!p.payment) return null;
          return {
            ...p.payment,
            id: p.payment._id || p.payment.id,
            invoiceNumber: p.payment.invoice_number || "—",
            purchaseId: p.purchase_number || p.policyNumber || p._id || p.id,
            createdAt: p.payment.paid_at || p.payment.createdAt || p.createdAt,
            method: p.payment.payment_method || p.payment.method || "upi",
            status: p.payment.payment_status === "success" ? "Success" : "Pending",
            amount: p.payment.final_amount || p.payment.amount || 0,
          };
        })
        .filter(Boolean);
      setPayments(extracted);
    } catch (err) {
      console.error("Failed to load user payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const yearly = useMemo(() => {
    const base = new Array(12).fill(0);
    payments.forEach((p) => {
      const d = new Date(p.createdAt || 0);
      base[d.getMonth()] += Number(p.amount || 0);
    });
    const max = Math.max(...base, 1);
    return { base, max };
  }, [payments]);


  const toggleAutopay = () => {
    const next = !autopay;
    setAutopay(next);
    save("autopay", { enabled: next });
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
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading payment history…</p>
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
              Payment history - Secure gateway - EMI options
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Payments</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Track invoices, auto-pay, and yearly analytics.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
            <button
              onClick={toggleAutopay}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-sm font-black shadow-sm transition",
                autopay
                  ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10",
              ].join(" ")}
            >
              <Wallet size={18} />
              Auto-pay {autopay ? "On" : "Off"}
            </button>
            <Link
              to="/health-insurance"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
            >
              <CreditCard size={18} />
              Pay premium
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">Yearly insurance expenses</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Monthly payment breakdown</div>
            </div>
            <span className="rounded-full bg-blue-600/10 px-4 py-2 text-xs font-black text-blue-700 dark:text-blue-300">
              {payments.length} payments
            </span>
          </div>

          <div className="mt-6 grid grid-cols-12 items-end gap-2">
            {yearly.base.map((v, i) => (
              <div key={i} className="col-span-1">
                <div
                  className="w-full rounded-2xl bg-gradient-to-t from-blue-600 to-indigo-600"
                  style={{ height: `${Math.max(10, (v / yearly.max) * 140)}px` }}
                  title={`${i + 1}: ${formatInr(v)}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Total spent</div>
              <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                {formatInr(payments.reduce((s, p) => s + Number(p.amount || 0), 0))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 text-white shadow-[0_40px_120px_rgba(2,6,23,0.35)] dark:border-white/10 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-bold text-white/70">Secure payment gateway</div>
              <div className="mt-2 text-2xl font-black tracking-tight">PCI-DSS security messaging</div>
              <div className="mt-2 text-sm font-semibold text-white/70">
                Trust badges, encryption hints, and fraud checks are simulated to feel enterprise-ready.
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-black">
              <Sparkles size={16} />
              Premium UX
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { t: "Encryption", d: "Tokenized payments" },
              { t: "Fraud checks", d: "AI risk scan simulation" },
              { t: "EMI plans", d: "Available on select policies" },
              { t: "Instant receipts", d: "Invoice download" },
            ].map((x) => (
              <div key={x.t} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-black">{x.t}</div>
                <div className="mt-2 text-sm font-semibold text-white/70">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">Payment history</div>
            <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Download invoices</div>
          </div>
          <button
            onClick={fetchPayments}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          >
            Refresh
          </button>

        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10">
          <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr_0.8fr] bg-slate-50 px-5 py-3 text-xs font-black text-slate-700 dark:bg-white/5 dark:text-slate-200">
            <div>Invoice</div>
            <div>Date</div>
            <div>Method</div>
            <div>Status</div>
            <div className="text-right">Amount</div>
          </div>
          {!payments.length ? (
            <div className="px-5 py-10 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
              No payments yet. Buy a policy to generate payment history.
            </div>
          ) : (
            payments.slice(0, 12).map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr_0.8fr] items-center gap-4 border-t border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.alert("Invoice download is being prepared.")}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300"
                  >
                    <Download size={18} />
                  </button>
                  <div className="min-w-0">
                    <div className="truncate font-black text-slate-900 dark:text-slate-100">{p.invoiceNumber}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">{p.purchaseId}</div>
                  </div>
                </div>
                <div>{new Date(p.createdAt).toLocaleString()}</div>
                <div className="uppercase text-slate-500 dark:text-slate-400">{p.method}</div>
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                    <BadgeCheck size={14} />
                    {p.status}
                  </span>
                </div>
                <div className="text-right font-black text-slate-900 dark:text-slate-100">{formatInr(p.amount)}</div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPayments;
