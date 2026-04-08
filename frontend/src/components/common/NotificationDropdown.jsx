import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckDouble,
  faExternalLinkAlt,
  faFileInvoiceDollar,
  faCheckCircle,
  faTimesCircle,
  faInbox,
  faClock,
  faGift,
  faStar,
  faPlane
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

// Map notification types to icons and colors
const NotificationIcon = ({ type }) => {
  const iconMap = {
    inquiry_received: { icon: faInbox, color: 'text-blue-500', bg: 'bg-blue-50' },
    quote_sent: { icon: faFileInvoiceDollar, color: 'text-purple-500', bg: 'bg-purple-50' },
    quote_received: { icon: faFileInvoiceDollar, color: 'text-purple-500', bg: 'bg-purple-50' },
    payment_confirmed: { icon: faCheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    trip_completed: { icon: faPlane, color: 'text-blue-600', bg: 'bg-blue-50' },
    booking_cancelled: { icon: faTimesCircle, color: 'text-red-500', bg: 'bg-red-50' },
    quote_expiring_soon: { icon: faClock, color: 'text-orange-500', bg: 'bg-orange-50' },
    quote_expired: { icon: faClock, color: 'text-gray-500', bg: 'bg-gray-50' },
    quote_revision_sent: { icon: faGift, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    review_approved: { icon: faStar, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    booking_reminder: { icon: faClock, color: 'text-amber-500', bg: 'bg-amber-50' },
  };

  const config = iconMap[type] || { icon: faBell, color: 'text-primary', bg: 'bg-gray-50' };

  return (
    <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
      <FontAwesomeIcon icon={config.icon} className={`${config.color} text-sm`} />
    </div>
  );
};

// Format relative time
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch latest notifications when opening dropdown
  const handleToggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate based on notification type
    if (notification.booking_id) {
      navigate(`/booking-details/${notification.booking_id}`);
    } else if (notification.type === 'review_approved') {
      navigate('/my-reviews');
    }
  };

  // Get last 5 notifications
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-3 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        title={t('navigation.notifications')}
      >
        <FontAwesomeIcon icon={faBell} className="text-lg" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white dark:ring-dark-light font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-w-sm bg-white dark:bg-dark-light rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-heavy">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBell} className="text-primary text-lg" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FontAwesomeIcon icon={faBell} className="text-4xl text-gray-300 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    We'll notify you when something new happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-heavy cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <NotificationIcon type={notification.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {getRelativeTime(notification.sent_at || notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-heavy">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-light"
                >
                  View All Notifications
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 text-xs" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
