import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../config/api";

// Valeur par défaut du contexte d'authentification
const defaultAuthValue = {
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
};

// Création du contexte d'authentification
export const AuthContext = createContext(defaultAuthValue);

export const AuthProvider = ({ children }) => {
  const { i18n } = useTranslation();

  // Utiliser un initialisateur paresseux pour lire le localStorage une seule fois au montage.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error(
        "Échec de l'analyse du JSON utilisateur depuis localStorage",
        error
      );
      localStorage.removeItem("user"); // Nettoyer les données corrompues
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les préférences utilisateur
  const loadUserPreferences = async (userToken) => {
    try {
      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.USER_PREFERENCES),
        { headers: getAuthHeaders(userToken) }
      );

      if (response.data.success && response.data.preferences) {
        const { language, currency } = response.data.preferences;

        // Appliquer la langue si définie
        if (language) {
          i18n.changeLanguage(language);
        }

        // Dispatch event pour que CurrencyContext puisse l'écouter
        if (currency) {
          window.dispatchEvent(new CustomEvent('currency:change', { detail: currency }));
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  useEffect(() => {
    // Charger les préférences si un token existe déjà
    if (token) {
      loadUserPreferences(token);
    }

    // Le chargement est terminé après le premier rendu, car l'état est déjà initialisé.
    setLoading(false);

    // Listen for logout events from API interceptor (token expiration)
    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []); // Le tableau de dépendances vide assure que cela ne s'exécute qu'une fois.

  const login = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    setUser(userData);
    setToken(userToken);

    // Charger les préférences après le login
    loadUserPreferences(userToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  // On mémoïse la valeur du contexte pour éviter les rendus inutiles des consommateurs.
  const value = useMemo(
    () => ({ user, token, loading, login, logout, updateUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
