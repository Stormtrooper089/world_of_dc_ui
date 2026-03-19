import React, { useState } from "react";
import { Filter, MapPin, Phone, Search, Users } from "lucide-react";
import {
  electionsService,
  MAX_MEMBER_RESULTS,
  TeamMember,
} from "../../services/electionsService";

const TeamDirectory: React.FC = () => {
  const [stationQuery, setStationQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (
      !stationQuery.trim() &&
      !nameQuery.trim() &&
      !phoneQuery.trim() &&
      !teamFilter.trim()
    ) {
      setError("Enter at least one search field or filter before searching.");
      setSearched(false);
      setMembers([]);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const results = await electionsService.searchTeamMembers({
        station: stationQuery.trim() || undefined,
        name: nameQuery.trim() || undefined,
        phoneNumber: phoneQuery.trim() || undefined,
        team: teamFilter.trim() || undefined,
        limit: MAX_MEMBER_RESULTS,
      });
      setMembers(results.slice(0, MAX_MEMBER_RESULTS));
      setSearched(true);
    } catch (searchError: any) {
      setMembers([]);
      setSearched(true);
      setError(
        searchError?.response?.data?.message ||
          "Unable to fetch team members right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
            Team Directory
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            Find Team Members
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Search members by polling station, name, or phone number.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={stationQuery}
            onChange={(event) => setStationQuery(event.target.value)}
            placeholder="Search station"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="relative block">
          <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={nameQuery}
            onChange={(event) => setNameQuery(event.target.value)}
            placeholder="Search member name"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="relative block">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={phoneQuery}
            onChange={(event) => setPhoneQuery(event.target.value)}
            placeholder="Search phone number"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filters
        </div>

        <input
          type="text"
          value={teamFilter}
          onChange={(event) => setTeamFilter(event.target.value)}
          placeholder="Filter by team"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search Members"}
        </button>

        <button
          type="button"
          onClick={() => {
            setStationQuery("");
            setNameQuery("");
            setPhoneQuery("");
            setTeamFilter("");
            setMembers([]);
            setSearched(false);
            setError("");
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!searched ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Search to view member information.
        </div>
      ) : members.length === 0 ? (
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          No members found for your search.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.slice(0, MAX_MEMBER_RESULTS).map((member) => (
            <article
              key={member.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Member Information
              </p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {member.name}
              </h3>

              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-900">Team:</span>{" "}
                  {member.team}
                </p>
                <p className="inline-flex items-center">
                  <MapPin className="mr-1.5 h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Station:</span>
                  <span className="ml-1">{member.station}</span>
                </p>
                <p className="inline-flex items-center">
                  <Phone className="mr-1.5 h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Phone:</span>
                  <span className="ml-1">{member.phoneNumber}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default TeamDirectory;
