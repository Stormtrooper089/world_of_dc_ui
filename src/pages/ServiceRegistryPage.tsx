import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Clock,
  FileText,
  IndianRupee,
  Search,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { districtServiceRegistryService } from "../services/districtServiceRegistryService";
import { DistrictService } from "../types";

const ServiceRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<DistrictService[]>([]);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");
      const rows = await districtServiceRegistryService.list({
        query: query.trim() || undefined,
        department: department || undefined,
        category: category || undefined,
      });
      setServices(rows);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load district services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(services.map((service) => service.department))).filter(Boolean),
    [services]
  );
  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))).filter(Boolean),
    [services]
  );

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((service) => {
      const text = `${service.serviceName} ${service.department} ${service.category} ${service.description}`.toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (!department || service.department === department) &&
        (!category || service.category === category)
      );
    });
  }, [services, query, department, category]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <button
            onClick={() => navigate("/citizen")}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="lg:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Digital District Service Registry
            </p>
            <h1 className="text-2xl font-bold">Find SMC services, documents, fees and SLA</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search services, department, document or SLA"
                className="min-h-[44px] w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="min-h-[44px] rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All departments</option>
              {departments.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-[44px] rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <button
              onClick={loadServices}
              className="min-h-[44px] rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading services...
          </div>
        ) : (
          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            {filteredServices.map((service) => (
              <ServiceCard key={service.serviceCode} service={service} />
            ))}
            {filteredServices.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 lg:col-span-2">
                No services matched your search.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

const ServiceCard = ({ service }: { service: DistrictService }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          {service.serviceCode}
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">{service.serviceName}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{service.description}</p>
      </div>
      <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        {service.serviceMode}
      </span>
    </div>

    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
      <Info icon={Building2} label="Department" value={service.department} />
      <Info icon={Clock} label="SLA" value={service.slaTimeline} />
      <Info icon={IndianRupee} label="Fee" value={service.feeDescription} />
      <Info icon={ShieldCheck} label="Escalation" value={service.escalationOfficer} />
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <ListBlock icon={BadgeCheck} title="Eligibility" items={service.eligibility || []} />
      <ListBlock icon={FileText} title="Documents" items={service.requiredDocuments || []} />
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold text-slate-500">
        Integration: {service.integrationStatus || "SMC workflow"}
      </p>
      {service.applyUrl && (
        <a
          href={service.applyUrl}
          className="inline-flex min-h-[38px] items-center rounded-md bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Open Service
        </a>
      )}
    </div>
  </article>
);

const Info = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
      <Icon className="h-4 w-4 text-blue-700" />
      {label}
    </div>
    <p className="mt-1 font-semibold text-slate-900">{value || "-"}</p>
  </div>
);

const ListBlock = ({ icon: Icon, title, items }: any) => (
  <div className="rounded-lg border border-slate-200 p-3">
    <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
      <Icon className="h-4 w-4 text-blue-700" />
      {title}
    </div>
    <ul className="mt-2 space-y-1 text-sm text-slate-600">
      {items.slice(0, 4).map((item: string) => (
        <li key={item}>- {item}</li>
      ))}
    </ul>
  </div>
);

export default ServiceRegistryPage;
