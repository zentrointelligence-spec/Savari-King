import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui";
import heroImage from "../../assets/images/hero-background.jpg";

// Animation variants
const heroVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const contentVariants = {
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.3,
      ease: "easeOut",
    },
  },
};

const Hero = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slides data
  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        image: heroImage,
        title: t(
          "home.hero.slide1.title",
          "Discover Extraordinary Destinations"
        ),
        subtitle: t("home.hero.slide1.subtitle", "Unforgettable Journeys"),
        description: t(
          "home.hero.slide1.description",
          "Explore the world with our personalized tours and live authentic experiences."
        ),
        cta: t("home.hero.slide1.cta", "Discover Our Tours"),
        link: "/tours", // Lien vers ToursPage - vérifié et correct
      },
      {
        id: 2,
        image: heroImage,
        title: t("home.hero.slide2.title", "Authentic and Guided Adventures"),
        subtitle: t("home.hero.slide2.subtitle", "Expert Guides"),
        description: t(
          "home.hero.slide2.description",
          "Our local guides will help you discover the best-kept secrets of each destination."
        ),
        cta: t("home.hero.slide2.cta", "See Our Blog"),
        link: "/blog", // Lien vers BlogPage - vérifié et correct
      },
      {
        id: 3,
        image: heroImage,
        title: t("home.hero.slide3.title", "Create Unforgettable Memories"),
        subtitle: t("home.hero.slide3.subtitle", "Precious Moments"),
        description: t(
          "home.hero.slide3.description",
          "Every journey is a new story to write, filled with emotions and discoveries."
        ),
        cta: t("home.hero.slide3.cta", "Book Your Trip"),
        link: "/bookings", // Lien vers BookingsPage - vérifié et correct
      },
    ],
    [t]
  );

  // Navigation handlers
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  }, [heroSlides.length]);

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section className="relative h-[90dvh] min-h-[600px] overflow-hidden">
      {/* Background Slides */}
      <AnimatePresence>
        <motion.div
          key={currentSlide}
          variants={heroVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${currentSlideData.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <FontAwesomeIcon
          icon={faChevronLeft}
          className="text-white text-xl group-hover:scale-110 transition-transform duration-300"
        />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <FontAwesomeIcon
          icon={faChevronRight}
          className="text-white text-xl group-hover:scale-110 transition-transform duration-300"
        />
      </button>

      {/* Main Content - Centré verticalement et horizontalement */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 w-full">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Content Animation */}
            <motion.div
              key={`content-${currentSlide}`}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              className="mb-8"
            >
              <motion.p
                className="text-lg md:text-xl font-medium mb-4 text-primary-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {currentSlideData.subtitle}
              </motion.p>

              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {currentSlideData.title}
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {currentSlideData.description}
              </motion.p>
            </motion.div>

            {/* CTA Button - Centré horizontalement */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                as={Link}
                to={currentSlideData.link}
                variant="primary"
                size="lg"
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 border-primary-600 hover:border-primary-700 transition-all duration-300 transform hover:-translate-y-1"
                icon={faArrowRight}
                iconPosition="right"
              >
                {currentSlideData.cta}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator - Centré horizontalement par rapport à la section Heroes */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
        <motion.div
          className="flex flex-col items-center text-white cursor-pointer group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={() => {
            const nextSection = document.querySelector(
              ".tour-categories, .best-sellers, .top-destinations"
            );
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <span className="text-sm mb-2 font-medium group-hover:text-primary-200 transition-colors duration-300">
            {t("home.hero.scrollDown", "Scroll Down")}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="group-hover:text-primary-200 transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faChevronDown} className="text-2xl" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
