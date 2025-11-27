import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, MessageSquare, Paperclip, Calendar, User, Plus,
  Filter, RefreshCw, Search, LayoutList, Kanban,
  Clock, AlertCircle, CheckCircle, MoreHorizontal, ChevronRight,
  ArrowUpRight, SlidersHorizontal, MapPin, Phone, Upload,
  Edit2, Save, FileText, Loader2, Trash2, CalendarDays, Check
} from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import { complaintService } from "../services/complaintService";
import { UserRole, ComplaintPriority, ComplaintStatus, Department } from "../constants/enums";
import { Complaint, ComplaintUpdateRequest, Officer, ComplaintDocument, Comment as ComplaintComment } from '../types';
import { officerService } from "../services/officerService";
import api from '../services/api';

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, onClose }: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />
  };

  return (
    <div className={`fixed top-4 right-4 z-[60] min-w-[320px] max-w-md p-4 rounded-lg border-2 shadow-lg flex items-start gap-3 animate-in slide-in-from-top duration-300 ${styles[type]}`}>
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

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
  BLOCKED: { label: 'Blocked', color: 'bg-red-100 text-red-700' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-700' },
  DUPLICATE: { label: 'Duplicate', color: 'bg-gray-100 text-gray-600' },
};

const DEPARTMENT_NAMES = {
  DISTRICT_ADMINISTRATION: 'District Administration',
  REVENUE_DEPARTMENT: 'Revenue Department',
  COLLECTORATE: 'Collectorate',
  PUBLIC_WORKS_DEPARTMENT: 'Public Works Department (PWD)',
  WATER_RESOURCES: 'Water Resources',
  ELECTRICITY_DEPARTMENT: 'Electricity Department',
  HEALTH_DEPARTMENT: 'Health Department',
  EDUCATION_DEPARTMENT: 'Education Department',
  SOCIAL_WELFARE: 'Social Welfare',
  POLICE_DEPARTMENT: 'Police Department',
  FIRE_SERVICES: 'Fire Services',
  TRANSPORT_DEPARTMENT: 'Transport Department',
  RURAL_DEVELOPMENT: 'Rural Development',
  URBAN_DEVELOPMENT: 'Urban Development',
  AGRICULTURE_DEPARTMENT: 'Agriculture Department',
  ENVIRONMENT_DEPARTMENT: 'Environment Department',
  SANITATION_DEPARTMENT: 'Sanitation Department',
  FOREST_DEPARTMENT: 'Forest Department',
  FOOD_AND_SUPPLIES: 'Food and Supplies',
  LABOUR_DEPARTMENT: 'Labour Department',
  WOMEN_AND_CHILD_DEVELOPMENT: 'Women and Child Development',
  INFORMATION_TECHNOLOGY: 'Information Technology',
  STATISTICS_DEPARTMENT: 'Statistics Department',
  OTHER: 'Other',
  UNASSIGNED: 'Unassigned'
};

// --- SUB-COMPONENTS ---
const MetricCard = ({ title, value, trend, type = 'neutral' }: {
  title: string;
  value: number;
  trend?: string;
  type?: 'neutral' | 'danger' | 'success' | 'warning'
}) => {
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

const FacetedFilterCheckbox = ({ label, count, checked, onChange }: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void
}) => (
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

const CreateComplaintModal = ({ onClose, onSuccess, user, showToast }: {
  onClose: () => void;
  onSuccess: (complaint: Complaint) => void;
  user: any;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM',
    location: '',
    department: '',
    mobileNumber: '9876543210'
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const isCitizen = user.role === 'CUSTOMER';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Invalid file type. Please upload images, PDF, or Word documents', 'error');
        return;
      }
      
      setAttachment(file);
      showToast('File attached successfully', 'success');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key as keyof typeof formData]);
      });
      
      if (attachment) {
        formDataToSend.append('files', attachment);
        setUploadProgress(50);
      }

      const response = await complaintService.createComplaint(formDataToSend);
      setUploadProgress(100);
      
      if (response.success) {
        const completeComplaint: Complaint = {
          id: response.data.complaintId,
          complaintId: Number(response.data.complaintId),
          complaintNumber: response.data.complaintNumber,
          citizenId: user.id,
          subject: formData.subject,
          description: formData.description,
          priority: formData.priority as ComplaintPriority,
          status: response.data.status as ComplaintStatus,
          location: formData.location,
          assignedDepartment: formData.department ? (formData.department as Department) : undefined,
          assignedToId: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
          documents: attachment ? [{
            id: Date.now().toString(),
            fileName: attachment.name,
            filePath: attachment.name,
            fileSize: attachment.size,
            mimeType: attachment.type,
            uploadedAt: new Date().toISOString()
          }] : [],
        };
        onSuccess(completeComplaint);
        showToast('Complaint created successfully! Ticket #' + response.data.complaintNumber.slice(-6), 'success');
      } else {
        showToast(response.message || "Failed to create complaint", 'error');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the complaint';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Complaint Ticket</h2>
            <p className="text-xs text-gray-500">Fill in the details to create a new ticket.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT SECTION: Core Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Subject <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Street light broken on Main St"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Description <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Provide detailed information about the issue..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Attachment</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer">
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <div className="flex flex-col items-center gap-1">
                    {attachment ? (
                      <>
                        <FileText className="w-6 h-6 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">{attachment.name}</span>
                        <span className="text-xs text-gray-400">{(attachment.size / 1024).toFixed(1)} KB</span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachment(null);
                            showToast('Attachment removed', 'info');
                          }}
                          className="mt-1 text-xs text-red-600 hover:text-red-700 flex items-center gap-1 z-10"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload file</span>
                        <span className="text-xs text-gray-400">PNG, JPG, PDF, DOC (max 10MB)</span>
                      </>
                    )}
                  </div>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SECTION: Classification */}
            <div className="space-y-4">
              {!isCitizen && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Citizen Contact <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="tel"
                      required 
                      value={formData.mobileNumber}
                      onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Mobile Number"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Department</label>
                <select 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Department</option>
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
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Ticket...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function ComplaintCockpitBoard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [tempChanges, setTempChanges] = useState<Partial<Complaint>>({});
  const [commentText, setCommentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [activeFilters, setActiveFilters] = useState<{
    priority: string[];
    status: string[];
    department: string[];
    officer: string[];
    location: string[];
    dateRange: { start: string; end: string };
  }>({
    priority: [],
    status: [],
    department: [],
    officer: [],
    location: [],
    dateRange: { start: '', end: '' }
  });

  const { user } = useAuth();

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchComplaints();
    fetchOfficers();
  }, [user?.id]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (complaintId: string) => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaintById(complaintId);
      setComplaints(prev => prev.map(c => c.id === complaintId ? data : c));

    } catch (err) {
      console.error(err);
      showToast('Failed to load complaint details', 'error');
    } finally {
      setLoading(false);
    }
  };  

  const fetchComments = async (complaintId: string) => {
    setLoading(true);
    try {
      const data = await complaintService.getComments(complaintId);
      // Update the complaint's comments in state
      setComplaints(prev => prev.map(c => 
        c.complaintId?.toString() === complaintId 
          ? { ...c, comments: data }
          : c
      ));
    } catch (err) {
      console.error(err);
      showToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const officersList = await officerService.getAllOfficers();
      const approvedOfficers = officersList.filter((o) => o.isApproved);
      setFilteredOfficers(approvedOfficers);
    } catch (err) {
      console.error("Failed to fetch officers:", err);
    }
  };

  const handleNewTicketCreated = (newTicket: Complaint) => {
    setComplaints(prev => [newTicket, ...prev]);
    setIsCreateModalOpen(false);
  };

  const facets = useMemo(() => {
    const counts: {
      priority: Record<string, number>;
      status: Record<string, number>;
      department: Record<string, number>;
      officer: Record<string, number>;
      location: Record<string, number>;
    } = {
      priority: {},
      status: {},
      department: {},
      officer: {},
      location: {}
    };

    complaints.forEach(c => {
      counts.priority[c.priority] = (counts.priority[c.priority] || 0) + 1;
      counts.status[c.status] = (counts.status[c.status] || 0) + 1;
      
      const dept = c.assignedDepartment || 'Unassigned';
      counts.department[dept] = (counts.department[dept] || 0) + 1;

      const officerId = c.assignedToId || 'Unassigned';
      const officerName = filteredOfficers.find(o => o.id === officerId)?.name || 'Unassigned';
      counts.officer[officerName] = (counts.officer[officerName] || 0) + 1;

      const loc = c.location || 'Unknown';
      counts.location[loc] = (counts.location[loc] || 0) + 1;
    });
    return counts;
  }, [complaints, filteredOfficers]);

  const filteredData = useMemo(() => {
    return complaints.filter(item => {
      const matchesSearch = !searchQuery ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = activeFilters.priority.length === 0 || activeFilters.priority.includes(item.priority);
      const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(item.status);
      const matchesDept = activeFilters.department.length === 0 || activeFilters.department.includes(item.assignedDepartment || 'Unassigned');
      
      const officerName = filteredOfficers.find(o => o.id === item.assignedToId)?.name || 'Unassigned';
      const matchesOfficer = activeFilters.officer.length === 0 || activeFilters.officer.includes(officerName);

      const locationName = item.location || 'Unknown';
      const matchesLocation = activeFilters.location.length === 0 || activeFilters.location.includes(locationName);

      let matchesDate = true;
      if (activeFilters.dateRange.start) {
        matchesDate = matchesDate && new Date(item.createdAt) >= new Date(activeFilters.dateRange.start);
      }
      if (activeFilters.dateRange.end) {
        const endDate = new Date(activeFilters.dateRange.end);
        endDate.setHours(23, 59, 59);
        matchesDate = matchesDate && new Date(item.createdAt) <= endDate;
      }

      return matchesSearch && matchesPriority && matchesStatus && matchesDept && matchesOfficer && matchesLocation && matchesDate;
    });
  }, [complaints, searchQuery, activeFilters, filteredOfficers]);

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      critical: complaints.filter(c => c.priority === 'HIGH' || c.priority === 'URGENT').length,
      pending: complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length,
      today: complaints.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length
    };
  }, [complaints]);

  const toggleFilter = (category: keyof typeof activeFilters, value: string) => {
    setActiveFilters(prev => {
      const current = prev[category] as string[];
      const updated = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value }
    }));
  };

  const handleTempChange = (field: string, value: any) => {
    setTempChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleDrawerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTicket || !selectedTicket.complaintId) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file type. Please upload images, PDF, or Word documents', 'error');
      return;
    }

    setUploadingFile(true);
    setCommentText(`\n[Uploading file: ${file.name}]`);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('complaintId', selectedTicket.complaintId?.toString() || '');

      const getAttachmentType = (mimeType: string): "image" | "video" | "document" => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        return 'document';
      };

      // const newComment: ComplaintComment = {
      //   id: 'doc-' + Date.now(),
      //   complaintId: selectedTicket.complaintId?.toString() || '',
      //   commenterId: user?.id || '',
      //   commenterRole: user?.role || 'ADMIN',
      //   commenterName: user?.name || user?.email || 'Admin',
      //   text: commentText,
      //   createdAt: new Date().toISOString(),
      //   updatedAt: new Date().toISOString(),
      //   attachments: [{
      //     id: 'doc-' + Date.now(),
      //     commentId: 'doc-' + Date.now(),
      //     fileName: file.name,
      //     filePath: file.name,
      //     fileSize: file.size,
      //     mimeType: file.type,
      //     attachmentType: getAttachmentType(file.type),
      //     uploadedAt: new Date().toISOString()
      //   }]
      // };

      const updatedComment = await  complaintService.addComment(selectedTicket.complaintId.toString(), commentText, [file]);
      // if (updatedComment && updatedComment.id) {
      //   newComment.id = updatedComment.id;
      //   newComment.createdAt = updatedComment.createdAt;
      //   newComment.updatedAt = updatedComment.updatedAt;
      // }

      // setComplaints(prev => prev.map(c =>
      //   c.id === selectedTicketId
      //     ? { ...c, comments: [...(c.comments || []), newComment] }
      //     : c
      // ));
      showToast('File uploaded successfully', 'success');
      
      fetchTicketDetails(updatedComment.complaintId.toString());
      fetchComments(updatedComment.complaintId.toString());
    } catch (err) {
      console.error(err);
      showToast('Failed to upload file', 'error');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTicket || !selectedTicket.complaintId) {
      showToast('Please enter a comment', 'error');
      return;
    }

    setIsAddingComment(true);

    try {
      const newComment: ComplaintComment = {
        id: 'temp-' + Date.now(),
        complaintId: selectedTicket.complaintId.toString(),
        commenterId: user?.id || '',
        commenterRole: user?.role || 'ADMIN',
        commenterName: user?.name || user?.email || 'Admin',
        text: commentText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedComment = await  complaintService.addComment(selectedTicket.complaintId.toString(), commentText);
      if (updatedComment && updatedComment.id) {
        newComment.id = updatedComment.id;
        newComment.createdAt = updatedComment.createdAt;
        newComment.updatedAt = updatedComment.updatedAt;
      }

      setComplaints(prev => prev.map(c =>
        c.id === selectedTicketId
          ? { ...c, comments: [...(c.comments || []), newComment] }
          : c
      ));

      showToast('Comment added successfully', 'success');
      setCommentText('');
    } catch (err) {
      console.error(err);
      showToast('Failed to add comment', 'error');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedTicketId || !selectedTicket || !selectedTicket.complaintId) return;

    const isAdminRole = user?.role === 'DISTRICT_COMMISSIONER' || user?.role === 'ADMIN';
    const isAssignedOfficer = selectedTicket.assignedToId === user?.id;
    const canEdit = isAdminRole || isAssignedOfficer || (!selectedTicket.assignedToId && isAdminRole);

    if (!canEdit) {
      showToast("You don't have permission to edit this complaint", 'error');
      return;
    }

    setIsSaving(true);

    try {
      const currentData = { ...selectedTicket, ...tempChanges };

      const updateRequest = {
        complaintId: selectedTicket.complaintId, 
        subject: currentData.subject,
        description: currentData.description,
        location: currentData.location,
        priority: currentData.priority,
        status: currentData.status,
        assignedDepartment: currentData.assignedDepartment,
        assignedToId: currentData.assignedToId,
        
        ...(commentText.trim() && { actionRemarks: commentText }),

        ...(isAdminRole && 
           tempChanges.assignedDepartment && 
           tempChanges.assignedDepartment !== selectedTicket.assignedDepartment && {
            assignedDepartment: tempChanges.assignedDepartment,
            departmentRemarks: commentText || "Department reassigned by Admin",
        }),

        ...(tempChanges.assignedToId && 
           tempChanges.assignedToId !== selectedTicket.assignedToId && {
            assignedToId: tempChanges.assignedToId,
        }),
      };

      const updatedComplaint = await complaintService.updateComplaint(updateRequest);

      // setComplaints(prev => prev.map(c => 
      //   c.id === selectedTicketId 
      //     ? { 
      //         ...c, 
      //         ...updatedComplaint,
      //       } 
      //     : c
      // ));

      fetchTicketDetails(selectedTicketId);
      fetchComments(selectedTicket.complaintId.toString());

      showToast("Complaint updated successfully!", 'success');
      setTempChanges({});
      setCommentText('');

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as any)?.response?.data?.message || "Failed to update complaint";
      
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

const handleViewDocument = async (doc: any) => {
  if (!doc.filePath) return;
  const fileName = doc.filePath.split(/[\\/]/).pop();
  try {
    showToast('Opening document...', 'info');
    const response = await api.get(`/uploads/${fileName}`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/pdf' 
    });
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error("Error fetching document:", error);
    showToast('Failed to load document. You may not have permission.', 'error');
  }
};

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    const ticket = complaints.find(c => c.id === selectedTicketId);
    return { ...ticket, ...tempChanges };
  }, [complaints, selectedTicketId, tempChanges]);

  return (  
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">DO</div>
          <h1 className="font-semibold text-gray-800">Admin Console</h1>
        </div>
        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets by subject or ticket number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </header>

      <div className="px-6 py-4 grid grid-cols-5 gap-4 shrink-0">
        <MetricCard title="Total" value={stats.total} trend="All Tickets" type="neutral" />
        <MetricCard title="New" value={facets.status.CREATED || 0} trend="Unattended" type="warning" />
        <MetricCard title="In Progress" value={facets.status.IN_PROGRESS || 0} trend="Active" type="neutral" />
        <MetricCard title="Critical" value={stats.critical} trend="High/Urgent" type="danger" />
        <MetricCard title="Resolved" value={facets.status.RESOLVED || 0} trend="Completed" type="success" /> 
      </div>

      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-4 mt-2">
        
        {showFilters && (
          <aside className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Filters</h3>
              <button onClick={() => {
                setActiveFilters({ priority: [], status: [], department: [], officer: [], location: [], dateRange: { start: '', end: '' } });
                setSearchQuery('');
              }} className="text-xs text-blue-600 hover:text-blue-800">Reset</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" /> Date Range
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">From</label>
                    <input 
                      type="date" 
                      className="w-full text-xs p-2 border border-gray-200 rounded"
                      value={activeFilters.dateRange.start}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">To</label>
                    <input 
                      type="date" 
                      className="w-full text-xs p-2 border border-gray-200 rounded"
                      value={activeFilters.dateRange.end}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <hr className="border-gray-100" />

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Status</h4>
                {Object.keys(STATUS_CONFIG).map(key => (
                  <FacetedFilterCheckbox 
                    key={key} 
                    label={STATUS_CONFIG[key as keyof typeof STATUS_CONFIG].label} 
                    count={facets.status[key] || 0} 
                    checked={activeFilters.status.includes(key)} 
                    onChange={() => toggleFilter('status', key)} 
                  />
                ))}
              </div>
              
              <hr className="border-gray-100" />
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Department</h4>
                {Object.keys(facets.department).map(dept => (
                  <FacetedFilterCheckbox 
                    key={dept} 
                    label={dept} 
                    count={facets.department[dept]} 
                    checked={activeFilters.department.includes(dept)} 
                    onChange={() => toggleFilter('department', dept)} 
                  />
                ))}
              </div>

              <hr className="border-gray-100" />

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Officer</h4>
                {Object.keys(facets.officer).length === 0 ? (
                  <p className="text-xs text-gray-400">No data available</p>
                ) : (
                  Object.keys(facets.officer).map(officer => (
                    <FacetedFilterCheckbox 
                      key={officer} 
                      label={officer} 
                      count={facets.officer[officer]} 
                      checked={activeFilters.officer.includes(officer)} 
                      onChange={() => toggleFilter('officer', officer)} 
                    />
                  ))
                )}
              </div>

              <hr className="border-gray-100" />

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Location</h4>
                {Object.keys(facets.location).length === 0 ? (
                  <p className="text-xs text-gray-400">No data available</p>
                ) : (
                  Object.keys(facets.location).map(loc => (
                    <FacetedFilterCheckbox 
                      key={loc} 
                      label={loc} 
                      count={facets.location[loc]} 
                      checked={activeFilters.location.includes(loc)} 
                      onChange={() => toggleFilter('location', loc)} 
                    />
                  ))
                )}
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded hover:bg-gray-100 ${showFilters ? 'text-blue-600' : 'text-gray-400'}`}>
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500 font-medium pl-2 border-l border-gray-200">Showing {filteredData.length} tickets</span>
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
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[120px]">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map(complaint => (
                  <tr 
                    key={complaint.id} 
                    onClick={() => { 
                      setSelectedTicketId(complaint.id); 
                      // setCommentText(''); 
                      fetchTicketDetails(complaint.id);
                      fetchComments(complaint.complaintId?.toString() || '');
                      setTempChanges({}); 
                    }} 
                    className={`hover:bg-blue-50 cursor-pointer transition-colors group ${selectedTicketId === complaint.id ? 'bg-blue-50/60' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500 group-hover:text-blue-600 font-medium">
                        #{complaint.complaintNumber.slice(-6)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{complaint.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[complaint.status]?.color}`}>
                        {STATUS_CONFIG[complaint.status]?.label || complaint.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${PRIORITY_STYLES[complaint.priority]}`}>
                        {complaint.priority}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {complaint.assignedDepartment || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* --- EDIT COMPLAINT MODAL (Replaced Drawer) --- */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
              
              {/* MODAL HEADER */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-gray-50/80">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-bold text-gray-500">#{selectedTicket.complaintNumber}</span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${PRIORITY_STYLES[selectedTicket.priority || 'MEDIUM'].bg} ${PRIORITY_STYLES[selectedTicket.priority || 'MEDIUM'].text} ${PRIORITY_STYLES[selectedTicket.priority || 'MEDIUM'].border}`}>
                        {selectedTicket.priority || 'MEDIUM'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_CONFIG[selectedTicket.status || 'CREATED']?.color}`}>
                        {STATUS_CONFIG[selectedTicket.status || 'CREATED']?.label || selectedTicket.status}
                      </span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                      onClick={handleSaveChanges} 
                      disabled={isSaving}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-70 mr-2"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? 'Saving Changes' : 'Save Changes'}
                    </button>
                    <div className="h-8 w-px bg-gray-300 mx-2"></div>
                    <button onClick={() => setSelectedTicketId(null)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                </div>
              </div>

              {/* MODAL BODY (Grid Layout) */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* --- LEFT COLUMN: Main Details & Comments --- */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Description Card */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                    </div>

                    {/* Attributes Card */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                         <div>
                            <span className="text-xs text-gray-400 block mb-1">Location</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {selectedTicket.location || 'N/A'}
                            </div>
                         </div>
                         <div>
                            <span className="text-xs text-gray-400 block mb-1">Citizen Contact</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {(selectedTicket as any).mobileNumber || 'N/A'}
                            </div>
                         </div>
                         <div>
                            <span className="text-xs text-gray-400 block mb-1">Reported On</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'N/A'}
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* Attachments Card */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attachments</h3>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFile}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            {uploadingFile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Add File
                          </button>
                           <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleDrawerFileUpload}
                            accept="image/*,.pdf,.doc,.docx"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {(!selectedTicket.documents || selectedTicket.documents.length === 0) && (
                              <div className="col-span-full p-4 bg-gray-50 border border-dashed border-gray-200 rounded text-center text-xs text-gray-400">
                                No attachments found
                              </div>
                            )}
                            {selectedTicket.documents?.map((doc, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => handleViewDocument(doc)}
                                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg group hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
                              >
                                <div className="bg-blue-50 p-2 rounded text-blue-600">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
                                  <p className="text-[10px] text-gray-400">
                                    {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                              </div>
                            ))}
                        </div>
                    </div>

                    {/* Comments Card (Moved to Left Column) */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                           <MessageSquare className="w-4 h-4" /> Comments
                        </h3>
                        
                        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-1">
                             {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                                <div className="text-center py-8">
                                  <div className="bg-gray-50 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                                    <MessageSquare className="w-5 h-5 text-gray-300" />
                                  </div>
                                  <p className="text-xs text-gray-400">No comments yet</p>
                                </div>
                              )}
                             {selectedTicket.comments?.map((c, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0 border border-blue-200">
                                    {c.commenterName?.charAt(0).toUpperCase() || 'A'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-baseline mb-1">
                                      <span className="text-xs font-bold text-gray-900">{c.commenterName || 'Admin'}</span>
                                      <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-br-lg rounded-bl-lg rounded-tr-lg border border-gray-100">
                                      {c.text}
                                    </div>
                                  </div>
                                </div>
                              ))}
                        </div>

                        <div className="relative mt-2">
                          <textarea 
                            rows={3}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Type a note or comment..." 
                            className="w-full text-sm pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment();
                              }
                            }}
                          />
                          <button 
                            onClick={handleAddComment} 
                            disabled={isAddingComment || !commentText.trim()}
                            className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                            title="Add comment (Enter)"
                          >
                            {isAddingComment ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                    </div>
                  </div>

                  {/* --- RIGHT COLUMN: Administrative Controls Only --- */}
                  <div className="space-y-6">
                    
                    {/* Management Card */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-5 sticky top-6">
                       
                       <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Status</label>
                          <select 
                            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={tempChanges.status || selectedTicket.status}
                            onChange={(e) => handleTempChange('status', e.target.value)}
                          >
                            {Object.keys(STATUS_CONFIG).map(s => (
                              <option key={s} value={s}>{STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}</option>
                            ))}
                          </select>
                       </div>

                       <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Priority</label>
                           <select 
                            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={tempChanges.priority || selectedTicket.priority}
                            onChange={(e) => handleTempChange('priority', e.target.value)}
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                          </select>
                       </div>

                       <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Assigned Department</label>
                          <select 
                            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={tempChanges.assignedDepartment || selectedTicket.assignedDepartment || ''}
                            onChange={(e) => handleTempChange('assignedDepartment', e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {Object.entries(DEPARTMENT_NAMES).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                       </div>

                       <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Assigned Officer</label>
                          <select 
                            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={selectedTicket.assignedToId || ''}
                            onChange={(e) => handleTempChange('assignedToId', e.target.value)}
                          >
                            <option value="">Select Officer...</option>
                            {filteredOfficers.map(o => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                          </select>
                       </div>
                    </div>

                  </div>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateComplaintModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={handleNewTicketCreated} 
          user={user} 
          showToast={showToast} 
        />
      )}
    </div>
  );
}