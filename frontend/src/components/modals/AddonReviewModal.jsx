import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faTimes,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Modal pour soumettre un avis sur un addon
 * @param {boolean} isOpen - État d'ouverture du modal
 * @param {function} onClose - Fonction de fermeture
 * @param {object} addon - { id, name, category, icon }
 * @param {object} booking - { id, tourName, travelDate }
 * @param {function} onSubmitSuccess - Callback après soumission réussie
 */
const AddonReviewModal = ({ isOpen, onClose, addon, booking, onSubmitSuccess }) => {
  const { token } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (comment.trim().length > 0 && comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    }

    if (comment.length > 1000) {
      newErrors.comment = 'Comment must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/addon-reviews`,
        {
          addon_id: addon.id,
          booking_id: booking.id,
          rating: rating,
          comment: comment.trim() || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Review submitted successfully! Thank you for your feedback.');

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data.data);
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('Error submitting review:', error);

      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (stars) => {
    switch (stars) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-5 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-2">Write a Review</h2>
                <p className="text-white/90 text-sm">
                  Share your experience with {addon.name}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <form onSubmit={handleSubmit}>
                  {/* Booking Info */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <FontAwesomeIcon icon={faStar} className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-lg">
                          {addon.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          From: <span className="font-medium">{booking.tourName}</span>
                        </div>
                        {booking.travelDate && (
                          <div className="text-sm text-gray-600">
                            Date: {new Date(booking.travelDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Your Rating <span className="text-red-500">*</span>
                    </label>

                    <div className="flex flex-col items-center py-4">
                      {/* Stars */}
                      <div className="flex gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="focus:outline-none"
                          >
                            <FontAwesomeIcon
                              icon={faStar}
                              className={`w-10 h-10 transition-colors ${
                                star <= (hoverRating || rating)
                                  ? 'text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>

                      {/* Rating Text */}
                      <div className={`text-lg font-semibold transition-colors ${
                        (hoverRating || rating) > 0 ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {getRatingText(hoverRating || rating)}
                      </div>
                    </div>

                    {errors.rating && (
                      <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience with this addon..."
                      rows={6}
                      maxLength={1000}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      {errors.comment && (
                        <p className="text-red-500 text-sm">{errors.comment}</p>
                      )}
                      <div className="text-sm text-gray-500 ml-auto">
                        {comment.length}/1000 characters
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">
                      💡 Tips for writing a great review:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Be specific about what you liked or didn't like</li>
                      <li>• Mention if the addon was worth the price</li>
                      <li>• Share any tips for future travelers</li>
                      <li>• Keep it honest and constructive</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || rating === 0}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheck} />
                          Submit Review
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddonReviewModal;
