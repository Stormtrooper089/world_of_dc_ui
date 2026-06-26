import { BadgeIndianRupee, FileText, RefreshCw, ShieldCheck, Store } from "lucide-react";
import React, { useEffect, useState } from "react";
import { tradeLicenseService } from "../services/tradeLicenseService";
import { TradeLicenseDashboard as TradeLicenseDashboardData } from "../types";

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const TradeLicenseDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<TradeLicenseDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      setDashboard(await tradeLicenseService.getOfficerDashboard());
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load trade license dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApprove = async (applicationNumber: string) => {
    const amountInput = window.prompt("Enter payable trade license fee", "2500");
    if (amountInput === null) {
      return;
    }
    const payableAmount = Number(amountInput);
    if (Number.isNaN(payableAmount) || payableAmount < 0) {
      setError("Enter a valid payable amount");
      return;
    }
    const remarks = window.prompt("Officer remarks for citizen", "Accepted. Please complete payment.") || "";
    try {
      setActionLoading(applicationNumber);
      setError("");
      await tradeLicenseService.approveApplication(applicationNumber, {
        payableAmount,
        remarks,
      });
      await loadDashboard();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to accept trade license application");
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (applicationNumber: string) => {
    const rejectionReason = window.prompt("Reason for rejection");
    if (!rejectionReason?.trim()) {
      return;
    }
    try {
      setActionLoading(applicationNumber);
      setError("");
      await tradeLicenseService.rejectApplication(applicationNumber, {
        rejectionReason: rejectionReason.trim(),
        remarks: rejectionReason.trim(),
      });
      await loadDashboard();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to reject trade license application");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="h-full overflow-auto bg-slate-50 p-4 text-slate-950 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Revenue Services
          </p>
          <h1 className="text-2xl font-bold text-slate-950">Trade License Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track linked licenses, pending applications, renewals and license dues.
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
          Loading trade license data...
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric icon={Store} label="Total Licenses" value={dashboard?.totalLicenses || 0} />
            <Metric icon={ShieldCheck} label="Active" value={dashboard?.activeLicenses || 0} />
            <Metric icon={FileText} label="Expired" value={dashboard?.expiredLicenses || 0} />
            <Metric icon={FileText} label="Pending Applications" value={dashboard?.pendingApplications || 0} />
            <Metric icon={BadgeIndianRupee} label="License Dues" value={formatCurrency(dashboard?.totalDue)} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">Recent Applications</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="py-3 pr-4">Application</th>
                      <th className="py-3 pr-4">Business</th>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Ward</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Payment</th>
                      <th className="py-3 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard?.recentApplications?.map((application) => (
                      <tr key={application.applicationNumber} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-semibold">{application.applicationNumber}</td>
                        <td className="py-3 pr-4">{application.businessName}</td>
                        <td className="py-3 pr-4">{application.applicationType.replace(/_/g, " ")}</td>
                        <td className="py-3 pr-4">{application.wardNumber || "-"}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                            {application.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-semibold">{formatCurrency(application.payableAmount)}</p>
                          <p className="text-xs text-slate-500">
                            {application.paymentStatus || "NOT REQUIRED"}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          {application.status === "SUBMITTED" ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleApprove(application.applicationNumber)}
                                disabled={actionLoading === application.applicationNumber}
                                className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleReject(application.applicationNumber)}
                                disabled={actionLoading === application.applicationNumber}
                                className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">
                              {application.receiptNumber || application.upyogPaymentConsumerCode || "-"}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">License Register</h2>
              <div className="mt-4 space-y-3">
                {dashboard?.licenses?.map((license) => (
                  <div key={license.licenseNumber} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {license.licenseNumber}
                        </p>
                        <p className="font-bold">{license.businessName}</p>
                        <p className="text-sm text-slate-500">
                          {license.tradeType} · Ward {license.wardNumber || "-"}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                        license.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {license.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-blue-800">
                      Due: {formatCurrency(license.amountDue)}
                    </p>
                  </div>
                ))}
              </div>
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

export default TradeLicenseDashboard;
