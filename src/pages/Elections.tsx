import React from "react";
import {
  AlertTriangle,
  Car,
  ChevronRight,
  Headset,
  MapPin,
  PackageCheck,
  Users,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const Elections: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const services = [
    {
      title: "Find Your Team",
      description: "Locate assigned polling and support teams quickly.",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      route: "/elections/team-directory",
    },
    {
      title: "Find Your Car",
      description: "Track and identify your allocated election vehicle.",
      icon: Car,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-700",
      route: "/elections/vehicle-locator",
    },
    {
      title: "Update Your Location",
      description: "Share current location with the election command center.",
      icon: MapPin,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-700",
      route: "/elections/location-update",
    },
    {
      title: "Check Materials Received",
      description: "Verify receipt of EVM kits and required election materials.",
      icon: PackageCheck,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      route: "/elections/materials",
    },
    {
      title: "Contact Control Room",
      description: "Reach the control room for urgent operational help.",
      icon: Headset,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-700",
      route: "/elections/control-room",
    },
    {
      title: "Report an Issue",
      description: "Log incidents and raise field-level election issues.",
      icon: AlertTriangle,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-700",
      route: "/elections/issues/new",
    },
  ];

  const activeService =
    services.find((service) => location.pathname === service.route) ||
    services.find((service) => service.route === "/elections/control-room");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-8 text-white sm:px-8 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
            Government of Assam
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Elections 2026 Services Desk
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-blue-100 sm:text-base">
            Quick access to essential tools and support for field election teams.
          </p>
        </div>

        <div className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-[320px,1fr]">
          <aside className="border-b border-gray-100 bg-gray-50/70 p-4 sm:p-5 lg:border-b-0 lg:border-r">

            <nav className="space-y-2" aria-label="Election services">
              {services.map((service) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => navigate(service.route)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    location.pathname === service.route
                      ? "border-blue-400 bg-white shadow-sm"
                      : "border-transparent hover:border-blue-200 hover:bg-white"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${service.iconBg}`}
                  >
                    <service.icon className={`h-5 w-5 ${service.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {service.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                      {service.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </nav>
          </aside>

          <section className="bg-white p-4 sm:p-6 lg:p-8">


            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Elections;
