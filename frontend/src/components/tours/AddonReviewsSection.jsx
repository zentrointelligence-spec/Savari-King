import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faUser,
  faCalendar,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AddonReviewsSection = ({ addonId, addonName }) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!addonId) return;

      setLoading(true);
      try {
        // Fetch statistics
        const statsResponse = await axios.get(
          `${API_BASE_URL}/api/addon-reviews/addon/${addonId}/stats`
        );
        setStatistics(statsResponse.data.data);

        // Fetch reviews
        const reviewsResponse = await axios.get(
          `${API_BASE_URL}/api/addon-reviews/addon/${addonId}`,
          {
            params: { page, limit: 5 }
          }
        );

        const newReviews = reviewsResponse.data.reviews || [];
        setReviews(prev => page === 1 ? newReviews : [...prev, ...newReviews]);
        setHasMore(reviewsResponse.data.pagination?.hasMore || false);
      } catch (error) {
        console.error('Error fetching addon review data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addonId, page]);

  // Don't render while loading initially
  if (loading && !statistics) {
    return null;
  }

  // Don't show if there are no reviews (comparing as number)
  if (!statistics || parseInt(statistics.total_reviews) === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header clickable - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Rating Badge */}
            <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-3 rounded-xl min-w-[80px]">
              <div className="text-3xl font-bold text-gray-800">
                {statistics.average_rating}
              </div>
              <div className="flex text-yellow-400 justify-center">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={`w-3 h-3 ${i < Math.round(statistics.average_rating) ? '' : 'opacity-30'}`}
                  />
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {t('reviews.customerReviews') || 'Customer Reviews'}
              </h3>
              <p className="text-gray-600 text-sm">
                {statistics.total_reviews} {t('reviews.reviews') || 'reviews'} • {expanded ? t('reviews.clickToHideDetails') : t('reviews.clickToShowDetails')}
              </p>
            </div>
          </div>

          {/* Toggle Icon */}
          <div className="ml-4">
            <FontAwesomeIcon
              icon={expanded ? faChevronUp : faChevronDown}
              className="text-gray-400 text-xl transition-transform"
            />
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-6 border-t border-gray-100">
              {/* Rating Distribution */}
              <div className="mt-6 mb-6 space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-16">
                      {rating} {t('common.stars') || 'stars'}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${statistics.rating_distribution[rating]?.percentage || 0}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-yellow-400 h-full"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {statistics.rating_distribution[rating]?.count || 0}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    className="border-2 border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                  >
                    {/* Reviewer Info */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {review.firstname?.charAt(0)}{review.lastname?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          {review.firstname} {review.lastname}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <FontAwesomeIcon
                                key={i}
                                icon={faStar}
                                className={`w-3 h-3 ${i < review.rating ? '' : 'opacity-30'}`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                          <span>
                            {new Date(review.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed pl-16">
                        {review.comment}
                      </p>
                    )}

                    {/* Tour Info */}
                    <div className="mt-3 pl-16 text-sm text-gray-500">
                      {t('reviews.fromTour') || 'From tour'}: {review.tour_name}
                    </div>
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="w-full py-3 px-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium"
                  >
                    {t('reviews.loadMore') || 'Load More Reviews'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddonReviewsSection;
