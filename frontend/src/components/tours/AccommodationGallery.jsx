import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faStar,
  faGlobe,
  faMapMarkerAlt,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// API base URL helper
const buildApiUrl = (path) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseURL}${path}`;
};

const AccommodationGallery = ({ tour }) => {
  const { t } = useTranslation();
  const [accommodations, setAccommodations] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPanoramaMode, setIsPanoramaMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef(null);

  // Fetch accommodations from API
  useEffect(() => {
    const fetchAccommodations = async () => {
      if (!tour?.id) return;

      setIsLoading(true);
      try {
        const response = await axios.get(buildApiUrl(`/api/tours/${tour.id}/accommodations`));

        // Map API data to component format
        const formattedData = response.data.accommodations.map((acc) => ({
          name: acc.accommodation_name,
          tier: acc.tier_name,
          image_url: acc.accommodation_image_url,
          tags: acc.accommodation_tags || [],
          rating: parseFloat(acc.accommodation_rating) || 0,
          description: acc.accommodation_description,
          hotel_type: acc.hotel_type,
          price: acc.price,
        }));

        setAccommodations(formattedData);
      } catch (error) {
        console.error("Error fetching accommodations:", error);
        setAccommodations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccommodations();
  }, [tour?.id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!swiperRef.current) return;

      if (e.key === "ArrowLeft") {
        swiperRef.current.slidePrev();
      } else if (e.key === "ArrowRight") {
        swiperRef.current.slideNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toggle 360° panorama mode
  const togglePanoramaMode = () => {
    setIsPanoramaMode(!isPanoramaMode);
  };

  if (isLoading) {
    return (
      <div className="mt-20 py-20 text-center">
        <div className="animate-pulse bg-gradient-to-r from-blue-200 to-amber-200 rounded-xl w-32 h-32 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {t('accommodations.loading')}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('accommodations.loadingSubtitle')}
        </p>
      </div>
    );
  }

  if (accommodations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-2 mb-4 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
            <FontAwesomeIcon icon={faBed} className="mr-2" />
            {t('accommodations.title')}
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('accommodations.title')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('accommodations.subtitle')}
          </p>
        </div>

        {/* Main Carousel Container */}
        <div className="relative">
          {/* Tier Selector - Above the carousel */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {["Standard", "Premium", "Luxury"].map((tier, idx) => (
              <button
                key={tier}
                className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  accommodations[activeIndex]?.tier === tier
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-110"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg"
                }`}
                onClick={() => {
                  const tierIndex = accommodations.findIndex((a) => a.tier === tier);
                  if (tierIndex !== -1 && swiperRef.current) {
                    swiperRef.current.slideTo(tierIndex);
                  }
                }}
              >
                {t(`accommodations.tiers.${tier}`)}
                {accommodations[activeIndex]?.tier === tier && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Carousel Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                prevEl: ".swiper-button-prev-custom-acc",
                nextEl: ".swiper-button-next-custom-acc",
              }}
              pagination={{
                el: ".swiper-pagination-custom-acc",
                clickable: true,
                renderBullet: (index, className) => {
                  return `<span class="${className} !bg-blue-600 !w-2 !h-2 !rounded-full !mx-1 hover:!bg-purple-600 transition-all"></span>`;
                },
              }}
              autoplay={{
                delay: 8000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={accommodations.length > 1}
              effect={"fade"}
              fadeEffect={{ crossFade: true }}
              speed={1000}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              className="h-[550px] md:h-[700px]"
            >
              {accommodations.map((acc, index) => (
                <SwiperSlide key={index}>
                  <div className="relative h-full w-full">
                    {/* Image Background */}
                    <div
                      className={`absolute inset-0 transition-transform duration-1000 ease-out ${
                        isPanoramaMode ? "scale-110" : "scale-100"
                      }`}
                      style={{
                        backgroundImage: `url(${acc.image_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    {/* Gradient Overlay - More subtle */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Content Container */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
                      {/* Top Bar - Badges and 360 button */}
                      <div className="flex items-start justify-between">
                        <div className="flex flex-wrap gap-3">
                          {/* Tier Badge */}
                          <div className="backdrop-blur-md bg-white/20 border border-white/30 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                            <FontAwesomeIcon icon={faBed} className="text-white" />
                            <span className="text-white font-semibold text-sm">
                              {t(`accommodations.tiers.${acc.tier}`)} {t('accommodations.package')}
                            </span>
                          </div>

                          {/* Rating Badge */}
                          <div className="backdrop-blur-md bg-white/20 border border-white/30 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FontAwesomeIcon
                                  key={i}
                                  icon={faStar}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(acc.rating)
                                      ? "text-amber-400"
                                      : "text-white/40"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-white font-bold text-sm">{acc.rating}</span>
                          </div>
                        </div>

                        {/* 360° Panorama Button */}
                        <button
                          onClick={togglePanoramaMode}
                          className={`backdrop-blur-md rounded-full p-3 shadow-lg transition-all duration-300 ${
                            isPanoramaMode
                              ? "bg-blue-600 border-2 border-blue-400"
                              : "bg-white/20 border border-white/30 hover:bg-white/30"
                          }`}
                          aria-label={
                            isPanoramaMode
                              ? t('accommodations.exit360View')
                              : t('accommodations.enter360View')
                          }
                        >
                          <FontAwesomeIcon
                            icon={faGlobe}
                            className={`w-5 h-5 ${
                              isPanoramaMode ? "text-white" : "text-white/90"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Bottom Content */}
                      <div className="space-y-6">
                        {/* Hotel Name */}
                        <div>
                          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                            {acc.name}
                          </h3>
                          <p className="text-base md:text-lg text-white/90 max-w-3xl drop-shadow-md leading-relaxed">
                            {acc.description}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {acc.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="backdrop-blur-md bg-white/15 border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium shadow-md hover:bg-white/25 transition-all"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons - Positioned outside the image */}
            <button
              className="swiper-button-prev-custom-acc absolute left-4 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md bg-white/90 hover:bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 group"
              aria-label={t('accommodations.previousAccommodation')}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className="w-5 h-5 text-gray-800 group-hover:text-blue-600 transition-colors"
              />
            </button>
            <button
              className="swiper-button-next-custom-acc absolute right-4 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md bg-white/90 hover:bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 group"
              aria-label={t('accommodations.nextAccommodation')}
            >
              <FontAwesomeIcon
                icon={faChevronRight}
                className="w-5 h-5 text-gray-800 group-hover:text-blue-600 transition-colors"
              />
            </button>

            {/* Pagination Dots */}
            <div className="swiper-pagination-custom-acc absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2"></div>
          </div>

          {/* Description Below */}
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('accommodations.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
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

export default AccommodationGallery;
