// src/components/layout/AdminSidebar.jsx
import { useSelector } from "react-redux";
import { LayoutDashboard, Users, ClipboardCheck, BadgeCheck, Headphones, FileText, ShieldCheck, BarChart3, UserCog, ScrollText, Settings, LogOut, Menu, ShieldCheck as Shield } from "lucide-react";
import { navItems } from "../../../utils/helpers";

const iconMap = {
  dashboard: LayoutDashboard, users: Users, claims: ClipboardCheck,
  // requirements: BadgeCheck, support: Headphones, policies: FileText,
  documents: ShieldCheck, reports: BarChart3, profile: UserCog,
  auditlog: ScrollText, settings: Settings,
};

const AdminSidebar = ({ mobile = false, onLogout }) => {
  const { selectedProfile } = useSelector((s) => s.auth);
  const { activePage, sidebarCollapsed } = useSelector((s) => s.ui);
  const collapsed = sidebarCollapsed && !mobile;

  const allowed = navItems.filter((item) => item.roles.includes(selectedProfile.role));

  return (
    <aside className={`
      ${mobile ? "flex" : "hidden lg:flex"}
      h-full ${collapsed ? "w-[92px]" : "w-[292px]"}
      shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-300
    `}>
      {/* Header */}
      <div className={`flex items-center gap-3 border-b border-slate-200 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        {!collapsed && (
          <>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-white">
              <Shield size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-black text-slate-950">Agile Admin</div>
              <div className="truncate text-xs font-semibold text-slate-500">{selectedProfile.role}</div>
            </div>
          </>
        )}
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-blue-300 hover:bg-blue-50">
          <Menu size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="scrollbar-none min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {allowed.map((item) => {
          const Icon = iconMap[item.id] || LayoutDashboard;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              data-page={item.id}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-sm
                ${collapsed ? "justify-center" : ""}
                ${active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"}`}
              title={item.label}
            >
              <Icon size={18} className={active ? "text-white" : "text-blue-700"} />
              {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            {selectedProfile.profilePhoto
              ? <img src={selectedProfile.profilePhoto} alt={selectedProfile.name} className="h-10 w-10 rounded-lg object-cover" />
              : <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-xs font-black text-white">{selectedProfile.initials}</span>}
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-slate-950">{selectedProfile.name}</div>
              <div className="truncate text-xs font-semibold text-slate-500">{selectedProfile.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
