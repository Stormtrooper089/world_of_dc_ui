import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Paperclip, Calendar, User, Plus, Filter, RefreshCw } from 'lucide-react';
import { complaintService } from "../services/complaintService";
import { Complaint, ComplaintStatus, UserRole, Officer } from "../types";
import { useAuth } from "../contexts/AuthContext";

const statusColumns = [
  { id: 'CREATED', title: 'Created', color: 'bg-blue-500' },
//   { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-500' },
//   { id: 'UNDER_REVIEW', title: 'Under Review', color: 'bg-purple-500' },
//   { id: 'RESOLVED', title: 'Resolved', color: 'bg-green-500' },
  { id: 'REJECTED', title: 'Rejected', color: 'bg-red-500' },
  { id: 'ASSIGNED', title: 'Assigned', color: 'bg-green-500' }
];

const priorityColors = {
  HIGH: 'bg-red-100 text-red-800 border-red-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-green-100 text-green-800 border-green-300'
};

const departmentNames = {
  WATER_RESOURCES: 'Water Resources',
  ELECTRICITY: 'Electricity',
  ROADS: 'Roads',
  SANITATION: 'Sanitation',
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education'
};

export default function ComplaintKanbanBoard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [draggedItem, setDraggedItem] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get unique assignees for filter
  const assignees = ['ALL', ...new Set(complaints
    .filter(c => c.assignedToId)
    .map(c => c.assignedToId))
  ];

  // Get unique departments for filter
  const departments = ['ALL', ...new Set(complaints
    .filter(c => c.assignedDepartment)
    .map(c => c.assignedDepartment))
  ];

  const filteredComplaints = complaints.filter(complaint => {
    const priorityMatch = filterPriority === 'ALL' || complaint.priority === filterPriority;
    const departmentMatch = filterDepartment === 'ALL' || complaint.assignedDepartment === filterDepartment;
    const assigneeMatch = filterAssignee === 'ALL' || complaint.assignedToId === filterAssignee;
    return priorityMatch && departmentMatch && assigneeMatch;
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

  const handleDragStart = (e: React.DragEvent, complaint: Complaint) => {
    setDraggedItem(complaint);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== newStatus) {
      try {
        // Update status via API
        await complaintService.updateComplaintStatus(draggedItem.id, newStatus as ComplaintStatus);
        
        // Update local state
        setComplaints(complaints.map(c => 
          c.id === draggedItem.id ? { ...c, status: newStatus } : c
        ));
        
        setDraggedItem(null);
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update complaint status");
      }
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedComplaint) return;

    try {
      // Add comment via API
      await complaintService.addComment(selectedComplaint.id, newComment);
      
      // Refresh the complaint data
      await fetchComplaints();
      
      // Update selected complaint
      const updatedComplaint = complaints.find(c => c.id === selectedComplaint.id);
      if (updatedComplaint) {
        setSelectedComplaint(updatedComplaint);
      }
      
      setNewComment('');
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedComplaint) return;

    try {
      // Upload files via API
      for (const file of Array.from(files)) {
        await complaintService.uploadDocument(selectedComplaint.id, file);
      }
      
      // Refresh complaints
      await fetchComplaints();
      
      // Update selected complaint
      const updatedComplaint = complaints.find(c => c.id === selectedComplaint.id);
      if (updatedComplaint) {
        setSelectedComplaint(updatedComplaint);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchComplaints}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Complaint Tracking Board</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Complaint
              </button>
              <button
                onClick={fetchComplaints}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
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
            </select>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departments.filter(d => d !== 'ALL').map(dept => (
                <option key={dept} value={dept}>
                  {departmentNames[dept as keyof typeof departmentNames] || dept}
                </option>
              ))}
            </select>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Assignees</option>
              {assignees.filter(a => a !== 'ALL').map(assignee => (
                <option key={assignee} value={assignee}>
                  {assignee === user?.id ? 'Me' : assignee}
                </option>
              ))}
            </select>

            {(filterPriority !== 'ALL' || filterDepartment !== 'ALL' || filterAssignee !== 'ALL') && (
              <button
                onClick={() => {
                  setFilterPriority('ALL');
                  setFilterDepartment('ALL');
                  setFilterAssignee('ALL');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Created: {filteredComplaints.filter(c => c.status === 'CREATED').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">In Progress: {filteredComplaints.filter(c => c.status === 'IN_PROGRESS').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Under Review: {filteredComplaints.filter(c => c.status === 'UNDER_REVIEW').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Resolved: {filteredComplaints.filter(c => c.status === 'RESOLVED').length}</span>
            </div>
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
              <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                {filteredComplaints
                  .filter(complaint => complaint.status === column.id)
                  .map(complaint => (
                    <div
                      key={complaint.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, complaint)}
                      onClick={() => setSelectedComplaint(complaint)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                            {complaint.subject || 'No Subject'}
                          </h4>
                          <p className="text-xs text-gray-500">{complaint.complaintNumber}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                      
                      {complaint.assignedDepartment && (
                        <div className="mb-2">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {departmentNames[complaint.assignedDepartment as keyof typeof departmentNames] || complaint.assignedDepartment}
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
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.subject || 'No Subject'}</h2>
                <p className="text-sm text-gray-500 mb-2">{selectedComplaint.complaintNumber}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium border ${priorityColors[selectedComplaint.priority as keyof typeof priorityColors]}`}>
                    {selectedComplaint.priority}
                  </span>
                  {selectedComplaint.assignedDepartment && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                      {departmentNames[selectedComplaint.assignedDepartment as keyof typeof departmentNames] || selectedComplaint.assignedDepartment}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Complaint Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Complaint Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700">{selectedComplaint.description}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Citizen ID</p>
                      <p className="text-sm font-medium">{selectedComplaint.citizenId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium">{selectedComplaint.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created By</p>
                      <p className="text-sm font-medium">{selectedComplaint.createdById}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created On</p>
                      <p className="text-sm font-medium">{formatDateTime(selectedComplaint.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Assigned To</p>
                      <p className="text-sm font-medium">{selectedComplaint.assignedToId || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium">{statusColumns.find(s => s.id === selectedComplaint.status)?.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium">{formatDateTime(selectedComplaint.updatedAt)}</p>
                    </div>
                    {selectedComplaint.assignedAt && (
                      <div>
                        <p className="text-xs text-gray-500">Assigned At</p>
                        <p className="text-sm font-medium">{formatDateTime(selectedComplaint.assignedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* History */}
              {selectedComplaint.history && selectedComplaint.history.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">History ({selectedComplaint.history.length})</h3>
                  <div className="space-y-2">
                    {selectedComplaint.history.map((historyItem: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{historyItem.newStatus}</span>
                          <span className="text-xs text-gray-500">{formatDateTime(historyItem.timestamp)}</span>
                        </div>
                        <p className="text-gray-600 text-xs">{historyItem.remarks}</p>
                        <p className="text-gray-500 text-xs mt-1">Officer: {historyItem.officerId}</p>
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
                    Upload File
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  {!selectedComplaint.documents || selectedComplaint.documents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No attachments yet</p>
                  ) : (
                    selectedComplaint.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.fileName || doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.fileSize || doc.size}</p>
                          </div>
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
                  {!selectedComplaint.comments || selectedComplaint.comments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No comments yet</p>
                  ) : (
                    selectedComplaint.comments.map((comment: any) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">{comment.officerId || comment.author}</span>
                              <span className="text-xs text-gray-500">{formatDateTime(comment.timestamp || comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.comment || comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
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

      {/* Create Complaint Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Complaint</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              This will navigate to the create complaint page or open your existing create complaint component.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  // Navigate to create complaint page
                  // window.location.href = '/create-complaint';
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Create Page
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}