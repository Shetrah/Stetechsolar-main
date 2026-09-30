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
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";
import { syncProducts } from "./data/productStore";

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <>
      {!isAdmin && <Header />}
      <div key={location.pathname} className="page-wrapper animate-page-enter">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
      {!isAdmin && <Footer />}
      {!isAdmin && <ChatAssistant />}
    </>
  );
};

function App() {
  useEffect(() => { void syncProducts(); }, []);
  return (
    <Router>
      <div className="min-h-screen bg-[#f5f8f5] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
