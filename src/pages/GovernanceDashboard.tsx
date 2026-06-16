import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  MapPinned,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { governanceService } from "../services/governanceService";
import { wastePickupService } from "../services/wastePickupService";
import {
  CategoryPerformance,
  DepartmentPerformance,
  GovernanceDashboard as GovernanceDashboardData,
  GovernancePriorityItem,
  OfficerPerformance,
  WardPerformance,
} from "../types";
import { WastePickupDashboard as WastePickupDashboardData } from "../types/wastePickupTypes";

const formatNumber = (value?: number) => (value ?? 0).toLocaleString("en-IN");

const formatDate = (value?: string) => {
  if (!value) return "No SLA";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const StatCard = ({
  label,
  value,
  helper,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  tone?: "blue" | "red" | "green" | "amber" | "slate";
}) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    red: "bg-red-50 text-red-700 border-red-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`rounded-lg border p-2.5 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </div>
  );
};

const ProgressBar = ({ value, tone = "blue" }: { value: number; tone?: "blue" | "red" | "green" | "amber" }) => {
  const colors = {
    blue: "bg-blue-600",
    red: "bg-red-600",
    green: "bg-emerald-600",
    amber: "bg-amber-500",
  };
  const safeValue = Math.max(0, Math.min(value || 0, 100));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
};

const GovernanceDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<GovernanceDashboardData | null>(null);
  const [wasteDashboard, setWasteDashboard] = useState<WastePickupDashboardData | null>(null);
  const [selectedSlaDays, setSelectedSlaDays] = useState<number | undefined>(undefined);
  const [customSlaDays, setCustomSlaDays] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");
      setIsLoading(true);
      const [data, wasteData] = await Promise.all([
        governanceService.getDashboard(selectedSlaDays),
        wastePickupService.dashboard(),
      ]);
      setDashboard(data);
      setWasteDashboard(wasteData);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load governance dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedSlaDays]);

  const applyPreset = (days?: number) => {
    setCustomSlaDays("");
    setSelectedSlaDays(days);
  };

  const applyCustomSlaDays = () => {
    const parsedDays = Number(customSlaDays);
    if (!Number.isFinite(parsedDays) || parsedDays < 1) {
      setError("Please enter a valid pending day count.");
      return;
    }
    setSelectedSlaDays(Math.floor(parsedDays));
  };

  const maxWardOpen = useMemo(
    () => Math.max(...(dashboard?.wardPerformance ?? []).map((ward) => ward.openComplaints), 1),
    [dashboard?.wardPerformance]
  );

  const maxCategoryOpen = useMemo(
    () => Math.max(...(dashboard?.categoryPerformance ?? []).map((category) => category.openComplaints), 1),
    [dashboard?.categoryPerformance]
  );

  const maxDepartmentOpen = useMemo(
    () => Math.max(...(dashboard?.departmentPerformance ?? []).map((department) => department.openComplaints), 1),
    [dashboard?.departmentPerformance]
  );

  const maxOfficerOpen = useMemo(
    () => Math.max(...(dashboard?.officerPerformance ?? []).map((officer) => officer.openComplaints), 1),
    [dashboard?.officerPerformance]
  );

  const exportCsv = () => {
    if (!dashboard) return;
    const rows = [
      ["Mode", dashboard.summary.slaFilterApplied ? `Pending >= ${dashboard.summary.selectedSlaDays} days` : "All-time"],
      [],
      ["Ward", "Zone", "Total", "Pending", "Resolved", "SLA Breached", "Resolution Rate", "Top Category"],
      ...dashboard.wardPerformance.map((ward) => [
        ward.wardNumber ? `Ward ${ward.wardNumber}` : ward.wardName || "Unmapped",
        ward.zone || "",
        ward.totalComplaints,
        ward.openComplaints,
        ward.resolvedComplaints,
        ward.slaBreached,
        `${ward.resolutionRate}%`,
        ward.topCategory || "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = dashboard.summary.slaFilterApplied
      ? `smc-governance-dashboard-pending-${dashboard.summary.selectedSlaDays}-days.csv`
      : "smc-governance-dashboard-all-time.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = dashboard?.summary;
  const isSlaMode = Boolean(summary?.slaFilterApplied);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                SMC Governance
              </p>
              <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
                Commissioner Control Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                All-time governance view with optional pending-age SLA analysis.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
            <button
              type="button"
              onClick={() => applyPreset(undefined)}
              className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
                !selectedSlaDays
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              All-time
            </button>
            {[3, 7, 15, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => applyPreset(days)}
                className={`inline-flex min-h-[38px] items-center rounded-lg px-3 text-sm font-semibold ${
                  selectedSlaDays === days
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {days}d SLA
              </button>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                value={customSlaDays}
                onChange={(event) => setCustomSlaDays(event.target.value)}
                placeholder="Custom"
                className="min-h-[38px] w-24 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={applyCustomSlaDays}
                className="inline-flex min-h-[38px] items-center rounded-lg bg-slate-800 px-3 text-sm font-semibold text-white hover:bg-slate-900"
              >
                Apply
              </button>
            </div>
            {selectedSlaDays && (
              <button
                type="button"
                onClick={() => applyPreset(undefined)}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!dashboard}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {isLoading && !dashboard ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={isSlaMode ? "Pending beyond SLA" : "Total complaints"}
                value={formatNumber(summary?.totalComplaints)}
                helper={
                  isSlaMode
                    ? `Pending for ${summary?.selectedSlaDays}+ days`
                    : "All complaints irrespective of age or SLA"
                }
                icon={Clock3}
                tone="blue"
              />
              <StatCard
                label="Pending"
                value={formatNumber(summary?.pendingComplaints ?? summary?.openComplaints)}
                helper={isSlaMode ? `${summary?.slaBreachPercentage ?? 0}% of pending workload` : "Created, assigned, in progress or blocked"}
                icon={AlertTriangle}
                tone={isSlaMode || summary?.slaBreached ? "red" : "amber"}
              />
              <StatCard
                label="Resolved / rejected"
                value={`${formatNumber(summary?.resolvedComplaints)} / ${formatNumber(summary?.rejectedComplaints)}`}
                helper={`${summary?.resolutionRate ?? 0}% resolution rate`}
                icon={CheckCircle2}
                tone="green"
              />
              <StatCard
                label="Escalated / avg time"
                value={`${formatNumber(summary?.escalatedComplaints)} / ${summary?.averageResolutionDays ?? 0}d`}
                helper={isSlaMode ? "Escalated pending cases and avg resolution time" : "SLA-overdue or blocked, plus avg resolution time"}
                icon={MapPinned}
                tone="amber"
              />
            </section>

            {isSlaMode && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                Showing only complaints with status not resolved/closed and age greater than or equal to {summary?.selectedSlaDays} days.
              </div>
            )}

            <section className="mt-5 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-950">SMC Solid Waste Snapshot</h2>
                    <p className="text-sm text-slate-500">
                      Waste pickup requests, sanitation SLA breaches and repeat hotspots.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                  <MetricPill label="Requests" value={wasteDashboard?.totalRequests || 0} />
                  <MetricPill label="Pending" value={wasteDashboard?.pendingRequests || 0} />
                  <MetricPill label="SLA" value={wasteDashboard?.slaBreachedRequests || 0} danger />
                  <MetricPill label="Hotspots" value={wasteDashboard?.repeatHotspots?.length || 0} danger />
                </div>
              </div>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr,0.9fr]">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-base font-bold text-slate-950">Ward-Wise Accountability</h2>
                  <p className="text-sm text-slate-500">
                    {isSlaMode ? "Ward-wise pending cases beyond selected SLA days." : "All-time ward pendency and workload."}
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {(dashboard?.wardPerformance ?? []).length === 0 ? (
                    <EmptyState label="No ward data available yet." />
                  ) : (
                    dashboard?.wardPerformance.map((ward: WardPerformance) => (
                      <div key={`${ward.wardNumber ?? "unmapped"}-${ward.wardName}`} className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {ward.wardNumber ? `Ward ${ward.wardNumber}` : ward.wardName || "Unmapped complaints"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {ward.zone || "No zone mapped"} · Top issue: {ward.topCategory || "No data"}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-[260px]">
                            <MetricPill label="Pending" value={ward.openComplaints} />
                            <MetricPill label={isSlaMode ? "Filtered" : "SLA"} value={isSlaMode ? ward.totalComplaints : ward.slaBreached} danger />
                            <MetricPill label="Resolved" value={`${ward.resolutionRate}%`} />
                          </div>
                        </div>
                        <div className="mt-3">
                          <ProgressBar value={(ward.openComplaints / maxWardOpen) * 100} tone={ward.slaBreached ? "red" : "blue"} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-base font-bold text-slate-950">Service Hotspots</h2>
                  <p className="text-sm text-slate-500">
                    {isSlaMode ? "Category-wise pending beyond SLA." : "Categories needing intervention."}
                  </p>
                </div>
                <div className="space-y-4 p-4">
                  {(dashboard?.categoryPerformance ?? []).length === 0 ? (
                    <EmptyState label="No category data available yet." />
                  ) : (
                    dashboard?.categoryPerformance.map((category: CategoryPerformance) => (
                      <div key={category.category}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-800">{category.label}</span>
                          <span className="text-slate-500">{category.openComplaints} open</span>
                        </div>
                        <ProgressBar
                          value={(category.openComplaints / maxCategoryOpen) * 100}
                          tone={category.slaBreached ? "red" : "blue"}
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                          <span>{category.totalComplaints} total</span>
                          <span>{category.slaBreached} SLA breached</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-base font-bold text-slate-950">Department-Wise Pendency</h2>
                  <p className="text-sm text-slate-500">
                    {isSlaMode ? "Departments with pending complaints beyond selected SLA days." : "All-time pending load by assigned department."}
                  </p>
                </div>
                <div className="space-y-4 p-4">
                  {(dashboard?.departmentPerformance ?? []).length === 0 ? (
                    <EmptyState label="No department pendency available yet." />
                  ) : (
                    dashboard?.departmentPerformance.map((department: DepartmentPerformance) => (
                      <div key={department.department}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-800">{department.label}</span>
                          <span className="text-slate-500">{department.openComplaints} pending</span>
                        </div>
                        <ProgressBar
                          value={(department.openComplaints / maxDepartmentOpen) * 100}
                          tone={department.slaBreached ? "red" : "blue"}
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                          <span>{department.totalComplaints} total</span>
                          <span>{isSlaMode ? department.totalComplaints : department.slaBreached} SLA flagged</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-base font-bold text-slate-950">Officer-Wise Pendency</h2>
                  <p className="text-sm text-slate-500">
                    {isSlaMode ? "Assigned officer workload beyond selected SLA days." : "All-time assigned officer workload."}
                  </p>
                </div>
                <div className="space-y-4 p-4">
                  {(dashboard?.officerPerformance ?? []).length === 0 ? (
                    <EmptyState label="No officer pendency available yet." />
                  ) : (
                    dashboard?.officerPerformance.map((officer: OfficerPerformance) => (
                      <div key={officer.officerId || "unassigned"}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-800">{officer.label}</span>
                          <span className="text-slate-500">{officer.openComplaints} pending</span>
                        </div>
                        <ProgressBar
                          value={(officer.openComplaints / maxOfficerOpen) * 100}
                          tone={officer.slaBreached ? "red" : "blue"}
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                          <span>{officer.totalComplaints} assigned</span>
                          <span>{isSlaMode ? officer.totalComplaints : officer.slaBreached} SLA flagged</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr,1.35fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-700" />
                  <h2 className="text-base font-bold text-slate-950">Status Mix</h2>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(dashboard?.statusBreakdown ?? []).map((status) => (
                    <div key={status.status} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{status.label}</p>
                      <p className="mt-1 text-xl font-bold text-slate-950">{status.count}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      Avg citizen rating: {summary?.averageCitizenRating || 0}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <h2 className="text-base font-bold text-slate-950">Oldest Pending Complaints</h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    {isSlaMode ? "Oldest complaints inside the selected pending-age filter." : "Oldest unresolved complaints across the system."}
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {(dashboard?.oldestPendingComplaints ?? []).length === 0 ? (
                    <EmptyState label="No pending complaints found for this view." />
                  ) : (
                    dashboard?.oldestPendingComplaints.map((item: GovernancePriorityItem) => (
                      <div key={item.id} className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-mono text-xs font-bold text-blue-700">#{item.complaintNumber}</p>
                            <p className="mt-1 font-semibold text-slate-950">{item.subject}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.category || "Other"} · {item.wardNumber ? `Ward ${item.wardNumber}` : "Ward unmapped"}
                              {item.location ? ` · ${item.location}` : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {item.status}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.slaBreached ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                              {item.ageDays} days old
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">SLA due: {formatDate(item.slaDueAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

const MetricPill = ({ label, value, danger = false }: { label: string; value: number | string; danger?: boolean }) => (
  <div className={`rounded-lg border px-2 py-1.5 ${danger ? "border-red-100 bg-red-50 text-red-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
    <p className="font-bold">{value}</p>
    <p className="uppercase tracking-wide">{label}</p>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="p-8 text-center text-sm font-medium text-slate-500">{label}</div>
);

export default GovernanceDashboard;
