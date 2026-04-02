import React, { useEffect, useState } from "react";
import { Car, MapPin, Phone, PhoneCall, Search, Users } from "lucide-react";
import {
  electionsService,
  MAX_MEMBER_RESULTS,
  PollingPartyOptions,
  PollingParty,
  PollingPartyMember,
  VehicleDetails,
} from "../../services/electionsService";

const TeamDirectory: React.FC = () => {
  const [psName, setPsName] = useState("");
  const [mobile, setMobile] = useState("");
  const [parties, setParties] = useState<PollingParty[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDetails[]>([]);
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
    if (!psName.trim() && !mobile.trim()) {
      setError("Enter polling station or mobile before searching.");
      setSearched(false);
      setParties([]);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      setSearched(true);
      const [partyResults, vehicleResults] = await Promise.allSettled([
        electionsService.searchPollingParties({
          psName: psName.trim() || undefined,
          mobile: mobile.trim() || undefined,
        }),
        psName.trim()
          ? electionsService.searchVehicles({ psName: psName.trim() })
          : Promise.resolve([]),
      ]);

      setParties(
        partyResults.status === "fulfilled"
          ? partyResults.value.slice(0, MAX_MEMBER_RESULTS)
          : []
      );
      setVehicles(
        vehicleResults.status === "fulfilled" ? vehicleResults.value : []
      );

      if (partyResults.status === "rejected") {
        setError(
          partyResults.reason?.response?.data?.message ||
            "Unable to fetch polling parties right now. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPsName("");
    setMobile("");
    setParties([]);
    setVehicles([]);
    setSearched(false);
    setError("");
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
          <Car className="h-5 w-5 text-indigo-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Find Your Team</h2>
          <p className="mt-1 text-sm text-gray-600">
            Search by polling station or mobile.
          </p>
        </div>
      </div>

      {!isOnline && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Working Offline — Data will sync when connected.
        </div>
      )}

      {isLoadingOptions && (
        <p className="mt-3 text-sm text-gray-500">Loading polling station options…</p>
      )}

      {/* Search inputs — full width on mobile, 2 cols on sm+ */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            list="polling-stations-list"
            type="text"
            value={psName}
            onChange={(e) => setPsName(e.target.value)}
            disabled={isLoadingOptions}
            placeholder="Search polling station"
            className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <datalist id="polling-stations-list">
            {options.pollingStations.map((station) => (
              <option key={station} value={station} />
            ))}
          </datalist>
        </label>

        <label className="relative block">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Search by phone number"
            className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      {/* Action buttons row */}
      <div className="sticky bottom-16 z-10 mt-4 flex gap-2 rounded-xl bg-white/95 p-2 backdrop-blur sm:static sm:bg-transparent sm:p-0">
        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading}
          className="min-h-[44px] flex-1 rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:flex-none sm:py-2 sm:text-sm"
        >
          {isLoading ? "Searching…" : "Search Members"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="min-h-[44px] rounded-lg border border-gray-200 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 sm:py-2 sm:text-sm"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!searched ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Search to view your team details.
        </div>
      ) : isLoading ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 space-y-3">
            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
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
            const roleLabels: Record<string, string> = {
              PRESIDING_OFFICER: "Presiding Officer",
              POLLING_OFFICER_1: "Polling Officer 1",
              POLLING_OFFICER_2: "Polling Officer 2",
              POLLING_OFFICER_3: "Polling Officer 3",
              RESERVE_OFFICER: "Reserve Officer",
            };

            const memberEntries: Array<{ roleLabel: string; name: string; mobile?: string }> =
              (party.members ?? [])
                .filter((m: PollingPartyMember) => Boolean(m.name))
                .map((m: PollingPartyMember) => ({
                  roleLabel: roleLabels[m.role] || m.role.split("_").join(" "),
                  name: m.name || "Not available",
                  mobile: m.mobile || undefined,
                }));

            return (
              <article
                key={party.id}
                className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-md"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white sm:px-6 sm:py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-100">
                    Polling Party Profile
                  </p>
                </div>

                {/* Stack on mobile, side-by-side on lg */}
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.2fr,1fr]">
                  {/* Party Details + Vehicle */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Party Details
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <InfoRow label="PS No" value={party.psNo} />
                      <InfoRow
                        label={
                          <span className="inline-flex items-center">
                            <MapPin className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                            PS Name
                          </span>
                        }
                        value={party.psName}
                      />
                    </div>

                    {/* Vehicle Details */}
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        Vehicle Details
                      </p>
                      {vehicles.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-400">No vehicle assigned.</p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="space-y-2 text-sm">
                              {vehicle.vehicleNo && (
                                <InfoRow
                                  label="Vehicle No"
                                  value={
                                    <span className="font-semibold text-blue-700">
                                      {vehicle.vehicleNo}
                                    </span>
                                  }
                                />
                              )}
                              {vehicle.vehicleType && (
                                <InfoRow label="Type" value={vehicle.vehicleType} />
                              )}
                              {vehicle.driverName && (
                                <InfoRow label="Driver" value={vehicle.driverName} />
                              )}
                              {vehicle.driverMobile && (
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-medium text-gray-900">Driver Mobile</span>
                                  <a
                                    href={`tel:${vehicle.driverMobile}`}
                                    className="inline-flex min-h-[36px] items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
                                  >
                                    <PhoneCall className="mr-1.5 h-3 w-3" />
                                    {vehicle.driverMobile}
                                  </a>
                                </div>
                              )}
                              {vehicle.route && (
                                <InfoRow label="Route" value={vehicle.route} />
                              )}
                              {vehicle.parkingAddress && (
                                <InfoRow label="Parking" value={vehicle.parkingAddress} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Party Members */}
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
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {entry.roleLabel}
                              </p>
                              <p className="text-sm font-medium text-gray-900 break-words">
                                {entry.name}
                              </p>
                              {entry.mobile ? (
                                <a
                                  href={`tel:${entry.mobile}`}
                                  className="mt-1 inline-flex min-h-[40px] items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 hover:bg-emerald-200"
                                >
                                  <PhoneCall className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                                  {entry.mobile}
                                </a>
                              ) : (
                                <p className="mt-0.5 text-xs text-gray-400">Mobile not available</p>
                              )}
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

/** Small helper to render a label-value row that wraps on very narrow screens */
const InfoRow: React.FC<{ label: React.ReactNode; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-0.5">
    <span className="font-medium text-gray-900">{label}</span>
    <span className="text-right text-gray-700">{value || "Not available"}</span>
  </div>
);

export default TeamDirectory;
