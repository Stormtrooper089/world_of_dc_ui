/**
 * Environment configuration
 *
 * This file loads environment variables from .env files based on the current environment:
 * - .env (development)
 * - .env.production (production)
 * - .env.staging (staging)
 *
 * Environment variables must be prefixed with VITE_ to be accessible in the browser.
 * Vite automatically loads the appropriate .env file based on the NODE_ENV.
 */
const withApiPrefix = (baseUrl: string) => {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const config = {
  // API base URL - defaults to production URL if not specified
  apiBaseUrl: withApiPrefix(
    import.meta.env.VITE_API_BASE_URL ||
      "https://world-of-dc-election.onrender.com"
  ),

  // File/media base URL - always points to remote storage server
  fileBaseUrl:
    import.meta.env.VITE_FILE_BASE_URL ||
    "https://world-of-dc-election.onrender.com",

  // Application name - defaults to "Complaint Management System" if not specified
  appName: import.meta.env.VITE_APP_NAME || "Complaint Management System",

  // Application version - defaults to "1.0.0" if not specified
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
};
// trigger new build
