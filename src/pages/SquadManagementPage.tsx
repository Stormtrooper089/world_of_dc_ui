import { ElementType, useEffect, useMemo, useState } from 'react';
import { Loader, RefreshCw, Users, AlertCircle, ShieldCheck, Search, UserCheck, MapPin } from 'lucide-react';
import SquadManagement from '../components/tracking/SquadManagement';
import * as trackingService from '../services/trackingService';
import { Member, MemberStatus, Squad } from '../types';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxios = error as {
    response?: { data?: { message?: string; error?: string } };
    message?: string;
  };

  return (
    maybeAxios?.response?.data?.message ||
    maybeAxios?.response?.data?.error ||
    maybeAxios?.message ||
    fallback
  );
};

const statusLabels: Record<MemberStatus, string> = {
  ACTIVE: 'Active',
  EN_ROUTE: 'En Route',
  COMPLETED: 'Completed',
  ON_DUTY: 'On Duty',
  BREAK: 'On Break',
};

const statusTone: Record<MemberStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EN_ROUTE: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  ON_DUTY: 'bg-purple-100 text-purple-700',
  BREAK: 'bg-amber-100 text-amber-700',
};

const getMinutesSince = (value?: string) => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : Math.max(0, Math.floor((Date.now() - ms) / 60000));
};

const isStaleMember = (value?: string) => {
  const minutes = getMinutesSince(value);
  return minutes === null || minutes >= 30;
};

const SquadManagementPage = () => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [memberDirectory, setMemberDirectory] = useState<Member[]>([]);
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | ''>('');

  const loadSquads = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [data, members] = await Promise.all([
        trackingService.getSquadsWithLiveData(100),
        trackingService.getAllMembers().catch(() => []),
      ]);
      setSquads(data);
      setMemberDirectory(members);

      if (data.length === 0) {
        setSelectedSquadId(null);
        setSelectedMemberId(null);
      } else {
        const hasValidSquadSelection = !!selectedSquadId && data.some((s) => s.id === selectedSquadId);
        const resolvedSquadId = hasValidSquadSelection ? selectedSquadId : data[0].id;

        if (selectedSquadId !== resolvedSquadId) {
          setSelectedSquadId(resolvedSquadId);
          setSelectedMemberId(null);
        }

        if (selectedMemberId) {
          const selectedSquad = data.find((s) => s.id === resolvedSquadId);
          const hasValidMemberSelection =
            !!selectedSquad?.members?.some((m) => m.id === selectedMemberId);

          if (!hasValidMemberSelection) {
            setSelectedMemberId(null);
          }
        }
      }
    } catch (error) {
      console.error('Error loading squads for management:', error);
      setLoadError(getErrorMessage(error, 'Unable to load squad data. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSquads();
  }, []);

  const selectedSquad = useMemo(
    () => (selectedSquadId ? squads.find((s) => s.id === selectedSquadId) || null : null),
    [squads, selectedSquadId]
  );

  const selectedMember = useMemo(
    () =>
      selectedMemberId && selectedSquad
        ? selectedSquad.members?.find((m) => m.id === selectedMemberId) || null
        : null,
    [selectedMemberId, selectedSquad]
  );

  const allMembers = useMemo(() => {
    const map = new Map<string, Member>();
    squads.flatMap((s) => s.members || []).forEach((member) => map.set(member.id, member));
    memberDirectory.forEach((member) => map.set(member.id, member));
    return Array.from(map.values());
  }, [memberDirectory, squads]);

  const currentSquadMemberIds = useMemo(
    () => selectedSquad?.members?.map((m) => m.id) || [],
    [selectedSquad]
  );

  const summary = useMemo(() => {
    const assignedIds = new Set(squads.flatMap((s) => (s.members || []).map((m) => m.id)));
    return {
      squads: squads.length,
      members: allMembers.length,
      supervisors: allMembers.filter((m) => m.isAdmin).length,
      stale: allMembers.filter((m) => isStaleMember(m.lastUpdate)).length,
      unassigned: allMembers.filter((m) => !assignedIds.has(m.id)).length,
    };
  }, [allMembers, squads]);

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    return (selectedSquad?.members || []).filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.phone.includes(query);
      const matchesStatus = !statusFilter || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [memberSearch, selectedSquad, statusFilter]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading squad management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 h-full overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center gap-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mr-4 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Squad Management</h2>
            <p className="text-xs text-gray-400 leading-tight">Create and manage squads and members</p>
          </div>
        </div>

        <div className="h-5 w-px bg-gray-200 shrink-0" />

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Squad</label>
          <select
            value={selectedSquadId || ''}
            onChange={(e) => {
              setSelectedSquadId(e.target.value || null);
              setSelectedMemberId(null);
            }}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Squad</option>
            {squads.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadSquads}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>

        <SquadManagement
          selectedSquadId={selectedSquadId}
          selectedSquadName={selectedSquad?.name || null}
          selectedSquadMemberCount={selectedSquad?.members?.length || 0}
          selectedMemberId={selectedMemberId}
          selectedMember={selectedMember}
          onSquadDeleted={() => {
            setSelectedSquadId(null);
            setSelectedMemberId(null);
          }}
          onMemberDeleted={() => setSelectedMemberId(null)}
          onDataChanged={loadSquads}
          hideCreateMember
          hideMemberCrud
        />
      </div>

      <div className="p-5 space-y-5">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Squads" value={summary.squads} icon={Users} tone="blue" />
          <SummaryCard label="Members" value={summary.members} icon={UserCheck} tone="slate" />
          <SummaryCard label="Supervisors" value={summary.supervisors} icon={ShieldCheck} tone="amber" />
          <SummaryCard label="Stale GPS" value={summary.stale} icon={AlertCircle} tone={summary.stale ? 'red' : 'slate'} />
          <SummaryCard label="Unassigned" value={summary.unassigned} icon={MapPin} tone={summary.unassigned ? 'red' : 'slate'} />
        </section>

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Unable to load squad information</p>
              <p>{loadError}</p>
            </div>
            <button
              onClick={loadSquads}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Members</span>
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  {filteredMembers.length}
                </span>
              </div>
              <div className="grid gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="Search name, role or phone"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as MemberStatus | '')}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All statuses</option>
                  {(Object.keys(statusLabels) as MemberStatus[]).map((status) => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </div>
              <SquadManagement
                selectedSquadId={selectedSquadId}
                selectedSquadName={selectedSquad?.name || null}
                selectedSquadMemberCount={selectedSquad?.members?.length || 0}
                selectedMemberId={selectedMemberId}
                selectedMember={selectedMember}
                onMemberDeleted={() => setSelectedMemberId(null)}
                onDataChanged={loadSquads}
                hideCreateSquad
                hideMemberCrud
                allMembers={allMembers}
                allSquads={squads}
                currentSquadMemberIds={currentSquadMemberIds}
              />
            </div>
            {selectedSquad ? (
              <ul className="divide-y divide-gray-100 max-h-[540px] overflow-y-auto">
                {filteredMembers.map((m) => {
                  const isSelected = m.id === selectedMemberId;
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => setSelectedMemberId(isSelected ? null : m.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-l-2 border-blue-600'
                            : 'hover:bg-gray-50 border-l-2 border-transparent'
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isStaleMember(m.lastUpdate) ? 'bg-red-500' : m.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                            {m.isAdmin && (
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Squad Supervisor" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{m.role}</p>
                          <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusTone[m.status]}`}>
                            {statusLabels[m.status]}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-sm text-gray-500">Select a squad to manage members.</div>
            )}
            {selectedSquad && filteredMembers.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No members match the current search or status filter.</div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            {selectedMember ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-semibold text-gray-900">{selectedMember.name}</h3>
                    {selectedMember.isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        <ShieldCheck className="w-3 h-3" /> Supervisor
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{selectedMember.role}</p>
                  <p className="text-sm text-gray-500">{selectedMember.phone}</p>
                  <p className="text-sm text-gray-500">{selectedMember.location}</p>
                </div>

                <SquadManagement
                  selectedSquadId={selectedSquadId}
                  selectedSquadName={selectedSquad?.name || null}
                  selectedMemberId={selectedMemberId}
                  selectedMember={selectedMember}
                  onMemberDeleted={() => setSelectedMemberId(null)}
                  onDataChanged={loadSquads}
                  hideCreateSquad
                  hideCreateMember
                />
              </>
            ) : (
              <p className="text-sm text-gray-500">Select a member to edit or delete.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ElementType;
  tone: 'blue' | 'amber' | 'red' | 'slate';
}) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-50 text-slate-700',
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default SquadManagementPage;
