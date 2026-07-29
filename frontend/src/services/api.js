const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('wms_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        // Handle 401 Unauthorized (e.g., token expired)
        if (response.status === 401) {
          localStorage.removeItem('wms_token');
          localStorage.removeItem('wms_user');
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};
