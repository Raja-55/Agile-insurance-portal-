import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  PhoneCall,
  Mail,
  Heart,
  Car,
  Home,
  Users,
  Compass,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

const categories = [
  {
    id: "health",
    title: "Health Insurance",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/10",
    textColor: "text-rose-600 dark:text-rose-400",
    when: "Hospitalization exceeding 24 hours.",
    docs: [
      "Original Discharge Summary",
      "Itemized Hospital Bills and Payment Receipts",
      "All Diagnostic Reports (X-Ray, Blood Tests, etc.)",
      "Prescriptions and Medical Store Bills",
    ],
    tip: "Ensure the hospital 'Discharge Summary' clearly mentions the Date of Admission and Date of Discharge.",
  },
  {
    id: "auto",
    title: "Car / Auto Insurance",
    icon: Car,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/10",
    textColor: "text-blue-600 dark:text-blue-400",
    when: "Accidents, Theft, or Natural Calamities.",
    docs: [
      "Copy of Driving License (DL) and Registration Certificate (RC)",
      "First Information Report (FIR) — Mandatory for Theft or Third-Party Injury",
      "Clear photos of the damaged vehicle parts",
      "Repair Estimate from the authorized garage",
    ],
    tip: "Do not start vehicle repairs before the insurance surveyor inspects the car.",
  },
  {
    id: "home",
    title: "Home Insurance",
    icon: Home,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/10",
    textColor: "text-amber-600 dark:text-amber-400",
    when: "Fire, Burglary, or Earthquake damage.",
    docs: [
      "Police FIR (Mandatory for Burglary / Theft)",
      "Fire Department Report (Mandatory for Fire events)",
      "Detailed list of damaged/stolen items with estimated values",
      "Invoices or purchase proofs of high-value items (if available)",
    ],
    tip: "Take a detailed video of the damaged area before you start cleaning up.",
  },
  {
    id: "life",
    title: "Life Insurance",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
    when: "Natural or accidental death of the policyholder.",
    docs: [
      "Original Death Certificate issued by local municipal authorities",
      "Original Policy Bond/Document",
      "Identity and Address proof of the Nominee",
      "Detailed Medical Records if death was due to prolonged illness",
    ],
    tip: "Ensure the Nominee's Bank Details are active and updated for direct claim payout.",
  },
  {
    id: "travel",
    title: "Travel Insurance",
    icon: Compass,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/10",
    textColor: "text-purple-600 dark:text-purple-400",
    when: "Trip cancellation, baggage loss, or overseas medical emergency.",
    docs: [
      "Passport copy with entry/exit stamps and Boarding Pass",
      "Flight tickets and booking invoices",
      "Loss report/certificate from the airline (for baggage loss)",
      "Original emergency medical bills or trip cancellation receipts",
    ],
    tip: "Keep original receipts of all travel expenditures and report baggage loss to the airline immediately.",
  },
  {
    id: "business",
    title: "Business Insurance",
    icon: Briefcase,
    color: "from-cyan-500 to-sky-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/10",
    textColor: "text-cyan-600 dark:text-cyan-400",
    when: "Commercial property damage, public liability, or business interruption.",
    docs: [
      "Business Registration Certificate and tax filings",
      "Detailed financial logs and audit sheets for business interruption",
      "Incident report, fire, or police certificates",
      "Detailed inventory loss assessment list with bills",
    ],
    tip: "Maintain transaction proof and business logs regularly to avoid claim delays.",
  },
];

const steps = [
  {
    title: "Intimation (Notify Us)",
    desc: "Inform us within 24–48 hours of the incident via your user dashboard.",
  },
  {
    title: "Evidence Collection",
    desc: "Take clear photos, save all original bills, and gather official reports (Police/Hospital).",
  },
  {
    title: "Digital Submission",
    desc: "Fill out the 'Claim Request' form on your portal and upload the required document scans.",
  },
  {
    title: "Verification & Survey",
    desc: "Our AI and human surveyors will review your files. A physical survey may be arranged if needed.",
  },
  {
    title: "Settlement & Payout",
    desc: "Once verified and approved, funds are transferred directly to your registered bank account.",
  },
];

const ClaimProcessKnow = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("health");

  const selectedCategory = categories.find((c) => c.id === activeCategory);
  const CatIcon = selectedCategory.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 text-white shadow-2xl sm:p-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300">
              <ShieldCheck size={16} />
              The Peace of Mind Guarantee
            </span>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Understanding Your Insurance Claim Process
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              An insurance claim is a formal request by a policyholder to the insurance company for coverage or compensation for a covered loss or policy event. At Agile AI, we aim to make your recovery as smooth as possible. Whether it’s a medical emergency or a minor car scratch, our AI-driven process ensures your request is handled with transparency and speed.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate(isAuthenticated ? "/dashboard/claims" : "/auth")}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/20"
              >
                File a Claim Now
                <ArrowRight size={16} />
              </button>
              <a
                href="#process"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold hover:bg-white/15"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Universal 5-Step Claim Process */}
        <section id="process" className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              The Universal 5-Step Claim Process
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              While documents vary, the workflow remains consistent for all policies:
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 hidden lg:block" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 relative z-10">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center bg-white dark:bg-[#0B1020] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white font-black text-lg mb-4 shadow-md shadow-blue-500/20">
                    {idx + 1}
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category-Specific Document Guide */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Category-Specific Guides
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Choose an insurance category to view required proofs of loss and checklist documents.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {categories.map((c) => {
                const Icon = c.icon;
                const isActive = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`flex items-center gap-4 w-full rounded-2xl p-4 text-left border transition ${
                      isActive
                        ? "border-blue-600 bg-white dark:bg-blue-950/10 shadow-sm"
                        : "border-transparent bg-transparent hover:bg-slate-200/50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${
                        c.color
                      } text-white shadow-sm`}
                    >
                      <Icon size={20} />
                    </span>
                    <div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {c.title}
                      </div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {c.docs.length} core documents
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0B1020] sm:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <span className={`p-3 rounded-2xl ${selectedCategory.bgColor} ${selectedCategory.textColor}`}>
                    <CatIcon size={26} />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedCategory.title} Claim Info
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      Trigger Event: {selectedCategory.when}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 pt-6 space-y-4">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Must-Have Claims Documents:
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedCategory.docs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-600/10 bg-blue-600/5 p-5 text-xs font-semibold text-blue-900 dark:text-blue-300">
                  <div className="flex items-center gap-2 font-black mb-1">
                    <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
                    CRITICAL CLAIM TIP
                  </div>
                  {selectedCategory.tip}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Handle with Care & Upload Guidelines */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Handle with Care Checklist */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0B1020] sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={24} />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                The "Handle with Care" Checklist
              </h3>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              Avoid these common mistakes that lead to claims being rejected:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "The 48-Hour Notification Window",
                  desc: "Most claims are rejected if reported later than 48–72 hours after the incident. Report fast.",
                },
                {
                  title: "Double-Check Bank Details",
                  desc: "Verify your IFSC Code and Account Number. A small typo can delay your reimbursement by weeks.",
                },
                {
                  title: "Be Highly Specific with Descriptions",
                  desc: "Provide details: instead of saying 'Car got hit', say 'Hit by a truck from the rear left side at the MG Road junction at 4:00 PM.' Specificity builds trust.",
                },
                {
                  title: "Know Your Policy Exclusions",
                  desc: "Verify if your event is covered. For example, accidents while driving under the influence are strictly rejected.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-600/10 text-xs font-black text-amber-700 dark:text-amber-400">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Upload Standards */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0B1020] sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <UploadCloud className="text-blue-600 dark:text-blue-400" size={24} />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Document Upload Standards
              </h3>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              Ensure the AI engine can process your document uploads immediately without errors:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Allowed Formats", val: "PDF, JPG, or PNG formats only." },
                { title: "Maximum File Size", val: "Up to 5MB maximum per file." },
                { title: "Text Legibility", val: "Clear lighting, no shadows or cut-off corners." },
                { title: "Original Hard Copies", val: "Keep physically safe. We may request them for final audit." },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
                  <div className="text-xs font-black text-slate-900 dark:text-white">{item.title}</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Status Timeline */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0B1020] sm:p-8 shadow-sm space-y-8">
          <div className="max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-blue-600 dark:text-blue-400" />
              Claim Status Timeline
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Track where your claim stands through our transparent milestone flow:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {[
              { status: "Submitted", desc: "Received request" },
              { status: "Verification", desc: "Checking uploads" },
              { status: "Surveyor", desc: "Expert assessment" },
              { status: "Query Raised", desc: "Action required!" },
              { status: "Approved", desc: "Claim validated" },
              { status: "Settled", desc: "Funds disbursed" },
            ].map((step, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5 space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Step {idx + 1}</span>
                <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">{step.status}</div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Support Callouts */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0B1020] sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-600 dark:text-blue-400" />
                Need Assistance?
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Our support team is online 24/7 to resolve claims issues and answer questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate(isAuthenticated ? "/dashboard/claims" : "/auth")}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white hover:bg-blue-700 shadow-sm transition"
              >
                <PhoneCall size={14} />
                Claim Support Center
              </button>
            </div>
          </div>
        </section>

        {/* Legal Footer / Fraud Warning */}
        <footer className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-950/20 dark:bg-red-950/5 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-black text-sm mb-2">
            <AlertTriangle size={18} />
            IMPORTANT LEGAL DISCLOSURE / FRAUD WARNING
          </div>
          <p className="text-xs font-semibold text-red-700/80 dark:text-red-400/80 max-w-4xl mx-auto leading-relaxed">
            "Insurance fraud is a crime. Providing false information, exaggerated loss amounts, or forged documents will lead to immediate claim rejection, policy cancellation, and potential legal prosecution."
          </p>
        </footer>

      </div>
    </div>
  );
};

<<<<<<< HEAD
export default ClaimProcessKnow;
=======
export default ClaimProcessKnow;
>>>>>>> raj
