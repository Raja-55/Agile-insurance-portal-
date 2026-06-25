import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import FloatingAiAssistant from "../components/FloatingAiAssistant";

// Public site shell. Header, footer, scroll behavior, and floating AI labels are attached here.
const PublicLayout = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-[#070B14]">
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
      <FloatingAiAssistant contextLabel="Agile AI" />
    </div>
  );
};

export default PublicLayout;
