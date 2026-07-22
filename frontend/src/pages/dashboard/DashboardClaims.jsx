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

  // Claims state – loaded from backend
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);

  // Purchased policies state
  const [userPurchases, setUserPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // Dynamic form fields state
  const [dynamicFields, setDynamicFields] = useState([]);

  // Tabs state: 'file' | 'track' | 'support'
  const [activeTab, setActiveTab] = useState("file");

  // Claim Filing Stepper Form
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    purchaseId: "",
    type: "Health",
    description: "",
    amount: "",
    docName: "",
    incidentDate: new Date().toISOString().split("T")[0],
    location: "",
    claim_data: {},
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

  // Chat/Support and Cloudinary Upload states
  const [activeChatTicket, setActiveChatTicket] = useState(null);
  const [userReplyText, setUserReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [features, setFeatures] = useState(null);

  // --- Normalise a backend Claim document → frontend display shape ---
  const normaliseBackendClaim = (c) => {
    const claimStat = c.claim_status || c.status || "pending";
    const normalStatus =
      claimStat.toLowerCase() === "pending" || claimStat.toLowerCase() === "submitted" ? "Pending" :
      claimStat.toLowerCase() === "reviewing" ? "Reviewing" :
      claimStat.toLowerCase() === "approved"  ? "Approved"  :
      claimStat.toLowerCase() === "rejected"  ? "Rejected"  : "Pending";

    return {
      id:           c.claim_number || c._id,
      _mongoId:     c._id,
      userId:       c.user,
      type:         c.claim_type,
      policy:       c.policy?.policyName || c.claim_type,
      description:  c.claim_reason || c.description,
      amount:       c.claim_amount || c.amount || 0,
      docName:      c.doc_name || "",
      incidentDate: c.incident_date
        ? new Date(c.incident_date).toISOString().split("T")[0]
        : "",
      location:     c.location || "",
      status:       normalStatus,
      aiStatus:
        c.ai_status === "verified" ? "Verified" :
        c.ai_status === "flagged"  ? "Flagged"  : "Pending",
      createdAt: c.createdAt,
      timeline:  c.timeline || [],
      progress:  c.timeline?.length || 1,
    };
  };

  // Fetch user's purchased policies
  const fetchUserPurchases = async () => {
    setLoadingPurchases(true);
    try {
      const res = await apiRequest("/api/user/purchases");
      if (res?.data) {
        setUserPurchases(res.data);
      }
    } catch (err) {
      console.error("Failed to load user policies:", err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // Fetch user's claims from backend
  const fetchMyClaims = async () => {
    setLoadingClaims(true);
    try {
      const res = await apiRequest("/api/claims/my");
      if (res?.data) {
        setClaims(res.data.map(normaliseBackendClaim));
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoadingClaims(false);
    }
  };

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
      // const res = await apiRequest("/api/user/support");
      const res = await apiRequest("/api/support/support-tickets");
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
    fetchMyClaims();
    fetchUserPurchases();
  }, [user]);

  // Stepper functions
  const next = () => setStep((s) => Math.min(claimSteps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  // Submit Claim – saves to backend
  const submitClaim = async () => {
    if (!form.purchaseId) return window.alert("Please select a purchased policy first.");
    if (!form.description.trim()) return window.alert("Please add a claim description.");
    if (!String(form.amount).trim())  return window.alert("Please enter the claim amount.");
    if (!form.docName.trim())         return window.alert("Please upload supporting documents.");

    // Validate dynamic category-specific fields
    for (const f of dynamicFields) {
      if (f.required && !form.claim_data?.[f.name]) {
        return window.alert(`Field '${f.label}' is required.`);
      }
    }

    setBusy(true);

    try {
      const res = await apiRequest("/api/claims", {
        method: "POST",
        body: JSON.stringify({
          purchaseId:    form.purchaseId,
          claim_type:    form.type,
          claim_amount:  Number(form.amount),
          claim_reason:  form.description.trim(),
          claim_data:    form.claim_data,
          doc_name:      form.docName,
        }),
      });

      if (res?.success) {
        // Reset form
        setForm({
          purchaseId: "",
          type: "Health",
          description: "",
          amount: "",
          docName: "",
          incidentDate: new Date().toISOString().split("T")[0],
          location: "",
          claim_data: {},
        });
        setDynamicFields([]);
        setStep(0);
        // Refresh claims list from backend
        await fetchMyClaims();
        setActiveTab("track");
        window.alert("Claim submitted successfully! Check status below.");
      } else {
        window.alert(res?.message || "Failed to submit claim. Please try again.");
      }
    } catch (err) {
      console.error(err);
      window.alert(err?.message || "Error submitting claim. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // AI Verification Simulation – updates local state only (no DB write needed for demo)
  const runAi = async (id) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, aiStatus: "Verifying..." } : c))
    );

    await new Promise((r) => setTimeout(r, 1000));

    const approved = !chance(0.15);
    const now = new Date().toISOString();
    const status = approved ? "Reviewing" : "Rejected";

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          status,
          aiStatus:  approved ? "Verified" : "Flagged",
          progress:  approved ? 5 : 7,
          timeline:  [
            ...(c.timeline || []),
            { at: now, label: approved ? "AI scan passed: No fraud signals" : "AI scan flagged anomalies" },
          ],
        };
      })
    );
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
      // const res = await apiRequest("/api/claim-support", {
      const res = await apiRequest("/api/support/support-tickets", {
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

  // Upload document directly to Cloudinary via backend upload API
  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (res?.url) {
        setForm((prev) => ({ ...prev, docName: res.url }));
        window.alert("Document uploaded successfully to Cloudinary!");
      } else {
        window.alert(res?.message || "Failed to upload document.");
      }
    } catch (err) {
      console.error(err);
      window.alert("Error uploading document to Cloudinary.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Send a user reply to an active support ticket conversation
  const handleUserSendReply = async () => {
    if (!activeChatTicket || !userReplyText.trim()) return;
    setSendingReply(true);
    try {
     const res = await apiRequest(`/api/support/support-tickets/${activeChatTicket._id || activeChatTicket.id}/messages`, {
  method: "POST",
  body: JSON.stringify({ text: userReplyText.trim() }),
});
      if (res?.data) {
        setActiveChatTicket(res.data);
        setUserReplyText("");
        fetchTickets(); // Refresh tickets list in background
      }
    } catch (err) {
      console.error(err);
      window.alert("Failed to send reply. Please try again.");
    } finally {
      setSendingReply(false);
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
                  
                  {/* Step 1: Load purchased policies */}
                  {step === 0 && (
                    <div className="space-y-4">
                      <div className="text-sm font-black text-slate-800 dark:text-slate-200">Select Purchased Policy for Claim</div>
                      {loadingPurchases ? (
                        <div className="text-center py-6 text-xs text-slate-500">Loading your policies...</div>
                      ) : userPurchases.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-white/5">
                          <p className="text-xs font-semibold text-slate-500">
                            No active purchased policies found. You must purchase an insurance policy before filing a claim.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {userPurchases.map((p) => {
                            const isSelected = form.purchaseId === p._id;
                            const policyName = p.policy?.policyName || "Standard Insurance Plan";
                            const companyName = p.policy?.companyName || "Agile Insurance";
                            const category = p.policy?.category || "health";
                            const policyNum = p.purchase_number || p.policyNumber || "N/A";
                            return (
                              <button
                                key={p._id}
                                onClick={async () => {
                                  setForm((prev) => ({
                                    ...prev,
                                    purchaseId: p._id,
                                    type: category.charAt(0).toUpperCase() + category.slice(1),
                                  }));
                                  // Fetch dynamic form fields from backend
                                  try {
                                    const res = await apiRequest(`/api/claims/form/${p._id}`);
                                    if (res?.data) {
                                      setDynamicFields(res.data.fields || []);
                                      const initialData = {};
                                      res.data.fields.forEach((f) => {
                                        initialData[f.name] = "";
                                      });
                                      setForm((prev) => ({
                                        ...prev,
                                        claim_data: initialData,
                                      }));
                                    }
                                  } catch (err) {
                                    console.error("Failed to load claim config:", err);
                                  }
                                }}
                                className={`rounded-2xl border p-5 text-left transition-all relative ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 font-black shadow-sm ring-1 ring-blue-500"
                                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 font-semibold"
                                }`}
                              >
                                <span className="text-base block font-black">{policyName}</span>
                                <span className="text-xs text-slate-500 block mt-1">Provider: {companyName}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Policy #: {policyNum}</span>
                                <span className="inline-block mt-2 rounded bg-slate-100 dark:bg-white/10 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">
                                  {category}
                                </span>
                                {isSelected && (
                                  <Check size={14} className="absolute top-4 right-4 text-blue-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Step 2: Fill smart form with dynamic inputs */}
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
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Claim Amount (INR)</span>
                          <input
                            value={form.amount}
                            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value.replace(/[^\d]/g, "").slice(0, 8) }))}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                            inputMode="numeric"
                            placeholder="Enter estimated reimbursement or damage amount..."
                          />
                        </label>
                      </div>

                      <label className="block space-y-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Incident Description / Reason</span>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                          className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                          placeholder="Provide specific details about the loss/event..."
                        />
                      </label>

                      {/* Render Dynamic Fields */}
                      {dynamicFields.length > 0 && (
                        <div className="mt-6 border-t border-slate-100 pt-5 space-y-4 dark:border-white/5">
                          <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Additional Category-Specific Information</div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {dynamicFields.map((f) => (
                              <label key={f.name} className="block space-y-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{f.label}</span>
                                {f.type === "textarea" ? (
                                  <textarea
                                    value={form.claim_data?.[f.name] || ""}
                                    onChange={(e) => setForm((prev) => ({
                                      ...prev,
                                      claim_data: {
                                        ...prev.claim_data,
                                        [f.name]: e.target.value,
                                      },
                                    }))}
                                    className="w-full min-h-[90px] rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                                    required={f.required}
                                  />
                                ) : (
                                  <input
                                    type={f.type || "text"}
                                    value={form.claim_data?.[f.name] || ""}
                                    onChange={(e) => setForm((prev) => ({
                                      ...prev,
                                      claim_data: {
                                        ...prev.claim_data,
                                        [f.name]: e.target.value,
                                      },
                                    }))}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                                    required={f.required}
                                  />
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
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
                              disabled={uploadingDoc}
                              onChange={handleDocUpload}
                            />
                            <FileUp size={18} />
                            {uploadingDoc ? "Uploading to Cloudinary..." : "Choose PDF / File"}
                          </label>
                          {form.docName && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex flex-col gap-1 items-center max-w-full">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                <span>File uploaded successfully!</span>
                              </div>
                              <span className="font-black truncate max-w-xs">{form.docName}</span>
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
                  {loadingClaims ? (
                    <div className="text-center py-10 text-xs text-slate-500">Loading your claims...</div>
                  ) : claims.length === 0 ? (
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
                          {c.status === "Pending" && (
                            <button
                              onClick={() => runAi(c.id)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-black text-white hover:opacity-95 shadow-sm shadow-blue-500/10"
                            >
                              <Bot size={14} />
                              Run AI Verification Scan
                            </button>
                          )}
                          <button
                            onClick={fetchMyClaims}
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
                  {activeChatTicket ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => setActiveChatTicket(null)}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                        >
                          &larr; Back to tickets list
                        </button>
                        <div className="flex gap-2">
                          <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                            {activeChatTicket.priority} Priority
                          </span>
                          <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            Status: {activeChatTicket.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        Subject: {activeChatTicket.subject}
                      </div>

                      {/* Chat Messages Log */}
                      <div className="max-h-[300px] overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-white/5">
                        {(activeChatTicket.messages || []).map((msg, idx) => {
                          const isMe = msg.senderRole === "user";
                          const senderName = isMe ? "You" : "Agile Claim Admin";
                          return (
                            <div key={msg.id || msg._id || idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                              <span className="text-[10px] font-bold text-slate-400 mb-1">{senderName}</span>
                              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs font-semibold ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-white/10 dark:text-slate-100 rounded-bl-none"}`}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reply Input Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={userReplyText}
                          onChange={(e) => setUserReplyText(e.target.value)}
                          placeholder="Type your message..."
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              await handleUserSendReply();
                            }
                          }}
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleUserSendReply}
                          disabled={sendingReply || !userReplyText.trim()}
                          className="rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                              onClick={() => {
                                setActiveChatTicket(t);
                                setUserReplyText("");
                              }}
                              className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-4 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 cursor-pointer flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-all"
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
                    </>
                  )}
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