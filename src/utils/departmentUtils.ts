import { Department } from "../types";

export const getDepartmentDisplayName = (department: Department): string => {
  const displayNames: Record<Department, string> = {
    [Department.DISTRICT_ADMINISTRATION]: "District Administration",
    [Department.REVENUE_DEPARTMENT]: "Revenue Department",
    [Department.COLLECTORATE]: "Collectorate",
    [Department.PUBLIC_WORKS_DEPARTMENT]: "Public Works Department (PWD)",
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

  return displayNames[department] || department.replace("_", " ");
};

export const getDepartmentDescription = (department: Department): string => {
  const descriptions: Record<Department, string> = {
    [Department.DISTRICT_ADMINISTRATION]: "Overall district administration",
    [Department.REVENUE_DEPARTMENT]:
      "Land records, revenue collection, and property matters",
    [Department.COLLECTORATE]: "District collector's office",
    [Department.PUBLIC_WORKS_DEPARTMENT]:
      "Roads, bridges, and infrastructure development",
    [Department.WATER_RESOURCES]:
      "Water supply, irrigation, and water management",
    [Department.ELECTRICITY_DEPARTMENT]:
      "Power supply and electrical infrastructure",
    [Department.HEALTH_DEPARTMENT]:
      "Healthcare services and medical facilities",
    [Department.EDUCATION_DEPARTMENT]:
      "Schools, colleges, and educational services",
    [Department.SOCIAL_WELFARE]: "Social security and welfare programs",
    [Department.POLICE_DEPARTMENT]: "Law enforcement and public safety",
    [Department.FIRE_SERVICES]: "Fire safety and emergency response",
    [Department.TRANSPORT_DEPARTMENT]:
      "Public transportation and vehicle registration",
    [Department.RURAL_DEVELOPMENT]:
      "Rural infrastructure and development programs",
    [Department.URBAN_DEVELOPMENT]: "Urban planning and municipal services",
    [Department.AGRICULTURE_DEPARTMENT]:
      "Agricultural services and farmer support",
    [Department.ENVIRONMENT_DEPARTMENT]:
      "Environmental protection and conservation",
    [Department.SANITATION_DEPARTMENT]:
      "Waste management and sanitation services",
    [Department.FOREST_DEPARTMENT]:
      "Forest conservation and wildlife management",
    [Department.FOOD_AND_SUPPLIES]:
      "Public distribution system and food security",
    [Department.LABOUR_DEPARTMENT]: "Labour welfare and employment services",
    [Department.WOMEN_AND_CHILD_DEVELOPMENT]:
      "Women and child welfare programs",
    [Department.INFORMATION_TECHNOLOGY]: "IT services and digital governance",
    [Department.STATISTICS_DEPARTMENT]:
      "Data collection and statistical services",
    [Department.OTHER]: "Other departments not specifically listed",
    [Department.UNASSIGNED]: "Not yet assigned to any department",
  };

  return descriptions[department] || "";
};

