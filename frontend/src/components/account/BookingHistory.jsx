import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUsers,
  faMapMarkerAlt,
  faClock,
  faMoneyBillWave,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faEllipsisV,
  faReceipt,
  faSearch,
  faFilter,
  faStar,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { format, parseISO } from "date-fns";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import ReviewModal from "../reviews/ReviewModal";

const BookingCard = ({ booking, onCancel }) => {
  const [showActions, setShowActions] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const getStatusDetails = (status, quoteExpirationDate) => {
    // ✅ Vérifier l'expiration pour les quotes envoyés
    if (status === 'Quote Sent' && quoteExpirationDate) {
      const now = new Date();
      const expiry = new Date(quoteExpirationDate);

      if (expiry < now) {
        // Quote expiré
        return {
          color: "bg-red-100 text-red-800 border border-red-300",
          icon: faTimesCircle,
          text: "Quote Expired",
        };
      }

      // Warning si moins de 6h restantes
      const hoursRemaining = (expiry - now) / (1000 * 60 * 60);
      if (hoursRemaining < 6) {
        return {
          color: "bg-orange-100 text-orange-800 border border-orange-300",
          icon: faExclamationTriangle,
          text: `Expires in ${Math.floor(hoursRemaining)}h`,
        };
      }

      // Quote valide
      return {
        color: "bg-purple-100 text-purple-800",
        icon: faHourglassHalf,
        text: "Quote Sent",
      };
    }

    const statusMap = {
      "Payment Confirmed": {
        color: "bg-green-100 text-green-800",
        icon: faCheckCircle,
        text: "Payment Confirmed",
      },
      "Trip Completed": {
        color: "bg-blue-100 text-blue-800",
        icon: faCheckCircle,
        text: "Trip Completed",
      },
      "Inquiry Pending": {
        color: "bg-yellow-100 text-yellow-800",
        icon: faHourglassHalf,
        text: "Inquiry Pending",
      },
      "Quote Sent": {
        color: "bg-purple-100 text-purple-800",
        icon: faHourglassHalf,
        text: "Quote Sent",
      },
      "Quote Expired": {
        color: "bg-red-100 text-red-800",
        icon: faTimesCircle,
        text: "Quote Expired",
      },
      "Booking Cancelled": {
        color: "bg-red-100 text-red-800",
        icon: faTimesCircle,
        text: "Cancelled",
      },
    };
    return statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: faHourglassHalf,
      text: status || "Pending"
    };
  };

  const statusDetails = getStatusDetails(booking.status, booking.quote_expiration_date);
  const formattedDate = format(parseISO(booking.travel_date), "dd MMM yyyy");

  const handleCancel = async () => {
    if (
      !window.confirm(`Are you sure you want to cancel booking #${booking.id}?`)
    )
      return;

    setCancelling(true);
    try {
      await onCancel(booking.id);
      toast.success("Booking cancelled successfully!");
    } catch (error) {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(false);
      setShowActions(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-lg">
      <div className="md:flex">
        <div className="bg-gray-200 border-2 border-dashed w-full md:w-48 h-48 flex-shrink-0" />

        <div className="flex-1 p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {booking.tour_name}
              </h3>
              <div className="flex items-center mt-1 text-gray-600">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                <span>{booking.destination}</span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                  <button
                    onClick={() =>
                      (window.location.href = `/booking/${booking.id}`)
                    }
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    View Details
                  </button>
                  {booking.status === "confirmed" && (
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-70"
                    >
                      {cancelling ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  )}
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                    Download Invoice
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-blue-500"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Travel Date</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faUsers} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Travelers</p>
                <p className="font-medium">
                  {booking.travelers}{" "}
                  {booking.travelers > 1 ? "people" : "person"}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faClock} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{booking.duration} days</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                <FontAwesomeIcon
                  icon={faMoneyBillWave}
                  className="text-yellow-500"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-medium">${booking.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-sm text-gray-600">Booking ID: #{booking.id}</span>
            <span className="text-sm text-gray-500 ml-4">
              Booked on {format(parseISO(booking.created_at || booking.travel_date), "dd MMM yyyy")}
            </span>
          </div>

          {booking.status === 'completed' && !booking.has_reviewed && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <FontAwesomeIcon icon={faStar} />
              Write a Review
            </button>
          )}

          {booking.status === 'completed' && booking.has_reviewed && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} />
              Review Submitted
            </span>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        booking={booking}
      />
    </div>
  );
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const { token } = useContext(AuthContext);

  const fetchBookings = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.MY_BOOKINGS),
        {
          headers: getAuthHeaders(token),
        }
      );
      if (response.data.success && response.data.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      setError(true);
      toast.error("Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  // Mémoïsation du filtrage et tri
  const processedBookings = useMemo(() => {
    let result = [...bookings];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.tour_name.toLowerCase().includes(term) ||
          b.destination.toLowerCase().includes(term) ||
          b.id.toString().includes(term)
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Tri
    if (sortOption === "newest") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortOption === "oldest") {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortOption === "price_high") {
      result.sort((a, b) => b.total_price - a.total_price);
    } else if (sortOption === "price_low") {
      result.sort((a, b) => a.total_price - b.total_price);
    }

    return result;
  }, [bookings, searchTerm, statusFilter, sortOption]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.patch(
        buildApiUrl(API_CONFIG.ENDPOINTS.BOOKING_CANCEL(bookingId)),
        {},
        {
          headers: getAuthHeaders(token),
        }
      );
      // Mise à jour locale sans recharger toute la liste
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "price_low", label: "Price: Low to High" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading your booking history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faTimesCircle} size="2x" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Failed to load bookings
        </h3>
        <p className="text-gray-600 mb-6">Please try again later</p>
        <button
          onClick={fetchBookings}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FontAwesomeIcon icon={faReceipt} className="text-primary mr-3" />
            My Bookings
          </h2>
          <p className="text-gray-600 mt-2">
            {bookings.length} bookings •{" "}
            {bookings.filter((b) => b.status === "completed").length} completed
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/tours")}
          className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow hover:shadow-md"
        >
          Book New Tour
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search bookings by tour, destination or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des réservations */}
      {processedBookings.length > 0 ? (
        <div className="space-y-6">
          {processedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon
              icon={faReceipt}
              className="text-gray-400 text-3xl"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm
              ? `No bookings match your search for "${searchTerm}"`
              : "You haven't made any bookings yet"}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
