import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faShieldAlt,
  faCreditCard,
  faCalendarCheck,
  faGift,
  faClock,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import {
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
} from "@fortawesome/free-brands-svg-icons";

const StrategicCtaSection = ({ tour }) => {
  const [viewers, setViewers] = useState(0);
  const [timer, setTimer] = useState(1800); // 30 minutes in seconds
  const [discountTimer, setDiscountTimer] = useState(7200); // 2 hours in seconds
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const discountRef = useRef(null);

  // Simulate viewer count with realistic growth
  useEffect(() => {
    const initialViewers = Math.floor(Math.random() * (25 - 8 + 1)) + 8;
    setViewers(initialViewers);

    const interval = setInterval(() => {
      setViewers((v) => {
        // Simulate organic growth with occasional spikes
        const increase = Math.random() > 0.7 ? 3 : 1;
        return v + increase;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Timer for booking urgency
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Discount countdown timer
  useEffect(() => {
    discountRef.current = setInterval(() => {
      setDiscountTimer((prev) => {
        if (prev <= 0) {
          clearInterval(discountRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(discountRef.current);
  }, []);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format discount time
  const formatDiscountTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="mt-16 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/10 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent z-10"></div>

      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-8 h-8 rounded-full bg-yellow-400 animate-bounce"></div>
      <div className="absolute bottom-20 right-16 w-6 h-6 rounded-full bg-pink-500 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm animate-ping"></div>

      <div className="relative z-20 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Don't miss this opportunity to experience the journey of a
              lifetime
            </p>
          </div>

          {/* Conversion techniques */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-10">
            {/* Viewer count */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-center">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEye}
                  className="text-yellow-400 text-3xl mr-4 animate-pulse"
                />
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 animate-ping"></div>
              </div>
              <div>
                <div className="text-white font-bold text-2xl">{viewers}</div>
                <div className="text-white/80 text-sm">people viewing now</div>
              </div>
            </div>

            {/* Guarantee */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-center">
              <FontAwesomeIcon
                icon={faShieldAlt}
                className="text-green-400 text-3xl mr-4"
              />
              <div>
                <div className="text-white font-bold">Free Cancellation</div>
                <div className="text-white/80 text-sm">
                  48 hours before departure
                </div>
              </div>
            </div>

            {/* Limited time offer */}
            <div className="lg:col-span-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-5 flex items-center">
              <FontAwesomeIcon
                icon={faGift}
                className="text-white text-3xl mr-4"
              />
              <div>
                <div className="text-white font-bold flex items-center">
                  <span className="mr-2">Limited Time Offer!</span>
                  <FontAwesomeIcon icon={faFire} />
                </div>
                <div className="text-white/90 text-sm">
                  Book in the next {formatDiscountTime(discountTimer)} and
                  receive a free spa session
                </div>
              </div>
            </div>
          </div>

          {/* Stats and payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Timer */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
              <div className="text-white/80 mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                <span>Hurry! Offer ends in</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 font-mono">
                {formatTime(timer)}
              </div>
            </div>

            {/* Last booked */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
              <div className="text-white/80 mb-2">Last booked</div>
              <div className="text-xl font-bold text-white">12 minutes ago</div>
            </div>

            {/* Payment options */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-white/80 mb-3 text-center">
                Secure Payments
              </div>
              <div className="flex justify-center space-x-5">
                <FontAwesomeIcon
                  icon={faCcVisa}
                  className="text-3xl text-white"
                />
                <FontAwesomeIcon
                  icon={faCcMastercard}
                  className="text-3xl text-white"
                />
                <FontAwesomeIcon
                  icon={faCcPaypal}
                  className="text-3xl text-white"
                />
                <div className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded">
                  +5 More
                </div>
              </div>
            </div>
          </div>

          {/* Main CTA */}
          <div className="text-center">
            <Link
              to={`/book/${tour.id}`}
              className={`inline-block relative overflow-hidden group px-12 py-5 rounded-xl font-bold text-xl shadow-2xl transition-all duration-300 ${
                isHovered ? "transform scale-105" : ""
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                background: "linear-gradient(45deg, #ff8a00, #da1b60, #8e2de2)",
                backgroundSize: "300% 300%",
              }}
            >
              <div className="relative z-10 flex items-center justify-center">
                <span className="mr-3">Book Your Adventure Now</span>
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>

              {/* Animated background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(45deg, #8e2de2, #da1b60, #ff8a00)",
                  backgroundSize: "300% 300%",
                  animation: "gradientShift 3s ease infinite",
                }}
              ></div>

              {/* Glitter effect */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animation: `twinkle ${1 + Math.random() * 2}s infinite`,
                    }}
                  ></div>
                ))}
              </div>
            </Link>

            <p className="text-white/80 mt-4 text-sm">
              Secure booking - No credit card required at this stage
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes twinkle {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.4;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default StrategicCtaSection;
