import React, { useState, useEffect } from 'react';
import ValidationSectionTemplate from './ValidationSectionTemplate';

// Age categories matching the booking system
const AGE_CATEGORIES = [
  { id: 'infant', label: '0-2 years', min: 0, max: 2 },
  { id: 'child', label: '3-7 years', min: 3, max: 7 },
  { id: 'preteen', label: '8-13 years', min: 8, max: 13 },
  { id: 'teen', label: '14-17 years', min: 14, max: 17 },
  { id: 'adult', label: '18-59 years', min: 18, max: 59 },
  { id: 'senior', label: '60+ years', min: 60, max: 100 }
];

const ParticipantsValidationSection = ({ booking, revision, onUpdate, autoValidation, isExpanded, onToggleExpand }) => {
  const [formData, setFormData] = useState({
    participants_validated: revision?.participants_validated || false,
    age_requirements_met: revision?.age_requirements_met !== false,
    capacity_requirements_met: revision?.capacity_requirements_met !== false,
    max_capacity_exceeded: revision?.max_capacity_exceeded || false,
    participants_notes: revision?.participants_notes || ''
  });
  // Update formData when revision changes (e.g., after auto-validate)
  useEffect(() => {
    if (revision) {
      setFormData(prev => ({
        ...prev,
        participants_validated: revision.participants_validated || false,
        participants_notes: revision.participants_notes || prev.participants_notes
      }));
    }
  }, [revision?.participants_validated]);


  const [participantCounts, setParticipantCounts] = useState({
    infant: 0,
    child: 0,
    preteen: 0,
    teen: 0,
    adult: 0,
    senior: 0
  });

  // Parse participant_ages from booking
  useEffect(() => {
    if (booking?.participant_ages && Array.isArray(booking.participant_ages)) {
      const counts = {
        infant: 0,
        child: 0,
        preteen: 0,
        teen: 0,
        adult: 0,
        senior: 0
      };

      booking.participant_ages.forEach(p => {
        if (counts.hasOwnProperty(p.id)) {
          counts[p.id]++;
        }
      });

      setParticipantCounts(counts);
    } else {
      // Fallback to num_adults and num_children
      setParticipantCounts({
        infant: 0,
        child: 0,
        preteen: 0,
        teen: 0,
        adult: booking?.num_adults || 0,
        senior: 0
      });
    }
  }, [booking]);

  const total = Object.values(participantCounts).reduce((sum, count) => sum + count, 0);
  const num_adults = participantCounts.adult + participantCounts.senior;
  const num_children = participantCounts.infant + participantCounts.child + participantCounts.preteen + participantCounts.teen;

  return (
    <ValidationSectionTemplate
      sectionNumber={4}
      title="Participants Validation"
      description="Verify participant count and age requirements"
      revision={revision}
      validatedField="participants_validated"
      onSave={() => onUpdate(formData)}
      autoValidation={autoValidation}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-4">
        {/* Detailed Age Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-semibold mb-3">Participant Age Breakdown</h5>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {AGE_CATEGORIES.map(category => (
              participantCounts[category.id] > 0 && (
                <div key={category.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">{category.label}</p>
                  <p className="text-xl font-bold text-gray-900">{participantCounts[category.id]}</p>
                </div>
              )
            ))}
          </div>

          {/* Summary Totals */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-300">
            <div>
              <p className="text-sm text-gray-600">Adults (18+)</p>
              <p className="text-2xl font-bold text-gray-900">{num_adults}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Children (&lt;18)</p>
              <p className="text-2xl font-bold text-gray-900">{num_children}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-primary">{total}</p>
            </div>
          </div>
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.age_requirements_met}
            onChange={(e) => setFormData({ ...formData, age_requirements_met: e.target.checked })}
            className="w-5 h-5"
          />
          <span>Age requirements are met</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.capacity_requirements_met}
            onChange={(e) => setFormData({ ...formData, capacity_requirements_met: e.target.checked })}
            className="w-5 h-5"
          />
          <span>Group size is within capacity</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.participants_validated}
            onChange={(e) => setFormData({ ...formData, participants_validated: e.target.checked })}
            className="w-5 h-5"
          />
          <span className="font-semibold">Mark participants as validated</span>
        </label>

        <textarea
          value={formData.participants_notes}
          onChange={(e) => setFormData({ ...formData, participants_notes: e.target.value })}
          placeholder="Notes..."
          rows="3"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </ValidationSectionTemplate>
  );
};

export default ParticipantsValidationSection;
