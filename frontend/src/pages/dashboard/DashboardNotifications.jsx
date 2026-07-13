import { useEffect, useState } from "react";
import { Bell, Loader2, ShieldCheck, CheckCheck, FileText, ClipboardCheck, Headphones } from "lucide-react";
import { apiRequest } from "../../utils/api";

const TYPE_ICON = {
  document: FileText,
  claim: ClipboardCheck,
  support: Headphones,
  system: Bell,
};

const TYPE_LABEL = {
  document: "Document",
  claim: "Claim",
  support: "Support",
  system: "Account",
};

const DashboardNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest("/api/notifications/my");
      setNotifications(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiRequest("/api/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

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
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Updates from Agile Insurance on your documents, claims, and support tickets. We also text these to your registered phone number.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="rounded-2xl bg-blue-600/10 px-5 py-4 text-sm font-black text-blue-700 dark:text-blue-300">
              {unreadCount} unread
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300"
              >
                <CheckCheck size={14} />
                {markingAll ? "Marking..." : "Mark all as read"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        {notifications.length === 0 ? (
          <div className="grid h-40 place-items-center text-center">
            <div>
              <Bell size={24} className="mx-auto text-slate-300" />
              <div className="mt-2 text-sm font-black text-slate-600 dark:text-slate-300">No notifications yet</div>
              <div className="mt-1 text-xs font-semibold text-slate-400">
                Updates on your documents, claims, and support tickets will show up here.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || Bell;
              return (
                <button
                  key={n._id}
                  onClick={() => !n.read && markAsRead(n._id)}
                  className={`w-full rounded-3xl border p-5 text-left shadow-sm transition sm:rounded-[2.2rem] sm:p-6 ${
                    n.read
                      ? "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                      : "border-blue-200 bg-blue-50 dark:border-blue-400/30 dark:bg-blue-400/10"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                        <Icon size={16} className="text-blue-600 dark:text-blue-400" />
                        {n.title}
                        {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{n.body}</div>
                      <div className="mt-2 text-xs font-semibold text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-2 text-xs font-black text-indigo-700 dark:text-indigo-300">
                      {TYPE_LABEL[n.type] || "Update"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardNotifications;