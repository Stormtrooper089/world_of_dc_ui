// JWT utility functions
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getRoleFromToken = (token: string): string => {
  const decoded = decodeJWT(token);
  return decoded?.role || 'OFFICER';
};

export const getOfficerIdFromToken = (token: string): string => {
  const decoded = decodeJWT(token);
  return decoded?.sub || '';
};

export const getEmployeeIdFromToken = (token: string): string => {
  const decoded = decodeJWT(token);
  return decoded?.employeeId || '';
};
