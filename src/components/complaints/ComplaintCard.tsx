import React from "react";
import { Complaint } from "../../types";
import { ComplaintStatus, ComplaintPriority } from "../../constants/enums";
import {
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from "lucide-react";

interface ComplaintCardProps {
  complaint: Complaint;
  onView?: (complaint: Complaint) => void;
  onEdit?: (complaint: Complaint) => void;
  onDelete?: (complaint: Complaint) => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.CREATED:
        return "bg-blue-100 text-blue-800";
      case ComplaintStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case ComplaintStatus.ASSIGNED:
        return "bg-indigo-100 text-indigo-800";
      case ComplaintStatus.BLOCKED:
        return "bg-orange-100 text-orange-800";
      case ComplaintStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      case ComplaintStatus.CLOSED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.URGENT:
        return "bg-red-100 text-red-800";
      case ComplaintPriority.HIGH:
        return "bg-orange-100 text-orange-800";
      case ComplaintPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case ComplaintPriority.LOW:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.CREATED:
        return <Clock className="h-4 w-4" />;
      case ComplaintStatus.ASSIGNED:
        return <Clock className="h-4 w-4" />;
      case ComplaintStatus.IN_PROGRESS:
        return <AlertCircle className="h-4 w-4" />;
      case ComplaintStatus.BLOCKED:
        return <AlertCircle className="h-4 w-4" />;
      case ComplaintStatus.RESOLVED:
        return <CheckCircle className="h-4 w-4" />;
      case ComplaintStatus.CLOSED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView?.(complaint)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {complaint.subject}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                complaint.status
              )}`}
            >
              {getStatusIcon(complaint.status)}
              <span className="ml-1">{complaint.status}</span>
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                complaint.priority
              )}`}
            >
              {complaint.priority}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {complaint.description}
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>ID: {complaint.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
