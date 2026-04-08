/**
 * ShareQuoteButton Component
 * Button to copy quote link to clipboard
 */

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import quoteService from '../../services/quoteService';

const ShareQuoteButton = ({ bookingId, quoteType = 'detailed', disabled }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const link = quoteService.getShareableLink(bookingId, quoteType);
      const success = await quoteService.copyLinkToClipboard(link);

      if (success) {
        setCopied(true);
        toast.success('Link copied to clipboard!');

        // Reset after 3 seconds
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } else {
        toast.error('Failed to copy link. Please try again.');
      }
    } catch (error) {
      console.error('Error sharing quote:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={disabled || copied}
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
        copied
          ? 'bg-green-600 text-white'
          : disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
      }`}
    >
      <FontAwesomeIcon icon={copied ? faCheck : faShare} className="mr-2" />
      {copied ? 'Link Copied!' : 'Partager le devis'}
    </button>
  );
};

export default ShareQuoteButton;
