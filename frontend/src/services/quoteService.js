/**
 * Quote Service
 * API calls for quote viewing and management
 * Note: Auth headers are automatically added by global axios interceptor
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const quoteService = {
  /**
   * Get detailed quote for a booking
   * @param {number} bookingId - Booking ID
   * @param {number|null} version - Optional version number to view
   * @returns {Promise<Object>} Quote data
   */
  async getDetailedQuote(bookingId, version = null) {
    try {
      const params = version ? { version } : {};
      const response = await axios.get(
        `${API_BASE_URL}/api/my-bookings/${bookingId}/quote/detailed`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching detailed quote:', error);
      throw error;
    }
  },

  /**
   * Get general quote for a booking
   * @param {number} bookingId - Booking ID
   * @param {number|null} version - Optional version number to view
   * @returns {Promise<Object>} Quote data
   */
  async getGeneralQuote(bookingId, version = null) {
    try {
      const params = version ? { version } : {};
      const response = await axios.get(
        `${API_BASE_URL}/api/my-bookings/${bookingId}/quote/general`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching general quote:', error);
      throw error;
    }
  },

  /**
   * Get all quote versions for a booking
   * @param {number} bookingId - Booking ID
   * @returns {Promise<Array>} Array of quote versions
   */
  async getQuoteVersions(bookingId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/my-bookings/${bookingId}/quote/versions`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching quote versions:', error);
      throw error;
    }
  },

  /**
   * Accept a quote
   * @param {number} bookingId - Booking ID
   * @param {number|null} revisionNumber - Optional revision number to accept
   * @returns {Promise<Object>} Acceptance confirmation
   */
  async acceptQuote(bookingId, revisionNumber = null) {
    try {
      const body = revisionNumber ? { revisionNumber } : {};
      const response = await axios.post(
        `${API_BASE_URL}/api/my-bookings/${bookingId}/quote/accept`,
        body
      );
      return response.data;
    } catch (error) {
      console.error('Error accepting quote:', error);
      throw error;
    }
  },

  /**
   * Generate shareable link for a quote
   * @param {number} bookingId - Booking ID
   * @param {string} quoteType - 'detailed' or 'general'
   * @returns {string} Shareable URL
   */
  getShareableLink(bookingId, quoteType = 'detailed') {
    return `${window.location.origin}/my-bookings/${bookingId}/quote/${quoteType}`;
  },

  /**
   * Copy link to clipboard
   * @param {string} link - Link to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyLinkToClipboard(link) {
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }
};

export default quoteService;
