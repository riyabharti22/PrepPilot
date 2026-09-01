import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SetupPage from "./pages/SetupPage.jsx";
import InterviewPage from "./pages/InterviewPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/interview/:id" element={<InterviewPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
