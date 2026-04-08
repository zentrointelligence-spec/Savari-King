import axios from "axios";

// Configuration API centralisée
const API_CONFIG = {
  // URL de base de l'API backend
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.VITE_API_HOST ? `https://${import.meta.env.VITE_API_HOST}` : "http://localhost:5000"),

  // Endpoints API
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: "/api/users/login",
    REGISTER: "/api/users/register",
    CHANGE_PASSWORD: "/api/users/change-password",
    USER_PROFILE: "/api/users/profile",
    USER_PREFERENCES: "/api/users/preferences",

    // Tours endpoints
    TOURS: "/api/tours",
    TOUR_DETAIL: (id) => `/api/tours/${id}`,

    // Home page endpoints
    HOMEPAGE_TOUR_CATEGORIES: "/api/homepage/tour-categories",
    HOMEPAGE_TOP_DESTINATIONS: "/api/homepage/popularDestinations",
    HOMEPAGE_SPECIAL_OFFERS: "/api/homepage/activeSpecialOffers",
    HOMEPAGE_TRAVEL_GUIDE: "/api/homepage/travelGuide",
    HOMEPAGE_BEST_SELLERS: "/api/homepage/tour-bestSellers",

    // Destinations endpoints
    TOP_DESTINATIONS: "/api/destinations/top",
    DESTINATION_LIKE: (id) => `/api/destinations/${id}/like`,

    // Booking endpoints
    BOOKING_CREATE: "/api/bookings",
    BOOKING_CANCEL: (id) => `/api/bookings/${id}/cancel`,
    MY_BOOKINGS: "/api/bookings/user",

    // Gallery endpoints
    GALLERY_IMAGES: "/api/gallery",
    GALLERY_IMAGE_BY_ID: (id) => `/api/gallery/${id}`,
    GALLERY_UPLOAD: "/api/gallery",
    GALLERY_UPDATE: (id) => `/api/gallery/${id}`,
    GALLERY_DELETE: (id) => `/api/gallery/${id}`,

    // Admin endpoints
    ADMIN: {
      LAYOUT_STATS: "/api/admin/layout-stats",
      DASHBOARD: "/api/admin/dashboard",
      USERS: "/api/admin/users",
      USER_STATS: "/api/admin/user-stats",
      USER_DELETE: (id) => `/api/admin/users/${id}`,
      USER_STATUS: (id) => `/api/admin/users/${id}/status`,
      USER_UPDATE: (id) => `/api/admin/users/${id}`,
      PENDING_USERS_COUNT: "/api/admin/users/pending-count",
      USER_CREATE: "/api/admin/users",
      USER_EMAIL: (id) => `/api/admin/users/${id}/send-email`,
      TOURS: "/api/admin/tours",
      TOUR_DELETE: (id) => `/api/admin/tours/${id}`,
      TOUR_STATUS: (id) => `/api/admin/tours/${id}/status`,

      // Booking endpoints (new structure)
      BOOKINGS_ALL: "/api/bookings/admin/all",
      BOOKINGS_STATS: "/api/bookings/admin/stats",
      BOOKING_SEND_QUOTE: (id) => `/api/bookings/${id}/send-quote`,
      BOOKING_COMPLETE: (id) => `/api/bookings/${id}/complete`,
      BOOKING_DELETE: (id) => `/api/bookings/${id}`,

      REVIEWS: "/api/admin/reviews",
      REVIEW_STATS: "/api/admin/review-stats",
      REVIEW_APPROVE: (id) => `/api/admin/reviews/${id}/approve`,
      REVIEW_DELETE: (id) => `/api/admin/reviews/${id}`,
      SECURITY: {
        PASSWORD_RESETS: "/api/admin/password-resets",
        SECURITY_STATS: "/api/admin/security-stats",
        SECURITY_LOGS: "/api/admin/security-logs",
        PASSWORD_RESET_APPROVE: (id) =>
          `/api/admin/password-resets/${id}/approve`,
        PASSWORD_RESET_REJECT: (id) =>
          `/api/admin/password-resets/${id}/reject`,
      },
      VEHICLES: "/api/admin/vehicles",
      VEHICLE_DELETE: (id) => `/api/admin/vehicles/${id}`,
      VEHICLE_UPDATE: (id) => `/api/admin/vehicles/${id}`,
      ADDONS: "/api/admin/addons",
      ADDON_DELETE: (id) => `/api/admin/addons/${id}`,
      ADDON_UPDATE: (id) => `/api/admin/addons/${id}`,

      // Tour Categories endpoints
      TOUR_CATEGORIES: "/api/admin/tour-categories",
      TOUR_CATEGORY_DELETE: (id) => `/api/admin/tour-categories/${id}`,
      TOUR_CATEGORY_UPDATE: (id) => `/api/admin/tour-categories/${id}`,
      TOUR_CATEGORY_STATUS: (id) => `/api/admin/tour-categories/${id}/status`,
    },

    // User endpoints
    NOTIFICATIONS: "/api/notifications",
    NOTIFICATION_READ: (id) => `/api/notifications/${id}/read`,
    NOTIFICATIONS_MARK_ALL_READ: "/api/notifications/mark-all-read",
    NOTIFICATION_DELETE: (id) => `/api/notifications/${id}`,
    NOTIFICATION_COUNT: "/api/notifications/count",
    NOTIFICATIONS_DELETE_ALL: "/api/notifications",

    // Booking endpoints
    BOOKING_STATUS: (id) => `/api/bookings/${id}/status`,

    // Gallery endpoint
    GALLERY: "/api/gallery",

    // Analytics endpoint
    ANALYTICS: "/api/analytics",

    // Blog endpoints
    BLOG: "/api/blog",
    BLOG_POST: (slug) => `/api/blog/${slug}`,
  },

  // Configuration des timeouts
  TIMEOUT: 10000, // 10 secondes

  // Headers par défaut
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// Fonction utilitaire pour construire l'URL complète
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Fonction utilitaire pour obtenir les headers avec token
export const getAuthHeaders = (token) => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    Authorization: `Bearer ${token}`,
  };
};

// Instance axios configurée
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Intercepteur pour ajouter automatiquement le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Dispatch custom event to notify AuthContext
      window.dispatchEvent(new CustomEvent('auth:logout'));

      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API_CONFIG;
