import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUsers,
  faMapMarkerAlt,
  faMoneyBillWave,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faFileInvoice,
  faClock,
  faChild,
  faInfoCircle,
  faDownload,
  faFilePdf,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { format, parseISO, differenceInSeconds } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import Price from "../common/Price";

const BookingStatusCard = ({ booking, onStatusChange }) => {
  const [cancelling, setCancelling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Countdown timer for quote expiration
  useEffect(() => {
    if (!booking || !booking.quote_expiration_date || booking.status !== "Quote Sent") {
      return;
    }

    const updateCountdown = () => {
      const expirationDate = parseISO(booking.quote_expiration_date);
      const now = new Date();
      const secondsLeft = differenceInSeconds(expirationDate, now);

      if (secondsLeft <= 0) {
        setTimeRemaining({ expired: true });
        return;
      }

      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;

      setTimeRemaining({ hours, minutes, seconds, expired: false });
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [booking]);

  /**
   * Statuts possibles:
   * - 'Inquiry Pending' - Demande envoyée, en attente de devis
   * - 'Quote Sent' - Devis envoyé, en attente de paiement
   * - 'Quote Expired' - Devis expiré
   * - 'Payment Confirmed' - Paiement confirmé
   * - 'Cancelled' - Annulé
   * - 'Trip Completed' - Voyage terminé
   */
  const getStatusConfig = (status) => {
    const configs = {
      "Inquiry Pending": {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: faHourglassHalf,
        text: "🟡 Inquiry Pending",
        description: "Our team is reviewing your request",
      },
      "Quote Sent": {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: faFileInvoice,
        text: "📧 Quote Ready",
        description: "Review your quote and proceed to payment",
      },
      "Quote Expired": {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: faClock,
        text: "⏰ Quote Expired",
        description: "The quote has expired. Contact us to renew",
      },
      "Payment Confirmed": {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: faCheckCircle,
        text: "✅ Confirmed",
        description: "Your booking is confirmed!",
      },
      Cancelled: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: faTimesCircle,
        text: "❌ Cancelled",
        description: "This booking has been cancelled",
      },
      "Trip Completed": {
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: faCheckCircle,
        text: "🎉 Completed",
        description: "Hope you had an amazing trip!",
      },
    };
    return configs[status] || configs["Inquiry Pending"];
  };

  const statusConfig = getStatusConfig(booking.status);
  const formattedDate = booking.travel_date
    ? format(parseISO(booking.travel_date), "dd MMM yyyy")
    : "N/A";

  const handleCancelBooking = async () => {
    if (
      !window.confirm(
        `Are you sure you want to cancel booking ${booking.booking_reference}?`
      )
    ) {
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        buildApiUrl(`${API_CONFIG.ENDPOINTS.BOOKING_CREATE}/${booking.id}/cancel`),
        {},
        { headers: getAuthHeaders(token) }
      );

      toast.success("Booking cancelled successfully");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to cancel booking";
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const canCancel =
    booking.status === "Inquiry Pending" ||
    booking.status === "Quote Sent" ||
    (booking.status === "Payment Confirmed" &&
      booking.can_cancel_with_refund === true);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
      {/* Status Header */}
      <div className={`px-6 py-3 ${statusConfig.color} border-b-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={statusConfig.icon} className="mr-2" />
            <span className="font-bold">{statusConfig.text}</span>
          </div>
          <span className="text-sm font-mono">{booking.booking_reference}</span>
        </div>
        <p className="text-xs mt-1 opacity-80">{statusConfig.description}</p>
      </div>

      {/* Tour Information */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Tour Image */}
          <img
            src={
              booking.tour_image ||
              "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400"
            }
            alt={booking.tour_name}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400";
            }}
          />

          {/* Tour Details */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {booking.tour_name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              <span>{booking.tier_name || "Standard"} Package</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <FontAwesomeIcon icon={faClock} className="mr-2" />
              <span>{booking.duration_days || 4} Days Tour</span>
            </div>
          </div>
        </div>

        {/* Booking Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center text-blue-600 mb-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-sm" />
              <span className="text-xs font-medium">Travel Date</span>
            </div>
            <p className="font-bold text-gray-900">{formattedDate}</p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center text-green-600 mb-1">
              <FontAwesomeIcon icon={faUsers} className="mr-2 text-sm" />
              <span className="text-xs font-medium">Adults</span>
            </div>
            <p className="font-bold text-gray-900">{booking.num_adults}</p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center text-purple-600 mb-1">
              <FontAwesomeIcon icon={faChild} className="mr-2 text-sm" />
              <span className="text-xs font-medium">Children</span>
            </div>
            <p className="font-bold text-gray-900">{booking.num_children}</p>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center text-orange-600 mb-1">
              <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-sm" />
              <span className="text-xs font-medium">
                {booking.final_price ? "Final Price" : "Estimate"}
              </span>
            </div>
            <p className="font-bold text-gray-900">
              <Price
                priceINR={booking.final_price || booking.estimated_price || 0}
                size="sm"
              />
            </p>
          </div>
        </div>

        {/* Special Messages based on Status */}
        {booking.status === "Inquiry Pending" && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-yellow-600 mt-1 mr-2"
              />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Response Expected</p>
                <p>Our team will send you a quote within 30 minutes</p>
              </div>
            </div>
          </div>
        )}

        {booking.status === "Quote Sent" && (
          <div className="mt-4 space-y-3">
            {/* Countdown Timer */}
            {timeRemaining && (
              <div
                className={`p-4 rounded-lg ${
                  timeRemaining.expired
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : timeRemaining.hours < 2
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                }`}
              >
                <div className="text-center text-white">
                  <FontAwesomeIcon icon={faClock} className="text-2xl mb-2" />
                  {timeRemaining.expired ? (
                    <>
                      <h4 className="text-lg font-bold mb-1">Quote Expired</h4>
                      <p className="text-sm">Contact us to renew your quote</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-sm font-semibold mb-2">
                        Quote Expires In:
                      </h4>
                      <div className="flex justify-center space-x-2">
                        <div className="bg-white bg-opacity-20 rounded px-2 py-1 min-w-[50px]">
                          <div className="text-2xl font-bold">
                            {String(timeRemaining.hours).padStart(2, "0")}
                          </div>
                          <div className="text-xs">Hours</div>
                        </div>
                        <div className="text-2xl font-bold">:</div>
                        <div className="bg-white bg-opacity-20 rounded px-2 py-1 min-w-[50px]">
                          <div className="text-2xl font-bold">
                            {String(timeRemaining.minutes).padStart(2, "0")}
                          </div>
                          <div className="text-xs">Minutes</div>
                        </div>
                        <div className="text-2xl font-bold">:</div>
                        <div className="bg-white bg-opacity-20 rounded px-2 py-1 min-w-[50px]">
                          <div className="text-2xl font-bold">
                            {String(timeRemaining.seconds).padStart(2, "0")}
                          </div>
                          <div className="text-xs">Seconds</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="text-blue-600 mt-1 mr-2"
                />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">Quote Valid Until</p>
                  <p>
                    {booking.quote_expiration_date
                      ? format(
                          parseISO(booking.quote_expiration_date),
                          "dd MMM yyyy, HH:mm"
                        )
                      : "48 hours from quote sent date"}
                  </p>
                </div>
              </div>
            </div>

            {/* View Quote Pages - Only show if quote is not expired */}
            {!timeRemaining?.expired && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <FontAwesomeIcon
                    icon={faFileInvoice}
                    className="text-blue-600 mr-2 text-lg"
                  />
                  <h4 className="font-semibold text-blue-900">View Your Quotations</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={`/my-bookings/${booking.id}/quote/detailed`}
                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faFileInvoice} className="mr-2" />
                    Detailed Quote
                  </a>
                  <a
                    href={`/my-bookings/${booking.id}/quote/general`}
                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faFileInvoice} className="mr-2" />
                    General Quote
                  </a>
                </div>
                <p className="text-xs text-blue-700 mt-3 text-center">
                  Click above to view, accept, or share your quotations online.
                </p>
              </div>
            )}

            {/* Show message when quote is expired */}
            {timeRemaining?.expired && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className="text-red-600 mt-1 mr-2 text-lg"
                  />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Quote Expired</p>
                    <p>This quote has expired and is no longer available for payment or download.</p>
                    <p className="mt-2">Please contact us at <a href="mailto:support@ebenezertours.com" className="font-semibold underline">support@ebenezertours.com</a> to request a new quote.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {booking.status === "Payment Confirmed" && booking.can_cancel_with_refund && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-green-600 mt-1 mr-2"
              />
              <div className="text-sm text-green-800">
                <p className="font-semibold">Free Cancellation Available</p>
                <p>You can cancel within 24 hours of payment for a full refund</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {/* Pay Now Button for Quote Sent status - Only show if quote is not expired */}
          {booking.status === "Quote Sent" && booking.payment_status !== 'paid' && !timeRemaining?.expired && (
            <button
              onClick={() =>
                (window.location.href = `/my-bookings/${booking.id}/payment`)
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
              Pay Now
            </button>
          )}

          <button
            onClick={() =>
              (window.location.href = `/booking/${booking.id}`)
            }
            className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium ${
              booking.status === "Quote Sent" && booking.payment_status !== 'paid' && !timeRemaining?.expired ? '' : 'flex-1'
            }`}
          >
            View Details
          </button>

          {canCancel && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}

          {booking.status === "Trip Completed" && (
            <button
              onClick={() => window.location.href = `/review/${booking.id}`}
              className="px-4 py-2 border-2 border-purple-500 text-purple-500 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              title="Review your tour, destination, and add-ons"
            >
              Leave Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingStatusCard;
