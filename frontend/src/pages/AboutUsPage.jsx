import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompass,
  faMapMarkerAlt,
  faStar,
  faUserTie,
  faHandshake,
  faHeadset,
  faLeaf,
  faQuoteLeft,
  faHeart,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const AboutUsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("mission");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  // Animation variants améliorées
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const tabs = [
    { id: "mission", label: t("about.ourMission"), icon: faCompass },
    { id: "values", label: t("about.ourValues"), icon: faStar },
    { id: "team", label: t("about.ourTeam"), icon: faUserTie },
  ];

  const teamMembers = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      bio: "Travel enthusiast with over 15 years of experience in the tourism industry",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887",
    },
    {
      name: "Priya Sharma",
      role: "Operations Director",
      bio: "Expert in logistics and exceptional customer experience",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888",
    },
    {
      name: "Arjun Patel",
      role: "Tour Designer",
      bio: "Creator of immersive and authentic cultural experiences",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887",
    },
    {
      name: "Meena Desai",
      role: "Customer Relations",
      bio: "Ensures every journey becomes an unforgettable memory",
      img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071",
    },
  ];

  const testimonials = [
    {
      text: "Ebenezer Tours transformed our Kerala trip into a magical experience. Their attention to detail and local knowledge were exceptional.",
      author: "Sarah Johnson",
      location: "London, UK",
    },
    {
      text: "The personalized itinerary they created for our family captured the essence of Tamil Nadu. We felt like locals, not tourists.",
      author: "Michael Chen",
      location: "Toronto, Canada",
    },
    {
      text: "From the moment we landed until our departure, every detail was perfect. Their 24/7 support gave us complete peace of mind.",
      author: "Isabella Rossi",
      location: "Milan, Italy",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hero Section Améliorée */}
      <div className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-accent/70"></div>
          </div>
        </div>

        <motion.div
          className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-6"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8 shadow-lg"
            variants={itemVariants}
          >
            <FontAwesomeIcon icon={faHeart} className="text-3xl text-white" />
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 text-shadow"
            variants={itemVariants}
          >
            {t("about.title")}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-4xl mb-10 leading-relaxed"
            variants={itemVariants}
          >
            {t("about.subtitle")}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            variants={itemVariants}
          >
            <motion.button
              className="px-8 py-4 bg-white text-primary font-bold rounded-full hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faCompass} className="mr-2" />
              {t("home.hero.cta")}
            </motion.button>
            <motion.button
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              {t("about.ourTeam")}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation par Onglets Élégante */}
      <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl mx-auto -mt-12 max-w-6xl relative z-10 border border-purple-100">
        <div className="flex flex-wrap justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-8 py-6 font-semibold flex items-center transition-all duration-300 rounded-2xl m-2 ${
                activeTab === tab.id
                  ? "text-white bg-primary-gradient shadow-primary transform scale-105"
                  : "text-gray-600 hover:text-primary hover:bg-purple-50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-3 text-lg" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections de Contenu Améliorées */}
      <div className="container mx-auto px-6 py-20 max-w-7xl">
        {/* Section Mission */}
        {activeTab === "mission" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient rounded-full mb-6 shadow-primary">
                  <FontAwesomeIcon
                    icon={faCompass}
                    className="text-2xl text-white"
                  />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  {t("about.ourMission")}
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-xl text-gray-700 leading-relaxed">
                  {t("about.ourStory")}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t("about.subtitle")}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 shadow-soft">
                <FontAwesomeIcon
                  icon={faQuoteLeft}
                  className="text-primary text-2xl mb-4 opacity-60"
                />
                <p className="text-primary text-lg italic leading-relaxed">
                  {t("about.ourVision")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl h-64 shadow-soft hover:shadow-medium transition-all duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
              />
              <motion.div
                className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl h-80 mt-8 shadow-soft hover:shadow-medium transition-all duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
              />
              <motion.div
                className="bg-gradient-to-br from-violet-100 to-violet-50 rounded-2xl h-80 shadow-soft hover:shadow-medium transition-all duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
              />
              <motion.div
                className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl h-64 mt-8 shadow-soft hover:shadow-medium transition-all duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
              />
            </div>
          </motion.div>
        )}

        {/* Section Valeurs */}
        {activeTab === "values" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-16"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient rounded-full mb-6 shadow-primary">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-2xl text-white"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                {t("home.whyChooseUs.title")}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("about.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: faMapMarkerAlt,
                  title: t("home.features.expertGuides"),
                  description: t("home.features.expertGuidesDesc"),
                  color: "from-purple-500 to-indigo-500",
                },
                {
                  icon: faHandshake,
                  title: t("home.features.customTours"),
                  description: t("home.features.customToursDesc"),
                  color: "from-indigo-500 to-blue-500",
                },
                {
                  icon: faLeaf,
                  title: t("home.features.bestPrices"),
                  description: t("home.features.bestPricesDesc"),
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: faHeadset,
                  title: t("navigation.support"),
                  description: t("home.features.safeTravelDesc"),
                  color: "from-cyan-500 to-teal-500",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft hover:shadow-xl transition-all duration-500 h-full flex flex-col border border-purple-100"
                  whileHover={{ y: -10, scale: 1.02 }}
                  variants={cardVariants}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <FontAwesomeIcon
                      icon={value.icon}
                      className="text-white text-2xl"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 flex-grow leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Section Équipe */}
        {activeTab === "team" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-16"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient rounded-full mb-6 shadow-primary">
                <FontAwesomeIcon
                  icon={faUserTie}
                  className="text-2xl text-white"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                {t("about.ourTeam")}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("about.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-500 border border-purple-100"
                  whileHover={{ y: -10, scale: 1.02 }}
                  variants={cardVariants}
                >
                  <div className="h-64 bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-primary font-semibold">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                    <div className="flex justify-center space-x-3 pt-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        >
                          <div className="w-5 h-5 bg-gradient-to-r from-primary to-secondary rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Section Statistiques Améliorée */}
        <motion.div
          className="mt-32 bg-primary-gradient rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Our Achievements
              </h3>
              <p className="text-white/90 text-lg">
                Numbers that testify to our excellence
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                {
                  value: "5000+",
                  label: t("home.whyChooseUs.satisfaction"),
                  icon: faUsers,
                },
                {
                  value: "12",
                  label: t("home.whyChooseUs.experience"),
                  icon: faCompass,
                },
                {
                  value: "98%",
                  label: t("home.whyChooseUs.satisfaction"),
                  icon: faStar,
                },
                {
                  value: "50+",
                  label: t("home.whyChooseUs.destinations"),
                  icon: faMapMarkerAlt,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="space-y-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                    <FontAwesomeIcon icon={stat.icon} className="text-2xl" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/80 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section Témoignages Améliorée */}
        <motion.div
          className="mt-32 space-y-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient rounded-full mb-6 shadow-primary">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="text-2xl text-white"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              {t("home.testimonials.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.testimonials.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft hover:shadow-xl transition-all duration-500 relative border border-purple-100"
                whileHover={{ y: -10, scale: 1.02 }}
                variants={cardVariants}
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-gradient rounded-full flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon
                    icon={faQuoteLeft}
                    className="text-white text-lg"
                  />
                </div>

                <p className="text-gray-700 italic mb-8 relative z-10 leading-relaxed text-lg">
                  {testimonial.text}
                </p>

                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary-gradient rounded-full" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">
                      {testimonial.author}
                    </div>
                    <div className="text-primary font-medium">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section CTA Améliorée */}
        <motion.div
          className="mt-32 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="relative z-10 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                {t("home.specialOffers.title")}
              </h2>
              <p className="text-gray-800/90 text-xl max-w-3xl mx-auto leading-relaxed">
                {t("about.subtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <motion.button
                className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-secondary transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faCompass} className="mr-2" />
                {t("home.hero.cta")}
              </motion.button>
              <motion.button
                className="px-10 py-4 bg-white text-primary font-bold rounded-full hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faHeadset} className="mr-2" />
                {t("navigation.contact")}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutUsPage;
