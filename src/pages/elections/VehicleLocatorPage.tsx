import React, { useEffect, useState } from "react";
import { Car, Navigation, PhoneCall, Search } from "lucide-react";
import { electionsService, VehicleDetails } from "../../services/electionsService";
import { StationPicker, VehicleCell, SkeletonCards } from "../../components/elections/shared";

const VehicleLocatorPage: React.FC = () => {
  const [psName, setPsName] = useState("");
  const [vehicles, setVehicles] = useState<VehicleDetails[]>([]);
  const [psNames, setPsNames] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const opts = await electionsService.getPollingPartyOptions();
        setPsNames(opts.pollingStations);
      } catch {
        // options are best-effort; search still works without them
      } finally {
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleSearch = async () => {
    if (!psName.trim()) return;
    try {
      setError("");
      setIsLoading(true);
      setSearched(true);
      const results = await electionsService.searchVehicles({ psName: psName.trim() });
      setVehicles(results);
    } catch (err: any) {
      setVehicles([]);
      setError(
        err?.response?.data?.message ||
          "Unable to fetch vehicle details. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPsName("");
    setVehicles([]);
    setSearched(false);
    setError("");
  };

  return (
    <section className="space-y-4">
      {/* ── Search card ─────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            <Car className="h-5 w-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Find Your Vehicle</h2>
            <p className="text-xs text-gray-500">Search by polling station</p>
          </div>
        </div>

        <div className="mt-4">
          <StationPicker
            value={psName}
            onChange={setPsName}
            options={psNames}
            disabled={isLoadingOptions}
          />
        </div>

        <div className="sticky bottom-16 z-10 mt-3 flex gap-2 sm:static">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading || !psName.trim()}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search Vehicle
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
          <Car className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">Search to find your vehicle</p>
        </div>
      )}

      {searched && isLoading && <SkeletonCards rows={2} />}

      {searched && !isLoading && !error && vehicles.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 py-12 text-center">
          <Car className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No vehicle found.</p>
          <p className="mt-1 text-xs text-gray-400">Try a different polling station.</p>
        </div>
      )}

      {/* ── Vehicle results ──────────────────────────────── */}
      {vehicles.length > 0 && !isLoading && (
        <div className="space-y-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm"
            >
              {/* Card header */}
              <div className="flex items-center gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                  <Car className="h-4 w-4 text-indigo-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                    Vehicle
                  </p>
                  <p className="text-base font-bold text-indigo-900">{v.vehicleNo ?? "—"}</p>
                </div>
                {v.vehicleType && (
                  <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    {v.vehicleType}
                  </span>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-px bg-gray-100">
                {v.psNo && <VehicleCell label="PS No" value={v.psNo} />}
                {v.psName && <VehicleCell label="Polling Station" value={v.psName} />}
                {v.capacity != null && (
                  <VehicleCell label="Capacity" value={`${v.capacity} seats`} />
                )}
                {v.driverName && <VehicleCell label="Driver" value={v.driverName} />}
                {v.route && <VehicleCell label="Route" value={v.route} fullWidth />}
                {v.parkingAddress && (
                  <VehicleCell label="Parking" value={v.parkingAddress} fullWidth />
                )}
                {v.statusComment && (
                  <VehicleCell label="Status" value={v.statusComment} fullWidth />
                )}
                {v.remarks && <VehicleCell label="Remarks" value={v.remarks} fullWidth />}
              </div>

              {/* Action buttons */}
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
                    className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.98]"
                  >
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default VehicleLocatorPage;
