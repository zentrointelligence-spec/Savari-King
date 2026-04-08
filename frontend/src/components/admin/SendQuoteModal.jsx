import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEnvelope,
  faMoneyBillWave,
  faFileInvoice,
  faBox,
  faCar,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const SendQuoteModal = ({ booking, onClose, onSend }) => {
  const [sending, setSending] = useState(false);

  // Calculate price breakdown
  const priceBreakdown = useMemo(() => {
    const numAdults = booking?.num_adults || 0;
    const numChildren = booking?.num_children || 0;
    const totalParticipants = numAdults + numChildren;

    // Parse selected addons and vehicles from JSONB
    const selectedAddons = Array.isArray(booking?.selected_addons)
      ? booking.selected_addons
      : (typeof booking?.selected_addons === 'string'
        ? JSON.parse(booking.selected_addons)
        : []);

    const selectedVehicles = Array.isArray(booking?.selected_vehicles)
      ? booking.selected_vehicles
      : (typeof booking?.selected_vehicles === 'string'
        ? JSON.parse(booking.selected_vehicles)
        : []);

    // Calculate tier price (base price × participants)
    const tierPrice = (booking?.tier_price || 0) * totalParticipants;

    // Calculate addons total
    const addonsTotal = selectedAddons.reduce((sum, addon) => {
      const addonPrice = addon.price || 0;
      return sum + (addonPrice * totalParticipants);
    }, 0);

    // Calculate vehicles total
    const vehiclesTotal = selectedVehicles.reduce((sum, vehicle) => {
      const vehiclePrice = vehicle.price || 0;
      const vehicleQuantity = vehicle.quantity || 0;
      return sum + (vehiclePrice * vehicleQuantity);
    }, 0);

    const totalPrice = tierPrice + addonsTotal + vehiclesTotal;

    return {
      tierPrice,
      addonsTotal,
      vehiclesTotal,
      totalPrice,
      totalParticipants,
      selectedAddons,
      selectedVehicles
    };
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSending(true);
    await onSend(booking.id, priceBreakdown.totalPrice);
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FontAwesomeIcon icon={faEnvelope} className="mr-3" />
              Send Quote
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Booking Reference: {booking?.booking_reference}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:text-primary rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FontAwesomeIcon icon={faFileInvoice} className="mr-2 text-primary" />
              Booking Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Customer:</p>
                <p className="font-semibold">{booking?.contact_name || booking?.user_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Tour:</p>
                <p className="font-semibold">{booking?.tour_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Travel Date:</p>
                <p className="font-semibold">
                  {booking?.travel_date
                    ? new Date(booking.travel_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Travelers:</p>
                <p className="font-semibold">
                  {booking?.num_adults || 0} Adults, {booking?.num_children || 0} Children
                </p>
              </div>
              <div>
                <p className="text-gray-600">Package Tier:</p>
                <p className="font-semibold">{booking?.tier_name || "Standard"}</p>
              </div>
              <div>
                <p className="text-gray-600">Estimated Price:</p>
                <p className="font-semibold text-primary">
                  ₹{(booking?.estimated_price || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-primary" />
              Price Breakdown
            </h3>

            {/* Package/Tier Price */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBox} className="text-primary mr-2" />
                  <span className="font-medium text-gray-900">
                    Package: {booking?.tier_name || "Standard"}
                  </span>
                </div>
                <span className="text-gray-600">
                  ₹{(booking?.tier_price || 0).toLocaleString("en-IN")} × {priceBreakdown.totalParticipants}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-gray-900">
                  ₹{priceBreakdown.tierPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Addons */}
            {priceBreakdown.selectedAddons.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                <div className="font-medium text-gray-900 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faBox} className="text-green-600 mr-2" />
                  Add-ons ({priceBreakdown.selectedAddons.length})
                </div>
                {priceBreakdown.selectedAddons.map((addon, index) => {
                  const addonPrice = addon.price || 0;
                  return (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700">{addon.name || 'Unknown Add-on'}</span>
                      <span className="text-sm text-gray-600">
                        ₹{addonPrice.toLocaleString("en-IN")} × {priceBreakdown.totalParticipants} =
                        <span className="font-semibold ml-2">
                          ₹{(addonPrice * priceBreakdown.totalParticipants).toLocaleString("en-IN")}
                        </span>
                      </span>
                    </div>
                  );
                })}
                <div className="text-right mt-2 pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{priceBreakdown.addonsTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {/* Vehicles */}
            {priceBreakdown.selectedVehicles.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                <div className="font-medium text-gray-900 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faCar} className="text-blue-600 mr-2" />
                  Vehicles ({priceBreakdown.selectedVehicles.length})
                </div>
                {priceBreakdown.selectedVehicles.map((vehicle, index) => {
                  const vehiclePrice = vehicle.price || 0;
                  const vehicleQuantity = vehicle.quantity || 0;
                  return (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700">{vehicle.name || 'Unknown Vehicle'}</span>
                      <span className="text-sm text-gray-600">
                        ₹{vehiclePrice.toLocaleString("en-IN")} × {vehicleQuantity} =
                        <span className="font-semibold ml-2">
                          ₹{(vehiclePrice * vehicleQuantity).toLocaleString("en-IN")}
                        </span>
                      </span>
                    </div>
                  );
                })}
                <div className="text-right mt-2 pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{priceBreakdown.vehiclesTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {/* Total Price */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Price</span>
                <span className="text-2xl font-bold">
                  ₹{priceBreakdown.totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-xs opacity-90 mt-2">
                This price is locked and will be sent to the customer
              </p>
            </div>
          </div>

          {/* Special Requests (if any) */}
          {booking?.special_requests && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Customer's Special Requests:
              </h4>
              <p className="text-sm text-blue-800">{booking.special_requests}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Sending Quote...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Send Quote to Customer
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>Note:</strong> After sending the quote, an email will be automatically
              sent to the customer with detailed and general quote PDFs attached. The customer
              will also be able to download the quotes from their account. The quote will be
              valid for 48 hours.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendQuoteModal;
