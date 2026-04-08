import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const ConfirmDeleteModal = ({ onConfirm, onCancel, message }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-500 text-3xl mr-4"
          />
          <h2 className="text-2xl font-semibold">Confirm Deletion</h2>
        </div>
        <p className="text-gray-700 mb-6">
          {message || "Are you sure you want to delete this item? This action cannot be undone."}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
