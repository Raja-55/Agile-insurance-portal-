import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Lock, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../contexts/useAuth";
// import {registerUser, loginUser, logoutUser, getCurrentUser, updateProfile} from "../utils/api";

// Authentication screen copy, field labels, validation messages, and auth CTAs live in this file.
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const getSafeReturnTo = (value) => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/auth")) {
    return "/dashboard";
  }

  return value;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT_ID = "google-identity-services";

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.8l-6.5 5C9.4 39.6 16.1 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.3-4.1 5.6l6.2 5.2C36.9 39.3 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, login } = useAuth();
  const googleTokenClientRef = useRef(null);

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return getSafeReturnTo(params.get("returnTo"));
  }, [location.search]);

  // useEffect(() => {
  //   if (bootstrapped && isAuthenticated) {
  //     navigate(returnTo, { replace: true });
  //   }
  // }, [bootstrapped, isAuthenticated, navigate, returnTo]);

  const [mode, setMode] = useState("register");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  // Developer note: registration fields live here; keep these in sync with AuthContext.register().
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const resetMessaging = () => {
    setError("");
    setNotice("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    resetMessaging();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (mode === "register") {
      // Developer note: add validation for any future registration fields in this block.
      if (!trimmedName) return setError("Full Name is required.");
      if (!validateEmail(trimmedEmail)) return setError("Enter a valid email address.");
      if (!/^\d{10}$/.test(trimmedPhone)) return setError("Enter a valid 10-digit phone number.");
      if (!trimmedAddress) return setError("Address is required.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
      setBusy(true);
      try {
        const response = await register(
          {
             fullName: trimmedName,
             email: trimmedEmail, 
             phone: trimmedPhone, 
             address: trimmedAddress, 
             password });
        setNotice(response?.message || "Account created successfully.");
        navigate(returnTo, { replace: true });
      } catch (err) {
        setError(err?.message || "Registration failed.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!validateEmail(trimmedEmail)) return setError("Enter a valid email address.");
    if (!password) return setError("Password is required.");
    setBusy(true);
    try {
      await login({ email: trimmedEmail, password });
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  // const onGoogleAccessToken = async (response) => {
  //   resetMessaging();
  //   const accessToken = response?.access_token;
  //   if (!accessToken) {
  //     setError("Select a Google account to continue.");
  //     return;
  //   }
  //   setBusy(true);
  //   try {
  //     await googleLogin({ accessToken });
  //     navigate(returnTo, { replace: true });
  //   } catch (err) {
  //     setError(err?.message || "Google sign-in failed.");
  //   } finally {
  //     setBusy(false);
  //   }
  // };

  // useEffect(() => {
  //   if (!GOOGLE_CLIENT_ID) return;

  //   const initializeGoogleTokenClient = () => {
  //     if (!window.google?.accounts?.oauth2) return;
  //     googleTokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
  //       client_id: GOOGLE_CLIENT_ID,
  //       scope: "openid email profile",
  //       prompt: "select_account",
  //       callback: onGoogleAccessToken,
  //     });
  //   };

  //   const existing = document.getElementById(GOOGLE_SCRIPT_ID);
  //   if (existing) {
  //     initializeGoogleTokenClient();
  //     return;
  //   }

  //   const script = document.createElement("script");
  //   script.id = GOOGLE_SCRIPT_ID;
  //   script.src = "https://accounts.google.com/gsi/client";
  //   script.async = true;
  //   script.defer = true;
  //   script.onload = initializeGoogleTokenClient;
  //   script.onerror = () => setError("Could not load Google sign-in. Check your connection and try again.");
  //   document.head.appendChild(script);
  // }, []);

  // const onGoogleLogin = () => {
  //   resetMessaging();
  //   if (!googleTokenClientRef.current) {
  //     setError("Google sign-in is still loading. Please try again in a moment.");
  //     return;
  //   }
  //   googleTokenClientRef.current.requestAccessToken({ prompt: "select_account" });
  // };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setOtpStep(false);
    setOtp("");
    resetMessaging();
  };

  
  // if (bootstrapped && isAuthenticated) {
  //   return (
  //     <div className="grid min-h-[60vh] place-items-center bg-white px-4">
  //       <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
  //         <div className="h-2 w-28 animate-pulse rounded-full bg-slate-200" />
  //         <div className="mt-4 h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
  //         <div className="mt-3 h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      {/* Background decorative blur elements */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-24 h-[460px] w-[460px] rounded-full bg-indigo-600/10 blur-[120px]" />

      {/* Two-column layout: Auth card on left, Benefits card on right */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl sm:p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
                <ShieldCheck size={16} className="text-blue-600" />
                Secure access - OTP verified
              </div>
              <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {mode === "register" ? (otpStep ? "Verify your email" : "Create your account") : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                {otpStep
                  ? "Enter the 6-digit OTP sent to your email address to finish account verification."
                  : "Secure account creation and login connected to the backend API, with dashboard state and session restoration."}
              </p>
            </div>

          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {/* Developer note: add future account-create fields near this section and pass them to register(). */}
            {mode === "register" && !otpStep && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Full Name</span>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
                      placeholder="e.g. Aarav Sharma"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Phone Number</span>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
                      placeholder="10-digit number"
                      inputMode="numeric"
                    />
                  </div>
                </label>
              </div>
            )}

            {mode === "register" && !otpStep && (
              <label className="block space-y-2">
                <span className="text-xs font-semibold text-slate-700">Address</span>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
                    placeholder="House / street / city"
                  />
                </div>
              </label>
            )}

            {!otpStep && (
              <label className="block space-y-2">
                <span className="text-xs font-semibold text-slate-700">Email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
                    placeholder="you@company.com"
                  />
                </div>
              </label>
            )}

            {!otpStep && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Password</span>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-20 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                {mode === "register" ? (
                  <label className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700">Confirm Password</span>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-20 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-end justify-end">
                    <Link to="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>
            )}

            {mode === "register" && otpStep && (
              <label className="block space-y-2">
                <span className="text-xs font-semibold text-slate-700">Email verification OTP</span>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
                    placeholder="6-digit code"
                    inputMode="numeric"
                  />
                </div>
              </label>
            )}

            {notice && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {notice}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button
              disabled={busy}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-70"
            >
              {busy ? "Securing your portal..." : mode === "register" ? (otpStep ? "Verify OTP" : "Create Account") : "Login"}
            </button>

            {mode === "register" && otpStep && (
              <button
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  setOtp("");
                  resetMessaging();
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Edit registration details
              </button>
            )}

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              {/* {GOOGLE_CLIENT_ID ? (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-70"
                >
                  <GoogleLogo />
                  Continue with Google
                </button>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  Google sign-in needs VITE_GOOGLE_CLIENT_ID before users can select a Google account.
                </div>
              )
              
              } */}
            </div>

            <div className="text-center text-sm font-medium text-slate-600">
              {mode === "register" ? (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("login")} className="font-bold text-blue-600">
                    Login
                  </button>
                </>
              ) : (
                <>
                  New to Agile Insurance?{" "}
                  <button type="button" onClick={() => switchMode("register")} className="font-bold text-blue-600">
                    Create Account
                  </button>
                </>
              )}
            </div>
          </form>
        </motion.div>

        {/* Benefits and Features Card - Right Side */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="self-start rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 text-white shadow-lg sm:p-6"
        >
          {/* Header badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/90">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Agile Insurance - Trusted Protection
          </div>

          {/* Main heading */}
          <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
            Why Choose Agile Insurance?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Complete insurance solutions with verified protection, transparent pricing, and hassle-free claims processing.
          </p>

          {/* Features Grid */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { title: "Verified Email", desc: "Secure registration with OTP verification for account safety." },
              { title: "Wide Coverage", desc: "Insurance options for health, life, vehicle, travel, and business." },
              { title: "Fast Claims", desc: "Quick claim processing with transparent settlement process." },
              { title: "Expert Support", desc: "24/7 customer support team ready to assist you anytime." },
              { title: "Flexible Plans", desc: "Customizable insurance plans tailored to your needs." },
              { title: "Document Vault", desc: "Secure storage for all your insurance documents and policies." },
            ].map((x) => (
              <div key={x.title} className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                <div className="text-sm font-bold">{x.title}</div>
                <div className="mt-1 text-xs leading-5 text-white/70">{x.desc}</div>
              </div>
            ))}
          </div>

          {/* Insurance Benefits Section */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 text-base font-black">Insurance Benefits</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "✓ Premium protection at affordable rates",
                "✓ No hidden charges or surprise fees",
                "✓ Instant policy activation",
                "✓ Cashless hospital treatment",
                "✓ Claim settlement in 24-48 hours",
                "✓ Life-time renewal guaranteed",
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-white/80">
                  <span className="text-emerald-400 font-bold">{benefit.split("✓")[0]}✓</span>
                  <span>{benefit.split("✓")[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-xl font-black text-emerald-400">50K+</div>
              <div className="mt-1 text-xs text-white/70">Happy Customers</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-xl font-black text-blue-400">4.8/5</div>
              <div className="mt-1 text-xs text-white/70">Star Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
