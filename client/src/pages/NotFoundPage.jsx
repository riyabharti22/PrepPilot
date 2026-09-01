import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <Compass size={40} className="text-lavender-400" />
      <h1 className="mt-4 font-display text-2xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 text-navy-700/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to PrepPilot
      </Link>
    </div>
  );
}
