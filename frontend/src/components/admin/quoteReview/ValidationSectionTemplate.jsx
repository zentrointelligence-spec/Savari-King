import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faSave,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

/**
 * Reusable template for validation sections
 */
const ValidationSectionTemplate = ({
  sectionNumber,
  title,
  description,
  revision,
  validatedField,
  onSave,
  children,
  autoValidation,
  isExpanded: controlledIsExpanded,
  onToggleExpand
}) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);

  // Use controlled prop if provided, otherwise use internal state
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded;
  const toggleExpanded = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalIsExpanded(!internalIsExpanded);
    }
  };

  const isValidated = revision?.[validatedField] || false;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className={`p-6 cursor-pointer transition-colors ${
          isValidated ? 'bg-green-50' : 'bg-gray-50'
        }`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isValidated ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <FontAwesomeIcon
                icon={isValidated ? faCheckCircle : faTimesCircle}
                className="text-white"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {sectionNumber}. {title}
              </h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isValidated && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Validated
              </span>
            )}
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
          {/* Auto-Validation Results */}
          {autoValidation && (
            <div className={`p-4 mb-6 rounded-lg ${
              autoValidation.validated || autoValidation.available
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <h5 className="font-semibold mb-2 flex items-center">
                <FontAwesomeIcon
                  icon={autoValidation.validated || autoValidation.available ? faCheckCircle : faTimesCircle}
                  className={`mr-2 ${
                    autoValidation.validated || autoValidation.available ? 'text-green-600' : 'text-yellow-600'
                  }`}
                />
                Auto-Validation Results
              </h5>
              {autoValidation.warnings && autoValidation.warnings.length > 0 && (
                <ul className="list-disc list-inside text-sm text-yellow-800">
                  {autoValidation.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Section-specific content */}
          {children}

          <div className="flex justify-end pt-4">
            <button
              onClick={onSave}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Save {title}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationSectionTemplate;
