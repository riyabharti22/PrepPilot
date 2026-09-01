import React from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export function ErrorBanner({ message, onDismiss, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 font-semibold underline underline-offset-2">
          Retry
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-rose-400 hover:text-rose-600">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function LoadingBlock({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-navy-700/70">
      <Loader2 size={28} className="animate-spin text-lavender-500" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-navy-700/15 px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender-200/50 text-lavender-600">
          <Icon size={26} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-navy-900">{title}</h3>
      {description && <p className="max-w-sm text-sm text-navy-700/60">{description}</p>}
      {action}
    </div>
  );
}
