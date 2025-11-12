import React from "react";
import { Meeting, Officer } from "../../types";
import { Calendar, Clock, User } from "lucide-react";

interface MeetingListProps {
  meetings: Meeting[];
  officers: Officer[];
  showActions?: boolean;
}

const MeetingList: React.FC<MeetingListProps> = ({
  meetings,
  officers,
  showActions = false,
}) => {
  const getOfficerName = (officerId: string): string => {
    const officer = officers.find((o) => o.id === officerId);
    return officer ? `${officer.name} (${officer.employeeId})` : officerId;
  };

  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isUpcoming = (dateTimeString: string): boolean => {
    return new Date(dateTimeString) > new Date();
  };

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No meetings found</div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className={`bg-white rounded-lg shadow-sm border ${
            isUpcoming(meeting.startDateTime)
              ? "border-blue-200"
              : "border-gray-200"
          } p-6 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {meeting.title}
              </h3>

              {meeting.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {meeting.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{formatDateTime(meeting.startDateTime)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    Duration: {formatDuration(meeting.durationMinutes)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">Invited Officers:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {meeting.invitedOfficerIds.map((officerId) => (
                    <span
                      key={officerId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {getOfficerName(officerId)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Created by: {getOfficerName(meeting.createdById)}
              </div>
            </div>

            {isUpcoming(meeting.startDateTime) && (
              <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Upcoming
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetingList;
