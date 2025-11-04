import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { complaintService } from "../../services/complaintService";
import { officerService } from "../../services/officerService";
import { Complaint, ComplaintStatus, UserRole, Officer } from "../../types";
import ComplaintEditModal from "./ComplaintEditModal";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";

const MyComplaints: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | "ALL">(
    "ALL"
  );
  const [officers, setOfficers] = useState<Officer[]>([]);

  // Edit modal state
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if user is DISTRICT_COMMISSIONER
  const isDistrictCommissioner = user?.role === UserRole.DISTRICT_COMMISSIONER;

  useEffect(() => {
    if (user?.id) {
      fetchComplaints();
      fetchOfficers();
    }
  }, [user?.id]);

  const fetchOfficers = async () => {
    try {
      const officersList = await officerService.getAllOfficers();
      setOfficers(officersList);
    } catch (err) {
      console.error("Failed to fetch officers:", err);
    }
  };

  const getOfficerName = (officerId: string): string => {
    const officer = officers.find((o) => o.id === officerId);
    return officer ? `${officer.name} (${officer.employeeId})` : officerId;
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (err: any) {
      console.error("Error fetching complaints:", err);
      setError(err.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const statusMatch =
      filterStatus === "ALL" || complaint.status === filterStatus;
    return statusMatch;
  });

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.CREATED:
        return "bg-blue-50 text-blue-800";
      case ComplaintStatus.ASSIGNED:
        return "bg-sky-50 text-sky-800";
      case ComplaintStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case ComplaintStatus.BLOCKED:
        return "bg-red-50 text-red-800";
      case ComplaintStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      case ComplaintStatus.REJECTED:
        return "bg-rose-50 text-rose-800";
      case ComplaintStatus.DUPLICATE:
        return "bg-slate-50 text-slate-800";
      case ComplaintStatus.CLOSED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditComplaint = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setIsEditModalOpen(true);
  };

  const handleComplaintUpdate = (updatedComplaint: Complaint) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === updatedComplaint.id ? updatedComplaint : complaint
      )
    );
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingComplaint(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isDistrictCommissioner ? "All Complaints" : "My Complaints"}
              </h1>
              {isDistrictCommissioner && (
                <p className="text-sm text-gray-600 mt-1">
                  As District Commissioner, you can view all complaints in the
                  system
                </p>
              )}
            </div>
            <button
              onClick={fetchComplaints}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as ComplaintStatus | "ALL")
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value={ComplaintStatus.CREATED}>Created</option>
                <option value={ComplaintStatus.ASSIGNED}>Assigned</option>
                <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                <option value={ComplaintStatus.BLOCKED}>Blocked</option>
                <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                <option value={ComplaintStatus.CLOSED}>Closed</option>
              </select>
            </div>
          </div>

          {/* Complaints List */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">No complaints found</div>
              <div className="text-gray-400 text-sm mt-2">
                {complaints.length === 0
                  ? isDistrictCommissioner
                    ? "No complaints have been submitted to the system yet."
                    : "You haven't created any complaints yet."
                  : "No complaints match the current filters."}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.complaintId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    navigate(`/dashboard/complaints/${complaint.id}`)
                  }
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {complaint.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Complaint #{complaint.complaintNumber}
                      </p>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {complaint.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status.replace("_", " ")}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority}
                        </span>
                      </div>
                      {(isDistrictCommissioner ||
                        complaint.createdById === user?.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditComplaint(complaint);
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {complaint.location && (
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {complaint.location}
                      </div>
                    )}
                    {complaint.assignedDepartment &&
                      complaint.assignedDepartment !== "UNASSIGNED" && (
                        <div>
                          <span className="font-medium">Department:</span>{" "}
                          {getDepartmentDisplayName(
                            complaint.assignedDepartment
                          )}
                        </div>
                      )}
                    {/* Percentage-based progress removed */}
                    {complaint.assignedToId && (
                      <div>
                        <span className="font-medium">Assigned To:</span>{" "}
                        {getOfficerName(complaint.assignedToId)}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(complaint.createdAt)}
                    </div>
                    {complaint.updatedAt !== complaint.createdAt && (
                      <div>
                        <span className="font-medium">Updated:</span>{" "}
                        {formatDate(complaint.updatedAt)}
                      </div>
                    )}
                  </div>

                  {complaint.documents && complaint.documents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Attachments:</span>{" "}
                        {complaint.documents.length} file(s)
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {complaints.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {isDistrictCommissioner ? (
                    <>
                      Showing {filteredComplaints.length} of {complaints.length}{" "}
                      total complaints in the system
                    </>
                  ) : (
                    <>
                      Showing {filteredComplaints.length} of {complaints.length}{" "}
                      complaints
                    </>
                  )}
                </div>
                {isDistrictCommissioner && (
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      District Commissioner View
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingComplaint && (
        <ComplaintEditModal
          complaint={editingComplaint}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdate={handleComplaintUpdate}
        />
      )}
    </div>
  );
};

export default MyComplaints;
