import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LocateFixed,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import {
  electionsService,
  VehicleIdMapping,
} from "../../services/electionsService";

const LocationUpdatePage: React.FC = () => {
  // Vehicle ID options
  const [mappings, setMappings] = useState<VehicleIdMapping[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappingsError, setMappingsError] = useState("");

  // Selected vehicle
  const [vehicleId, setVehicleId] = useState("");
  const lastFetchedId = useRef("");

  // Update fields
  const [remarks, setRemarks] = useState("");
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [locationDisplay, setLocationDisplay] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadMappings = async () => {
    setIsLoadingMappings(true);
    setMappingsError("");
    try {
      const data = await electionsService.getVehicleIdMappings();
      setMappings(data);
    } catch {
      setMappingsError("Unable to load vehicle options.");
    } finally {
      setIsLoadingMappings(false);
    }
  };

  // Load vehicle ID mappings on mount
  useEffect(() => {
    loadMappings();
  }, []);

  const handleVehicleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVehicleId(val);
    if (val.trim() !== lastFetchedId.current) {
      lastFetchedId.current = val.trim();
      setRemarks("");
      setCoords(null);
      setLocationDisplay("");
      setGpsMessage("");
      setSubmitError("");
      setSubmitSuccess(false);
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
        setGpsMessage("Location captured.");
        setSubmitError("");
        setSubmitSuccess(false);
        setIsLocating(false);
      },
      () => {
        setGpsMessage("Location unavailable. Remarks field is required.");
        setIsLocating(false);
      }
    );
  };

  // Validation is intentionally silent in UI: button state enforces requirement.
  const gpsAvailable = coords !== null;
  const isLocationRequirementMet = gpsAvailable || !!remarks.trim();

  const canSubmit = !!vehicleId.trim() && isLocationRequirementMet && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess(false);
      await electionsService.updateVehicleLocation(vehicleId.trim(), {
        remarks: remarks.trim(),
        ...(coords ? { location: coords } : {}),
      });
      setCoords(null);
      setLocationDisplay("");
      setGpsMessage("");
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message || "Update failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMapping = mappings.find((m) => m.vehicleId === vehicleId.trim());
  const isVehicleSelected = !!vehicleId.trim();

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
            Select your vehicle and update the location.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Vehicle ID */}
        <div>
          <label htmlFor="vehicle-id" className="mb-1.5 block text-sm font-semibold text-gray-700">
            Vehicle ID (Sticker)
          </label>
          {mappingsError && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <span>{mappingsError}</span>
              <button
                type="button"
                onClick={loadMappings}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}
          {isLoadingMappings && (
            <p className="mb-2 inline-flex items-center text-xs text-gray-500">
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Loading vehicles...
            </p>
          )}
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
                {m.vehicleId} : {m.vehicleNo}
              </option>
            ))}
          </datalist>
          {selectedMapping && (
            <p className="mt-1 text-xs text-gray-500">
              Vehicle No: <span className="font-semibold text-gray-700">{selectedMapping.vehicleNo}</span>
            </p>
          )}
        </div>

        {/* Fields shown after vehicle is selected */}
        {isVehicleSelected && (
          <>
            {/* GPS Coordinates */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              {/* <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                GPS Coordinates <span className="text-red-500">*</span>
              </label> */}
              {/* {locationDisplay ? (
                <p className="mb-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">
                  {locationDisplay}
                </p>
              ) : (
                <p className="mb-2 text-xs text-gray-400">No GPS captured yet.</p>
              )} */}
              {!locationDisplay && (
                <p className="mb-2 text-xs text-gray-400">No location captured yet.</p>
              )}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex min-h-[44px] items-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LocateFixed className="mr-2 h-4 w-4" />
                {isLocating ? "Capturing Location..." : "Use Current Location"}
              </button>
              {gpsMessage && (
                <p className={`mt-2 text-sm ${coords ? "text-teal-700" : "text-amber-700"}`}>
                  {gpsMessage}
                </p>
              )}
            </div>

            {/* Remarks — required only when GPS unavailable */}
            <div>
              <label htmlFor="remarks" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Remarks
                {!gpsAvailable && <span className="ml-1 text-red-500">*</span>}
                {gpsAvailable && <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>}
              </label>
              <input
                id="remarks"
                type="text"
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  setSubmitError("");
                  setSubmitSuccess(false);
                }}
                placeholder={gpsAvailable ? "e.g. Parked at polling station gate" : "Location unavailable — describe address"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
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
                className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Location updated successfully for vehicle {selectedMapping?.vehicleNo ?? vehicleId}.
                </span>
              </div>
            )}

            {/* Submit */}
            <div className="sticky bottom-16 z-10 rounded-xl bg-white/95 p-2 backdrop-blur sm:static sm:bg-transparent sm:p-0">
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
          </>
        )}
      </form>
    </section>
  );
};

export default LocationUpdatePage;
