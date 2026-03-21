import React, { useEffect, useState } from "react";
import { MapPin, Phone, Search, Users } from "lucide-react";
import {
  electionsService,
  MAX_MEMBER_RESULTS,
  PollingPartyOptions,
  PollingParty,
} from "../../services/electionsService";

const TeamDirectory: React.FC = () => {
  const [psName, setPsName] = useState("");
  const [partyNo, setPartyNo] = useState("");
  const [mobile, setMobile] = useState("");
  const [parties, setParties] = useState<PollingParty[]>([]);
  const [options, setOptions] = useState<PollingPartyOptions>({
    pollingStations: [],
    partyNames: [],
  });
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const response = await electionsService.getPollingPartyOptions();
        setOptions(response);
      } catch (optionsError: any) {
        setError(
          optionsError?.response?.data?.message ||
            "Unable to load polling station and party options."
        );
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleSearch = async () => {
    if (!psName.trim() && !partyNo.trim() && !mobile.trim()) {
      setError("Enter at least one search field or filter before searching.");
      setSearched(false);
      setParties([]);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      setSearched(true);
      const results = await electionsService.searchPollingParties({
        psName: psName.trim() || undefined,
        partyNo: partyNo.trim() || undefined,
        mobile: mobile.trim() || undefined,
      });
      setParties(results.slice(0, MAX_MEMBER_RESULTS));
    } catch (searchError: any) {
      setParties([]);
      setSearched(true);
      setError(
        searchError?.response?.data?.message ||
          "Unable to fetch polling parties right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
            Team Directory
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            Find Polling Party
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Search by polling station, party number, or mobile.
          </p>
        </div>
      </div>

      {!isOnline ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Working Offline - Data will sync when connected.
        </div>
      ) : null}

      {isLoadingOptions ? (
        <p className="mt-3 text-sm text-gray-500">Loading station and party options...</p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            list="polling-stations-list"
            type="text"
            value={psName}
            onChange={(event) => setPsName(event.target.value)}
            disabled={isLoadingOptions}
            placeholder="Search or select polling station"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <datalist id="polling-stations-list">
            {options.pollingStations.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </datalist>
        </label>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            list="party-names-list"
            type="text"
            value={partyNo}
            onChange={(event) => setPartyNo(event.target.value)}
            disabled={isLoadingOptions}
            placeholder="Search or select party"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <datalist id="party-names-list">
            {options.partyNames.map((party) => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </datalist>
        </label>

        <label className="relative block">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            placeholder="Search phone number"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <div className="sticky bottom-2 z-10 mt-4 rounded-xl bg-white/95 p-2 backdrop-blur md:static md:bg-transparent md:p-0">
        <button
          type="button"
          onClick={handleSearch}
          className="min-h-[44px] w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 md:w-auto md:py-2 md:text-sm"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search Members"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setPsName("");
            setPartyNo("");
            setMobile("");
            setParties([]);
            setSearched(false);
            setError("");
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!searched ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Search to view polling party details.
        </div>
      ) : isLoading ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-20 animate-pulse rounded-xl bg-gray-100 sm:col-span-2" />
          </div>
        </div>
      ) : parties.length === 0 ? (
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          No polling party found for your search.
        </div>
      ) : (
        <div className="mt-5">
          {(() => {
            const party = parties[0];
            const memberEntries = [
              { label: "Presiding Officer", value: party.presidingOfficer },
              { label: "Polling Officer 1", value: party.pollingOfficer1 },
              { label: "Polling Officer 2", value: party.pollingOfficer2 },
              { label: "Polling Officer 3", value: party.pollingOfficer3 },
              { label: "Reserve Officer", value: party.reserveOfficer },
            ].filter((entry) => Boolean(entry.value)) as Array<{
              label: string;
              value: string;
            }>;

            return (
              <article
                key={party.id}
                className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-md"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 text-white sm:px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-100">
                    Polling Party Profile
                  </p>
                </div>

                <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1.2fr,1fr]">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Party Details
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      <p className="flex items-center justify-between gap-4">
                        <span className="font-medium text-gray-900">AC No</span>
                        <span className="text-right">{party.acNo || "Not available"}</span>
                      </p>
                      <p className="flex items-center justify-between gap-4">
                        <span className="font-medium text-gray-900">PS No</span>
                        <span className="text-right">{party.psNo || "Not available"}</span>
                      </p>
                      <p className="flex items-center justify-between gap-4">
                        <span className="font-medium text-gray-900">Party</span>
                        <span className="text-right">{party.partyNo || "Not available"}</span>
                      </p>
                      <p className="flex items-start justify-between gap-4">
                        <span className="inline-flex items-center font-medium text-gray-900">
                          <MapPin className="mr-1.5 h-4 w-4 text-blue-600" />
                          PS Name
                        </span>
                        <span className="text-right">{party.psName || "Not available"}</span>
                      </p>
                      <p className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center font-medium text-gray-900">
                          <Phone className="mr-1.5 h-4 w-4 text-blue-600" />
                          Mobile
                        </span>
                        <span className="text-right font-semibold text-blue-800">
                          {party.mobile ? (
                            <a href={`tel:${party.mobile}`} className="underline-offset-2 hover:underline">
                              {party.mobile}
                            </a>
                          ) : (
                            "Not available"
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Party Members
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      {memberEntries.length === 0 ? (
                        <li className="rounded-lg bg-gray-50 px-3 py-2 text-gray-500">
                          No member names available.
                        </li>
                      ) : (
                        memberEntries.map((entry, index) => (
                          <li
                            key={`${party.id}-${index}`}
                            className="flex items-start rounded-lg bg-gray-50 px-3 py-2"
                          >
                            <Users className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {entry.label}
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {entry.value}
                              </p>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })()}
        </div>
      )}
    </section>
  );
};

export default TeamDirectory;
