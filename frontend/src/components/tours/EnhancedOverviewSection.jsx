import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faUsers,
  faMapMarkerAlt,
  faStar,
  faCheckCircle,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const EnhancedOverviewSection = ({ tour, selectedTier }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("highlights");

  if (!tour) return null;

  // Get Standard tier for inclusions (default experience)
  const standardTier = tour.tiers?.find(tier => tier.tier_name === 'Standard') || tour.tiers?.[0] || null;

  // Calculate statistics from tour data
  const hasReviews = (tour.review_count > 0) || (tour.avg_rating > 0) || (tour.rating > 0);

  const stats = [
    {
      icon: faClock,
      value: `${tour.duration_days || 1} ${t('journeyOverview.days')}`,
      label: "",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: faUsers,
      value: tour.max_group_size || 20,
      label: t('journeyOverview.people'),
      color: "from-green-500 to-green-600",
    },
    {
      icon: faMapMarkerAlt,
      value: tour.destinations?.length || tour.covered_destinations?.length || 1,
      label: t('journeyOverview.destinations'),
      color: "from-purple-500 to-purple-600",
    },
    // Only show satisfaction card if tour has reviews
    ...(hasReviews ? [{
      icon: faStar,
      value: `${parseFloat((tour.avg_rating > 0 ? tour.avg_rating : null) || (tour.rating > 0 ? tour.rating : null) || 4.8).toFixed(1)}/5`,
      label: t('journeyOverview.satisfaction'),
      color: "from-amber-500 to-amber-600",
    }] : []),
  ];

  const tabs = [
    {
      key: "highlights",
      label: t('journeyOverview.tabs.highlights'),
      icon: faStar,
      content: tour.highlights || [],
    },
    {
      key: "inclusions",
      label: t('journeyOverview.tabs.inclusions'),
      icon: faCheckCircle,
      content: standardTier?.inclusions_summary || tour.inclusions || [],
    },
    {
      key: "destinations",
      label: t('journeyOverview.tabs.destinations'),
      icon: faMapMarkerAlt,
      content: tour.destinations || tour.covered_destinations || [],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('journeyOverview.title')}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('journeyOverview.titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('journeyOverview.subtitle')}
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid grid-cols-2 ${hasReviews ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-16`}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                <FontAwesomeIcon icon={stat.icon} className="text-2xl text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2 text-center">
                {stat.value}
              </div>
              <div className="text-gray-600 text-center font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-6 px-6 font-semibold transition-all relative ${
                  activeTab === tab.key
                    ? "text-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {tabs.map((tab) => {
                if (activeTab !== tab.key) return null;

                return (
                  <motion.div
                    key={tab.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Show Standard tier indicator for inclusions tab */}
                    {tab.key === "inclusions" && standardTier && (
                      <div className="mb-6 text-center">
                        <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                          {t("tours.showingFor")}: {standardTier.tier_name} {t("tours.package")}
                        </span>
                      </div>
                    )}

                    {tab.key === "destinations" ? (
                      /* Destinations Grid */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tab.content.map((dest, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all group"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                              {index + 1}
                            </div>
                            <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {dest}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      /* Highlights & Inclusions List */
                      <div className="space-y-4">
                        {tab.content.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-4 p-5 rounded-xl hover:bg-gray-50 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 text-lg leading-relaxed">{item}</p>
                            </div>
                            <FontAwesomeIcon
                              icon={faChevronRight}
                              className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {tab.content.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <p>No {tab.label.toLowerCase()} available</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default EnhancedOverviewSection;
