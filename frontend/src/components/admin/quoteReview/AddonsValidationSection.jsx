import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../contexts/AuthContext';
import API_CONFIG, { buildApiUrl, getAuthHeaders } from '../../../config/api';
import { toast } from 'react-toastify';
import ValidationSectionTemplate from './ValidationSectionTemplate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const AddonsValidationSection = ({ booking, revision, onUpdate, autoValidation, isExpanded, onToggleExpand }) => {
  const { token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    addons_validated: revision?.addons_validated || false,
    addons_availability_confirmed: revision?.addons_availability_confirmed || false,
    addons_notes: revision?.addons_notes || ''
  });
  // Update formData when revision changes (e.g., after auto-validate)
  useEffect(() => {
    if (revision) {
      setFormData(prev => ({
        ...prev,
        addons_validated: revision.addons_validated || false,
        addons_availability_confirmed: revision.addons_availability_confirmed || false,
        addons_notes: revision.addons_notes || prev.addons_notes
      }));
    }
  }, [revision?.addons_validated, revision?.addons_availability_confirmed]);


  const [detailedEditMode, setDetailedEditMode] = useState(false);
  const [detailedAddons, setDetailedAddons] = useState([]);

  // Initialize detailed addons from adjusted or original data
  useEffect(() => {
    const addons = revision?.addons_original || booking.selected_addons || [];
    const adjusted = revision?.addons_adjusted;

    if (adjusted && Array.isArray(adjusted) && adjusted.length > 0) {
      // Use adjusted data if available
      setDetailedAddons(adjusted.map(a => ({
        name: a.name || a.addon_name || '',
        quantity: a.adjusted_quantity || a.quantity || 1,
        unitPrice: parseFloat(a.adjusted_price || a.price || a.original_price || 0),
        price_per_person: a.price_per_person !== false
      })));
    } else {
      // Use original data
      setDetailedAddons(addons.map(a => ({
        name: a.name || a.addon_name || '',
        quantity: a.quantity || 1,
        unitPrice: parseFloat(a.price || a.original_price || 0),
        price_per_person: a.price_per_person !== false
      })));
    }
  }, [revision, booking]);

  const handleSave = () => onUpdate(formData);

  const handleDetailedSave = async () => {
    try {
      // Filter out addons with quantity = 0 (means they are removed)
      const activeAddons = detailedAddons.filter(a => a.quantity > 0);

      // Transform to match backend expected format
      const addons_adjusted = activeAddons.map(a => ({
        name: a.name,
        addon_name: a.name,
        quantity: a.quantity,
        adjusted_quantity: a.quantity,
        price: a.unitPrice,
        adjusted_price: a.unitPrice,
        original_price: a.unitPrice,
        price_per_person: a.price_per_person
      }));

      // Call the addons-detailed endpoint directly
      const response = await axios.patch(
        buildApiUrl(`/api/bookings/${booking.id}/review/${revision.id}/addons-detailed`),
        {
          addons_adjusted,
          addon_modifications_notes: 'Updated quantities and prices via admin review'
        },
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success('Add-ons updated successfully!');
        setDetailedEditMode(false);

        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating add-ons:', error);
      toast.error('Failed to update add-ons');
    }
  };

  const handleDetailedCancel = () => {
    setDetailedEditMode(false);
    // Reset to original values
    const addons = revision?.addons_original || booking.selected_addons || [];
    const adjusted = revision?.addons_adjusted;

    if (adjusted && Array.isArray(adjusted) && adjusted.length > 0) {
      setDetailedAddons(adjusted.map(a => ({
        name: a.name || a.addon_name || '',
        quantity: a.adjusted_quantity || a.quantity || 1,
        unitPrice: parseFloat(a.adjusted_price || a.price || a.original_price || 0),
        price_per_person: a.price_per_person !== false
      })));
    } else {
      setDetailedAddons(addons.map(a => ({
        name: a.name || a.addon_name || '',
        quantity: a.quantity || 1,
        unitPrice: parseFloat(a.price || a.original_price || 0),
        price_per_person: a.price_per_person !== false
      })));
    }
  };

  const updateAddonDetail = (index, field, value) => {
    const updated = [...detailedAddons];
    updated[index] = { ...updated[index], [field]: value };
    setDetailedAddons(updated);
  };

  const addons = revision?.addons_original || booking.selected_addons || [];
  const totalParticipants = (booking.num_adults || 0) + (booking.num_children || 0);

  // Helper function to calculate total price for an addon
  const calculateAddonTotalPrice = (addon) => {
    if (addon.price_per_person && totalParticipants > 0) {
      // Price per person: unitPrice × participants
      return addon.unitPrice * totalParticipants;
    } else {
      // Price per unit: unitPrice × quantity
      return addon.unitPrice * addon.quantity;
    }
  };

  return (
    <ValidationSectionTemplate
      sectionNumber={3}
      title="Add-ons Validation"
      description="Verify add-ons availability and conflicts"
      revision={revision}
      validatedField="addons_validated"
      onSave={handleSave}
      autoValidation={autoValidation}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-4">
        {/* Detailed Edit Mode Button */}
        {!detailedEditMode && addons.length > 0 && (
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

        {/* Addons List - View or Edit Mode */}
        {addons.length > 0 ? (
          detailedEditMode ? (
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-semibold text-lg">Edit Add-ons Details</h5>
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
                {detailedAddons.map((addon, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg shadow transition-all ${
                      addon.quantity === 0
                        ? 'bg-red-50 border-2 border-red-300 opacity-60'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-semibold text-gray-700">{addon.name}</div>
                      {addon.quantity === 0 && (
                        <span className="text-xs font-bold text-red-600 bg-red-200 px-2 py-1 rounded">
                          WILL BE REMOVED
                        </span>
                      )}
                    </div>
                    {/* Price Per Person Info */}
                    {addon.price_per_person && (
                      <div className="mb-3 p-2 bg-blue-100 rounded text-sm">
                        <span className="font-semibold">Pricing:</span> Per Person (× {totalParticipants} participants)
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Quantity <span className="text-gray-400">{addon.price_per_person ? '(Not used for per-person pricing)' : '(0 = remove)'}</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={addon.quantity}
                          onChange={(e) => updateAddonDetail(idx, 'quantity', parseInt(e.target.value) || 0)}
                          disabled={addon.price_per_person}
                          className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Unit Price (₹) {addon.price_per_person ? '/ person' : '/ unit'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={addon.unitPrice}
                          onChange={(e) => updateAddonDetail(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Total {addon.price_per_person ? `(× ${totalParticipants} ppl)` : `(× ${addon.quantity})`}
                        </label>
                        <div className="px-3 py-2 bg-green-100 rounded-lg font-bold text-green-700">
                          ₹{calculateAddonTotalPrice(addon).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-blue-100 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Add-ons Cost:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{detailedAddons.reduce((sum, a) => sum + calculateAddonTotalPrice(a), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-3">Selected Add-ons</h5>

              {/* Participants Info */}
              <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                <div className="font-semibold text-blue-800">
                  Total Participants: {totalParticipants} ({booking.num_adults || 0} adults + {booking.num_children || 0} children)
                </div>
              </div>

              {detailedAddons.map((addon, idx) => (
                <div key={idx} className="p-3 mb-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg">{addon.name}</div>
                      {addon.price_per_person ? (
                        <div className="text-sm text-blue-600 font-medium">
                          Per Person Pricing
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          Quantity: <span className="font-medium">{addon.quantity}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ₹{calculateAddonTotalPrice(addon).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500">Total Price</div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Unit price:</span>
                      <span className="font-medium">₹{addon.unitPrice.toLocaleString('en-IN')} {addon.price_per_person ? '/ person' : '/ unit'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multiplier:</span>
                      <span className="font-medium">
                        × {addon.price_per_person ? `${totalParticipants} participants` : `${addon.quantity} units`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 font-semibold">
                      <span>Total:</span>
                      <span className="text-green-600">₹{calculateAddonTotalPrice(addon).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Grand Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{detailedAddons.reduce((sum, a) => sum + calculateAddonTotalPrice(a), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )
        ) : (
          <p className="text-gray-600">No add-ons selected</p>
        )}

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.addons_availability_confirmed}
            onChange={(e) => setFormData({ ...formData, addons_availability_confirmed: e.target.checked })}
            className="w-5 h-5"
          />
          <span>All add-ons are available</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.addons_validated}
            onChange={(e) => setFormData({ ...formData, addons_validated: e.target.checked })}
            className="w-5 h-5"
          />
          <span className="font-semibold">Mark add-ons as validated</span>
        </label>

        <textarea
          value={formData.addons_notes}
          onChange={(e) => setFormData({ ...formData, addons_notes: e.target.value })}
          placeholder="Notes..."
          rows="3"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </ValidationSectionTemplate>
  );
};

export default AddonsValidationSection;
