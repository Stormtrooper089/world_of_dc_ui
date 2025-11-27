import { ComplaintPriority, ComplaintStatus, Department, UserRole } from "../constants/enums";

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  mobileNumber?: string; // For citizens
  createdAt: string;
  updatedAt: string;
}

export interface Citizen {
  id: string;
  mobileNumber: string;
  name: string;
  email?: string;
  address?: string;
  pincode?: string;
  aadharNumber?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenUpdateData {
  name: string;
  email?: string;
  address?: string;
  pincode?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OfficerLoginCredentials {
  employeeId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Registration and OTP types for citizen signup flow

export interface RegisterData {
  mobileNumber: string;
  name: string;
  email?: string;
  address?: string;
  aadharNumber?: string;
}

// Officer types
export interface OfficerSignupData {
  employeeId: string;
  name: string;
  email: string;
  mobileNumber: string;
  designation: string;
  department: string;
  role: string;
  password: string;
}

export interface Officer {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  mobileNumber: string;
  designation: string;
  department: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfficerUpdateData {
  name: string;
  email: string;
  mobileNumber: string;
  designation: import("../constants/enums").Designation;
  department: import("../constants/enums").Department;
}

// Complaint Types
export interface Complaint {
  id: string;
  complaintId: number;
  complaintNumber: string;
  citizenId: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  location?: string;

  // Department assignment
  assignedDepartment?: Department;
  departmentRemarks?: string;

  // Officer assignment
  assignedToId?: string;
  assignedById?: string;
  assignmentRemarks?: string;
  assignedAt?: string;

  // Comments
  comments?: Comment[];

  // Creator tracking
  createdById?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  closedAt?: string;

  // Related data
  documents?: ComplaintDocument[];
  history?: ComplaintHistory[];
}

export interface ComplaintDocument {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ComplaintHistory {
  id: string;
  complaintNumber: string;
  status: ComplaintStatus;
  remarks?: string;
  updatedBy: string;
  updatedAt: string;
}

// Enums are now imported from constants/enums.ts

export interface CreateComplaintData {
  mobileNumber: string;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  location?: string;
  files?: FileList;
}

export interface UpdateComplaintData {
  subject?: string;
  description?: string;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  assignedToId?: string;
  assignmentRemarks?: string;
}

export interface ComplaintUpdateRequest {
  complaintId: number;
  subject?: string;
  description?: string;
  location?: string;
  priority?: ComplaintPriority;
  status?: ComplaintStatus;
  assignedDepartment?: Department;
  departmentRemarks?: string;
  assignedToId?: string; // Officer ID to assign/reassign the complaint to
}

export interface ComplaintDepartmentAssignmentRequest {
  complaintId: number;
  department: Department;
  assignmentRemarks: string;
}

// Comment Types
export interface Comment {
  id: string;
  complaintId: string;
  commenterId: string;
  commenterName?: string;
  commenterRole: string;
  text: string;
  attachments?: CommentAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentAttachment {
  id: string;
  commentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  attachmentType: "image" | "video" | "document";
  uploadedAt: string;
}

export interface CommentUpdateRequest {
  commentId: string;
  text: string;
}

// Removed percentage-based progress updates; use ComplaintUpdateRequest with progressNotes

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
