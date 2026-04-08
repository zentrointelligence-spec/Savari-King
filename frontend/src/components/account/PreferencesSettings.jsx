import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CurrencyContext } from "../../contexts/CurrencyContext";
import { AuthContext } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faDollarSign,
  faBell,
  faSave,
  faCog,
  faCheckCircle,
  faEnvelope,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axios from "axios";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";

const PreferencesSettings = () => {
  const { t, i18n } = useTranslation();
  const { currency, changeCurrency } = useContext(CurrencyContext);
  const { token } = useContext(AuthContext);

  const [preferences, setPreferences] = useState({
    emailNotifications: {
      bookingConfirmation: true,
      quoteReceived: true,
      paymentConfirmed: true,
      tripReminders: true,
      promotionalOffers: false,
      newsletterUpdates: false,
    },
    pushNotifications: {
      enabled: true,
      bookingUpdates: true,
      quoteExpiring: true,
      tripReminders: true,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ms", name: "Bahasa Melayu", flag: "🇲🇾" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
  ];

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  ];

  // Charger les préférences depuis la BDD au montage du composant
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.USER_PREFERENCES),
          { headers: getAuthHeaders(token) }
        );

        if (response.data.success) {
          const { preferences: savedPrefs } = response.data;

          // Appliquer la langue sauvegardée
          if (savedPrefs.language) {
            i18n.changeLanguage(savedPrefs.language);
          }

          // Appliquer la devise sauvegardée
          if (savedPrefs.currency) {
            changeCurrency(savedPrefs.currency);
          }

          // Charger les notifications sauvegardées
          if (savedPrefs.emailNotifications) {
            setPreferences(prev => ({
              ...prev,
              emailNotifications: savedPrefs.emailNotifications
            }));
          }

          if (savedPrefs.pushNotifications) {
            setPreferences(prev => ({
              ...prev,
              pushNotifications: savedPrefs.pushNotifications
            }));
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadPreferences();
    }
  }, [token]);

  const handleLanguageChange = async (languageCode) => {
    i18n.changeLanguage(languageCode);

    // Sauvegarder immédiatement dans la BDD
    try {
      await axios.put(
        buildApiUrl(API_CONFIG.ENDPOINTS.USER_PREFERENCES),
        { language: languageCode },
        { headers: getAuthHeaders(token) }
      );

      toast.success(`Language changed to ${languages.find(l => l.code === languageCode)?.name}`, {
        icon: <FontAwesomeIcon icon={faGlobe} className="text-blue-500" />,
      });
    } catch (error) {
      console.error('Error saving language preference:', error);
      toast.error('Failed to save language preference');
    }
  };

  const handleCurrencyChange = async (currencyCode) => {
    changeCurrency(currencyCode);

    // Sauvegarder immédiatement dans la BDD
    try {
      await axios.put(
        buildApiUrl(API_CONFIG.ENDPOINTS.USER_PREFERENCES),
        { currency: currencyCode },
        { headers: getAuthHeaders(token) }
      );

      toast.success(`Currency changed to ${currencyCode}`, {
        icon: <FontAwesomeIcon icon={faDollarSign} className="text-green-500" />,
      });
    } catch (error) {
      console.error('Error saving currency preference:', error);
      toast.error('Failed to save currency preference');
    }
  };

  const handleNotificationToggle = (category, setting) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.put(
        buildApiUrl(API_CONFIG.ENDPOINTS.USER_PREFERENCES),
        {
          emailNotifications: preferences.emailNotifications,
          pushNotifications: preferences.pushNotifications
        },
        { headers: getAuthHeaders(token) }
      );

      toast.success("Notification preferences saved successfully!", {
        icon: <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Failed to save notification preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <div className="bg-gradient-to-r from-primary to-primary-dark w-12 h-12 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faCog} className="text-white text-xl" />
        </div>
        <h2 className="text-2xl font-bold ml-4 text-gray-900 dark:text-white">
          Preferences
        </h2>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Language Preference */}
        <div className="violet-backdrop rounded-xl shadow-primary p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faGlobe} className="mr-3 text-primary" />
            Language
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose your preferred language for the interface
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  i18n.language === lang.code
                    ? "border-primary bg-primary/10 shadow-primary"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {lang.name}
                    </p>
                    {i18n.language === lang.code && (
                      <p className="text-xs text-primary font-semibold">Active</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Currency Preference */}
        <div className="violet-backdrop rounded-xl shadow-primary p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faDollarSign} className="mr-3 text-primary" />
            Currency
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select your preferred currency for pricing
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => handleCurrencyChange(curr.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  currency === curr.code
                    ? "border-primary bg-primary/10 shadow-primary"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{curr.symbol}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {curr.code}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {curr.name}
                    </p>
                    {currency === curr.code && (
                      <p className="text-xs text-primary font-semibold">Active</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Email Notifications */}
        <div className="violet-backdrop rounded-xl shadow-primary p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-primary" />
            Email Notifications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Manage which email notifications you receive
          </p>
          <div className="space-y-3">
            {Object.entries(preferences.emailNotifications).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleNotificationToggle('emailNotifications', key)}
                  className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="violet-backdrop rounded-xl shadow-primary p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faMobileAlt} className="mr-3 text-primary" />
            In-App Notifications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Control in-app notification preferences
          </p>
          <div className="space-y-3">
            {Object.entries(preferences.pushNotifications).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleNotificationToggle('pushNotifications', key)}
                  className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Save Notification Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferencesSettings;
