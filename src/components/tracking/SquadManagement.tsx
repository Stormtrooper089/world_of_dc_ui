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
} from 'lucide-react';
import * as trackingService from '../../services/trackingService';
import {
  Member,
  MemberStatus,
  CreateSquadInput,
  CreateMemberInput,
  UpdateMemberInput,
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

const CreateMemberModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  squadId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMemberInput) => Promise<void>;
  loading: boolean;
  squadId: string | null;
}) => {
  const [formData, setFormData] = useState({ name: '', role: '', phone: '' });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      phone: formData.phone.trim(),
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
      await onSubmit({ ...payload, squadId });
      setFormData({ name: '', role: '', phone: '' });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to add member right now.'));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-[1001]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold mb-4">Add Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close add member">
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
            Add Member
          </button>
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
  }>({
    name: member?.name || '',
    role: member?.role || '',
    phone: member?.phone || '',
    status: member?.status || 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role,
        phone: member.phone,
        status: member.status,
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
}: SquadManagementProps) => {
  const [createSquadOpen, setCreateSquadOpen] = useState(false);
  const [createMemberOpen, setCreateMemberOpen] = useState(false);
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

  const handleCreateMember = async (formData: CreateMemberInput) => {
    try {
      setSaving(true);
      await trackingService.createMember(formData);
      showToast('Member added successfully.', 'success');
      setCreateMemberOpen(false);
      await onDataChanged();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to add member.');
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
            onClick={() => setCreateMemberOpen(true)}
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
        <CreateSquadModal
          open={createSquadOpen}
          onClose={() => setCreateSquadOpen(false)}
          onSubmit={handleCreateSquad}
          loading={saving}
        />
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
        <CreateMemberModal
          open={createMemberOpen}
          onClose={() => setCreateMemberOpen(false)}
          onSubmit={handleCreateMember}
          loading={saving}
          squadId={selectedSquadId}
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
