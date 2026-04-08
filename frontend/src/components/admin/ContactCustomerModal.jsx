import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import InfoModal from './InfoModal';

const ContactCustomerModal = ({ customerName, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Since email functionality is not configured, we'll just show the error modal.
    setShowErrorModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Contact {customerName}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">Subject</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg">
                Cancel
              </button>
              <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg flex items-center">
                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      {showErrorModal && (
        <InfoModal
          title="Feature Not Available"
          message="Email functionality is not yet configured. Please contact the administrator."
          onClose={() => {
            setShowErrorModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default ContactCustomerModal;
