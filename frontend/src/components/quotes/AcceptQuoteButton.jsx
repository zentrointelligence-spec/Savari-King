/**
 * AcceptQuoteButton Component
 * Button with modal confirmation for accepting quotes
 */

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import quoteService from '../../services/quoteService';

const AcceptQuoteButton = ({ bookingId, revisionNumber, disabled, onAccepted }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await quoteService.acceptQuote(bookingId, revisionNumber);

      if (response.success) {
        // Show success message
        setShowSuccess(true);
        setShowModal(false);

        // Call callback if provided
        if (onAccepted) {
          onAccepted();
        }

        // Wait 2 seconds then redirect to payment
        setTimeout(() => {
          navigate(`/my-bookings/${bookingId}/payment`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      const errorMessage = error.response?.data?.error || 'Failed to accept quote. Please try again.';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <div className="text-green-500 mb-4">
            <FontAwesomeIcon icon={faCheck} className="text-6xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Accepted!</h2>
          <p className="text-gray-600 mb-4">
            Your quote has been successfully accepted. Redirecting to payment page...
          </p>
          <div className="flex items-center justify-center text-blue-600">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            <span>Redirecting to payment page...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={disabled || loading}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
        }`}
      >
        <FontAwesomeIcon icon={faCheck} className="mr-2" />
        Accept Quote
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-2xl font-bold">Confirm Quote Acceptance</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 text-lg mb-4">
                Are you sure you want to accept this quotation?
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next:</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                  <li>Your quote will be locked and confirmed</li>
                  <li>You will receive a confirmation email</li>
                  <li>You'll be redirected to the payment page</li>
                  <li>Complete payment to finalize your booking</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> You can still cancel your booking after acceptance if needed.
                  The admin may also make modifications, which will require you to re-accept.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white transition-colors duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    Yes, Accept Quote
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AcceptQuoteButton;
