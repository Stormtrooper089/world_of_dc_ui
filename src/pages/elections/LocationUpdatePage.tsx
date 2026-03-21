import React, { useState } from "react";
import { LocateFixed, MapPin, Navigation } from "lucide-react";

const LocationUpdatePage: React.FC = () => {
  const [team, setTeam] = useState("");
  const [pollingStation, setPollingStation] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [location, setLocation] = useState("");
  const [gpsMessage, setGpsMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const canSubmit =
    Boolean(location.trim()) &&
    Boolean(team.trim() || pollingStation.trim() || vehicleNumber.trim());

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage("Geolocation is not supported on this device.");
      return;
    }

    setIsLocating(true);
    setGpsMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setGpsMessage("Current GPS location captured.");
        setIsLocating(false);
      },
      () => {
        setGpsMessage("Unable to fetch GPS location. Please enter manually.");
        setIsLocating(false);
      }
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100">
          <MapPin className="h-5 w-5 text-teal-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Update Your Location
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Drivers can update the vehicle's latest location using polling station or vehicle number.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {/* <div>
          <label
            htmlFor="team"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            Team
          </label>
          <input
            id="team"
            type="text"
            value={team}
            onChange={(event) => setTeam(event.target.value)}
            placeholder="Enter team name or code"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div> */}

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
            onChange={(event) => setPollingStation(event.target.value)}
            placeholder="Enter polling station"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="vehicle-number"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            Vehicle Number
          </label>
          <input
            id="vehicle-number"
            type="text"
            value={vehicleNumber}
            onChange={(event) => setVehicleNumber(event.target.value)}
            placeholder="Enter vehicle number"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="current-location"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            Current Location
          </label>
          <textarea
            id="current-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Enter current location (GPS coordinates, landmark, or area)"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="mt-3 inline-flex min-h-[44px] items-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LocateFixed className="mr-2 h-4 w-4" />
            {isLocating ? "Capturing GPS..." : "Share Current GPS Location"}
          </button>
          {gpsMessage ? (
            <p className="mt-2 text-sm text-teal-700">{gpsMessage}</p>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Provide at least one identifier (polling station or vehicle
        number) along with the current location.
      </p>

      <div className="sticky bottom-2 z-10 mt-5 rounded-xl bg-white/95 p-2 backdrop-blur sm:static sm:bg-transparent sm:p-0">
        <button
          type="button"
          disabled={!canSubmit}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-base font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-sm"
        >
          <Navigation className="mr-2 h-4 w-4" />
          Update Now
        </button>
      </div>
    </section>
  );
};

export default LocationUpdatePage;
