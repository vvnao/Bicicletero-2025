'use strict';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const HistoryService = {
  baseURL: `${API_URL}/history`,

  getAuthHeaders() {
    const token =
      localStorage.getItem('jwt-auth') ||
      document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt-auth='))
        ?.split('=')[1];

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  },

  async request(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status} - ${text}`);
    }

    return response.json();
  },

  getAllBicycleHistory(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`${this.baseURL}/bicycles?${query}`);
  },

  getAllUserHistory(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`${this.baseURL}/users?${query}`);
  },

  getAllGuardHistory(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`${this.baseURL}/guards?${query}`);
  }
};

export default HistoryService;
