import React, { useState } from "react";
import { MapPin, Navigation } from "lucide-react";

const LocationUpdatePage: React.FC = () => {
  const [team, setTeam] = useState("");
  const [pollingStation, setPollingStation] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [location, setLocation] = useState("");

  const canSubmit =
    Boolean(location.trim()) &&
    Boolean(team.trim() || pollingStation.trim() || vehicleNumber.trim());

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100">
          <MapPin className="h-5 w-5 text-teal-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Update Your Location
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Drivers can update the vehicle's latest location using team,
            polling station, or vehicle number.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
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
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>

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
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
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
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
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
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Provide at least one identifier (team, polling station, or vehicle
        number) along with the current location.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canSubmit}
          className="inline-flex items-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Navigation className="mr-2 h-4 w-4" />
          Update Now
        </button>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          Status: Not shared
        </span>
      </div>
    </section>
  );
};

export default LocationUpdatePage;
