import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const api = {
  getVenues: (type = null) => axios.get(`${API}/venues${type ? `?type=${type}` : ''}`),
  getMenu: (venueId) => axios.get(`${API}/venues/${venueId}/menu`),
  searchItems: (q) => axios.get(`${API}/search?q=${encodeURIComponent(q)}`),
  getOffers: () => axios.get(`${API}/offers`),
  getTrending: () => axios.get(`${API}/trending`),
  getSpecials: () => axios.get(`${API}/specials`, getAuthHeaders()),
  getMe: () => axios.get(`${API}/auth/me`, getAuthHeaders()),
  getCart: () => axios.get(`${API}/cart`, getAuthHeaders()),
  addToCart: (item) => axios.post(`${API}/cart`, item, getAuthHeaders()),
  updateCartItem: (itemId, data) => axios.patch(`${API}/cart/${itemId}`, data, getAuthHeaders()),
  removeFromCart: (itemId) => axios.delete(`${API}/cart/${itemId}`, getAuthHeaders()),
  processPayment: (data) => axios.post(`${API}/payment/process`, data, getAuthHeaders()),
  createOrder: (order) => axios.post(`${API}/orders`, order, getAuthHeaders()),
  getOrders: (venueId = null) => axios.get(`${API}/orders${venueId ? `?venue_id=${venueId}` : ''}`, getAuthHeaders()),
  updateOrderStatus: (orderId, status) => axios.patch(`${API}/orders/${orderId}/status`, { status }, getAuthHeaders()),
  createReview: (review) => axios.post(`${API}/reviews`, review, getAuthHeaders()),
  getReviews: (venueId) => axios.get(`${API}/reviews/${venueId}`),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API}/upload`, formData, {
      ...getAuthHeaders(),
      headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }
    });
  },
  createExternalOrder: (order) => axios.post(`${API}/external-orders`, order, getAuthHeaders()),
  applyReferral: (code) => axios.post(`${API}/referral/apply`, { code }, getAuthHeaders()),
  getOutletAnalytics: () => axios.get(`${API}/outlet/analytics`, getAuthHeaders()),
  getAnalytics: () => axios.get(`${API}/analytics`, getAuthHeaders()),
};
