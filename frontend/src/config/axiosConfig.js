/**
 * Global Axios Configuration
 * Sets up interceptors for automatic token handling and logout on expiration
 */

import axios from 'axios';

/**
 * Setup global axios interceptors
 * This will apply to ALL axios requests in the application
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor - Add token to all requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle 401 errors (token expired)
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        console.log('Token expired - logging out automatically');

        // Clear stored authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('auth:logout'));

        // Redirect to login page
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  console.log('✅ Axios interceptors configured - automatic logout on token expiration enabled');
};
