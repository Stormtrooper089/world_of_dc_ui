import React, { useEffect, useState } from "react";
import {
  Car,
  Search,
  MapPin,
  Phone,
  User,
  Hash,
  Navigation,
  Info,
  Loader2,
} from "lucide-react";
import { electionsService, VehicleDetails } from "../../services/electionsService";

const VehicleLocatorPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [vehicles, setVehicles] = useState<VehicleDetails[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [psNames, setPsNames] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const partyOptions = await electionsService.getPollingPartyOptions();
        setPsNames(partyOptions.pollingStations);
      } catch {
        // options are best-effort; search still works without them
      } finally {
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      setError("");
      setIsLoading(true);
      setSearched(true);
      const results = await electionsService.searchVehicles({ psName: trimmed });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
          <Car className="h-5 w-5 text-indigo-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find Your Vehicle</h2>
          <p className="mt-1 text-sm text-gray-600">
            Search by polling station.
          </p>
        </div>
      </div>

      {/* Search Input with Datalist */}
      <div className="relative mt-4">
        {isLoadingOptions && (
          <p className="mb-2 text-xs text-gray-400">Loading options…</p>
        )}
        <input
          list="ps-names-list"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type to search polling station…"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <datalist id="ps-names-list">
          {psNames.map((ps) => (
            <option key={ps} value={ps} />
          ))}
        </datalist>
      </div>

      {/* Search Button */}
      <div className="sticky bottom-2 z-10 mt-4 rounded-xl bg-white/95 p-2 backdrop-blur sm:static sm:bg-transparent sm:p-0">
        <button
          type="button"
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5 sm:text-sm"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Searching…" : "Search Vehicle"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* No Results */}
      {searched && !isLoading && !error && vehicles.length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 py-10 text-center">
          <Car className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No vehicle found.</p>
          <p className="mt-1 text-xs text-gray-400">Try a different search term.</p>
        </div>
      )}

      {/* Results */}
      {vehicles.length > 0 && (
        <div className="mt-6 space-y-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5"
            >
              {/* Vehicle header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                  <Car className="h-5 w-5 text-indigo-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-gray-900">
                    {v.vehicleNo ?? "—"}
                  </p>
                  {v.vehicleType && (
                    <p className="text-xs text-gray-500">{v.vehicleType}</p>
                  )}
                  {v.capacity != null && (
                    <p className="text-xs text-gray-500">
                      Capacity: {v.capacity}
                    </p>
                  )}
                </div>
              
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* Polling Station No*/}
                {v.psNo && (
                  <DetailRow
                    icon={<Hash className="h-4 w-4 text-indigo-400" />}
                    label="PS No"
                    value={v.psNo}
                  />
                )}
                {/* Polling Station */}
                {v.psName && (
                  <DetailRow
                    icon={<Hash className="h-4 w-4 text-indigo-400" />}
                    label="Polling Station"
                    value={v.psName}
                  />
                )}

                {/* AC No */}
                {v.acNo && (
                  <DetailRow
                    icon={<Hash className="h-4 w-4 text-indigo-400" />}
                    label="AC No."
                    value={v.acNo}
                  />
                )}

                {/* Driver */}
                {v.driverName && (
                  <DetailRow
                    icon={<User className="h-4 w-4 text-indigo-400" />}
                    label="Driver"
                    value={v.driverName}
                  />
                )}

                {/* Driver Mobile */}
                {v.driverMobile && (
                  <DetailRow
                    icon={<Phone className="h-4 w-4 text-indigo-400" />}
                    label="Driver Mobile"
                    value={
                      <a
                        href={`tel:${v.driverMobile}`}
                        className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                      >
                        {v.driverMobile}
                      </a>
                    }
                  />
                )}

                {/* Route */}
                {v.route && (
                  <DetailRow
                    icon={<Navigation className="h-4 w-4 text-indigo-400" />}
                    label="Route"
                    value={v.route}
                  />
                )}

                {/* Location */}
                {v.location && (
                  <DetailRow
                    icon={<MapPin className="h-4 w-4 text-indigo-400" />}
                    label="Location"
                    value={
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${v.location.y},${v.location.x}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                      >
                        {v.location.y.toFixed(4)}, {v.location.x.toFixed(4)}
                      </a>
                    }
                  />
                )}

                {/* Status Comment */}
                {v.statusComment && (
                  <DetailRow
                    icon={<Info className="h-4 w-4 text-indigo-400" />}
                    label="Status"
                    value={v.statusComment}
                  />
                )}

                {/* Remarks */}
                {v.remarks && (
                  <DetailRow
                    icon={<Info className="h-4 w-4 text-indigo-400" />}
                    label="Remarks"
                    value={v.remarks}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

export default VehicleLocatorPage;
