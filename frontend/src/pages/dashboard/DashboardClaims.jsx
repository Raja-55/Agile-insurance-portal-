import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  FileUp,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
  PhoneCall,
  Send,
  CheckCircle2,
  Clock,
  PlusCircle,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  Check,
} from "lucide-react";
import { load, save, uid } from "../../utils/storage";
import { chance } from "../../utils/ids";
import { useAuth } from "../../contexts/useAuth";
import { apiRequest } from "../../utils/api";

const claimSteps = [
  "Select claim type",
  "Fill smart form",
  "Upload documents",
  "AI review preview",
];

const statusPalette = {
  Draft: "bg-slate-600/10 text-slate-700 dark:text-slate-200",
  Pending: "bg-amber-600/10 text-amber-700 dark:text-amber-300",
  "AI Verification": "bg-blue-600/10 text-blue-700 dark:text-blue-300",
  Reviewing: "bg-amber-600/10 text-amber-700 dark:text-amber-300",
  Approved: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
  Rejected: "bg-rose-600/10 text-rose-700 dark:text-rose-300",
};

const supportAgents = [
  "Agent Rajesh K.",
  "Agent Priya M.",
  "Agent Vikram S.",
  "Agent Neha D.",
  "Agent Amit P.",
];

const DashboardClaims = () => {
  const { user } = useAuth();

  // Claims state (loaded from local storage)
  const readMyClaims = () => {
    const allClaims = load("claims", []);
    if (!user?.id) return allClaims;
    return allClaims.filter((claim) => !claim.userId || claim.userId === user.id);
  };
  const [claims, setClaims] = useState(readMyClaims);

  // Tabs state: 'file' | 'track' | 'support' (Default highlighted: 'file')
  const [activeTab, setActiveTab] = useState("file");

  // Claim Filing Stepper Form
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    type: "Health",
    description: "",
    amount: "",
    docName: "",
    incidentDate: new Date().toISOString().split("T")[0],
    location: "",
  });

  // Claim Support States
  const [agentName, setAgentName] = useState(supportAgents[0]);
  const [sessionCode, setSessionCode] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "Claim issue",
    priority: "Medium",
    message: "",
  });
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketStatus, setTicketStatus] = useState("");

  const [features, setFeatures] = useState(null);

  // Generate support credentials
  const generateSupportCode = () => {
    const randAgent = supportAgents[Math.floor(Math.random() * supportAgents.length)];
    const randCode = `AG-CLAIM-${Math.floor(100000 + Math.random() * 900000)}`;
    setAgentName(randAgent);
    setSessionCode(randCode);
  };

  useEffect(() => {
    generateSupportCode();
  }, []);

  // Fetch admin settings & user raised tickets
  const fetchSettings = async () => {
    try {
      const response = await apiRequest("/api/admin/settings");
      setFeatures(response?.data?.features || {});
    } catch (error) {
      console.error("Failed to load features:", error);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await apiRequest("/api/support/tickets");
      if (res?.data) {
        setTickets(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchTickets();
  }, [user]);

  // Stepper functions
  const next = () => setStep((s) => Math.min(claimSteps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  // Submit Claim
  const submitClaim = async () => {
    if (!form.description.trim()) return window.alert("Please add a claim description.");
    if (!String(form.amount).trim()) return window.alert("Please enter the claim amount.");
    if (!form.docName.trim()) return window.alert("Please upload supporting documents.");
    setBusy(true);

    await new Promise((r) => setTimeout(r, 1200));

    const now = new Date().toISOString();
    const all = load("claims", []);
    const newClaim = {
      id: `CLM-${Date.now().toString().slice(-6)}`,
      userId: user?.id || "",
      user: user?.fullName || "Customer",
      email: user?.email || "",
      type: form.type,
      policy: form.type,
      description: form.description.trim(),
      amount: Number(form.amount) || 0,
      docName: form.docName,
      incidentDate: form.incidentDate,
      location: form.location.trim() || "Online",
      status: "AI Verification",
      aiStatus: "Pending",
      createdAt: now,
      timeline: [
        { at: now, label: "Claim filed successfully" },
        { at: now, label: "Documents uploaded and received" },
        { at: now, label: "Queued for automated verification" },
      ],
      progress: 3,
    };

    all.unshift(newClaim);
    save("claims", all);
    setClaims(readMyClaims());

    // Reset Form
    setForm({
      type: "Health",
      description: "",
      amount: "",
      docName: "",
      incidentDate: new Date().toISOString().split("T")[0],
      location: "",
    });
    setStep(0);
    setBusy(false);

    // Switch to tracking tab automatically
    setActiveTab("track");
    window.alert("Claim submitted successfully! Check status below.");
  };

  // Run AI Verification Simulation
  const runAi = async (id) => {
    const all = load("claims", []);
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;

    all[idx] = { ...all[idx], aiStatus: "Verifying..." };
    save("claims", all);
    setClaims(readMyClaims());

    await new Promise((r) => setTimeout(r, 1000));

    const approved = !chance(0.15);
    const now = new Date().toISOString();
    const status = approved ? "Reviewing" : "Rejected";
    const timeline = [
      ...(all[idx].timeline || []),
      { at: now, label: approved ? "AI scan passed: No fraud signals" : "AI scan flagged anomalies" },
    ];

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

  // Raise support ticket
  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.message.trim()) {
      return window.alert("Please write a support message.");
    }
    setBusy(true);
    setTicketStatus("");

    try {
      const res = await apiRequest("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: ticketForm.subject,
          priority: ticketForm.priority,
          message: ticketForm.message.trim(),
        }),
      });

      if (res?.success) {
        setTicketStatus("Ticket raised successfully! It is now visible in the Admin panel.");
        setTicketForm({
          subject: "Claim issue",
          priority: "Medium",
          message: "",
        });
        fetchTickets(); // Refresh tickets list
      } else {
        setTicketStatus("Failed to submit ticket. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setTicketStatus("Error submitting ticket to backend.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Redesigned Premium Claim Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Claim Management Center
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Claims Portal</h1>
            <p className="text-slate-600 dark:text-slate-300">
              File new claims, monitor verification milestones, and access instant customer support.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/5 dark:bg-white/5 text-center">
              <div className="text-xs font-bold text-slate-500">Active Claims</div>
              <div className="text-lg font-black text-slate-950 dark:text-white">
                {claims.filter((c) => c.status !== "Approved" && c.status !== "Rejected").length}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/5 dark:bg-white/5 text-center">
              <div className="text-xs font-bold text-slate-500">Settled Claims</div>
              <div className="text-lg font-black text-emerald-600">
                {claims.filter((c) => c.status === "Approved").length}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-white/5">
          {/* File New Claim Tab (Highly Highlighted) */}
          <button
            onClick={() => setActiveTab("file")}
            className={`flex flex-col items-center justify-center py-4 px-6 rounded-xl transition-all duration-300 text-center ${
              activeTab === "file"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black scale-[1.02]"
                : "text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300 font-semibold"
            }`}
          >
            <PlusCircle size={20} className={activeTab === "file" ? "text-white mb-1" : "text-blue-500 mb-1"} />
            <span className="text-sm">File New Claim</span>
            <span className={`text-[10px] ${activeTab === "file" ? "text-blue-100" : "text-slate-400"} hidden sm:inline`}>
              AI-Assisted Stepper Form
            </span>
          </button>

          {/* Track Existing Claim Tab */}
          <button
            onClick={() => setActiveTab("track")}
            className={`flex flex-col items-center justify-center py-4 px-6 rounded-xl transition-all duration-300 text-center ${
              activeTab === "track"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-md font-black"
                : "text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300 font-semibold"
            }`}
          >
            <Clock size={20} className="mb-1 text-indigo-500" />
            <span className="text-sm">Track Existing Claim</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {claims.length} Total Claims Listed
            </span>
          </button>

          {/* Claim Support Tab */}
          <button
            onClick={() => setActiveTab("support")}
            className={`flex flex-col items-center justify-center py-4 px-6 rounded-xl transition-all duration-300 text-center ${
              activeTab === "support"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-md font-black"
                : "text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300 font-semibold"
            }`}
          >
            <HelpCircle size={20} className="mb-1 text-emerald-500" />
            <span className="text-sm">Claim Support</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Hotline & Ticket Raising
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        
        {/* Left Side: Dynamic Tab Pages */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            
            {/* FILE NEW CLAIM TAB */}
            {activeTab === "file" && (
              <motion.div
                key="file-claim"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-white/5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Submit New Claim Request</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      Step {step + 1} of {claimSteps.length}: {claimSteps[step]}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {claimSteps.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-2 w-8 rounded-full transition-all ${
                          idx === step
                            ? "bg-blue-600 w-12"
                            : idx < step
                            ? "bg-emerald-500"
                            : "bg-slate-200 dark:bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="py-6 min-h-[300px]">
                  
                  {/* Step 1: Select claim type */}
                  {step === 0 && (
                    <div className="space-y-4">
                      <div className="text-sm font-black text-slate-800 dark:text-slate-200">Select Claim Insurance Category</div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {["Health", "Car", "Life", "Travel", "Home", "Business"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setForm((p) => ({ ...p, type: t }))}
                            className={`rounded-2xl border p-5 text-left transition-all relative ${
                              form.type === t
                                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 font-black shadow-sm ring-1 ring-blue-500"
                                : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 font-semibold"
                            }`}
                          >
                            <span className="text-base block">{t} Claim</span>
                            <span className="text-[10px] text-slate-400 block mt-1">File under {t} policies</span>
                            {form.type === t && (
                              <Check size={14} className="absolute top-4 right-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Fill smart form */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="text-sm font-black text-slate-800 dark:text-slate-200">Provide Claim Information</div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block space-y-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Incident Date</span>
                          <div className="relative">
                            <input
                              type="date"
                              value={form.incidentDate}
                              onChange={(e) => setForm((p) => ({ ...p, incidentDate: e.target.value }))}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                            />
                          </div>
                        </label>
                        <label className="block space-y-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Incident Location / Facility Name</span>
                          <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                            placeholder="e.g. City General Hospital, wagholi junction"
                          />
                        </label>
                      </div>

                      <label className="block space-y-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Claim Amount (INR)</span>
                        <input
                          value={form.amount}
                          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value.replace(/[^\d]/g, "").slice(0, 8) }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                          inputMode="numeric"
                          placeholder="Enter estimated reimbursement or damage amount..."
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Incident Description</span>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                          className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                          placeholder="Provide specific details about the loss/event..."
                        />
                      </label>
                    </div>
                  )}

                  {/* Step 3: Upload documents */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="text-sm font-black text-slate-800 dark:text-slate-200">Upload Supporting Proof of Loss</div>
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                          <div className="p-4 rounded-full bg-blue-50 dark:bg-white/5 text-blue-600 dark:text-blue-400">
                            <FileUp size={36} />
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">Upload PDFs, bills, or medical summary</div>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                              Upload the itemized receipts, discharge logs, or accident evidence here (Max 5MB per file).
                            </p>
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-black text-white shadow-sm hover:opacity-95">
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => setForm((p) => ({ ...p, docName: e.target.files?.[0]?.name ?? "" }))}
                            />
                            Choose PDF / File
                          </label>
                          {form.docName && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-600" />
                              Selected File: <span className="font-black">{form.docName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: AI verification preview */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                          <Bot size={18} className="text-blue-600 dark:text-blue-400" />
                          AI Fraud & Document Scanning Preview
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Your submission will undergo automated verification. Ensure documents are clear to avoid flags.
                        </p>
                        
                        <div className="mt-6 border-t border-slate-200 dark:border-white/5 pt-5 space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                            <div className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-white/5 dark:bg-white/5">
                              <span className="text-slate-400 block mb-0.5">Insurance Category</span>
                              <span className="text-slate-800 dark:text-white">{form.type} Claim</span>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-white/5 dark:bg-white/5">
                              <span className="text-slate-400 block mb-0.5">Claim Amount</span>
                              <span className="text-slate-800 dark:text-white">INR {Number(form.amount || 0).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-white/5 dark:bg-white/5">
                              <span className="text-slate-400 block mb-0.5">Attached Document</span>
                              <span className="text-slate-800 dark:text-white truncate block">{form.docName || "None"}</span>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-white/5 dark:bg-white/5">
                              <span className="text-slate-400 block mb-0.5">Claim Window Status</span>
                              <span className="text-emerald-600 font-bold">Safe (Within 48h)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Stepper Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/5">
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
                      className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-black text-white shadow-sm hover:opacity-95"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={submitClaim}
                      disabled={busy}
                      className="rounded-2xl bg-emerald-600 px-7 py-3 text-sm font-black text-white shadow-sm hover:opacity-95 disabled:opacity-70"
                    >
                      {busy ? "Submitting Request..." : "File Claim"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* TRACK EXISTING CLAIM TAB */}
            {activeTab === "track" && (
              <motion.div
                key="track-claims"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-white/5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Existing Claims & Milestones</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      Monitor submitted claim files and trigger AI verification checks.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {claims.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center dark:border-white/10 dark:bg-white/5">
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
                        <Sparkles size={26} />
                      </div>
                      <div className="mt-6 text-xl font-black text-slate-900 dark:text-white">No claims filed yet</div>
                      <p className="mt-2 text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                        Head over to the "File New Claim" tab to submit your first insurance claim request.
                      </p>
                    </div>
                  ) : (
                    claims.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 sm:p-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Claim ID: {c.id}</div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                              {c.type} Insurance Reimbursement
                            </h3>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                              Amount: <span className="font-bold text-slate-800 dark:text-white">INR {Number(c.amount || 0).toLocaleString("en-IN")}</span> | Status: {c.description}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-4 py-2 text-xs font-black ${
                              statusPalette[c.status] || statusPalette.Draft
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        {/* Extra Claim Fields */}
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-semibold">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                            <span className="text-slate-400 block mb-0.5">Incident Date</span>
                            <span className="text-slate-800 dark:text-white font-bold">{c.incidentDate || "N/A"}</span>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                            <span className="text-slate-400 block mb-0.5">Location</span>
                            <span className="text-slate-800 dark:text-white font-bold truncate block">{c.location || "N/A"}</span>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                            <span className="text-slate-400 block mb-0.5">AI Verification</span>
                            <span className="text-slate-800 dark:text-white font-bold block">{c.aiStatus || "Pending"}</span>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                            <span className="text-slate-400 block mb-0.5">Milestone Status</span>
                            <span className="text-slate-800 dark:text-white font-bold block">{c.progress || 1} / 7 Steps</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 dark:border-white/5 pt-4">
                          {c.status === "AI Verification" && (
                            <button
                              onClick={() => runAi(c.id)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-black text-white hover:opacity-95 shadow-sm shadow-blue-500/10"
                            >
                              <Bot size={14} />
                              Run AI Verification Scan
                            </button>
                          )}
                          <button
                            onClick={() => setClaims(readMyClaims())}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                          >
                            Refresh Status
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* CLAIM SUPPORT TAB */}
            {activeTab === "support" && (
              <motion.div
                key="support"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Support Main Cards Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  
                  {/* Human Support Hotline Callout */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-white/5 dark:text-blue-300 shrink-0">
                        <PhoneCall size={24} />
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Human Claims Support</h3>
                        <p className="text-xs font-semibold text-slate-500">Connect directly with a dedicated surveyor</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/5 dark:bg-white/5 space-y-4">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Ask a claims support officer to review your policy details or clarify document requirements.
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Dedicated Agent</div>
                        <div className="text-base font-black text-slate-900 dark:text-white">{agentName}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Support Hotline</div>
                        <a href="tel:+917972657424" className="text-xl font-black text-blue-600 dark:text-blue-400 hover:underline">
                          +91 79726 57424
                        </a>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Authorization Ref Code</div>
                        <div className="text-sm font-black bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 w-fit px-3 py-1.5 rounded-lg font-mono">
                          {sessionCode}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={generateSupportCode}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 w-full"
                    >
                      <RefreshCw size={14} />
                      Generate New Support Code
                    </button>
                  </div>

                  {/* Ticket Raising Form */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-white/5 dark:text-emerald-300 shrink-0">
                        <PlusCircle size={24} />
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Raise Claim Support Ticket</h3>
                        <p className="text-xs font-semibold text-slate-500">Trackable issue resolution via Admin dashboard</p>
                      </div>
                    </div>

                    <form onSubmit={handleRaiseTicket} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inquiry Subject</span>
                          <select
                            value={ticketForm.subject}
                            onChange={(e) => setTicketForm((p) => ({ ...p, subject: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="Claim issue">Claim issue</option>
                            <option value="Policy support">Policy support</option>
                            <option value="Payment issue">Payment issue</option>
                            <option value="Document verification">Document verification</option>
                            <option value="Complaint">Complaint</option>
                          </select>
                        </label>

                        <label className="block space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ticket Priority</span>
                          <select
                            value={ticketForm.priority}
                            onChange={(e) => setTicketForm((p) => ({ ...p, priority: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </label>
                      </div>

                      <label className="block space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Support Request Message</span>
                        <textarea
                          rows={3}
                          value={ticketForm.message}
                          onChange={(e) => setTicketForm((p) => ({ ...p, message: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          placeholder="Describe the claim issue or ticket details..."
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={busy || !ticketForm.message.trim()}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50 w-full"
                      >
                        <Send size={14} />
                        {busy ? "Submitting Ticket..." : "Submit Support Ticket"}
                      </button>

                      {ticketStatus && (
                        <p className="text-xs font-bold text-center text-blue-600 dark:text-blue-400 mt-2">{ticketStatus}</p>
                      )}
                    </form>
                  </div>
                </div>

                {/* Users Active Tickets */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
                  <div className="text-sm font-black text-slate-900 dark:text-white mb-4">Your Active Support Tickets</div>
                  
                  <div className="space-y-3">
                    {loadingTickets ? (
                      <div className="text-center py-6 text-xs text-slate-500">Loading active tickets...</div>
                    ) : tickets.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No support tickets raised yet. Fill the form above if you need help.
                      </div>
                    ) : (
                      tickets.map((t) => (
                        <div
                          key={t._id || t.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t.subject}</span>
                              <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                                {t.priority} Priority
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate max-w-lg">
                              Last Message: {t.messages?.[t.messages.length - 1]?.text || "No messages"}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black bg-emerald-50 dark:bg-emerald-950/10 text-emerald-700 px-3 py-1.5 rounded-lg">
                              Status: {t.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Side: Informative Panels */}
        <div className="space-y-6">
          
          {/* Universal 48-Hour Claim Window Reminder */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-950/20 dark:bg-amber-950/5 sm:rounded-[2.6rem] sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-amber-800 dark:text-amber-400">
              <AlertTriangle size={18} />
              The 48-Hour Claim Window
            </div>
            <p className="text-xs font-semibold text-amber-700/80 dark:text-amber-400/85 leading-relaxed">
              Insurance companies may reject claims reported later than 48–72 hours after the covered incident occurred. 
              <strong> File your claim fast</strong> to prevent delays or rejection.
            </p>
          </div>

          {/* AI Scanner Capabilities Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <Bot size={18} className="text-blue-600 dark:text-blue-400" />
              Agile AI Claim Auditing
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
              Our automated claim auditor matches uploaded files against policies to scan for details:
            </p>
            <ul className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span>Cross-checks hospital admission/discharge date against logs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span>Audits vehicle repair estimates against surveyor standard catalogs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span>Matches beneficiary account data with bank IFSC signatures.</span>
              </li>
            </ul>
          </div>

          {/* Legal Warning Panel */}
          <div className="rounded-3xl border border-red-200 bg-red-50/50 p-5 dark:border-red-950/20 dark:bg-red-950/5 sm:rounded-[2.6rem] sm:p-8 space-y-3 text-center">
            <div className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center justify-center gap-1">
              <Info size={14} />
              Fraud Disclaimer
            </div>
            <p className="text-[11px] font-semibold text-red-600/90 leading-relaxed">
              Submitting forged receipts, duplicate billing, or inflated estimates constitutes fraud. 
              Violations result in policy cancellation and claim rejection.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardClaims;
