import { useState, useEffect, useMemo } from "react";
import { CreditCard, ShoppingBag, TrendingUp, RefreshCw } from "lucide-react";
import { SectionTitle, DataTable } from "../../components/admin/shared";
import { apiRequest } from "../../utils/api";
import { useAdminActions } from "../../hooks/useAdminActions";

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const PurchasesPage = () => {
  const { panel } = useAdminActions();
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({ totalPurchases: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/api/admin/purchases", { useAdminToken: true });
      if (res?.success && res?.data) {
        setPurchases(res.data.purchases || []);
        setStats(res.data.stats || { totalPurchases: 0, totalRevenue: 0 });
        panel("Purchases Refreshed", `${(res.data.purchases || []).length} purchases loaded.`);
      }
    } catch (err) {
      console.error("Failed to load purchases:", err);
      panel("Error", err.message || "Failed to load purchases from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const rows = useMemo(() => {
    return purchases.map((p) => ({
      id: p._id || p.id,
      purchasenumber: p.purchase_number || p.policyNumber || "—",
      buyer: p.user?.fullName || "—",
      email: p.user?.email || "—",
      policy: p.policy?.policyName || "—",
      company: p.policy?.companyName || "—",
      date: p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : "—",
      amount: p.payment ? formatInr(p.payment.final_amount) : "—",
      method: p.payment?.payment_method?.toUpperCase() || "—",
      paymentstatus: p.payment?.payment_status === "success" ? "Success" : "Pending",
      policystatus: p.purchase_status === "active" ? "Active" : p.purchase_status || "Active",
    }));
  }, [purchases]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white">
              <ShoppingBag size={18} />
            </span>
          </div>
          <div className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Total Purchases</div>
          <div className="mt-1 text-2xl font-black text-slate-950">{stats.totalPurchases}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-600 text-white">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Total Revenue</div>
          <div className="mt-1 text-2xl font-black text-slate-950">{formatInr(stats.totalRevenue)}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-600 text-white">
              <CreditCard size={18} />
            </span>
          </div>
          <div className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Recent Purchases (This Month)</div>
          <div className="mt-1 text-2xl font-black text-slate-950">{purchases.length}</div>
        </div>
      </section>

      {/* Main Table */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle
          icon={CreditCard}
          title="Purchase & Checkout Reports"
          action={
            <button
              onClick={fetchPurchases}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Reports
            </button>
          }
        />

        {loading ? (
          <div className="py-10 text-center text-sm font-semibold text-slate-500">
            Loading purchases and sales reports...
          </div>
        ) : (
          <DataTable
            columns={[
              "Purchase Number",
              "Buyer",
              "Email",
              "Policy",
              "Company",
              "Date",
              "Amount",
              "Method",
              "Payment Status",
              "Policy Status",
            ]}
            rows={rows}
          />
        )}
      </section>
    </div>
  );
};

export default PurchasesPage;
