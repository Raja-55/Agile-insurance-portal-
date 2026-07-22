// src/components/layout/RightPanel.jsx
import { useSelector } from "react-redux";

const RightPanel = ({ onNavigate, currentPage }) => {
  const { selectedProfile } = useSelector((s) => s.auth);
  const { detailPanel } = useSelector((s) => s.ui);

  const claimRows = useSelector((s) => s.claims.rows);
  const documentRows = useSelector((s) => s.documents.rows);
  const supportChats = useSelector((s) => s.support.chats);
  const requirementRows = useSelector((s) => s.ui.requirementRows);

  return (
    <aside className="hidden min-h-0 overflow-y-auto border-l border-slate-200 bg-white p-5 xl:block">
      

      <div className="space-y-5">
        {/* Admin Card */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            {selectedProfile.profilePhoto
              ? <img src={selectedProfile.profilePhoto} alt={selectedProfile.name} className="h-11 w-11 rounded-lg object-cover" />
              : <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-sm font-black text-white">{selectedProfile.initials}</span>}
            <div className="min-w-0">
              <div className="truncate text-sm font-black">{selectedProfile.name}</div>
              <div className="truncate text-xs font-semibold text-slate-500">{selectedProfile.role}</div>
            </div>
          </div>
          <div className="mt-3 text-xs font-semibold leading-5 text-slate-600">{selectedProfile.access}</div>
        </div>

        {/* Detail */}
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-sm font-black text-slate-950">{detailPanel.title}</div>
          {detailPanel.photo && <img src={detailPanel.photo} alt={detailPanel.title} className="mt-3 h-24 w-24 rounded-lg object-cover" />}
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-xs font-semibold leading-5 text-slate-100">{detailPanel.body}</pre>
        </div>

        {/* Operations Queue */}
        {/* Operations Queue - Show only on Dashboard */}
{currentPage === "dashboard" && (
  <div className="rounded-lg border border-slate-200 p-4">
    <div className="text-sm font-black text-slate-950">
      Operations Queue
    </div>

    <div className="mt-3 space-y-2 text-sm font-bold text-slate-700">
      {[
        {
          label: "Pending verifications",
          count: documentRows.filter((d) => d.status === "Pending").length,
          page: "documents",
        },
        {
          label: "Claims in review",
          count: claimRows.filter((c) => c.status === "Under Review").length,
          page: "claims",
        },
        {
          label: "Open support chats",
          count: supportChats.filter((s) => s.status !== "Resolved").length,
          page: "support",
        },
        // {
        //   label: "Quotes requested",
        //   count: requirementRows.length,
        //   page: "requirements",
        // },
      ].map(({ label, count, page }) => (
        <button
          key={label}
          onClick={() => onNavigate(page)}
          className="flex w-full justify-between rounded-lg bg-slate-50 px-3 py-3 text-left hover:bg-slate-100"
        >
          <span>{label}</span>
          <span>{count}</span>
        </button>
      ))}
    </div>
  </div>
)}

        {/* Quick Actions */}
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-sm font-black text-slate-950">Quick Actions</div>
          <div className="mt-3 grid gap-2">
            {[["Create plan", "policies"], ["Send reminder", "notifications"], ["Export claims", "reports"], ["Open audit logs", "auditlog"]].map(([label, page]) => (
              <button key={label} onClick={() => onNavigate(page)} className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-black hover:bg-slate-50">{label}</button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
