import React, { useEffect, useState } from "react";
import { Car, Phone, PhoneCall, Search, Users, Navigation } from "lucide-react";
import {
  electionsService,
  MAX_MEMBER_RESULTS,
  PollingPartyOptions,
  PollingParty,
  PollingPartyMember,
  VehicleDetails,
} from "../../services/electionsService";
import { StationPicker, VehicleCell, SkeletonCards } from "./shared";

const ROLE_LABELS: Record<string, string> = {
  PRESIDING_OFFICER: "Presiding Officer",
  POLLING_OFFICER_1: "Polling Officer 1",
  POLLING_OFFICER_2: "Polling Officer 2",
  POLLING_OFFICER_3: "Polling Officer 3",
  RESERVE_OFFICER: "Reserve Officer",
};

// ─── Main component ────────────────────────────────────────────────────────────
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
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Unable to load polling station options."
        );
      } finally {
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleSearch = async () => {
    if (!psName.trim() && !mobile.trim()) {
      setError("Enter a polling station or mobile number to search.");
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
            "Unable to fetch team details. Please try again."
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

  const party = parties[0] ?? null;

  return (
    <section className="space-y-4">
      {/* ── Search card ─────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <Users className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Find Your Team</h2>
            <p className="text-xs text-gray-500">Search by polling station or mobile</p>
          </div>
        </div>

        {!isOnline && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            ⚠ Working offline — data will sync when connected.
          </div>
        )}

        <div className="mt-4 space-y-2.5">
          {/* Custom dropdown */}
          <StationPicker
            value={psName}
            onChange={setPsName}
            options={options.pollingStations}
            disabled={isLoadingOptions}
          />

          {/* Mobile input */}
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile number (optional)"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="sticky bottom-16 z-10 mt-3 flex gap-2 sm:static">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </button>
          {searched && (
            <button
              type="button"
              onClick={handleClear}
              className="min-h-[48px] rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 active:scale-[0.98]"
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* ── Empty state ──────────────────────────────────── */}
      {!searched && !isLoading && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">Search to view your team</p>
        </div>
      )}

      {searched && isLoading && <SkeletonCards />}

      {searched && !isLoading && !error && party === null && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 py-12 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No polling party found.</p>
          <p className="mt-1 text-xs text-gray-400">Try a different search.</p>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────── */}
      {party !== null && !isLoading && (
        <>
          {/* Station banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 text-white shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">
              Polling Station
            </p>
            <p className="mt-1 text-lg font-bold leading-snug">{party.psName || "—"}</p>
            <p className="mt-0.5 text-sm text-blue-100">PS No: {party.psNo || "—"}</p>
          </div>

          {/* Vehicle card */}
          {vehicles.length > 0 ? (
            vehicles.map((v) => (
              <div
                key={v.id}
                className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                    <Car className="h-4 w-4 text-indigo-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                      Your Vehicle
                    </p>
                    <p className="text-base font-bold text-indigo-900">{v.vehicleNo ?? "—"}</p>
                  </div>
                  {v.vehicleType && (
                    <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {v.vehicleType}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-px bg-gray-100">
                  {v.capacity != null && (
                    <VehicleCell label="Capacity" value={`${v.capacity} seats`} />
                  )}
                  {v.driverName && <VehicleCell label="Driver" value={v.driverName} />}
                  {v.route && <VehicleCell label="Route" value={v.route} fullWidth />}
                  {v.parkingAddress && (
                    <VehicleCell label="Parking" value={v.parkingAddress} fullWidth />
                  )}
                  {v.remarks && <VehicleCell label="Remarks" value={v.remarks} fullWidth />}
                </div>

                <div className="flex gap-2 p-3">
                  {v.driverMobile && (
                    <a
                      href={`tel:${v.driverMobile}`}
                      className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98]"
                    >
                      <PhoneCall className="h-4 w-4" />
                      Call Driver
                    </a>
                  )}
                  {v.location && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${v.location.y},${v.location.x}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98]"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
              <Car className="h-5 w-5 shrink-0 text-gray-300" />
              <p className="text-sm text-gray-400">No vehicle assigned to this station.</p>
            </div>
          )}

          {/* Team members */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <Users className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-gray-700">Party Members</p>
              <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {(party.members ?? []).filter((m: PollingPartyMember) => m.name).length}
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {(party.members ?? [])
                .filter((m: PollingPartyMember) => Boolean(m.name))
                .map((m: PollingPartyMember, idx: number) => (
                  <li key={`${party.id}-${idx}`} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                      {(m.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-500">
                        {ROLE_LABELS[m.role] || m.role.split("_").join(" ")}
                      </p>
                    </div>
                    {m.mobile ? (
                      <a
                        href={`tel:${m.mobile}`}
                        aria-label={`Call ${m.name}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:scale-95"
                      >
                        <PhoneCall className="h-4 w-4" />
                      </a>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                        <Phone className="h-4 w-4" />
                      </div>
                    )}
                  </li>
                ))}
              {(party.members ?? []).filter((m: PollingPartyMember) => m.name).length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-gray-400">
                  No member details available.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </section>
  );
};

export default TeamDirectory;
