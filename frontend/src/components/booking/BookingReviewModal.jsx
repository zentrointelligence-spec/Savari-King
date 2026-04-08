import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faStar,
  faMapMarkerAlt,
  faPlus,
  faCheckCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import axios from "axios";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";

const StarRating = ({ rating, onRatingChange, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`text-2xl transition-all ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${
            star <= (hoverRating || rating)
              ? "text-yellow-400"
              : "text-gray-300"
          }`}
        >
          <FontAwesomeIcon icon={faStar} />
        </button>
      ))}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : "Click to rate"}
        </span>
      )}
    </div>
  );
};

const ReviewSection = ({ title, icon, iconColor, children }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <FontAwesomeIcon icon={icon} className={`mr-2 ${iconColor}`} />
        {title}
      </h3>
      {children}
    </div>
  );
};

const BookingReviewModal = ({ bookingId, onClose, onReviewSubmitted }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [existingReviews, setExistingReviews] = useState(null);

  // Form state
  const [tourReview, setTourReview] = useState({
    rating: 0,
    comment: "",
    would_recommend: true,
  });

  const [destinationReview, setDestinationReview] = useState({
    rating: 0,
    comment: "",
  });

  const [addonReviews, setAddonReviews] = useState([]);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        buildApiUrl(`/booking-reviews/${bookingId}/details`),
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        setBookingDetails(response.data.data.booking);
        setExistingReviews(response.data.data.existingReviews);

        // Initialize addon reviews
        if (response.data.data.booking.addons) {
          const initialAddonReviews = response.data.data.booking.addons.map(
            (addon) => {
              const existingReview =
                response.data.data.existingReviews.addonReviews.find(
                  (r) => r.addon_id === addon.id
                );
              return {
                addon_id: addon.id,
                addon_name: addon.name,
                addon_category: addon.category,
                rating: existingReview?.rating || 0,
                comment: existingReview?.comment || "",
              };
            }
          );
          setAddonReviews(initialAddonReviews);
        }
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Failed to load booking details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (tourReview.rating === 0 && !existingReviews?.tourReviewed) {
      toast.error("Please rate the tour");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        tourReview: existingReviews?.tourReviewed
          ? null
          : {
              rating: tourReview.rating,
              comment: tourReview.comment,
              would_recommend: tourReview.would_recommend,
              travel_date: bookingDetails?.travel_date,
            },
        destinationReview:
          bookingDetails?.destination && !existingReviews?.destinationReviewed
            ? {
                rating: destinationReview.rating,
                comment: destinationReview.comment,
              }
            : null,
        addonReviews: addonReviews
          .filter((review) => review.rating > 0)
          .map((review) => ({
            addon_id: review.addon_id,
            rating: review.rating,
            comment: review.comment,
          })),
      };

      const response = await axios.post(
        buildApiUrl(`/booking-reviews/${bookingId}/submit`),
        payload,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Reviews submitted successfully!");
        if (onReviewSubmitted) onReviewSubmitted();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting reviews:", error);
      toast.error(
        error.response?.data?.error || "Failed to submit reviews"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateAddonReview = (addonId, field, value) => {
    setAddonReviews((prev) =>
      prev.map((review) =>
        review.addon_id === addonId ? { ...review, [field]: value } : review
      )
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-4xl text-primary animate-spin mb-4"
            />
            <p className="text-gray-600">Loading review form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Leave a Review</h2>
              <p className="text-sm opacity-90">
                Share your experience with {bookingDetails.tour.name}
              </p>
              <p className="text-xs opacity-75 mt-1">
                Booking Reference: {bookingDetails.reference}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Tour Review */}
          {!existingReviews?.tourReviewed && (
            <ReviewSection
              title="Rate the Tour"
              icon={faStar}
              iconColor="text-yellow-500"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating *
                  </label>
                  <StarRating
                    rating={tourReview.rating}
                    onRatingChange={(rating) =>
                      setTourReview((prev) => ({ ...prev, rating }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={tourReview.comment}
                    onChange={(e) =>
                      setTourReview((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about your tour experience..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="would_recommend"
                    checked={tourReview.would_recommend}
                    onChange={(e) =>
                      setTourReview((prev) => ({
                        ...prev,
                        would_recommend: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label
                    htmlFor="would_recommend"
                    className="ml-2 text-sm text-gray-700"
                  >
                    I would recommend this tour to others
                  </label>
                </div>
              </div>
            </ReviewSection>
          )}

          {existingReviews?.tourReviewed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-800">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                <span className="font-medium">
                  You have already reviewed this tour
                </span>
              </div>
            </div>
          )}

          {/* Destination Review */}
          {bookingDetails.destination && !existingReviews?.destinationReviewed && (
            <ReviewSection
              title={`Rate ${bookingDetails.destination.name}`}
              icon={faMapMarkerAlt}
              iconColor="text-blue-500"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Rating
                  </label>
                  <StarRating
                    rating={destinationReview.rating}
                    onRatingChange={(rating) =>
                      setDestinationReview((prev) => ({ ...prev, rating }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Comments
                  </label>
                  <textarea
                    value={destinationReview.comment}
                    onChange={(e) =>
                      setDestinationReview((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="What did you think of this destination?"
                  />
                </div>
              </div>
            </ReviewSection>
          )}

          {bookingDetails.destination && existingReviews?.destinationReviewed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-800">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                <span className="font-medium">
                  You have already reviewed this destination
                </span>
              </div>
            </div>
          )}

          {/* Addon Reviews */}
          {addonReviews.length > 0 && (
            <ReviewSection
              title="Rate Add-ons"
              icon={faPlus}
              iconColor="text-purple-500"
            >
              <div className="space-y-4">
                {addonReviews.map((addonReview) => {
                  const existingAddonReview =
                    existingReviews?.addonReviews?.find(
                      (r) => r.addon_id === addonReview.addon_id
                    );

                  if (existingAddonReview) {
                    return (
                      <div
                        key={addonReview.addon_id}
                        className="bg-green-50 border border-green-200 rounded-lg p-4"
                      >
                        <div className="flex items-center text-green-800">
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                          <span className="font-medium">
                            Already reviewed: {addonReview.addon_name}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={addonReview.addon_id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {addonReview.addon_name}
                        {addonReview.addon_category && (
                          <span className="ml-2 text-xs text-gray-500 font-normal">
                            ({addonReview.addon_category})
                          </span>
                        )}
                      </h4>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <StarRating
                          rating={addonReview.rating}
                          onRatingChange={(rating) =>
                            updateAddonReview(addonReview.addon_id, "rating", rating)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comments
                        </label>
                        <textarea
                          value={addonReview.comment}
                          onChange={(e) =>
                            updateAddonReview(
                              addonReview.addon_id,
                              "comment",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          placeholder="Optional comments..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ReviewSection>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (tourReview.rating === 0 && !existingReviews?.tourReviewed)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Reviews"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingReviewModal;
