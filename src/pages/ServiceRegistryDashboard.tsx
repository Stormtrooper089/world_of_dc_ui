import { BookOpenCheck, Building2, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { districtServiceRegistryService } from "../services/districtServiceRegistryService";
import { DistrictServiceDashboard as DashboardData } from "../types";

const ServiceRegistryDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      setDashboard(await districtServiceRegistryService.dashboard());
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load service registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="h-full overflow-auto bg-slate-50 p-4 text-slate-950 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Digital District Layer
          </p>
          <h1 className="text-2xl font-bold">District Service Registry</h1>
          <p className="mt-1 text-sm text-slate-500">
            Official catalogue of services, departments, fees, documents and SLA timelines.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading service registry...
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={BookOpenCheck} label="Total Services" value={dashboard?.totalServices || 0} />
            <Metric icon={ShieldCheck} label="Active" value={dashboard?.activeServices || 0} />
            <Metric icon={FileText} label="Online / Hybrid" value={dashboard?.onlineServices || 0} />
            <Metric icon={Building2} label="UPYOG Ready" value={dashboard?.upyogReadyServices || 0} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">Service Catalogue</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="py-3 pr-4">Service</th>
                      <th className="py-3 pr-4">Department</th>
                      <th className="py-3 pr-4">SLA</th>
                      <th className="py-3 pr-4">Mode</th>
                      <th className="py-3 pr-4">Integration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard?.services?.map((service) => (
                      <tr key={service.serviceCode} className="border-b border-slate-100">
                        <td className="py-3 pr-4">
                          <p className="font-semibold">{service.serviceName}</p>
                          <p className="text-xs text-slate-500">{service.serviceCode}</p>
                        </td>
                        <td className="py-3 pr-4">{service.department}</td>
                        <td className="py-3 pr-4">{service.slaTimeline || "-"}</td>
                        <td className="py-3 pr-4">{service.serviceMode || "-"}</td>
                        <td className="py-3 pr-4">{service.integrationStatus || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-5">
              <Breakdown title="Department Coverage" data={dashboard?.departmentWise || {}} />
              <Breakdown title="Service Categories" data={dashboard?.categoryWise || {}} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <Icon className="h-5 w-5 text-blue-700" />
    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
  </div>
);

const Breakdown = ({ title, data }: { title: string; data: Record<string, number> }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h2 className="text-lg font-bold">{title}</h2>
    <div className="mt-4 space-y-2">
      {Object.entries(data).map(([label, value]) => (
        <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="font-semibold text-slate-700">{label}</span>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ServiceRegistryDashboard;
