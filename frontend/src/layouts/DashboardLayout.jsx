import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  User,
  PhoneCall,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/useAuth";
import FloatingAiAssistant from "../components/FloatingAiAssistant";
import { apiRequest } from "../utils/api";
import { getStoredTheme, setHtmlTheme, STORAGE_THEME } from "../utils/theme";

const STORAGE_SETTINGS = "agile_insurance_system_settings_v1";
// Dashboard brand logo path. Replace the SVG in public/ to refresh the sidebar and favicon branding.
const AGILE_LOGO_SRC = "/agile-insurance-logo.svg";

const readPortalSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_SETTINGS);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const getNavItems = (settings) => [
  { label: "Dashboard Overview", icon: LayoutDashboard, to: "/dashboard" },

  { label: "My Policies", icon: BadgeCheck, to: "/dashboard/policies" },

  settings?.configuration?.claimsModule && {
    label: "Claim Management",
    icon: Sparkles,
    to: "/dashboard/claims",
  },

  settings?.configuration?.paymentsModule && {
    label: "Payment History",
    icon: CreditCard,
    to: "/dashboard/payments",
  },

  settings?.configuration?.documentsModule && {
    label: "Documents Center",
    icon: FileText,
    to: "/dashboard/documents",
  },

  settings?.configuration?.supportModule && {
    label: "Contact Us",
    icon: PhoneCall,
    to: "/dashboard/contact",
  },

  { label: "Profile Settings", icon: User, to: "/dashboard/profile" },

  { label: "Security Settings", icon: Shield, to: "/dashboard/security" },
].filter(Boolean);





const DashboardNavList = ({
  compact = false,
  pathname,
  onNavigate,
  navItems,
}) => (
    <nav className={["scrollbar-none mt-4 flex-1 space-y-1 overflow-y-auto", compact ? "pr-0" : "pr-1"].join(" ")}>
    {navItems.map((item) => {
      const Icon = item.icon;
      const active = pathname === item.to;
      return (
        <button
          key={item.to}
          onClick={() => onNavigate(item.to)}
          className={[
            "group flex items-center rounded-2xl text-left text-sm font-semibold transition",
            compact ? "mx-auto h-14 w-14 justify-center p-0" : "w-full gap-3 px-3 py-3",
            active
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-100/70 dark:text-slate-200 dark:hover:bg-white/5",
          ].join(" ")}
          title={compact ? item.label : undefined}
        >
          <span
            className={[
              "grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition",
              active ? "bg-white/15" : "bg-slate-100 dark:bg-white/5",
            ].join(" ")}
          >
            <Icon size={18} className={active ? "text-white" : "text-blue-600 dark:text-blue-400"} />
          </span>
          {!compact && <span className="truncate">{item.label}</span>}
        </button>
      );
    })}
  </nav>
);

const DashboardUserCard = ({ compact = false, user }) =>
  compact ? null : (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-3">
        {user?.profilePhoto ? (
          <img src={user.profilePhoto} alt={user?.fullName ?? "Member"} className="h-10 w-10 rounded-2xl object-cover" />
        ) : null}
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{user?.fullName ?? "Member"}</div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
        </div>
      </div>
    </div>
  );

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme);
  const [profilePhoto, setProfilePhoto] = useState(() => user?.profilePhoto || "");
  const [portalName, setPortalName] = useState(() => readPortalSettings().companyName || "Agile Insurance");
  // The top-right profile control intentionally shows only the user's first initial.
  const profileInitial = (user?.fullName?.trim()?.[0] || user?.email?.trim()?.[0] || "A").toUpperCase();
  const displayUser = { ...user, profilePhoto };
  const [systemSettings, setSystemSettings] = useState(null);
  const navItems = useMemo(
    () => getNavItems(systemSettings),
    [systemSettings]
  );

console.log(systemSettings);
  
  useEffect(() => {
  const loadSettings = async () => {
    try {
      const response = await apiRequest("/api/admin/settings");

      setSystemSettings(response.data);

      console.log("Loaded Settings:", response.data);
    } catch (error) {
      console.error("Error loading system settings:", error);
    }
  };

  loadSettings();
}, []);

  useEffect(() => {
    setHtmlTheme(theme);
    localStorage.setItem(STORAGE_THEME, theme);
  }, [theme]);

  useEffect(() => {
    const syncProfile = (event) => setProfilePhoto(event.detail?.profilePhoto || "");
    const syncSettings = () => {
      const settings = readPortalSettings();
      setPortalName(settings.companyName || "Agile Insurance");
    };

    syncSettings();
    window.addEventListener("agile-profile-updated", syncProfile);
    window.addEventListener("agile-settings-updated", syncSettings);
    return () => {
      window.removeEventListener("agile-profile-updated", syncProfile);
      window.removeEventListener("agile-settings-updated", syncSettings);
    };
  }, []);

  const activeLabel = useMemo(() => {
    const match = navItems.find((i) => i.to === location.pathname);
    return match?.label ?? "Agile Insurance";
  }, [location.pathname, navItems]);

  const goTo = (to) => {
    navigate(to);
    setMobileOpen(false);
  };

  const doLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };


  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#070B14] dark:text-slate-100">
      <div className="mx-auto flex h-full max-w-[1600px]">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 hidden h-screen shrink-0 border-r border-slate-200/70 bg-white/70 backdrop-blur-xl transition-[width] duration-300 dark:border-white/10 dark:bg-white/5 lg:flex",
            collapsed ? "w-[88px]" : "w-[300px]",
          ].join(" ")}
        >
          <div className="flex w-full flex-col px-4 py-6">
            <div className={["flex items-center gap-2", collapsed ? "justify-center" : "justify-between"].join(" ")}>
              {!collapsed && (
                <button
                  onClick={() => navigate("/")}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-slate-100/70 dark:hover:bg-white/5"
                  aria-label="Go to homepage"
                >
                  <img src={AGILE_LOGO_SRC} alt="Agile Insurance logo" className="h-11 w-11 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate text-base font-black leading-tight">{portalName}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      AI-powered insurance portal
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => setCollapsed((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu size={18} />
              </button>
            </div>

            <DashboardNavList compact={collapsed} pathname={location.pathname} onNavigate={goTo} navItems={navItems} />

            <div className="mt-4 space-y-2">
              <DashboardUserCard compact={collapsed} user={displayUser} />
              <button
                onClick={doLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100/70 dark:text-slate-200 dark:hover:bg-white/5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 dark:bg-white/5">
                  <LogOut size={18} className="text-slate-700 dark:text-slate-200" />
                </span>
                {!collapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        <main className={["scrollbar-none h-screen min-w-0 flex-1 overflow-y-auto transition-[margin] duration-300", collapsed ? "lg:ml-[88px]" : "lg:ml-[300px]"].join(" ")}>
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#070B14]/80 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu size={18} />
                </button>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400 sm:text-sm">
                    {activeLabel}
                  </div>
                  <div className="truncate text-base font-black tracking-tight sm:text-xl">{portalName}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 xl:hidden">
                <button
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/15"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              <div className="hidden items-center gap-3 xl:flex">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    placeholder="Search policies, claims, invoices..."
                    className="w-[300px] rounded-2xl border border-slate-200 bg-white px-12 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 2xl:w-[360px]"
                  />
                </div>

                <button
                  onClick={() => navigate("/health-insurance")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/15"
                >
                  <BadgeCheck size={18} />
                  Buy Policy
                </button>

                <button
                  onClick={() => navigate("/dashboard/contact")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                >
                  <PhoneCall size={18} />
                  Contact Us
                </button>

                <button
                  onClick={() => navigate("/dashboard/notifications")}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/15"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                </button>

                <button
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/15"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === "dark" ? "Light" : "Dark"}
                </button>

                <button
                  onClick={() => navigate("/dashboard/profile")}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5"
                  aria-label="Profile"
                  title="Profile"
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={user?.fullName ?? "Profile"} className="h-10 w-10 rounded-2xl object-cover" />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-white">
                      {profileInitial}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                className="absolute inset-0 bg-slate-950/50"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation overlay"
              />
              <aside className="relative flex h-full w-[min(88vw,340px)] flex-col border-r border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#070B14]">
                <button
                  onClick={() => goTo("/")}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-slate-100/70 dark:hover:bg-white/5"
                >
                  <img src={AGILE_LOGO_SRC} alt="Agile Insurance logo" className="h-11 w-11 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate text-base font-black leading-tight">{portalName}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">AI-powered portal</div>
                  </div>
                </button>
                <DashboardNavList   compact={collapsed}
 pathname={location.pathname} onNavigate={goTo} navItems={navItems} />
                <div className="mt-4 space-y-2">
                  <DashboardUserCard user={displayUser} />
                  <button
                    onClick={doLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100/70 dark:text-slate-200 dark:hover:bg-white/5"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 dark:bg-white/5">
                      <LogOut size={18} className="text-slate-700 dark:text-slate-200" />
                    </span>
                    <span>Logout</span>
                  </button>
                </div>
              </aside>
            </div>
          )}

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="px-3 py-6 sm:px-4 lg:px-8"
          >
            <Outlet />
          </motion.div>
          <FloatingAiAssistant contextLabel="Agile AI Support" />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
