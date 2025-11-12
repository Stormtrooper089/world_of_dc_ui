import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Plus,
} from "lucide-react";
import { Complaint, ComplaintStatus, Meeting, Officer } from "../types";
import { complaintService } from "../services/complaintService";
import { meetingService } from "../services/meetingService";
import { officerService } from "../services/officerService";
import CreateMeeting from "../components/meetings/CreateMeeting";
import MeetingList from "../components/meetings/MeetingList";

const Dashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  useEffect(() => {
    loadComplaints();
    loadMeetings();
    loadOfficers();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getComplaints(1, 10);
      setComplaints(response.data);

      // Calculate stats
      const total = response.data.length;
      const open = response.data.filter(
        (c) => c.status === ComplaintStatus.OPEN
      ).length;
      const inProgress = response.data.filter(
        (c) => c.status === ComplaintStatus.IN_PROGRESS
      ).length;
      const resolved = response.data.filter(
        (c) => c.status === ComplaintStatus.RESOLVED
      ).length;
      const closed = response.data.filter(
        (c) => c.status === ComplaintStatus.CLOSED
      ).length;

      setStats({ total, open, inProgress, resolved, closed });
    } catch (error) {
      console.error("Error loading complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      const meetingsData = await meetingService.getAllMeetings();
      setMeetings(meetingsData.slice(0, 5)); // Show only recent 5 meetings
    } catch (error) {
      console.error("Error loading meetings:", error);
    }
  };

  const loadOfficers = async () => {
    try {
      const officersData = await officerService.getAllOfficers();
      setOfficers(officersData);
    } catch (error) {
      console.error("Error loading officers:", error);
    }
  };

  const handleMeetingCreated = () => {
    loadMeetings();
  };

  const statCards = [
    {
      name: "Total Complaints",
      value: stats.total,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Open",
      value: stats.open,
      icon: AlertCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      name: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  const recentComplaints = complaints.slice(0, 5);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Monitor and manage citizen complaints across all departments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Citizen Complaints
            </h3>
          </div>
          <div className="p-6">
            {recentComplaints.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No citizen complaints yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {complaint.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.status === ComplaintStatus.OPEN
                            ? "bg-green-100 text-green-800"
                            : complaint.status === ComplaintStatus.IN_PROGRESS
                            ? "bg-yellow-100 text-yellow-800"
                            : complaint.status === ComplaintStatus.RESOLVED
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FileText className="h-4 w-4 mr-2" />
                View All Complaints
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Users className="h-4 w-4 mr-2" />
                Manage Departments
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Meetings
          </h3>
          <button
            onClick={() => setIsCreateMeetingOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Meeting
          </button>
        </div>
        <div className="p-6">
          {meetings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No meetings scheduled yet
            </p>
          ) : (
            <MeetingList meetings={meetings} officers={officers} />
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      <CreateMeeting
        isOpen={isCreateMeetingOpen}
        onClose={() => setIsCreateMeetingOpen(false)}
        onSuccess={handleMeetingCreated}
      />
    </div>
  );
};

export default Dashboard;
