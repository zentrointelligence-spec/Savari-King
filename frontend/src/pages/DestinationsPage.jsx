import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faSearch,
  faFilter,
  faStar,
  faCamera,
  faHeart,
  faArrowRight,
  faGlobe,
  faTemperatureHigh,
  faClock,
  faPlane,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../components/ui/Button";

const DestinationsPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Mock destinations data
  const mockDestinations = [
    {
      id: 1,
      name: "Rajasthan",
      region: "North India",
      category: "Cultural",
      description: "Land of Kings with magnificent palaces and desert landscapes",
      image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600",
      rating: 4.8,
      tours: 25,
      bestTime: "Oct - Mar",
      temperature: "15-35°C",
      highlights: ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer"],
    },
    {
      id: 2,
      name: "Kerala",
      region: "South India",
      category: "Nature",
      description: "God's Own Country with backwaters and lush greenery",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600",
      rating: 4.9,
      tours: 18,
      bestTime: "Sep - Mar",
      temperature: "23-32°C",
      highlights: ["Alleppey", "Munnar", "Kochi", "Thekkady"],
    },
    {
      id: 3,
      name: "Himachal Pradesh",
      region: "North India",
      category: "Adventure",
      description: "Mountain paradise perfect for adventure and spirituality",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
      rating: 4.7,
      tours: 22,
      bestTime: "Mar - Jun",
      temperature: "10-25°C",
      highlights: ["Shimla", "Manali", "Dharamshala", "Kasol"],
    },
    {
      id: 4,
      name: "Goa",
      region: "West India",
      category: "Beach",
      description: "Tropical paradise with beautiful beaches and vibrant culture",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
      rating: 4.6,
      tours: 15,
      bestTime: "Nov - Feb",
      temperature: "20-32°C",
      highlights: ["Baga Beach", "Old Goa", "Dudhsagar Falls", "Anjuna"],
    },
    {
      id: 5,
      name: "Ladakh",
      region: "North India",
      category: "Adventure",
      description: "High altitude desert with stunning landscapes and monasteries",
      image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600",
      rating: 4.9,
      tours: 12,
      bestTime: "May - Sep",
      temperature: "-10-20°C",
      highlights: ["Leh", "Nubra Valley", "Pangong Lake", "Khardung La"],
    },
    {
      id: 6,
      name: "Tamil Nadu",
      region: "South India",
      category: "Cultural",
      description: "Rich heritage with ancient temples and classical arts",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600",
      rating: 4.5,
      tours: 20,
      bestTime: "Nov - Mar",
      temperature: "20-35°C",
      highlights: ["Chennai", "Madurai", "Thanjavur", "Kanyakumari"],
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDestinations(mockDestinations);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter destinations
  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch = destination.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRegion =
      selectedRegion === "all" || destination.region === selectedRegion;
    const matchesCategory =
      selectedCategory === "all" || destination.category === selectedCategory;
    return matchesSearch && matchesRegion && matchesCategory;
  });

  const regions = ["all", "North India", "South India", "West India", "East India"];
  const categories = ["all", "Cultural", "Nature", "Adventure", "Beach", "Spiritual"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-primary via-secondary to-accent text-white py-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-4xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t("destinations.hero.title", "Discover Amazing Destinations")}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {t(
                "destinations.hero.subtitle",
                "Explore India's most beautiful and culturally rich destinations"
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGlobe} className="text-white/80" />
                <span>{destinations.length}+ Destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPlane} className="text-white/80" />
                <span>100+ Tours Available</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faStar} className="text-white/80" />
                <span>4.8 Average Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-12">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={t("destinations.search.placeholder", "Search destinations...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region === "all"
                    ? t("destinations.filters.allRegions", "All Regions")
                    : region}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all"
                    ? t("destinations.filters.allCategories", "All Categories")
                    : category}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedRegion("all");
                setSelectedCategory("all");
              }}
              variant="outline"
              className="px-6 py-3"
              icon={faFilter}
            >
              {t("destinations.filters.clear", "Clear Filters")}
            </Button>
          </div>
        </motion.div>

        {/* Destinations Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredDestinations.map((destination) => (
              <motion.div
                key={destination.id}
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-sm" />
                      <span className="text-sm font-semibold">{destination.rating}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-white/90 text-sm">{destination.region}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {destination.category}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {destination.tours} tours available
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {destination.description}
                  </p>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-primary" />
                      <span className="text-gray-600">{destination.bestTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faTemperatureHigh} className="text-primary" />
                      <span className="text-gray-600">{destination.temperature}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Top Highlights:</p>
                    <div className="flex flex-wrap gap-1">
                      {destination.highlights.slice(0, 3).map((highlight, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                          {highlight}
                        </span>
                      ))}
                      {destination.highlights.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{destination.highlights.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      as={Link}
                      to={`/tours?destination=${destination.name}`}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      icon={faArrowRight}
                    >
                      {t("destinations.card.viewTours", "View Tours")}
                    </Button>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <FontAwesomeIcon icon={faHeart} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!loading && filteredDestinations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {t("destinations.noResults.title", "No destinations found")}
            </h3>
            <p className="text-gray-500 mb-6">
              {t(
                "destinations.noResults.message",
                "Try adjusting your search criteria or explore all destinations"
              )}
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedRegion("all");
                setSelectedCategory("all");
              }}
              variant="primary"
              icon={faSearch}
            >
              {t("destinations.noResults.reset", "Show All Destinations")}
            </Button>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-8 mt-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            {t("destinations.cta.title", "Ready to Start Your Journey?")}
          </h2>
          <p className="text-xl text-white/90 mb-6">
            {t(
              "destinations.cta.subtitle",
              "Browse our curated tours and create unforgettable memories"
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              as={Link}
              to="/tours"
              variant="white"
              size="lg"
              className="px-8 py-3"
              icon={faArrowRight}
            >
              {t("destinations.cta.browseTours", "Browse All Tours")}
            </Button>
            <Button
              as={Link}
              to="/contact"
              variant="outline-white"
              size="lg"
              className="px-8 py-3"
            >
              {t("destinations.cta.customTrip", "Plan Custom Trip")}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DestinationsPage;