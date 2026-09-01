import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, History } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const isDark = location.pathname === "/";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        isDark
          ? "border-white/10 bg-navy-950/70 text-white"
          : "border-navy-700/10 bg-white/80 text-navy-900"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-lavender-400 to-lavender-600 text-white">
            <Compass size={18} />
          </span>
          PrepPilot
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/history"
            className={`hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex ${
              isDark ? "text-white/70 hover:text-white" : "text-navy-700 hover:text-lavender-600"
            }`}
          >
            <History size={16} />
            History
          </Link>
          <Link to="/setup" className="btn-primary !px-4 !py-2 text-sm">
            Start Mock Interview
          </Link>
        </nav>
      </div>
    </header>
  );
}
