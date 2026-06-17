import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  CreditCard,
  FileText,
  Home,
  Landmark,
  Link as LinkIcon,
  ReceiptText,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertyTaxService } from "../services/propertyTaxService";
import { MySmcAccount, PropertyTaxAccount } from "../types";

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const MySMCAccount: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<MySmcAccount | null>(null);
  const [holdingNumber, setHoldingNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalProperties = account?.linkedProperties.length || 0;
  const totalDue = account?.totalDue || 0;
  const latestReceipt = account?.paymentReceipts?.[0];

  const dueProperties = useMemo(
    () =>
      account?.linkedProperties.filter((property) => property.amountDue > 0) ||
      [],
    [account]
  );

  const loadAccount = async () => {
    try {
      setLoading(true);
      setError("");
      setAccount(await propertyTaxService.getMyAccount());
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load SMC account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const handleLinkProperty = async () => {
    if (!holdingNumber.trim()) {
      setError("Enter a holding number to link property");
      return;
    }
    try {
      setActionLoading("link");
      setError("");
      await propertyTaxService.linkProperty(holdingNumber.trim());
      setSuccess("Property linked successfully");
      setHoldingNumber("");
      await loadAccount();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to link property");
    } finally {
      setActionLoading("");
    }
  };

  const handlePay = async (property: PropertyTaxAccount) => {
    try {
      setActionLoading(property.holdingNumber);
      setError("");
      await propertyTaxService.payPropertyTax(property.holdingNumber);
      setSuccess(`Payment recorded for ${property.holdingNumber}`);
      await loadAccount();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to process payment");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/citizen")}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Silchar Municipal Corporation
            </p>
            <h1 className="text-lg font-bold sm:text-2xl">My SMC Account</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading account...
          </div>
        ) : (
          <div className="space-y-5">
            {(error || success) && (
              <div
                className={`rounded-lg border p-3 text-sm font-medium ${
                  error
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {error || success}
              </div>
            )}

            <section className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-blue-100 bg-blue-700 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                  SMC Citizen ID
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {account?.smcCitizenId}
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  {account?.citizen?.name} · {account?.citizen?.mobileNumber}
                </p>
              </div>
              <SummaryCard icon={Home} label="Linked Properties" value={String(totalProperties)} />
              <SummaryCard icon={BadgeIndianRupee} label="Total Tax Due" value={formatCurrency(totalDue)} />
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-blue-700" />
                  <h2 className="text-lg font-bold">My Properties</h2>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={holdingNumber}
                    onChange={(event) => setHoldingNumber(event.target.value)}
                    placeholder="Try SMC-HLD-1001"
                    className="min-h-[44px] flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    onClick={handleLinkProperty}
                    disabled={actionLoading === "link"}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {actionLoading === "link" ? "Linking..." : "Link Property"}
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {account?.linkedProperties.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                      No properties linked yet. Use a holding number to connect your property tax account.
                    </div>
                  )}
                  {account?.linkedProperties.map((property) => (
                    <div
                      key={property.holdingNumber}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {property.holdingNumber}
                          </p>
                          <h3 className="mt-1 text-base font-bold">
                            {property.ownerName}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {property.wardName} · {property.locality}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {property.propertyType} · {property.usageType}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Amount Due
                          </p>
                          <p className="text-xl font-bold text-blue-800">
                            {formatCurrency(property.amountDue)}
                          </p>
                          <p className="text-xs text-slate-500">
                            FY {property.financialYear}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                        <Amount label="Annual" value={property.annualTax} />
                        <Amount label="Arrears" value={property.arrears} />
                        <Amount label="Penalty" value={property.penalty} />
                        <Amount label="Rebate" value={property.rebate} />
                      </div>
                      <button
                        onClick={() => handlePay(property)}
                        disabled={
                          property.amountDue <= 0 ||
                          actionLoading === property.holdingNumber
                        }
                        className="mt-4 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto"
                      >
                        <CreditCard className="h-4 w-4" />
                        {property.amountDue <= 0
                          ? "Paid"
                          : actionLoading === property.holdingNumber
                          ? "Processing..."
                          : "Pay Now"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-700" />
                    <h2 className="text-lg font-bold">My Services</h2>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {account?.services.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                      >
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-sm text-slate-500">
                            {service.description}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            service.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {service.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-blue-700" />
                    <h2 className="text-lg font-bold">Payment Receipts</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {!latestReceipt && (
                      <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        Receipts generated after simulated payment will appear here.
                      </p>
                    )}
                    {account?.paymentReceipts.map((receipt) => (
                      <div
                        key={receipt.receiptNumber}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {receipt.receiptNumber}
                            </p>
                            <p className="text-sm text-slate-500">
                              {receipt.holdingNumber} · FY {receipt.financialYear}
                            </p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="mt-2 text-lg font-bold text-emerald-700">
                          {formatCurrency(receipt.amountPaid)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {receipt.transactionReference}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <Icon className="h-5 w-5 text-blue-700" />
    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
  </div>
);

const Amount = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-slate-50 px-3 py-2">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-semibold">{formatCurrency(value)}</p>
  </div>
);

export default MySMCAccount;
