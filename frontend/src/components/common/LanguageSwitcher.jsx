import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../../i18n";

const LanguageSwitcher = ({ showLabel = true, size = "md" }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) ||
    SUPPORTED_LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      setIsOpen(false);

      // Update document language attribute
      document.documentElement.lang = languageCode;

      // Optional: Show success notification
      console.log(`Language changed to ${languageCode}`);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  const sizeClasses = {
    sm: {
      button: "px-2 py-1 text-xs",
      dropdown: "text-xs",
      flag: "text-sm",
    },
    md: {
      button: "px-3 py-2 text-sm",
      dropdown: "text-sm",
      flag: "text-base",
    },
    lg: {
      button: "px-4 py-3 text-base",
      dropdown: "text-base",
      flag: "text-lg",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${currentSize.button}
          flex items-center space-x-2 
          bg-white/90 dark:bg-dark-heavy/90 
          border border-primary/20 dark:border-primary/30 
          rounded-full 
          hover:bg-primary/10 dark:hover:bg-accent/10 
          hover:border-primary dark:hover:border-accent 
          transition-all duration-300 
          focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-accent/50 
          shadow-sm hover:shadow-md
          text-gray-700 dark:text-gray-200
        `}
        title={t("language.selectLanguage")}
        aria-label={t("language.selectLanguage")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span
          className={`${currentSize.flag}`}
          role="img"
          aria-label={currentLanguage.name}
        >
          {currentLanguage.flag}
        </span>
        {showLabel && (
          <span className="font-medium hidden sm:inline">
            {currentLanguage.code.toUpperCase()}
          </span>
        )}
        <i
          className={`fas fa-chevron-down transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-heavy border border-primary/20 dark:border-primary/30 rounded-lg shadow-lg z-[9999] overflow-hidden">
          <div className="py-2">
            <div
              className={`px-4 py-2 ${currentSize.dropdown} font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600`}
            >
              {t("language.selectLanguage")}
            </div>

            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full px-4 py-3 ${currentSize.dropdown}
                  flex items-center space-x-3 
                  hover:bg-primary/10 dark:hover:bg-accent/10 
                  transition-colors duration-200
                  text-left
                  ${
                    i18n.language === language.code
                      ? "bg-primary/5 dark:bg-accent/5 text-primary dark:text-accent font-medium"
                      : "text-gray-700 dark:text-gray-200"
                  }
                `}
                role="option"
                aria-selected={i18n.language === language.code}
              >
                <span className="text-lg" role="img" aria-label={language.name}>
                  {language.flag}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {language.name}
                  </div>
                </div>
                {i18n.language === language.code && (
                  <i className="fas fa-check text-primary dark:text-accent"></i>
                )}
              </button>
            ))}
          </div>

          {/* Footer with current language info */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-dark-light border-t border-gray-200 dark:border-gray-600">
            <div
              className={`${currentSize.dropdown} text-gray-500 dark:text-gray-400`}
            >
              {t("language.currentLanguage")}:{" "}
              <span className="font-medium text-primary dark:text-accent">
                {currentLanguage.nativeName}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
