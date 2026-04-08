import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faEdit,
  faTrash,
  faPen,
  faCalendar,
  faMapMarkerAlt,
  faGift,
  faExclamationCircle,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import AddonReviewModal from '../components/modals/AddonReviewModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const MyAddonReviewsPage = () => {
  const { token, user } = useContext(AuthContext);
  const { t } = useTranslation();

  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'submitted'

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eligibleRes, reviewsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/addon-reviews/eligible`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/addon-reviews/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setEligibleBookings(eligibleRes.data.data || []);
      setMyReviews(reviewsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching reviews data:', error);
      toast.error('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = (addon, booking) => {
    setSelectedAddon(addon);
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    fetchData(); // Refresh data after submission
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleUpdateReview = async (reviewId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/addon-reviews/${reviewId}`,
        {
          rating: editRating,
          comment: editComment.trim() || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Review updated successfully!');
      setEditingReviewId(null);
      fetchData();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId, addonName) => {
    if (!window.confirm(`Are you sure you want to delete your review for "${addonName}"?`)) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/api/addon-reviews/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Review deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review. Please try again.');
    }
  };

  // Calculate total pending reviews
  const totalPendingReviews = eligibleBookings.reduce((total, booking) => {
    return total + booking.addons.filter(addon => !addon.already_reviewed).length;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Addon Reviews</h1>
          <p className="text-gray-600">
            Share your experiences and help other travelers make informed decisions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'pending'
                ? 'text-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ✍️ Pending Reviews
            {totalPendingReviews > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {totalPendingReviews}
              </span>
            )}
            {activeTab === 'pending' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'submitted'
                ? 'text-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⭐ My Reviews ({myReviews.length})
            {activeTab === 'submitted' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'pending' ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {eligibleBookings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-20 h-20 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    You're All Caught Up!
                  </h3>
                  <p className="text-gray-600">
                    No pending reviews at the moment. Book a tour with addons to share your experience.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {eligibleBookings.map((booking) => {
                    const pendingAddons = booking.addons.filter(addon => !addon.already_reviewed);

                    if (pendingAddons.length === 0) return null;

                    return (
                      <motion.div
                        key={booking.booking_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Booking Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{booking.tour_name}</h3>
                              <div className="flex items-center gap-4 text-sm text-white/90">
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faCalendar} />
                                  {new Date(booking.travel_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                              {pendingAddons.length} pending
                            </div>
                          </div>
                        </div>

                        {/* Addons List */}
                        <div className="p-6 space-y-3">
                          {pendingAddons.map((addon) => (
                            <div
                              key={addon.addon_id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white">
                                  <FontAwesomeIcon icon={faGift} className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">{addon.addon_name}</h4>
                                  <p className="text-sm text-gray-500 capitalize">{addon.addon_category}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleWriteReview(addon, booking)}
                                className="px-6 py-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={faPen} />
                                Write Review
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {myReviews.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-20 h-20 text-gray-400 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You haven't submitted any reviews yet. Complete a tour and share your experience!
                  </p>
                  {totalPendingReviews > 0 && (
                    <button
                      onClick={() => setActiveTab('pending')}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                      Write Your First Review
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {myReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {editingReviewId === review.id ? (
                        // Edit Mode
                        <div className="p-6">
                          <h4 className="font-bold text-lg text-gray-800 mb-4">
                            Edit Review for {review.addon_name}
                          </h4>

                          {/* Rating Selection */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Rating
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditRating(star)}
                                  className="focus:outline-none"
                                >
                                  <FontAwesomeIcon
                                    icon={faStar}
                                    className={`w-8 h-8 ${
                                      star <= editRating ? 'text-amber-400' : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comment Edit */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Comment
                            </label>
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              rows={4}
                              maxLength={1000}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateReview(review.id)}
                              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-800 mb-1">
                                  {review.addon_name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {review.tour_name} • {new Date(review.travel_date).toLocaleDateString()}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditReview(review)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit review"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id, review.addon_name)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete review"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FontAwesomeIcon
                                    key={star}
                                    icon={faStar}
                                    className={`w-5 h-5 ${
                                      star <= review.rating ? 'text-amber-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {review.rating}/5
                              </span>
                            </div>

                            {/* Comment */}
                            {review.comment && (
                              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                "{review.comment}"
                              </p>
                            )}

                            {/* Timestamp */}
                            <div className="mt-4 text-sm text-gray-500">
                              Submitted on {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                              {review.updated_at && review.updated_at !== review.created_at && (
                                <span className="ml-2">
                                  (Last edited {new Date(review.updated_at).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      <AddonReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        addon={selectedAddon ? {
          id: selectedAddon.addon_id,
          name: selectedAddon.addon_name,
          category: selectedAddon.addon_category
        } : null}
        booking={selectedBooking ? {
          id: selectedBooking.booking_id,
          tourName: selectedBooking.tour_name,
          travelDate: selectedBooking.travel_date
        } : null}
        onSubmitSuccess={handleReviewSubmitted}
      />
    </div>
  );
};

export default MyAddonReviewsPage;
