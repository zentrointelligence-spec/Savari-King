import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const InfoModal = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="text-blue-500 text-3xl mr-4"
          />
          <h2 className="text-2xl font-semibold">{title || 'Information'}</h2>
        </div>
        <p className="text-gray-700 mb-6">
          {message || 'Something went wrong.'}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-white font-bold py-2 px-6 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
