import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faPlus,
  faTrash,
  faSave,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

const PricingSection = ({ booking, revision, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [discounts, setDiscounts] = useState(revision?.discounts || []);
  const [fees, setFees] = useState(revision?.additional_fees || []);
  const [customerMessage, setCustomerMessage] = useState(revision?.customer_message || '');
  const [showVehiclesBreakdown, setShowVehiclesBreakdown] = useState(false);
  const [showAddonsBreakdown, setShowAddonsBreakdown] = useState(false);

  // Update state when revision changes (e.g., after auto-validate)
  useEffect(() => {
    if (revision) {
      setDiscounts(revision.discounts || []);
      setFees(revision.additional_fees || []);
      setCustomerMessage(revision.customer_message || '');
    }
  }, [revision]);

  const basePrice = parseFloat(revision?.base_price || 0) || 0;

  // Get vehicle and addon details
  const vehicles = revision?.vehicles_adjusted || booking.selected_vehicles || [];
  const addons = revision?.addons_adjusted || booking.selected_addons || [];
  const durationDays = booking.duration_days || 1;
  const totalParticipants = (booking.num_adults || 0) + (booking.num_children || 0);

  // Helper function to calculate vehicle total price
  const calculateVehicleTotalPrice = (vehicle) => {
    // Backend sends price per day (base_price_inr from vehicles table)
    const pricePerDay = parseFloat(vehicle.price || vehicle.adjusted_price || vehicle.original_price || 0);
    const quantity = vehicle.quantity || vehicle.adjusted_quantity || 1;
    return pricePerDay * durationDays * quantity;
  };

  // Helper function to calculate addon total price
  const calculateAddonTotalPrice = (addon) => {
    const unitPrice = parseFloat(addon.price || addon.adjusted_price || addon.original_price || 0);
    const quantity = addon.quantity || addon.adjusted_quantity || 1;
    const isPerPerson = addon.price_per_person !== false;

    if (isPerPerson && totalParticipants > 0) {
      return unitPrice * totalParticipants;
    } else {
      return unitPrice * quantity;
    }
  };

  // Calculate vehicles total using correct formula
  const vehiclesPrice = vehicles.reduce((sum, vehicle) => sum + calculateVehicleTotalPrice(vehicle), 0);

  // Calculate addons total using correct formula
  const addonsPrice = addons.reduce((sum, addon) => sum + calculateAddonTotalPrice(addon), 0);

  // Calculate subtotal with corrected prices
  const subtotal = basePrice + vehiclesPrice + addonsPrice;

  const totalDiscounts = discounts.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const totalFees = fees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
  const finalPrice = subtotal - totalDiscounts + totalFees;

  const addDiscount = () => {
    const newDiscount = {
      id: `disc_${Date.now()}`,
      type: 'custom',
      name: '',
      amount: 0,
      percentage: 0,
      reason: '',
      auto_applied: false
    };
    setDiscounts([...discounts, newDiscount]);
  };

  const addFee = () => {
    const newFee = {
      id: `fee_${Date.now()}`,
      type: 'custom',
      name: '',
      amount: 0,
      percentage: 0,
      reason: '',
      auto_applied: false
    };
    setFees([...fees, newFee]);
  };

  const removeDiscount = (id) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  const removeFee = (id) => {
    setFees(fees.filter(f => f.id !== id));
  };

  const updateDiscount = (id, field, value) => {
    setDiscounts(discounts.map(d =>
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const updateFee = (id, field, value) => {
    setFees(fees.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const handleSave = () => {
    onUpdate({
      base_price: basePrice,
      vehicles_price: vehiclesPrice,
      addons_price: addonsPrice,
      discounts,
      total_discounts: totalDiscounts,
      additional_fees: fees,
      total_fees: totalFees,
      final_price: finalPrice
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer bg-gradient-to-r from-green-50 to-green-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">6. Final Pricing</h3>
              <p className="text-sm text-gray-600">Configure discounts, fees, and final price</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Final Price</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{finalPrice.toLocaleString('en-IN')}
              </p>
            </div>
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className="text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          {/* Price Breakdown */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h4 className="font-bold text-gray-900 mb-4">Price Breakdown</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-700">Base Price</span>
                <span className="font-semibold">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>

              {vehiclesPrice > 0 && (
                <div>
                  <div
                    className="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => setShowVehiclesBreakdown(!showVehiclesBreakdown)}
                  >
                    <span className="text-gray-700 flex items-center">
                      Vehicles
                      <FontAwesomeIcon
                        icon={showVehiclesBreakdown ? faChevronUp : faChevronDown}
                        className="ml-2 text-xs text-gray-500"
                      />
                    </span>
                    <span className="font-semibold">₹{vehiclesPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {showVehiclesBreakdown && vehicles.length > 0 && (
                    <div className="ml-4 mt-2 mb-3 p-3 bg-blue-50 rounded-lg space-y-2">
                      <div className="text-xs font-semibold text-blue-800 mb-2">
                        Tour Duration: {durationDays} day{durationDays > 1 ? 's' : ''}
                      </div>
                      {vehicles.map((vehicle, idx) => {
                        const pricePerDay = parseFloat(vehicle.price || vehicle.adjusted_price || vehicle.original_price || 0);
                        const quantity = vehicle.quantity || vehicle.adjusted_quantity || 1;
                        const vehicleName = vehicle.name || vehicle.vehicle_name || 'Vehicle';

                        return (
                          <div key={idx} className="text-sm bg-white p-2 rounded">
                            <div className="font-medium text-gray-800">{vehicleName}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              ₹{pricePerDay.toLocaleString('en-IN')}/day × {durationDays} day{durationDays > 1 ? 's' : ''} × {quantity} vehicle{quantity > 1 ? 's' : ''}
                              = <span className="font-semibold text-green-600">₹{calculateVehicleTotalPrice(vehicle).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {addonsPrice > 0 && (
                <div>
                  <div
                    className="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => setShowAddonsBreakdown(!showAddonsBreakdown)}
                  >
                    <span className="text-gray-700 flex items-center">
                      Add-ons
                      <FontAwesomeIcon
                        icon={showAddonsBreakdown ? faChevronUp : faChevronDown}
                        className="ml-2 text-xs text-gray-500"
                      />
                    </span>
                    <span className="font-semibold">₹{addonsPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {showAddonsBreakdown && addons.length > 0 && (
                    <div className="ml-4 mt-2 mb-3 p-3 bg-green-50 rounded-lg space-y-2">
                      <div className="text-xs font-semibold text-green-800 mb-2">
                        Total Participants: {totalParticipants} ({booking.num_adults || 0} adults + {booking.num_children || 0} children)
                      </div>
                      {addons.map((addon, idx) => {
                        const unitPrice = parseFloat(addon.price || addon.adjusted_price || addon.original_price || 0);
                        const quantity = addon.quantity || addon.adjusted_quantity || 1;
                        const isPerPerson = addon.price_per_person !== false;
                        const addonName = addon.name || addon.addon_name || 'Add-on';

                        return (
                          <div key={idx} className="text-sm bg-white p-2 rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-800">{addonName}</div>
                                {isPerPerson && (
                                  <div className="text-xs text-blue-600 font-medium">Per Person</div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              ₹{unitPrice.toLocaleString('en-IN')}/{isPerPerson ? 'person' : 'unit'} × {isPerPerson ? `${totalParticipants} participants` : `${quantity} unit${quantity > 1 ? 's' : ''}`}
                              = <span className="font-semibold text-green-600">₹{calculateAddonTotalPrice(addon).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 mt-2">
                <span className="font-bold text-gray-900">Subtotal</span>
                <span className="font-bold text-lg">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Discounts Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900">Discounts</h4>
              <button
                onClick={addDiscount}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Discount
              </button>
            </div>

            {discounts.length > 0 ? (
              <div className="space-y-3">
                {discounts.map((discount) => (
                  <div key={discount.id} className={`p-4 rounded-lg border ${
                    discount.auto_applied
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="grid grid-cols-4 gap-3 mb-2">
                      <input
                        type="text"
                        value={discount.name}
                        onChange={(e) => updateDiscount(discount.id, 'name', e.target.value)}
                        placeholder="Discount name"
                        readOnly={discount.auto_applied}
                        className={`px-3 py-2 border rounded-lg ${
                          discount.auto_applied ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      />
                      <input
                        type="number"
                        value={discount.amount}
                        onChange={(e) => updateDiscount(discount.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Amount"
                        readOnly={discount.auto_applied}
                        className={`px-3 py-2 border rounded-lg ${
                          discount.auto_applied ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      />
                      <input
                        type="text"
                        value={discount.reason}
                        onChange={(e) => updateDiscount(discount.id, 'reason', e.target.value)}
                        placeholder="Reason"
                        readOnly={discount.auto_applied}
                        className={`px-3 py-2 border rounded-lg ${
                          discount.auto_applied ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      />
                      {discount.auto_applied ? (
                        <div className="flex items-center justify-center">
                          <span className="text-xs bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold">
                            Auto-applied
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => removeDiscount(discount.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <span className="text-green-600 font-semibold">
                    Total Discounts: -₹{totalDiscounts.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No discounts applied</p>
            )}
          </div>

          {/* Fees Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900">Additional Fees</h4>
              <button
                onClick={addFee}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Fee
              </button>
            </div>

            {fees.length > 0 ? (
              <div className="space-y-3">
                {fees.map((fee) => (
                  <div key={fee.id} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="grid grid-cols-4 gap-3 mb-2">
                      <input
                        type="text"
                        value={fee.name}
                        onChange={(e) => updateFee(fee.id, 'name', e.target.value)}
                        placeholder="Fee name"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={fee.amount}
                        onChange={(e) => updateFee(fee.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Amount"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={fee.reason}
                        onChange={(e) => updateFee(fee.id, 'reason', e.target.value)}
                        placeholder="Reason"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={() => removeFee(fee.id)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                    {fee.auto_applied && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Auto-applied</span>
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <span className="text-orange-600 font-semibold">
                    Total Fees: +₹{totalFees.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No additional fees</p>
            )}
          </div>

          {/* Final Total */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">FINAL PRICE</span>
              <span className="text-3xl font-bold">₹{finalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Customer Message */}
          <div className="mb-6">
            <label className="block font-bold text-gray-900 mb-2">
              Message to Customer (included in quote email)
            </label>
            <textarea
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              rows="4"
              placeholder="Add a personalized message for the customer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center text-lg font-semibold"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Save Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
