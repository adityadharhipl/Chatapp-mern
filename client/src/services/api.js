export const API_URL = import.meta.env.PROD ? (import.meta.env.VITE_API_URL || `${window.location.origin}/api`) : 'http://localhost:5000/api';

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
