import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faSpa, // ✅ Valide (spa/wellness)
  faPlus, // ✅ Valide (opération mathématique)
  faMinus, // ✅ Valide (opération mathématique)
  faStar, // ✅ Valide (notation/évaluation)
  // faFire, // ✅ Valide (chaleur/énergie)
  faGift, // ✅ Valide (cadeaux)
  faUser, // 🔄
  faLightbulb, // 🔄
  faFire, // 🔄
} from "@fortawesome/free-solid-svg-icons";

// --- AddOnCard Component ---
const AddOnCard = ({ addon, onSelect, isSelected }) => {
  const [quantity, setQuantity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (quantity > 0 && !isSelected) {
      setIsAdding(true);
      const timer = setTimeout(() => setIsAdding(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [quantity, isSelected]);

  const handleQuantityChange = (newQuantity) => {
    const newQty = Math.max(0, Math.min(newQuantity, 10));
    setQuantity(newQty);
    onSelect(addon.id, newQty);
  };

  const popularPercentage = Math.min(100, Math.max(20, addon.popularity || 87));

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-primary ring-opacity-70 shadow-xl"
          : "shadow-md hover:shadow-lg"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Popularity indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-10">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
          style={{ width: `${popularPercentage}%` }}
        ></div>
      </div>

      {/* Visual indicator for popular items */}
      {popularPercentage > 75 && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-amber-600 z-10">
          <FontAwesomeIcon icon={faFire} className="text-orange-500" />
          <span>Popular</span>
        </div>
      )}

      {/* Card content */}
      <div className="bg-white p-6 flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex-grow">
          <div className="flex items-start gap-4">
            {/* Icon with animation */}
            <div
              className={`p-3 rounded-lg ${
                addon.id === 1
                  ? "bg-rose-100 text-rose-600"
                  : addon.id === 2
                  ? "bg-blue-100 text-blue-600"
                  : "bg-amber-100 text-amber-600"
              } transition-transform ${isHovered ? "rotate-6" : ""}`}
            >
              <FontAwesomeIcon
                icon={
                  addon.id === 1 ? faLightbulb : addon.id === 2 ? faUser : faSpa
                }
                className="w-6 h-6"
              />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-xl text-gray-800">
                  {addon.name}
                </h4>
                {addon.bestValue && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                    BEST VALUE
                  </span>
                )}
              </div>

              <p className="text-gray-600 mt-2 max-w-lg">{addon.description}</p>

              {/* Popularity indicator */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`w-3 h-3 ${
                        i < (addon.rating || 4)
                          ? "fill-current"
                          : "stroke-current stroke-1 fill-transparent"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-500 font-medium">
                  {popularPercentage}% of travelers choose this
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price and quantity controls */}
        <div className="flex flex-col items-end gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-2xl text-gray-800">
                ₹{addon.price.toLocaleString("en-IN")}
              </span>
              {addon.originalPrice && (
                <span className="text-gray-400 text-sm line-through">
                  ₹{addon.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {addon.perPerson && (
              <span className="text-xs text-gray-500">per person</span>
            )}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                quantity > 0
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              aria-label="Decrease quantity"
            >
              <FontAwesomeIcon icon={faMinus} className="w-4 h-4" />
            </button>

            <div className="relative">
              <span className="w-12 h-12 flex items-center justify-center text-lg font-bold bg-primary bg-opacity-10 rounded-lg">
                {quantity}
              </span>
              {isAdding && (
                <div className="absolute inset-0 flex items-center justify-center animate-ping">
                  <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full"></div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-all"
              aria-label="Increase quantity"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual feedback for selection */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary pointer-events-none rounded-xl"></div>
      )}
    </div>
  );
};

// --- Main Component ---
const AddonsSection = ({ tour }) => {
  const [selectedAddons, setSelectedAddons] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const handleAddonSelect = (addonId, quantity) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: quantity,
    }));
  };

  useEffect(() => {
    // Calculate total price whenever selectedAddons changes
    const total = addons.reduce((acc, addon) => {
      const qty = selectedAddons[addon.id] || 0;
      return acc + addon.price * qty;
    }, 0);

    setTotalPrice(total);
    setShowSummary(total > 0);
  }, [selectedAddons]);

  // Sample data with enhancements
  const addons = [
    {
      id: 1,
      name: "Romantic Candlelight Dinner",
      price: 3500,
      originalPrice: 4500,
      description:
        "An intimate beachfront dining experience with personalized menu and live music",
      popularity: 92,
      rating: 4.9,
      perPerson: true,
      bestValue: true,
    },
    {
      id: 2,
      name: "Expert Local Guide",
      price: 6000,
      description:
        "Dedicated cultural expert with deep local knowledge for your entire journey",
      popularity: 78,
      rating: 4.7,
    },
    {
      id: 3,
      name: "Premium Ayurvedic Spa Retreat",
      price: 4000,
      description:
        "Traditional 2-hour rejuvenation therapy at a luxury wellness center",
      popularity: 87,
      rating: 4.8,
    },
    {
      id: 4,
      name: "Sunrise Yoga Session",
      price: 2500,
      originalPrice: 3000,
      description:
        "Private morning yoga class with ocean view guided by certified instructor",
      popularity: 65,
      rating: 4.6,
    },
  ];

  return (
    <div className="mt-16 relative">
      {/* Decorative background elements */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-20 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Enhance Your Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalize your journey with premium add-ons chosen by fellow
            travelers
          </p>
        </div>

        <div className="space-y-6 mb-12">
          {addons.map((addon) => (
            <AddOnCard
              key={addon.id}
              addon={addon}
              onSelect={handleAddonSelect}
              isSelected={
                !!selectedAddons[addon.id] && selectedAddons[addon.id] > 0
              }
            />
          ))}
        </div>

        {/* Summary panel */}
        <div
          className={`sticky bottom-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-500 transform ${
            showSummary
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full text-primary">
                <FontAwesomeIcon icon={faGift} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">
                  Your Selected Add-ons
                </h3>
                <p className="text-sm text-gray-600">
                  {
                    Object.values(selectedAddons).filter((qty) => qty > 0)
                      .length
                  }{" "}
                  add-ons selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total for add-ons</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>

              <button
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                onClick={() =>
                  alert("Proceeding to checkout with selected add-ons")
                }
              >
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddonsSection;
