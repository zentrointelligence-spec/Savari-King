import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPlane,
  faCompass,
  faMapMarkerAlt,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";

const LoadingSpinner = ({
  size = "large",
  message = "Loading...",
  type = "default",
  fullScreen = false,
}) => {
  const getSpinnerIcon = () => {
    switch (type) {
      case "travel":
        return faPlane;
      case "navigation":
        return faCompass;
      case "location":
        return faMapMarkerAlt;
      case "route":
        return faRoute;
      default:
        return faSpinner;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-4 h-4 text-sm";
      case "medium":
        return "w-8 h-8 text-lg";
      case "large":
        return "w-12 h-12 text-2xl";
      case "xl":
        return "w-16 h-16 text-3xl";
      default:
        return "w-8 h-8 text-lg";
    }
  };

  const getAnimationClass = () => {
    switch (type) {
      case "travel":
        return "animate-bounce";
      case "navigation":
        return "animate-spin";
      case "location":
        return "animate-pulse";
      case "route":
        return "animate-ping";
      default:
        return "animate-spin";
    }
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Animated Background Circle */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-full animate-pulse"></div>
          <div className="relative bg-white rounded-full p-6 shadow-lg border border-purple-100">
            <FontAwesomeIcon
              icon={getSpinnerIcon()}
              className={`${getSizeClasses()} ${getAnimationClass()} text-primary`}
            />
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">{message}</h3>
          <div className="flex justify-center space-x-1">
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Components
export const SkeletonCard = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded ${
          i === lines - 1 ? "w-2/3" : "w-full"
        }`}
      ></div>
    ))}
  </div>
);

export const SkeletonImage = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Homepage Section Skeleton
export const HomepageSkeleton = () => (
  <div className="space-y-20">
    {/* Hero Skeleton */}
    <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>

    {/* Categories Skeleton */}
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>

    {/* Tours Skeleton */}
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
