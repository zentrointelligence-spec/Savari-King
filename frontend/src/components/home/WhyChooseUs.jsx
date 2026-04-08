import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faUsers,
  faGlobe,
  faHeadset,
  faStar,
  faAward,
  faThumbsUp,
  faHeart,
  faCheckCircle,
  faClock,
  faMoneyBillWave,
  faUserShield,
  faBolt,
  faEye,
  faUndo,
  faLock,
  faCog,
  faMapMarkedAlt,
  faComments,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";

class WhyChooseUsSimple extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleFeatures: new Set(),
    };
    this.featureRefs = {};
  }

  componentDidMount() {
    this.setupIntersectionObserver();
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver = () => {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const featureId = entry.target.dataset.featureId;
            if (featureId) {
              this.setState((prevState) => ({
                visibleFeatures: new Set([
                  ...prevState.visibleFeatures,
                  featureId,
                ]),
              }));
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    // Observer elements after a short delay to ensure they are mounted
    setTimeout(() => {
      Object.values(this.featureRefs).forEach((ref) => {
        if (ref) {
          this.observer.observe(ref);
        }
      });
    }, 100);
  };

  setFeatureRef = (id, ref) => {
    this.featureRefs[id] = ref;
  };

  isFeatureVisible = (id) => {
    return this.state.visibleFeatures.has(id);
  };

  renderFeature = (feature, index) => {
    const isVisible = this.isFeatureVisible(feature.id);
    const animationDelay = index * 0.1;

    return (
      <div
        key={feature.id}
        ref={(ref) => this.setFeatureRef(feature.id, ref)}
        data-feature-id={feature.id}
        className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-700 hover:shadow-xl hover:-translate-y-2 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{
          transitionDelay: isVisible ? `${animationDelay}s` : "0s",
        }}
      >
        <div className="flex items-start space-x-4">
          <div
            className={`flex-shrink-0 w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center`}
          >
            <FontAwesomeIcon
              icon={feature.icon}
              className={`text-xl ${feature.iconColor}`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {feature.description}
            </p>
            {feature.badge && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${feature.badgeColor}`}
              >
                {feature.badge}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const features = [
      {
        id: "quick-response",
        icon: faBolt,
        iconColor: "text-white",
        bgColor: "bg-blue-500",
        title: "Quick & Personalized Response",
        description:
          "We commit to responding to your quote request in less than 30 minutes during our business hours, and to send you a personalized final offer within 2 hours.",
        badge: "< 30 min response",
        badgeColor: "bg-blue-100 text-blue-800",
      },
      {
        id: "price-transparency",
        icon: faEye,
        iconColor: "text-white",
        bgColor: "bg-green-500",
        title: "Price Transparency",
        description:
          "All our quotes are detailed and valid for 48 hours. No hidden fees – you know exactly what you're paying for.",
        badge: "48h validity",
        badgeColor: "bg-green-100 text-green-800",
      },
      {
        id: "flexible-cancellation",
        icon: faUndo,
        iconColor: "text-white",
        bgColor: "bg-yellow-500",
        title: "Flexible Cancellation & Refund",
        description:
          "Free cancellation anytime before payment. Full refund possible up to 24 hours after payment.",
        badge: "Free cancellation",
        badgeColor: "bg-yellow-100 text-yellow-800",
      },
      {
        id: "secure-booking",
        icon: faLock,
        iconColor: "text-white",
        bgColor: "bg-purple-500",
        title: "Secure Booking Process",
        description:
          "Payment via secure gateway (Stripe, etc.). No banking information is stored on our servers.",
        badge: "SSL Secured",
        badgeColor: "bg-purple-100 text-purple-800",
      },
      {
        id: "quality-service",
        icon: faCog,
        iconColor: "text-white",
        bgColor: "bg-red-500",
        title: "Personalized Quality Service",
        description:
          "Each offer is manually verified by our team to guarantee hotel and vehicle availability. Modular options: additional vehicles, add-ons, and packages adapted to all budgets.",
        badge: "Manually verified",
        badgeColor: "bg-red-100 text-red-800",
      },
      {
        id: "authentic-experience",
        icon: faMapMarkedAlt,
        iconColor: "text-white",
        bgColor: "bg-indigo-500",
        title: "Authentic & Local Experience",
        description:
          "We offer carefully designed itineraries to discover the hidden treasures of Tamil Nadu and Kerala, with experienced guides and drivers.",
        badge: "Local expertise",
        badgeColor: "bg-indigo-100 text-indigo-800",
      },
      {
        id: "continuous-support",
        icon: faComments,
        iconColor: "text-white",
        bgColor: "bg-teal-500",
        title: "Continuous Customer Support",
        description:
          "Access to your personal 'My Bookings' space to track your reservation in real-time. Notification at each step: quote sent, payment confirmed, cancellation, etc.",
        badge: "Real-time tracking",
        badgeColor: "bg-teal-100 text-teal-800",
      },
      {
        id: "verified-reviews",
        icon: faStarHalfAlt,
        iconColor: "text-white",
        bgColor: "bg-pink-500",
        title: "Verified Customer Reviews",
        description:
          "All reviews are moderated and authentic – left by travelers who have completed their stay.",
        badge: "100% authentic",
        badgeColor: "bg-pink-100 text-pink-800",
      },
    ];

    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-3">🎯</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Why Choose Us?
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what makes us the ideal partner for your travels
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) =>
              this.renderFeature(feature, index)
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default WhyChooseUsSimple;
