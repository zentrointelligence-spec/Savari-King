import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompass,
  faHome,
  faSearch,
  faArrowRight,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

const NotFoundPage = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500/10 animate-float"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        <div className="mb-10 animate-bounce-slow">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="text-yellow-400 text-9xl mx-auto"
          />
        </div>

        <motion.h1
          className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-4xl font-bold mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Oops! Page Not Found
        </motion.h2>

        <motion.p
          className="text-xl text-blue-200 max-w-lg mx-auto mb-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          The page you're looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </motion.p>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            to="/"
            className={`relative flex items-center justify-center gap-3 px-8 py-4 font-bold rounded-xl text-lg transition-all transform ${
              isHovered ? "scale-105" : "scale-100"
            } bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Return to Homepage</span>
            <motion.div
              className="absolute right-4"
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </motion.div>
          </Link>

          <Link
            to="/tours"
            className="flex items-center justify-center gap-3 px-8 py-4 font-bold rounded-xl text-lg bg-white/10 hover:bg-white/20 transition-colors border-2 border-white/30"
          >
            <FontAwesomeIcon icon={faCompass} />
            <span>Explore Tours</span>
          </Link>
        </motion.div>

        <motion.div
          className="mt-12 bg-black/20 backdrop-blur-sm rounded-xl p-6 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FontAwesomeIcon icon={faSearch} className="text-yellow-400" />
            <h3 className="text-xl font-semibold">
              Looking for something specific?
            </h3>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search our website..."
              className="w-full py-3 pl-12 pr-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </motion.div>
      </div>

      {/* Floating islands */}
      <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-48 h-32 bg-gradient-to-r from-green-700 to-emerald-900 rounded-t-full transform rotate-6 animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-24 bg-gradient-to-l from-amber-800 to-amber-900 rounded-t-full transform -rotate-3 animate-float-slow"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-36 bg-gradient-to-r from-blue-800 to-indigo-900 rounded-t-full animate-float-slower"></div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        @keyframes float-slow {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes float-slower {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 12s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Motion component for animations
const motion = {
  div: ({ children, initial, animate, transition, className }) => (
    <div
      className={className}
      style={{
        transform: `scale(${initial?.scale || 1}) translateY(${
          initial?.y || 0
        }px)`,
        opacity: initial?.opacity ?? 1,
        transition: `transform ${transition?.duration || 0.5}s ${
          transition?.ease || "ease"
        }, opacity ${transition?.duration || 0.5}s ${
          transition?.ease || "ease"
        }`,
        ...animate,
      }}
    >
      {children}
    </div>
  ),
  h1: ({ children, initial, animate, transition, className }) => (
    <h1
      className={className}
      style={{
        transform: `scale(${initial?.scale || 1})`,
        opacity: initial?.opacity ?? 1,
        transition: `transform ${transition?.duration || 0.5}s ${
          transition?.ease || "ease"
        }, opacity ${transition?.duration || 0.5}s ${
          transition?.ease || "ease"
        }`,
        ...animate,
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children, initial, animate, transition, className }) => (
    <h2
      className={className}
      style={{
        transform: `translateY(${initial?.y || 0}px)`,
        opacity: initial?.opacity ?? 1,
        transition: `transform ${transition?.duration || 0.5}s ${
          transition?.ease || "ease"
        }, opacity ${transition?.duration || 0.5}s ${
          transition?.ease || "ease"
        }`,
        ...animate,
      }}
    >
      {children}
    </h2>
  ),
  p: ({ children, initial, animate, transition, className }) => (
    <p
      className={className}
      style={{
        transform: `translateY(${initial?.y || 0}px)`,
        opacity: initial?.opacity ?? 1,
        transition: `transform ${transition?.duration || 0.5}s ${
          transition?.ease || "ease"
        }, opacity ${transition?.duration || 0.5}s ${
          transition?.ease || "ease"
        }`,
        ...animate,
      }}
    >
      {children}
    </p>
  ),
};

export default NotFoundPage;
