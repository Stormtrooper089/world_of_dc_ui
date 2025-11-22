import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Paperclip, Calendar, User, Plus, Filter, RefreshCw, Search } from 'lucide-react';
import { complaintService } from "../services/complaintService";
import { Complaint, ComplaintStatus, UserRole, Officer, ComplaintPriority, Department } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from 'react-hook-form';


const statusColumns = [
  { id: 'CREATED', title: 'Created', color: 'bg-blue-500' },
//   { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-500' },
//   { id: 'UNDER_REVIEW', title: 'Under Review', color: 'bg-purple-500' },
//   { id: 'RESOLVED', title: 'Resolved', color: 'bg-green-500' },
{ id: 'ASSIGNED', title: 'Assigned', color: 'bg-green-500' },
  { id: 'REJECTED', title: 'Rejected', color: 'bg-red-500' }
  
];

const priorityColors = {
  HIGH: 'bg-red-100 text-red-800 border-red-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-green-100 text-green-800 border-green-300',
  URGENT: 'bg-orange-100 text-orange-800 border-orange-300'
};

const departmentNames = {
  WATER_RESOURCES: 'Water Resources',
  ELECTRICITY: 'Electricity',
  ROADS: 'Roads',
  SANITATION: 'Sanitation',
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education'
};

interface CreateComplaintData {
  subject: string;
  description: string;
  priority?: ComplaintPriority;
  location?: string;
  department?: Department;
  files?: FileList;
  mobileNumber?: string; // For citizen complaints
}

// Edit Complaint Modal Component
const EditComplaintModal = ({ complaint, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    subject: complaint.subject || '',
    description: complaint.description || '',
    priority: complaint.priority || 'MEDIUM',
    status: complaint.status || 'CREATED',
    location: complaint.location || '',
    assignedDepartment: complaint.assignedDepartment || '',
    assignedToId: complaint.assignedToId || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const isDistrictCommissioner = user.role === UserRole.DISTRICT_COMMISSIONER;
  const canEdit = isDistrictCommissioner || 
                  complaint.createdById === user.id || 
                  complaint.assignedToId === user.id;

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600">You don't have permission to edit this complaint.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const updatedComplaint = {
        ...complaint,
        ...formData,
        updatedAt: new Date().toISOString(),
        history: [
          ...complaint.history,
          {
            officerId: user.id,
            newStatus: formData.status,
            remarks: `Complaint updated by ${user.name}`,
            timestamp: new Date().toISOString()
          }
        ]
      };

      setIsSubmitting(false);
      onUpdate(updatedComplaint);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Complaint</h2>
            <p className="text-sm text-gray-500 mt-1">{complaint.complaintNumber}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusColumns.map(status => (
                  <option key={status.id} value={status.id}>{status.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={formData.assignedDepartment}
              onChange={(e) => setFormData({ ...formData, assignedDepartment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {Object.entries(departmentNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To (Officer ID)
            </label>
            <input
              type="text"
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter officer ID"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changing the status will automatically update the complaint history.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Complaint Form Component
const CreateComplaintForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM',
    location: '',
    department: '',
    mobileNumber: '9876543210'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const isCitizen = user.role === 'CUSTOMER';
  const [submitMessage, setSubmitMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  try {
    // Convert formData object to FormData instance
    const formDataToSend = new FormData();
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('priority', formData.priority);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('mobileNumber', formData.mobileNumber);

    const response = await complaintService.createComplaint(formDataToSend);

      if (response.success) {
        setSubmitMessage(
          `Complaint created successfully! Complaint Number: ${response.data.complaintNumber}`
        );
        // reset();
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000); // Wait 2 seconds to show success message
        }
      } else {
        setError(response.message || "Failed to create complaint");
      }
    } catch (err: any) {
      console.error("Error creating complaint:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create complaint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Complaint</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isCitizen && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Citizen Mobile Number *
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                pattern="[6-9]\d{9}"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {!isCitizen && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isCitizen && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department (optional)</option>
                {Object.entries(departmentNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
export default function ComplaintKanbanBoard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const departments = ['ALL', ...new Set(complaints
    .filter(c => c.assignedDepartment)
    .map(c => c.assignedDepartment))
  ];

  // Enhanced filtering with search
  const filteredComplaints = complaints.filter(complaint => {
    const priorityMatch = filterPriority === 'ALL' || complaint.priority === filterPriority;
    const departmentMatch = filterDepartment === 'ALL' || complaint.assignedDepartment === filterDepartment;
    
    const searchMatch = !searchQuery || 
      complaint.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.citizenId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return priorityMatch && departmentMatch && searchMatch;
  });

  
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
      console.log("====complaint data ====", data);
    } catch (err: any) {
      console.error("Error fetching complaints:", err);
      setError(err.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchComplaints();
    }
  }, [user?.id]);

  const handleDragStart = (e, complaint) => {
    setDraggedItem(complaint);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== newStatus) {
      // Update complaint status
      setComplaints(complaints.map(c => 
        c.id === draggedItem.id 
          ? { 
              ...c, 
              status: newStatus,
              updatedAt: new Date().toISOString(),
              history: [
                ...c.history,
                {
                  officerId: user.id,
                  newStatus: newStatus,
                  remarks: `Status changed to ${statusColumns.find(s => s.id === newStatus)?.title}`,
                  timestamp: new Date().toISOString()
                }
              ]
            } 
          : c
      ));
      
      // Update selected complaint if it's the one being dragged
      if (selectedComplaint?.id === draggedItem.id) {
        setSelectedComplaint({
          ...draggedItem,
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      }
      
      setDraggedItem(null);
    }
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedComplaint) return;

    const newCommentObj = {
      id: Date.now().toString(),
      officerId: user.id,
      comment: newComment,
      timestamp: new Date().toISOString()
    };

    setComplaints(complaints.map(c => 
      c.id === selectedComplaint.id 
        ? { ...c, comments: [...c.comments, newCommentObj], updatedAt: new Date().toISOString() }
        : c
    ));

    setSelectedComplaint({
      ...selectedComplaint,
      comments: [...selectedComplaint.comments, newCommentObj]
    });

    setNewComment('');
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedComplaint) return;

    const newDocuments = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      uploadedAt: new Date().toISOString()
    }));

    setComplaints(complaints.map(c => 
      c.id === selectedComplaint.id 
        ? { ...c, documents: [...c.documents, ...newDocuments], updatedAt: new Date().toISOString() }
        : c
    ));

    setSelectedComplaint({
      ...selectedComplaint,
      documents: [...selectedComplaint.documents, ...newDocuments]
    });
  };

  const handleCreateSuccess = (newComplaint) => {
    setComplaints([newComplaint, ...complaints]);
    setShowCreateModal(false);
    alert(`Complaint created successfully! Number: ${newComplaint.complaintNumber}`);
  };

  const handleEditComplaint = (complaint) => {
    setEditingComplaint(complaint);
    setShowEditModal(true);
    setSelectedComplaint(null); // Close detail modal when opening edit
  };

  const handleComplaintUpdate = (updatedComplaint) => {
    setComplaints(complaints.map(c => 
      c.id === updatedComplaint.id ? updatedComplaint : c
    ));
    
    // Update selected complaint if it's being viewed
    if (selectedComplaint?.id === updatedComplaint.id) {
      setSelectedComplaint(updatedComplaint);
    }
    
    setShowEditModal(false);
    setEditingComplaint(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingComplaint(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">DC Office Complaint Tracking Board</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Complaint
              </button>
              <button
                onClick={() => setComplaints([...complaints])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by complaint number, subject, description, location, or citizen ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
              <option value="URGENT">Urgent</option>
            </select>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departments.filter(d => d !== 'ALL').map(dept => (
                <option key={dept} value={dept}>
                  {departmentNames[dept] || dept}
                </option>
              ))}
            </select>

            {(filterPriority !== 'ALL' || filterDepartment !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterPriority('ALL');
                  setFilterDepartment('ALL');
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-md">
            {statusColumns.map(status => (
              <div key={status.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${status.color} rounded`}></div>
                <span className="text-gray-600">
                  {status.title}: {filteredComplaints.filter(c => c.status === status.id).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {statusColumns.map(column => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-gray-100 rounded-lg"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`${column.color} text-white px-4 py-3 rounded-t-lg flex items-center justify-between`}>
                <h3 className="font-semibold">{column.title}</h3>
                <span className="bg-white bg-opacity-30 px-2 py-1 rounded text-sm">
                  {filteredComplaints.filter(c => c.status === column.id).length}
                </span>
              </div>
              <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                {filteredComplaints
                  .filter(complaint => complaint.status === column.id)
                  .map(complaint => (
                    <div
                      key={complaint.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, complaint)}
                      onClick={() => setSelectedComplaint(complaint)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                            {complaint.subject}
                          </h4>
                          <p className="text-xs text-gray-500">{complaint.complaintNumber}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[complaint.priority]}`}>
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                      
                      {complaint.assignedDepartment && (
                        <div className="mb-2">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {departmentNames[complaint.assignedDepartment]}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(complaint.createdAt)}
                        </div>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {complaint.comments?.length || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {complaint.documents?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-6 border-b">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.subject}</h2>
                <p className="text-sm text-gray-500 mb-2">{selectedComplaint.complaintNumber}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium border ${priorityColors[selectedComplaint.priority]}`}>
                    {selectedComplaint.priority}
                  </span>
                  {selectedComplaint.assignedDepartment && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                      {departmentNames[selectedComplaint.assignedDepartment]}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEditComplaint(selectedComplaint)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Complaint Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700">{selectedComplaint.description}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium">{statusColumns.find(s => s.id === selectedComplaint.status)?.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium">{selectedComplaint.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium">{formatDateTime(selectedComplaint.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium">{formatDateTime(selectedComplaint.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* History */}
              {selectedComplaint.history?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">History</h3>
                  <div className="space-y-2">
                    {selectedComplaint.history.map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{item.newStatus}</span>
                          <span className="text-xs text-gray-500">{formatDateTime(item.timestamp)}</span>
                        </div>
                        <p className="text-gray-600 text-xs">{item.remarks}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Attachments ({selectedComplaint.documents?.length || 0})</h3>
                  <label className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Upload
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <div className="space-y-2">
                  {selectedComplaint.documents?.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No attachments</p>
                  ) : (
                    selectedComplaint.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">{doc.fileSize}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Comments ({selectedComplaint.comments?.length || 0})</h3>
                <div className="space-y-3 mb-4">
                  {selectedComplaint.comments?.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No comments</p>
                  ) : (
                    selectedComplaint.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">{comment.officerId}</span>
                              <span className="text-xs text-gray-500">{formatDateTime(comment.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <CreateComplaintForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Complaint Modal */}
      {showEditModal && editingComplaint && (
        <EditComplaintModal
          complaint={editingComplaint}
          onClose={handleCloseEditModal}
          onUpdate={handleComplaintUpdate}
        />
      )}
    </div>
  );
}
