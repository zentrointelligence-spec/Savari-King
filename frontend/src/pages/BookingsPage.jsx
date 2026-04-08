import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faCalendarAlt,
  faUsers,
  faMapMarkerAlt,
  faStar,
  faArrowRight,
  faSearch,
  faFilter,
  faHeart,
  faMoneyBillWave,
  faGlobe,
  faCompass,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../contexts/AuthContext";
import { useHomepageData } from "../hooks/useHomepageData";
import { Button } from "../components/ui";

const BookingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { data: homepageData, loading } = useHomepageData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  const featuredTours = homepageData?.tours?.slice(0, 6) || [];
  const categories = homepageData?.categories || [];

  const handleBookTour = (tourId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/tours/${tourId}/book`);
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("bookings.hero.title", "Plan Your Perfect Trip")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              {t(
                "bookings.hero.subtitle",
                "Discover amazing destinations and book your dream vacation"
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                to="/tours"
                variant="outline"
                size="lg"
                className="px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
                icon={faCompass}
              >
                {t("bookings.hero.browseTours", "Browse All Tours")}
              </Button>
              {user && (
                <Button
                  as={Link}
                  to="/my-bookings"
                  variant="primary"
                  size="lg"
                  className="px-8 py-4 bg-white text-primary hover:bg-gray-100"
                  icon={faPlane}
                >
                  {t("bookings.hero.myBookings", "My Bookings")}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FontAwesomeIcon icon={faGlobe} className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {homepageData?.stats?.destinations || "50+"}
            </h3>
            <p className="text-gray-600">
              {t("bookings.stats.destinations", "Destinations")}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FontAwesomeIcon icon={faPlane} className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {homepageData?.stats?.tours || "200+"}
            </h3>
            <p className="text-gray-600">
              {t("bookings.stats.tours", "Tour Packages")}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <FontAwesomeIcon icon={faUsers} className="text-yellow-600 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {homepageData?.stats?.customers || "10K+"}
            </h3>
            <p className="text-gray-600">
              {t("bookings.stats.customers", "Happy Customers")}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <FontAwesomeIcon icon={faStar} className="text-purple-600 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {homepageData?.stats?.rating || "4.9"}
            </h3>
            <p className="text-gray-600">
              {t("bookings.stats.rating", "Average Rating")}
            </p>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FontAwesomeIcon icon={faSearch} className="mr-3 text-primary" />
            {t("bookings.search.title", "Find Your Perfect Tour")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("bookings.search.destination", "Search Destination")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t(
                    "bookings.search.placeholder",
                    "Where do you want to go?"
                  )}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("bookings.search.category", "Category")}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">
                  {t("bookings.search.allCategories", "All Categories")}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("bookings.search.priceRange", "Price Range")}
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">
                  {t("bookings.search.allPrices", "All Prices")}
                </option>
                <option value="budget">
                  {t("bookings.search.budget", "Budget (Under $500)")}
                </option>
                <option value="mid">
                  {t("bookings.search.mid", "Mid-range ($500-$1500)")}
                </option>
                <option value="luxury">
                  {t("bookings.search.luxury", "Luxury ($1500+)")}
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              as={Link}
              to={`/tours?search=${searchTerm}&category=${selectedCategory}&price=${priceRange}`}
              variant="primary"
              size="lg"
              className="px-8 py-3"
              icon={faSearch}
            >
              {t("bookings.search.button", "Search Tours")}
            </Button>
          </div>
        </motion.div>

        {/* Featured Tours */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {t("bookings.featured.title", "Featured Tours")}
            </h2>
            <Button
              as={Link}
              to="/tours"
              variant="outline"
              className="px-6 py-2"
              icon={faArrowRight}
            >
              {t("bookings.featured.viewAll", "View All")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour) => (
              <motion.div
                key={tour.id}
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={tour.main_image_url || tour.image_url || tour.image}
                    alt={tour.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x300";
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-gray-600 hover:text-red-500"
                      />
                    </button>
                  </div>
                  {tour.discount_percentage && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{tour.discount_percentage}%
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary font-medium">
                      {tour.category_name}
                    </span>
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400 text-sm mr-1"
                      />
                      <span className="text-sm text-gray-600">
                        {tour.average_rating || "4.5"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {tour.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tour.short_description || tour.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                    <span>{tour.destination_name}</span>
                    <FontAwesomeIcon icon={faCalendarAlt} className="ml-4 mr-2" />
                    <span>{tour.duration} days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        ${tour.starting_price || tour.price}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        {t("bookings.tour.perPerson", "per person")}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleBookTour(tour.id)}
                      variant="primary"
                      size="sm"
                      className="px-4 py-2"
                      icon={faArrowRight}
                    >
                      {t("bookings.tour.bookNow", "Book Now")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-8 mt-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            {t("bookings.cta.title", "Ready to Start Your Adventure?")}
          </h2>
          <p className="text-xl mb-6 text-primary-100">
            {t(
              "bookings.cta.subtitle",
              "Join thousands of travelers who have discovered amazing destinations with us"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              to="/tours"
              variant="outline"
              size="lg"
              className="px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
              icon={faCompass}
            >
              {t("bookings.cta.exploreTours", "Explore All Tours")}
            </Button>
            <Button
              as={Link}
              to="/contact"
              variant="primary"
              size="lg"
              className="px-8 py-4 bg-white text-primary hover:bg-gray-100"
              icon={faUsers}
            >
              {t("bookings.cta.contactUs", "Contact Our Experts")}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingsPage;