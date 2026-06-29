import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

// Guards private pages. Change redirect behavior or loading state markup here.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-white dark:bg-[#070B14]">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="h-2 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-white/20" />
          <div className="mt-4 h-10 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />
          <div className="mt-3 h-10 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />
          <div className="mt-3 h-10 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
