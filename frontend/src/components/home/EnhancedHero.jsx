import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faPlay,
  faMapMarkerAlt,
  faCalendarAlt,
  faUsers,
  faStar,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faQuoteLeft,
  faGlobe,
  faCamera,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { AnimateOnScroll, StaggeredList } from '../animations/AnimatedComponents';

const BackgroundSlide = ({ slide, isActive, index }) => {
  return (
    <div
      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
      }`}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="w-full h-full object-cover"
        loading={index === 0 ? 'eager' : 'lazy'}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
  );
};

const SearchForm = () => {
  const { t } = useTranslation();
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de recherche
    console.log('Recherche:', searchData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Destination */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('search.destination', 'Destination')}
          </label>
          <div className="relative">
            <FontAwesomeIcon 
              icon={faMapMarkerAlt} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" 
            />
            <input
              type="text"
              value={searchData.destination}
              onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
              placeholder={t('search.destination.placeholder', 'Où voulez-vous aller ?')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('search.checkin', 'Arrivée')}
          </label>
          <div className="relative">
            <FontAwesomeIcon 
              icon={faCalendarAlt} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" 
            />
            <input
              type="date"
              value={searchData.checkIn}
              onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('search.checkout', 'Départ')}
          </label>
          <div className="relative">
            <FontAwesomeIcon 
              icon={faCalendarAlt} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" 
            />
            <input
              type="date"
              value={searchData.checkOut}
              onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('search.guests', 'Voyageurs')}
          </label>
          <div className="relative">
            <FontAwesomeIcon 
              icon={faUsers} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" 
            />
            <select
              value={searchData.guests}
              onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 appearance-none"
            >
              {[1,2,3,4,5,6,7,8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'personne' : 'personnes'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-6 bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-primary flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faSearch} className="mr-3" />
        {t('search.button', 'Rechercher')}
      </button>
    </form>
  );
};

const QuickStats = () => {
  const { t } = useTranslation();
  
  const stats = [
    { icon: faUsers, value: '500K+', label: t('stats.customers', 'Clients Satisfaits') },
    { icon: faGlobe, value: '150+', label: t('stats.destinations', 'Destinations') },
    { icon: faStar, value: '4.9/5', label: t('stats.rating', 'Note Moyenne') },
    { icon: faCamera, value: '10M+', label: t('stats.photos', 'Photos Partagées') }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          <FontAwesomeIcon icon={stat.icon} className="text-2xl text-primary mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
          <div className="text-sm text-white/80">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

const TestimonialCarousel = () => {
  const { t } = useTranslation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: t("testimonials.marie.text", "An absolutely magical travel experience! The team organized every detail to perfection."),
      author: "Marie Dubois",
      location: "Paris, France",
      rating: 5
    },
    {
      text: t("testimonials.jean.text", "Unforgettable memories thanks to this exceptional agency. I highly recommend!"),
      author: "Jean Martin",
      location: "Lyon, France",
      rating: 5
    },
    {
      text: t("testimonials.sophie.text", "Remarkable customer service and dream destinations. Thank you for this extraordinary trip!"),
      author: "Sophie Laurent",
      location: "Marseille, France",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="text-center">
        <FontAwesomeIcon icon={faQuoteLeft} className="text-3xl text-primary mb-4" />
        <p className="text-white text-lg mb-4 italic">
          "{testimonials[currentTestimonial].text}"
        </p>
        <div className="flex items-center justify-center space-x-1 mb-2">
          {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
            <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />
          ))}
        </div>
        <div className="text-white font-semibold">
          {testimonials[currentTestimonial].author}
        </div>
        <div className="text-white/70 text-sm">
          {testimonials[currentTestimonial].location}
        </div>
      </div>
      
      {/* Indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTestimonial(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentTestimonial ? 'bg-primary w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const EnhancedHero = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const heroSlides = [
    {
      id: 1,
      image: '/images/hero/paris-sunset.jpg',
      title: t('hero.slide1.title', 'Découvrez Paris Autrement'),
      subtitle: t('hero.slide1.subtitle', 'Une expérience unique dans la ville lumière')
    },
    {
      id: 2,
      image: '/images/hero/mountain-adventure.jpg',
      title: t('hero.slide2.title', 'Aventures en Montagne'),
      subtitle: t('hero.slide2.subtitle', 'Explorez les sommets les plus spectaculaires')
    },
    {
      id: 3,
      image: '/images/hero/beach-paradise.jpg',
      title: t('hero.slide3.title', 'Paradis Tropical'),
      subtitle: t('hero.slide3.subtitle', 'Détendez-vous sur les plus belles plages')
    }
  ];

  // Auto-rotation des slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <BackgroundSlide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
            index={index}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
      >
        <FontAwesomeIcon icon={faChevronLeft} size="lg" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
      >
        <FontAwesomeIcon icon={faChevronRight} size="lg" />
      </button>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-white">
              <AnimateOnScroll animation="slideUp" duration={800}>
                <div className="inline-flex items-center bg-gradient-to-r from-primary/20 to-secondary/20 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                  <FontAwesomeIcon icon={faHeart} className="mr-2 text-red-400" />
                  {t('hero.badge', 'Voyages de Rêve')}
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="slideUp" duration={800} delay={200}>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  {heroSlides[currentSlide].title}
                </h1>
              </AnimateOnScroll>

              <AnimateOnScroll animation="slideUp" duration={800} delay={400}>
                <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
                  {heroSlides[currentSlide].subtitle}
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll animation="slideUp" duration={800} delay={600}>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    to="/tours"
                    className="inline-flex items-center bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-primary"
                  >
                    <FontAwesomeIcon icon={faArrowRight} className="mr-3" />
                    {t('hero.cta.explore', 'Explorer nos Tours')}
                  </Link>
                  
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:bg-white/30 border border-white/30"
                  >
                    <FontAwesomeIcon icon={faPlay} className="mr-3" />
                    {t('hero.cta.video', 'Voir la Vidéo')}
                  </button>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="slideUp" duration={800} delay={800}>
                <QuickStats />
              </AnimateOnScroll>
            </div>

            {/* Right Column - Search & Testimonial */}
            <div className="space-y-8">
              <AnimateOnScroll animation="slideLeft" duration={800} delay={400}>
                <SearchForm />
              </AnimateOnScroll>

              <AnimateOnScroll animation="slideLeft" duration={800} delay={600}>
                <TestimonialCarousel />
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-primary w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHero;