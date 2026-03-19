import React, { useState } from "react";
import { PackageCheck } from "lucide-react";

const MaterialsReceivedPage: React.FC = () => {
  const checklistItems = [
    "EVM Machine",
    "VVPAT",
    "Ballot Unit",
    "Control Unit",
    "Pen",
    "Sealing Material",
    "Statutory Forms",
    "Indelible Ink",
  ];

  const [pollingStation, setPollingStation] = useState("");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((name) => name !== item) : [...prev, item]
    );
    setSubmitted(false);
  };

  const canSubmit = pollingStation.trim().length > 0 && checkedItems.length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    // Placeholder for API integration.
    setSubmitted(true);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
          <PackageCheck className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Check Materials Received
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Verify EVM kits and election logistics received by the team.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="polling-station"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            Polling Station
          </label>
          <input
            id="polling-station"
            type="text"
            value={pollingStation}
            onChange={(event) => {
              setPollingStation(event.target.value);
              setSubmitted(false);
            }}
            placeholder="Enter polling station"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-800">Materials Checklist</p>
          <p className="mt-1 text-xs text-gray-500">
            Select all materials received at this polling station.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {checklistItems.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={checkedItems.includes(item)}
                  onChange={() => toggleItem(item)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Checklist
          </button>
          <span className="text-xs text-gray-500">
            {checkedItems.length} item{checkedItems.length === 1 ? "" : "s"} selected
          </span>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Checklist submitted for polling station {pollingStation.trim()}.
          </div>
        ) : null}
      </form>
    </section>
  );
};

export default MaterialsReceivedPage;
