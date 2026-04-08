import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Price from "../components/common/Price";
import {
  faArrowLeft,
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
  faSpinner,
  faEnvelope,
  faPhone,
  faCarSide,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { format, parseISO, differenceInSeconds } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../config/api";
import { AuthContext } from "../contexts/AuthContext";
import { useCurrency } from "../contexts/CurrencyContext";

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { convertAndFormat, currency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (token && id) {
      fetchBookingDetails();
    }
  }, [token, id]);

  // Countdown timer
  useEffect(() => {
    if (!booking || !booking.quote_expiration_date) return;

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

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(`/api/bookings/${id}`), {
        headers: getAuthHeaders(token),
      });

      if (response.data.success) {
        const bookingData = response.data.data;

        // Check ownership
        if (bookingData.user_id !== user?.id) {
          toast.error("You do not have access to this booking");
          navigate("/my-bookings");
          return;
        }

        setBooking(bookingData);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Failed to load booking details");
      navigate("/my-bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      "Inquiry Pending": {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: faHourglassHalf,
        text: t('bookingDetailsPage.statusInquiryPending'),
        description: t('bookingDetailsPage.descInquiryPending'),
      },
      "Quote Sent": {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: faFileInvoice,
        text: t('bookingDetailsPage.statusQuoteReady'),
        description: t('bookingDetailsPage.descQuoteReady'),
      },
      "Quote Expired": {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: faClock,
        text: t('bookingDetailsPage.statusQuoteExpired'),
        description: t('bookingDetailsPage.descQuoteExpired'),
      },
      "Payment Confirmed": {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: faCheckCircle,
        text: t('bookingDetailsPage.statusConfirmed'),
        description: t('bookingDetailsPage.descConfirmed'),
      },
      Cancelled: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: faTimesCircle,
        text: t('bookingDetailsPage.statusCancelled'),
        description: t('bookingDetailsPage.descCancelled'),
      },
      "Trip Completed": {
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: faCheckCircle,
        text: t('bookingDetailsPage.statusTripCompleted'),
        description: t('bookingDetailsPage.descTripCompleted'),
      },
    };
    return configs[status] || configs["Inquiry Pending"];
  };

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
      await axios.post(
        buildApiUrl(`${API_CONFIG.ENDPOINTS.BOOKING_CREATE}/${booking.id}/cancel`),
        {},
        { headers: getAuthHeaders(token) }
      );

      toast.success("Booking cancelled successfully");
      navigate("/my-bookings");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to cancel booking";
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const canCancel =
    booking?.status === "Inquiry Pending" ||
    booking?.status === "Quote Sent" ||
    (booking?.status === "Payment Confirmed" &&
      booking?.can_cancel_with_refund === true);

  // Check if any action is available
  const hasActions =
    (booking?.status === "Quote Sent" && booking?.payment_status !== "paid" && !timeRemaining?.expired) || // Pay Now (if not expired)
    canCancel || // Cancel
    booking?.status === "Trip Completed"; // Leave Review

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-5xl text-primary mb-4"
          />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Booking not found</p>
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const formattedDate = booking.travel_date
    ? format(parseISO(booking.travel_date), "dd MMM yyyy")
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/my-bookings")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('bookingDetailsPage.backToBookings')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('bookingDetailsPage.title')}</h1>
        </div>

        {/* Status Header */}
        <div
          className={`bg-white rounded-xl shadow-lg border-2 ${statusConfig.color} p-6 mb-6`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={statusConfig.icon}
                className="text-2xl mr-3"
              />
              <div>
                <h2 className="text-2xl font-bold">{statusConfig.text}</h2>
                <p className="text-sm opacity-80">{statusConfig.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70">{t('bookingDetailsPage.bookingReference')}</p>
              <p className="text-xl font-mono font-bold">
                {booking.booking_reference}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer for Quote Sent Status */}
        {booking.status === "Quote Sent" && timeRemaining && (
          <div
            className={`mb-6 p-6 rounded-xl shadow-lg ${
              timeRemaining.expired
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : timeRemaining.hours < 2
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            }`}
          >
            <div className="text-center text-white">
              <FontAwesomeIcon icon={faClock} className="text-3xl mb-3" />
              {timeRemaining.expired ? (
                <>
                  <h3 className="text-2xl font-bold mb-2">{t('bookingDetailsPage.quoteExpired')}</h3>
                  <p>{t('bookingDetailsPage.quoteExpiredDesc')}</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2">
                    {t('bookingDetailsPage.quoteExpiresIn')}
                  </h3>
                  <div className="flex justify-center space-x-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 min-w-[80px]">
                      <div className="text-4xl font-bold">
                        {String(timeRemaining.hours).padStart(2, "0")}
                      </div>
                      <div className="text-sm opacity-90">{t('bookingDetailsPage.hours')}</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 min-w-[80px]">
                      <div className="text-4xl font-bold">
                        {String(timeRemaining.minutes).padStart(2, "0")}
                      </div>
                      <div className="text-sm opacity-90">{t('bookingDetailsPage.minutes')}</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 min-w-[80px]">
                      <div className="text-4xl font-bold">
                        {String(timeRemaining.seconds).padStart(2, "0")}
                      </div>
                      <div className="text-sm opacity-90">{t('bookingDetailsPage.seconds')}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm">
                    {t('bookingDetailsPage.validUntil')}{" "}
                    {format(
                      parseISO(booking.quote_expiration_date),
                      "dd MMM yyyy, HH:mm"
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Download PDFs Section - Only show if quote is not expired */}
        {booking.status === "Quote Sent" &&
          (booking.quote_detailed_pdf || booking.quote_general_pdf) &&
          !timeRemaining?.expired && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faFilePdf}
                  className="text-blue-600 text-2xl mr-3"
                />
                <h3 className="text-xl font-bold text-blue-900">
                  {t('bookingDetailsPage.downloadQuotations')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.quote_detailed_pdf && (
                  <a
                    href={`${API_CONFIG.BASE_URL}${booking.quote_detailed_pdf}`}
                    download
                    className="flex items-center justify-center px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-3 text-lg" />
                    {t('bookingDetailsPage.detailedQuotePDF')}
                  </a>
                )}
                {booking.quote_general_pdf && (
                  <a
                    href={`${API_CONFIG.BASE_URL}${booking.quote_general_pdf}`}
                    download
                    className="flex items-center justify-center px-6 py-4 bg-white border-2 border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-3 text-lg" />
                    {t('bookingDetailsPage.generalQuotePDF')}
                  </a>
                )}
              </div>
              <p className="text-sm text-blue-700 mt-4 text-center">
                Download and review your quotations carefully. Contact us if you
                have any questions.
              </p>
            </div>
          )}

        {/* Show message when quote is expired */}
        {booking.status === "Quote Sent" && timeRemaining?.expired && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-start">
              <FontAwesomeIcon
                icon={faTimesCircle}
                className="text-red-600 text-2xl mt-1 mr-3"
              />
              <div className="text-red-800">
                <h3 className="text-lg font-bold mb-2">{t('bookingDetailsPage.quoteExpired')}</h3>
                <p className="mb-3">This quote has expired and is no longer available for payment or download.</p>
                <p>Please contact us at <a href="mailto:support@ebenezertours.com" className="font-semibold underline">support@ebenezertours.com</a> to request a new quote.</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tour Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('bookingDetailsPage.tourInformation')}
              </h3>
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={
                    booking.tour_image ||
                    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400"
                  }
                  alt={booking.tour_name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400";
                  }}
                />
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {booking.tour_name}
                  </h4>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                    <span>{booking.tier_name || "Standard"} Package</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    <span>{booking.duration_days || 4} Days Tour</span>
                  </div>
                </div>
              </div>

              {/* Travel Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-600 mb-1">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-sm"
                    />
                    <span className="text-xs font-medium">{t('bookingDetailsPage.travelDate')}</span>
                  </div>
                  <p className="font-bold text-gray-900">{formattedDate}</p>
                </div>

                {/* Participant Ages - Dynamic Display */}
                {booking.participant_ages && booking.participant_ages.length > 0 ? (
                  booking.participant_ages.map((ageGroup, index) => {
                    const colors = [
                      { bg: 'bg-green-50', text: 'text-green-600' },
                      { bg: 'bg-purple-50', text: 'text-purple-600' },
                      { bg: 'bg-indigo-50', text: 'text-indigo-600' },
                      { bg: 'bg-pink-50', text: 'text-pink-600' },
                      { bg: 'bg-yellow-50', text: 'text-yellow-600' },
                    ];
                    const colorScheme = colors[index % colors.length];

                    // Get category name
                    let categoryName = ageGroup.label || ageGroup.id || 'Participant';
                    if (ageGroup.id === 'adult') categoryName = t('bookingDetailsPage.adults');
                    else if (ageGroup.id === 'child') categoryName = t('bookingDetailsPage.children');
                    else if (ageGroup.id === 'teen') categoryName = t('bookingDetailsPage.teenagers');
                    else if (ageGroup.id === 'senior') categoryName = t('bookingDetailsPage.seniors');
                    else if (ageGroup.id === 'infant') categoryName = t('bookingDetailsPage.infants');

                    return (
                      <div key={index} className={`${colorScheme.bg} p-3 rounded-lg`}>
                        <div className={`flex items-center ${colorScheme.text} mb-1`}>
                          <FontAwesomeIcon icon={faUsers} className="mr-2 text-sm" />
                          <span className="text-xs font-medium">{categoryName}</span>
                        </div>
                        <p className="font-bold text-gray-900">
                          {ageGroup.count || 1}
                        </p>
                        <p className="text-xs text-gray-500">{ageGroup.label}</p>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center text-green-600 mb-1">
                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-sm" />
                        <span className="text-xs font-medium">{t('bookingDetailsPage.adults')}</span>
                      </div>
                      <p className="font-bold text-gray-900">{booking.num_adults || 0}</p>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center text-purple-600 mb-1">
                        <FontAwesomeIcon icon={faChild} className="mr-2 text-sm" />
                        <span className="text-xs font-medium">{t('bookingDetailsPage.children')}</span>
                      </div>
                      <p className="font-bold text-gray-900">
                        {booking.num_children || 0}
                      </p>
                    </div>
                  </>
                )}

                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-center text-orange-600 mb-1">
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="mr-2 text-sm"
                    />
                    <span className="text-xs font-medium">
                      {booking.final_price ? t('bookingDetailsPage.finalPrice') : t('bookingDetailsPage.estimate')}
                    </span>
                  </div>
                  <div className="font-bold text-gray-900">
                    <Price
                      priceINR={booking.final_price || booking.estimated_price || 0}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicles Section */}
            {booking.selected_vehicles &&
              booking.selected_vehicles.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faCarSide} className="mr-2" />
                    {t('bookingDetailsPage.selectedVehicles')}
                  </h3>
                  <div className="space-y-3">
                    {booking.selected_vehicles.map((vehicle, index) => {
                      const vehicleName = vehicle.vehicle_name || vehicle.name || t('bookingDetailsPage.vehicle');
                      const hasDetails = vehicle.capacity || vehicle.price;
                      const durationDays = booking.duration_days || 1;
                      // vehicle.price from backend is already the price PER DAY
                      const pricePerDay = vehicle.price ? parseFloat(vehicle.price) : 0;
                      const totalPrice = pricePerDay * durationDays; // Calculate total price

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                              {t('bookingDetailsPage.vehicle')}
                            </p>
                            <p className="font-bold text-gray-900 text-lg mb-1">
                              {vehicleName}
                            </p>
                            {vehicle.capacity && (
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-500" />
                                <span>{t('bookingDetailsPage.capacity')}: <strong>{vehicle.capacity}</strong> {t('bookingDetailsPage.passengers')}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-600 mb-1">
                              {t('bookingDetailsPage.qty')}: <strong className="text-blue-600">{vehicle.quantity || 1}</strong>
                            </p>
                            {/* Duration multiplier */}
                            {durationDays > 0 && (
                              <p className="text-xs text-blue-600 mb-2">
                                × {durationDays} {durationDays === 1 ? 'day' : 'days'}
                              </p>
                            )}
                            {vehicle.price ? (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {convertAndFormat(pricePerDay)} / day
                                </p>
                                <p className="font-bold text-gray-900 text-lg">
                                  {convertAndFormat(totalPrice)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">{t('bookingDetailsPage.priceTBD')}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Add-ons Section */}
            {booking.selected_addons && booking.selected_addons.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                  {t('bookingDetailsPage.selectedAddons')}
                </h3>
                <div className="space-y-3">
                  {booking.selected_addons.map((addon, index) => {
                    const addonName = addon.addon_name || addon.name || t('bookingDetailsPage.addon');
                    const hasDetails = addon.price !== undefined;
                    // addon.price from backend is already the UNIT price (per person or per unit)
                    const unitPrice = addon.price ? parseFloat(addon.price) : 0;
                    const numParticipants = (booking.num_adults || 0) + (booking.num_children || 0);
                    const isPerPerson = addon.price_per_person !== false && numParticipants > 0;
                    const quantity = addon.quantity || 1;

                    // Calculate total price and multiplier
                    let totalPrice = 0;
                    let multiplier = 0;
                    let multiplierLabel = '';

                    if (isPerPerson) {
                      // Price per person - multiply by number of participants
                      totalPrice = unitPrice * numParticipants;
                      multiplier = numParticipants;
                      multiplierLabel = t('bookingDetailsPage.participants');
                    } else {
                      // Price per unit - multiply by quantity
                      totalPrice = unitPrice * quantity;
                      multiplier = quantity;
                      multiplierLabel = 'units';
                    }

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                            {t('bookingDetailsPage.addon')}
                          </p>
                          <p className="font-bold text-gray-900 text-lg mb-1">
                            {addonName}
                          </p>
                          {addon.description && (
                            <p className="text-sm text-gray-600 mb-1">
                              {addon.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {!isPerPerson && (
                            <p className="text-sm text-gray-600 mb-1">
                              {t('bookingDetailsPage.qty')}: <strong className="text-green-600">{quantity}</strong>
                            </p>
                          )}
                          {/* Multiplier indicator */}
                          {multiplier > 0 && (
                            <p className="text-xs text-blue-600 mb-2">
                              × {multiplier} {multiplierLabel}
                            </p>
                          )}
                          {addon.price !== undefined ? (
                            <div>
                              {/* Unit price */}
                              {multiplier > 1 && (
                                <p className="text-sm text-gray-600 mb-1">
                                  {convertAndFormat(unitPrice)} / {isPerPerson ? 'person' : 'unit'}
                                </p>
                              )}
                              {/* Total price */}
                              <p className="font-bold text-gray-900 text-lg">
                                {convertAndFormat(totalPrice)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">{t('bookingDetailsPage.priceTBD')}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('bookingDetailsPage.contactInformation')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="text-gray-600 mr-3 mt-1"
                  />
                  <div>
                    <p className="text-sm text-gray-600">{t('bookingDetailsPage.contactName')}</p>
                    <p className="font-semibold text-gray-900">
                      {booking.contact_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-gray-600 mr-3 mt-1"
                  />
                  <div>
                    <p className="text-sm text-gray-600">{t('bookingDetailsPage.email')}</p>
                    <p className="font-semibold text-gray-900">
                      {booking.contact_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-gray-600 mr-3 mt-1"
                  />
                  <div>
                    <p className="text-sm text-gray-600">{t('bookingDetailsPage.phone')}</p>
                    <p className="font-semibold text-gray-900">
                      {booking.contact_phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Only show if actions are available */}
            {hasActions && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('bookingDetailsPage.actions')}</h3>
                <div className="space-y-3">
                  {/* Pay Now Button - Only show if quote is not expired */}
                  {booking.status === "Quote Sent" &&
                    booking.payment_status !== "paid" &&
                    !timeRemaining?.expired && (
                      <button
                        onClick={() =>
                          navigate(`/my-bookings/${booking.id}/payment`)
                        }
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                        {t('bookingDetailsPage.payNow')}
                      </button>
                    )}

                  {/* Cancel Button */}
                  {canCancel && (
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                      className="w-full px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? t('bookingDetailsPage.cancelling') : t('bookingDetailsPage.cancelBooking')}
                    </button>
                  )}

                  {/* Leave Review Button */}
                  {booking.status === "Trip Completed" && (
                    <button
                      onClick={() => navigate(`/review/${booking.id}`)}
                      className="w-full px-6 py-3 border-2 border-purple-500 text-purple-500 rounded-lg hover:bg-purple-50 transition-colors font-bold"
                    >
                      {t('bookingDetailsPage.leaveReview')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Status-specific Messages */}
            {booking.status === "Inquiry Pending" && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-yellow-600 text-xl mt-1 mr-3"
                  />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">{t('bookingDetailsPage.responseExpected')}</p>
                    <p>
                      {t('bookingDetailsPage.responseExpectedDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {booking.status === "Payment Confirmed" &&
              booking.can_cancel_with_refund && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-green-600 text-xl mt-1 mr-3"
                    />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">
                        {t('bookingDetailsPage.freeCancellationAvailable')}
                      </p>
                      <p>
                        {t('bookingDetailsPage.freeCancellationDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
