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
  Layers3,
  MapPinned,
  Maximize2,
  Navigation,
  ReceiptText,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertyTaxService } from "../services/propertyTaxService";
import { tradeLicenseService } from "../services/tradeLicenseService";
import { LandParcelLink, MySmcAccount, PropertyTaxAccount, TradeLicenseAccount } from "../types";

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
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, { rating: string; feedback: string }>>({});
  const [selectedMapProperty, setSelectedMapProperty] = useState<PropertyTaxAccount | null>(null);
  const [landParcel, setLandParcel] = useState<LandParcelLink | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
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

  const handleTradeLicensePayment = async (applicationNumber: string) => {
    try {
      setActionLoading(`trade-pay-${applicationNumber}`);
      setError("");
      await tradeLicenseService.payApplication(applicationNumber);
      setSuccess("Trade license fee paid and license issued");
      await loadAccount();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to process trade license payment");
    } finally {
      setActionLoading("");
    }
  };

  const handleTradeLicenseFeedback = async (applicationNumber: string) => {
    const draft = feedbackDrafts[applicationNumber] || { rating: "", feedback: "" };
    const rating = Number(draft.rating);
    if (!rating || rating < 1 || rating > 5) {
      setError("Select a rating between 1 and 5 for trade license feedback");
      return;
    }
    try {
      setActionLoading(`trade-feedback-${applicationNumber}`);
      setError("");
      await tradeLicenseService.submitFeedback(applicationNumber, {
        rating,
        feedback: draft.feedback.trim(),
      });
      setSuccess("Trade license feedback submitted");
      await loadAccount();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to submit trade license feedback");
    } finally {
      setActionLoading("");
    }
  };

  const openCadastralMap = async (property: PropertyTaxAccount) => {
    setSelectedMapProperty(property);
    setLandParcel(null);
    setMapLoading(true);
    try {
      setLandParcel(await propertyTaxService.getLandParcel(property.holdingNumber));
    } catch (err: any) {
      setError(err.response?.data?.message || "Land-record link is not available for this property yet");
    } finally {
      setMapLoading(false);
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

            <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                    My SMC Services
                  </p>
                  <p className="text-sm text-slate-500">
                    Jump to any linked citizen or business service on this page.
                  </p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                  <ServiceShortcut href="#properties" label="Property Tax" tone="primary" />
                  <ServiceShortcut href="#property-services" label="Property Requests" tone="primary" />
                  <ServiceShortcut href="#receipts" label="Receipts" tone="primary" />
                  <ServiceShortcut href="#service-requests" label="Track Requests" tone="primary" />
                  <ServiceShortcut href="#trade-licenses" label="Trade License" tone="business" />
                  <ServiceShortcut href="#trade-license-services" label="Business Requests" tone="business" />
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div id="properties" className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                      onClick={() => openCadastralMap(property)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openCadastralMap(property);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open cadastral map for ${property.holdingNumber}`}
                      className="cursor-pointer rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openCadastralMap(property);
                          }}
                          className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-800 hover:bg-blue-100 sm:w-auto"
                        >
                          <MapPinned className="h-4 w-4" />
                          View cadastral map
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePay(property);
                          }}
                          disabled={
                            property.amountDue <= 0 ||
                            actionLoading === property.holdingNumber
                          }
                          className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto"
                        >
                          <CreditCard className="h-4 w-4" />
                          {property.amountDue <= 0
                            ? "Paid"
                            : actionLoading === property.holdingNumber
                            ? "Processing..."
                            : "Pay Now"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedMapProperty && (
                  <CadastralMap
                    property={selectedMapProperty}
                    landParcel={landParcel}
                    loading={mapLoading}
                    onClose={() => {
                      setSelectedMapProperty(null);
                      setLandParcel(null);
                    }}
                  />
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div id="trade-licenses" className="order-5 scroll-mt-6 rounded-xl border border-amber-100 bg-amber-50/30 p-4 shadow-sm">
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

                <div id="trade-license-services" className="order-6 scroll-mt-6 rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
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

                <div id="property-services" className="order-1 scroll-mt-6 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
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

                <div id="receipts" className="order-2 scroll-mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

                <div id="service-requests" className="order-3 scroll-mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold">{request.applicationNumber}</p>
                            <p className="text-sm text-slate-500">
                              {request.applicationType.replace(/_/g, " ")} · {request.businessName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              UPYOG ref: {request.upyogApplicationId || request.upyogPaymentConsumerCode || "ready after acceptance"}
                            </p>
                          </div>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                            request.status === "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : request.status === "ISSUED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {request.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        {request.officerRemarks && (
                          <p className="mt-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900">
                            Officer note: {request.officerRemarks}
                          </p>
                        )}
                        {request.rejectionReason && (
                          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                            Rejection reason: {request.rejectionReason}
                          </p>
                        )}
                        {request.status === "PAYMENT_PENDING" && (
                          <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 p-3">
                            <p className="text-sm font-semibold text-emerald-900">
                              License fee payable: {formatCurrency(request.payableAmount)}
                            </p>
                            <p className="mt-1 text-xs text-emerald-800">
                              Payment will be routed through the UPYOG-ready trade license consumer code.
                            </p>
                            <button
                              onClick={() => handleTradeLicensePayment(request.applicationNumber)}
                              disabled={actionLoading === `trade-pay-${request.applicationNumber}`}
                              className="mt-3 inline-flex min-h-[38px] items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <CreditCard className="h-4 w-4" />
                              {actionLoading === `trade-pay-${request.applicationNumber}` ? "Processing..." : "Pay License Fee"}
                            </button>
                          </div>
                        )}
                        {request.status === "ISSUED" && (
                          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                            <p className="text-sm font-semibold text-slate-900">
                              Receipt: {request.receiptNumber || "Generated"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {request.paymentReference || "UPYOG payment reference will sync here."}
                            </p>
                            {request.citizenRating ? (
                              <p className="mt-2 text-sm text-emerald-700">
                                Feedback submitted: {request.citizenRating}/5
                              </p>
                            ) : (
                              <div className="mt-3 grid gap-2 sm:grid-cols-[120px_1fr_auto]">
                                <select
                                  value={feedbackDrafts[request.applicationNumber]?.rating || ""}
                                  onChange={(event) =>
                                    setFeedbackDrafts({
                                      ...feedbackDrafts,
                                      [request.applicationNumber]: {
                                        rating: event.target.value,
                                        feedback: feedbackDrafts[request.applicationNumber]?.feedback || "",
                                      },
                                    })
                                  }
                                  className="min-h-[38px] rounded-md border border-slate-200 px-2 text-sm outline-none focus:border-blue-500"
                                >
                                  <option value="">Rating</option>
                                  <option value="5">5 - Excellent</option>
                                  <option value="4">4 - Good</option>
                                  <option value="3">3 - Average</option>
                                  <option value="2">2 - Poor</option>
                                  <option value="1">1 - Bad</option>
                                </select>
                                <input
                                  value={feedbackDrafts[request.applicationNumber]?.feedback || ""}
                                  onChange={(event) =>
                                    setFeedbackDrafts({
                                      ...feedbackDrafts,
                                      [request.applicationNumber]: {
                                        rating: feedbackDrafts[request.applicationNumber]?.rating || "",
                                        feedback: event.target.value,
                                      },
                                    })
                                  }
                                  placeholder="Service feedback"
                                  className="min-h-[38px] rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                                />
                                <button
                                  onClick={() => handleTradeLicenseFeedback(request.applicationNumber)}
                                  disabled={actionLoading === `trade-feedback-${request.applicationNumber}`}
                                  className="min-h-[38px] rounded-md bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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

const ServiceShortcut = ({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "primary" | "business";
}) => (
  <a
    href={href}
    className={`inline-flex min-h-[38px] shrink-0 items-center rounded-full border px-3 text-sm font-semibold transition-colors ${
      tone === "business"
        ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
        : "border-blue-100 bg-blue-50 text-blue-800 hover:bg-blue-100"
    }`}
  >
    {label}
  </a>
);

const CadastralMap = ({
  property,
  landParcel,
  loading,
  onClose,
}: {
  property: PropertyTaxAccount;
  landParcel: LandParcelLink | null;
  loading: boolean;
  onClose: () => void;
}) => {
  const parcelId = property.assessmentNumber || property.holdingNumber;
  const location = [property.locality, property.wardName].filter(Boolean).join(", ") || "Silchar Municipal Area";

  return (
    <section
      id="cadastral-map"
      className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-label={`Cadastral map for ${property.holdingNumber}`}
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-4 py-4 text-white sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-white/10 p-2 text-blue-200 ring-1 ring-white/15">
            <MapPinned className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              {landParcel?.officialBoundary ? "Official cadastral boundary" : "Municipal property map"}
            </p>
            <h3 className="mt-1 text-lg font-bold">Cadastral map · {property.holdingNumber}</h3>
            <p className="mt-1 text-sm text-slate-300">{location}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 self-start rounded-md border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20 lg:self-auto"
        >
          <X className="h-4 w-4" />
          Close map
        </button>
      </div>

      <div className="grid border-b border-slate-200 bg-slate-50 sm:grid-cols-3">
        <MapDetail label="Holding number" value={property.holdingNumber} />
        <MapDetail label="Cadastral reference" value={landParcel?.cadastralReference || parcelId} />
        <MapDetail label="Map status" value={loading ? "Checking land record…" : landParcel?.status?.replace(/_/g, " ") || "Reference pending"} />
      </div>

      <div className="relative h-[360px] overflow-hidden bg-slate-900 sm:h-[440px]">
        <svg
          viewBox="0 0 1200 600"
          className="h-full w-full"
          role="img"
          aria-label={`Indicative parcel map highlighting ${property.holdingNumber}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="mapTerrain" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#243a35" />
              <stop offset="0.46" stopColor="#37504a" />
              <stop offset="1" stopColor="#1e302d" />
            </linearGradient>
            <pattern id="mapGrid" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
              <path d="M 0 0 L 0 56 M 0 0 L 56 0" fill="none" stroke="#8ea19d" strokeOpacity=".12" strokeWidth="1" />
            </pattern>
            <filter id="parcelGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="1200" height="600" fill="url(#mapTerrain)" />
          <rect width="1200" height="600" fill="url(#mapGrid)" />
          <path d="M-30 96 C150 56 235 158 411 117 S718 13 890 91 S1100 159 1240 78" fill="none" stroke="#789a83" strokeOpacity=".25" strokeWidth="40" />
          <path d="M-30 96 C150 56 235 158 411 117 S718 13 890 91 S1100 159 1240 78" fill="none" stroke="#b4c7ac" strokeOpacity=".24" strokeWidth="2" />
          <path d="M-40 452 C152 392 244 495 429 438 S715 352 887 436 S1082 518 1240 438" fill="none" stroke="#7d9a78" strokeOpacity=".2" strokeWidth="65" />
          <path d="M-40 452 C152 392 244 495 429 438 S715 352 887 436 S1082 518 1240 438" fill="none" stroke="#d6d3b6" strokeOpacity=".22" strokeWidth="2" />

          <g fill="#52625e" fillOpacity=".62" stroke="#d4dfd8" strokeOpacity=".56" strokeWidth="1.5">
            <path d="M42 162 l94 -31 58 47 -30 91 -88 23 -49 -48z" />
            <path d="M199 124 l91 -21 50 58 -21 89 -94 29 -48 -64z" />
            <path d="M359 137 l80 -40 60 43 -10 104 -97 24 -44 -49z" />
            <path d="M517 99 l104 33 23 99 -90 42 -75 -48z" />
            <path d="M679 118 l74 -46 79 53 -16 113 -87 29 -73 -57z" />
            <path d="M860 122 l111 -25 57 68 -35 99 -103 11 -53 -72z" />
            <path d="M1047 105 l109 31 25 99 -88 47 -85 -56z" />
            <path d="M84 338 l87 -29 66 48 -19 98 -101 33 -55 -71z" />
            <path d="M273 306 l98 -26 51 70 -25 97 -96 23 -55 -63z" />
            <path d="M461 319 l79 -29 66 55 -7 97 -104 33 -55 -59z" />
            <path d="M649 310 l91 -25 56 60 -21 108 -104 24 -51 -70z" />
            <path d="M840 319 l92 -31 72 58 -15 110 -101 19 -62 -66z" />
            <path d="M1030 331 l96 -29 66 58 -35 111 -101 14 -53 -70z" />
          </g>
          <g fill="#2f8380" fillOpacity=".45" stroke="#a8e1d8" strokeOpacity=".58" strokeWidth="1.5">
            <path d="M-8 190 l31 56 -18 83 59 19 32 -56 -19 -84 -51 -39z" />
            <path d="M322 252 l35 38 -10 65 51 29 45 -47 -24 -73 -53 -25z" />
            <path d="M796 234 l42 44 -19 69 59 17 44 -62 -31 -64 -53 -14z" />
            <path d="M606 430 l36 37 -14 66 60 33 49 -51 -24 -72 -58 -22z" />
          </g>
          <g filter="url(#parcelGlow)">
            <path d="M461 319 l79 -29 66 55 -7 97 -104 33 -55 -59z" fill="#e89a25" fillOpacity=".78" stroke="#fff2b2" strokeWidth="4" />
          </g>
          <path d="M0 300 L1200 300" stroke="#e7dfc6" strokeOpacity=".4" strokeWidth="13" />
          <path d="M0 300 L1200 300" stroke="#9b8b68" strokeOpacity=".7" strokeWidth="2" strokeDasharray="10 12" />
          <text x="500" y="360" fill="#fff8df" fontSize="18" fontWeight="700">{property.holdingNumber}</text>
          <text x="500" y="383" fill="#fff8df" fontSize="13">Selected property</text>
        </svg>

        <div className="absolute left-4 top-4 rounded-lg border border-white/20 bg-slate-950/80 p-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
          <div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-blue-300" /> {landParcel?.officialBoundary ? "Cadastral parcels" : "Municipal preview"}</div>
          <div className="mt-2 flex items-center gap-2 text-slate-200"><span className="h-3 w-3 rounded-sm border border-amber-100 bg-amber-500" /> Your linked property</div>
          <div className="mt-1 text-slate-200">{loading ? "Checking authorised land record…" : landParcel?.mapSource || "Cadastral link pending"}</div>
        </div>
        <div className="absolute bottom-4 left-4 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-slate-800 shadow">50 m</div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button type="button" className="rounded-md bg-white/90 p-2 text-slate-700 shadow hover:bg-white" aria-label="Centre map"><Navigation className="h-4 w-4" /></button>
          <button type="button" className="rounded-md bg-white/90 p-2 text-slate-700 shadow hover:bg-white" aria-label="Expand map"><Maximize2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p>{loading ? "Checking the municipal-to-land-record link…" : landParcel?.disclaimer || "Boundary display is indicative and intended for property identification only."}</p>
        <p className="font-medium text-slate-700">{landParcel?.officialBoundary ? "Open the certified survey record for legal use." : "Authoritative survey records remain the legal reference."}</p>
      </div>
    </section>
  );
};

const MapDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-slate-200 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-5">
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    <p className="mt-1 truncate text-sm font-semibold text-slate-900" title={value}>{value}</p>
  </div>
);

const Amount = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-slate-50 px-3 py-2">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-semibold">{formatCurrency(value)}</p>
  </div>
);

export default MySMCAccount;
