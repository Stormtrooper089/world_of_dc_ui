import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { meetingService } from "../services/meetingService";
import { officerService } from "../services/officerService";
import { Meeting, Officer } from "../types";
import MeetingList from "../components/meetings/MeetingList";
import CreateMeeting from "../components/meetings/CreateMeeting";
import { Calendar, Plus, Clock } from "lucide-react";

const MyMeetings: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (user?.id) {
      loadMeetings();
      loadOfficers();
    }
  }, [user?.id, filter]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      let meetingsData: Meeting[] = [];

      if (filter === "upcoming") {
        meetingsData = await meetingService.getUpcomingMeetings();
      } else if (filter === "past") {
        // Get all meetings and filter past ones
        const allMeetings = await meetingService.getMyMeetings();
        const now = new Date();
        meetingsData = allMeetings.filter(
          (m) => new Date(m.startDateTime) < now
        );
      } else {
        meetingsData = await meetingService.getMyMeetings();
      }

      setMeetings(meetingsData);
    } catch (error) {
      console.error("Error loading meetings:", error);
    } finally {
      setLoading(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            My Meetings
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all your meetings
          </p>
        </div>
        <button
          onClick={() => setIsCreateMeetingOpen(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Meeting
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Meetings
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "past"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No meetings found</p>
            <p className="text-gray-400 text-sm mb-4">
              {filter === "all"
                ? "You don't have any meetings yet."
                : filter === "upcoming"
                ? "You don't have any upcoming meetings."
                : "You don't have any past meetings."}
            </p>
            <button
              onClick={() => setIsCreateMeetingOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Meeting
            </button>
          </div>
        ) : (
          <MeetingList meetings={meetings} officers={officers} />
        )}
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

export default MyMeetings;
