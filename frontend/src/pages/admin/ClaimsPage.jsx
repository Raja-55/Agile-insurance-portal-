// src/pages/admin/ClaimsPage.jsx
import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, RefreshCw, Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { SectionTitle } from "../../components/admin/shared";
import { apiRequest } from "../../utils/api";

const STATUS_STYLES = {
  submitted: "bg-amber-100 text-amber-700",
  reviewing: "bg-blue-100 text-blue-700",
  approved:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-rose-100 text-rose-700",
  draft:     "bg-slate-100 text-slate-600",
};

const claimSteps = [
  "Submitted", "Under Review", "Document Verification",
  "Approved / Rejected", "Payment Processing", "Completed",
];

const ClaimsPage = () => {
  const [claims, setClaims]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(null); // for detail view
  const [updating, setUpdating]   = useState(null); // claim id being updated

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/admin/claims", { useAdminToken: true });
      if (res?.data) setClaims(res.data);
    } catch (err) {
      console.error("Failed to load claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, []);

  const handleStatusChange = async (claimId, newStatus) => {
    setUpdating(claimId);
    try {
      const res = await apiRequest(`/api/admin/claims/${claimId}`, {
        useAdminToken: true,
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res?.success) {
        setClaims((prev) =>
          prev.map((c) =>
            c._id === claimId
              ? { ...c, claim_status: newStatus, status: newStatus }
              : c
          )
        );
        if (selected?._id === claimId) {
  setSelected((prev) => ({
    ...prev,
    claim_status: newStatus,
    status: newStatus,
  }));
}
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (claimId) => {
    if (!window.confirm("Delete this claim permanently?")) return;
    try {
      await apiRequest(`/api/admin/claims/${claimId}`, {
        useAdminToken: true,
        method: "DELETE",
      });
      setClaims((prev) => prev.filter((c) => c._id !== claimId));
      if (selected?._id === claimId) setSelected(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const formatInr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={20} className="text-blue-600" />
            <h2 className="text-lg font-black text-slate-900">Claims Management</h2>
          </div>
          <button
            onClick={fetchClaims}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        <p className="text-xs text-slate-500 font-semibold">
          {claims.length} total claims · {claims.filter(c => c.claim_status === "submitted").length} pending review
        </p>
      </div>

      <div className={`grid gap-6 ${selected ? "lg:grid-cols-[1fr_420px]" : "grid-cols-1"}`}>
        {/* Claims Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              Loading claims...
            </div>
          ) : claims.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              No claims found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Claim #", "User", "Policy", "Type", "Amount", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-black text-blue-700 text-xs">
                        {claim.claim_number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-xs">
                          {claim.user?.fullName || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400">{claim.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {claim.policy?.policyName || claim.claim_type}
                        <div className="text-[10px] text-slate-400">{claim.policy?.companyName}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                        {claim.claim_type}
                      </td>
                      <td className="px-4 py-3 text-xs font-black text-slate-900">
                        {formatInr(claim.claim_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black capitalize ${STATUS_STYLES[claim.claim_status] || STATUS_STYLES.draft}`}>
                          {claim.claim_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-slate-500">
                        {formatDate(claim.submitted_at || claim.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelected(selected?._id === claim._id ? null : claim)}
                            className="rounded-lg border border-slate-200 p-1.5 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            title="View Details"
                          >
                            <Eye size={13} className="text-slate-500" />
                          </button>
                          {claim.claim_status !== "approved" && (
                            <button
                              onClick={() => handleStatusChange(claim._id, "approved")}
                              disabled={updating === claim._id}
                              className="rounded-lg border border-emerald-200 p-1.5 hover:bg-emerald-50 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={13} className="text-emerald-600" />
                            </button>
                          )}
                          {claim.claim_status !== "rejected" && (
                            <button
                              onClick={() => handleStatusChange(claim._id, "rejected")}
                              disabled={updating === claim._id}
                              className="rounded-lg border border-rose-200 p-1.5 hover:bg-rose-50 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={13} className="text-rose-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(claim._id)}
                            className="rounded-lg border border-slate-200 p-1.5 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} className="text-slate-400 hover:text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5 self-start sticky top-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Claim Detail</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 space-y-2">
                <p className="font-black text-slate-700">{selected.claim_number}</p>
                <p className="text-slate-500">Filed: {formatDate(selected.submitted_at)}</p>
                <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-black capitalize ${STATUS_STYLES[selected.claim_status] || ""}`}>
                  {selected.claim_status}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-500">User</span><span className="font-semibold">{selected.user?.fullName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold">{selected.user?.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Policy</span><span className="font-semibold">{selected.policy?.policyName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-semibold">{selected.claim_type}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-black text-blue-700">{formatInr(selected.claim_amount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Purchase #</span><span className="font-semibold">{selected.purchase?.purchase_number}</span></div>
              </div>

              {selected.claim_reason && (
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-slate-500 mb-1 font-bold">Reason</p>
                  <p className="text-slate-700 font-semibold leading-relaxed">{selected.claim_reason}</p>
                </div>
              )}

              {selected.doc_name && (
  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
    <p className="text-slate-500 mb-1 font-bold">Document</p>

    <a
      href={selected.doc_name}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 font-black underline break-all"
    >
      View Document
    </a>
  </div>
)}

              {/* Admin note */}
              <AdminNoteBox claim={selected} onSave={(note) => {
                handleStatusChange(selected._id, selected.claim_status); 
                apiRequest(`/api/admin/claims/${selected._id}`, {
                  useAdminToken: true,
                  method: "PATCH",
                  body: JSON.stringify({ notes: note }),
                });
                setSelected((p) => ({ ...p, admin_review: note }));
              }} />
            </div>

            {/* Claim Workflow Steps */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Claim Workflow</p>
              {claimSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-xs">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {i + 1}
                  </div>
                  <span className="font-semibold text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Inline admin note sub-component
const AdminNoteBox = ({ claim, onSave }) => {
  const [note, setNote] = useState(claim.admin_review || "");
  return (
    <div className="rounded-xl border border-slate-100 p-3 space-y-2">
      <p className="text-slate-500 font-bold text-xs">Admin Note</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-400 resize-none"
        placeholder="Add internal review note..."
      />
      <button
        onClick={() => onSave(note)}
        className="w-full rounded-xl bg-slate-900 py-2 text-xs font-black text-white hover:bg-blue-700 transition-colors"
      >
        Save Note
      </button>
    </div>
  );
};

export default ClaimsPage;