import {
  ArrowLeft,
  BadgeIndianRupee,
  Building2,
  Clock,
  FileText,
  Gavel,
  MapPin,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auctionService } from "../services/auctionService";
import { AuctionBid, AuctionListing } from "../types";

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusClass = (status: string) => {
  switch (status) {
    case "LIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PUBLISHED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "AWARDED":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    case "CLOSED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const minNextBid = (auction: AuctionListing) =>
  (auction.currentHighestBid || 0) > 0
    ? (auction.currentHighestBid || 0) + (auction.bidIncrement || 0)
    : auction.basePrice || 0;

const countdown = (endAt?: string) => {
  if (!endAt) return "No end time";
  const seconds = Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000));
  if (seconds <= 0) return "Closed";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h left`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m left`;
};

const AuctionListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [myBids, setMyBids] = useState<AuctionBid[]>([]);
  const [selected, setSelected] = useState<AuctionListing | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidderType, setBidderType] = useState("CITIZEN");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [auctionRows, bids] = await Promise.all([
        auctionService.list(),
        isAuthenticated ? auctionService.myBids().catch(() => []) : Promise.resolve([]),
      ]);
      setAuctions(auctionRows);
      setMyBids(bids);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load auctions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      auctions.filter((auction) => {
        const text = `${auction.title} ${auction.category} ${auction.locality} ${auction.resourceType}`.toLowerCase();
        return (
          (!query || text.includes(query.toLowerCase())) &&
          (!status || auction.status === status)
        );
      }),
    [auctions, query, status]
  );

  const openBid = (auction: AuctionListing) => {
    setSelected(auction);
    setBidAmount(String(minNextBid(auction)));
    setTermsAccepted(false);
    setSuccess("");
    setError("");
  };

  const submitBid = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      setError("");
      await auctionService.placeBid(selected.auctionId, {
        bidderType,
        businessName,
        gstNumber,
        tradeLicenseNumber,
        bidAmount: Number(bidAmount),
        termsAccepted,
      });
      setSuccess("Bid placed successfully");
      setSelected(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to place bid");
    } finally {
      setSubmitting(false);
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
              Revenue & Public Assets
            </p>
            <h1 className="text-lg font-bold sm:text-2xl">SMC Auction Service</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {(error || success) && (
          <div className={`mb-4 rounded-lg border p-3 text-sm font-semibold ${
            error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}>
            {error || success}
          </div>
        )}

        <section className="mb-5 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Public Auction Board
              </p>
              <h2 className="text-xl font-bold">Municipal assets, stalls, leases and resource rights</h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search auctions"
                  className="min-h-[42px] rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="min-h-[42px] rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All statuses</option>
                <option value="LIVE">Live</option>
                <option value="PUBLISHED">Upcoming</option>
                <option value="CLOSED">Closed</option>
                <option value="AWARDED">Awarded</option>
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading auctions...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <section className="grid gap-4">
              {filtered.map((auction) => (
                <article key={auction.auctionId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClass(auction.status)}`}>
                          {auction.status}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {auction.category?.replace(/_/g, " ") || "Auction"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold">{auction.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm text-slate-600">{auction.description}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{auction.locality || "Silchar"}</span>
                        <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{auction.resourceType}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{countdown(auction.endAt)}</span>
                      </div>
                    </div>
                    <div className="min-w-[220px] rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current Highest Bid</p>
                      <p className="text-2xl font-bold text-blue-800">{formatCurrency(auction.currentHighestBid)}</p>
                      <p className="mt-1 text-xs text-slate-500">Minimum next: {formatCurrency(minNextBid(auction))}</p>
                      <button
                        onClick={() => openBid(auction)}
                        disabled={auction.status !== "LIVE"}
                        className="mt-3 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        <Gavel className="h-4 w-4" />
                        {auction.status === "LIVE" ? "Place Bid" : "Bid Disabled"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-bold">My Bids</h2>
                <div className="mt-3 space-y-3">
                  {myBids.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                      Your bids will appear here after submission.
                    </p>
                  )}
                  {myBids.map((bid) => (
                    <div key={bid.bidId} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold">{bid.bidId}</p>
                      <p className="text-sm text-slate-500">{bid.auctionId}</p>
                      <p className="mt-2 text-lg font-bold text-blue-800">{formatCurrency(bid.bidAmount)}</p>
                      <span className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                        {bid.bidStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-0 sm:items-center sm:justify-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Place Bid
                </p>
                <h2 className="text-xl font-bold">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-md p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Amount label="Current Highest" value={selected.currentHighestBid || 0} />
              <Amount label="Minimum Next Bid" value={minNextBid(selected)} />
            </div>
            <div className="mt-4 space-y-3">
              <select
                value={bidderType}
                onChange={(event) => setBidderType(event.target.value)}
                className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm"
              >
                <option value="CITIZEN">Citizen</option>
                <option value="BUSINESS">Business</option>
                <option value="CONTRACTOR">Contractor</option>
              </select>
              {bidderType !== "CITIZEN" && (
                <>
                  <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Business / contractor name" className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm" />
                  <input value={gstNumber} onChange={(event) => setGstNumber(event.target.value)} placeholder="GST number" className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm" />
                  <input value={tradeLicenseNumber} onChange={(event) => setTradeLicenseNumber(event.target.value)} placeholder="Trade license number" className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm" />
                </>
              )}
              <input
                value={bidAmount}
                onChange={(event) => setBidAmount(event.target.value)}
                inputMode="numeric"
                placeholder="Bid amount"
                className="min-h-[44px] w-full rounded-md border border-slate-200 px-3 text-sm"
              />
              <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1" />
                I accept the auction terms and understand that bids are final and subject to SMC verification.
              </label>
              <button
                onClick={submitBid}
                disabled={submitting || !termsAccepted}
                className="sticky bottom-0 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-500"
              >
                <BadgeIndianRupee className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Bid"}
              </button>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <div className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
                <FileText className="h-4 w-4" />
                Terms
              </div>
              {selected.termsAndConditions || "SMC auction terms apply."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Amount = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-slate-50 px-3 py-2">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-semibold">{formatCurrency(value)}</p>
  </div>
);

export default AuctionListPage;
