// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  OFFICER = 'OFFICER',
  DISTRICT_COMMISSIONER = 'DISTRICT_COMMISSIONER',
  ADDITIONAL_DISTRICT_COMMISSIONER = 'ADDITIONAL_DISTRICT_COMMISSIONER',
  BLOCK_DEVELOPMENT_OFFICER = 'BLOCK_DEVELOPMENT_OFFICER',
  GRAM_PANCHAYAT_OFFICER = 'GRAM_PANCHAYAT_OFFICER'
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
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

export enum ComplaintCategory {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  PUBLIC_SERVICES = 'PUBLIC_SERVICES',
  ENVIRONMENT = 'ENVIRONMENT',
  SAFETY = 'SAFETY',
  TRANSPORTATION = 'TRANSPORTATION',
  UTILITIES = 'UTILITIES',
  GENERAL = 'GENERAL'
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface CreateComplaintData {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
}

export interface UpdateComplaintData {
  title?: string;
  description?: string;
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  assignedTo?: string;
}

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
