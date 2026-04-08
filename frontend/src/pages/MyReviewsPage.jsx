import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faEdit,
  faTrash,
  faMapMarkerAlt,
  faGift,
  faExclamationCircle,
  faCheckCircle,
  faSpinner,
  faBus,
  faHiking,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const MyReviewsPage = () => {
  const { token, user } = useContext(AuthContext);
  const { t } = useTranslation();

  const [reviewsData, setReviewsData] = useState({
    tours: [],
    destinations: [],
    addons: [],
    vehicles: [],
    stats: {
      totalReviews: 0,
      tourReviews: 0,
      destinationReviews: 0,
      addonReviews: 0,
      vehicleReviews: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tours'); // 'tours', 'destinations', 'addons', 'vehicles'

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewType, setEditReviewType] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editWouldRecommend, setEditWouldRecommend] = useState(true);

  useEffect(() => {
    if (token) {
      fetchAllReviews();
    }
  }, [token]);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/my-reviews/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReviewsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review, type) => {
    setEditingReviewId(review.id);
    setEditReviewType(type);
    setEditRating(review.rating);
    setEditComment(review.comment || '');

    if (type === 'tour') {
      setEditWouldRecommend(review.would_recommend !== false);
    }
  };

  const handleUpdateReview = async () => {
    try {
      let endpoint = '';
      let payload = {};

      if (editReviewType === 'tour') {
        endpoint = `${API_BASE_URL}/api/my-reviews/tour/${editingReviewId}`;
        payload = { rating: editRating, comment: editComment.trim() || '', would_recommend: editWouldRecommend };
      } else if (editReviewType === 'destination') {
        endpoint = `${API_BASE_URL}/api/my-reviews/destination/${editingReviewId}`;
        payload = { rating: editRating, comment: editComment.trim() || '' };
      } else if (editReviewType === 'vehicle') {
        endpoint = `${API_BASE_URL}/api/my-reviews/vehicle/${editingReviewId}`;
        payload = { rating: editRating, comment: editComment.trim() || '' };
      }

      await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(t('reviews.updateSuccess') || 'Review updated successfully!');
      setEditingReviewId(null);
      setEditReviewType(null);
      fetchAllReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId, type, name) => {
    if (!window.confirm(`Are you sure you want to delete your review for "${name}"?`)) {
      return;
    }

    try {
      let endpoint = '';

      if (type === 'tour') {
        endpoint = `${API_BASE_URL}/api/my-reviews/tour/${reviewId}`;
      } else if (type === 'destination') {
        endpoint = `${API_BASE_URL}/api/my-reviews/destination/${reviewId}`;
      } else if (type === 'vehicle') {
        endpoint = `${API_BASE_URL}/api/my-reviews/vehicle/${reviewId}`;
      }

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Review deleted successfully');
      fetchAllReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review. Please try again.');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesomeIcon
            key={star}
            icon={faStar}
            className={`w-5 h-5 ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderTourReviews = () => {
    if (reviewsData.tours.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <FontAwesomeIcon icon={faHiking} className="w-20 h-20 text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Tour Reviews Yet</h3>
          <p className="text-gray-600">
            Complete a tour and share your experience to help other travelers!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {reviewsData.tours.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {editingReviewId === review.id && editReviewType === 'tour' ? (
              // Edit Mode
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-800 mb-4">
                  Edit Review for {review.tour_name}
                </h4>

                {/* Rating */}
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
                          className={`w-8 h-8 ${star <= editRating ? 'text-amber-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
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

                {/* Would Recommend */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editWouldRecommend}
                      onChange={(e) => setEditWouldRecommend(e.target.checked)}
                      className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      I would recommend this tour
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setEditingReviewId(null); setEditReviewType(null); }}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateReview}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-6">
                {/* Header with Image */}
                <div className="flex items-start gap-4 mb-4">
                  {review.tour_image && (
                    <img
                      src={review.tour_image}
                      alt={review.tour_name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-1">
                          {review.tour_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Traveled on {new Date(review.travel_date || review.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review, 'tour')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit review"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id, 'tour', review.tour_name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">{review.rating}/5</span>
                  {review.would_recommend && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      ✓ Recommended
                    </span>
                  )}
                  {review.is_approved !== undefined && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      review.is_approved
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {review.is_approved ? '✓ Approved' : '⏳ Pending Approval'}
                    </span>
                  )}
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl mb-3">
                    "{review.comment}"
                  </p>
                )}

                {/* Timestamp */}
                <div className="text-sm text-gray-500">
                  Submitted on {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderDestinationReviews = () => {
    if (reviewsData.destinations.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <FontAwesomeIcon icon={faGlobe} className="w-20 h-20 text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Destination Reviews Yet</h3>
          <p className="text-gray-600">
            Visit a destination and share your thoughts with other travelers!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {reviewsData.destinations.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {editingReviewId === review.id && editReviewType === 'destination' ? (
              // Edit Mode
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-800 mb-4">
                  Edit Review for {review.destination_name}
                </h4>

                {/* Rating */}
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
                          className={`w-8 h-8 ${star <= editRating ? 'text-amber-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
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
                    onClick={() => { setEditingReviewId(null); setEditReviewType(null); }}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateReview}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-6">
                {/* Header with Image */}
                <div className="flex items-start gap-4 mb-4">
                  {review.destination_image && (
                    <img
                      src={review.destination_image}
                      alt={review.destination_name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-1">
                          {review.destination_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                          {review.country}
                        </p>
                        {review.booking_reference && (
                          <p className="text-xs text-gray-400 mt-1">
                            Booking: {review.booking_reference}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review, 'destination')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit review"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id, 'destination', review.destination_name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">{review.rating}/5</span>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl mb-3">
                    "{review.comment}"
                  </p>
                )}

                {/* Timestamp */}
                <div className="text-sm text-gray-500">
                  Submitted on {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderAddonReviews = () => {
    if (reviewsData.addons.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <FontAwesomeIcon icon={faGift} className="w-20 h-20 text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Addon Reviews Yet</h3>
          <p className="text-gray-600">
            Book tours with addons and share your experience!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {reviewsData.addons.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-800 mb-1">
                    {review.addon_name}
                  </h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {review.addon_category} • {review.tour_name}
                  </p>
                  {review.booking_reference && (
                    <p className="text-xs text-gray-400 mt-1">
                      Booking: {review.booking_reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600">{review.rating}/5</span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl mb-3">
                  "{review.comment}"
                </p>
              )}

              {/* Timestamp */}
              <div className="text-sm text-gray-500">
                Submitted on {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {review.travel_date && (
                  <span className="ml-2">
                    • Traveled on {new Date(review.travel_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderVehicleReviews = () => {
    if (reviewsData.vehicles.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <FontAwesomeIcon icon={faBus} className="w-20 h-20 text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Vehicle Reviews Yet</h3>
          <p className="text-gray-600">
            Vehicle reviews will appear here once you've traveled with us!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {reviewsData.vehicles.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {editingReviewId === review.id && editReviewType === 'vehicle' ? (
              // Edit Mode
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-800 mb-4">
                  Edit Review for {review.vehicle_name}
                </h4>

                {/* Rating */}
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
                          className={`w-8 h-8 ${star <= editRating ? 'text-amber-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
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
                    onClick={() => { setEditingReviewId(null); setEditReviewType(null); }}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateReview}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-6">
                {/* Header with Image */}
                <div className="flex items-start gap-4 mb-4">
                  {review.vehicle_image && (
                    <img
                      src={review.vehicle_image}
                      alt={review.vehicle_name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-1">
                          {review.vehicle_name}
                        </h4>
                        <div className="flex gap-2 items-center text-sm text-gray-500">
                          {review.vehicle_type && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                              {review.vehicle_type}
                            </span>
                          )}
                          {review.comfort_level && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {review.comfort_level}
                            </span>
                          )}
                        </div>
                        {review.booking_reference && (
                          <p className="text-xs text-gray-400 mt-1">
                            Booking: {review.booking_reference}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review, 'vehicle')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit review"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id, 'vehicle', review.vehicle_name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">{review.rating}/5</span>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl mb-3">
                    "{review.comment}"
                  </p>
                )}

                {/* Timestamp */}
                <div className="text-sm text-gray-500">
                  Submitted on {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {review.travel_date && (
                    <span className="ml-2">
                      • Traveled on {new Date(review.travel_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

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

  const tabs = [
    { id: 'tours', label: 'Tours', icon: faHiking, count: reviewsData.stats.tourReviews },
    { id: 'destinations', label: 'Destinations', icon: faGlobe, count: reviewsData.stats.destinationReviews },
    { id: 'addons', label: 'Add-ons', icon: faGift, count: reviewsData.stats.addonReviews },
    { id: 'vehicles', label: 'Vehicles', icon: faBus, count: reviewsData.stats.vehicleReviews }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {t('navigation.myReviews') || 'My Reviews'}
          </h1>
          <p className="text-gray-600">
            Manage all your reviews for tours, destinations, addons, and vehicles
          </p>

          {/* Stats Summary */}
          <div className="mt-4 flex gap-4">
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-lg">
              <span className="text-2xl font-bold">{reviewsData.stats.totalReviews}</span>
              <span className="ml-2 text-sm">Total Reviews</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-2" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'tours' && renderTourReviews()}
            {activeTab === 'destinations' && renderDestinationReviews()}
            {activeTab === 'addons' && renderAddonReviews()}
            {activeTab === 'vehicles' && renderVehicleReviews()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyReviewsPage;
