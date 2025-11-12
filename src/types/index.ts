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
  aadharNumber?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
  CUSTOMER = "CUSTOMER",
  OFFICER = "OFFICER",
  DISTRICT_COMMISSIONER = "DISTRICT_COMMISSIONER",
  ADDITIONAL_DISTRICT_COMMISSIONER = "ADDITIONAL_DISTRICT_COMMISSIONER",
  BLOCK_DEVELOPMENT_OFFICER = "BLOCK_DEVELOPMENT_OFFICER",
  GRAM_PANCHAYAT_OFFICER = "GRAM_PANCHAYAT_OFFICER",
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
  designation: string;
  department: string;
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

export enum ComplaintCategory {
  WATER_SUPPLY = "WATER_SUPPLY",
  ELECTRICITY = "ELECTRICITY",
  ROADS_INFRASTRUCTURE = "ROADS_INFRASTRUCTURE",
  HEALTH_SERVICES = "HEALTH_SERVICES",
  EDUCATION = "EDUCATION",
  SANITATION = "SANITATION",
  PUBLIC_DISTRIBUTION_SYSTEM = "PUBLIC_DISTRIBUTION_SYSTEM",
  REVENUE_SERVICES = "REVENUE_SERVICES",
  POLICE_SERVICES = "POLICE_SERVICES",
  CORRUPTION = "CORRUPTION",
  ENVIRONMENTAL_ISSUES = "ENVIRONMENTAL_ISSUES",
  AGRICULTURE = "AGRICULTURE",
  PENSION_SERVICES = "PENSION_SERVICES",
  BIRTH_DEATH_CERTIFICATE = "BIRTH_DEATH_CERTIFICATE",
  OTHER = "OTHER",
}

export enum ComplaintStatus {
  CREATED = "CREATED",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED = "BLOCKED",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
  DUPLICATE = "DUPLICATE",
}

export enum ComplaintPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum Department {
  // Core Administrative Departments
  DISTRICT_ADMINISTRATION = "DISTRICT_ADMINISTRATION",
  REVENUE_DEPARTMENT = "REVENUE_DEPARTMENT",
  COLLECTORATE = "COLLECTORATE",

  // Infrastructure Departments
  PUBLIC_WORKS_DEPARTMENT = "PUBLIC_WORKS_DEPARTMENT",
  WATER_RESOURCES = "WATER_RESOURCES",
  ELECTRICITY_DEPARTMENT = "ELECTRICITY_DEPARTMENT",

  // Social Services
  HEALTH_DEPARTMENT = "HEALTH_DEPARTMENT",
  EDUCATION_DEPARTMENT = "EDUCATION_DEPARTMENT",
  SOCIAL_WELFARE = "SOCIAL_WELFARE",

  // Public Services
  POLICE_DEPARTMENT = "POLICE_DEPARTMENT",
  FIRE_SERVICES = "FIRE_SERVICES",
  TRANSPORT_DEPARTMENT = "TRANSPORT_DEPARTMENT",

  // Development and Planning
  RURAL_DEVELOPMENT = "RURAL_DEVELOPMENT",
  URBAN_DEVELOPMENT = "URBAN_DEVELOPMENT",
  AGRICULTURE_DEPARTMENT = "AGRICULTURE_DEPARTMENT",

  // Environmental and Utilities
  ENVIRONMENT_DEPARTMENT = "ENVIRONMENT_DEPARTMENT",
  SANITATION_DEPARTMENT = "SANITATION_DEPARTMENT",
  FOREST_DEPARTMENT = "FOREST_DEPARTMENT",

  // Specialized Services
  FOOD_AND_SUPPLIES = "FOOD_AND_SUPPLIES",
  LABOUR_DEPARTMENT = "LABOUR_DEPARTMENT",
  WOMEN_AND_CHILD_DEVELOPMENT = "WOMEN_AND_CHILD_DEVELOPMENT",

  // Technical Departments
  INFORMATION_TECHNOLOGY = "INFORMATION_TECHNOLOGY",
  STATISTICS_DEPARTMENT = "STATISTICS_DEPARTMENT",

  // Other
  OTHER = "OTHER",
  UNASSIGNED = "UNASSIGNED",
}

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

// Meeting Types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startDateTime: string;
  durationMinutes: number;
  createdById: string;
  invitedOfficerIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingCreateRequest {
  title: string;
  description?: string;
  startDateTime: string; // Local time format (YYYY-MM-DDTHH:mm:ss)
  durationMinutes: number;
  invitedOfficerIds: string[];
}
