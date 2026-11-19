import api from './api';

export const rentalService = {
  // Request a product rental
  createRental: async (rentalData) => {
    const response = await api.post('/rentals', rentalData);
    return response.data;
  },

  // Get rentals (all for admin or relevant)
  getRentals: async () => {
    const response = await api.get('/rentals');
    return response.data;
  },

  // Get rentals where current user is renter
  getMyRentals: async () => {
    const response = await api.get('/rentals/my-rentals');
    return response.data;
  },

  // Get rental requests for products owned by current user
  getOwnerRequests: async () => {
    const response = await api.get('/rentals/owner-requests');
    return response.data;
  },

  // Approve a rental request
  approveRental: async (id) => {
    const response = await api.put(`/rentals/approve/${id}`);
    return response.data;
  },

  // Reject a rental request
  rejectRental: async (id) => {
    const response = await api.put(`/rentals/reject/${id}`);
    return response.data;
  },

  // Mark product as returned
  returnRental: async (id) => {
    const response = await api.put(`/rentals/return/${id}`);
    return response.data;
  },
};

export default rentalService;
