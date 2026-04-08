import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faQuoteLeft,
  faQuoteRight,
  faChevronLeft,
  faChevronRight,
  faMedal,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ReviewCard = ({ review, isActive }) => {
  const { t } = useTranslation();
  const [showFullText, setShowFullText] = React.useState(false);

  // Limiter le texte à 300 caractères
  const MAX_LENGTH = 300;
  const commentText = review.comment || '';
  const shouldTruncate = commentText.length > MAX_LENGTH;
  const displayText = shouldTruncate && !showFullText
    ? commentText.substring(0, MAX_LENGTH) + '...'
    : commentText;

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl p-6 mx-4 transition-all duration-500 transform min-h-[380px] max-h-[480px] flex flex-col ${
        isActive ? "scale-100 opacity-100" : "scale-95 opacity-70"
      }`}
    >
      <div className="flex items-start flex-1">
        <div className="flex flex-col items-center flex-shrink-0 w-20">
          <div className="relative mb-2">
            <div className="absolute -top-3 -left-3 z-10">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
                <FontAwesomeIcon icon={faMedal} className="mr-1 text-xs" />
                <span className="leading-tight">{t('reviews.verifiedTraveler')}</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-full w-16 h-16 border-4 border-white shadow-lg mt-5">
              <img
                src={review.user_photo_url}
                alt={review.user_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentNode.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                      ${review.user_name.charAt(0)}
                    </div>
                  `;
                }}
              />
            </div>
          </div>

          {/* Rating below avatar */}
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={faStar}
                className={`w-3 h-3 ${
                  i < review.rating
                    ? "text-amber-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-gray-700 text-base mt-2">
            {review.rating}.0
          </span>
        </div>

        <div className="flex-grow ml-6 mr-2 flex flex-col min-w-0">
          <div>
            <h4 className="font-bold text-lg text-gray-800">
              {review.user_name}
            </h4>
            <p className="text-sm text-gray-500">{review.trip_date}</p>
          </div>

          <div className="mt-4 relative flex-1 pr-4">
            <FontAwesomeIcon
              icon={faQuoteLeft}
              className="text-blue-100 text-2xl absolute top-0 left-0"
            />
            <p className="text-gray-700 relative z-10 px-7 py-2 leading-relaxed text-sm">
              {displayText}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="text-primary hover:text-primary-dark font-medium text-xs mt-1 ml-7"
              >
                {showFullText ? t('common.showLess') : t('common.readMore')}
              </button>
            )}
            <FontAwesomeIcon
              icon={faQuoteRight}
              className="text-blue-100 text-2xl absolute bottom-0 right-4"
            />
          </div>

          {/* Team Response */}
          {review.team_response && (
            <div className="mt-6 relative pr-4">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 ml-4" style={{ maxWidth: '52rem' }}>
                <div className="flex items-center mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1.5 rounded-full mr-2 w-6 h-6 flex items-center justify-center">
                    <span className="font-bold text-[10px]">ET</span>
                  </div>
                  <h5 className="font-semibold text-blue-700 text-xs">
                    {t('reviews.teamResponse')}
                  </h5>
                </div>
                <p className="text-blue-800 text-xs leading-relaxed">{review.team_response}</p>
              </div>
            </div>
          )}

          {/* Review Tags */}
          {review.tags && review.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {review.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TourReviewsCarousel = ({ tour }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      if (!tour?.id) return;

      try {
        setLoading(true);

        const reviewsResponse = await axios.get(`${API_BASE_URL}/api/reviews/tour/${tour.id}`, {
          params: {
            limit: 10,
            sortBy: 'helpful'
          }
        });

        if (reviewsResponse.data.success) {
          const transformedReviews = reviewsResponse.data.data.map(review => ({
            id: review.id,
            user_name: review.full_name || review.user_name,
            user_photo_url: review.profile_image_url || review.user_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.full_name || 'User')}&background=random`,
            rating: review.rating,
            trip_date: review.travel_date ? new Date(review.travel_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            comment: review.review_text || review.comment,
            team_response: review.response_from_admin || review.team_response,
            verified_purchase: review.verified_purchase,
            helpful_count: review.helpful_count || 0,
            country: review.country
          }));

          setReviews(transformedReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [tour?.id]);

  // Calculate average rating
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  // Navigate reviews
  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Gestion du swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextReview();
    }
    if (isRightSwipe) {
      prevReview();
    }
  };

  // Don't render if loading or no reviews
  if (loading) {
    return (
      <div className="mt-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('reviews.loading')}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            {t('reviews.title')}
          </h2>

          <div className="flex justify-center items-center mb-8">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full text-xl font-bold inline-flex items-center">
              <span className="mr-2">{averageRating.toFixed(1)}</span>
              <FontAwesomeIcon icon={faStar} className="text-white mr-1" />
              <FontAwesomeIcon icon={faStar} className="text-white mr-1" />
              <FontAwesomeIcon icon={faStar} className="text-white mr-1" />
              <FontAwesomeIcon icon={faStar} className="text-white mr-1" />
              <FontAwesomeIcon icon={faStar} className="text-white" />
            </div>
            <span className="ml-4 text-lg text-gray-700">
              {t('reviews.basedOn', { count: reviews.length })}
            </span>
          </div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('reviews.subtitle')}
          </p>
        </div>

        {/* Desktop Carousel */}
        <div className="hidden md:block relative mb-20">
          <div
            className="relative h-[500px]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentIndex
                    ? "opacity-100 z-10"
                    : index === (currentIndex + 1) % reviews.length ||
                      index ===
                        (currentIndex - 1 + reviews.length) % reviews.length
                    ? "opacity-30 z-0"
                    : "opacity-0"
                }`}
                style={{
                  transform: `translateX(${
                    (index - currentIndex) * 30
                  }%) scale(${index === currentIndex ? 1 : 0.9})`,
                }}
              >
                <ReviewCard review={review} isActive={index === currentIndex} />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-2 space-x-4">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 w-6"
                    : "bg-gray-300"
                }`}
                aria-label={t('reviews.goToReview', { number: index + 1 })}
              />
            ))}
          </div>

          <button
            onClick={prevReview}
            className="absolute left-4 top-[43%] -translate-y-1/2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all z-20 group"
            aria-label={t('reviews.previousReview')}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-white text-xl group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={nextReview}
            className="absolute right-4 top-[43%] -translate-y-1/2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all z-20 group"
            aria-label={t('reviews.nextReview')}
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-white text-xl group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden mb-6">
          <div
            className="relative h-[550px]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <ReviewCard review={review} isActive={index === currentIndex} />
              </div>
            ))}
          </div>

          {/* Indicateurs mobile */}
          <div className="flex justify-center mt-6 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-primary to-blue-600 w-6"
                    : "bg-gray-300"
                }`}
                aria-label={t('reviews.goToReview', { number: index + 1 })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourReviewsCarousel;
