import { useEffect, useMemo, useState } from 'react';
import { Loader, RefreshCw, Users, AlertCircle } from 'lucide-react';
import SquadManagement from '../components/tracking/SquadManagement';
import * as trackingService from '../services/trackingService';
import { Squad } from '../types';

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

const SquadManagementPage = () => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSquads = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await trackingService.getSquadsWithLiveData(100);
      setSquads(data);

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
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Members</span>
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
              />
            </div>
            {selectedSquad ? (
              <ul className="divide-y divide-gray-100 max-h-[540px] overflow-y-auto">
                {(selectedSquad.members || []).map((m) => {
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
                            m.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                          <p className="text-xs text-gray-500 truncate">{m.role}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-sm text-gray-500">Select a squad to manage members.</div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            {selectedMember ? (
              <>
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-900">{selectedMember.name}</h3>
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

export default SquadManagementPage;
