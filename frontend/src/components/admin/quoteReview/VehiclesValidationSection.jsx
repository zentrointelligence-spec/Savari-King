import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../contexts/AuthContext';
import API_CONFIG, { buildApiUrl, getAuthHeaders } from '../../../config/api';
import { toast } from 'react-toastify';
import ValidationSectionTemplate from './ValidationSectionTemplate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const VehiclesValidationSection = ({ booking, revision, onUpdate, autoValidation, isExpanded, onToggleExpand }) => {
  const { token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    vehicles_validated: revision?.vehicles_validated || false,
    vehicles_total_capacity: revision?.vehicles_total_capacity || 0,
    vehicles_capacity_sufficient: revision?.vehicles_capacity_sufficient || false,
    vehicles_availability_confirmed: revision?.vehicles_availability_confirmed || false,
    vehicles_notes: revision?.vehicles_notes || ''
  });
  // Update formData when revision changes (e.g., after auto-validate)
  useEffect(() => {
    if (revision) {
      setFormData(prev => ({
        ...prev,
        vehicles_validated: revision.vehicles_validated || false,
        vehicles_availability_confirmed: revision.vehicles_availability_confirmed || false,
        vehicles_capacity_sufficient: revision.vehicles_capacity_sufficient || false,
        vehicles_notes: revision.vehicles_notes || prev.vehicles_notes
      }));
    }
  }, [revision?.vehicles_validated, revision?.vehicles_availability_confirmed, revision?.vehicles_capacity_sufficient]);


  const [detailedEditMode, setDetailedEditMode] = useState(false);
  const [detailedVehicles, setDetailedVehicles] = useState([]);

  // Initialize detailed vehicles from adjusted or original data
  useEffect(() => {
    const vehicles = revision?.vehicles_original || booking.selected_vehicles || [];
    const adjusted = revision?.vehicles_adjusted;
    const durationDays = booking.duration_days || 1;

    if (adjusted && Array.isArray(adjusted) && adjusted.length > 0) {
      // Use adjusted data if available
      // Backend sends price per day (base_price_inr from vehicles table)
      setDetailedVehicles(adjusted.map(v => ({
        name: v.name || v.vehicle_name || '',
        quantity: v.adjusted_quantity || v.quantity || 1,
        pricePerDay: parseFloat(v.adjusted_price || v.price || v.original_price || 0),
        capacity: v.capacity || 0
      })));
    } else {
      // Use original data
      // Backend sends price per day (base_price_inr from vehicles table)
      setDetailedVehicles(vehicles.map(v => ({
        name: v.name || v.vehicle_name || '',
        quantity: v.quantity || 1,
        pricePerDay: parseFloat(v.price || v.original_price || 0),
        capacity: v.capacity || 0
      })));
    }

    // Auto-calculate total capacity
    const totalCap = detailedVehicles.reduce((sum, v) => sum + (v.capacity * v.quantity), 0);
    if (totalCap > 0 && !formData.vehicles_total_capacity) {
      setFormData(prev => ({
        ...prev,
        vehicles_total_capacity: totalCap
      }));
    }
  }, [revision, booking]);

  // Recalculate total capacity when vehicles change
  useEffect(() => {
    const totalCap = detailedVehicles.reduce((sum, v) => sum + (v.capacity * v.quantity), 0);
    setFormData(prev => ({
      ...prev,
      vehicles_total_capacity: totalCap
    }));
  }, [detailedVehicles]);

  const handleSave = () => onUpdate(formData);

  const handleDetailedSave = async () => {
    try {
      // Filter out vehicles with quantity = 0 (means they are removed)
      const activeVehicles = detailedVehicles.filter(v => v.quantity > 0);

      const durationDays = booking.duration_days || 1;

      // Transform to match backend expected format
      // Important: price = pricePerDay × duration (total price for the vehicle for the entire tour)
      const vehicles_adjusted = activeVehicles.map(v => ({
        name: v.name,
        vehicle_name: v.name,
        quantity: v.quantity,
        adjusted_quantity: v.quantity,
        price: v.pricePerDay * durationDays, // Total price per vehicle for the tour
        adjusted_price: v.pricePerDay * durationDays,
        original_price: v.pricePerDay * durationDays,
        capacity: v.capacity
      }));

      // Call the vehicles-detailed endpoint directly
      const response = await axios.patch(
        buildApiUrl(`/api/bookings/${booking.id}/review/${revision.id}/vehicles-detailed`),
        {
          vehicles_adjusted,
          vehicle_modifications_notes: `Updated via admin review. Price calculation: Price/day (₹${activeVehicles[0]?.pricePerDay}) × ${durationDays} days × quantity`
        },
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success('Vehicles updated successfully!');
        setDetailedEditMode(false);

        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating vehicles:', error);
      toast.error('Failed to update vehicles');
    }
  };

  const handleDetailedCancel = () => {
    setDetailedEditMode(false);
    // Reset to original values
    const vehicles = revision?.vehicles_original || booking.selected_vehicles || [];
    const adjusted = revision?.vehicles_adjusted;

    if (adjusted && Array.isArray(adjusted) && adjusted.length > 0) {
      setDetailedVehicles(adjusted.map(v => ({
        name: v.name || v.vehicle_name || '',
        quantity: v.adjusted_quantity || v.quantity || 1,
        // Backend sends price per day (base_price_inr from vehicles table)
        pricePerDay: parseFloat(v.adjusted_price || v.price || v.original_price || 0),
        capacity: v.capacity || 0
      })));
    } else {
      setDetailedVehicles(vehicles.map(v => ({
        name: v.name || v.vehicle_name || '',
        quantity: v.quantity || 1,
        // Backend sends price per day (base_price_inr from vehicles table)
        pricePerDay: parseFloat(v.price || v.original_price || 0),
        capacity: v.capacity || 0
      })));
    }
  };

  const updateVehicleDetail = (index, field, value) => {
    const updated = [...detailedVehicles];
    updated[index] = { ...updated[index], [field]: value };
    setDetailedVehicles(updated);
  };

  const vehicles = revision?.vehicles_original || booking.selected_vehicles || [];
  const totalParticipants = (booking.num_adults || 0) + (booking.num_children || 0);
  const durationDays = booking.duration_days || 1;

  // Helper function to calculate total price for a vehicle
  const calculateVehicleTotalPrice = (vehicle) => {
    return vehicle.pricePerDay * durationDays * vehicle.quantity;
  };

  return (
    <ValidationSectionTemplate
      sectionNumber={2}
      title="Vehicles Validation"
      description="Verify vehicle selection and capacity"
      revision={revision}
      validatedField="vehicles_validated"
      onSave={handleSave}
      autoValidation={autoValidation}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-4">
        {/* Detailed Edit Mode Button */}
        {!detailedEditMode && vehicles.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => setDetailedEditMode(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit Quantities & Prices
            </button>
          </div>
        )}

        {/* Vehicles List - View or Edit Mode */}
        {vehicles.length > 0 ? (
          detailedEditMode ? (
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-semibold text-lg">Edit Vehicles Details</h5>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDetailedSave}
                    className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleDetailedCancel}
                    className="bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors flex items-center text-sm"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {detailedVehicles.map((vehicle, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg shadow transition-all ${
                      vehicle.quantity === 0
                        ? 'bg-red-50 border-2 border-red-300 opacity-60'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-semibold text-gray-700">{vehicle.name}</div>
                      {vehicle.quantity === 0 && (
                        <span className="text-xs font-bold text-red-600 bg-red-200 px-2 py-1 rounded">
                          WILL BE REMOVED
                        </span>
                      )}
                    </div>
                    {/* Tour Duration Info */}
                    <div className="mb-3 p-2 bg-blue-100 rounded text-sm">
                      <span className="font-semibold">Tour Duration:</span> {durationDays} day{durationDays > 1 ? 's' : ''}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Quantity (Number of Vehicles) <span className="text-gray-400">(0 = remove)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={vehicle.quantity}
                          onChange={(e) => updateVehicleDetail(idx, 'quantity', parseInt(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Price Per Day (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={vehicle.pricePerDay}
                          onChange={(e) => updateVehicleDetail(idx, 'pricePerDay', parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Price Calculation Breakdown */}
                    <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Price for 1 Vehicle</div>
                        <div className="font-semibold text-blue-600">
                          ₹{(vehicle.pricePerDay * durationDays).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          (₹{vehicle.pricePerDay.toLocaleString('en-IN')}/day × {durationDays} day{durationDays > 1 ? 's' : ''})
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Quantity</div>
                        <div className="font-semibold">× {vehicle.quantity}</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Total Price
                        </label>
                        <div className="px-3 py-2 bg-green-100 rounded-lg font-bold text-green-700">
                          ₹{calculateVehicleTotalPrice(vehicle).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Capacity: {vehicle.capacity} per vehicle | Total: {vehicle.quantity * vehicle.capacity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-blue-100 p-3 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Vehicles Cost:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{detailedVehicles.reduce((sum, v) => sum + calculateVehicleTotalPrice(v), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div>Total Capacity: {detailedVehicles.reduce((sum, v) => sum + (v.capacity * v.quantity), 0)} passengers</div>
                    <div>Total Vehicles: {detailedVehicles.reduce((sum, v) => sum + v.quantity, 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-3">Selected Vehicles</h5>

              {/* Tour Duration Display */}
              <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                <div className="font-semibold text-blue-800">
                  Tour Duration: {durationDays} day{durationDays > 1 ? 's' : ''}
                </div>
              </div>

              {detailedVehicles.map((vehicle, idx) => (
                <div key={idx} className="p-3 mb-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg">{vehicle.name}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: <span className="font-medium">{vehicle.quantity}</span> vehicle{vehicle.quantity > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-600">
                        Capacity: <span className="font-medium">{vehicle.capacity}</span> per vehicle |
                        Total: <span className="font-medium text-blue-600">{vehicle.capacity * vehicle.quantity}</span> passengers
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ₹{calculateVehicleTotalPrice(vehicle).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500">Total Price</div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Price per day:</span>
                      <span className="font-medium">₹{vehicle.pricePerDay.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{durationDays} day{durationDays > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price for 1 vehicle:</span>
                      <span className="font-medium">₹{(vehicle.pricePerDay * durationDays).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 font-semibold">
                      <span>Total ({vehicle.quantity} × ₹{(vehicle.pricePerDay * durationDays).toLocaleString('en-IN')}):</span>
                      <span className="text-green-600">₹{calculateVehicleTotalPrice(vehicle).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary Section */}
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-700">Total Vehicles:</div>
                    <div className="font-bold text-lg">{detailedVehicles.reduce((sum, v) => sum + v.quantity, 0)}</div>
                  </div>
                  <div>
                    <div className="text-gray-700">Total Capacity:</div>
                    <div className="font-bold text-lg text-blue-600">
                      {detailedVehicles.reduce((sum, v) => sum + (v.capacity * v.quantity), 0)} passengers
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Grand Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{detailedVehicles.reduce((sum, v) => sum + calculateVehicleTotalPrice(v), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <p className="text-gray-600">No vehicles selected</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Capacity <span className="text-xs text-gray-500">(Auto-calculated)</span>
            </label>
            <input
              type="number"
              value={formData.vehicles_total_capacity}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              title="This field is automatically calculated from vehicle capacities"
            />
            <div className="text-xs text-gray-600 mt-1">
              Calculated: {detailedVehicles.reduce((sum, v) => sum + (v.capacity * v.quantity), 0)} passengers
            </div>
          </div>
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.vehicles_capacity_sufficient}
                onChange={(e) => setFormData({ ...formData, vehicles_capacity_sufficient: e.target.checked })}
                className="w-5 h-5"
              />
              <span>Capacity is sufficient ({totalParticipants} participants)</span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.vehicles_availability_confirmed}
              onChange={(e) => setFormData({ ...formData, vehicles_availability_confirmed: e.target.checked })}
              className="w-5 h-5"
            />
            <span>Availability confirmed</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.vehicles_validated}
              onChange={(e) => setFormData({ ...formData, vehicles_validated: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="font-semibold">Mark vehicles as validated</span>
          </label>
        </div>

        <textarea
          value={formData.vehicles_notes}
          onChange={(e) => setFormData({ ...formData, vehicles_notes: e.target.value })}
          placeholder="Notes about vehicles..."
          rows="3"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </ValidationSectionTemplate>
  );
};

export default VehiclesValidationSection;
