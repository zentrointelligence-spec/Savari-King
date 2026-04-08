/**
 * VersionSelector Component
 * Dropdown to select and view different quote versions
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';

const VersionSelector = ({ versions, currentVersion, onVersionChange }) => {
  if (!versions || versions.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (quoteSentDate) => {
    if (!quoteSentDate) return true;
    const now = new Date();
    const sentDate = new Date(quoteSentDate);
    const hoursDiff = (now - sentDate) / (1000 * 60 * 60);
    return hoursDiff > 48;
  };

  return (
    <div className="mb-6">
      <label htmlFor="version-selector" className="block text-sm font-medium text-gray-700 mb-2">
        Quote Version History
      </label>
      <select
        id="version-selector"
        value={currentVersion || ''}
        onChange={(e) => onVersionChange(parseInt(e.target.value) || null)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
      >
        {versions.map((version) => {
          const expired = isExpired(version.quote_sent_date);
          const accepted = !!version.accepted_at;

          return (
            <option key={version.revision_number} value={version.revision_number}>
              v{version.revision_number} - {formatDate(version.created_at)}
              {accepted && ' ✓ Accepted'}
              {expired && ' (Expired)'}
            </option>
          );
        })}
      </select>

      {/* Version Info */}
      {currentVersion && (
        <div className="mt-3 flex items-center gap-4 text-sm">
          {versions.find(v => v.revision_number === currentVersion)?.accepted_at && (
            <div className="flex items-center text-green-600">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              <span className="font-medium">Accepted</span>
            </div>
          )}
          {isExpired(versions.find(v => v.revision_number === currentVersion)?.quote_sent_date) && (
            <div className="flex items-center text-red-600">
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              <span className="font-medium">Expired</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VersionSelector;
