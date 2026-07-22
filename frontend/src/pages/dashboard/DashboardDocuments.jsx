import { useMemo, useState, useEffect, useRef } from "react";
import {
  FileText, FileUp, ShieldCheck, Sparkles, Eye,
  CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, Trash2,
} from "lucide-react";
import { apiRequest, getToken } from "../../utils/api";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://agile-insurance-portal-qa90.onrender.com").replace(/\/$/, "");

const DOCUMENT_TYPES = [
  "Aadhar", "PAN", "Driving License", "Passport", "Policy", "Claim", "Other",
];

const STATUS_META = {
  Approved:  { icon: CheckCircle,  color: "text-emerald-600", bg: "bg-emerald-50 ring-emerald-200",  label: "Approved"       },
  Pending:   { icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50 ring-amber-200",      label: "Under review"   },
  Rejected:  { icon: XCircle,      color: "text-rose-600",    bg: "bg-rose-50 ring-rose-200",        label: "Rejected"       },
  "Re-upload Requested": { icon: AlertCircle, color: "text-violet-600", bg: "bg-violet-50 ring-violet-200", label: "Re-upload needed" },
};

const DashboardDocuments = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0]);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/api/documents", { useAdminToken: false });
      setDocs(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const kycStatus = useMemo(() => {
    const idTypes = ["Aadhar", "PAN", "Passport", "Driving License"];
    const idDoc = docs.find((d) => idTypes.includes(d.documentType));
    if (!idDoc) return { label: "No ID uploaded", meta: STATUS_META.Pending };
    return {
      label: STATUS_META[idDoc.status]?.label || idDoc.status,
      meta: STATUS_META[idDoc.status] || STATUS_META.Pending,
    };
  }, [docs]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;

    const allowed = file.type === "application/pdf" || file.type.startsWith("image/");
    if (!allowed) { setUploadError("Only PDF and image files are allowed."); return; }

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", selectedType);
      const data = await apiRequest("/api/documents/upload", {
        method: "POST", body: formData, useAdminToken: false,
      });
      if (!data.success) throw new Error(data.message);
      setDocs((prev) => [data.data, ...prev]);
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.documentType}"? This cannot be undone.`)) return;
    setDeletingId(doc._id);
    try {
      await apiRequest(`/api/documents/${doc._id}`, {
        method: "DELETE", useAdminToken: false,
      });
      setDocs((prev) => prev.filter((d) => d._id !== doc._id));
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const viewFile = (doc) => {
    const token = getToken();
    const url = `${BASE_URL}/api/documents/${doc._id}/file`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => { window.open(URL.createObjectURL(blob), "_blank"); })
      .catch(() => alert("Could not open file."));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Documents center
            </div>
            <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">My Documents</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Upload and track your KYC and policy documents.</p>
          </div>
          <div className="flex flex-col gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-black text-white shadow-sm hover:opacity-95">
              <input ref={fileInputRef} type="file" accept="application/pdf,image/*" className="hidden" disabled={uploading} onChange={handleFileChange} />
              <FileUp size={18} />
              {uploading ? "Uploading…" : "Upload Document"}
            </label>
            {uploadError && <p className="text-xs font-semibold text-rose-600">{uploadError}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Vault */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">Documents vault</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">All uploaded and policy-linked documents.</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-600/10 px-4 py-2 text-xs font-black text-blue-700 dark:text-blue-300">
                {docs.length} file{docs.length !== 1 ? "s" : ""}
              </span>
              <button onClick={fetchDocuments} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 dark:bg-white/5" />
              ))
            ) : error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div>
            ) : docs.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5 sm:p-10">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
                  <FileText size={26} />
                </div>
                <div className="mt-6 text-xl font-black text-slate-900 dark:text-white">No documents yet</div>
                <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Select a document type above and upload your first file.</div>
              </div>
            ) : (
              docs.map((doc) => {
                const meta = STATUS_META[doc.status] || STATUS_META.Pending;
                const StatusIcon = meta.icon;
                const isDeleting = deletingId === doc._id;
                return (
                  <div
                    key={doc._id}
                    className={`flex flex-col gap-4 rounded-3xl border bg-slate-50 px-5 py-4 transition dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between ${
                      isDeleting ? "border-rose-200 opacity-50" : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-black text-slate-900 dark:text-white">{doc.documentType}</span>
                        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ring-1 ${meta.bg}`}>
                          <StatusIcon size={11} className={meta.color} />
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-xs text-slate-400">{doc.fileName}</div>
                      <div className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Uploaded {new Date(doc.createdAt).toLocaleString()}
                      </div>
                      {doc.note && (
                        <div className="mt-2 flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs font-semibold text-violet-800 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
                          <AlertCircle size={13} className="mt-0.5 shrink-0" />
                          <span>{doc.note}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => viewFile(doc)}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-black text-rose-600 shadow-sm hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900 dark:bg-white/5"
                      >
                        {isDeleting
                          ? <RefreshCw size={16} className="animate-spin" />
                          : <Trash2 size={16} />
                        }
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">KYC verification</div>
            <div className="mt-4 flex items-center gap-3">
              {(() => { const Icon = kycStatus.meta.icon; return <Icon size={20} className={kycStatus.meta.color} />; })()}
              <span className="text-sm font-black text-slate-900 dark:text-white">{kycStatus.label}</span>
            </div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                <Sparkles size={18} className="text-blue-600 dark:text-blue-400" />
                AI document scanning
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Admin reviews your documents for validity, readability, and mismatch risk.
              </div>
            </div>
          </div>

          {docs.some((d) => d.status === "Re-upload Requested") && (
            <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-950/30 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-black text-violet-900 dark:text-violet-200">
                <AlertCircle size={18} /> Action required
              </div>
              <div className="mt-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
                One or more documents need to be re-uploaded. Review the notes above and upload corrected files.
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 text-white shadow-[0_40px_120px_rgba(2,6,23,0.35)] dark:border-white/10 sm:p-8">
            <div className="text-sm font-black">Digital signature verification</div>
            <div className="mt-2 text-sm font-semibold text-white/70">
              Signatures are verified using issuer certificates upon document approval.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDocuments;