// src/components/shared/index.jsx
import { useMemo } from "react";
import { Eye, Edit3, CheckCircle2, Trash2 } from "lucide-react";
import { statusClass } from "../../../utils/helpers";

// ─── DataTable ────────────────────────────────────────────────────────────────
export const DataTable = ({ columns, rows, renderActions }) => (
  <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          {columns.map((h) => <th key={h} className="px-3 py-3 font-black">{h}</th>)}
          {renderActions && <th className="px-3 py-3 font-black">Actions</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {rows.map((row) => (
          <tr key={row.id || row.name || row.user || row.type}>
            {columns.map((col) => {
              const key = col.toLowerCase().replaceAll(" ", "");
              const value = row[key] ?? row[col.toLowerCase()] ?? row[col] ?? row.state ?? "";
              return (
                <td key={col} className="px-3 py-4 font-semibold text-slate-700">
                  {String(value).match(/active|pending|approved|review|open|inactive|draft|verification|re-upload/i)
                    ? <span className={`rounded-lg px-2 py-1 text-xs font-black ring-1 ${statusClass(value)}`}>{value}</span>
                    : value}
                </td>
              );
            })}
            {renderActions && <td className="px-3 py-4">{renderActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export const SectionTitle = ({ icon: Icon, title, action }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
        <Icon size={18} />
      </span>
      <h2 className="truncate text-base font-black text-slate-950">{title}</h2>
    </div>
    {action}
  </div>
);

// ─── ActionButton ─────────────────────────────────────────────────────────────
export const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
    title={label} aria-label={label}
  >
    <Icon size={16} />
  </button>
);

// ─── RowActionButtons ─────────────────────────────────────────────────────────
export const RowActionButtons = ({ onView, onEdit, onApprove, onDelete }) => (
  <div className="flex gap-1">
    {onView   && <ActionButton icon={Eye}          label="View"    onClick={onView} />}
    {onEdit   && <ActionButton icon={Edit3}        label="Edit"    onClick={onEdit} />}
    {onApprove && <ActionButton icon={CheckCircle2} label="Approve" onClick={onApprove} />}
    {onDelete  && <ActionButton icon={Trash2}       label="Delete"  onClick={onDelete} />}
  </div>
);

// ─── MiniBars ─────────────────────────────────────────────────────────────────
export const MiniBars = ({ values = [60, 75, 45, 90, 65, 80, 55, 70, 85, 50, 95, 78], color = "#2563eb" }) => (
  <div className="flex h-28 items-end gap-2">
    {values.map((v, i) => (
      <div key={i} className="flex flex-1 items-end">
        <div className="w-full rounded-t" style={{ height: `${v}%`, backgroundColor: color }} />
      </div>
    ))}
  </div>
);

// ─── LineSpark ────────────────────────────────────────────────────────────────
export const LineSpark = ({ values = [30, 55, 40, 70, 50, 85, 60, 75, 45, 90, 65, 80], color = "#2563eb" }) => {
  const points = useMemo(() => {
    const max = Math.max(...values), min = Math.min(...values);
    const range = Math.max(max - min, 1);
    return values.map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 260;
      const y = 96 - ((v - min) / range) * 82;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [values]);

  return (
    <svg viewBox="0 0 260 110" className="h-28 w-full" aria-label="Trend line chart">
      <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {points.split(" ").map((pt) => {
        const [x, y] = pt.split(",");
        return <circle key={pt} cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="3" />;
      })}
    </svg>
  );
};

// ─── EditPanel ────────────────────────────────────────────────────────────────
export const EditPanel = ({ editingRecord, onClose, onChange, onSave, onSend }) => {
  if (!editingRecord) return null;
  const editFieldsByKind = {
    users: ["name", "email", "phone", "address", "policies", "status", "city"],
    claims: ["id", "user", "policy", "amount", "status", "officer", "description", "docName"],
    policies: ["name", "type", "coverage", "premium", "duration", "state"],
    documents: ["type", "owner", "status", "note"],
    // requirements: ["user", "age", "budget", "coverage", "status"],
    support: ["id", "user", "subject", "priority", "status"],
  };
  const fields = editFieldsByKind[editingRecord.kind] || Object.keys(editingRecord.draft);

  return (
    <section className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-5">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="text-sm font-black text-blue-950">Edit {editingRecord.kind}</div>
          <div className="mt-1 text-xs font-bold text-blue-700">Make changes, save locally, or send the edited details to the user.</div>
        </div>
        <button onClick={onClose} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">✕ Close</button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <label key={field} className="block">
            <span className="text-xs font-black uppercase tracking-wide text-blue-700">{field.replace(/([A-Z])/g, " $1")}</span>
            <input
              value={editingRecord.draft[field] ?? ""}
              onChange={(e) => onChange({ [field]: field === "policies" || field === "age" ? Number(e.target.value) : e.target.value })}
              className="mt-2 h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700">Save Changes</button>
        <button onClick={onSend} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-700">Send to User</button>
      </div>
    </section>
  );
};
