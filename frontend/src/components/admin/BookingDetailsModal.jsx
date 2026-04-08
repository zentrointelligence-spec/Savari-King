import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUser,
  faCalendarAlt,
  faMapMarkerAlt,
  faMoneyBillWave,
  faInfoCircle,
  faEnvelope,
  faPhone,
  faCar,
  faPlus,
  faFileAlt,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faPaperPlane,
  faCreditCard,
  faClipboard,
  faStickyNote,
  faUsers,
  faChild,
  faBaby,
} from '@fortawesome/free-solid-svg-icons';

const BookingDetailsModal = ({ booking, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!booking) return null;

  // Parse JSON fields safely
  const selectedAddons = (() => {
    try {
      return typeof booking.selected_addons === 'string'
        ? JSON.parse(booking.selected_addons)
        : booking.selected_addons || [];
    } catch {
      return [];
    }
  })();

  const selectedVehicles = (() => {
    try {
      return typeof booking.selected_vehicles === 'string'
        ? JSON.parse(booking.selected_vehicles)
        : booking.selected_vehicles || [];
    } catch {
      return [];
    }
  })();

  const participantAges = (() => {
    try {
      return typeof booking.participant_ages === 'string'
        ? JSON.parse(booking.participant_ages)
        : booking.participant_ages || [];
    } catch {
      return [];
    }
  })();

  // Calculate price breakdown
  const estimatedPrice = parseFloat(booking.estimated_price) || 0;
  const finalPrice = parseFloat(booking.final_price) || 0;
  const displayPrice = finalPrice || estimatedPrice;

  // Format currency
  const formatCurrency = (amount) => {
    const currency = booking.currency || 'INR';
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
    return `${symbol}${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Inquiry Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: faClock },
      'Quote Sent': { bg: 'bg-blue-100', text: 'text-blue-800', icon: faPaperPlane },
      'Payment Confirmed': { bg: 'bg-green-100', text: 'text-green-800', icon: faCheckCircle },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: faTimesCircle },
      'Trip Completed': { bg: 'bg-gray-200', text: 'text-gray-800', icon: faCheckCircle },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: faInfoCircle };

    return (
      <span className={`${config.bg} ${config.text} px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center w-fit`}>
        <FontAwesomeIcon icon={config.icon} className="mr-2" />
        {status}
      </span>
    );
  };

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: faInfoCircle },
    { id: 'customer', label: 'Customer', icon: faUser },
    { id: 'pricing', label: 'Pricing', icon: faMoneyBillWave },
    { id: 'timeline', label: 'Timeline', icon: faClock },
    { id: 'notes', label: 'Notes', icon: faStickyNote },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-6 flex justify-between items-start sticky top-0 z-10">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">Booking Details</h2>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClipboard} className="mr-2" />
                <span className="font-mono font-semibold text-lg">
                  {booking.booking_reference || `#${booking.id}`}
                </span>
              </div>
              <div>•</div>
              <div>
                Created {formatDateShort(booking.inquiry_date || booking.created_at)}
              </div>
            </div>
            <div className="mt-3">
              {getStatusBadge(booking.status)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:text-primary rounded-full w-10 h-10 flex items-center justify-center transition-colors ml-4"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Tour Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-primary" />
                  Tour Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tour Name</p>
                    <p className="font-semibold text-lg text-gray-900">{booking.tour_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Destination</p>
                    <p className="font-semibold text-gray-900">
                      {booking.destination || booking.destinations || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Package Tier</p>
                    <p className="font-semibold text-gray-900">
                      {booking.tier_name || 'Standard'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Travel Date</p>
                    <p className="font-semibold text-gray-900 flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-primary" />
                      {formatDateShort(booking.travel_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Travelers Information */}
              <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="mr-3 text-primary" />
                  Travelers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Adults</p>
                      <p className="text-2xl font-bold text-gray-900">{booking.num_adults || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FontAwesomeIcon icon={faChild} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Children</p>
                      <p className="text-2xl font-bold text-gray-900">{booking.num_children || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FontAwesomeIcon icon={faUsers} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(parseInt(booking.num_adults) || 0) + (parseInt(booking.num_children) || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                {participantAges.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Participant Ages:</p>
                    <div className="flex flex-wrap gap-2">
                      {participantAges.map((age, index) => (
                        <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border border-gray-200">
                          {age} years
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Addons */}
              {selectedAddons.length > 0 && (
                <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faPlus} className="mr-3 text-primary" />
                    Selected Add-ons
                  </h3>
                  <div className="space-y-3">
                    {selectedAddons.map((addon, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <FontAwesomeIcon icon={faPlus} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{addon.addon_name || addon.name || `Addon #${addon.addon_id}`}</p>
                            <p className="text-sm text-gray-600">Quantity: {addon.quantity || 1}</p>
                          </div>
                        </div>
                        {addon.price && (
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(parseFloat(addon.price) * (addon.quantity || 1))}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles */}
              {selectedVehicles.length > 0 && (
                <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faCar} className="mr-3 text-primary" />
                    Additional Vehicles
                  </h3>
                  <div className="space-y-3">
                    {selectedVehicles.map((vehicle, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FontAwesomeIcon icon={faCar} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{vehicle.vehicle_name || vehicle.name || `Vehicle #${vehicle.vehicle_id}`}</p>
                            <p className="text-sm text-gray-600">Quantity: {vehicle.quantity || 1}</p>
                          </div>
                        </div>
                        {vehicle.price_per_day && (
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(parseFloat(vehicle.price_per_day) * (vehicle.quantity || 1))} /day
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Tab */}
          {activeTab === 'customer' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-3 text-primary" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">Full Name</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {booking.contact_name || booking.user_name || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">User Account</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {booking.user_name || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                      Email Address
                    </p>
                    <a
                      href={`mailto:${booking.contact_email || booking.user_email}`}
                      className="font-semibold text-primary hover:text-primary-dark hover:underline"
                    >
                      {booking.contact_email || booking.user_email || 'N/A'}
                    </a>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400" />
                      Phone Number
                    </p>
                    <a
                      href={`tel:${booking.contact_phone}`}
                      className="font-semibold text-primary hover:text-primary-dark hover:underline"
                    >
                      {booking.contact_phone || 'N/A'}
                    </a>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                      Country
                    </p>
                    <p className="font-semibold text-lg text-gray-900">
                      {booking.contact_country || booking.user_country || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.special_requests && (
                <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-yellow-900 mb-3 flex items-center">
                    <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                    Special Requests
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{booking.special_requests}</p>
                </div>
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="mr-3 text-primary" />
                  Price Breakdown
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <span className="text-gray-700">Estimated Price</span>
                    <span className="font-semibold text-lg">{formatCurrency(estimatedPrice)}</span>
                  </div>

                  {finalPrice > 0 && (
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                      <span className="text-gray-700">Final Price (After Quote)</span>
                      <span className="font-semibold text-lg text-green-600">{formatCurrency(finalPrice)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <span className="text-gray-700">Currency</span>
                    <span className="font-semibold">{booking.currency || 'INR'}</span>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4 mt-4">
                    <div className="flex justify-between items-center p-4 bg-primary text-white rounded-lg">
                      <span className="font-bold text-lg">Total Amount</span>
                      <span className="font-bold text-2xl">{formatCurrency(displayPrice)}</span>
                    </div>
                  </div>
                </div>

                {booking.quote_details && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Quote Details:</h4>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">{booking.quote_details}</p>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              {(booking.payment_method || booking.payment_transaction_id) && (
                <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-3 text-primary" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.payment_method && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                        <p className="font-semibold text-gray-900">{booking.payment_method}</p>
                      </div>
                    )}
                    {booking.payment_transaction_id && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                        <p className="font-mono text-sm font-semibold text-gray-900">{booking.payment_transaction_id}</p>
                      </div>
                    )}
                    {booking.payment_timestamp && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(booking.payment_timestamp)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-3 text-primary" />
                  Booking Timeline
                </h3>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Timeline Items */}
                  <div className="space-y-8">
                    {/* Inquiry Date */}
                    <div className="relative flex items-start gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white z-10">
                        <FontAwesomeIcon icon={faFileAlt} className="text-blue-600" />
                      </div>
                      <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-900">Inquiry Submitted</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(booking.inquiry_date || booking.created_at)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Customer submitted booking inquiry
                        </p>
                      </div>
                    </div>

                    {/* Quote Sent */}
                    {booking.quote_sent_date && (
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center border-4 border-white z-10">
                          <FontAwesomeIcon icon={faPaperPlane} className="text-purple-600" />
                        </div>
                        <div className="flex-1 bg-purple-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900">Quote Sent</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(booking.quote_sent_date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Admin sent price quote to customer
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quote Expiration */}
                    {booking.quote_expiration_date && (
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white z-10">
                          <FontAwesomeIcon icon={faClock} className="text-orange-600" />
                        </div>
                        <div className="flex-1 bg-orange-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900">Quote Expiration</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(booking.quote_expiration_date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Quote validity period ends
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Confirmed */}
                    {booking.payment_timestamp && (
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center border-4 border-white z-10">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                        </div>
                        <div className="flex-1 bg-green-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900">Payment Confirmed</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(booking.payment_timestamp)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Payment received and confirmed
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Trip Completed */}
                    {booking.completion_date && (
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white z-10">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 bg-indigo-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900">Trip Completed</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(booking.completion_date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Trip marked as completed by admin
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cancelled */}
                    {booking.cancellation_date && (
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border-4 border-white z-10">
                          <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                        </div>
                        <div className="flex-1 bg-red-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900">Booking Cancelled</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(booking.cancellation_date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Booking was cancelled
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Last Updated */}
                    {booking.updated_at && (
                      <div className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white z-10">
                          <FontAwesomeIcon icon={faClock} className="text-gray-600" />
                        </div>
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900">Last Updated</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(booking.updated_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Admin Notes */}
              <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faStickyNote} className="mr-3 text-primary" />
                  Admin Notes (Internal)
                </h3>
                {booking.admin_notes ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{booking.admin_notes}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No admin notes available</p>
                )}
              </div>

              {/* Special Requests */}
              <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faFileAlt} className="mr-3" />
                  Customer Special Requests
                </h3>
                {booking.special_requests ? (
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{booking.special_requests}</p>
                  </div>
                ) : (
                  <p className="text-yellow-700 italic">No special requests from customer</p>
                )}
              </div>

              {/* Quote Details */}
              {booking.quote_details && (
                <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-3" />
                    Quote Details Sent to Customer
                  </h3>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{booking.quote_details}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center sticky bottom-0">
          <div className="text-sm text-gray-600">
            <strong>ID:</strong> {booking.id} | <strong>Reference:</strong> {booking.booking_reference || 'N/A'}
          </div>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
