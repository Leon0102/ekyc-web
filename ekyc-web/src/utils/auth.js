export const isAuthenticated = () => {
  return !!localStorage.getItem('admin_token');
};

export const getUsername = () => {
  return localStorage.getItem('admin_username');
};

export const saveAuth = (token, username) => {
  localStorage.setItem('admin_token', token);
  localStorage.setItem('admin_username', username);
};

export const clearAuth = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_username');
};
