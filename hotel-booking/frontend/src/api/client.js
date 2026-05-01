const BASE_URL = 'http://localhost:5000/api';

export const api = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    ...options
  };

  // Nếu body là object, tự động stringify
  if (defaultOptions.body && typeof defaultOptions.body === 'object') {
    defaultOptions.body = JSON.stringify(defaultOptions.body);
  }

  const response = await fetch(`${BASE_URL}${path}`, defaultOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi hệ thống: ${response.status}`);
  }

  // Nếu là logout hoặc xóa, có thể không có body trả về
  if (response.status === 204) return null;
  
  return await response.json();
};
