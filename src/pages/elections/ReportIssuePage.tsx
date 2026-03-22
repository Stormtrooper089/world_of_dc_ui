import React, { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { electionsService } from "../../services/electionsService";

const ReportIssuePage: React.FC = () => {
  const [psNames, setPsNames] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [psName, setPsName] = useState("");
  const [severity, setSeverity] = useState<"MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadPollingStations = async () => {
    setIsLoadingOptions(true);
    setOptionsError("");
    try {
      const opts = await electionsService.getPollingPartyOptions();
      setPsNames(opts.pollingStations);
    } catch {
      setOptionsError("Unable to load polling station options.");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadPollingStations();
  }, []);

  const isFormValid = !!psName.trim() && !!mobileNo.trim() && !!title.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess(false);

      await electionsService.submitElectionComplaint({
        name: name.trim(),
        mobileNo: mobileNo.trim(),
        psName: psName.trim(),
        severity,
        title: title.trim(),
        description: description.trim(),
      });

      setSubmitSuccess(true);
      setName("");
      setMobileNo("");
      setPsName("");
      setSeverity("MEDIUM");
      setTitle("");
      setDescription("");
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message || "Unable to submit issue. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="issue-name" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Name
            </label>
            <input
              id="issue-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSubmitError("");
                setSubmitSuccess(false);
              }}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <div>
            <label htmlFor="mobile-no" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Mobile Number <span className="text-rose-600">*</span>
            </label>
            <input
              id="mobile-no"
              type="tel"
              inputMode="numeric"
              value={mobileNo}
              onChange={(event) => {
                setMobileNo(event.target.value);
                setSubmitError("");
                setSubmitSuccess(false);
              }}
              placeholder="Enter mobile number"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ps-name" className="mb-1.5 block text-sm font-semibold text-gray-700">
            Polling Station <span className="text-rose-600">*</span>
          </label>
          {optionsError && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <span>{optionsError}</span>
              <button
                type="button"
                onClick={loadPollingStations}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}
          {isLoadingOptions && (
            <p className="mb-2 inline-flex items-center text-xs text-gray-500">
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Loading polling stations...
            </p>
          )}
          <input
            id="ps-name"
            list="ps-name-list"
            type="text"
            value={psName}
            onChange={(e) => {
              setPsName(e.target.value);
              setSubmitError("");
              setSubmitSuccess(false);
            }}
            placeholder="Search or select polling station"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
          <datalist id="ps-name-list">
            {psNames.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="severity" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Severity
            </label>
            <select
              id="severity"
              value={severity}
              onChange={(event) => {
                setSeverity(event.target.value as "MEDIUM" | "HIGH" | "CRITICAL");
                setSubmitError("");
                setSubmitSuccess(false);
              }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="issue-title" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Issue Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSubmitError("");
                setSubmitSuccess(false);
              }}
              placeholder="Short summary of the issue"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        <div>
          <label htmlFor="issue-description" className="mb-1.5 block text-sm font-semibold text-gray-700">
            Description
          </label>
          <textarea
            id="issue-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setSubmitError("");
              setSubmitSuccess(false);
            }}
            placeholder="Provide additional details (optional)"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>

        {submitError && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Issue submitted successfully.</span>
          </div>
        )}

        <div className="sticky bottom-2 z-10 rounded-xl bg-white/95 p-2 backdrop-blur sm:static sm:bg-transparent sm:p-0">
          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-3 text-base font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Issue"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ReportIssuePage;
