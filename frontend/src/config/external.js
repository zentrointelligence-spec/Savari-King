// Configuration des URLs externes et CDN
const EXTERNAL_CONFIG = {
  // CDN URLs
  CDN: {
    LEAFLET: {
      MARKER_ICON_2X:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      MARKER_ICON:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      MARKER_SHADOW:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    },
  },

  // Map tile providers
  MAP_TILES: {
    OPENSTREETMAP: {
      URL: "https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}",
      ATTRIBUTION:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ACCESS_TOKEN:
        import.meta.env.VITE_JAWG_ACCESS_TOKEN || "your-access-token-here",
    },
    ESRI_IMAGERY: {
      URL: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ATTRIBUTION:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
  },

  // Image placeholders et URLs externes
  IMAGES: {
    UNSPLASH: {
      // Images d'équipe
      TEAM: {
        MEMBER_1:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887",
        MEMBER_2:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888",
        MEMBER_3:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887",
        MEMBER_4:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071",
      },
      // Images de fond
      BACKGROUNDS: {
        ABOUT_HERO:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070",
      },
      // Images d'hébergement
      ACCOMMODATIONS: {
        HOTEL_1:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
        HOTEL_2:
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925",
        HOTEL_3:
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1949",
      },
    },
    // Images de profil aléatoires
    RANDOM_USER: {
      BASE_URL: "https://randomuser.me/api/portraits",
      WOMEN: {
        PROFILE_1: "https://randomuser.me/api/portraits/women/44.jpg",
        PROFILE_2: "https://randomuser.me/api/portraits/women/68.jpg",
      },
      MEN: {
        PROFILE_1: "https://randomuser.me/api/portraits/men/32.jpg",
        PROFILE_2: "https://randomuser.me/api/portraits/men/75.jpg",
      },
    },
  },

  // Services externes
  SERVICES: {
    WHATSAPP: {
      BASE_URL: "https://wa.me",
      DEFAULT_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER || "1234567890",
      DEFAULT_MESSAGE: "Hi, I'm interested in booking a tour package.",
    },
  },

  // Schema.org URLs
  SCHEMA: {
    RATING: "https://schema.org/Rating",
  },

  // SVG namespaces
  SVG: {
    NAMESPACE: "http://www.w3.org/2000/svg",
  },
};

// Fonction utilitaire pour construire l'URL WhatsApp
export const buildWhatsAppUrl = (number = null, message = null) => {
  const phoneNumber =
    number || EXTERNAL_CONFIG.SERVICES.WHATSAPP.DEFAULT_NUMBER;
  const text = message || EXTERNAL_CONFIG.SERVICES.WHATSAPP.DEFAULT_MESSAGE;
  return `${
    EXTERNAL_CONFIG.SERVICES.WHATSAPP.BASE_URL
  }/${phoneNumber}?text=${encodeURIComponent(text)}`;
};

// Fonction utilitaire pour obtenir une image de profil aléatoire
export const getRandomProfileImage = (gender = "women", index = 1) => {
  const genderKey = gender.toUpperCase();
  const profileKey = `PROFILE_${index}`;
  return (
    EXTERNAL_CONFIG.IMAGES.RANDOM_USER[genderKey]?.[profileKey] ||
    EXTERNAL_CONFIG.IMAGES.RANDOM_USER.WOMEN.PROFILE_1
  );
};

export default EXTERNAL_CONFIG;
