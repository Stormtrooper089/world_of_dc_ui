import {
  BadgeIndianRupee,
  CalendarClock,
  CheckCircle2,
  FilePlus2,
  Gavel,
  RefreshCw,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { auctionService, AuctionListingPayload } from "../services/auctionService";
import { AuctionBid, AuctionDashboard as AuctionDashboardData, AuctionListing } from "../types";

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const blankForm = (): AuctionListingPayload => ({
  title: "",
  description: "",
  category: "MARKET_STALL",
  resourceType: "",
  department: "Revenue Department",
  wardNumber: undefined,
  wardName: "",
  zone: "",
  locality: "",
  address: "",
  basePrice: 0,
  reservePrice: 0,
  bidIncrement: 1000,
  emdAmount: 0,
  startAt: "",
  endAt: "",
  inspectionAt: "",
  eligibilityCriteria: "",
  termsAndConditions: "",
});

const AuctionDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<AuctionDashboardData | null>(null);
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [selected, setSelected] = useState<{ auction: AuctionListing; bids: AuctionBid[] } | null>(null);
  const [form, setForm] = useState<AuctionListingPayload>(blankForm());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [summary, rows] = await Promise.all([
        auctionService.officerDashboard(),
        auctionService.officerAuctions(),
      ]);
      setDashboard(summary);
      setAuctions(rows);
      if (rows.length > 0 && !selected) {
        const detail = await auctionService.officerDetail(rows[0].auctionId);
        setSelected({ auction: detail.auction, bids: detail.bids });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load auction dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectAuction = async (auction: AuctionListing) => {
    const detail = await auctionService.officerDetail(auction.auctionId);
    setSelected({ auction: detail.auction, bids: detail.bids });
  };

  const submitCreate = async () => {
    try {
      setActionLoading("create");
      setError("");
      const payload = normalizeForm(form);
      await auctionService.create(payload);
      setSuccess("Auction draft created");
      setForm(blankForm());
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to create auction");
    } finally {
      setActionLoading("");
    }
  };

  const publish = async (auction: AuctionListing) => {
    try {
      setActionLoading(`publish-${auction.auctionId}`);
      await auctionService.publish(auction.auctionId);
      setSuccess("Auction published");
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to publish auction");
    } finally {
      setActionLoading("");
    }
  };

  const award = async (auction: AuctionListing, bidId?: string) => {
    try {
      setActionLoading(`award-${auction.auctionId}`);
      await auctionService.award(auction.auctionId, bidId);
      setSuccess("Auction awarded");
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to award auction");
    } finally {
      setActionLoading("");
    }
  };

  const cancel = async (auction: AuctionListing) => {
    const reason = window.prompt("Reason for cancelling this auction");
    if (!reason) return;
    try {
      setActionLoading(`cancel-${auction.auctionId}`);
      await auctionService.cancel(auction.auctionId, reason);
      setSuccess("Auction cancelled");
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to cancel auction");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="h-full overflow-auto bg-slate-50 p-4 text-slate-950 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Revenue & Public Assets
          </p>
          <h1 className="text-2xl font-bold">SMC Auction Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create listings, monitor bids and award municipal resource auctions.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">
            <FilePlus2 className="h-4 w-4" />
            New Auction
          </button>
          <button onClick={load} className="inline-flex min-h-[42px] items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={`mb-4 rounded-lg border p-3 text-sm font-semibold ${
          error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}>
          {error || success}
        </div>
      )}

      {showForm && (
        <section className="mb-5 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold">Create Auction Draft</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <Input label="Resource Type" value={form.resourceType || ""} onChange={(value) => setForm({ ...form, resourceType: value })} />
            <Select label="Category" value={form.category || ""} onChange={(value) => setForm({ ...form, category: value })} options={["PARKING", "MARKET_STALL", "ADVERTISEMENT", "SCRAP", "LEASE", "CONTRACT"]} />
            <Input label="Base Price" type="number" value={String(form.basePrice || "")} onChange={(value) => setForm({ ...form, basePrice: Number(value) })} />
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              <p className="text-xs font-semibold uppercase tracking-[0.1em]">Bid Step Rule</p>
              <p className="mt-1 font-semibold">Minimum next bid is auto-calculated as 1% above the current highest bid.</p>
            </div>
            <Input label="EMD Amount" type="number" value={String(form.emdAmount || "")} onChange={(value) => setForm({ ...form, emdAmount: Number(value) })} />
            <Input label="Ward Number" type="number" value={String(form.wardNumber || "")} onChange={(value) => setForm({ ...form, wardNumber: value ? Number(value) : undefined })} />
            <Input label="Locality" value={form.locality || ""} onChange={(value) => setForm({ ...form, locality: value })} />
            <Input label="Start Time" type="datetime-local" value={form.startAt || ""} onChange={(value) => setForm({ ...form, startAt: value })} />
            <Input label="End Time" type="datetime-local" value={form.endAt || ""} onChange={(value) => setForm({ ...form, endAt: value })} />
            <TextArea label="Description" value={form.description || ""} onChange={(value) => setForm({ ...form, description: value })} />
            <TextArea label="Terms" value={form.termsAndConditions || ""} onChange={(value) => setForm({ ...form, termsAndConditions: value })} />
          </div>
          <button onClick={submitCreate} disabled={actionLoading === "create"} className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {actionLoading === "create" ? "Creating..." : "Create Draft"}
          </button>
        </section>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading auctions...
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Metric icon={Gavel} label="Total" value={dashboard?.totalAuctions || 0} />
            <Metric icon={CalendarClock} label="Live" value={dashboard?.liveAuctions || 0} />
            <Metric icon={CheckCircle2} label="Awarded" value={dashboard?.awardedAuctions || 0} />
            <Metric icon={XCircle} label="Cancelled" value={dashboard?.cancelledAuctions || 0} />
            <Metric icon={BadgeIndianRupee} label="Bid Value" value={formatCurrency(dashboard?.totalBidValue)} />
            <Metric icon={CalendarClock} label="Pending Award" value={dashboard?.pendingAwardAuctions?.length || 0} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">Auction Listings</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="py-3 pr-4">Auction</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Base</th>
                      <th className="py-3 pr-4">Highest</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctions.map((auction) => (
                      <tr key={auction.auctionId} className="border-b border-slate-100">
                        <td className="py-3 pr-4">
                          <button onClick={() => selectAuction(auction)} className="text-left font-semibold text-blue-800 hover:underline">
                            {auction.title}
                          </button>
                          <p className="text-xs text-slate-500">{auction.auctionId} · {auction.locality}</p>
                        </td>
                        <td className="py-3 pr-4">{auction.status}</td>
                        <td className="py-3 pr-4">{formatCurrency(auction.basePrice)}</td>
                        <td className="py-3 pr-4">{formatCurrency(auction.currentHighestBid)}</td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-2">
                            {auction.status === "DRAFT" && (
                              <button onClick={() => publish(auction)} className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">Publish</button>
                            )}
                            {["CLOSED", "LIVE"].includes(auction.status) && (
                              <button onClick={() => award(auction, auction.currentHighestBidId)} className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Award</button>
                            )}
                            {!["CANCELLED", "AWARDED"].includes(auction.status) && (
                              <button onClick={() => cancel(auction)} className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700">Cancel</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">Bid Management</h2>
              {!selected ? (
                <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  Select an auction to view bids.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold">{selected.auction.title}</p>
                    <p className="text-sm text-slate-500">{selected.auction.auctionId}</p>
                  </div>
                  {selected.bids.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                      No bids received.
                    </p>
                  )}
                  {selected.bids.map((bid) => (
                    <div key={bid.bidId} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{bid.bidderName || "Bidder"}</p>
                          <p className="text-xs text-slate-500">{bid.bidId} · {bid.smcCitizenId}</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{bid.bidStatus}</span>
                      </div>
                      <p className="mt-2 text-lg font-bold text-blue-800">{formatCurrency(bid.bidAmount)}</p>
                      <button onClick={() => award(selected.auction, bid.bidId)} className="mt-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                        Award This Bid
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </section>
        </div>
      )}
    </div>
  );
};

const normalizeForm = (form: AuctionListingPayload): AuctionListingPayload => ({
  ...form,
  startAt: form.startAt ? new Date(form.startAt).toISOString().slice(0, 19) : undefined,
  endAt: form.endAt ? new Date(form.endAt).toISOString().slice(0, 19) : undefined,
  inspectionAt: form.inspectionAt ? new Date(form.inspectionAt).toISOString().slice(0, 19) : undefined,
});

const Metric = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <Icon className="h-5 w-5 text-blue-700" />
    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const Input = ({ label, value, onChange, type = "text" }: any) => (
  <label className="block">
    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-[42px] w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" />
  </label>
);

const Select = ({ label, value, onChange, options }: any) => (
  <label className="block">
    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-[42px] w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500">
      {options.map((option: string) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}
    </select>
  </label>
);

const TextArea = ({ label, value, onChange }: any) => (
  <label className="block lg:col-span-3">
    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</span>
    <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
  </label>
);

export default AuctionDashboard;
