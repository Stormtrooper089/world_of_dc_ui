import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, MessageSquare, Paperclip, Calendar, User, Plus, 
  Filter, RefreshCw, Search, LayoutList, Kanban, 
  Clock, AlertCircle, CheckCircle, MoreHorizontal, ChevronRight,
  ArrowUpRight, SlidersHorizontal, MapPin, Phone, Upload,
  Edit2, Save, Check, FileText, Loader2, Trash2
} from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import { complaintService } from "../services/complaintService";

// --- CONSTANTS & CONFIG ---

const PRIORITY_STYLES = {
  HIGH: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle },
  URGENT: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: AlertCircle },
  MEDIUM: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: Clock },
  LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
};

const STATUS_CONFIG = {
  CREATED: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  ASSIGNED: { label: 'Assigned', color: 'bg-purple-100 text-purple-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Rejected', color: 'bg-gray-100 text-gray-700' },
};

const DEPARTMENT_NAMES = {
  WATER_RESOURCES: 'Water Resources',
  ELECTRICITY: 'Electricity',
  ROADS: 'Roads',
  SANITATION: 'Sanitation',
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  OTHER: 'Other'
};

const MOCK_OFFICERS = [
  { id: 'OFF-101', name: 'Rajesh Kumar', dept: 'ELECTRICITY' },
  { id: 'OFF-102', name: 'Sarah Jenkins', dept: 'SANITATION' },
  { id: 'OFF-103', name: 'Mike Ross', dept: 'ROADS' },
  { id: 'OFF-104', name: 'Priya Singh', dept: 'HEALTHCARE' },
];

// --- SUB-COMPONENTS ---

const MetricCard = ({ title, value, trend, type = 'neutral' }) => {
  const colors = {
    neutral: 'border-l-blue-500',
    danger: 'border-l-red-500',
    success: 'border-l-green-500',
    warning: 'border-l-orange-500',
  };

  return (
    <div className={`bg-white p-3 rounded-lg shadow-sm border border-gray-100 border-l-4 ${colors[type]} flex-1 min-w-[150px]`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
      <div className="flex items-end justify-between mt-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {trend && <span className="text-xs font-medium text-gray-400">{trend}</span>}
      </div>
    </div>
  );
};

const FacetedFilterCheckbox = ({ label, count, checked, onChange }) => (
  <label className="flex items-center justify-between py-1.5 cursor-pointer group hover:bg-gray-50 px-2 -mx-2 rounded">
    <div className="flex items-center gap-2">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
      />
      <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{label}</span>
    </div>
    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full group-hover:bg-white">{count}</span>
  </label>
);

// Helper Component for Inline Editing
const EditableDetailRow = ({ label, value, isEditing, onEditStart, onEditCancel, children, displayValue }) => {
  return (
    <div className="group h-12"> 
      <span className="text-xs text-gray-400 block mb-1">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-2 animate-in fade-in duration-200">
          <div className="flex-1">
            {children}
          </div>
          <button 
            onClick={onEditCancel}
            className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
            {displayValue || value || 'N/A'}
          </span>
          <button 
            onClick={onEditStart}
            className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-blue-50 text-blue-600 rounded"
            title="Edit Field"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

// --- CREATE MODAL COMPONENT ---

const CreateComplaintModal = ({ onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM',
    location: '',
    department: '',
    mobileNumber: '9876543210'
  });
  const [attachment, setAttachment] = useState(null);

  const isCitizen = user.role === 'CUSTOMER';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      const response = await complaintService.createComplaint(formDataToSend);
      if (response.success) {
        onSuccess(response.data);
      } else {
        alert(response.message || "Failed to create");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Complaint</h2>
            <p className="text-xs text-gray-500">Enter the details of the issue below.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {!isCitizen && (
            <div>
               <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Citizen Contact</label>
               <input 
                  type="tel"
                  required 
                  value={formData.mobileNumber}
                  onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mobile Number"
               />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Subject</label>
            <input 
              type="text" 
              required
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Street light broken on Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Department</label>
              <select 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Dept...</option>
                {Object.entries(DEPARTMENT_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            {!isCitizen && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            )}
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Address or landmark"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Description</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Provide details about the issue..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Attachment</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-1">
                {attachment ? (
                  <span className="text-sm font-medium text-blue-600">{attachment.name}</span>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload file</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70">{loading ? 'Creating...' : 'Create Ticket'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function ComplaintCockpitBoard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('LIST');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Drawer Editing States
  const [editingField, setEditingField] = useState(null); // 'STATUS', 'DEPT', 'OFFICER'
  const [tempChanges, setTempChanges] = useState({}); // Store inline edits before save
  const [commentText, setCommentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null); // For drawer file upload

  const [activeFilters, setActiveFilters] = useState({
    priority: [], status: [], department: []
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, [user?.id]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTicketCreated = (newTicket) => {
    setComplaints(prev => [newTicket, ...prev]);
    setIsCreateModalOpen(false);
  };

  // --- DRAWER ACTIONS ---

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setTempChanges(prev => ({ ...prev, [field]: currentValue }));
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempChanges({});
  };

  const handleTempChange = (field, value) => {
    setTempChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleDrawerFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate file upload immediately for UX
      const newDoc = {
        id: Date.now(),
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toISOString()
      };
      setComplaints(prev => prev.map(c => 
        c.id === selectedTicketId 
          ? { ...c, documents: [...(c.documents || []), newDoc] } 
          : c
      ));
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedTicketId) return;
    setIsSaving(true);
    
    // Merge temp changes
    const updates = { ...tempChanges };
    const originalTicket = complaints.find(c => c.id === selectedTicketId);
    
    // Add Officer details if officer ID changed
    if (updates.assignedToId && updates.assignedToId !== originalTicket.assignedToId) {
       updates.status = 'ASSIGNED'; // Auto-status update
    }

    // Add Comment if exists
    let newComments = [...(originalTicket.comments || [])];
    if (commentText.trim()) {
       newComments.push({
         officerId: user.id,
         comment: commentText,
         timestamp: new Date().toISOString()
       });
       updates.comments = newComments;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Mock API delay
      
      setComplaints(prev => prev.map(c => 
        c.id === selectedTicketId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ));
      
      setEditingField(null);
      setTempChanges({});
      setCommentText('');
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- FILTER & DATA ---
  const facets = useMemo(() => {
    const counts = { priority: {}, status: {}, department: {} };
    complaints.forEach(c => {
      counts.priority[c.priority] = (counts.priority[c.priority] || 0) + 1;
      counts.status[c.status] = (counts.status[c.status] || 0) + 1;
      const dept = c.assignedDepartment || 'Unassigned';
      counts.department[dept] = (counts.department[dept] || 0) + 1;
    });
    return counts;
  }, [complaints]);

  const filteredData = useMemo(() => {
    return complaints.filter(item => {
      const matchesSearch = !searchQuery || 
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = activeFilters.priority.length === 0 || activeFilters.priority.includes(item.priority);
      const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(item.status);
      const matchesDept = activeFilters.department.length === 0 || activeFilters.department.includes(item.assignedDepartment || 'Unassigned');
      return matchesSearch && matchesPriority && matchesStatus && matchesDept;
    });
  }, [complaints, searchQuery, activeFilters]);

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    const ticket = complaints.find(c => c.id === selectedTicketId);
    // Overlay temp changes for the view so it looks responsive before saving
    return { ...ticket, ...tempChanges };
  }, [complaints, selectedTicketId, tempChanges]);

  // Derived display values for officer
  const assignedOfficerName = useMemo(() => {
    if (!selectedTicket) return 'Unassigned';
    const officer = MOCK_OFFICERS.find(o => o.id === selectedTicket.assignedToId);
    return officer ? `${officer.name} (${officer.dept})` : 'Unassigned';
  }, [selectedTicket]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">DO</div>
          <h1 className="font-semibold text-gray-800">Admin Console</h1>
        </div>
        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-4 mt-6">
        
        {/* SIDEBAR */}
        {showFilters && (
          <aside className="w-60 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Filters</h3>
               <button onClick={() => setActiveFilters({ priority: [], status: [], department: [] })} className="text-xs text-blue-600 hover:text-blue-800">Reset</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div><h4 className="text-sm font-semibold text-gray-900 mb-2">Status</h4>{Object.keys(STATUS_CONFIG).map(key => (<FacetedFilterCheckbox key={key} label={STATUS_CONFIG[key].label} count={facets.status[key] || 0} checked={activeFilters.status.includes(key)} onChange={() => toggleFilter('status', key)} />))}</div>
                <hr className="border-gray-100" />
                <div><h4 className="text-sm font-semibold text-gray-900 mb-2">Priority</h4>{['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(prio => (<FacetedFilterCheckbox key={prio} label={prio.charAt(0) + prio.slice(1).toLowerCase()} count={facets.priority[prio] || 0} checked={activeFilters.priority.includes(prio)} onChange={() => toggleFilter('priority', prio)} />))}</div>
             </div>
          </aside>
        )}

        {/* DATA GRID */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
           <div className="p-3 border-b border-gray-100 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded hover:bg-gray-100 ${showFilters ? 'text-blue-600' : 'text-gray-400'}`}><SlidersHorizontal className="w-4 h-4" /></button>
               <span className="text-sm text-gray-500 font-medium pl-2 border-l border-gray-200">Showing {filteredData.length} tickets</span>
             </div>
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setViewMode('LIST')} className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${viewMode === 'LIST' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}><LayoutList className="w-3.5 h-3.5" /> List</button>
             </div>
           </div>
           <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[100px]">ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[120px]">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[120px]">Priority</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[150px]">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map(complaint => (
                    <tr key={complaint.id} onClick={() => { setSelectedTicketId(complaint.id); setCommentText(''); setEditingField(null); }} className={`hover:bg-blue-50 cursor-pointer transition-colors group ${selectedTicketId === complaint.id ? 'bg-blue-50/60' : ''}`}>
                      <td className="px-4 py-3"><span className="font-mono text-xs text-gray-500 group-hover:text-blue-600 font-medium">#{complaint.complaintNumber.slice(-6)}</span></td>
                      <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{complaint.subject}</p></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[complaint.status]?.color}`}>{STATUS_CONFIG[complaint.status]?.label || complaint.status}</span></td>
                      <td className="px-4 py-3"><div className={`flex items-center gap-1.5 text-xs font-medium ${PRIORITY_STYLES[complaint.priority].text}`}>{complaint.priority}</div></td>
                      <td className="px-4 py-3"><span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{complaint.assignedDepartment || 'Unassigned'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
        
        {/* RIGHT DRAWER */}
        {selectedTicket && (
          <div className="w-[480px] bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
               <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-500">#{selectedTicket.complaintNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${PRIORITY_STYLES[selectedTicket.priority].bg} ${PRIORITY_STYLES[selectedTicket.priority].text} ${PRIORITY_STYLES[selectedTicket.priority].border}`}>{selectedTicket.priority}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedTicket.subject}</h2>
               </div>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={handleSaveChanges} 
                   disabled={isSaving}
                   className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-70"
                 >
                   {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                   {isSaving ? 'Saving' : 'Save'}
                 </button>
                 <button onClick={() => setSelectedTicketId(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">{selectedTicket.description}</p>
              </div>
              
              {/* DETAILS GRID WITH EDITABLE FIELDS */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                
                {/* 1. Status (Editable) */}
                <EditableDetailRow 
                  label="Status" 
                  value={STATUS_CONFIG[selectedTicket.status]?.label}
                  isEditing={editingField === 'STATUS'}
                  onEditStart={() => startEditing('STATUS', selectedTicket.status)}
                  onEditCancel={cancelEditing}
                >
                  <select 
                    className="w-full text-sm p-1 border border-blue-500 rounded focus:ring-2 focus:ring-blue-100 outline-none"
                    value={tempChanges.status || selectedTicket.status}
                    onChange={(e) => handleTempChange('status', e.target.value)}
                  >
                    {Object.keys(STATUS_CONFIG).map(s => (<option key={s} value={s}>{STATUS_CONFIG[s].label}</option>))}
                  </select>
                </EditableDetailRow>

                {/* 2. Department (Editable) */}
                <EditableDetailRow 
                  label="Department" 
                  value={selectedTicket.assignedDepartment}
                  displayValue={DEPARTMENT_NAMES[selectedTicket.assignedDepartment] || selectedTicket.assignedDepartment}
                  isEditing={editingField === 'DEPT'}
                  onEditStart={() => startEditing('DEPT', selectedTicket.assignedDepartment)}
                  onEditCancel={cancelEditing}
                >
                  <select 
                    className="w-full text-sm p-1 border border-blue-500 rounded focus:ring-2 focus:ring-blue-100 outline-none"
                    value={tempChanges.assignedDepartment || selectedTicket.assignedDepartment || ''}
                    onChange={(e) => handleTempChange('assignedDepartment', e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {Object.entries(DEPARTMENT_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </EditableDetailRow>

                {/* 3. Assigned Officer (Editable) */}
                <EditableDetailRow 
                  label="Assigned Officer" 
                  displayValue={assignedOfficerName}
                  isEditing={editingField === 'OFFICER'}
                  onEditStart={() => startEditing('OFFICER', selectedTicket.assignedToId)}
                  onEditCancel={cancelEditing}
                >
                  <select 
                    className="w-full text-sm p-1 border border-blue-500 rounded focus:ring-2 focus:ring-blue-100 outline-none"
                    value={tempChanges.assignedToId || selectedTicket.assignedToId || ''}
                    onChange={(e) => handleTempChange('assignedToId', e.target.value)}
                  >
                    <option value="">Select Officer...</option>
                    {MOCK_OFFICERS.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.dept})</option>
                    ))}
                  </select>
                </EditableDetailRow>

                {/* 4. Read Only Fields */}
                <div className="h-12">
                   <span className="text-xs text-gray-400 block mb-1">Location</span>
                   <span className="text-sm font-medium text-gray-800 truncate block">{selectedTicket.location || 'N/A'}</span>
                </div>
                <div className="h-12">
                   <span className="text-xs text-gray-400 block mb-1">Citizen Contact</span>
                   <span className="text-sm font-medium text-gray-800 truncate block">{selectedTicket.mobileNumber || 'N/A'}</span>
                </div>
                <div className="h-12">
                   <span className="text-xs text-gray-400 block mb-1">Created At</span>
                   <span className="text-sm font-medium text-gray-800 truncate block">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                </div>

              </div>

              {/* ATTACHMENTS SECTION */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attachments</h3>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add File
                  </button>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleDrawerFileUpload} />
                </div>
                
                <div className="space-y-2">
                  {(!selectedTicket.documents || selectedTicket.documents.length === 0) && (
                     <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded text-center text-xs text-gray-400">No attachments yet</div>
                  )}
                  {selectedTicket.documents?.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg group">
                      <div className="bg-blue-50 p-1.5 rounded text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
                        <p className="text-[10px] text-gray-400">{doc.fileSize} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <button className="text-gray-400 hover:text-blue-600 p-1"><ArrowUpRight className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMMENTS SECTION */}
              <div className="border-t border-gray-100 pt-4">
                 <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">Activity Log</h3>
                 
                 <div className="space-y-4 mb-4">
                   {selectedTicket.comments?.map((c, i) => (
                     <div key={i} className="flex gap-3">
                       <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">AD</div>
                       <div className="flex-1">
                         <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-gray-900">Admin</span><span className="text-[10px] text-gray-400">{new Date(c.timestamp).toLocaleTimeString()}</span></div>
                         <p className="text-xs text-gray-600 mt-0.5">{c.comment}</p>
                       </div>
                     </div>
                   ))}
                 </div>
                 
                 <div className="relative">
                   <input 
                     type="text" 
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     placeholder="Type a note or reply..." 
                     className="w-full text-xs pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                     onKeyDown={(e) => e.key === 'Enter' && handleSaveChanges()}
                   />
                   <button 
                     onClick={handleSaveChanges}
                     className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                   >
                     <ArrowUpRight className="w-4 h-4" />
                   </button>
                 </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {isCreateModalOpen && <CreateComplaintModal onClose={() => setIsCreateModalOpen(false)} onSuccess={handleNewTicketCreated} user={user} />}
    </div>
  );
}