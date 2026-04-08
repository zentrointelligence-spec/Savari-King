import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import API_CONFIG, { buildApiUrl, getAuthHeaders } from '../config/api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS),
        { headers: getAuthHeaders(token) }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_COUNT),
        { headers: getAuthHeaders(token) }
      );
      setUnreadCount(response.data.unread || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [token]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      await axios.patch(
        buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_READ(notificationId)),
        {},
        { headers: getAuthHeaders(token) }
      );

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await axios.patch(
        buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ),
        {},
        { headers: getAuthHeaders(token) }
      );

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [token]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      await axios.delete(
        buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_DELETE(notificationId)),
        { headers: getAuthHeaders(token) }
      );

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [token, notifications]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    if (!token) return;

    try {
      await axios.delete(
        buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS_DELETE_ALL),
        { headers: getAuthHeaders(token) }
      );

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, [token]);

  // Initial load and polling setup
  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, token, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
