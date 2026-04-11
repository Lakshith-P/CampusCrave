import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const api = {
  // Venues
  getVenues: (type = null) => axios.get(`${API}/venues${type ? `?type=${type}` : ''}`),
  getMenu: (venueId) => axios.get(`${API}/venues/${venueId}/menu`),
  
  // Cart
  getCart: () => axios.get(`${API}/cart`, getAuthHeaders()),
  addToCart: (item) => axios.post(`${API}/cart`, item, getAuthHeaders()),
  removeFromCart: (itemId) => axios.delete(`${API}/cart/${itemId}`, getAuthHeaders()),
  
  // Orders
  createOrder: (order) => axios.post(`${API}/orders`, order, getAuthHeaders()),
  getOrders: (venueId = null) => axios.get(`${API}/orders${venueId ? `?venue_id=${venueId}` : ''}`, getAuthHeaders()),
  updateOrderStatus: (orderId, status) => axios.patch(`${API}/orders/${orderId}/status`, { status }, getAuthHeaders()),
  updateAgentLocation: (orderId, location) => axios.patch(`${API}/orders/${orderId}/location`, location),
  
  // Reviews
  createReview: (review) => axios.post(`${API}/reviews`, review, getAuthHeaders()),
  getReviews: (venueId) => axios.get(`${API}/reviews/${venueId}`),
  
  // Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API}/upload`, formData, {
      ...getAuthHeaders(),
      headers: {
        ...getAuthHeaders().headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // External Orders
  createExternalOrder: (order) => axios.post(`${API}/external-orders`, order, getAuthHeaders()),
  
  // Analytics
  getAnalytics: () => axios.get(`${API}/analytics`, getAuthHeaders())
};