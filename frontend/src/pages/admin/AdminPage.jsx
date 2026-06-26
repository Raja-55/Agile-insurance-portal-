// src/components/pages/AdminPage.jsx
/**
 * Root admin shell.
 * This file is intentionally slim — it wires routing, sidebar, header,
 * and the right panel together. All page content lives in its own file.
 */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import AdminSidebar from "../../components/admin/layout/AdminSidebar";
import AdminHeader from "../../components/admin/layout/AdminHeader";
import RightPanel from "../../components/admin/layout/RightPanel";

import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import UsersPage from "./UsersPage";
import ClaimsPage from "./ClaimsPage";
import SupportPage from "./SupportPage";
import AuditLogPage from "./AuditLogPage";
import AdminProfilePage from "./AdminProfilePage";
// Lightweight stubs for remaining pages (add full components as needed)
import PoliciesPage from "./PoliciesPage";
import DocumentsPage from "./DocumentsPage";
// import RequirementsPage from "./RequirementsPage";
import SettingsPage from "./SettingsPage";

import { EditPanel } from "../../components/admin/shared";

import { setActivePage, setMobileOpen, setSidebarCollapsed, clearEditingRecord, updateEditingDraft } from "../../store/slices/uiSlice";
import { useAdminActions } from "../../hooks/useAdminActions";

const pageMap = {
  dashboard: Dashboard,
  users: UsersPage,
  claims: ClaimsPage,
  // requirements: RequirementsPage,
  support: SupportPage,
  policies: PoliciesPage,
  documents: DocumentsPage,
  reports: () => <PlaceholderPage title="Reports & Analytics" />,
  notifications: () => <PlaceholderPage title="Notification Center" />,
  profile: AdminProfilePage,
  auditlog: AuditLogPage,
  settings: SettingsPage,
  "setting-detail": SettingsPage,
};

const PlaceholderPage = ({ title }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="text-lg font-black text-slate-950">{title}</div>
    <p className="mt-2 text-sm text-slate-500">This section is available — add the full page component here.</p>
  </section>
);

const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { activePage, mobileOpen, sidebarCollapsed, editingRecord } = useSelector((s) => s.ui);
  const { handleLogout, openPage, hydrateAllData, log } = useAdminActions();

  // Sync URL → activePage
  useEffect(() => {
    const seg = location.pathname.replace(/^\/admin\/?/, "").split("/")[0] || "dashboard";
    const valid = Object.keys(pageMap).includes(seg) ? seg : "dashboard";
    dispatch(setActivePage(valid));
  }, [location.pathname, dispatch]);

  // Hydrate backend data on auth
  useEffect(() => {
    if (isAuthenticated) hydrateAllData();
  }, [isAuthenticated]);

  // Sidebar nav click delegation (sidebar uses data-page attribute)
  const handleSidebarNav = (e) => {
    const btn = e.target.closest("[data-page]");
    if (btn) openPage(btn.dataset.page);
  };

  if (!isAuthenticated) return <AdminLogin />;

  const PageComponent = pageMap[activePage] || Dashboard;

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex h-full min-h-0">
        {/* Desktop sidebar */}
        <div onClick={handleSidebarNav}>
          <AdminSidebar
            onLogout={() => { log("Authentication / Logout"); handleLogout(); }}
          />
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-slate-950/50" onClick={() => dispatch(setMobileOpen(false))} aria-label="Close menu" />
            <div className="relative h-full" onClick={handleSidebarNav}>
              <AdminSidebar mobile onLogout={() => { log("Authentication / Logout"); handleLogout(); }} />
              <button className="absolute right-4 top-4 rounded-lg bg-white p-2 text-slate-700 shadow" onClick={() => dispatch(setMobileOpen(false))}>
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <AdminHeader
            onMenuOpen={() => dispatch(setMobileOpen(true))}
            onNavigate={openPage}
          />

          <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="scrollbar-none min-h-0 overflow-y-auto p-4 sm:p-6">
              {/* Shared edit panel */}
              <EditPanel
                editingRecord={editingRecord}
                onClose={() => dispatch(clearEditingRecord())}
                onChange={(changes) => dispatch(updateEditingDraft(changes))}
                onSave={() => {
                  // Dispatch save logic — connect to slice updateUser/updateClaim etc.
                  dispatch(clearEditingRecord());
                }}
                onSend={() => {
                  dispatch(clearEditingRecord());
                }}
              />
              <PageComponent />
            </section>

            <RightPanel
  onNavigate={openPage}
  currentPage={activePage}
/>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
