import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatAssistant from "./components/ChatAssistant";
import LandingPage from "./pages/LandingPage";
import ProductsPage from "./pages/ProductsPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import StaffPortal from "./pages/StaffPortal";
import GalleryPage from "./pages/GalleryPage";
import ReceiptValidationPage from "./pages/ReceiptValidationPage";
import { subscribeProducts, syncProducts } from "./data/productStore";

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isStandalone = isAdmin || location.pathname === "/staff" || location.pathname === "/receipt/validate";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || location.pathname === "/staff") return;
    void syncProducts();
    return subscribeProducts(() => {});
  }, [location.pathname]);

  return (
    <>
      {!isStandalone && <Header />}
      <div key={location.pathname} className="page-wrapper animate-page-enter">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/staff" element={<StaffPortal />} />
          <Route path="/receipt/validate" element={<ReceiptValidationPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
      {!isStandalone && <Footer />}
      {!isStandalone && <ChatAssistant />}
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f5f8f5] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
