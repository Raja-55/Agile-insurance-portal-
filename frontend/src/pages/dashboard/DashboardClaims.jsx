import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  FileUp,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { load, save, uid } from "../../utils/storage";
import { chance } from "../../utils/ids";
import { useAuth } from "../../contexts/useAuth";
import { useState, useEffect } from "react";
import { apiRequest } from "../../utils/api";


// Claim flow step names, status labels, and form labels are controlled here.
const claimSteps = [
  "Select claim type",
  "Fill smart form",
  "Upload documents",
  "AI document verification",
  "Claim review process",
  "Live status tracking",
  "Final approval/rejection",
];

const statusPalette = {
  Draft: "bg-slate-600/10 text-slate-700 dark:text-slate-200",
  Pending: "bg-amber-600/10 text-amber-700 dark:text-amber-300",
  "AI Verification": "bg-blue-600/10 text-blue-700 dark:text-blue-300",
  Reviewing: "bg-amber-600/10 text-amber-700 dark:text-amber-300",
  Approved: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
  Rejected: "bg-rose-600/10 text-rose-700 dark:text-rose-300",
};

const DashboardClaims = () => {
  const { user } = useAuth();
  const readMyClaims = () => {
    const allClaims = load("claims", []);
    if (!user?.id) return allClaims;
    return allClaims.filter((claim) => !claim.userId || claim.userId === user.id);
  };
  const [claims, setClaims] = useState(readMyClaims);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    type: "Health",
    description: "",
    amount: "",
    docName: "",
  });
  const [features, setFeatures] = useState(null);

  useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await apiRequest("/api/admin/settings");
      const settings = response?.data;

      setFeatures(settings?.features || {});
    } catch (error) {
      console.error("Failed to load features:", error);
    }
  };

  fetchSettings();
}, []);
  const createClaim = () => {
    setForm({ type: "Health", description: "", amount: "", docName: "" });
    setStep(0);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const next = () => setStep((s) => Math.min(claimSteps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    if (!form.description.trim()) return window.alert("Please add a claim description.");
    if (!String(form.amount).trim()) return window.alert("Please enter claim amount.");
    if (!form.docName.trim()) return window.alert("Please upload supporting documents.");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    const now = new Date().toISOString();
    const all = load("claims", []);
    all.unshift({
      id: uid("claim"),
      userId: user?.id || "",
      user: user?.fullName || "Customer",
      email: user?.email || "",
      type: form.type,
      policy: form.type,
      description: form.description.trim(),
      amount: Number(form.amount) || 0,
      docName: form.docName,
      status: "Pending",
      aiStatus: "Pending",
      createdAt: now,
      timeline: [
        { at: now, label: "Claim filed" },
        { at: now, label: "Documents uploaded" },
        { at: now, label: "Sent to claims team" },
      ],
      progress: 2,
    });
    save("claims", all);
    setBusy(false);
    setOpen(false);
    setClaims(readMyClaims());
  };

  const runAi = async (id) => {
    const all = load("claims", []);
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    all[idx] = { ...all[idx], aiStatus: "Verifying..." };
    save("claims", all);
    setClaims(readMyClaims());
    await new Promise((r) => setTimeout(r, 900));
    const approved = !chance(0.18);
    const now = new Date().toISOString();
    const status = approved ? "Reviewing" : "Rejected";
    const timeline = [...(all[idx].timeline || []), { at: now, label: approved ? "AI verification passed" : "AI flagged anomaly" }];
    all[idx] = {
      ...all[idx],
      status,
      aiStatus: approved ? "Verified" : "Flagged",
      progress: approved ? 5 : 7,
      timeline,
    };
    save("claims", all);
    setClaims(readMyClaims());
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Claim management - Document review - Status tracking
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Claims</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">File new claims and track progress end-to-end.</p>
          </div>
          <button
            onClick={createClaim}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
          >
            File New Claim
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">Existing claims</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Your submitted claims and latest admin decisions
              </div>
            </div>
            <span className="rounded-full bg-blue-600/10 px-4 py-2 text-xs font-black text-blue-700 dark:text-blue-300">
              {claims.length} total
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {!claims.length ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center dark:border-white/10 dark:bg-white/5">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
                  <Sparkles size={26} />
                </div>
                <div className="mt-6 text-xl font-black text-slate-900 dark:text-white">No claims yet</div>
                <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  File your first claim to start review and track every status update.
                </div>
              </div>
            ) : (
              claims.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.2rem] sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Claim ID</div>
                      <div className="mt-2 truncate text-lg font-black text-slate-900 dark:text-white">{c.id}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {c.type} - INR {Number(c.amount || 0).toLocaleString("en-IN")} - {c.description}
                      </div>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-xs font-black ${statusPalette[c.status] || statusPalette.Draft}`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">AI verification</div>
                      <div className="mt-1 font-black">{c.aiStatus || "Pending"}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Progress</div>
                      <div className="mt-1 font-black">{c.progress || 1}/7</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Created</div>
                      <div className="mt-1 font-black">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
                    {c.status === "AI Verification" ? (
                      <button
                        onClick={() => runAi(c.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:opacity-95"
                      >
                        <Bot size={16} />
                        Run AI verification
                      </button>
                    ) : null}
                    <button
                      onClick={() => setClaims(readMyClaims())}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    >
                      Refresh Status
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
            <div className="text-sm font-black text-slate-900 dark:text-slate-100"></div>
            <div className="mt-4 space-y-3">
              {claimSteps.map((s, idx) => (
                <div key={s} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600/10 text-xs font-black text-blue-700 dark:text-blue-300">
                    {idx + 1}
                  </span>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 text-white shadow-[0_40px_120px_rgba(2,6,23,0.35)] dark:border-white/10 sm:rounded-[2.6rem] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black">
              <Timer size={18} />
              Review status
            </div>
            <div className="mt-3 text-sm font-semibold text-white/70">
              Claim officers verify documents, coverage, and payment eligibility before posting a decision.
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm font-semibold text-white/80">
              Tip: Upload clear, readable documents to improve AI confidence.
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto max-h-[calc(100vh-1.5rem)] w-full max-w-2xl overflow-auto rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0B1020] sm:max-h-[calc(100vh-2rem)] sm:rounded-[2.6rem]"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 dark:border-white/10 dark:bg-white/5">
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">File New Claim</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                    Step {step + 1} of {claimSteps.length}: {claimSteps[step]}
                  </div>
                </div>
                <button onClick={close} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {step === 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Select claim type</div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {["Health", "Car", "Life", "Travel", "Home", "Business"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setForm((p) => ({ ...p, type: t }))}
                          className={[
                            "rounded-2xl border px-5 py-4 text-left text-sm font-black shadow-sm transition",
                            form.type === t
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100",
                          ].join(" ")}
                        >
                          {t} Claim
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Fill smart form</div>
                    <label className="block space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Description</span>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                        placeholder="Describe the incident and claim details..."
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Claim amount (INR)</span>
                      <input
                        value={form.amount}
                        onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value.replace(/[^\d]/g, "").slice(0, 8) }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                        inputMode="numeric"
                        placeholder="e.g. 25000"
                      />
                    </label>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Upload documents</div>
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
                      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <div className="text-sm font-black text-slate-900 dark:text-white">Upload bills, FIR, photos</div>
                          <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            Attach supporting documents for review.
                          </div>
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:opacity-95">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setForm((p) => ({ ...p, docName: e.target.files?.[0]?.name ?? "" }))}
                          />
                          <FileUp size={18} />
                          Choose file
                        </label>
                      </div>
                      {form.docName ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                          Selected: <span className="font-black">{form.docName}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {step >= 3 ? (
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                        <Bot size={18} className="text-blue-600 dark:text-blue-400" />
                        Verification preview
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        The claims team checks document clarity, duplicates, coverage, and mismatch risk.
                      </div>
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {["Document clarity: High", "Mismatch risk: Low", "Fraud signals: None", "Estimated approval: 82%"].map((t) => (
                          <div key={t} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/5 sm:px-6 sm:py-5">
                <button
                  onClick={back}
                  disabled={step === 0 || busy}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                >
                  Back
                </button>
                {step < claimSteps.length - 1 ? (
                  <button
                    onClick={next}
                    disabled={busy}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-black text-white shadow-sm hover:opacity-95 disabled:opacity-70"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={busy}
                    className="rounded-2xl bg-emerald-600 px-7 py-3 text-sm font-black text-white shadow-sm hover:opacity-95 disabled:opacity-70"
                  >
                    {busy ? "Submitting..." : "Submit claim"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default DashboardClaims;
