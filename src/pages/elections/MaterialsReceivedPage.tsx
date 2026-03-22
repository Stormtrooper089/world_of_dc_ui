import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import {
  electionsService,
  MaterialItem,
  MaterialsData,
} from "../../services/electionsService";

const MaterialsReceivedPage: React.FC = () => {
  // Options
  const [psNames, setPsNames] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Selection
  const [psName, setPsName] = useState("");
  const [optionsError, setOptionsError] = useState("");

  // Materials state
  const [materialsData, setMaterialsData] = useState<MaterialsData | null>(null);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Checklist interaction — track checked names
  const [checkedNames, setCheckedNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const lastFetchedPs = useRef("");

  // Load PS name options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const opts = await electionsService.getPollingPartyOptions();
        setPsNames(opts.pollingStations);
      } catch {
        setOptionsError("Unable to load polling station options.");
      } finally {
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  // Fetch materials whenever the typed value exactly matches a known PS name
  useEffect(() => {
    const trimmed = psName.trim();
    if (!trimmed || !psNames.includes(trimmed) || trimmed === lastFetchedPs.current) return;

    const fetchMaterials = async () => {
      lastFetchedPs.current = trimmed;
      setMaterialsData(null);
      setCheckedNames([]);
      setFetchError("");
      setSubmitError("");
      setSubmitSuccess(false);
      try {
        setIsLoadingMaterials(true);
        const data = await electionsService.getMaterials(trimmed);
        setMaterialsData(data);
        // Pre-check items already marked received
        setCheckedNames(data.items.filter((i) => i.received).map((i) => i.name));
      } catch (err: any) {
        setFetchError(
          err?.response?.data?.message ||
            "Unable to load materials for this polling station."
        );
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, [psName, psNames]);

  const handlePsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPsName(val);
    // Reset if user clears or changes to a different station
    if (val.trim() !== lastFetchedPs.current) {
      setMaterialsData(null);
      setCheckedNames([]);
      setFetchError("");
      setSubmitError("");
      setSubmitSuccess(false);
      lastFetchedPs.current = "";
    }
  };

  const toggleItem = (name: string) => {
    if (materialsData?.submitted) return;
    setCheckedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
    setSubmitSuccess(false);
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psName.trim() || materialsData?.submitted) return;
    try {
      setIsSubmitting(true);
      setSubmitError("");
      const updatedItems: MaterialItem[] = materialsData!.items.map((item) => ({
        name: item.name,
        received: checkedNames.includes(item.name),
      }));
      await electionsService.submitMaterials(psName.trim(), updatedItems);
      setMaterialsData((prev) =>
        prev ? { ...prev, submitted: true, items: updatedItems } : prev
      );
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadySubmitted = materialsData?.submitted === true;
  const canSubmit = !isAlreadySubmitted && !isSubmitting;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <PackageCheck className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Materials Received</h2>
          <p className="mt-1 text-sm text-gray-600">
            Select your polling station to view and submit the materials checklist.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Polling Station */}
        <div>
          {optionsError && (
            <p className="mb-1.5 text-xs text-red-600">{optionsError}</p>
          )}
          {isLoadingOptions && (
            <p className="mb-1.5 text-xs text-gray-400">Loading stations…</p>
          )}
          <input
            id="polling-station"
            list="ps-names-list"
            type="text"
            value={psName}
            onChange={handlePsChange}
            placeholder="Search or select polling station"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <datalist id="ps-names-list">
            {psNames.map((ps) => (
              <option key={ps} value={ps} />
            ))}
          </datalist>
        </div>

        {/* Loading materials */}
        {isLoadingMaterials && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading checklist…
          </div>
        )}

        {/* Fetch error */}
        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        {/* Already submitted banner */}
        {isAlreadySubmitted && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Checklist already submitted for this polling station.
          </div>
        )}

        {/* Checklist */}
        {materialsData && !isLoadingMaterials && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">Materials Checklist</p>
            {!isAlreadySubmitted && (
              <p className="mt-1 text-xs text-gray-500">
                Select all materials received at this polling station.
              </p>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {materialsData.items.length === 0 ? (
                <p className="col-span-2 text-sm text-gray-500">No materials listed for this station.</p>
              ) : (
                materialsData.items.map((item) => {
                  const checked = checkedNames.includes(item.name);
                  return (
                    <label
                      key={item.name}
                      className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 text-base transition-colors ${
                        isAlreadySubmitted ? "cursor-default" : "cursor-pointer"
                      } ${
                        checked
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-gray-200 bg-white text-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(item.name)}
                        disabled={isAlreadySubmitted}
                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-default"
                      />
                      <span>{item.name}</span>
                      {checked && (
                        <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        {materialsData && !isAlreadySubmitted && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-gray-500">
                {checkedNames.length} of {materialsData.items.length} item
                {materialsData.items.length === 1 ? "" : "s"} selected
              </span>
            </div>

            <div className="sticky bottom-2 z-10 rounded-xl bg-white/95 p-2 backdrop-blur sm:static sm:bg-transparent sm:p-0">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5 sm:text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSubmitting ? "Submitting…" : "Submit Checklist"}
              </button>
            </div>
          </>
        )}

        {/* Submit error */}
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Submit success */}
        {submitSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Checklist submitted successfully for {psName.trim()}.
          </div>
        )}
      </form>
    </section>
  );
};

export default MaterialsReceivedPage;
