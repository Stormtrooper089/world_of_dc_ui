import React from "react";
import {
  Activity,
  AlertTriangle,
  Car,
  ChevronRight,
  Contact,
  Headset,
  Home,
  MapPin,
  PackageCheck,
  Search,
  Users,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const Elections: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const services = [
    {
      title: "Find Your Team",
      description: "Locate assigned polling teams quickly.",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      route: "/elections/team-directory",
    },
    {
      title: "Find Your Vehicle",
      description: "Track and identify your allocated election vehicle.",
      icon: Car,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-700",
      route: "/elections/vehicle-locator",
    },
    {
      title: "Materials Status",
      description: "Verify receipt of election materials.",
      icon: PackageCheck,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      route: "/elections/materials",
    },
    {
      title: "Update Location",
      description: "Share current location with the election command center.",
      icon: MapPin,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-700",
      route: "/elections/location-update",
    },
    {
      title: "Contact",
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

  const mobileActionServices = [
    services.find((service) => service.route === "/elections/control-room"),
    services.find((service) => service.route === "/elections/issues/new"),
    services.find((service) => service.route === "/elections/team-directory"),
    services.find((service) => service.route === "/elections/vehicle-locator"),
    services.find((service) => service.route === "/elections/location-update"),
    services.find((service) => service.route === "/elections/materials"),
  ].filter(Boolean) as typeof services;

  const mobileTabs = [
    {
      label: "Contact",
      icon: Headset,
      route: "/elections/control-room",
      active: ["/elections", "/elections/control-room"].includes(location.pathname),
    },
    {
      label: "Search",
      icon: Users,
      route: "/elections/team-directory",
      active: ["/elections/team-directory"].includes(
        location.pathname
      ),
    },
    {
      label: "Track",
      icon: Car,
      route: "/elections/vehicle-locator",
      active: ["/elections/vehicle-locator", "/elections/location-update"].includes(
        location.pathname
      ),
    },
    {
      label: "Status",
      icon: PackageCheck,
      route: "/elections/materials",
      active: ["/elections/materials", "/elections/location-update"].includes(
        location.pathname
      ),
    },
    // {
    //   label: "Emergency",
    //   icon: AlertTriangle,
    //   route: "/elections/issues/new",
    //   active: ["/elections/issues/new", "/elections/control-room"].includes(
    //     location.pathname
    //   ),
    // },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-3 pb-24 pt-4 sm:px-4 sm:pt-5 lg:px-8 lg:pb-8 lg:pt-8">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-4 text-white sm:px-6 lg:px-10 lg:py-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
                Elections 2026
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Field Tool for polling operations
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 bg-white p-4 lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-3">
            {mobileActionServices.map((service) => (
              <button
                key={`mobile-${service.title}`}
                type="button"
                onClick={() => navigate(service.route)}
                className={`rounded-xl border p-3 text-left transition active:scale-[0.99] ${
                  location.pathname === service.route
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div
                  className={`mb-2 flex h-11 w-11 items-center justify-center rounded-lg ${service.iconBg}`}
                >
                  <service.icon className={`h-6 w-6 ${service.iconColor}`} />
                </div>
                <p className="text-sm font-semibold text-gray-900">{service.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-[320px,1fr]">
          <aside className="hidden border-b border-gray-100 bg-gray-50/70 p-4 sm:p-5 lg:block lg:border-b-0 lg:border-r">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              Services
            </p>

            <nav className="space-y-2" aria-label="Election services">
              {services.map((service) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => navigate(service.route)}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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

          <section className="bg-white p-4 sm:p-5 lg:p-8">
            {/* <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Active Service
              </p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {activeService?.title}
              </p>
            </div> */}

            <Outlet />
          </section>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-4 gap-1">
          {mobileTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => navigate(tab.route)}
              className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg px-2 py-1 text-[11px] font-semibold ${
                tab.active ? "text-blue-700" : "text-gray-600"
              }`}
            >
              <tab.icon className="mb-0.5 h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Elections;
