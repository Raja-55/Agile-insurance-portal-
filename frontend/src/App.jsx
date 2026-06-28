import { Navigate, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AuthPage from "./pages/AuthPage";
import CategoryPage from "./pages/CategoryPage";
import PolicyDetailsPage from "./pages/PolicyDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import AdminPage from "./pages/admin/AdminPage";
import CalculatorPage from "./pages/CalculatorPage";
import InfoPage from "./pages/InfoPage";
import WhyChoosePage from "./pages/WhyChoosePage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardPolicies from "./pages/dashboard/DashboardPolicies";
import DashboardClaims from "./pages/dashboard/DashboardClaims";
import DashboardPayments from "./pages/dashboard/DashboardPayments";
import DashboardRenewals from "./pages/dashboard/DashboardRenewals";
import DashboardDocuments from "./pages/dashboard/DashboardDocuments";
import DashboardContact from "./pages/dashboard/DashboardContact";
import DashboardNotifications from "./pages/dashboard/DashboardNotifications";
import DashboardProfile from "./pages/dashboard/DashboardProfile";
import DashboardSecurity from "./pages/dashboard/DashboardSecurity";
import NotFoundPage from "./pages/NotFoundPage";
import { Provider } from "react-redux";
import { store } from "./store/adminStore";
import { Routes, useLocation } from "react-router-dom";
import useSettings from "./hooks/useSettings";
import MaintenancePage from "./pages/admin/MaintenancePage";
import ClaimProcessKnow from "./pages/ClaimProcessKnow.jsx";

// Routes are organized by layout type: public, auth-only, admin, and protected dashboard
const App = () => {
  const settings = useSettings();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  if (settings?.maintenanceMode?.enabled && !isAdmin) {
    return (
        <MaintenancePage
            message={settings.maintenanceMode.message}
        />
    );
}
  return (
    <Routes>
      {/* Public routes - includes navbar, footer, and floating AI assistant */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/claim-process-know" element={<ClaimProcessKnow />} />
        <Route path="/why-choose/:featureSlug" element={<WhyChoosePage />} />
        <Route path="/:categorySlug" element={<CategoryPage />} />
        <Route path="/policies/:policyId" element={<PolicyDetailsPage />} />
        <Route
          path="/checkout/:policyId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        {/* Footer navigation information pages */}
        <Route path="/general-insurance" element={<InfoPage />} />
        <Route path="/life-insurance" element={<InfoPage />} />
        <Route path="/term-insurance" element={<InfoPage />} />
        <Route path="/investment" element={<InfoPage />} />
        <Route path="/health-insurance" element={<InfoPage />} />
        <Route path="/other-insurance" element={<InfoPage />} />
        <Route path="/articles" element={<InfoPage />} />
        <Route path="/reviews" element={<InfoPage />} />
        <Route path="/companies" element={<InfoPage />} />
        <Route path="/newsroom" element={<InfoPage />} />
        <Route path="/awards" element={<InfoPage />} />
        <Route path="/about-us" element={<InfoPage />} />
        <Route path="/careers" element={<InfoPage />} />
        <Route path="/legal-policies" element={<InfoPage />} />
        <Route path="/contact" element={<InfoPage />} />
      </Route>

      {/* Auth routes - minimal layout (no navbar/footer) for focused authentication experience */}
      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      {/* Admin routes - specialized admin interface with role-based access */}

<Route
  path="/admin/*"
  element={
    <Provider store={store}>
      <AdminPage />
    </Provider>
  }
/>
      {/* Protected dashboard routes - requires authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="policies" element={<DashboardPolicies />} />
        <Route path="claims" element={<DashboardClaims />} />
        <Route path="payments" element={<DashboardPayments />} />
        <Route path="renewals" element={<DashboardRenewals />} />
        <Route path="documents" element={<DashboardDocuments />} />
        <Route path="contact" element={<DashboardContact />} />
        <Route path="ai-support" element={<Navigate to="/dashboard/contact" replace />} />
        <Route path="notifications" element={<DashboardNotifications />} />
        <Route path="profile" element={<DashboardProfile />} />
        <Route path="security" element={<DashboardSecurity />} />
      </Route>

      {/* Fallback routes */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
