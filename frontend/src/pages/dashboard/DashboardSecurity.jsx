import { useState } from "react";
import { load, save } from "../../utils/storage";
import { KeyRound, Lock, ShieldCheck, Smartphone, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { apiRequest } from "../../utils/api";

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, text: "", color: "bg-slate-200" };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score, text: "Weak", color: "bg-rose-500", textClass: "text-rose-500" };
  if (score === 2 || score === 3) return { score, text: "Medium", color: "bg-amber-500", textClass: "text-amber-500" };
  return { score, text: "Strong", color: "bg-emerald-500", textClass: "text-emerald-500" };
};
// Security page headings, toggle labels, and linked-account copy are controlled here.
const DashboardSecurity = () => {
  const { user } = useAuth();
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false);
  const [bankLinked, setBankLinked] = useState(true);
  const [updating2FA, setUpdating2FA] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const updateStoredUser = (changes) => {
    const sessionKey = "agile_insurance_session_v1";
    const session = JSON.parse(localStorage.getItem(sessionKey) || "null");
    if (session) {
      const nextUser = { ...session.user, ...changes };
      localStorage.setItem(sessionKey, JSON.stringify({ user: nextUser }));
      window.dispatchEvent(new CustomEvent("agile-profile-updated", { detail: nextUser }));
    }
  };

  const handleToggle2FA = async () => {
    setUpdating2FA(true);
    setPassError("");
    setPassSuccess("");
    try {
      const targetState = !twoFactor;
      const res = await apiRequest("/api/auth/update-profile", {
        method: "PUT",
        body: JSON.stringify({ twoFactorEnabled: targetState }),
      });
      if (res?.success) {
        setTwoFactor(targetState);
        updateStoredUser({ twoFactorEnabled: targetState });
      }
    } catch (err) {
      setPassError(err.message || "Failed to update 2FA status.");
    } finally {
      setUpdating2FA(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (newPassword.length < 6) {
      return setPassError("New password must be at least 6 characters.");
    }
    if (newPassword !== confirmPassword) {
      return setPassError("New passwords do not match.");
    }

    setChangingPass(true);
    try {
      const res = await apiRequest("/api/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (res?.success) {
        setPassSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassError(res?.message || "Failed to change password.");
      }
    } catch (err) {
      setPassError(err.message || "Failed to change password.");
    } finally {
      setChangingPass(false);
    }
  };
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Security settings - Two-factor auth - Linked accounts
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Security</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Configure enhanced security for your insurance portal.</p>
          </div>
          <span className="rounded-2xl bg-blue-600/10 px-5 py-4 text-sm font-black text-blue-700 dark:text-blue-300">
            <Sparkles size={18} className="inline -mt-1 mr-2" />
            Enterprise-grade
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
            <Smartphone size={18} className="text-blue-600 dark:text-blue-400" />
            Two-factor authentication (2FA)
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Secure your login sessions with a 6-digit OTP code sent to your email.
          </div>
          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">2FA Status</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{twoFactor ? "Enabled" : "Disabled"}</div>
            </div>
            <button
               onClick={handleToggle2FA}
              disabled={updating2FA}
              className={[
                "w-full rounded-2xl px-6 py-3 text-sm font-black shadow-sm transition sm:w-auto flex items-center justify-center gap-2",
                twoFactor
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:hover:text-white dark:active:bg-white/20",
              ].join(" ")}
            >
               {updating2FA && <Loader2 size={16} className="animate-spin" />}
              {twoFactor ? "Disable 2FA" : "Enable 2FA"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
            <KeyRound size={18} className="text-blue-600 dark:text-blue-400" />
            Linked bank accounts
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Link accounts for claim payouts and premium auto-pay.
          </div>
          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">Bank account</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{bankLinked ? "Linked" : "Not linked"}</div>
            </div>
            <button
              onClick={() => setBankLinked(!bankLinked)}
              className={[
                "w-full rounded-2xl px-6 py-3 text-sm font-black shadow-sm transition sm:w-auto",
                bankLinked
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400 dark:hover:text-white dark:active:bg-blue-600"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/15 dark:hover:text-white dark:active:bg-white/20",
              ].join(" ")}
            >
              {bankLinked ? "Unlink" : "Link"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
          <Lock size={18} className="text-blue-600 dark:text-blue-400" />
          Change Password
        </div>


        <form onSubmit={handleChangePassword} className="mt-6 space-y-4 max-w-md">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Current Password</span>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="••••••••"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">New Password</span>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="••••••••"
            />
          </label>

          {/* Strength Indicator */}
          {newPassword && (
            <div className="space-y-1 px-1 max-w-md">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Password Strength:</span>
                <span className={`font-black ${getPasswordStrength(newPassword).textClass}`}>{getPasswordStrength(newPassword).text}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                  style={{ width: `${(getPasswordStrength(newPassword).score / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Confirm New Password</span>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="••••••••"
            />
          </label>

          {passError && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3 text-xs font-bold text-rose-600">
              {passError}
            </div>
          )}

          {passSuccess && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle size={14} />
              {passSuccess}
            </div>
          )}

          <button
            disabled={changingPass}
            type="submit"
            className="w-full sm:w-auto px-6 py-3 text-sm font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {changingPass && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </form>



      </div>
    </div>
  );
};

export default DashboardSecurity;
