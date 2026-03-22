import React, { useEffect, useRef, useState } from "react";
import { LocateFixed, Loader2, MapPin, Navigation } from "lucide-react";
import {
  electionsService,
  VehicleIdMapping,
  VehicleLocation,
} from "../../services/electionsService";

const LocationUpdatePage: React.FC = () => {
  // Vehicle ID options
  const [mappings, setMappings] = useState<VehicleIdMapping[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappingsError, setMappingsError] = useState("");

  // Selected vehicle
  const [vehicleId, setVehicleId] = useState("");
  const [currentInfo, setCurrentInfo] = useState<VehicleLocation | null>(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const lastFetchedId = useRef("");

  // Update fields
  const [parkingAddress, setParkingAddress] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [locationDisplay, setLocationDisplay] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load vehicle ID mappings on mount
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingMappings(true);
        const data = await electionsService.getVehicleIdMappings();
        setMappings(data);
      } catch {
        setMappingsError("Unable to load vehicle options.");
      } finally {
        setIsLoadingMappings(false);
      }
    };
    load();
  }, []);

  // Fetch current location when a valid vehicleId is selected
  useEffect(() => {
    const trimmed = vehicleId.trim();
    const validIds = mappings.map((m) => m.vehicleId);
    if (!trimmed || !validIds.includes(trimmed) || trimmed === lastFetchedId.current) return;

    const fetch = async () => {
      lastFetchedId.current = trimmed;
      setCurrentInfo(null);
      setFetchError("");
      setSubmitError("");
      setSubmitSuccess(false);
      // Pre-fill update fields
      setParkingAddress("");
      setStatusComment("");
      setCoords(null);
      setLocationDisplay("");
      setGpsMessage("");
      try {
        setIsLoadingCurrent(true);
        const data = await electionsService.getVehicleLocation(trimmed);
        setCurrentInfo(data);
        // Pre-fill editable fields with existing data
        setParkingAddress(data.parkingAddress ?? "");
        setStatusComment(data.statusComment ?? "");
        if (data.location) {
          setCoords(data.location);
          setLocationDisplay(`${data.location.y}, ${data.location.x}`);
        }
      } catch (err: any) {
        setFetchError(
          err?.response?.data?.message ||
            "Unable to fetch current location for this vehicle."
        );
      } finally {
        setIsLoadingCurrent(false);
      }
    };
    fetch();
  }, [vehicleId, mappings]);

  const handleVehicleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVehicleId(val);
    if (val.trim() !== lastFetchedId.current) {
      lastFetchedId.current = "";
      setCurrentInfo(null);
      setFetchError("");
      setSubmitError("");
      setSubmitSuccess(false);
      setParkingAddress("");
      setStatusComment("");
      setCoords(null);
      setLocationDisplay("");
      setGpsMessage("");
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage("Geolocation is not supported on this device.");
      return;
    }
    setIsLocating(true);
    setGpsMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ x: longitude, y: latitude });
        setLocationDisplay(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setGpsMessage("GPS location captured.");
        setIsLocating(false);
      },
      () => {
        setGpsMessage("Unable to fetch GPS. Enter address manually.");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId.trim() || !parkingAddress.trim()) return;
    try {
      setIsSubmitting(true);
      setSubmitError("");
      await electionsService.updateVehicleLocation(vehicleId.trim(), {
        parkingAddress: parkingAddress.trim(),
        statusComment: statusComment.trim(),
        ...(coords ? { location: coords } : {}),
      });
      setSubmitSuccess(true);
      setCurrentInfo((prev) =>
        prev
          ? {
              ...prev,
              parkingAddress: parkingAddress.trim(),
              statusComment: statusComment.trim(),
              ...(coords ? { location: coords } : {}),
            }
          : prev
      );
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message || "Update failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMapping = mappings.find((m) => m.vehicleId === vehicleId.trim());
  const canSubmit = !!vehicleId.trim() && !!parkingAddress.trim() && !isSubmitting;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100">
          <MapPin className="h-5 w-5 text-teal-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Update Vehicle Location</h2>
          <p className="mt-1 text-sm text-gray-600">
            Select your vehicle ID to view and update the current location.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Vehicle ID */}
        <div>
          <label htmlFor="vehicle-id" className="mb-1.5 block text-sm font-semibold text-gray-700">
            Vehicle ID
          </label>
          {mappingsError && <p className="mb-1 text-xs text-red-600">{mappingsError}</p>}
          {isLoadingMappings && <p className="mb-1 text-xs text-gray-400">Loading vehicles…</p>}
          <input
            id="vehicle-id"
            list="vehicle-id-list"
            type="text"
            value={vehicleId}
            onChange={handleVehicleIdChange}
            placeholder="Search or select vehicle ID"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <datalist id="vehicle-id-list">
            {mappings.map((m) => (
              <option key={m.vehicleId} value={m.vehicleId}>
                {m.vehicleId} — {m.vehicleNo}
              </option>
            ))}
          </datalist>
          {selectedMapping && (
            <p className="mt-1 text-xs text-gray-500">
              Vehicle No: <span className="font-semibold text-gray-700">{selectedMapping.vehicleNo}</span>
            </p>
          )}
        </div>

        {/* Loading current */}
        {isLoadingCurrent && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching current location…
          </div>
        )}

        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        {/* Current location read-only display */}
        {/* {currentInfo && !isLoadingCurrent && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Recorded Location</p>
            <div className="mt-2 space-y-1.5 text-sm">
              <p>
                <span className="font-medium text-gray-600">Remarks: </span>
                <span className="text-gray-900">{currentInfo.remarks || "Not set"}</span>
              </p>
              {currentInfo.location && (
                <p>
                  <span className="font-medium text-gray-600">GPS: </span>
                  <span className="text-gray-900">
                    {currentInfo.location.y.toFixed(6)}, {currentInfo.location.x.toFixed(6)}
                  </span>
                </p>
              )}
            </div>
          </div>
        )} */}

        {/* Update fields — shown only after vehicle is loaded */}
        {currentInfo && !isLoadingCurrent && (
          <>
            {/* <div>
              <label htmlFor="parking-address" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Parking Address <span className="text-red-500">*</span>
              </label>
              <input
                id="parking-address"
                type="text"
                value={parkingAddress}
                onChange={(e) => { setParkingAddress(e.target.value); setSubmitSuccess(false); }}
                placeholder="Enter parking address or landmark"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div> */}

            <div>
              <label htmlFor="status-comment" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Status / Remarks
              </label>
              <input
                id="status-comment"
                type="text"
                value={statusComment}
                onChange={(e) => { setStatusComment(e.target.value); setSubmitSuccess(false); }}
                placeholder="e.g. Reached polling station, Parking near XYZ"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                GPS Coordinates
              </label>
              {locationDisplay && (
                <p className="mb-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">
                  {locationDisplay}
                </p>
              )}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex min-h-[44px] items-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LocateFixed className="mr-2 h-4 w-4" />
                {isLocating ? "Capturing GPS…" : "Use Current GPS Location"}
              </button>
              {gpsMessage && (
                <p className="mt-2 text-sm text-teal-700">{gpsMessage}</p>
              )}
            </div>

            {/* Submit */}
            <div className="sticky bottom-2 z-10 rounded-xl bg-white/95 p-2 backdrop-blur sm:static sm:bg-transparent sm:p-0">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-base font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Updating…" : "Update Location"}
              </button>
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
                Location updated successfully for vehicle {selectedMapping?.vehicleNo ?? vehicleId}.
              </div>
            )}
          </>
        )}
      </form>
    </section>
  );
};

export default LocationUpdatePage;
