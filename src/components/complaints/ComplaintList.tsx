import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Complaint } from "../../types";
import { complaintService } from "../../services/complaintService";
import ComplaintCard from "./ComplaintCard";
import { Search, Filter, Plus } from "lucide-react";

const ComplaintList: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      // Check if we're in public context
      const isPublic = !window.location.pathname.includes("/dashboard");

      if (isPublic) {
        // For public view, get all complaints
        const allComplaints = await complaintService.getAllComplaints();
        setComplaints(Array.isArray(allComplaints) ? allComplaints : []);
      } else {
        // For dashboard, use paginated response
        const response = await complaintService.getComplaints(1, 100);
        setComplaints(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError("Failed to load complaints. Please try again.");
      console.error("Error loading complaints:", err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadComplaints();
      return;
    }
    // Search is handled by filteredComplaints, no need for separate API call
  };

  const handleView = (complaint: Complaint) => {
    // Check if we're in a public context (not in dashboard)
    const isPublic = !window.location.pathname.includes("/dashboard");
    if (isPublic) {
      // For public view, navigate to a public complaint detail or show info
      navigate(`/complaints/${complaint.id}`);
    } else {
      navigate(`/dashboard/complaints/${complaint.id}`);
    }
  };

  const handleEdit = (complaint: Complaint) => {
    // TODO: Navigate to edit complaint page
    console.log("Edit complaint:", complaint);
  };

  const handleDelete = async (complaint: Complaint) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await complaintService.deleteComplaint(complaint.id);
        setComplaints(complaints.filter((c) => c.id !== complaint.id));
      } catch (err: any) {
        setError("Failed to delete complaint. Please try again.");
        console.error("Error deleting complaint:", err);
      }
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      !searchTerm.trim() ||
      complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || complaint.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {window.location.pathname.includes("/dashboard")
              ? "Citizen Complaints"
              : "Public Complaints"}
          </h1>
          <p className="text-gray-600">
            {window.location.pathname.includes("/dashboard")
              ? "Manage and track complaints from citizens across all departments"
              : "View complaints from citizens across all departments"}
          </p>
        </div>
        {window.location.pathname.includes("/dashboard") && (
          <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Plus className="h-4 w-4 mr-2" />
            Assign to Department
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search citizen complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Complaints Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No citizen complaints found.</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onView={handleView}
              onDelete={
                window.location.pathname.includes("/dashboard")
                  ? handleDelete
                  : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
