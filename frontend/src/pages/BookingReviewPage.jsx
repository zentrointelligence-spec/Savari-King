import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faMapMarkerAlt,
  faGift,
  faCheckCircle,
  faSpinner,
  faArrowLeft,
  faCalendar,
  faTicketAlt,
  faHiking,
  faBus,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axios from "axios";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../config/api";
import { AuthContext } from "../contexts/AuthContext";

const StarRating = ({ rating, onRatingChange, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`transition-all focus:outline-none ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            <FontAwesomeIcon
              icon={faStar}
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? "text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {!readonly && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          {rating > 0 ? `${rating}/5` : "Click to rate"}
        </span>
      )}
    </div>
  );
};

const ReviewSection = ({ title, icon, iconColor, children, badge, isOptional }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${iconColor} bg-opacity-10 flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className={`${iconColor} text-lg`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>
        </div>
        {badge && (
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full uppercase">
            {badge}
          </span>
        )}
        {isOptional && (
          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full uppercase">
            Optional
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
};

const BookingReviewPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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
  const [vehicleReviews, setVehicleReviews] = useState([]);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to leave a review");
      navigate("/login");
      return;
    }
    fetchBookingDetails();
  }, [bookingId, user]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        buildApiUrl(`/api/booking-reviews/${bookingId}/details`),
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

        // Initialize vehicle reviews
        if (response.data.data.booking.vehicles) {
          const initialVehicleReviews = response.data.data.booking.vehicles.map(
            (vehicle) => {
              const existingReview =
                response.data.data.existingReviews.vehicleReviews?.find(
                  (r) => r.vehicle_id === vehicle.id
                );
              return {
                vehicle_id: vehicle.id,
                vehicle_name: vehicle.name,
                vehicle_type: vehicle.type,
                comfort_level: vehicle.comfort_level,
                rating: existingReview?.rating || 0,
                comment: existingReview?.comment || "",
              };
            }
          );
          setVehicleReviews(initialVehicleReviews);
        }
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      if (error.response?.status === 404) {
        toast.error("Booking not found or not completed");
        navigate("/my-bookings");
      } else {
        toast.error("Failed to load booking details");
      }
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
        vehicleReviews: vehicleReviews
          .filter((review) => review.rating > 0)
          .map((review) => ({
            vehicle_id: review.vehicle_id,
            rating: review.rating,
            comment: review.comment,
          })),
      };

      const response = await axios.post(
        buildApiUrl(`/api/booking-reviews/${bookingId}/submit`),
        payload,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Reviews submitted successfully! Thank you for your feedback.");
        setTimeout(() => navigate("/my-reviews"), 2000);
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

  const updateVehicleReview = (vehicleId, field, value) => {
    setVehicleReviews((prev) =>
      prev.map((review) =>
        review.vehicle_id === vehicleId ? { ...review, [field]: value } : review
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="w-12 h-12 text-primary animate-spin mb-4"
          />
          <p className="text-gray-600 text-lg">Loading review form...</p>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/my-bookings")}
            className="text-primary hover:text-primary-dark flex items-center gap-2 mb-4 font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to My Bookings
          </button>

          <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold mb-2">
              Leave Your Review
            </h1>
            <p className="text-white/90 mb-4">
              Share your experience with {bookingDetails.tour.name}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-lg">
                <FontAwesomeIcon icon={faTicketAlt} className="mr-2" />
                <span className="font-mono font-semibold">{bookingDetails.reference}</span>
              </div>
              {bookingDetails.travel_date && (
                <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-lg">
                  <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                  <span>{new Date(bookingDetails.travel_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tour Review */}
          {!existingReviews?.tourReviewed ? (
            <ReviewSection
              title="Rate Your Tour Experience"
              icon={faHiking}
              iconColor="text-primary"
              badge="REQUIRED"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Share Your Experience
                  </label>
                  <textarea
                    value={tourReview.comment}
                    onChange={(e) =>
                      setTourReview((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    rows={5}
                    maxLength={1000}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="Tell us about your tour experience, highlights, what you enjoyed most..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Your review helps other travelers and helps us improve our services
                    </p>
                    <span className="text-xs text-gray-400">
                      {tourReview.comment.length}/1000
                    </span>
                  </div>
                </div>

                <div className="flex items-start bg-gray-50 p-4 rounded-xl">
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
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
                  />
                  <label
                    htmlFor="would_recommend"
                    className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    ✓ I would recommend this tour to friends and family
                  </label>
                </div>
              </div>
            </ReviewSection>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border-2 border-green-200 rounded-2xl p-6"
            >
              <div className="flex items-center text-green-800">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl mr-4 text-green-600" />
                <div>
                  <p className="font-bold text-lg">Tour Review Already Submitted</p>
                  <p className="text-sm text-green-700">You have already reviewed this tour. Visit "My Reviews" to edit it.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Destination Review */}
          {bookingDetails.destination && !existingReviews?.destinationReviewed && (
            <ReviewSection
              title={`Rate ${bookingDetails.destination.name}`}
              icon={faMapMarkerAlt}
              iconColor="text-blue-500"
              isOptional={true}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Thoughts on the Destination
                  </label>
                  <textarea
                    value={destinationReview.comment}
                    onChange={(e) =>
                      setDestinationReview((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="What did you think of this destination? Would you visit again?"
                  />
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-gray-400">
                      {destinationReview.comment.length}/1000
                    </span>
                  </div>
                </div>
              </div>
            </ReviewSection>
          )}

          {bookingDetails.destination && existingReviews?.destinationReviewed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border-2 border-green-200 rounded-2xl p-6"
            >
              <div className="flex items-center text-green-800">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl mr-4 text-green-600" />
                <div>
                  <p className="font-bold text-lg">Destination Review Already Submitted</p>
                  <p className="text-sm text-green-700">You have already reviewed this destination. Visit "My Reviews" to edit it.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Addon Reviews */}
          {addonReviews.length > 0 && (
            <ReviewSection
              title="Rate Your Add-ons"
              icon={faGift}
              iconColor="text-purple-500"
              isOptional={true}
            >
              <div className="space-y-4">
                {addonReviews.map((addonReview) => {
                  const existingAddonReview =
                    existingReviews?.addonReviews?.find(
                      (r) => r.addon_id === addonReview.addon_id
                    );

                  if (existingAddonReview) {
                    return (
                      <motion.div
                        key={addonReview.addon_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-green-50 border-2 border-green-200 rounded-xl p-4"
                      >
                        <div className="flex items-center text-green-800">
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-3 text-green-600" />
                          <span className="font-semibold">
                            ✓ Already reviewed: {addonReview.addon_name}
                          </span>
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={addonReview.addon_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary transition-colors bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {addonReview.addon_name}
                        </h4>
                        {addonReview.addon_category && (
                          <span className="text-xs text-gray-600 font-semibold px-3 py-1 bg-white rounded-full border border-gray-200 capitalize">
                            {addonReview.addon_category}
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Comments (Optional)
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
                          rows={3}
                          maxLength={500}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none bg-white"
                          placeholder="Share your thoughts about this add-on..."
                        />
                        <div className="flex justify-end mt-1">
                          <span className="text-xs text-gray-400">
                            {addonReview.comment.length}/500
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ReviewSection>
          )}

          {/* Vehicle Reviews */}
          {vehicleReviews.length > 0 && (
            <ReviewSection
              title="Rate Your Vehicles"
              icon={faBus}
              iconColor="text-green-500"
              isOptional={true}
            >
              <div className="space-y-4">
                {vehicleReviews.map((vehicleReview) => {
                  const existingVehicleReview =
                    existingReviews?.vehicleReviews?.find(
                      (r) => r.vehicle_id === vehicleReview.vehicle_id
                    );

                  if (existingVehicleReview) {
                    return (
                      <motion.div
                        key={vehicleReview.vehicle_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-green-50 border-2 border-green-200 rounded-xl p-4"
                      >
                        <div className="flex items-center text-green-800">
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-3 text-green-600" />
                          <span className="font-semibold">
                            ✓ Already reviewed: {vehicleReview.vehicle_name}
                          </span>
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={vehicleReview.vehicle_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary transition-colors bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {vehicleReview.vehicle_name}
                          </h4>
                          <div className="flex gap-2 mt-1">
                            {vehicleReview.vehicle_type && (
                              <span className="text-xs text-gray-600 font-semibold px-3 py-1 bg-white rounded-full border border-gray-200 capitalize">
                                {vehicleReview.vehicle_type}
                              </span>
                            )}
                            {vehicleReview.comfort_level && (
                              <span className="text-xs text-blue-600 font-semibold px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                                {vehicleReview.comfort_level}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Rating
                        </label>
                        <StarRating
                          rating={vehicleReview.rating}
                          onRatingChange={(rating) =>
                            updateVehicleReview(vehicleReview.vehicle_id, "rating", rating)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Comments (Optional)
                        </label>
                        <textarea
                          value={vehicleReview.comment}
                          onChange={(e) =>
                            updateVehicleReview(
                              vehicleReview.vehicle_id,
                              "comment",
                              e.target.value
                            )
                          }
                          rows={3}
                          maxLength={500}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none bg-white"
                          placeholder="Share your thoughts about this vehicle..."
                        />
                        <div className="flex justify-end mt-1">
                          <span className="text-xs text-gray-400">
                            {vehicleReview.comment.length}/500
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ReviewSection>
          )}

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 pt-6"
          >
            <button
              type="button"
              onClick={() => navigate("/my-bookings")}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (tourReview.rating === 0 && !existingReviews?.tourReviewed)}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Submitting Reviews...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Submit Reviews
                </>
              )}
            </button>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-gray-500 pb-4"
          >
            <p>After submitting, you can view and edit your reviews in the "My Reviews" section</p>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default BookingReviewPage;
