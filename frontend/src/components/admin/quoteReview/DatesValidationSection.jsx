import React, { useState, useEffect } from 'react';
import ValidationSectionTemplate from './ValidationSectionTemplate';

const DatesValidationSection = ({ booking, revision, onUpdate, autoValidation, isExpanded, onToggleExpand }) => {
  const [formData, setFormData] = useState({
    dates_validated: revision?.dates_validated || false,
    seasonal_pricing_applied: revision?.seasonal_pricing_applied || false,
    dates_notes: revision?.dates_notes || ''
  });
  // Update formData when revision changes (e.g., after auto-validate)
  useEffect(() => {
    if (revision) {
      setFormData(prev => ({
        ...prev,
        dates_validated: revision.dates_validated || false,
        dates_notes: revision.dates_notes || prev.dates_notes
      }));
    }
  }, [revision?.dates_validated]);


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <ValidationSectionTemplate
      sectionNumber={5}
      title="Travel Dates Validation"
      description="Verify travel dates and apply seasonal pricing"
      revision={revision}
      validatedField="dates_validated"
      onSave={() => onUpdate(formData)}
      autoValidation={autoValidation}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-semibold mb-2">Travel Date</h5>
          <p className="text-xl font-bold text-blue-600">
            {formatDate(booking.travel_date)}
          </p>
        </div>

        {autoValidation?.seasonal_pricing_details && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h5 className="font-semibold mb-2">Seasonal Information</h5>
            <p><strong>Season:</strong> {autoValidation.seasonal_pricing_details.season}</p>
            <p><strong>Multiplier:</strong> {autoValidation.seasonal_pricing_details.multiplier}x</p>
            <p className="text-sm text-gray-600 mt-2">
              {autoValidation.seasonal_pricing_details.description}
            </p>
          </div>
        )}

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.seasonal_pricing_applied}
            onChange={(e) => setFormData({ ...formData, seasonal_pricing_applied: e.target.checked })}
            className="w-5 h-5"
          />
          <span>Seasonal pricing has been applied</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.dates_validated}
            onChange={(e) => setFormData({ ...formData, dates_validated: e.target.checked })}
            className="w-5 h-5"
          />
          <span className="font-semibold">Mark dates as validated</span>
        </label>

        <textarea
          value={formData.dates_notes}
          onChange={(e) => setFormData({ ...formData, dates_notes: e.target.value })}
          placeholder="Notes about travel dates..."
          rows="3"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </ValidationSectionTemplate>
  );
};

export default DatesValidationSection;
