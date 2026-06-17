import { BadgeIndianRupee, Building2, CheckCircle2, FileSpreadsheet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { propertyTaxService } from "../services/propertyTaxService";
import { PropertyTaxDashboard as PropertyTaxDashboardData } from "../types";

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const PropertyTaxDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<PropertyTaxDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    propertyTaxService
      .getOfficerDashboard()
      .then(setDashboard)
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load property tax dashboard")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-500">Loading property tax dashboard...</div>;
  }

  if (error) {
    return <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          Revenue Services
        </p>
        <h1 className="text-2xl font-bold text-slate-950">Property Tax Dashboard</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Building2} label="Properties" value={String(dashboard?.totalProperties || 0)} />
        <Metric icon={CheckCircle2} label="Linked Accounts" value={String(dashboard?.linkedProperties || 0)} />
        <Metric icon={BadgeIndianRupee} label="Collected" value={formatCurrency(dashboard?.totalCollected)} />
        <Metric icon={FileSpreadsheet} label="Outstanding" value={formatCurrency(dashboard?.totalOutstanding)} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold">Ward-wise Outstanding</h2>
          <div className="mt-4 space-y-3">
            {dashboard?.wardWise.map((ward) => (
              <div key={ward.wardNumber} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      Ward {ward.wardNumber} {ward.wardName ? `· ${ward.wardName}` : ""}
                    </p>
                    <p className="text-sm text-slate-500">{ward.properties} properties</p>
                  </div>
                  <p className="font-bold text-blue-800">{formatCurrency(ward.outstanding)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold">Recent Receipts</h2>
          <div className="mt-4 space-y-3">
            {dashboard?.recentReceipts.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No payment receipts yet.
              </p>
            )}
            {dashboard?.recentReceipts.map((receipt) => (
              <div key={receipt.receiptNumber} className="rounded-lg border border-slate-200 p-3">
                <p className="font-semibold">{receipt.receiptNumber}</p>
                <p className="text-sm text-slate-500">{receipt.holdingNumber}</p>
                <p className="mt-2 text-lg font-bold text-emerald-700">
                  {formatCurrency(receipt.amountPaid)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <Icon className="h-5 w-5 text-blue-700" />
    <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
  </div>
);

export default PropertyTaxDashboard;
