import { useMemo, useState } from "react";
import { FileText, FileUp, ShieldCheck, Sparkles, Download, Trash2 } from "lucide-react";
import { load, save } from "../../utils/storage";
import { fileToDataUrl } from "../../utils/api";

// Documents Center headings, upload labels, KYC status text, and vault card copy are controlled here.
const DashboardDocuments = () => {
  const [purchases, setPurchases] = useState(() => load("purchases", []));
  const [vault, setVault] = useState(() => load("documents", []));
  const [busy, setBusy] = useState(false);

  const kycStatus = useMemo(() => {
    const has = purchases.some((p) => p.kyc?.filename);
    return has ? "Verified" : "Pending upload";
  }, [purchases]);

  const upload = async (file) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      window.alert("Please upload a PDF file only.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const documents = [
        {
          id: `doc_${Date.now()}`,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl,
          createdAt: new Date().toISOString(),
        },
        ...vault,
      ];
      setVault(documents);
      save("documents", documents);
      setPurchases(load("purchases", []));
    } finally {
      setBusy(false);
    }
  };

  const removeDocument = (docId) => {
    const isFromPurchase = purchases.some((p) => p.id === docId);
    if (isFromPurchase) {
      window.alert("Policy documents generated from purchases cannot be deleted.");
      return;
    }
    const updated = vault.filter((d) => d.id !== docId);
    setVault(updated);
    save("documents", updated);
  };

  const docsFromPurchases = useMemo(() => {
    return purchases
      .map((p) => ({ id: p.id, name: `${p.policyNumber} - Policy Document.pdf`, createdAt: p.activatedAt }))
      .slice(0, 10);
  }, [purchases]);

  const allDocs = [...docsFromPurchases, ...vault];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Documents center - Local vault
            </div>
            <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">Documents</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">KYC status, policy PDFs, invoices, and uploads.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-black text-white shadow-sm hover:opacity-95">
            <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
            <FileUp size={18} />
            {busy ? "Uploading..." : "Upload PDF"}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">Documents vault</div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Manage policy, KYC, and claim documents.</div>
            </div>
            <span className="w-fit rounded-full bg-blue-600/10 px-4 py-2 text-xs font-black text-blue-700 dark:text-blue-300">
              {allDocs.length} files
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {!allDocs.length ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5 sm:p-10">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
                  <FileText size={26} />
                </div>
                <div className="mt-6 text-xl font-black text-slate-900 dark:text-white">No documents yet</div>
                <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Purchase a policy or upload a PDF document to populate your vault.
                </div>
              </div>
            ) : (
              allDocs.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-900 dark:text-white">{d.name}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {d.createdAt ? new Date(d.createdAt).toLocaleString() : "-"}
                    </div>
                  </div>
                  <div className="flex w-full gap-3 sm:w-auto">
                    <button
                      onClick={() =>
                        d.dataUrl
                          ? window.open(d.dataUrl, "_blank")
                          : window.alert("Policy document will be available after activation.")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={() => removeDocument(d.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">KYC verification</div>
            <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Status: <span className="font-black text-slate-900 dark:text-white">{kycStatus}</span>
            </div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                <Sparkles size={18} className="text-blue-600 dark:text-blue-400" />
                AI document scanning
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Document checks review validity, readability, and mismatch risk.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 text-white shadow-[0_40px_120px_rgba(2,6,23,0.35)] dark:border-white/10 sm:p-8">
            <div className="text-sm font-black">Digital signature verification</div>
            <div className="mt-2 text-sm font-semibold text-white/70">
              In a real system, signatures are verified using issuer certificates. Here it is a premium UI simulation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDocuments;
