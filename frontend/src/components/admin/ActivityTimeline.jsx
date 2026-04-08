import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faClock,
  faCheckCircle,
  faCalendarCheck,
  faCommentDollar,
} from "@fortawesome/free-solid-svg-icons";

const ActivityTimeline = ({ activities }) => {
  const getIcon = (type) => {
    switch (type) {
      case "new_customer":
        return faUserPlus;
      case "booking_confirmed":
        return faCheckCircle;
      case "tour_created":
        return faCalendarCheck;
      case "payment_received":
        return faCommentDollar;
      default:
        return faCheckCircle;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "new_customer":
        return "bg-purple-500";
      case "booking_confirmed":
        return "bg-green-500";
      case "tour_created":
        return "bg-blue-500";
      case "payment_received":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex">
          <div className="flex flex-col items-center mr-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${getColor(
                activity.type
              )}`}
            >
              <FontAwesomeIcon
                icon={getIcon(activity.type)}
                className="text-white text-sm"
              />
            </div>
            {index !== activities.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            )}
          </div>
          <div className="pb-6 flex-1">
            <p className="text-gray-800 font-medium">{activity.title}</p>
            <p className="text-gray-500 text-sm mt-1">{activity.description}</p>
            <div className="text-gray-400 text-xs mt-2 flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              {new Date(activity.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
