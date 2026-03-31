import { useState, useEffect, useMemo, useRef, ChangeEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RefreshCw,
  Users,
  Phone,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader,
  Image,
  Upload,
  X,
  Paperclip,
  ChevronRight,
} from 'lucide-react';
import * as trackingService from '../services/trackingService';
import { Squad, MemberStatus, ActivityEvent, ActivityAttachment } from '../types';

// ─── Fix Leaflet default icon paths broken by Vite bundler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Status badge config
const STATUS_CONFIG: Record<MemberStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  EN_ROUTE: { label: 'En Route', className: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completed', className: 'bg-gray-100 text-gray-600' },
  ON_DUTY: { label: 'On Duty', className: 'bg-purple-100 text-purple-700' },
  BREAK: { label: 'On Break', className: 'bg-amber-100 text-amber-700' },
};

const MARKER_COLORS: Record<MemberStatus, string> = {
  ACTIVE: '#10b981',
  EN_ROUTE: '#3b82f6',
  COMPLETED: '#9ca3af',
  ON_DUTY: '#a855f7',
  BREAK: '#f59e0b',
};

const makeMarkerIcon = (status: MemberStatus, selected: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:${selected ? 18 : 12}px;
      height:${selected ? 18 : 12}px;
      background:${MARKER_COLORS[status]};
      border:${selected ? '3px solid #1d4ed8' : '2px solid #fff'};
      border-radius:50%;
      box-shadow:0 1px 5px rgba(0,0,0,.4);
    "></div>`,
    iconSize: [selected ? 18 : 12, selected ? 18 : 12],
    iconAnchor: [selected ? 9 : 6, selected ? 9 : 6],
  });

// ─── Helper functions
const squadCenter = (squad: Squad): [number, number] => {
  const members = squad.members || [];
  if (members.length === 0) return [28.6139, 77.209]; // Default Delhi center
  const lats = members.map(m => m.coordinates[0]);
  const lngs = members.map(m => m.coordinates[1]);
  return [
    lats.reduce((a, b) => a + b, 0) / lats.length,
    lngs.reduce((a, b) => a + b, 0) / lngs.length,
  ];
};

const parseActivityTime = (t: string): number => {
  const parts = t.trim().split(' ');
  const [h, m] = parts[0].split(':').map(Number);
  const ampm = parts[1];
  let hours = h;
  if (ampm === 'PM' && h !== 12) hours += 12;
  if (ampm === 'AM' && h === 12) hours = 0;
  return hours * 60 + m;
};

const hhmm = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// ─── Map fly-to component
const MapFlyTo = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1 });
  }, [center, map]);
  return null;
};

// ─── Status badge
const StatusBadge = ({ status }: { status: MemberStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ─── Toast notification
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) => {
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
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg border flex items-center gap-2 ${colors[type]}`}>
      <Icon className="w-4 h-4" />
      {message}
    </div>
  );
};

// ─── Error extraction helper
const getErrorMessage = (error: unknown, fallback: string): string => {
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

// ─── Activity detail modal (fetches single activity with attachments + upload)
const ActivityDetailModal = ({
  activityId,
  onClose,
}: {
  activityId: string;
  onClose: () => void;
}) => {
  const [activity, setActivity] = useState<ActivityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trackingService.getActivity(activityId);
      setActivity(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load activity details.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activityId]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setUploading(true);
      setUploadError(null);
      await trackingService.uploadActivityAttachments(activityId, files);
      await load();
    } catch (err) {
      setUploadError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isImage = (att: ActivityAttachment) =>
    att.mimeType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(att.fileName);

  const attachments = activity?.attachments ?? [];

  return (
    <>
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[1100]"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Attachment"
            className="max-w-full max-h-full object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-1.5 hover:bg-opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900">Activity Detail</h3>
              {activity && (
                <p className="text-xs text-gray-500 truncate">
                  {activity.memberName} · {activity.time}
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1">{error}</div>
                <button
                  onClick={load}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {activity && !loading && (
              <>
                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-gray-500 mb-0.5">Member</p>
                    <p className="text-sm font-medium text-gray-900">{activity.memberName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <StatusBadge status={activity.status} />
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2.5 col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="text-sm text-gray-900">{activity.location}</p>
                  </div>
                  {activity.latitude != null && activity.longitude != null && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2.5 col-span-2">
                      <p className="text-xs text-gray-500 mb-0.5">Coordinates</p>
                      <p className="text-sm text-gray-900 font-mono">
                        {activity.latitude.toFixed(4)}°N, {activity.longitude.toFixed(4)}°E
                        {activity.accuracy != null && (
                          <span className="text-xs text-gray-400 ml-1">(±{Math.round(activity.accuracy)}m)</span>
                        )}
                      </p>
                    </div>
                  )}
                  {activity.notes && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2.5 col-span-2">
                      <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                      <p className="text-sm text-gray-900">{activity.notes}</p>
                    </div>
                  )}
                </div>

                {/* Attachments section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-blue-600" />
                      Photos &amp; Attachments
                      {attachments.length > 0 && (
                        <span className="text-xs text-gray-500">({attachments.length})</span>
                      )}
                    </h4>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,application/pdf,video/*"
                        onChange={handleUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {uploading
                          ? <Loader className="w-3.5 h-3.5 animate-spin" />
                          : <Upload className="w-3.5 h-3.5" />
                        }
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {uploadError}
                    </div>
                  )}

                  {attachments.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg py-10 text-center">
                      <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No attachments yet</p>
                      <p className="text-xs text-gray-300 mt-0.5">Click Upload to add photos or files</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {attachments.map((att) =>
                        isImage(att) ? (
                          <button
                            key={att.id}
                            onClick={() => setLightboxUrl(att.url)}
                            className="aspect-square rounded-lg border border-gray-200 overflow-hidden hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all"
                          >
                            <img
                              src={att.url}
                              alt={att.fileName}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1.5 p-3"
                          >
                            <Paperclip className="w-6 h-6 text-gray-400" />
                            <p className="text-xs text-gray-500 text-center truncate w-full">{att.fileName}</p>
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main component
const TrackingDashboard = () => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filter state
  const [timeFrom, setTimeFrom] = useState('08:00');
  const [timeTo, setTimeTo] = useState('17:00');
  const [applied, setApplied] = useState({ timeFrom: '08:00', timeTo: '17:00' });

  // Load squads on mount
  useEffect(() => {
    loadSquads();
  }, []);

  const loadSquads = async () => {
    try {
      setLoading(true);
      const data = await trackingService.getSquadsWithLiveData(150);
      setSquads(data);
      if (data.length > 0 && !selectedSquadId) {
        setSelectedSquadId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading squads:', error);
      showToast('Failed to load squads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSquads();
    showToast('Refreshed', 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const squad = selectedSquadId ? squads.find((s) => s.id === selectedSquadId) : null;
  const center: [number, number] = squad ? squadCenter(squad) : [28.6139, 77.209];
  const selectedMember = selectedMemberId && squad
    ? squad.members?.find((m) => m.id === selectedMemberId) || null
    : null;

  const statCounts = useMemo(
    () =>
      squad?.members
        ? {
            active: squad.members.filter((m) => m.status === 'ACTIVE').length,
            enRoute: squad.members.filter((m) => m.status === 'EN_ROUTE').length,
            completed: squad.members.filter((m) => m.status === 'COMPLETED').length,
            onBreak: squad.members.filter((m) => m.status === 'BREAK').length,
          }
        : { active: 0, enRoute: 0, completed: 0, onBreak: 0 },
    [squad]
  );

  const visibleActivities = useMemo(() => {
    if (!squad?.activities) return [];
    const fromMins = hhmm(applied.timeFrom);
    const toMins = hhmm(applied.timeTo);

    return squad.activities.filter((ev) => {
      const inTimeWindow = parseActivityTime(ev.time) >= fromMins && parseActivityTime(ev.time) <= toMins;
      const inMember = selectedMemberId ? ev.memberId === selectedMemberId : true;
      return inTimeWindow && inMember;
    });
  }, [squad, selectedMemberId, applied]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading squads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center gap-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mr-4 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Squad Tracking</h2>
            <p className="text-xs text-gray-400 leading-tight">Live field positions</p>
          </div>
        </div>

        <div className="h-5 w-px bg-gray-200 shrink-0" />

        {/* Squad selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Squad</label>
          <select
            value={selectedSquadId || ''}
            onChange={(e) => {
              setSelectedSquadId(e.target.value);
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

        <div className="h-5 w-px bg-gray-200 shrink-0" />

        {/* Time filter */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Time</label>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-xs">
            <input
              type="time"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700"
            />
            <span className="text-gray-400">–</span>
            <input
              type="time"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setApplied({ timeFrom, timeTo });
            setSelectedMemberId(null);
          }}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          Apply
        </button>

        <div className="ml-auto flex gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Stat chips */}
        {squad && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Active',
                value: statCounts.active,
                color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
              },
              {
                label: 'En Route',
                value: statCounts.enRoute,
                color: 'text-blue-700 bg-blue-50 border-blue-100',
              },
              {
                label: 'Completed',
                value: statCounts.completed,
                color: 'text-gray-600 bg-gray-50 border-gray-200',
              },
              {
                label: 'On Break',
                value: statCounts.onBreak,
                color: 'text-amber-700 bg-amber-50 border-amber-100',
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium ${c.color}`}
              >
                <span>{c.label}</span>
                <span className="text-xl font-bold">{c.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main grid: Squad list | Map */}
        {squad ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Squad list / Members */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Members</span>
              </div>
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {(squad.members || []).map((m) => {
                  const isSel = m.id === selectedMemberId;
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => setSelectedMemberId(isSel ? null : m.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          isSel
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
                        <StatusBadge status={m.status} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {selectedMember && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>{selectedMember.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span className="truncate">{selectedMember.location}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Live Map — {squad.name}</span>
                <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
                  {(Object.keys(MARKER_COLORS) as MemberStatus[]).map((s) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: MARKER_COLORS[s] }}
                      />
                      {STATUS_CONFIG[s].label}
                    </span>
                  ))}
                </div>
              </div>
              <MapContainer center={center} zoom={14} style={{ height: '400px', width: '100%' }} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapFlyTo center={center} />
                {(squad.members || []).map((m) => {
                  const isMemberSel = m.id === selectedMemberId;
                  return (
                    <Marker
                      key={m.id}
                      position={m.coordinates}
                      icon={makeMarkerIcon(m.status, isMemberSel)}
                      eventHandlers={{
                        click: () => setSelectedMemberId(isMemberSel ? null : m.id),
                      }}
                    >
                      <Popup>
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">{m.name}</p>
                          <p>{m.role}</p>
                          <p>{m.location}</p>
                          <StatusBadge status={m.status} />
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">No squads available.</p>
          </div>
        )}

        {/* Activity log */}
        {squad && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Activity Log</span>
              <span className="ml-auto text-xs text-gray-500">{visibleActivities.length} events</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {visibleActivities.length > 0 ? (
                visibleActivities.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    onClick={() => { if (ev.id) setSelectedActivityId(ev.id); }}
                    className={`px-4 py-3 text-xs flex items-start gap-3 transition-colors ${
                      ev.id ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-400 font-medium shrink-0 w-12 pt-0.5">{ev.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{ev.memberName}</p>
                      <p className="text-gray-500 truncate">{ev.location}</p>
                      {ev.description && (
                        <p className="text-gray-400 mt-0.5 truncate">{ev.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(ev.attachments?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-blue-500 font-medium">
                          <Image className="w-3 h-3" />
                          <span>{ev.attachments!.length}</span>
                        </span>
                      )}
                      <StatusBadge status={ev.status} />
                      {ev.id && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500">No activities in this time range</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Activity detail modal */}
      {selectedActivityId && (
        <ActivityDetailModal
          activityId={selectedActivityId}
          onClose={() => setSelectedActivityId(null)}
        />
      )}
    </div>
  );
};

export default TrackingDashboard;