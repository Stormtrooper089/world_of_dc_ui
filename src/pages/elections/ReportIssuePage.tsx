import React from "react";
import { AlertTriangle, Send } from "lucide-react";

const ReportIssuePage: React.FC = () => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100">
          <AlertTriangle className="h-5 w-5 text-rose-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
          <p className="mt-1 text-sm text-gray-600">
            Raise field incidents for immediate review by election control teams.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <input
          type="text"
          placeholder="Polling Station or Team"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <input
          type="text"
          placeholder="Issue title"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <textarea
          placeholder="Describe the issue"
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <button
          type="button"
          className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          <Send className="mr-2 h-4 w-4" />
          Submit Issue
        </button>
      </div>
    </section>
  );
};

export default ReportIssuePage;
