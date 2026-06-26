import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileSearch,
  FileText,
  Home,
  Landmark,
  Link as LinkIcon,
  ReceiptText,
  ShieldCheck,
  Store,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertyTaxService } from "../services/propertyTaxService";
import { tradeLicenseService } from "../services/tradeLicenseService";
import { MySmcAccount, PropertyTaxAccount, TradeLicenseAccount } from "../types";

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
  const [serviceHoldingNumber, setServiceHoldingNumber] = useState("");
  const [serviceRequestType, setServiceRequestType] = useState("MUTATION_CORRECTION");
  const [serviceRemarks, setServiceRemarks] = useState("");
  const [tradeAccount, setTradeAccount] = useState<TradeLicenseAccount | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [tradeApplication, setTradeApplication] = useState({
    licenseNumber: "",
    applicationType: "NEW_LICENSE",
    businessName: "",
    tradeType: "",
    businessAddress: "",
    wardNumber: "",
    locality: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalProperties = account?.linkedProperties.length || 0;
  const totalDue = account?.totalDue || 0;
  const latestReceipt = account?.paymentReceipts?.[0];
  const totalTradeLicenses = tradeAccount?.tradeLicenses.length || 0;
  const totalTradeDue = tradeAccount?.tradeLicenseDue || 0;

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
      const [propertyAccount, tradeLicenseAccount] = await Promise.all([
        propertyTaxService.getMyAccount(),
        tradeLicenseService.getMyAccount(),
      ]);
      setAccount(propertyAccount);
      setTradeAccount(tradeLicenseAccount);
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

  const handleServiceRequest = async () => {
    if (!serviceHoldingNumber.trim()) {
      setError("Enter a holding number for the service request");
      return;
    }
    try {
      setActionLoading("service-request");
      setError("");
      await propertyTaxService.createServiceRequest(
        serviceHoldingNumber.trim(),
        serviceRequestType,
        serviceRemarks.trim()
      );
      setSuccess("Property service request submitted");
      setServiceHoldingNumber("");
      setServiceRemarks("");
      await loadAccount();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to submit service request");
    } finally {
      setActionLoading("");
    }
  };

  const handleLinkTradeLicense = async () => {
    if (!licenseNumber.trim()) {
      setError("Enter a trade license number to link");
      return;
    }
    try {
      setActionLoading("link-license");
      setError("");
      await tradeLicenseService.linkLicense(licenseNumber.trim());
      setSuccess("Trade license linked successfully");
      setLicenseNumber("");
      await loadAccount();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to link trade license");
    } finally {
      setActionLoading("");
    }
  };

  const handleTradeApplication = async () => {
    if (!tradeApplication.businessName.trim() || !tradeApplication.tradeType.trim() || !tradeApplication.businessAddress.trim()) {
      setError("Business name, trade type and business address are required");
      return;
    }
    try {
      setActionLoading("trade-application");
      setError("");
      await tradeLicenseService.submitApplication({
        ...tradeApplication,
        licenseNumber: tradeApplication.licenseNumber.trim() || undefined,
        wardNumber: tradeApplication.wardNumber
          ? Number(tradeApplication.wardNumber)
          : undefined,
      });
      setSuccess("Trade license application submitted");
      setTradeApplication({
        licenseNumber: "",
        applicationType: "NEW_LICENSE",
        businessName: "",
        tradeType: "",
        businessAddress: "",
        wardNumber: "",
        locality: "",
        remarks: "",
      });
      await loadAccount();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to submit trade license application");
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

            <section className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-blue-100 bg-blue-700 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                  SMC Citizen ID
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {account?.smcCitizenId}
                </p>
                <p className="mt-1 text-sm text-blue-100">
                  {account?.citizen?.name} · {account?.citizen?.mobileNumber} · {account?.provider || "MOCK"}
                </p>
              </div>
              <SummaryCard icon={Home} label="Linked Properties" value={String(totalProperties)} />
              <SummaryCard icon={BadgeIndianRupee} label="Total Tax Due" value={formatCurrency(totalDue)} />
              <SummaryCard icon={Store} label="Trade License Due" value={formatCurrency(totalTradeDue)} />
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

              <div className="flex flex-col gap-5">
                <div className="order-5 rounded-xl border border-amber-100 bg-amber-50/30 p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-amber-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                        Business Services
                      </p>
                      <h2 className="text-lg font-bold">My Trade Licenses ({totalTradeLicenses})</h2>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    For shop owners and businesses. Link an existing SMC trade license under your SMC Citizen ID.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={licenseNumber}
                      onChange={(event) => setLicenseNumber(event.target.value)}
                      placeholder="Try SMC-TL-1001"
                      className="min-h-[44px] flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      onClick={handleLinkTradeLicense}
                      disabled={actionLoading === "link-license"}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {actionLoading === "link-license" ? "Linking..." : "Link License"}
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {tradeAccount?.tradeLicenses.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                        No trade licenses linked yet. Existing businesses can link by license number.
                      </div>
                    )}
                    {tradeAccount?.tradeLicenses.map((license) => (
                      <div key={license.licenseNumber} className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              {license.licenseNumber}
                            </p>
                            <h3 className="mt-1 text-base font-bold">{license.businessName}</h3>
                            <p className="text-sm text-slate-500">
                              {license.tradeType} · {license.locality || "Silchar"}
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
                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                          <Amount label="Annual Fee" value={license.annualFee} />
                          <Amount label="Amount Due" value={license.amountDue} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Valid until {license.validTo || "review pending"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-6 rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                        Optional Business Workflow
                      </p>
                      <h2 className="text-lg font-bold">Trade License Services</h2>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <select
                      value={tradeApplication.applicationType}
                      onChange={(event) => setTradeApplication({ ...tradeApplication, applicationType: event.target.value })}
                      className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="NEW_LICENSE">New trade license</option>
                      <option value="RENEWAL">Renewal</option>
                      <option value="CORRECTION">Correction</option>
                      <option value="CLOSURE">Closure / surrender</option>
                    </select>
                    <input
                      value={tradeApplication.licenseNumber}
                      onChange={(event) => setTradeApplication({ ...tradeApplication, licenseNumber: event.target.value })}
                      placeholder="License number for renewal/correction"
                      className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      value={tradeApplication.businessName}
                      onChange={(event) => setTradeApplication({ ...tradeApplication, businessName: event.target.value })}
                      placeholder="Business name"
                      className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      value={tradeApplication.tradeType}
                      onChange={(event) => setTradeApplication({ ...tradeApplication, tradeType: event.target.value })}
                      placeholder="Trade type, e.g. retail shop, hotel, food stall"
                      className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <textarea
                      value={tradeApplication.businessAddress}
                      onChange={(event) => setTradeApplication({ ...tradeApplication, businessAddress: event.target.value })}
                      rows={3}
                      placeholder="Business address"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={tradeApplication.wardNumber}
                        onChange={(event) => setTradeApplication({ ...tradeApplication, wardNumber: event.target.value })}
                        placeholder="Ward number"
                        inputMode="numeric"
                        className="min-h-[44px] rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        value={tradeApplication.locality}
                        onChange={(event) => setTradeApplication({ ...tradeApplication, locality: event.target.value })}
                        placeholder="Locality"
                        className="min-h-[44px] rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <textarea
                      value={tradeApplication.remarks}
                      onChange={(event) => setTradeApplication({ ...tradeApplication, remarks: event.target.value })}
                      rows={3}
                      placeholder="Remarks for license officer"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      onClick={handleTradeApplication}
                      disabled={actionLoading === "trade-application"}
                      className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                    >
                      <ClipboardList className="h-4 w-4" />
                      {actionLoading === "trade-application" ? "Submitting..." : "Submit Trade License Request"}
                    </button>
                  </div>
                </div>

                <div className="order-1 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-blue-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                        Citizen Essentials
                      </p>
                      <h2 className="text-lg font-bold">Property Services</h2>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Property tax and holding services are kept first because they apply to most SMC citizens.
                  </p>
                  <div className="mt-4 space-y-3">
                    <input
                      value={serviceHoldingNumber}
                      onChange={(event) => setServiceHoldingNumber(event.target.value)}
                      placeholder="Holding number"
                      className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <select
                      value={serviceRequestType}
                      onChange={(event) => setServiceRequestType(event.target.value)}
                      className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="MUTATION_CORRECTION">Mutation / owner correction</option>
                      <option value="PROPERTY_TRANSFER">Property transfer</option>
                      <option value="BIFURCATION">Bifurcation</option>
                      <option value="AMALGAMATION">Amalgamation</option>
                      <option value="ASSESSMENT_CORRECTION">Assessment correction</option>
                    </select>
                    <textarea
                      value={serviceRemarks}
                      onChange={(event) => setServiceRemarks(event.target.value)}
                      rows={3}
                      placeholder="Remarks or correction details"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      onClick={handleServiceRequest}
                      disabled={actionLoading === "service-request"}
                      className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                    >
                      <ClipboardList className="h-4 w-4" />
                      {actionLoading === "service-request" ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </div>

                <div className="order-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-700" />
                    <h2 className="text-lg font-bold">Service Directory</h2>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {[...(account?.services || []), {
                      name: "Trade License",
                      description: "Link, apply, renew and track business licenses",
                      status: "ACTIVE",
                    }].map((service) => (
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

                <div className="order-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

                <div className="order-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="text-lg font-bold">Service Requests</h2>
                  <div className="mt-4 space-y-3">
                    {(!account?.propertyServiceRequests || account.propertyServiceRequests.length === 0) &&
                      (!tradeAccount?.tradeLicenseApplications || tradeAccount.tradeLicenseApplications.length === 0) && (
                      <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        Property and trade license requests will appear here.
                      </p>
                    )}
                    {account?.propertyServiceRequests?.map((request) => (
                      <div key={request.requestNumber} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-semibold">{request.requestNumber}</p>
                        <p className="text-sm text-slate-500">
                          {request.requestType.replace(/_/g, " ")} · {request.holdingNumber}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                          {request.status}
                        </span>
                      </div>
                    ))}
                    {tradeAccount?.tradeLicenseApplications?.map((request) => (
                      <div key={request.applicationNumber} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-semibold">{request.applicationNumber}</p>
                        <p className="text-sm text-slate-500">
                          {request.applicationType.replace(/_/g, " ")} · {request.businessName}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                          {request.status}
                        </span>
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
