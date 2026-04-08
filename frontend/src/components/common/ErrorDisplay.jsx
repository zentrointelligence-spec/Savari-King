import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faWifi,
  faServer,
  faRefresh,
  faHome,
  faHeadset,
  faBug,
} from "@fortawesome/free-solid-svg-icons";

const ErrorDisplay = ({
  error,
  onRetry,
  type = "general",
  showRetry = true,
  showHome = true,
  fullScreen = false,
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          icon: faWifi,
          title: "Connection Problem",
          message:
            "Unable to connect to our servers. Please check your internet connection and try again.",
          bgColor: "bg-blue-50",
          iconColor: "text-blue-500",
          borderColor: "border-blue-200",
        };
      case "server":
        return {
          icon: faServer,
          title: "Server Error",
          message:
            "Our servers are experiencing issues. Our team has been notified and is working on a fix.",
          bgColor: "bg-red-50",
          iconColor: "text-red-500",
          borderColor: "border-red-200",
        };
      case "notFound":
        return {
          icon: faExclamationTriangle,
          title: "Content Not Found",
          message:
            "The content you're looking for is not available at the moment. It may have been moved or deleted.",
          bgColor: "bg-yellow-50",
          iconColor: "text-yellow-500",
          borderColor: "border-yellow-200",
        };
      default:
        return {
          icon: faExclamationTriangle,
          title: "Something Went Wrong",
          message:
            error ||
            "An unexpected error occurred. Please try again or contact support if the problem persists.",
          bgColor: "bg-gray-50",
          iconColor: "text-gray-500",
          borderColor: "border-gray-200",
        };
    }
  };

  const config = getErrorConfig();

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white z-50 flex items-center justify-center p-6"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div
        className={`max-w-md w-full ${config.bgColor} ${config.borderColor} border rounded-xl p-8 text-center shadow-lg`}
      >
        {/* Error Icon */}
        <div className="mb-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 ${config.bgColor} rounded-full border-2 ${config.borderColor} shadow-sm`}
          >
            <FontAwesomeIcon
              icon={config.icon}
              className={`text-2xl ${config.iconColor}`}
            />
          </div>
        </div>

        {/* Error Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">{config.title}</h3>

        {/* Error Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">{config.message}</p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faRefresh} className="mr-2" />
              Try Again
            </button>
          )}

          {showHome && (
            <a
              href="/"
              className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Go to Homepage
            </a>
          )}
        </div>

        {/* Support Link */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Need help? Our support team is here for you.
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <a
              href="/contact"
              className="text-primary hover:text-primary-dark font-medium flex items-center"
            >
              <FontAwesomeIcon icon={faHeadset} className="mr-1" />
              Contact Support
            </a>
            <a
              href="mailto:support@ebenezertours.com"
              className="text-primary hover:text-primary-dark font-medium flex items-center"
            >
              <FontAwesomeIcon icon={faBug} className="mr-1" />
              Report Bug
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Specific Error Components
export const NetworkError = ({ onRetry }) => (
  <ErrorDisplay type="network" onRetry={onRetry} showRetry={true} />
);

export const ServerError = ({ onRetry }) => (
  <ErrorDisplay type="server" onRetry={onRetry} showRetry={true} />
);

export const NotFoundError = () => (
  <ErrorDisplay type="notFound" showRetry={false} showHome={true} />
);

// Inline Error Component (for smaller spaces)
export const InlineError = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <div className="flex items-center justify-center mb-2">
      <FontAwesomeIcon
        icon={faExclamationTriangle}
        className="text-red-500 mr-2"
      />
      <span className="text-red-700 font-medium">Error</span>
    </div>
    <p className="text-red-600 text-sm mb-3">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-red-700 hover:text-red-800 font-medium text-sm flex items-center justify-center mx-auto"
      >
        <FontAwesomeIcon icon={faRefresh} className="mr-1" />
        Try Again
      </button>
    )}
  </div>
);

export default ErrorDisplay;
