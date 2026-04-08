import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import API_CONFIG, { buildApiUrl } from "../config/api";

// Actions pour le reducer
const HOMEPAGE_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_TOUR_CATEGORIES: "SET_TOUR_CATEGORIES",
  SET_BEST_SELLERS: "SET_BEST_SELLERS",
  SET_TOP_DESTINATIONS: "SET_TOP_DESTINATIONS",
  SET_SPECIAL_OFFERS: "SET_SPECIAL_OFFERS",
  SET_TRAVEL_GUIDES: "SET_TRAVEL_GUIDES",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// État initial simplifié
const initialState = {
  loading: true,
  error: null,
  tourCategories: [],
  bestSellers: [],
  topDestinations: [],
  specialOffers: [],
  travelGuides: [],
};

// Reducer pour gérer l'état
const homepageReducer = (state, action) => {
  switch (action.type) {
    case HOMEPAGE_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case HOMEPAGE_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case HOMEPAGE_ACTIONS.SET_TOUR_CATEGORIES:
      return { ...state, tourCategories: action.payload };
    case HOMEPAGE_ACTIONS.SET_BEST_SELLERS:
      return { ...state, bestSellers: action.payload };
    case HOMEPAGE_ACTIONS.SET_TOP_DESTINATIONS:
      return { ...state, topDestinations: action.payload };
    case HOMEPAGE_ACTIONS.SET_SPECIAL_OFFERS:
      return { ...state, specialOffers: action.payload };
    case HOMEPAGE_ACTIONS.SET_TRAVEL_GUIDES:
      return { ...state, travelGuides: action.payload };
    case HOMEPAGE_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Création du contexte
const HomepageContext = createContext();

// Provider du contexte
export const HomepageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(homepageReducer, initialState);

  // Actions pour interagir avec l'API
  const actions = {
    // Charger toutes les données de la page d'accueil en parallèle
    fetchAllHomepageData: async () => {
      try {
        dispatch({ type: HOMEPAGE_ACTIONS.SET_LOADING, payload: true });

        const [
          categoriesResponse,
          bestSellersResponse,
          destinationsResponse,
          offersResponse,
          guidesResponse,
        ] = await Promise.all([
          axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_TOUR_CATEGORIES)),
          axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_BEST_SELLERS)),
          axios.get(
            buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_TOP_DESTINATIONS)
          ),
          axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_SPECIAL_OFFERS)),
          axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_TRAVEL_GUIDE)),
        ]);

        // Mettre à jour toutes les données
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_TOUR_CATEGORIES,
          payload: categoriesResponse.data,
        });
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_BEST_SELLERS,
          payload: bestSellersResponse.data,
        });
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_TOP_DESTINATIONS,
          payload: destinationsResponse.data,
        });
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_SPECIAL_OFFERS,
          payload: offersResponse.data,
        });
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_TRAVEL_GUIDES,
          payload: guidesResponse.data,
        });

        dispatch({ type: HOMEPAGE_ACTIONS.SET_LOADING, payload: false });
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données de la page d'accueil:",
          error
        );
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_ERROR,
          payload: "Erreur lors du chargement des données de la page d'accueil",
        });
      }
    },

    // Charger les catégories de tours
    fetchTourCategories: async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_TOUR_CATEGORIES)
        );
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_TOUR_CATEGORIES,
          payload: response.data,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    },

    // Charger les best sellers
    fetchBestSellers: async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_BEST_SELLERS)
        );
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_BEST_SELLERS,
          payload: response.data,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des best sellers:", error);
      }
    },

    // Charger les destinations populaires
    fetchTopDestinations: async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_TOP_DESTINATIONS)
        );
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_TOP_DESTINATIONS,
          payload: response.data,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des destinations:", error);
      }
    },

    // Charger les offres spéciales
    fetchSpecialOffers: async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_SPECIAL_OFFERS)
        );
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_SPECIAL_OFFERS,
          payload: response.data,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des offres spéciales:", error);
      }
    },

    // Charger les guides de voyage
    fetchTravelGuides: async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_TRAVEL_GUIDE)
        );
        dispatch({
          type: HOMEPAGE_ACTIONS.SET_TRAVEL_GUIDES,
          payload: response.data,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des guides de voyage:", error);
      }
    },

    // Effacer les erreurs
    clearError: () => {
      dispatch({ type: HOMEPAGE_ACTIONS.CLEAR_ERROR });
    },
  };

  // Charger les données initiales
  useEffect(() => {
    actions.fetchAllHomepageData();
  }, []);

  const value = {
    ...state,
    actions,
  };

  return (
    <HomepageContext.Provider value={value}>
      {children}
    </HomepageContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useHomepage = () => {
  const context = useContext(HomepageContext);
  if (!context) {
    throw new Error("useHomepage doit être utilisé dans un HomepageProvider");
  }
  return context;
};

export default HomepageContext;
