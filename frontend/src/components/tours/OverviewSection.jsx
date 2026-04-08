import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faUsers,
  faMapMarkerAlt,
  faHotel,
  faCar,
  faMountainSun,
  faUtensils,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const OverviewSection = ({ tour }) => {
  const [activeTab, setActiveTab] = useState("highlights");

  // Cost breakdown data
  const costBreakdown = [
    {
      label: "Accommodation",
      value: 45,
      color: "text-blue-500",
      icon: faHotel,
    },
    {
      label: "Transportation",
      value: 30,
      color: "text-green-500",
      icon: faCar,
    },
    {
      label: "Experiences",
      value: 15,
      color: "text-purple-500",
      icon: faMountainSun,
    },
    { label: "Meals", value: 10, color: "text-amber-500", icon: faUtensils },
  ];

  // Tour highlights
  const highlights = [
    "Private beach access at all coastal resorts",
    "Sunset cruise with champagne toast",
    "Traditional cooking class with local chef",
    "Guided heritage walk through historic districts",
    "Wildlife safari with expert naturalist",
  ];

  // Tour inclusions
  const inclusions = [
    { icon: faHotel, text: "Luxury accommodation" },
    { icon: faCar, text: "Private AC transportation" },
    { icon: faUtensils, text: "Daily breakfast & 3 dinners" },
    { icon: faStar, text: "All entrance fees & activities" },
    { icon: faUsers, text: "English-speaking tour guide" },
  ];

  // Destinations with descriptions
  const destinations = [
    {
      name: "Kanyakumari",
      description: "Where three oceans meet with spectacular sunrises",
    },
    {
      name: "Kovalam",
      description: "Pristine beaches with golden sands and coconut palms",
    },
    {
      name: "Poovar",
      description: "Backwater cruise through mangrove forests",
    },
    {
      name: "Trivandrum",
      description: "Rich cultural heritage and historic palaces",
    },
    {
      name: "Varkala",
      description: "Dramatic cliffs overlooking the Arabian Sea",
    },
  ];

  // Render the cost breakdown as an animated chart
  const renderCostChart = () => {
    return (
      <div className="relative w-64 h-64">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">₹32,500</div>
            <div className="text-sm text-gray-500">avg. per person</div>
          </div>
        </div>

        <div className="relative w-full h-full">
          {costBreakdown.map((item, index) => {
            const circumference = 2 * Math.PI * 90;
            const strokeDashoffset =
              circumference - (item.value / 100) * circumference;
            const rotation =
              index === 0
                ? 0
                : costBreakdown
                    .slice(0, index)
                    .reduce((acc, curr) => acc + (curr.value / 100) * 360, 0);

            return (
              <div
                key={item.label}
                className="absolute inset-0"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`${item.color} opacity-20`}
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={item.color}
                    style={{
                      transition: "stroke-dashoffset 1s ease-in-out",
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                    }}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-amber-50 z-0"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Journey Overview
          </h2>
          <p className="text-xl text-gray-600">
            Discover what makes this tour an unforgettable experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Column: Tour Highlights */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === "highlights"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("highlights")}
              >
                Highlights
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === "inclusions"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("inclusions")}
              >
                Inclusions
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === "destinations"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("destinations")}
              >
                Destinations
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "highlights" && (
                <div className="space-y-6">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start group">
                      <div className="flex-shrink-0 mt-1 mr-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <span className="font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <p className="text-lg text-gray-700 group-hover:text-primary transition-colors">
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "inclusions" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inclusions.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                        <FontAwesomeIcon icon={item.icon} />
                      </div>
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "destinations" && (
                <div className="space-y-6">
                  {destinations.map((destination, index) => (
                    <div
                      key={index}
                      className="p-4 border-l-4 border-primary bg-blue-50 rounded-r-lg"
                    >
                      <h3 className="font-bold text-gray-800 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        {destination.name}
                      </h3>
                      <p className="text-gray-600 mt-2 ml-9">
                        {destination.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stats and Cost Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">
              Tour Details
            </h3>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-2">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div className="font-bold text-gray-800">4 Days</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-2">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className="font-bold text-gray-800">2-12 People</div>
                <div className="text-sm text-gray-600">Group Size</div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 text-center col-span-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mx-auto mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="font-bold text-gray-800">5 Destinations</div>
                <div className="text-sm text-gray-600">Covered</div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="w-full">
              <h4 className="text-lg font-medium text-gray-700 mb-4 text-center">
                Cost Breakdown
              </h4>

              <div className="flex justify-center mb-6">
                {renderCostChart()}
              </div>

              <div className="space-y-3">
                {costBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${item.color.replace(
                            "text-",
                            "bg-"
                          )}`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Why Choose This Tour?</h3>
            <p className="text-lg mb-6">
              Experience the perfect blend of luxury, adventure, and cultural
              immersion with our expertly crafted itinerary designed to showcase
              the best of Southern India.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-4xl font-bold mb-2">4.9/5</div>
                <div>Average Rating</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-4xl font-bold mb-2">98%</div>
                <div>Recommendation Rate</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-4xl font-bold mb-2">250+</div>
                <div>Happy Travelers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
