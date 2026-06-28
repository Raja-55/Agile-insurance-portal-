// src/components/pages/Dashboard.jsx
import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Users, FileText, AlertTriangle, CheckCircle2, XCircle, MessageSquare, CreditCard, PieChart, LineChart, BarChart3, ShieldCheck, Clock } from "lucide-react";

import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from "recharts";
import { SectionTitle, MiniBars, LineSpark } from "../../components/admin/shared";
import { useAdminActions } from "../../hooks/useAdminActions";
import { apiRequest } from "../../utils/api";


const baseMetrics = [
  { label: "Total Users", icon: Users, tone: "bg-blue-600", page: "users" },
  { label: "Active Policies", icon: FileText, tone: "bg-emerald-600", page: "policies" },
  { label: "Pending Claims", icon: AlertTriangle, tone: "bg-amber-500", page: "claims" },
  { label: "Approved Claims", icon: CheckCircle2, tone: "bg-teal-600", page: "claims" },
  { label: "Rejected Claims", icon: XCircle, tone: "bg-rose-600", page: "claims" },
  { label: "Open Support Tickets", icon: MessageSquare, tone: "bg-violet-600", page: "support" },
  { label: "Revenue Generated", value: "INR 8.42 Cr", change: "+18.2%", icon: CreditCard, tone: "bg-indigo-600", page: "reports" },
];

const Dashboard = () => {
  const { openPage } = useAdminActions();
  const { selectedProfile } = useSelector((s) => s.auth);
  const claimRows = useSelector((s) => s.claims.rows);
  const userRows = useSelector((s) => s.users.rows);
  const planRows = useSelector((s) => s.policies.rows);
  const supportChats = useSelector((s) => s.support.chats);
  const [purchaseStats, setPurchaseStats] = useState({ totalPurchases: 0, totalRevenue: 0 });

  useEffect(() => {
    apiRequest("/api/admin/purchases", { useAdminToken: true })
      .then((res) => {
        if (res?.success && res?.data?.stats) {
          setPurchaseStats({
            totalPurchases: res.data.stats.totalPurchases,
            totalRevenue: res.data.stats.totalRevenue,
          });
        }
      })
      .catch((err) => console.error("Admin dashboard purchase stats load error:", err));
  }, []);

  const monthlyPolicySales = [
    { month: "Jan", sales: 55 },
    { month: "Feb", sales: 70 },
    { month: "Mar", sales: 45 },
    { month: "Apr", sales: 85 },
    { month: "May", sales: 60 },
    { month: "Jun", sales: 75 },
    { month: "Jul", sales: 50 },
    { month: "Aug", sales: 90 },
    { month: "Sep", sales: 65 },
    { month: "Oct", sales: 80 },
    { month: "Nov", sales: 70 },
    { month: "Dec", sales: 95 },
  ];

  const activeUsers = userRows.filter((u) => u.status === "Active").length;

  const metrics = useMemo(() => baseMetrics.map((m) => {
    if (m.label === "Total Users") return { ...m, value: String(userRows.length), change: `${activeUsers} active` };
    if (m.label === "Pending Claims") return { ...m, value: String(claimRows.filter((c) => c.status !== "Approved" && c.status !== "Rejected").length), change: "42 urgent" };
    if (m.label === "Approved Claims") return { ...m, value: String(claimRows.filter((c) => c.status === "Approved").length), change: "+15.7%" };
    if (m.label === "Rejected Claims") return { ...m, value: String(claimRows.filter((c) => c.status === "Rejected").length), change: "-2.3%" };
    if (m.label === "Open Support Tickets") return { ...m, value: String(supportChats.filter((c) => c.status !== "Resolved").length), change: `${supportChats.length} total` };
    if (m.label === "Active Policies") return { ...m, value: String(planRows.filter((p) => p.state === "Active").length), change: "+8.1%" };
    if (m.label === "Revenue Generated") return { ...m, value: `₹${purchaseStats.totalRevenue.toLocaleString("en-IN")}`, change: `${purchaseStats.totalPurchases} purchases` };
    return m;
  }), [userRows, claimRows, planRows, supportChats, activeUsers, purchaseStats]);


  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
              <ShieldCheck size={16} />Centralized admin control
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Insurance Admin Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
              Manage users, policies, claims, queries, requirements, document verification, notifications, reports, and operations from one console.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-950">Current Admin Profile</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">{selectedProfile.access}</div>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-sm font-black text-white">{selectedProfile.initials}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
              {["Email / Username", "Password", "Remember Me", "Forgot Password", "OTP 2FA"].map((l) => (
                <div key={l} className="rounded-lg border border-slate-200 bg-white px-3 py-2">{l}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metric cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => openPage(item.page)} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-lg ${item.tone} text-white`}><Icon size={18} /></span>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">{item.change}</span>
              </div>
              <div className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</div>
              <div className="mt-1 text-xl font-black text-slate-950">{item.value}</div>
            </button>
          );
        })}
      </section>

      {/* Charts */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={PieChart} title="Claims Status Overview" />
          <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr]">
            <div className="relative mx-auto aspect-square w-40 rounded-full" style={{ background: "conic-gradient(#2563eb 0 42%, #10b981 42% 70%, #ef4444 70% 84%, #f59e0b 84% 100%)" }}>
              <div className="absolute inset-6 grid place-items-center rounded-full bg-white text-center">
                <span className="text-2xl font-black">6.1K</span>
                <span className="-mt-3 text-[11px] font-bold text-slate-500">claims</span>
              </div>
            </div>
            <div className="space-y-3">
              {[["Pending", "42%", "bg-blue-600"], ["Approved", "28%", "bg-emerald-500"], ["Rejected", "14%", "bg-rose-500"], ["Verification", "16%", "bg-amber-500"]].map(([l, v, c]) => (
                <button key={l} onClick={() => openPage("claims")} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50">
                  <span className="flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${c}`} />{l}</span>
                  <span>{v}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={LineChart} title="Monthly Policy Sales" />

          <div className="mt-5 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={monthlyPolicySales}
               margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
              }}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Users} title="User Registration Trends" />
          <div className="mt-5"><LineSpark values={[30, 55, 40, 70, 50, 85, 60, 75, 45, 90, 65, 80]} color="#0f766e" /></div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={BarChart3} title="Claim Settlement Ratio" />
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[["Settled", "78%", "text-emerald-700"], ["In SLA", "91%", "text-blue-700"], ["Escalated", "6%", "text-rose-700"]].map(([l, v, c]) => (
              <button key={l} onClick={() => openPage("reports")} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center hover:bg-white">
                <div className={`text-2xl font-black ${c}`}>{v}</div>
                <div className="mt-1 text-xs font-bold text-slate-500">{l}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Support Tickets */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={MessageSquare} title="Recent Support Tickets & Updates" />
        <div className="mt-5 space-y-3">
          {supportChats.length === 0 ? (
            <div className="text-sm font-semibold text-slate-500 py-4">No support tickets raised yet.</div>
          ) : (
            supportChats.slice(0, 5).map((chat) => {
              const lastMessage = chat.messages?.[chat.messages.length - 1]?.text || "No messages yet";
              const lastMessageTime = chat.messages?.[chat.messages.length - 1]?.createdAt || chat.createdAt;
              const initials = chat.userName ? chat.userName.trim().split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() : "US";
              
              const priorityColors = {
                High: "bg-rose-50 text-rose-700 border-rose-200",
                Medium: "bg-amber-50 text-amber-700 border-amber-200",
                Low: "bg-slate-50 text-slate-700 border-slate-200",
              };
              
              const statusColors = {
                Open: "bg-blue-50 text-blue-700",
                "In Progress": "bg-indigo-50 text-indigo-700",
                Resolved: "bg-emerald-50 text-emerald-700",
              };

              return (
                <div
                  key={chat.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-600 text-sm font-black text-white">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{chat.userName}</span>
                        <span className="text-xs text-slate-400 font-semibold">{chat.userEmail}</span>
                        <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-[10px] font-black text-blue-700">
                          {chat.subject}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityColors[chat.priority] || priorityColors.Medium}`}>
                          {chat.priority} Priority
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${statusColors[chat.status] || statusColors.Open}`}>
                          {chat.status}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-slate-600 font-semibold truncate max-w-xl">
                        Message: <span className="font-bold text-slate-800">"{lastMessage}"</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <Clock size={12} />
                        {new Date(lastMessageTime).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openPage("support")}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    View Ticket
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
