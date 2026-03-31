import api from './api';
import { config } from '../config/env';
import {
  Squad,
  Member,
  ActivityEvent,
  ActivityAttachment,
  CreateSquadInput,
  CreateMemberInput,
  UpdateMemberInput,
  UpdateMemberLocationInput,
  MemberStatus,
} from '../types';

// Helper to unwrap ApiResponse
const unwrapData = <T,>(response: any): T => {
  return response?.data?.data !== undefined ? response.data.data : response.data;
};

// Helper to handle array responses
const safeArray = <T,>(data: any): T[] => {
  return Array.isArray(data) ? data : [];
};

/**
 * Get dashboard data with optional squad ID and activity limit
 */
export const getDashboard = async (squadId?: string, activityLimit?: number): Promise<any> => {
  try {
    const params: Record<string, any> = {};
    if (squadId) params.squadId = squadId;
    if (activityLimit) params.activityLimit = activityLimit;

    const response = await api.get('/tracking/dashboard', { params });
    return unwrapData<any>(response);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};

/**
 * Create a new squad
 */
export const createSquad = async (input: CreateSquadInput): Promise<Squad> => {
  try {
    const response = await api.post('/tracking/squads', input);
    return normalizeSquad(unwrapData<any>(response));
  } catch (error) {
    console.error('Error creating squad:', error);
    throw error;
  }
};

const buildFileUrl = (path: string): string => {
  const base = config.fileBaseUrl.replace(/\/+$/, '');
  return `${base}/api/files/download/${path}`;
};

// ─── Attachment normalizer
const normalizeAttachment = (raw: any): ActivityAttachment => {
  // Backend stores tracking attachments as plain file path strings e.g. "tracking/activities/uuid.jpg"
  if (typeof raw === 'string') {
    const fileName = raw.split('/').pop() || raw;
    return {
      id: raw,
      url: buildFileUrl(raw),
      fileName,
      fileSize: undefined,
      mimeType: undefined,
      uploadedAt: undefined,
    };
  }
  const filePath = raw.filePath || raw.path;
  return {
    id: raw.id,
    activityId: raw.activityId,
    url: raw.url || (filePath ? buildFileUrl(filePath) : ''),
    fileName: raw.fileName || raw.filename || raw.name || 'attachment',
    fileSize: raw.fileSize || raw.size,
    mimeType: raw.mimeType || raw.contentType,
    uploadedAt: raw.uploadedAt || raw.createdAt,
  };
};

// ─── Activity normalizer
const normalizeActivity = (act: any): ActivityEvent => ({
  id: act.id,
  time: act.time || (act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()),
  memberId: act.memberId || act.member?.id || '',
  memberName: act.memberName || act.member?.name || 'Unknown',
  location: act.location || act.address || 'Unknown',
  status: (act.status || 'ACTIVE') as MemberStatus,
  address: act.location || act.address,
  notes: act.notes,
  type: act.type,
  latitude: act.latitude,
  longitude: act.longitude,
  accuracy: act.accuracy,
  timestamp: act.timestamp,
  attachments: Array.isArray(act.attachments)
    ? act.attachments.map(normalizeAttachment)
    : [],
});

/**
 * Delete squad
 */
export const deleteSquad = async (squadId: string): Promise<void> => {
  try {
    await api.delete(`/tracking/squads/${squadId}`);
  } catch (error) {
    console.error('Error deleting squad:', error);
    throw error;
  }
};

/**
 * Fetch a single activity (with attachments)
 */
export const getActivity = async (activityId: string): Promise<ActivityEvent> => {
  try {
    const response = await api.get(`/tracking/activities/${activityId}`);
    return normalizeActivity(unwrapData<any>(response));
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw error;
  }
};

/**
 * Upload files to an activity (multipart/form-data, field: files)
 */
export const uploadActivityAttachments = async (
  activityId: string,
  files: File[]
): Promise<ActivityAttachment[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post(
      `/tracking/activities/${activityId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    const data = unwrapData<any>(response);
    const rows = Array.isArray(data)
      ? data
      : data?.attachments || data?.items || [];
    return rows.map(normalizeAttachment);
  } catch (error) {
    console.error('Error uploading attachments:', error);
    throw error;
  }
};

/**
 * Get all members across all squads
 */
export const getAllMembers = async (): Promise<Member[]> => {
  try {
    const response = await api.get('/tracking/members');
    const data = unwrapData<any>(response);
    const rows = safeArray<any>(Array.isArray(data) ? data : data?.members || data?.items || []);
    return rows.map(normalizeMember);
  } catch (error) {
    console.error('Error fetching all members:', error);
    throw error;
  }
};

/**
 * Create a new member
 */
export const createMember = async (input: CreateMemberInput): Promise<Member> => {
  try {
    const response = await api.post('/tracking/members', input);
    return normalizeMember(unwrapData<any>(response));
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
};

/**
 * Update member details
 */
export const updateMember = async (
  memberId: string,
  input: UpdateMemberInput
): Promise<Member> => {
  try {
    const response = await api.put(`/tracking/members/${memberId}`, input);
    return normalizeMember(unwrapData<any>(response));
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

/**
 * Delete member
 */
export const deleteMember = async (memberId: string): Promise<void> => {
  try {
    await api.delete(`/tracking/members/${memberId}`);
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

/**
 * Update member location and status
 */
export const updateMemberLocation = async (
  memberId: string,
  input: UpdateMemberLocationInput
): Promise<Member> => {
  try {
    const response = await api.put(`/tracking/members/${memberId}/location`, input);
    return normalizeMember(unwrapData<any>(response));
  } catch (error) {
    console.error('Error updating member location:', error);
    throw error;
  }
};

/**
 * Get all squads
 */
export const getSquads = async (): Promise<Squad[]> => {
  try {
    const response = await api.get('/tracking/squads');
    const data = unwrapData<any>(response);
    const rows = safeArray<any>(Array.isArray(data) ? data : data?.squads || data?.items || []);
    return rows.map(normalizeSquad);
  } catch (error) {
    console.error('Error fetching squads:', error);
    throw error;
  }
};

/**
 * Get squad by ID with members
 */
export const getSquadById = async (squadId: string): Promise<Squad> => {
  try {
    const response = await api.get(`/tracking/squads/${squadId}`);
    return normalizeSquad(unwrapData<any>(response));
  } catch (error) {
    console.error('Error fetching squad:', error);
    throw error;
  }
};

/**
 * Get members of a squad
 */
export const getSquadMembers = async (squadId: string): Promise<Member[]> => {
  try {
    const response = await api.get(`/tracking/squads/${squadId}/members`);
    const data = unwrapData<any>(response);
    const rows = safeArray<any>(Array.isArray(data) ? data : data?.members || data?.items || []);
    return rows.map(normalizeMember);
  } catch (error) {
    console.error('Error fetching squad members:', error);
    throw error;
  }
};

/**
 * Get activities for a squad
 */
export const getSquadActivities = async (
  squadId: string,
  limit?: number
): Promise<ActivityEvent[]> => {
  try {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;

    const response = await api.get(`/tracking/squads/${squadId}/activities`, { params });
    const data = unwrapData<any>(response);
    const rows = safeArray<any>(Array.isArray(data) ? data : data?.activities || data?.items || []);
    return rows.map(normalizeActivity);
  } catch (error) {
    console.error('Error fetching squad activities:', error);
    throw error;
  }
};

/**
 * Get activities for a specific member
 */
export const getMemberActivities = async (
  squadId: string,
  memberId: string,
  limit?: number
): Promise<ActivityEvent[]> => {
  try {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;

    const response = await api.get(
      `/tracking/squads/${squadId}/members/${memberId}/activities`,
      { params }
    );
    const data = unwrapData<any>(response);
    const rows = safeArray<any>(Array.isArray(data) ? data : data?.activities || data?.items || []);
    return rows.map(normalizeActivity);
  } catch (error) {
    console.error('Error fetching member activities:', error);
    throw error;
  }
};

/**
 * Normalize member data from API response
 */
export const normalizeMember = (raw: any): Member => {
  const lastUpdate = raw.lastUpdate || raw.updatedAt || new Date().toLocaleTimeString();
  
  // Extract coordinates from various location formats
  let coordinates: [number, number] = [0, 0];
  if (raw.location?.coordinates && Array.isArray(raw.location.coordinates)) {
    // GeoJSON coordinates are [lng, lat], convert to Leaflet [lat, lng]
    coordinates = [raw.location.coordinates[1], raw.location.coordinates[0]];
  } else if (raw.location?.x !== undefined && raw.location?.y !== undefined) {
    // Backend point object uses x=lng, y=lat
    coordinates = [raw.location.y, raw.location.x];
  } else if (raw.coordinates && Array.isArray(raw.coordinates) && raw.coordinates.length >= 2) {
    // Existing app format already stored as [lat, lng]
    coordinates = [raw.coordinates[0], raw.coordinates[1]];
  } else if (raw.latitude && raw.longitude) {
    coordinates = [parseFloat(raw.latitude), parseFloat(raw.longitude)];
  }
  
  // Extract address from various location formats
  const addr = raw.address || raw.location?.address || (typeof raw.location === 'string' ? raw.location : 'Unknown');
  
  return {
    id: raw.id || raw.memberId,
    name: raw.name,
    role: raw.role || 'Worker',
    phone: raw.phone || raw.phoneNumber || '',
    status: (raw.status || 'ACTIVE') as MemberStatus,
    coordinates,
    location: addr,
    address: addr,
    lastUpdate: typeof lastUpdate === 'string' ? lastUpdate : new Date(lastUpdate).toLocaleTimeString(),
  };
};

/**
 * Normalize squad data from API response
 */
export const normalizeSquad = (raw: any): Squad => {
  // Handle nested squad structure from dashboard endpoint
  const squadData = raw.squad || raw;
  
  const members = raw.members
    ? Array.isArray(raw.members)
      ? raw.members.map(normalizeMember)
      : []
    : [];

  // Use latestActivities from dashboard, or activities from other endpoints
  const activityList = raw.latestActivities || raw.activities || [];
  const activities = activityList && Array.isArray(activityList)
      ? activityList.map(normalizeActivity)
      : [];

  return {
    id: squadData.id || raw.squadId,
    name: squadData.name,
    zone: squadData.zone || 'Unknown Zone',
    lead: squadData.lead || squadData.leadName || 'N/A',
    leadId: squadData.leadId,
    members,
    activities,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

/**
 * Normalize dashboard response
 */
export const normalizeDashboard = (raw: any): { squads: Squad[]; stats: any } => {
  const squads = raw.squads
    ? Array.isArray(raw.squads)
      ? raw.squads.map(normalizeSquad)
      : [normalizeSquad(raw.squads)]
    : [];

  return {
    squads,
    stats: raw.stats || {
      totalSquads: squads.length,
      totalMembers: squads.reduce((sum: number, s: Squad) => sum + (s.members?.length || 0), 0),
      activeMembers: squads.reduce(
        (sum: number, s: Squad) =>
          sum + (s.members?.filter((m: Member) => m.status === 'ACTIVE').length || 0),
        0
      ),
      recentActivities: squads.reduce(
        (sum: number, s: Squad) => sum + (s.activities?.length || 0),
        0
      ),
    },
  };
};

export const getSquadsWithLiveData = async (activityLimit = 100): Promise<Squad[]> => {
  const dashboardRaw = await getDashboard(undefined, activityLimit);
  const dashboard = normalizeDashboard(dashboardRaw || {});

  if (dashboard.squads.length > 0) {
    return dashboard.squads;
  }

  const baseSquads = await getSquads();
  const hydrated = await Promise.all(
    baseSquads.map(async (squad: Squad) => {
      const [members, activities] = await Promise.all([
        getSquadMembers(squad.id).catch(() => []),
        getSquadActivities(squad.id, activityLimit).catch(() => []),
      ]);
      return {
        ...squad,
        members,
        activities,
      };
    })
  );

  return hydrated;
};
