import { useEffect, useMemo, useState } from 'react';
import {
  Loader,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  ShieldAlert,
  ShieldCheck,
  Search,
  UserPlus,
} from 'lucide-react';
import * as trackingService from '../../services/trackingService';
import {
  Member,
  MemberStatus,
  CreateSquadInput,
  CreateMemberInput,
  UpdateMemberInput,
  Squad,
} from '../../types';

type ToastType = 'success' | 'error' | 'info';

const STATUS_CONFIG: Record<MemberStatus, { label: string }> = {
  ACTIVE: { label: 'Active' },
  EN_ROUTE: { label: 'En Route' },
  COMPLETED: { label: 'Completed' },
  ON_DUTY: { label: 'On Duty' },
  BREAK: { label: 'On Break' },
};

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

const FormError = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

const Toast = ({ message, type }: { message: string; type: ToastType }) => {
  const colors = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
  };
  const Icon = icons[type];

  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg border shadow-sm flex items-center gap-2 ${colors[type]}`}>
      <Icon className="w-4 h-4" />
      {message}
    </div>
  );
};

const DeleteConfirmModal = ({
  open,
  memberName,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  memberName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md relative z-[1001]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Member</h3>
            <p className="text-sm text-gray-600 mt-1">
              This action will permanently remove <span className="font-medium">{memberName}</span> from the squad.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Delete Member
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteSquadConfirmModal = ({
  open,
  squadName,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  squadName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md relative z-[1001]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Squad</h3>
            <p className="text-sm text-gray-600 mt-1">
              This action will permanently remove <span className="font-medium">{squadName}</span>.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Delete Squad
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateSquadModal = ({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSquadInput) => Promise<void>;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState<CreateSquadInput>({ name: '', zone: '', lead: '' });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    const payload = {
      name: formData.name.trim(),
      zone: formData.zone.trim(),
      lead: formData.lead.trim(),
    };

    if (!payload.name || !payload.zone || !payload.lead) {
      setFormError('Please complete all required fields before creating a squad.');
      return;
    }

    try {
      setFormError(null);
      await onSubmit(payload);
      setFormData({ name: '', zone: '', lead: '' });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to create squad right now.'));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-[1001]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Squad</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close create squad">
            <X className="w-4 h-4" />
          </button>
        </div>

        <FormError message={formError} />

        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Squad Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Zone"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Lead Name"
            value={formData.lead}
            onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Create Independent Member Modal ─────────────────────────────────────────
// Creates a member without linking to any squad

const SupervisorToggle = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
    value ? 'border-amber-300 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
  }`}>
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 accent-amber-500"
    />
    <ShieldCheck className={`w-4 h-4 shrink-0 ${value ? 'text-amber-600' : 'text-gray-400'}`} />
    <div>
      <p className={`text-sm font-medium ${value ? 'text-amber-800' : 'text-gray-700'}`}>Squad Supervisor</p>
      <p className="text-xs text-gray-500">Can view squad attendance in the mobile app</p>
    </div>
  </label>
);

const CreateIndependentMemberModal = ({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMemberInput) => Promise<void>;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', isSupervisor: false });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({ name: '', role: '', phone: '', isSupervisor: false });
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      phone: formData.phone.trim(),
      admin: formData.isSupervisor,
    };

    if (!payload.name || !payload.role || !payload.phone) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (!/^\+?[0-9\s-]{8,15}$/.test(payload.phone)) {
      setFormError('Please enter a valid phone number (8 to 15 digits).');
      return;
    }

    try {
      setFormError(null);
      await onSubmit(payload);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to create member right now.'));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-[1001]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-semibold">New Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Creates a member without assigning to a squad. You can add them to a squad later.</p>

        <FormError message={formError} />

        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Member Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SupervisorToggle
            value={formData.isSupervisor}
            onChange={(v) => setFormData({ ...formData, isSupervisor: v })}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Create Member
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Member Modal ────────────────────────────────────────────────────────
// Two views: "existing" (pick from all members not already in squad) and "new" (create form)

type AddMemberView = 'existing' | 'new';

const AddMemberModal = ({
  open,
  onClose,
  onAddExisting,
  onCreateNew,
  loading,
  squadId,
  currentSquadMemberIds,
  allMembers,
  allSquads,
}: {
  open: boolean;
  onClose: () => void;
  onAddExisting: (memberId: string) => Promise<void>;
  onCreateNew: (data: CreateMemberInput) => Promise<void>;
  loading: boolean;
  squadId: string | null;
  currentSquadMemberIds: string[];
  allMembers: Member[];
  allSquads: Squad[];
}) => {
  const [view, setView] = useState<AddMemberView>('existing');
  const [search, setSearch] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', isSupervisor: false });
  const [formError, setFormError] = useState<string | null>(null);
  const [fetchedMembers, setFetchedMembers] = useState<Member[]>([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  useEffect(() => {
    if (open) {
      setView('existing');
      setSearch('');
      setSelectedMemberId(null);
      setFormData({ name: '', role: '', phone: '', isSupervisor: false });
      setFormError(null);
      setFetchingMembers(true);
      trackingService.getAllMembers()
        .then(setFetchedMembers)
        .catch(() => setFetchedMembers(allMembers))
        .finally(() => setFetchingMembers(false));
    }
  }, [open]);  // eslint-disable-line react-hooks/exhaustive-deps

  const availableMembers = useMemo(() => {
    const currentSquad = allSquads.find((s) => s.id === squadId);
    const excludeIds = new Set([
      ...(currentSquad?.members?.map((m) => m.id) || []),
      ...currentSquadMemberIds,
    ]);
    return fetchedMembers.filter((m) => !excludeIds.has(m.id));
  }, [fetchedMembers, allSquads, squadId, currentSquadMemberIds]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableMembers;
    return availableMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q)
    );
  }, [availableMembers, search]);

  const getSquadName = (member: Member) => {
    const squad = allSquads.find((s) => s.members?.some((sm) => sm.id === member.id));
    return squad?.name || 'Unassigned';
  };

  const handleAddExisting = async () => {
    if (!selectedMemberId) {
      setFormError('Please select a member to add.');
      return;
    }
    try {
      setFormError(null);
      await onAddExisting(selectedMemberId);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to add member right now.'));
    }
  };

  const handleCreateNew = async () => {
    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      phone: formData.phone.trim(),
      admin: formData.isSupervisor,
    };

    if (!payload.name || !payload.role || !payload.phone || !squadId) {
      setFormError('Please complete all required fields and choose a squad before adding a member.');
      return;
    }

    if (!/^\+?[0-9\s-]{8,15}$/.test(payload.phone)) {
      setFormError('Please enter a valid phone number (8 to 15 digits).');
      return;
    }

    try {
      setFormError(null);
      await onCreateNew({ ...payload, squadId });
      setFormData({ name: '', role: '', phone: '', isSupervisor: false });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to create member right now.'));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md relative z-[1001] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Add Member to Squad</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button
              onClick={() => { setView('existing'); setFormError(null); }}
              className={`flex-1 py-2 font-medium transition-colors ${
                view === 'existing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Existing Members
            </button>
            <button
              onClick={() => { setView('new'); setFormError(null); }}
              className={`flex-1 py-2 font-medium transition-colors ${
                view === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Create New
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-1 overflow-y-auto min-h-0">
          <FormError message={formError} />

          {view === 'existing' ? (
            <>
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, role, or phone…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedMemberId(null); }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {fetchingMembers ? (
                <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
                  <Loader className="w-4 h-4 animate-spin" /> Loading members…
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  {availableMembers.length === 0
                    ? 'No other members available. Create a new member instead.'
                    : 'No members match your search.'}
                </div>
              ) : (
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {filteredMembers.map((m) => {
                    const isSelected = m.id === selectedMemberId;
                    return (
                      <li key={m.id}>
                        <button
                          onClick={() => setSelectedMemberId(isSelected ? null : m.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border border-blue-300'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-semibold text-gray-600">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {m.role}
                              <span className="mx-1.5 text-gray-300">·</span>
                              {getSquadName(m)}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Member Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <SupervisorToggle
                value={formData.isSupervisor}
                onChange={(v) => setFormData({ ...formData, isSupervisor: v })}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 shrink-0 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          {view === 'existing' ? (
            <button
              onClick={handleAddExisting}
              disabled={loading || !selectedMemberId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <UserPlus className="w-4 h-4" />
              Add to Squad
            </button>
          ) : (
            <button
              onClick={handleCreateNew}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Create & Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EditMemberModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  member,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateMemberInput) => Promise<void>;
  loading: boolean;
  member: Member | null;
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    phone: string;
    status: MemberStatus;
    isSupervisor: boolean;
  }>({
    name: member?.name || '',
    role: member?.role || '',
    phone: member?.phone || '',
    status: member?.status || 'ACTIVE',
    isSupervisor: member?.isAdmin ?? false,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role,
        phone: member.phone,
        status: member.status,
        isSupervisor: member.isAdmin ?? false,
      });
      setFormError(null);
    }
  }, [member]);

  const handleSubmit = async () => {
    if (!member) return;

    const payload: UpdateMemberInput = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      phone: formData.phone.trim(),
      status: formData.status,
      admin: formData.isSupervisor,
    };

    if (!payload.name || !payload.role || !payload.phone) {
      setFormError('Please complete all required fields before updating this member.');
      return;
    }

    if (!/^\+?[0-9\s-]{8,15}$/.test(payload.phone)) {
      setFormError('Please enter a valid phone number (8 to 15 digits).');
      return;
    }

    try {
      setFormError(null);
      await onSubmit(payload);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to update this member right now.'));
    }
  };

  if (!open || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-[1001]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Member - {member.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close edit member">
            <X className="w-4 h-4" />
          </button>
        </div>

        <FormError message={formError} />

        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Member Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Object.keys(STATUS_CONFIG) as MemberStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
          <SupervisorToggle
            value={formData.isSupervisor}
            onChange={(v) => setFormData({ ...formData, isSupervisor: v })}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

interface SquadManagementProps {
  selectedSquadId: string | null;
  selectedSquadName?: string | null;
  selectedSquadMemberCount?: number;
  selectedMemberId: string | null;
  selectedMember: Member | null;
  onSquadDeleted?: () => void;
  onMemberDeleted: () => void;
  onDataChanged: () => Promise<void>;
  hideCreateSquad?: boolean;
  hideCreateMember?: boolean;
  hideMemberCrud?: boolean;
  allMembers?: Member[];
  allSquads?: Squad[];
  currentSquadMemberIds?: string[];
}

const SquadManagement = ({
  selectedSquadId,
  selectedSquadName = null,
  selectedSquadMemberCount = 0,
  selectedMemberId,
  selectedMember,
  onSquadDeleted,
  onMemberDeleted,
  onDataChanged,
  hideCreateSquad = false,
  hideCreateMember = false,
  hideMemberCrud = false,
  allMembers = [],
  allSquads = [],
  currentSquadMemberIds = [],
}: SquadManagementProps) => {
  const [createSquadOpen, setCreateSquadOpen] = useState(false);
  const [createIndependentMemberOpen, setCreateIndependentMemberOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSquadConfirmOpen, setDeleteSquadConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const hasMembersInSelectedSquad = selectedSquadMemberCount > 0;

  const anyActionVisible = useMemo(
    () => !hideCreateSquad || !hideCreateMember || !hideMemberCrud,
    [hideCreateSquad, hideCreateMember, hideMemberCrud]
  );

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateSquad = async (formData: CreateSquadInput) => {
    try {
      setSaving(true);
      await trackingService.createSquad(formData);
      showToast('Squad created successfully.', 'success');
      setCreateSquadOpen(false);
      await onDataChanged();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create squad.');
      showToast(message, 'error');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleAddExistingMember = async (memberId: string) => {
    if (!selectedSquadId) return;
    try {
      setSaving(true);
      await trackingService.updateMember(memberId, { squadId: selectedSquadId });
      showToast('Member added to squad successfully.', 'success');
      setAddMemberOpen(false);
      await onDataChanged();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to add member.');
      showToast(message, 'error');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMember = async (formData: CreateMemberInput) => {
    try {
      setSaving(true);
      await trackingService.createMember(formData);
      showToast('Member created and added to squad.', 'success');
      setAddMemberOpen(false);
      await onDataChanged();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create member.');
      showToast(message, 'error');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateIndependentMember = async (formData: CreateMemberInput) => {
    try {
      setSaving(true);
      await trackingService.createMember(formData);
      showToast('Member created successfully.', 'success');
      setCreateIndependentMemberOpen(false);
      await onDataChanged();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create member.');
      showToast(message, 'error');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleEditMember = async (formData: UpdateMemberInput) => {
    if (!selectedMemberId) return;
    try {
      setSaving(true);
      await trackingService.updateMember(selectedMemberId, formData);
      showToast('Member updated successfully.', 'success');
      setEditMemberOpen(false);
      await onDataChanged();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update member.');
      showToast(message, 'error');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMemberId || !selectedMember) return;

    try {
      setSaving(true);
      await trackingService.deleteMember(selectedMemberId);
      showToast('Member deleted successfully.', 'success');
      setDeleteConfirmOpen(false);
      onMemberDeleted();
      await onDataChanged();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete member.');
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSquad = async () => {
    if (!selectedSquadId) return;

    try {
      setSaving(true);
      await trackingService.deleteSquad(selectedSquadId);
      showToast('Squad deleted successfully.', 'success');
      setDeleteSquadConfirmOpen(false);
      onSquadDeleted?.();
      await onDataChanged();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete squad.');
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!anyActionVisible) {
    return null;
  }

  return (
    <>
      <div className="ml-auto flex gap-2 shrink-0">
        {!hideCreateSquad && (
          <>
            <button
              onClick={() => setCreateIndependentMemberOpen(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Member
            </button>
            <button
              onClick={() => setCreateSquadOpen(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Squad
            </button>
            <button
              onClick={() => {
                if (hasMembersInSelectedSquad) {
                  showToast(
                    'Cannot delete this squad while it still has members. Remove or reassign members first.',
                    'error'
                  );
                  return;
                }
                setDeleteSquadConfirmOpen(true);
              }}
              disabled={!selectedSquadId || saving}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Squad
            </button>
          </>
        )}

        {!hideCreateMember && (
          <button
            onClick={() => setAddMemberOpen(true)}
            disabled={!selectedSquadId}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Member
          </button>
        )}
      </div>

      {!hideMemberCrud && selectedMember && (
        <div className="w-full mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => setEditMemberOpen(true)}
            className="px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={saving}
            className="px-2 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}

      {!hideCreateSquad && (
        <>
          <CreateSquadModal
            open={createSquadOpen}
            onClose={() => setCreateSquadOpen(false)}
            onSubmit={handleCreateSquad}
            loading={saving}
          />
          <CreateIndependentMemberModal
            open={createIndependentMemberOpen}
            onClose={() => setCreateIndependentMemberOpen(false)}
            onSubmit={handleCreateIndependentMember}
            loading={saving}
          />
        </>
      )}

      {!hideCreateSquad && (
        <DeleteSquadConfirmModal
          open={deleteSquadConfirmOpen}
          squadName={selectedSquadName || 'this squad'}
          loading={saving}
          onCancel={() => setDeleteSquadConfirmOpen(false)}
          onConfirm={handleDeleteSquad}
        />
      )}

      {!hideCreateMember && (
        <AddMemberModal
          open={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          onAddExisting={handleAddExistingMember}
          onCreateNew={handleCreateMember}
          loading={saving}
          squadId={selectedSquadId}
          currentSquadMemberIds={currentSquadMemberIds}
          allMembers={allMembers}
          allSquads={allSquads}
        />
      )}

      {!hideMemberCrud && (
        <EditMemberModal
          open={editMemberOpen}
          onClose={() => setEditMemberOpen(false)}
          onSubmit={handleEditMember}
          loading={saving}
          member={selectedMember}
        />
      )}

      {!hideMemberCrud && selectedMember && (
        <DeleteConfirmModal
          open={deleteConfirmOpen}
          memberName={selectedMember.name}
          loading={saving}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteMember}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

export default SquadManagement;
