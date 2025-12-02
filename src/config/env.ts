// Environment configuration
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  appName: import.meta.env.VITE_APP_NAME || 'Complaint Management System',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
// trigger new build