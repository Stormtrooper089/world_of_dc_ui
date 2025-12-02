// Centralized enums - source of truth for all application enums
// These should be kept in sync with backend enums

export enum UserRole {
  CITIZEN = "CITIZEN",
  ADMIN = "ADMIN",
  DISTRICT_COMMISSIONER = "DISTRICT_COMMISSIONER",
  ADDITIONAL_DISTRICT_COMMISSIONER = "ADDITIONAL_DISTRICT_COMMISSIONER",
  ASSISTANT_DISTRICT_COMMISSIONER = "ASSISTANT_DISTRICT_COMMISSIONER",
  ASSISTANT_COMMISSIONER = "ASSISTANT_COMMISSIONER",
  CIRCLE_OFFICER = "CIRCLE_OFFICER",
  BLOCK_DEVELOPMENT_OFFICER = "BLOCK_DEVELOPMENT_OFFICER",
  GRAM_PANCHAYAT_OFFICER = "GRAM_PANCHAYAT_OFFICER",
  TEHSILDAR = "TEHSILDAR",
  SUB_DIVISIONAL_OFFICER = "SUB_DIVISIONAL_OFFICER",
  POLICE_OFFICER = "POLICE_OFFICER",
  HEALTH_OFFICER = "HEALTH_OFFICER",
  EDUCATION_OFFICER = "EDUCATION_OFFICER",
  REVENUE_OFFICER = "REVENUE_OFFICER",
  AGRICULTURE_OFFICER = "AGRICULTURE_OFFICER",
  PUBLIC_WORKS_OFFICER = "PUBLIC_WORKS_OFFICER",
  PWD_OFFICER = "PWD_OFFICER",
  OFFICER = "OFFICER",
  OTHER = "OTHER",
}

export enum Designation {
  DISTRICT_COLLECTOR = "DISTRICT_COLLECTOR",
  ADDITIONAL_DISTRICT_COLLECTOR = "ADDITIONAL_DISTRICT_COLLECTOR",
  DISTRICT_MAGISTRATE = "DISTRICT_MAGISTRATE",
  DISTRICT_COMMISSIONER = "DISTRICT_COMMISSIONER",
  BLOCK_DEVELOPMENT_OFFICER = "BLOCK_DEVELOPMENT_OFFICER",
  TEHSILDAR = "TEHSILDAR",
  SUB_DIVISIONAL_OFFICER = "SUB_DIVISIONAL_OFFICER",
  POLICE_SUPERINTENDENT = "POLICE_SUPERINTENDENT",
  HEALTH_OFFICER = "HEALTH_OFFICER",
  EDUCATION_OFFICER = "EDUCATION_OFFICER",
  AGRICULTURE_OFFICER = "AGRICULTURE_OFFICER",
  PUBLIC_WORKS_OFFICER = "PUBLIC_WORKS_OFFICER",
  REVENUE_OFFICER = "REVENUE_OFFICER",
  GRAM_PANCHAYAT_OFFICER = "GRAM_PANCHAYAT_OFFICER",
  POLICE_INSPECTOR = "POLICE_INSPECTOR",
  MEDICAL_OFFICER = "MEDICAL_OFFICER",
  TEACHER = "TEACHER",
  CLERK = "CLERK",
  ASSISTANT = "ASSISTANT",
  JUNIOR_ASSISTANT = "JUNIOR_ASSISTANT",
  OTHER = "OTHER",
}

export enum Department {
  DISTRICT_ADMINISTRATION = "DISTRICT_ADMINISTRATION",
  REVENUE_DEPARTMENT = "REVENUE_DEPARTMENT",
  COLLECTORATE = "COLLECTORATE",
  PUBLIC_WORKS_DEPARTMENT = "PUBLIC_WORKS_DEPARTMENT",
  WATER_RESOURCES = "WATER_RESOURCES",
  ELECTRICITY_DEPARTMENT = "ELECTRICITY_DEPARTMENT",
  HEALTH_DEPARTMENT = "HEALTH_DEPARTMENT",
  EDUCATION_DEPARTMENT = "EDUCATION_DEPARTMENT",
  SOCIAL_WELFARE = "SOCIAL_WELFARE",
  POLICE_DEPARTMENT = "POLICE_DEPARTMENT",
  FIRE_SERVICES = "FIRE_SERVICES",
  TRANSPORT_DEPARTMENT = "TRANSPORT_DEPARTMENT",
  RURAL_DEVELOPMENT = "RURAL_DEVELOPMENT",
  URBAN_DEVELOPMENT = "URBAN_DEVELOPMENT",
  AGRICULTURE_DEPARTMENT = "AGRICULTURE_DEPARTMENT",
  ENVIRONMENT_DEPARTMENT = "ENVIRONMENT_DEPARTMENT",
  SANITATION_DEPARTMENT = "SANITATION_DEPARTMENT",
  FOREST_DEPARTMENT = "FOREST_DEPARTMENT",
  FOOD_AND_SUPPLIES = "FOOD_AND_SUPPLIES",
  LABOUR_DEPARTMENT = "LABOUR_DEPARTMENT",
  WOMEN_AND_CHILD_DEVELOPMENT = "WOMEN_AND_CHILD_DEVELOPMENT",
  INFORMATION_TECHNOLOGY = "INFORMATION_TECHNOLOGY",
  STATISTICS_DEPARTMENT = "STATISTICS_DEPARTMENT",
  OTHER = "OTHER",
  UNASSIGNED = "UNASSIGNED",
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

// Helper functions for getting display names
export const getDesignationLabel = (designation: Designation): string => {
  const labels: Record<Designation, string> = {
    [Designation.DISTRICT_COLLECTOR]: "District Collector",
    [Designation.ADDITIONAL_DISTRICT_COLLECTOR]:
      "Additional District Collector",
    [Designation.DISTRICT_MAGISTRATE]: "District Magistrate",
    [Designation.DISTRICT_COMMISSIONER]: "District Commissioner",
    [Designation.BLOCK_DEVELOPMENT_OFFICER]: "Block Development Officer",
    [Designation.TEHSILDAR]: "Tehsildar",
    [Designation.SUB_DIVISIONAL_OFFICER]: "Sub Divisional Officer",
    [Designation.POLICE_SUPERINTENDENT]: "Police Superintendent",
    [Designation.HEALTH_OFFICER]: "Health Officer",
    [Designation.EDUCATION_OFFICER]: "Education Officer",
    [Designation.AGRICULTURE_OFFICER]: "Agriculture Officer",
    [Designation.PUBLIC_WORKS_OFFICER]: "Public Works Officer",
    [Designation.REVENUE_OFFICER]: "Revenue Officer",
    [Designation.GRAM_PANCHAYAT_OFFICER]: "Gram Panchayat Officer",
    [Designation.POLICE_INSPECTOR]: "Police Inspector",
    [Designation.MEDICAL_OFFICER]: "Medical Officer",
    [Designation.TEACHER]: "Teacher",
    [Designation.CLERK]: "Clerk",
    [Designation.ASSISTANT]: "Assistant",
    [Designation.JUNIOR_ASSISTANT]: "Junior Assistant",
    [Designation.OTHER]: "Other",
  };
  return labels[designation] || designation;
};

export const getDepartmentLabel = (department: Department): string => {
  const labels: Record<Department, string> = {
    [Department.DISTRICT_ADMINISTRATION]: "District Administration",
    [Department.REVENUE_DEPARTMENT]: "Revenue Department",
    [Department.COLLECTORATE]: "Collectorate",
    [Department.PUBLIC_WORKS_DEPARTMENT]: "Public Works Department",
    [Department.WATER_RESOURCES]: "Water Resources",
    [Department.ELECTRICITY_DEPARTMENT]: "Electricity Department",
    [Department.HEALTH_DEPARTMENT]: "Health Department",
    [Department.EDUCATION_DEPARTMENT]: "Education Department",
    [Department.SOCIAL_WELFARE]: "Social Welfare",
    [Department.POLICE_DEPARTMENT]: "Police Department",
    [Department.FIRE_SERVICES]: "Fire Services",
    [Department.TRANSPORT_DEPARTMENT]: "Transport Department",
    [Department.RURAL_DEVELOPMENT]: "Rural Development",
    [Department.URBAN_DEVELOPMENT]: "Urban Development",
    [Department.AGRICULTURE_DEPARTMENT]: "Agriculture Department",
    [Department.ENVIRONMENT_DEPARTMENT]: "Environment Department",
    [Department.SANITATION_DEPARTMENT]: "Sanitation Department",
    [Department.FOREST_DEPARTMENT]: "Forest Department",
    [Department.FOOD_AND_SUPPLIES]: "Food and Supplies",
    [Department.LABOUR_DEPARTMENT]: "Labour Department",
    [Department.WOMEN_AND_CHILD_DEVELOPMENT]: "Women and Child Development",
    [Department.INFORMATION_TECHNOLOGY]: "Information Technology",
    [Department.STATISTICS_DEPARTMENT]: "Statistics Department",
    [Department.OTHER]: "Other",
    [Department.UNASSIGNED]: "Unassigned",
  };
  return labels[department] || department;
};

export const getUserRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    [UserRole.CITIZEN]: "Citizen",
    [UserRole.ADMIN]: "Administrator",
    [UserRole.DISTRICT_COMMISSIONER]: "District Commissioner",
    [UserRole.ADDITIONAL_DISTRICT_COMMISSIONER]:
      "Additional District Commissioner",
    [UserRole.ASSISTANT_DISTRICT_COMMISSIONER]:
      "Assistant District Commissioner",
    [UserRole.ASSISTANT_COMMISSIONER]: "Assistant Commissioner",
    [UserRole.CIRCLE_OFFICER]: "Circle Officer",
    [UserRole.BLOCK_DEVELOPMENT_OFFICER]: "Block Development Officer",
    [UserRole.GRAM_PANCHAYAT_OFFICER]: "Gram Panchayat Officer",
    [UserRole.TEHSILDAR]: "Tehsildar",
    [UserRole.SUB_DIVISIONAL_OFFICER]: "Sub Divisional Officer",
    [UserRole.POLICE_OFFICER]: "Police Officer",
    [UserRole.HEALTH_OFFICER]: "Health Officer",
    [UserRole.EDUCATION_OFFICER]: "Education Officer",
    [UserRole.REVENUE_OFFICER]: "Revenue Officer",
    [UserRole.AGRICULTURE_OFFICER]: "Agriculture Officer",
    [UserRole.PUBLIC_WORKS_OFFICER]: "Public Works Officer",
    [UserRole.PWD_OFFICER]: "PWD Officer",
    [UserRole.OFFICER]: "Officer",
    [UserRole.OTHER]: "Other",
  };
  return labels[role] || role;
};

export const getComplaintStatusLabel = (status: ComplaintStatus): string => {
  const labels: Record<ComplaintStatus, string> = {
    [ComplaintStatus.CREATED]: "Created",
    [ComplaintStatus.ASSIGNED]: "Assigned",
    [ComplaintStatus.IN_PROGRESS]: "In Progress",
    [ComplaintStatus.BLOCKED]: "Blocked",
    [ComplaintStatus.RESOLVED]: "Resolved",
    [ComplaintStatus.CLOSED]: "Closed",
    [ComplaintStatus.REJECTED]: "Rejected",
    [ComplaintStatus.DUPLICATE]: "Duplicate",
  };
  return labels[status] || status;
};

export const getComplaintPriorityLabel = (
  priority: ComplaintPriority
): string => {
  const labels: Record<ComplaintPriority, string> = {
    [ComplaintPriority.LOW]: "Low",
    [ComplaintPriority.MEDIUM]: "Medium",
    [ComplaintPriority.HIGH]: "High",
    [ComplaintPriority.URGENT]: "Urgent",
  };
  return labels[priority] || priority;
};

export const getComplaintCategoryLabel = (
  category: ComplaintCategory
): string => {
  const labels: Record<ComplaintCategory, string> = {
    [ComplaintCategory.WATER_SUPPLY]: "Water Supply",
    [ComplaintCategory.ELECTRICITY]: "Electricity",
    [ComplaintCategory.ROADS_INFRASTRUCTURE]: "Roads & Infrastructure",
    [ComplaintCategory.HEALTH_SERVICES]: "Health Services",
    [ComplaintCategory.EDUCATION]: "Education",
    [ComplaintCategory.SANITATION]: "Sanitation",
    [ComplaintCategory.PUBLIC_DISTRIBUTION_SYSTEM]:
      "Public Distribution System",
    [ComplaintCategory.REVENUE_SERVICES]: "Revenue Services",
    [ComplaintCategory.POLICE_SERVICES]: "Police Services",
    [ComplaintCategory.CORRUPTION]: "Corruption",
    [ComplaintCategory.ENVIRONMENTAL_ISSUES]: "Environmental Issues",
    [ComplaintCategory.AGRICULTURE]: "Agriculture",
    [ComplaintCategory.PENSION_SERVICES]: "Pension Services",
    [ComplaintCategory.BIRTH_DEATH_CERTIFICATE]: "Birth/Death Certificate",
    [ComplaintCategory.OTHER]: "Other",
  };
  return labels[category] || category;
};

// Admin role definitions - officers cannot assign these to themselves
export const ADMIN_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.DISTRICT_COMMISSIONER,
  UserRole.ADDITIONAL_DISTRICT_COMMISSIONER,
];

export const isAdminRole = (role: UserRole): boolean => {
  return ADMIN_ROLES.includes(role);
};

// Role hierarchy for validation
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 10,
  [UserRole.DISTRICT_COMMISSIONER]: 9,
  [UserRole.ADDITIONAL_DISTRICT_COMMISSIONER]: 8,
  [UserRole.ASSISTANT_DISTRICT_COMMISSIONER]: 8,
  [UserRole.ASSISTANT_COMMISSIONER]: 7,
  [UserRole.CIRCLE_OFFICER]: 7,
  [UserRole.BLOCK_DEVELOPMENT_OFFICER]: 7,
  [UserRole.TEHSILDAR]: 6,
  [UserRole.SUB_DIVISIONAL_OFFICER]: 6,
  [UserRole.POLICE_OFFICER]: 6,
  [UserRole.HEALTH_OFFICER]: 6,
  [UserRole.EDUCATION_OFFICER]: 6,
  [UserRole.REVENUE_OFFICER]: 6,
  [UserRole.AGRICULTURE_OFFICER]: 6,
  [UserRole.PUBLIC_WORKS_OFFICER]: 6,
  [UserRole.PWD_OFFICER]: 6,
  [UserRole.GRAM_PANCHAYAT_OFFICER]: 5,
  [UserRole.OFFICER]: 4,
  [UserRole.OTHER]: 1,
};

export const canAssignRole = (
  currentUserRole: UserRole,
  targetRole: UserRole
): boolean => {
  const currentLevel = ROLE_HIERARCHY[currentUserRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

  // Users can only assign roles at or below their own level
  // And cannot assign admin roles unless they are admin themselves
  if (isAdminRole(targetRole) && !isAdminRole(currentUserRole)) {
    return false;
  }

  return currentLevel >= targetLevel;
};
