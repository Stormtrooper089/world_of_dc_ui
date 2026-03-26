import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Download, RefreshCw, Users, Phone, MapPin, Activity } from 'lucide-react';

// ─── Fix Leaflet default icon paths broken by Vite bundler ────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Types (mirrors API response shape — swap mock with real fetch) ────────────
type MemberStatus = 'ACTIVE' | 'EN_ROUTE' | 'COMPLETED' | 'BREAK';

interface Member {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: MemberStatus;
  coordinates: [number, number]; // [lat, lng]
  location: string;
  lastUpdate: string;
}

interface ActivityEvent {
  time: string;
  memberId: string;
  memberName: string;
  location: string;
  status: MemberStatus;
}

interface Squad {
  id: string;
  name: string;
  zone: string;
  lead: string;
  members: Member[];
  activities: ActivityEvent[];
}

// ─── Status badge config — matches ComplaintTracker badge pattern ──────────────
const STATUS_CONFIG: Record<MemberStatus, { label: string; className: string }> = {
  ACTIVE:    { label: 'Active',    className: 'bg-emerald-100 text-emerald-700' },
  EN_ROUTE:  { label: 'En Route',  className: 'bg-blue-100 text-blue-700'       },
  COMPLETED: { label: 'Completed', className: 'bg-gray-100 text-gray-600'       },
  BREAK:     { label: 'On Break',  className: 'bg-amber-100 text-amber-700'     },
};

const MARKER_COLORS: Record<MemberStatus, string> = {
  ACTIVE:    '#10b981',
  EN_ROUTE:  '#3b82f6',
  COMPLETED: '#9ca3af',
  BREAK:     '#f59e0b',
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
    iconSize:   [selected ? 18 : 12, selected ? 18 : 12],
    iconAnchor: [selected ? 9  :  6, selected ? 9  :  6],
  });

// ─── Mock Data — 5 squads × 8 members each ────────────────────────────────────
// To use real API: fetch from /api/tracking/live/:squadId and map to Squad[]
const MOCK_SQUADS: Squad[] = [
  {
    id: '1', name: 'Alpha Squad', zone: 'Sector 4 – North', lead: 'Rajesh Patil',
    members: [
      { id:'a1', name:'Rajesh Patil',   role:'Lead',   phone:'9876541001', status:'ACTIVE',    coordinates:[28.6390,77.2100], location:'Sector 4, NH Block',  lastUpdate:'08:15 AM' },
      { id:'a2', name:'Anita Sharma',   role:'Worker', phone:'9876541002', status:'COMPLETED', coordinates:[28.6375,77.2125], location:'Market Area',         lastUpdate:'09:00 AM' },
      { id:'a3', name:'Vinay Kumar',    role:'Worker', phone:'9876541003', status:'EN_ROUTE',  coordinates:[28.6410,77.2082], location:'Park Zone',           lastUpdate:'09:45 AM' },
      { id:'a4', name:'Suresh Yadav',   role:'Worker', phone:'9876541004', status:'ACTIVE',    coordinates:[28.6382,77.2140], location:'Bus Stand',           lastUpdate:'09:30 AM' },
      { id:'a5', name:'Kavita Singh',   role:'Worker', phone:'9876541005', status:'BREAK',     coordinates:[28.6360,77.2092], location:'Rest Point A',        lastUpdate:'10:00 AM' },
      { id:'a6', name:'Manoj Tiwari',   role:'Worker', phone:'9876541006', status:'ACTIVE',    coordinates:[28.6422,77.2062], location:'Residential Block',   lastUpdate:'09:50 AM' },
      { id:'a7', name:'Priya Nair',     role:'Worker', phone:'9876541007', status:'COMPLETED', coordinates:[28.6348,77.2112], location:'School Road',         lastUpdate:'08:45 AM' },
      { id:'a8', name:'Deepak Rawat',   role:'Helper', phone:'9876541008', status:'EN_ROUTE',  coordinates:[28.6401,77.2158], location:'Near Water Tank',     lastUpdate:'10:10 AM' },
    ],
    activities: [
      { time:'08:15 AM', memberId:'a1', memberName:'Rajesh Patil',  location:'Sector 4, NH Block',  status:'ACTIVE'    },
      { time:'08:45 AM', memberId:'a7', memberName:'Priya Nair',    location:'School Road',         status:'COMPLETED' },
      { time:'09:00 AM', memberId:'a2', memberName:'Anita Sharma',  location:'Market Area',         status:'COMPLETED' },
      { time:'09:30 AM', memberId:'a4', memberName:'Suresh Yadav',  location:'Bus Stand',           status:'ACTIVE'    },
      { time:'09:45 AM', memberId:'a3', memberName:'Vinay Kumar',   location:'Park Zone',           status:'EN_ROUTE'  },
      { time:'09:50 AM', memberId:'a6', memberName:'Manoj Tiwari',  location:'Residential Block',   status:'ACTIVE'    },
      { time:'10:00 AM', memberId:'a5', memberName:'Kavita Singh',  location:'Rest Point A',        status:'BREAK'     },
      { time:'10:10 AM', memberId:'a8', memberName:'Deepak Rawat',  location:'Near Water Tank',     status:'EN_ROUTE'  },
    ],
  },
  {
    id: '2', name: 'Bravo Squad', zone: 'Market Zone – Central', lead: 'Meena Rao',
    members: [
      { id:'b1', name:'Meena Rao',      role:'Lead',   phone:'9876542001', status:'ACTIVE',    coordinates:[28.6200,77.2250], location:'Main Market Gate',    lastUpdate:'08:05 AM' },
      { id:'b2', name:'Ramesh Gupta',   role:'Worker', phone:'9876542002', status:'ACTIVE',    coordinates:[28.6185,77.2270], location:'Vegetable Mandi',     lastUpdate:'08:30 AM' },
      { id:'b3', name:'Sunita Verma',   role:'Worker', phone:'9876542003', status:'EN_ROUTE',  coordinates:[28.6220,77.2230], location:'Shopping Complex',    lastUpdate:'09:05 AM' },
      { id:'b4', name:'Arun Mishra',    role:'Worker', phone:'9876542004', status:'COMPLETED', coordinates:[28.6178,77.2285], location:'Food Street',         lastUpdate:'09:15 AM' },
      { id:'b5', name:'Lalita Desai',   role:'Worker', phone:'9876542005', status:'BREAK',     coordinates:[28.6210,77.2240], location:'Rest Shelter 2',      lastUpdate:'09:40 AM' },
      { id:'b6', name:'Harish Joshi',   role:'Worker', phone:'9876542006', status:'ACTIVE',    coordinates:[28.6235,77.2215], location:'Wholesale Area',      lastUpdate:'09:25 AM' },
      { id:'b7', name:'Rekha Pillai',   role:'Worker', phone:'9876542007', status:'ACTIVE',    coordinates:[28.6192,77.2260], location:'Auto Stand Area',     lastUpdate:'09:35 AM' },
      { id:'b8', name:'Ganesh Reddy',   role:'Helper', phone:'9876542008', status:'EN_ROUTE',  coordinates:[28.6168,77.2295], location:'Near Bus Depot',      lastUpdate:'10:00 AM' },
    ],
    activities: [
      { time:'08:05 AM', memberId:'b1', memberName:'Meena Rao',    location:'Main Market Gate',  status:'ACTIVE'    },
      { time:'08:30 AM', memberId:'b2', memberName:'Ramesh Gupta', location:'Vegetable Mandi',   status:'ACTIVE'    },
      { time:'09:05 AM', memberId:'b3', memberName:'Sunita Verma', location:'Shopping Complex',  status:'EN_ROUTE'  },
      { time:'09:15 AM', memberId:'b4', memberName:'Arun Mishra',  location:'Food Street',       status:'COMPLETED' },
      { time:'09:25 AM', memberId:'b6', memberName:'Harish Joshi', location:'Wholesale Area',    status:'ACTIVE'    },
      { time:'09:35 AM', memberId:'b7', memberName:'Rekha Pillai', location:'Auto Stand Area',   status:'ACTIVE'    },
      { time:'09:40 AM', memberId:'b5', memberName:'Lalita Desai', location:'Rest Shelter 2',    status:'BREAK'     },
      { time:'10:00 AM', memberId:'b8', memberName:'Ganesh Reddy', location:'Near Bus Depot',    status:'EN_ROUTE'  },
    ],
  },
  {
    id: '3', name: 'Charlie Squad', zone: 'Park Zone – East', lead: 'Vikram Bose',
    members: [
      { id:'c1', name:'Vikram Bose',    role:'Lead',   phone:'9876543001', status:'ACTIVE',    coordinates:[28.6500,77.1950], location:'Central Park Gate',   lastUpdate:'08:00 AM' },
      { id:'c2', name:'Nisha Kapoor',   role:'Worker', phone:'9876543002', status:'EN_ROUTE',  coordinates:[28.6520,77.1930], location:'Fountain Area',       lastUpdate:'08:20 AM' },
      { id:'c3', name:'Sanjay Mehta',   role:'Worker', phone:'9876543003', status:'ACTIVE',    coordinates:[28.6480,77.1970], location:'Jogging Track',       lastUpdate:'08:40 AM' },
      { id:'c4', name:'Usha Chauhan',   role:'Worker', phone:'9876543004', status:'COMPLETED', coordinates:[28.6510,77.1945], location:"Children's Zone",     lastUpdate:'09:00 AM' },
      { id:'c5', name:'Rohit Pandey',   role:'Worker', phone:'9876543005', status:'ACTIVE',    coordinates:[28.6465,77.1990], location:'Tennis Courts',       lastUpdate:'09:10 AM' },
      { id:'c6', name:'Seema Iyer',     role:'Worker', phone:'9876543006', status:'BREAK',     coordinates:[28.6530,77.1960], location:'Rest Point B',        lastUpdate:'09:30 AM' },
      { id:'c7', name:'Manish Saxena',  role:'Worker', phone:'9876543007', status:'EN_ROUTE',  coordinates:[28.6490,77.1935], location:'Lake Side Walk',      lastUpdate:'09:45 AM' },
      { id:'c8', name:'Pooja Menon',    role:'Helper', phone:'9876543008', status:'ACTIVE',    coordinates:[28.6472,77.1978], location:'Garden Sector 2',     lastUpdate:'10:05 AM' },
    ],
    activities: [
      { time:'08:00 AM', memberId:'c1', memberName:'Vikram Bose',   location:'Central Park Gate',   status:'ACTIVE'    },
      { time:'08:20 AM', memberId:'c2', memberName:'Nisha Kapoor',  location:'Fountain Area',       status:'EN_ROUTE'  },
      { time:'08:40 AM', memberId:'c3', memberName:'Sanjay Mehta',  location:'Jogging Track',       status:'ACTIVE'    },
      { time:'09:00 AM', memberId:'c4', memberName:'Usha Chauhan',  location:"Children's Zone",     status:'COMPLETED' },
      { time:'09:10 AM', memberId:'c5', memberName:'Rohit Pandey',  location:'Tennis Courts',       status:'ACTIVE'    },
      { time:'09:30 AM', memberId:'c6', memberName:'Seema Iyer',    location:'Rest Point B',        status:'BREAK'     },
      { time:'09:45 AM', memberId:'c7', memberName:'Manish Saxena', location:'Lake Side Walk',      status:'EN_ROUTE'  },
      { time:'10:05 AM', memberId:'c8', memberName:'Pooja Menon',   location:'Garden Sector 2',     status:'ACTIVE'    },
    ],
  },
  {
    id: '4', name: 'Delta Squad', zone: 'Residential – West', lead: 'Kiran Jha',
    members: [
      { id:'d1', name:'Kiran Jha',       role:'Lead',   phone:'9876544001', status:'ACTIVE',    coordinates:[28.6100,77.1850], location:'Block A, Main Rd',    lastUpdate:'07:55 AM' },
      { id:'d2', name:'Santosh Dubey',   role:'Worker', phone:'9876544002', status:'ACTIVE',    coordinates:[28.6085,77.1870], location:'Block B Lane',        lastUpdate:'08:15 AM' },
      { id:'d3', name:'Geeta Shukla',    role:'Worker', phone:'9876544003', status:'EN_ROUTE',  coordinates:[28.6120,77.1830], location:'Housing Society 1',   lastUpdate:'08:35 AM' },
      { id:'d4', name:'Pankaj Ware',     role:'Worker', phone:'9876544004', status:'COMPLETED', coordinates:[28.6075,77.1895], location:'Park Road',           lastUpdate:'09:05 AM' },
      { id:'d5', name:'Ritu Bhatt',      role:'Worker', phone:'9876544005', status:'BREAK',     coordinates:[28.6110,77.1845], location:'Rest Zone C',         lastUpdate:'09:25 AM' },
      { id:'d6', name:'Alok Srivastava', role:'Worker', phone:'9876544006', status:'ACTIVE',    coordinates:[28.6135,77.1818], location:'Hospital Road',       lastUpdate:'09:15 AM' },
      { id:'d7', name:'Mala Tripathi',   role:'Worker', phone:'9876544007', status:'ACTIVE',    coordinates:[28.6092,77.1858], location:'School Compound',     lastUpdate:'09:40 AM' },
      { id:'d8', name:'Dinesh Ahuja',    role:'Helper', phone:'9876544008', status:'EN_ROUTE',  coordinates:[28.6068,77.1908], location:'Near Clinic Road',    lastUpdate:'10:02 AM' },
    ],
    activities: [
      { time:'07:55 AM', memberId:'d1', memberName:'Kiran Jha',       location:'Block A, Main Rd',    status:'ACTIVE'    },
      { time:'08:15 AM', memberId:'d2', memberName:'Santosh Dubey',   location:'Block B Lane',        status:'ACTIVE'    },
      { time:'08:35 AM', memberId:'d3', memberName:'Geeta Shukla',    location:'Housing Society 1',   status:'EN_ROUTE'  },
      { time:'09:05 AM', memberId:'d4', memberName:'Pankaj Ware',     location:'Park Road',           status:'COMPLETED' },
      { time:'09:15 AM', memberId:'d6', memberName:'Alok Srivastava', location:'Hospital Road',       status:'ACTIVE'    },
      { time:'09:25 AM', memberId:'d5', memberName:'Ritu Bhatt',      location:'Rest Zone C',         status:'BREAK'     },
      { time:'09:40 AM', memberId:'d7', memberName:'Mala Tripathi',   location:'School Compound',     status:'ACTIVE'    },
      { time:'10:02 AM', memberId:'d8', memberName:'Dinesh Ahuja',    location:'Near Clinic Road',    status:'EN_ROUTE'  },
    ],
  },
  {
    id: '5', name: 'Echo Squad', zone: 'Industrial Zone – South', lead: 'Farhan Sheikh',
    members: [
      { id:'e1', name:'Farhan Sheikh',  role:'Lead',   phone:'9876545001', status:'ACTIVE',    coordinates:[28.5950,77.2300], location:'Gate 1, Industrial',  lastUpdate:'08:10 AM' },
      { id:'e2', name:'Leela Joseph',   role:'Worker', phone:'9876545002', status:'ACTIVE',    coordinates:[28.5935,77.2325], location:'Warehouse A',         lastUpdate:'08:25 AM' },
      { id:'e3', name:'Bablu Mondal',   role:'Worker', phone:'9876545003', status:'EN_ROUTE',  coordinates:[28.5968,77.2280], location:'Truck Parking Lot',   lastUpdate:'08:50 AM' },
      { id:'e4', name:'Sunita Ghosh',   role:'Worker', phone:'9876545004', status:'COMPLETED', coordinates:[28.5915,77.2345], location:'Canteen Area',        lastUpdate:'09:20 AM' },
      { id:'e5', name:'Tarun Maliya',   role:'Worker', phone:'9876545005', status:'BREAK',     coordinates:[28.5945,77.2315], location:'Rest Shed D',         lastUpdate:'09:35 AM' },
      { id:'e6', name:'Pushpa Goyal',   role:'Worker', phone:'9876545006', status:'ACTIVE',    coordinates:[28.5980,77.2265], location:'Loading Bay 3',       lastUpdate:'09:20 AM' },
      { id:'e7', name:'Naresh Balaji',  role:'Worker', phone:'9876545007', status:'ACTIVE',    coordinates:[28.5928,77.2340], location:'Workshop Zone',       lastUpdate:'09:50 AM' },
      { id:'e8', name:'Champa Verma',   role:'Helper', phone:'9876545008', status:'EN_ROUTE',  coordinates:[28.5905,77.2358], location:'Scrap Yard',          lastUpdate:'10:08 AM' },
    ],
    activities: [
      { time:'08:10 AM', memberId:'e1', memberName:'Farhan Sheikh', location:'Gate 1, Industrial',  status:'ACTIVE'    },
      { time:'08:25 AM', memberId:'e2', memberName:'Leela Joseph',  location:'Warehouse A',         status:'ACTIVE'    },
      { time:'08:50 AM', memberId:'e3', memberName:'Bablu Mondal',  location:'Truck Parking Lot',   status:'EN_ROUTE'  },
      { time:'09:20 AM', memberId:'e4', memberName:'Sunita Ghosh',  location:'Canteen Area',        status:'COMPLETED' },
      { time:'09:20 AM', memberId:'e6', memberName:'Pushpa Goyal',  location:'Loading Bay 3',       status:'ACTIVE'    },
      { time:'09:35 AM', memberId:'e5', memberName:'Tarun Maliya',  location:'Rest Shed D',         status:'BREAK'     },
      { time:'09:50 AM', memberId:'e7', memberName:'Naresh Balaji', location:'Workshop Zone',       status:'EN_ROUTE'  },
      { time:'10:08 AM', memberId:'e8', memberName:'Champa Verma',  location:'Scrap Yard',          status:'EN_ROUTE'  },
    ],
  },
];

// ─── Helper: compute centre of a squad's member coordinates ───────────────────
const squadCenter = (squad: Squad): [number, number] => {
  const lats = squad.members.map(m => m.coordinates[0]);
  const lngs = squad.members.map(m => m.coordinates[1]);
  return [
    lats.reduce((a, b) => a + b, 0) / lats.length,
    lngs.reduce((a, b) => a + b, 0) / lngs.length,
  ];
};

// ─── Sub-component: flies map to new center when selected squad changes ────────
const MapFlyTo = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 14, { duration: 1 }); }, [center, map]);
  return null;
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: MemberStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ─── Time parsing helper — converts "08:15 AM" → minutes since midnight ────────
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

// ─── Main component ───────────────────────────────────────────────────────────
const TrackingDashboard = () => {
  const [selectedSquadId, setSelectedSquadId] = useState<string>('1');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Draft filter state (edited by user before Apply)
  const [dateFrom, setDateFrom] = useState('2026-03-26');
  const [dateTo,   setDateTo]   = useState('2026-03-26');
  const [timeFrom, setTimeFrom] = useState('08:00');
  const [timeTo,   setTimeTo]   = useState('17:00');

  // Applied filter state (only updated on Apply)
  const [applied, setApplied] = useState({ timeFrom: '08:00', timeTo: '17:00' });

  const squad  = MOCK_SQUADS.find(s => s.id === selectedSquadId)!;
  const center = squadCenter(squad);

  const handleSquadSelect = (id: string) => {
    setSelectedSquadId(id);
    setSelectedMemberId(null);
  };

  const handleApply = () => {
    setApplied({ timeFrom, timeTo });
    setSelectedMemberId(null);
  };

  // Derived: activities filtered by selected member + applied time window
  const visibleActivities = useMemo(() => {
    const fromMins = hhmm(applied.timeFrom);
    const toMins   = hhmm(applied.timeTo);

    return squad.activities.filter(ev => {
      const inTimeWindow = parseActivityTime(ev.time) >= fromMins &&
                           parseActivityTime(ev.time) <= toMins;
      const inMember     = selectedMemberId ? ev.memberId === selectedMemberId : true;
      return inTimeWindow && inMember;
    });
  }, [squad, selectedMemberId, applied]);

  // Stat counters for selected squad
  const statCounts = useMemo(() => ({
    active:    squad.members.filter(m => m.status === 'ACTIVE').length,
    enRoute:   squad.members.filter(m => m.status === 'EN_ROUTE').length,
    completed: squad.members.filter(m => m.status === 'COMPLETED').length,
    onBreak:   squad.members.filter(m => m.status === 'BREAK').length,
  }), [squad]);

  const selectedMember = squad.members.find(m => m.id === selectedMemberId) ?? null;

  return (
    <div className="flex-1 bg-gray-50 h-full overflow-y-auto">

      {/* ── Slim header + filter bar — one compact strip ───────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center gap-3 sticky top-0 z-10 shadow-sm">
        {/* Title */}
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
            value={selectedSquadId}
            onChange={e => handleSquadSelect(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MOCK_SQUADS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-gray-200 shrink-0" />

        {/* Date range */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Date</label>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-xs">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 w-32"
            />
            <span className="text-gray-400">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 w-32"
            />
          </div>
        </div>

        <div className="h-5 w-px bg-gray-200 shrink-0" />

        {/* Time window */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Time</label>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-xs">
            <input
              type="time"
              value={timeFrom}
              onChange={e => setTimeFrom(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700"
            />
            <span className="text-gray-400">–</span>
            <input
              type="time"
              value={timeTo}
              onChange={e => setTimeTo(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700"
            />
          </div>
        </div>

        {/* Apply button */}
        <button
          onClick={handleApply}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          Apply
        </button>

        {/* Refresh — pushed to far right */}
        <button className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors shrink-0">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="p-5 space-y-5">

        {/* ── Active filter badge (shows when a time filter is applied) ────── */}
        {(applied.timeFrom !== '08:00' || applied.timeTo !== '17:00') && (
          <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <span className="font-medium">Time filter active:</span>
            <span>{applied.timeFrom} – {applied.timeTo}</span>
            <button
              onClick={() => { setTimeFrom('08:00'); setTimeTo('17:00'); setApplied({ timeFrom: '08:00', timeTo: '17:00' }); }}
              className="ml-2 text-blue-500 hover:text-blue-700 underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* ── Stat chips for the selected squad ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active',    value: statCounts.active,    color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
            { label: 'En Route',  value: statCounts.enRoute,   color: 'text-blue-700 bg-blue-50 border-blue-100'          },
            { label: 'Completed', value: statCounts.completed, color: 'text-gray-600 bg-gray-50 border-gray-200'          },
            { label: 'On Break',  value: statCounts.onBreak,   color: 'text-amber-700 bg-amber-50 border-amber-100'       },
          ].map(c => (
            <div key={c.label} className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium ${c.color}`}>
              <span>{c.label}</span>
              <span className="text-xl font-bold">{c.value}</span>
            </div>
          ))}
        </div>

        {/* ── Row 1: Squad list (narrow) | Map (wide) ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Squad list */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">All Squads</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {MOCK_SQUADS.map(s => {
                const activeCount = s.members.filter(m => m.status === 'ACTIVE').length;
                const isSel = s.id === selectedSquadId;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => handleSquadSelect(s.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors
                        ${isSel ? 'bg-blue-50 border-l-2 border-blue-600' : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeCount > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isSel ? 'text-blue-700' : 'text-gray-800'}`}>{s.name}</p>
                        <p className="text-xs text-gray-400 truncate">{s.zone}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{activeCount} <span className="text-emerald-600 font-medium">✓</span></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Map — spans remaining 3 cols */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Live Map — {squad.name}</span>
              <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
                {(Object.keys(MARKER_COLORS) as MemberStatus[]).map(s => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: MARKER_COLORS[s] }} />
                    {STATUS_CONFIG[s].label}
                  </span>
                ))}
              </div>
            </div>
            <MapContainer
              center={center}
              zoom={14}
              style={{ height: '400px', width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFlyTo center={center} />
              {squad.members.map(m => {
                const isMemberSel = m.id === selectedMemberId;
                return (
                  <Marker
                    key={m.id}
                    position={m.coordinates}
                    icon={makeMarkerIcon(m.status, isMemberSel)}
                    eventHandlers={{ click: () => setSelectedMemberId(isMemberSel ? null : m.id) }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[160px]">
                        <p className="font-semibold text-gray-800">{m.name}</p>
                        <p className="text-gray-500 text-xs">{m.role} · {squad.name}</p>
                        <p className="text-gray-600 text-xs mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{m.location}
                        </p>
                        <p className="text-gray-600 text-xs flex items-center gap-1">
                          <Phone className="w-3 h-3" />{m.phone}
                        </p>
                        <div className="mt-1.5"><StatusBadge status={m.status} /></div>
                        <p className="text-gray-400 text-xs mt-1">Last update: {m.lastUpdate}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* ── Row 2: Member list | Activity Log ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Member list */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Members</span>
              {selectedMemberId && (
                <button onClick={() => setSelectedMemberId(null)} className="ml-auto text-xs text-blue-600 hover:underline">
                  Clear
                </button>
              )}
            </div>
            <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {squad.members.map(m => {
                const isSel = m.id === selectedMemberId;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => setSelectedMemberId(isSel ? null : m.id)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors
                        ${isSel ? 'bg-blue-50 border-l-2 border-blue-600' : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: MARKER_COLORS[m.status] }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isSel ? 'text-blue-700' : 'text-gray-800'}`}>
                          {m.name}
                          {m.role === 'Lead' && <span className="ml-1 text-xs text-blue-400 font-normal">Lead</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{m.location}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Selected member detail card */}
            {selectedMember && (
              <div className="border-t border-gray-100 px-4 py-3 bg-blue-50">
                <p className="text-xs font-semibold text-blue-700 mb-1">{selectedMember.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                  <Phone className="w-3 h-3" /> {selectedMember.phone}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {selectedMember.location}
                </p>
                <div className="mt-1.5"><StatusBadge status={selectedMember.status} /></div>
              </div>
            )}
          </div>

          {/* Activity Log — spans remaining 3 cols */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                Activity Log — {squad.name}
                {selectedMember && <span className="text-blue-600 font-normal"> · {selectedMember.name}</span>}
              </span>
              <span className="ml-auto text-xs text-gray-400 mr-2">{visibleActivities.length} events</span>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Time</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleActivities.map((ev, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedMemberId(ev.memberId === selectedMemberId ? null : ev.memberId)}
                      className={`cursor-pointer transition-colors
                        ${ev.memberId === selectedMemberId ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{ev.time}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{ev.memberName}</td>
                      <td className="px-4 py-3 text-gray-600">{ev.location}</td>
                      <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                    </tr>
                  ))}
                  {visibleActivities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">
                        No activities match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackingDashboard;