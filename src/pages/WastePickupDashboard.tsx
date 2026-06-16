import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, LocateFixed, RefreshCw, Save, Trash2, Truck, X } from "lucide-react";
import { officerService } from "../services/officerService";
import { wastePickupService } from "../services/wastePickupService";
import { EmployeeCategory, Officer } from "../types";
import {
  WasteCategory,
  WastePickupDashboard as WastePickupDashboardData,
  WastePickupRequest,
  WastePickupStatus,
  WasteUrgency,
  wasteCategoryLabels,
  wasteQuantityLabels,
  wasteStatusLabels,
  wasteUrgencyLabels,
} from "../types/wastePickupTypes";

const statusStyles: Record<WastePickupStatus, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-cyan-100 text-cyan-700",
  ASSIGNED: "bg-amber-100 text-amber-700",
  PICKUP_SCHEDULED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  PICKED_UP: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-100 text-red-700",
  REOPENED: "bg-purple-100 text-purple-700",
};

const WastePickupDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<WastePickupDashboardData | null>(null);
  const [requests, setRequests] = useState<WastePickupRequest[]>([]);
  const [sanitationOfficers, setSanitationOfficers] = useState<Officer[]>([]);
  const [selected, setSelected] = useState<WastePickupRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    wardNumber: "",
    status: "",
    urgency: "",
    category: "",
    slaBreached: "",
    locality: "",
  });
  const [assignment, setAssignment] = useState({
    assignedOfficerId: "",
    assignedSanitationStaffId: "",
    assignedVehicleNumber: "",
    sanitationTeamName: "",
    remarks: "",
    preferredPickupSlot: "",
  });
  const [closure, setClosure] = useState({
    closureRemarks: "",
    closureLatitude: "",
    closureLongitude: "",
    actualWasteQuantity: "",
    siteFullyCleaned: true,
    afterPhotos: [] as File[],
  });

  const load = async () => {
    try {
      setError("");
      setIsLoading(true);
      const apiFilters: any = {};
      if (filters.wardNumber) apiFilters.wardNumber = Number(filters.wardNumber);
      if (filters.status) apiFilters.status = filters.status;
      if (filters.urgency) apiFilters.urgency = filters.urgency;
      if (filters.category) apiFilters.category = filters.category;
      if (filters.slaBreached) apiFilters.slaBreached = filters.slaBreached === "true";
      if (filters.locality) apiFilters.locality = filters.locality;
      const [requestRows, dashboardData] = await Promise.all([
        wastePickupService.list(apiFilters),
        wastePickupService.dashboard(apiFilters),
      ]);
      setRequests(requestRows);
      setDashboard(dashboardData);
      if (selected) {
        const refreshed = requestRows.find((request) => request.id === selected.id);
        setSelected(refreshed || null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load SMC waste pickup dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    officerService
      .getAllOfficers(undefined, EmployeeCategory.SANITATION)
      .then((officers) => setSanitationOfficers(officers.filter((officer) => officer.isApproved)))
      .catch(() => setSanitationOfficers([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setAssignment({
      assignedOfficerId: selected.assignedOfficerId || "",
      assignedSanitationStaffId: selected.assignedSanitationStaffId || "",
      assignedVehicleNumber: selected.assignedVehicleNumber || "",
      sanitationTeamName: selected.sanitationTeamName || "",
      remarks: "",
      preferredPickupSlot: selected.preferredPickupSlot || "",
    });
  }, [selected?.id]);

  const visibleRequests = useMemo(() => requests.slice(0, 50), [requests]);

  const updateStatus = async (request: WastePickupRequest, status: WastePickupStatus) => {
    try {
      const updated = await wastePickupService.updateStatus(request.id, { status, remarks: `Marked ${wasteStatusLabels[status]}` });
      setSelected(updated);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to update status.");
    }
  };

  const verify = async (request: WastePickupRequest) => {
    const updated = await wastePickupService.verify(request.id, { remarks: "Verified by sanitation desk" });
    setSelected(updated);
    await load();
  };

  const assign = async () => {
    if (!selected) return;
    const updated = await wastePickupService.assign(selected.id, assignment);
    setSelected(updated);
    await load();
  };

  const schedule = async () => {
    if (!selected) return;
    const updated = await wastePickupService.schedule(selected.id, {
      preferredPickupSlot: assignment.preferredPickupSlot || selected.preferredPickupSlot,
      remarks: assignment.remarks,
    });
    setSelected(updated);
    await load();
  };

  const captureClosureLocation = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      setClosure((prev) => ({
        ...prev,
        closureLatitude: position.coords.latitude.toFixed(6),
        closureLongitude: position.coords.longitude.toFixed(6),
      }));
    });
  };

  const closeRequest = async () => {
    if (!selected) return;
    if (!closure.closureRemarks || !closure.closureLatitude || !closure.closureLongitude || closure.afterPhotos.length === 0) {
      setError("Closure requires after-photo, remarks and GPS location.");
      return;
    }
    try {
      const updated = await wastePickupService.close(selected.id, {
        closureRemarks: closure.closureRemarks,
        closureLatitude: Number(closure.closureLatitude),
        closureLongitude: Number(closure.closureLongitude),
        actualWasteQuantity: closure.actualWasteQuantity as any,
        siteFullyCleaned: closure.siteFullyCleaned,
        assignedVehicleNumber: assignment.assignedVehicleNumber || selected.assignedVehicleNumber,
        sanitationTeamName: assignment.sanitationTeamName || selected.sanitationTeamName,
        afterPhotos: closure.afterPhotos,
      });
      setSelected(updated);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to close request.");
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">SMC Solid Waste</p>
              <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Waste Pickup Monitoring</h1>
              <p className="text-sm text-slate-500">Process citizen waste pickup requests with SLA, assignment and closure proof.</p>
            </div>
          </div>
          <button onClick={load} className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Total" value={dashboard?.totalRequests || 0} icon={Truck} />
          <Stat label="Pending" value={dashboard?.pendingRequests || 0} icon={Clock3} />
          <Stat label="SLA Breached" value={dashboard?.slaBreachedRequests || 0} icon={AlertTriangle} danger />
          <Stat label="Closed" value={dashboard?.closedRequests || 0} icon={CheckCircle2} />
        </section>

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input placeholder="Ward" value={filters.wardNumber} onChange={(e) => setFilters({ ...filters, wardNumber: e.target.value })} className="rounded-lg border-slate-200 px-3 py-2 text-sm" />
            <Select value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} placeholder="All statuses" options={Object.keys(wasteStatusLabels).map((value) => ({ value, label: wasteStatusLabels[value as WastePickupStatus] }))} />
            <Select value={filters.urgency} onChange={(value) => setFilters({ ...filters, urgency: value })} placeholder="All urgency" options={Object.keys(wasteUrgencyLabels).map((value) => ({ value, label: wasteUrgencyLabels[value as WasteUrgency] }))} />
            <Select value={filters.category} onChange={(value) => setFilters({ ...filters, category: value })} placeholder="All categories" options={Object.keys(wasteCategoryLabels).map((value) => ({ value, label: wasteCategoryLabels[value as WasteCategory] }))} />
            <Select value={filters.slaBreached} onChange={(value) => setFilters({ ...filters, slaBreached: value })} placeholder="SLA" options={[{ value: "true", label: "Breached" }, { value: "false", label: "Within SLA" }]} />
            <button onClick={load} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Apply</button>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr,1.1fr]">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="font-bold text-slate-950">Waste Pickup Requests</h2>
            </div>
            <div className="max-h-[68vh] divide-y divide-slate-100 overflow-y-auto">
              {visibleRequests.map((request) => (
                <button key={request.id} onClick={() => setSelected(request)} className={`w-full px-4 py-3 text-left hover:bg-blue-50 ${selected?.id === request.id ? "bg-blue-50" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-blue-700">#{request.trackingId}</p>
                      <p className="mt-1 font-semibold text-slate-950">{wasteCategoryLabels[request.wasteCategory]}</p>
                      <p className="mt-1 text-sm text-slate-500">Ward {request.wardNumber || "Unmapped"} · {request.locality || "No locality"}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[request.status]}`}>{wasteStatusLabels[request.status]}</span>
                  </div>
                  {request.slaBreached && <p className="mt-2 text-xs font-semibold text-red-600">SLA breached</p>}
                </button>
              ))}
              {visibleRequests.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No waste pickup requests found.</p>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {selected ? (
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-blue-700">#{selected.trackingId}</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-950">{wasteCategoryLabels[selected.wasteCategory]}</h2>
                    <p className="text-sm text-slate-500">{selected.fullAddress || selected.locality}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Info label="Citizen" value={`${selected.citizenName} · ${selected.citizenMobile}`} />
                  <Info label="Urgency" value={wasteUrgencyLabels[selected.urgency]} />
                  <Info label="Quantity" value={wasteQuantityLabels[selected.estimatedQuantity]} />
                  <Info label="GPS" value={selected.latitude && selected.longitude ? `${selected.latitude}, ${selected.longitude}` : "Not captured"} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => verify(selected)} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700">Verify</button>
                  <button onClick={() => updateStatus(selected, "IN_PROGRESS")} className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700">In Progress</button>
                  <button onClick={() => updateStatus(selected, "REJECTED")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Reject</button>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950">Assignment</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <select value={assignment.assignedOfficerId} onChange={(e) => setAssignment({ ...assignment, assignedOfficerId: e.target.value })} className="rounded-lg border-slate-200 px-3 py-2 text-sm">
                      <option value="">Assign sanitation officer</option>
                      {sanitationOfficers.map((officer) => (
                        <option key={officer.id} value={officer.id}>
                          {officer.name} ({officer.employeeId})
                        </option>
                      ))}
                    </select>
                    <input placeholder="Sanitation staff ID" value={assignment.assignedSanitationStaffId} onChange={(e) => setAssignment({ ...assignment, assignedSanitationStaffId: e.target.value })} className="rounded-lg border-slate-200 px-3 py-2 text-sm" />
                    <input placeholder="Vehicle number" value={assignment.assignedVehicleNumber} onChange={(e) => setAssignment({ ...assignment, assignedVehicleNumber: e.target.value })} className="rounded-lg border-slate-200 px-3 py-2 text-sm" />
                    <input placeholder="Team name" value={assignment.sanitationTeamName} onChange={(e) => setAssignment({ ...assignment, sanitationTeamName: e.target.value })} className="rounded-lg border-slate-200 px-3 py-2 text-sm" />
                    <input placeholder="Pickup schedule" value={assignment.preferredPickupSlot} onChange={(e) => setAssignment({ ...assignment, preferredPickupSlot: e.target.value })} className="rounded-lg border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
                  </div>
                  {sanitationOfficers.length === 0 && (
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      No approved sanitation employees found. Update employee category to SANITATION for staff who should receive pickup assignments.
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button onClick={assign} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"><Save className="h-4 w-4" />Assign</button>
                    <button onClick={schedule} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Schedule</button>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <h3 className="font-bold text-emerald-950">Closure Proof</h3>
                  <p className="mt-1 text-sm text-emerald-700">After-photo, remarks and GPS are mandatory before closure.</p>
                  <textarea placeholder="Closure remarks" value={closure.closureRemarks} onChange={(e) => setClosure({ ...closure, closureRemarks: e.target.value })} className="mt-3 w-full rounded-lg border-emerald-200 px-3 py-2 text-sm" rows={3} />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input placeholder="Closure latitude" value={closure.closureLatitude} onChange={(e) => setClosure({ ...closure, closureLatitude: e.target.value })} className="rounded-lg border-emerald-200 px-3 py-2 text-sm" />
                    <input placeholder="Closure longitude" value={closure.closureLongitude} onChange={(e) => setClosure({ ...closure, closureLongitude: e.target.value })} className="rounded-lg border-emerald-200 px-3 py-2 text-sm" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={captureClosureLocation} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700"><LocateFixed className="h-4 w-4" />Capture GPS</button>
                    <label className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700">
                      Upload after photos
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setClosure({ ...closure, afterPhotos: Array.from(e.target.files || []) })} />
                    </label>
                    {closure.afterPhotos.length > 0 && <span className="px-2 py-2 text-sm text-emerald-700">{closure.afterPhotos.length} selected</span>}
                  </div>
                  <button onClick={closeRequest} className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">Close with proof</button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[420px] items-center justify-center p-8 text-center text-slate-500">Select a request to process assignment, verification and closure.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const Stat = ({ label, value, icon: Icon, danger = false }: { label: string; value: number; icon: React.ElementType; danger?: boolean }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      </div>
      <div className={`rounded-lg p-2.5 ${danger ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}><Icon className="h-5 w-5" /></div>
    </div>
  </div>
);

const Info = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value || "Not available"}</p>
  </div>
);

const Select = ({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder: string }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border-slate-200 px-3 py-2 text-sm">
    <option value="">{placeholder}</option>
    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
);

export default WastePickupDashboard;
