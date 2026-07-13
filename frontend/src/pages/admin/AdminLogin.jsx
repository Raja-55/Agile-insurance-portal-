// src/components/pages/AdminLogin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Lock,
  Smartphone,
  ChevronDown,
  Search,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { apiRequest, saveAdminSession } from "../../utils/api";
import { useAdminActions } from "../../hooks/useAdminActions";

// Color tokens per role so newly created roles still get a sane fallback color.
const ROLE_COLORS = {
  "Super Admin": "from-violet-500 to-fuchsia-500",
  "Insurance Manager": "from-blue-500 to-cyan-500",
  "Claims Officer": "from-amber-500 to-orange-500",
  "Support Executive": "from-emerald-500 to-teal-500",
};
const FALLBACK_GRADIENT = "from-slate-500 to-slate-700";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "AD";

const roleGradient = (role) => ROLE_COLORS[role] || FALLBACK_GRADIENT;

const AdminLogin = () => {
  const { handleLogin } = useAdminActions();

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [rosterError, setRosterError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRoster = async () => {
    setLoadingAdmins(true);
    setRosterError("");
    try {
      // Public, unauthenticated endpoint — returns only safe fields
      // (_id, fullName, role, email, profilePhoto, isActive). No token needed,
      // since nobody is logged in yet at this point.
      const res = await apiRequest("/api/admin/auth/public-roster", {
        method: "GET",
      });
      const list = (res?.data || []).filter((a) => a.isActive !== false);
      setAdmins(list);
      setSelectedId((prev) => prev || list[0]?._id || null);
    } catch (err) {
      setRosterError(
        err?.message ||
          "Could not load admin roster. You can still enter your Admin ID manually."
      );
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const selectedAdmin = useMemo(
    () => admins.find((a) => a._id === selectedId) || null,
    [admins, selectedId]
  );

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        a.fullName?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
    );
  }, [admins, search]);

  // Manual fallback (used if roster fetch fails / admin types ID directly)
  const [manualEmail, setManualEmail] = useState("");
  const loginEmail = selectedAdmin?.email || manualEmail;

  const onSubmitLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginEmail.trim()) {
      setError("Please select an admin profile or enter an Admin ID.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (otpEnabled && otp.trim().length !== 6) {
      setError("Enter the 6-digit OTP code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail.trim(),
          password,
          ...(otpEnabled ? { otp: otp.trim() } : {}),
        }),
      });
      if (res?.success && res?.data?.token) {
        const profile = saveAdminSession(res.data.token, res.data.admin);
        handleLogin(profile, res.data.token);
      } else {
        setError(res?.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-slate-200 backdrop-blur">
            <ShieldCheck size={14} className="text-blue-400" />
            Agile Insurance Admin
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Verify your credentials to open the admin workspace.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <form onSubmit={onSubmitLogin} className="space-y-4">
            {/* Profile picker */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Admin Profile / Role
                </span>
                <button
                  type="button"
                  onClick={fetchRoster}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300"
                >
                  <RefreshCw size={12} className={loadingAdmins ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  className="flex h-14 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-left transition hover:border-white/20"
                >
                  {loadingAdmins ? (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                      <Loader2 size={16} className="animate-spin" />
                      Loading roster…
                    </span>
                  ) : selectedAdmin ? (
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-xs font-black text-white ${roleGradient(
                          selectedAdmin.role
                        )}`}
                      >
                        {getInitials(selectedAdmin.fullName)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-white">
                          {selectedAdmin.fullName}
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-400">
                          {selectedAdmin.role}
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">
                      {rosterError ? "Roster unavailable — enter ID manually" : "Select an admin"}
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition ${pickerOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {pickerOpen && !loadingAdmins && admins.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
                    <div className="border-b border-white/10 p-2">
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                          autoFocus
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search name, role, or email"
                          className="h-9 w-full rounded-lg bg-white/5 pl-8 pr-3 text-xs font-semibold text-white outline-none placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1.5">
                      {filteredAdmins.length === 0 && (
                        <div className="px-3 py-4 text-center text-xs font-semibold text-slate-500">
                          No matching admins.
                        </div>
                      )}
                      {filteredAdmins.map((a) => (
                        <button
                          key={a._id}
                          type="button"
                          onClick={() => {
                            setSelectedId(a._id);
                            setPickerOpen(false);
                            setSearch("");
                            setError("");
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                            selectedId === a._id ? "bg-blue-500/15" : "hover:bg-white/5"
                          }`}
                        >
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-xs font-black text-white ${roleGradient(
                              a.role
                            )}`}
                          >
                            {getInitials(a.fullName)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-white">
                              {a.fullName}
                            </span>
                            <span className="block truncate text-xs font-semibold text-slate-400">
                              {a.role}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {rosterError && (
                <p className="mt-2 flex items-start gap-1.5 text-[11px] font-semibold text-amber-400">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  {rosterError}
                </p>
              )}
            </div>

            {/* Admin ID */}
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                Admin ID
              </span>
              <div className="relative mt-2">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                {selectedAdmin ? (
                  <input
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm font-bold text-white outline-none"
                    value={selectedAdmin.email}
                    readOnly
                  />
                ) : (
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="admin@agileinsure.in"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                  />
                )}
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                Password
              </span>
              <div className="relative mt-2">
                <KeyRound
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-16 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-black text-blue-400 hover:bg-white/10"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {/* 2FA */}
            <div className="rounded-xl border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => setOtpEnabled((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <span className="inline-flex items-center gap-2 text-sm font-black text-slate-200">
                  <Smartphone size={18} className="text-slate-400" />
                  Two-Factor Authentication
                </span>
                <span
                  className={`text-xs font-black ${
                    otpEnabled ? "text-emerald-400" : "text-blue-400"
                  }`}
                >
                  {otpEnabled ? "Enabled" : "Enable OTP"}
                </span>
              </button>
              {otpEnabled && (
                <div className="border-t border-white/10 px-4 py-3">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                    OTP Code
                  </span>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-black tracking-[0.4em] text-white outline-none placeholder:text-slate-600"
                    maxLength={6}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300">
                {error}
              </div>
            )}

            <button
              disabled={submitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-black text-white shadow-lg shadow-blue-900/30 transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Lock size={18} />
              )}
              {submitting
                ? "Verifying…"
                : `Login${selectedAdmin ? ` as ${selectedAdmin.role}` : ""}`}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-slate-500">
          New admin accounts can only be created by a Super Admin from System Settings.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;