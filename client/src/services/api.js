export const API_URL = 'http://localhost:5000/api';

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
