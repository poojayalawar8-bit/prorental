import api from './api';

export const adminService = {
  // Get aggregated admin metrics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users list
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Delete user by ID
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },
};

export default adminService;
