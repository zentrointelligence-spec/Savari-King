import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPercent,
  faClock,
  faUsers,
  faCalendarAlt,
  faInfoCircle,
  faGift,
} from "@fortawesome/free-solid-svg-icons";

const SpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Données d'exemple pour les offres spéciales
  const sampleOffers = [
    {
      id: 1,
      title: "First Booking Discount",
      shortDescription: "15% discount on your first booking with our platform",
      offerType: "percentage",
      discountPercentage: 15,
      validUntil: "2026-03-01",
      conditions:
        "Automatically applied to your first booking. Applies to tour price only, not add-ons.",
    },
    {
      id: 2,
      title: "Early Bird Discount",
      shortDescription: "10% discount when booking at least 30 days in advance",
      offerType: "percentage",
      discountPercentage: 10,
      validUntil: "2026-03-01",
      conditions:
        "Automatically applied when booking 30+ days in advance. Applies to tour price only, not add-ons.",
    },
    {
      id: 3,
      title: "Group Discount",
      shortDescription: "10% discount for groups of 7 people or more",
      offerType: "percentage",
      discountPercentage: 10,
      validUntil: "2026-03-01",
      conditions:
        "Automatically applied for groups of 7+ people. Applies to tour price only, not add-ons.",
    },
  ];

  useEffect(() => {
    // Simuler un chargement de données
    const timer = setTimeout(() => {
      setOffers(sampleOffers);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Calculer les jours restants pour chaque offre
  const calculateDaysRemaining = (validUntil) => {
    const now = new Date();
    const endDate = new Date(validUntil);
    const timeDiff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  const renderLoadingSkeleton = () => {
    return (
      <div className="flex flex-col space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-dark-surface rounded-xl p-5 shadow-md border border-gray-100 dark:border-dark-light animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-dark-light rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-light rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-dark-light rounded"></div>
          </div>
        ))}
      </div>
    );
  };

  const renderOfferCard = (offer) => {
    const daysRemaining = calculateDaysRemaining(offer.validUntil);
    const isExpired = daysRemaining === 0;

    return (
      <div
        key={offer.id}
        className={`bg-white dark:bg-dark-surface rounded-xl p-5 shadow-md border ${
          isExpired
            ? "border-gray-200 dark:border-gray-700 opacity-70"
            : "border-gray-100 dark:border-dark-light hover:shadow-lg transition-all duration-300"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          {/* Titre et description */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-text-dark mb-1">
              {offer.title}
            </h3>
            <p className="text-gray-600 dark:text-text-muted-dark text-sm mb-3">
              {offer.shortDescription}
            </p>
          </div>

          {/* Badge de réduction */}
          {!isExpired && (
            <div className="bg-primary text-white px-3 py-1 rounded-md flex items-center space-x-1 text-sm font-semibold ml-4">
              <FontAwesomeIcon icon={faPercent} className="text-xs" />
              <span>-{offer.discountPercentage}%</span>
            </div>
          )}
        </div>

        {/* Icône spécifique selon l'offre */}
        <div className="mb-4 flex items-center">
          {offer.title.includes("Group") ? (
            <>
              <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary" />
              <span className="text-sm text-gray-500 dark:text-text-muted">
                {offer.conditions}
              </span>
            </>
          ) : offer.title.includes("Early Bird") ? (
            <>
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2 text-primary"
              />
              <span className="text-sm text-gray-500 dark:text-text-muted">
                {offer.conditions}
              </span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faGift} className="mr-2 text-primary" />
              <span className="text-sm text-gray-500 dark:text-text-muted">
                {offer.conditions}
              </span>
            </>
          )}
        </div>

        {/* Validité et jours restants */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-text-muted">
            <FontAwesomeIcon icon={faClock} className="mr-2 text-primary" />
            Valid until: {new Date(offer.validUntil).toLocaleDateString()}
          </div>

          {!isExpired ? (
            <div className="text-sm font-medium text-primary">
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
            </div>
          ) : (
            <div className="text-sm font-medium text-red-500">Expired</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* En-tête de section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-4 py-2 mb-4">
            <FontAwesomeIcon icon={faGift} className="mr-2" />
            <span className="text-sm font-medium">Special Offers</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-text-dark mb-2">
            Current Special Offers
          </h2>
          <p className="text-gray-600 dark:text-text-muted">
            All offers are automatically applied during booking when conditions
            are met
          </p>
        </div>

        {/* Contenu */}
        {loading ? (
          renderLoadingSkeleton()
        ) : (
          <>
            <div className="flex flex-col space-y-6">
              {offers.map((offer) => renderOfferCard(offer))}
            </div>

            {/* Note sur l'application automatique */}
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-gray-600 dark:text-text-muted text-center">
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="mr-2 text-primary"
                />
                All special offers are automatically applied to the tour price
                (excluding add-ons) when conditions are met during the booking
                process. No action is required from you.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SpecialOffers;
