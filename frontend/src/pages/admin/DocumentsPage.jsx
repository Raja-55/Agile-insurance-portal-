import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck, PenLine, Circle, Eraser, Undo2, Send,
  CheckCircle, XCircle, RefreshCw, FileText, Eye,
} from "lucide-react";
import { SectionTitle } from "../../components/admin/shared";
import {
  setMarkupTool,
  addMark,
  undoMark,
} from "../../store/slices/documentsSlice";
import { useAdminActions } from "../../hooks/useAdminActions";
import { statusClass } from "../../utils/helpers";
import { apiRequest, getAdminToken } from "../../utils/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://agile-insurance-portal-qa90.onrender.com").replace(/\/$/, "");

const STATUS_COLORS = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  "Re-upload Requested": "bg-violet-50 text-violet-700 ring-violet-200",
};

// ─── component ────────────────────────────────────────────────────────────────
const DocumentsPage = () => {
  const dispatch = useDispatch();
  const { panel, log } = useAdminActions();
  const { documentMarks, markupTool } = useSelector((s) => s.documents);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [fileBlobUrl, setFileBlobUrl] = useState(null);   // authenticated blob URL for preview
  const [fileLoading, setFileLoading] = useState(false);
  const [draftMark, setDraftMark] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // docId of in-flight action

  // docKey ties marks to a specific document version
  const docKey = selectedDoc ? `${selectedDoc.id}` : "";
  const currentMarks = documentMarks[docKey] || [];

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/api/admin/documents", { useAdminToken: true });
      setRows(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // ── patch helper ──────────────────────────────────────────────────────────
  const patchDocument = async (id, endpoint, body = {}) => {
    setActionLoading(id);
    try {
      const res = await apiRequest(`/api/admin/documents/${id}/${endpoint}`, {
        method: "PATCH",
        useAdminToken: true,
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      // Update row in place
      setRows((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...res.data, id } : d))
      );
      // Keep selectedDoc in sync
      if (selectedDoc?.id === id) {
        setSelectedDoc((prev) => ({ ...prev, ...res.data, id }));
      }
      return res;
    } finally {
      setActionLoading(null);
    }
  };

  // ── approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (doc) => {
    try {
      await patchDocument(doc.id, "approve");
      log(`/api/admin/documents/${doc.id}/approve`);
      panel("Document Approved", `${doc.type} for ${doc.owner} has been approved.`);
    } catch (err) {
      panel("Error", err.message);
    }
  };

  // ── reject ────────────────────────────────────────────────────────────────
  const handleReject = async (doc) => {
    try {
      await patchDocument(doc.id, "reject", { note: "Document rejected by admin." });
      log(`/api/admin/documents/${doc.id}/reject`);
      panel("Document Rejected", `${doc.type} for ${doc.owner} has been rejected.`);
    } catch (err) {
      panel("Error", err.message);
    }
  };

  // ── send correction (with marks) ─────────────────────────────────────────
  const sendCorrection = async () => {
    if (!selectedDoc) return;
    try {
      await patchDocument(selectedDoc.id, "correction", {
        note: "Admin has marked corrections. Please re-upload the corrected document.",
        marks: currentMarks,
      });
      log(`/api/admin/documents/${selectedDoc.id}/correction`);
      panel(
        "Correction Sent",
        `${selectedDoc.owner} will see correction marks for ${selectedDoc.type}.`
      );
    } catch (err) {
      panel("Error", err.message);
    }
  };

  // ── markup canvas ─────────────────────────────────────────────────────────
  const pointFromEvent = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const startMarkup = (e) => {
    if (!selectedDoc) return;
    const point = pointFromEvent(e);
    if (markupTool === "eraser") {
      dispatch(undoMark(docKey));
      return;
    }
    setDraftMark({
      id: `mark-${Date.now()}`,
      tool: markupTool,
      points: [point],
      color: markupTool === "circle" ? "#dc2626" : "#2563eb",
    });
  };
  const continueMarkup = (e) => {
    if (!draftMark || markupTool !== "pen") return;
    setDraftMark((m) => ({ ...m, points: [...m.points, pointFromEvent(e)] }));
  };
  const finishMarkup = (e) => {
    if (!draftMark || !selectedDoc) return;
    const end = pointFromEvent(e);
    const completed =
      draftMark.tool === "circle"
        ? { ...draftMark, points: [draftMark.points[0], end] }
        : draftMark;
    dispatch(addMark({ key: docKey, mark: completed }));
    setDraftMark(null);
  };

  // ── view document — fetch blob with admin token so iframe/img can render it ──
  const handleView = async (doc) => {
    setSelectedDoc(doc);
    setFileBlobUrl(null);
    setFileLoading(true);
    panel("Document Opened", `${doc.type} for ${doc.owner}`);
    try {
      const token = getAdminToken();
      const res = await fetch(
        `${BASE_URL}/api/admin/documents/${doc.id}/file`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to load file");
      const blob = await res.blob();
      // Revoke previous blob URL to avoid memory leaks
      setFileBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
    } catch (err) {
      panel("Preview Error", err.message);
    } finally {
      setFileLoading(false);
    }
  };

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <SectionTitle icon={ShieldCheck} title="Document Verification" />
        <button
          onClick={fetchDocuments}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-5 2xl:grid-cols-[360px_1fr]">
        {/* ── Document list ── */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
            ))
          ) : rows.length === 0 ? (
            <div className="grid h-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <FileText size={24} className="mx-auto text-slate-400" />
                <div className="mt-2 text-sm font-black text-slate-600">No documents submitted</div>
                <div className="mt-1 text-xs font-semibold text-slate-400">
                  Documents uploaded by users will appear here.
                </div>
              </div>
            </div>
          ) : (
            rows.map((doc) => (
              <article
                key={doc.id}
                className={`rounded-lg border p-4 transition ${
                  selectedDoc?.id === doc.id
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-black text-slate-900">{doc.type}</div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-500">{doc.owner}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                    {doc.note && (
                      <div className="mt-2 text-xs font-bold text-rose-700">{doc.note}</div>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-lg px-2 py-1 text-xs font-black ring-1 ${
                      STATUS_COLORS[doc.status] || statusClass(doc.status)
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {/* View */}
                  <button
                    onClick={() => handleView(doc)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye size={12} /> View
                  </button>

                  {/* Approve */}
                  <button
                    onClick={() => handleApprove(doc)}
                    disabled={actionLoading === doc.id || doc.status === "Approved"}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-40"
                  >
                    <CheckCircle size={12} />
                    {actionLoading === doc.id ? "..." : "Approve"}
                  </button>

                  {/* Reject */}
                  <button
                    onClick={() => handleReject(doc)}
                    disabled={actionLoading === doc.id || doc.status === "Rejected"}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-50 disabled:opacity-40"
                  >
                    <XCircle size={12} />
                    {actionLoading === doc.id ? "..." : "Reject"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* ── Markup canvas ── */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          {selectedDoc ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm font-black text-slate-950">{selectedDoc.type} Review</div>
                  <div className="mt-1 text-xs font-bold text-slate-500">
                    {selectedDoc.owner} · {selectedDoc.ownerEmail}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["pen", "Pen", PenLine],
                    ["circle", "Circle", Circle],
                    ["eraser", "Eraser", Eraser],
                  ].map(([id, label, Icon]) => (
                    <button
                      key={id}
                      onClick={() => dispatch(setMarkupTool(id))}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${
                        markupTool === id
                          ? "border-blue-300 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => dispatch(undoMark(docKey))}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                  >
                    <Undo2 size={14} />
                    Undo
                  </button>
                  <button
                    onClick={sendCorrection}
                    disabled={actionLoading === selectedDoc.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Send size={14} />
                    {actionLoading === selectedDoc.id ? "Sending..." : "Send Back"}
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative mx-auto mt-4 aspect-[4/5] max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                {/* Document preview */}
                <div className="absolute inset-0">
                  {fileLoading ? (
                    <div className="grid h-full place-items-center bg-slate-50">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <RefreshCw size={22} className="animate-spin" />
                        <span className="text-xs font-semibold">Loading document…</span>
                      </div>
                    </div>
                  ) : fileBlobUrl && selectedDoc.mimeType?.startsWith("image/") ? (
                    <img
                      src={fileBlobUrl}
                      alt={selectedDoc.type}
                      className="h-full w-full object-contain"
                    />
                  ) : fileBlobUrl && selectedDoc.mimeType === "application/pdf" ? (
                    <iframe
                      title={selectedDoc.type}
                      src={fileBlobUrl}
                      className="h-full w-full border-0"
                    />
                  ) : (
                    /* Fallback info card */
                    <div className="h-full p-8">
                      <div className="border-b border-slate-200 pb-4">
                        <div className="text-xs font-black uppercase tracking-wide text-blue-700">
                          Submitted Document
                        </div>
                        <div className="mt-2 text-2xl font-black text-slate-950">{selectedDoc.type}</div>
                        <div className="mt-1 text-sm font-bold text-slate-500">
                          Owner: {selectedDoc.owner}
                        </div>
                      </div>
                      <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-600">
                        {[
                          "Identity fields verified against user profile.",
                          "Policy or claim reference checked by admin.",
                          "Missing or incorrect areas can be circled before sending back.",
                          "User receives the correction request after Send Back.",
                        ].map((line, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
                          >
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs font-black text-white">
                              {i + 1}
                            </span>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SVG markup overlay */}
                <svg
                  className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  onPointerDown={startMarkup}
                  onPointerMove={continueMarkup}
                  onPointerUp={finishMarkup}
                >
                  {[...currentMarks, ...(draftMark ? [draftMark] : [])].map((mark) => {
                    if (mark.tool === "circle") {
                      const [s, end = s] = mark.points;
                      const x = Math.min(s.x, end.x);
                      const y = Math.min(s.y, end.y);
                      const w = Math.max(Math.abs(end.x - s.x), 2);
                      const h = Math.max(Math.abs(end.y - s.y), 2);
                      return (
                        <ellipse
                          key={mark.id}
                          cx={x + w / 2}
                          cy={y + h / 2}
                          rx={w / 2}
                          ry={h / 2}
                          fill="none"
                          stroke={mark.color}
                          strokeWidth="1.2"
                        />
                      );
                    }
                    return (
                      <polyline
                        key={mark.id}
                        fill="none"
                        stroke={mark.color}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.2"
                        points={mark.points.map((p) => `${p.x},${p.y}`).join(" ")}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Status badge under canvas */}
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>
                  Status:{" "}
                  <span
                    className={`rounded px-2 py-0.5 font-black ring-1 ${
                      STATUS_COLORS[selectedDoc.status] || ""
                    }`}
                  >
                    {selectedDoc.status}
                  </span>
                </span>
                <span>{currentMarks.length} mark(s)</span>
              </div>
            </>
          ) : (
            <div className="grid min-h-[420px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white text-center">
              <div>
                <ShieldCheck size={32} className="mx-auto text-slate-300" />
                <div className="mt-3 text-sm font-black text-slate-800">Select a document</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  Click <strong>View</strong> on any document to open the markup workspace.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DocumentsPage;