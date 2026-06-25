import { useState } from "react";
import { KeyRound, Lock, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { load, save } from "../../utils/storage";

// Security page headings, toggle labels, and linked-account copy are controlled here.
const DashboardSecurity = () => {
  const [twoFactor, setTwoFactor] = useState(() => load("security", { twoFactor: false }).twoFactor);
  const [bankLinked, setBankLinked] = useState(() => load("security", { bankLinked: true }).bankLinked ?? true);

  const update = (next) => {
    setTwoFactor(next.twoFactor);
    setBankLinked(next.bankLinked);
    save("security", next);
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
            Toggle 2FA to simulate secure login verification.
          </div>
          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">2FA Status</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{twoFactor ? "Enabled" : "Disabled"}</div>
            </div>
            <button
              onClick={() => update({ twoFactor: !twoFactor, bankLinked })}
              className={[
                "w-full rounded-2xl px-6 py-3 text-sm font-black shadow-sm transition sm:w-auto",
                twoFactor
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:hover:text-white dark:active:bg-white/20",
              ].join(" ")}
            >
              {twoFactor ? "Disable" : "Enable"}
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
              onClick={() => update({ twoFactor, bankLinked: !bankLinked })}
              className={[
                "w-full rounded-2xl px-6 py-3 text-sm font-black shadow-sm transition sm:w-auto",
                bankLinked ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100",
              ].join(" ")}
            >
              {bankLinked ? "Unlink" : "Link"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 text-white shadow-[0_40px_120px_rgba(2,6,23,0.35)] dark:border-white/10 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex items-center gap-2 text-sm font-black">
          <Lock size={18} />
          Change password
        </div>
        <div className="mt-2 text-sm font-semibold text-white/70">
          Password changes should be completed from the secure account service.
        </div>
      </div>
    </div>
  );
};

export default DashboardSecurity;
