"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Analytics route failed:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
      <h2 className="text-xl font-extrabold tracking-normal">Analytics could not load</h2>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-red-800">
        A runtime error stopped the dashboard. Retry the page, and check the browser console or Firebase permissions if it happens again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-sm font-extrabold text-red-900 transition hover:bg-red-200"
      >
        <RotateCw className="size-4" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}
