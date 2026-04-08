import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInbox,
  faFileInvoiceDollar,
  faCheckCircle,
  faTimesCircle,
  faBell,
  faCheck,
  faTrashAlt,
  faEnvelopeOpen,
  faClock,
  faGift,
  faStar,
  faPlane,
  faFilter,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../contexts/NotificationContext";

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
    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${config.bg} mr-4`}>
      <FontAwesomeIcon icon={config.icon} className={`${config.color} text-lg`} />
    </div>
  );
};

const NotificationsPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification.");
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.booking_id) {
      navigate(`/booking-details/${notification.booking_id}`);
    } else if (notification.type === 'review_approved') {
      navigate('/my-reviews');
    }
  };

  const handleMarkAllAsReadClick = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read.");
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === "unread") return !notif.is_read;
    if (activeFilter === "read") return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount !== 1 ? "s" : ""
                }`
              : "All caught up!"}
          </p>
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={handleMarkAllAsReadClick}
            disabled={unreadCount === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              unreadCount === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <FontAwesomeIcon icon={faCheckDouble} className="mr-2" />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {["all", "unread", "read"].map((filter) => (
          <button
            key={filter}
            className={`pb-2 px-1 font-medium relative ${
              activeFilter === filter
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {activeFilter === filter && (
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                layoutId="filterIndicator"
              />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredNotifications.map((notif) => (
                <motion.li
                  key={notif.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 md:p-6 ${!notif.is_read ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start">
                    <NotificationIcon type={notif.type} />

                    <div className="flex-grow">
                      <div className="flex items-center">
                        <h3 className="font-bold text-gray-900">
                          {notif.title || "Your quote is ready!"}
                        </h3>
                        {!notif.is_read && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"
                          />
                        )}
                      </div>

                      <p className="text-gray-600 mt-1 text-sm md:text-base">
                        {notif.message ||
                          "Your personalized quote for the 'Coastal Beauty' tour has been sent. Please review and proceed to payment."}
                      </p>

                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-400">
                          {new Date(notif.sent_at).toLocaleString([], {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        <div className="flex space-x-3">
                          {!notif.is_read && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="mr-1"
                              />
                              Mark as read
                            </motion.button>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(notif.id)}
                            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-2xl text-blue-500"
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {activeFilter === "all"
                ? "You're all caught up! Check back later for updates."
                : `No ${activeFilter} notifications at this time.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
