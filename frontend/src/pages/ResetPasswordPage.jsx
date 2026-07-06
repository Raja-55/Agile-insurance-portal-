import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Lock, Loader2, KeyRound } from "lucide-react";
import { apiRequest } from "../utils/api";

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

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const type = searchParams.get("type"); // 'user' or 'admin'

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      return setError("Invalid or missing reset token.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setSubmitting(true);
    try {
      const endpoint = type === "admin" ? "/api/admin/auth/reset-password" : "/api/auth/reset-password";
      const res = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      if (res?.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          if (type === "admin") {
            navigate("/admin");
          } else {
            navigate("/auth?mode=login");
          }
        }, 3000);
      } else {
        setError(res?.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[500px] w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <KeyRound size={24} />
        </div>
        <h1 className="mt-4 text-xl font-black text-slate-900">Set New Password</h1>
        <p className="mt-1.5 text-xs text-slate-500">
          Set a secure, strong password for your {type === "admin" ? "Admin" : "User"} account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* New Password */}
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-slate-700">New Password</span>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-20 text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Password Strength:</span>
              <span className={`font-black ${getPasswordStrength(password).textClass}`}>{getPasswordStrength(password).text}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                style={{ width: `${(getPasswordStrength(password).score / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-slate-700">Confirm Password</span>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-20 text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3 text-xs font-bold text-rose-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs font-bold text-emerald-600">
            {success}
          </div>
        )}

        <button
          disabled={submitting}
          type="submit"
          className="w-full py-4 text-sm font-bold text-white rounded-2xl transition shadow-sm bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={18} />}
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;