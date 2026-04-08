import React, { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

const ThemeToggle = ({ className = "", showLabel = true, size = "md" }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const sizeClasses = {
    sm: "w-10 h-6",
    md: "w-12 h-7",
    lg: "w-14 h-8",
  };

  const thumbSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const translateClasses = {
    sm: theme === "dark" ? "translate-x-4" : "translate-x-0",
    md: theme === "dark" ? "translate-x-5" : "translate-x-0",
    lg: theme === "dark" ? "translate-x-6" : "translate-x-0",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === "light" ? (
            <i className="fas fa-sun text-yellow-500"></i>
          ) : (
            <i className="fas fa-moon text-blue-400"></i>
          )}
        </span>
      )}

      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex ${sizeClasses[size]} items-center rounded-full 
          transition-colors duration-300 ease-in-out focus:outline-none 
          focus:ring-2 focus:ring-offset-2 focus:ring-violet-500
          ${
            theme === "dark"
              ? "bg-gradient-to-r from-violet-600 to-purple-600"
              : "bg-gradient-to-r from-gray-200 to-gray-300"
          }
          hover:shadow-lg transform hover:scale-105 transition-all duration-200
        `}
        role="switch"
        aria-checked={theme === "dark"}
        aria-label={`Basculer vers le thème ${
          theme === "light" ? "sombre" : "clair"
        }`}
      >
        <span
          className={`
            ${thumbSizeClasses[size]} inline-block rounded-full 
            bg-white shadow-lg transform transition-transform duration-300 ease-in-out
            ${translateClasses[size]}
            flex items-center justify-center
          `}
        >
          {theme === "light" ? (
            <i className="fas fa-sun text-yellow-500 text-xs"></i>
          ) : (
            <i className="fas fa-moon text-violet-600 text-xs"></i>
          )}
        </span>
      </button>

      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === "light" ? "Clair" : "Sombre"}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
