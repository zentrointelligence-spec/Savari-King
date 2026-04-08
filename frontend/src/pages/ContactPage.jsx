import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faEnvelope,
  faPhone,
  faPaperPlane,
  faCheckCircle,
  faComments,
  faClock,
  faGlobe,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";

const ContactPage = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
        ease: [0.25, 0.46, 0.45, 0.94],
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: "", email: "", message: "" });

      // Réinitialiser le message de succès après 5s
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const ContactCard = ({ icon, title, content, color }) => (
    <motion.div
      className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft hover:shadow-xl transition-all duration-500 flex items-start border border-purple-100"
      whileHover={{ y: -10, scale: 1.02 }}
      variants={cardVariants}
    >
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center mr-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        <FontAwesomeIcon icon={icon} className="text-white text-2xl" />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-lg">{content}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hero Section Élégante */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')",
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
            <FontAwesomeIcon
              icon={faComments}
              className="text-3xl text-white"
            />
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 text-shadow"
            variants={itemVariants}
          >
            Contact <span className="text-primary-gradient">Us</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-4xl mb-10 leading-relaxed"
            variants={itemVariants}
          >
            We would love to hear from you. Whether you have a question or want
            to plan your trip, we are here to help you.
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
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              Send a Message
            </motion.button>
            <motion.button
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              Call Us
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Section Principale */}
      <div className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Formulaire de Contact Amélioré */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient rounded-full mb-6 shadow-primary">
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="text-2xl text-white"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Send Us a Message
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Fill out the form below and we will get back to you as soon as
                possible.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft border border-purple-100">
              {isSubmitted ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 text-4xl"
                    />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 text-lg">
                    We will get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formState.name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formState.email}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows="6"
                      value={formState.message}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50 backdrop-blur-sm resize-none"
                      placeholder="Describe your travel project or ask your question..."
                      required
                    ></textarea>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-8 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl
                               ${
                                 isSubmitting
                                   ? "bg-gray-400 cursor-not-allowed"
                                   : "bg-primary-gradient hover:scale-105"
                               }
                               flex items-center justify-center`}
                    whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} className="mr-3" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Informations de Contact Améliorées */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient rounded-full mb-6 shadow-primary">
                <FontAwesomeIcon
                  icon={faHeadset}
                  className="text-2xl text-white"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Our Contact Details
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Multiple ways to contact us to plan your perfect trip.
              </p>
            </div>

            <div className="space-y-6">
              <ContactCard
                icon={faMapMarkerAlt}
                title="Our Office"
                content="123 Travel Lane, Chennai, Tamil Nadu, 600001, India"
                color="from-purple-500 to-indigo-500"
              />

              <ContactCard
                icon={faEnvelope}
                title="Email"
                content="support@ebenezertours.com"
                color="from-indigo-500 to-blue-500"
              />

              <ContactCard
                icon={faPhone}
                title="Phone"
                content="+91 123 456 7890"
                color="from-blue-500 to-cyan-500"
              />

              <ContactCard
                icon={faClock}
                title="Opening Hours"
                content="Mon - Fri: 9:00 AM - 6:00 PM | Sat: 9:00 AM - 2:00 PM"
                color="from-cyan-500 to-teal-500"
              />
            </div>

            {/* Carte Interactive Placeholder */}
            <motion.div
              className="overflow-hidden rounded-2xl shadow-xl border border-purple-100"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 h-80 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                <div className="text-center z-10">
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="text-primary text-6xl mb-4"
                  />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-gray-600">Find us easily</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Section CTA Finale */}
        <motion.div
          className="mt-32 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="relative z-10 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Ready to Start Your Adventure?
              </h2>
              <p className="text-gray-800/90 text-xl max-w-3xl mx-auto leading-relaxed">
                Our team of experts is here to create the perfect travel
                experience tailored to your needs and budget.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <motion.button
                className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-secondary transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                Call Now
              </motion.button>
              <motion.button
                className="px-10 py-4 bg-white text-primary font-bold rounded-full hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faComments} className="mr-2" />
                Live Chat
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactPage;
