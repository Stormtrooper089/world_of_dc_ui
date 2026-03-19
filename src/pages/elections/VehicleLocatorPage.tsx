import React from "react";
import { Car, Search } from "lucide-react";

const VehicleLocatorPage: React.FC = () => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
          <Car className="h-5 w-5 text-indigo-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find Your Car</h2>
          <p className="mt-1 text-sm text-gray-600">
            Search your assigned election vehicle location by vehicle number or team.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          type="text"
          placeholder="Enter vehicle number or team"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Search className="mr-2 h-4 w-4" />
          Search Vehicle
        </button>
      </div>
    </section>
  );
};

export default VehicleLocatorPage;
