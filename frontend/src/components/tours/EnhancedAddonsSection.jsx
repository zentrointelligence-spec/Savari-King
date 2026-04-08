import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpa,
  faStar,
  faGift,
  faUser,
  faFire,
  faCheck,
  faInfoCircle,
  faCrown,
  faLeaf,
  faCamera,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import AddonReviewsSection from "./AddonReviewsSection";
import Price, { DiscountPrice } from "../common/Price";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import "../../styles/addon-animations.css";

const EnhancedAddonsSection = ({ tour }) => {
  const { t } = useTranslation();

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Get addons from tour data
  const addons = tour?.addons || [];

  // Icon mapping function
  const getIconByName = (iconName) => {
    const iconMap = {
      utensils: faUtensils,
      user: faUser,
      spa: faSpa,
      leaf: faLeaf,
      camera: faCamera,
      water: faSpa,
      "theater-masks": faStar,
      car: faUser,
      gift: faGift,
    };
    return iconMap[iconName] || faGift;
  };

  // Color mapping function
  const getColorByCategory = (category) => {
    const colorMap = {
      dining: "from-rose-500 to-pink-600",
      guide: "from-blue-500 to-indigo-600",
      wellness: "from-green-500 to-emerald-600",
      photography: "from-purple-500 to-violet-600",
      adventure: "from-orange-500 to-red-600",
      cultural: "from-amber-500 to-yellow-600",
      transport: "from-gray-500 to-slate-600",
    };
    return colorMap[category] || "from-primary to-blue-600";
  };

  // Transform DB data to component format - Memoized to avoid recalculation
  const formattedAddons = useMemo(() => addons.map((addon) => ({
    id: addon.id,
    name: addon.name,
    price: parseFloat(addon.price),
    originalPrice: addon.original_price ? parseFloat(addon.original_price) : null,
    description: addon.description,
    popularity: addon.popularity || 50,
    rating: parseFloat(addon.rating) || 4.5,
    perPerson: addon.per_person !== false,
    bestValue: addon.is_best_value || false,
    category: addon.category,
    icon: getIconByName(addon.icon),
    color: getColorByCategory(addon.category),
    features: addon.features || [],
    duration: addon.duration,
    availability: addon.availability,
  })), [addons]);

  // Return null if no addons
  if (!formattedAddons || formattedAddons.length === 0) {
    return null;
  }

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Composant de carte d'addon amélioré - Preview mode only
  const EnhancedAddonCard = React.memo(({ addon }) => {
    const [showDetails, setShowDetails] = useState(false);
    const { convertPrice, formatPrice, selectedCurrency } = useCurrency();

    const popularityPercentage = Math.min(
      100,
      Math.max(20, addon.popularity || 87)
    );

    const savings = addon.originalPrice ? addon.originalPrice - addon.price : 0;
    const convertedSavings = convertPrice(savings);

    return (
      <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        {/* Indicateur de popularité */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-20">
          <div
            className={`h-full bg-gradient-to-r ${addon.color}`}
            style={{
              width: `${popularityPercentage}%`
            }}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {popularityPercentage > 75 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <FontAwesomeIcon icon={faFire} />
              <span>{t('addons.hot')}</span>
            </div>
          )}

          {addon.bestValue && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <FontAwesomeIcon icon={faCrown} />
              <span>{t('addons.bestValue')}</span>
            </div>
          )}

          {savings > 0 && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              {t('addons.save')} {formatPrice(convertedSavings, selectedCurrency)}
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="bg-white p-6">
          {/* En-tête avec icône et titre */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              className={`p-4 rounded-xl bg-gradient-to-r ${addon.color} text-white shadow-lg`}
              whileHover={{ rotate: 6, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FontAwesomeIcon icon={addon.icon} className="w-6 h-6" />
            </motion.div>

            <div className="flex-grow">
              <h4 className="font-bold text-xl text-gray-800 mb-2">
                {addon.name}
              </h4>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`w-3 h-3 ${
                        i < (addon.rating || 4)
                          ? "text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {addon.rating} ({popularityPercentage}% {t('addons.chooseThis')})
                </span>
              </div>

              {/* Prix */}
              <div className="flex items-baseline gap-2">
                {addon.originalPrice ? (
                  <DiscountPrice
                    originalPriceINR={addon.originalPrice}
                    discountedPriceINR={addon.price}
                    size="lg"
                    showPercentage={false}
                  />
                ) : (
                  <Price
                    priceINR={addon.price}
                    size="xl"
                    className="text-gray-800"
                  />
                )}
                {addon.perPerson && (
                  <span className="text-xs text-gray-500">{t('common.perPerson')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2">{addon.description}</p>

          {/* Caractéristiques rapides */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {addon.duration}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {addon.category}
            </span>
          </div>

          {/* Informational badge and details button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {t('addons.availableDuringBooking')}
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                setShowDetails(!showDetails);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              {t('common.details')}
            </motion.button>
          </div>

          {/* Détails étendus */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    {t('addons.whatsIncluded')}
                  </h5>
                  <ul className="space-y-1 mb-4">
                    {addon.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="w-3 h-3 text-green-500"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        {t('addons.duration')}
                      </span>
                      <p className="text-gray-600">{addon.duration}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t('addons.availability')}
                      </span>
                      <p className="text-gray-600">{addon.availability}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Re-render only if addon id changes
    return prevProps.addon.id === nextProps.addon.id;
  });

  return (
    <motion.div
      ref={sectionRef}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="mt-20 relative overflow-hidden"
    >
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-amber-50">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 -left-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 -right-20 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* En-tête */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {t('addons.title')}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 ml-3">
              {t('addons.titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('addons.subtitle')}
          </p>
        </motion.div>

        {/* Grid d'addons avec leurs reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {formattedAddons.map((addon) => (
            <div key={addon.id} className="flex flex-col gap-4">
              {/* Addon Card */}
              <EnhancedAddonCard addon={addon} />

              {/* Reviews Section directement en dessous */}
              <AddonReviewsSection
                addonId={addon.id}
                addonName={addon.name}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedAddonsSection;
