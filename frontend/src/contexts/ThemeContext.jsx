import React, { createContext, useState, useEffect, useMemo } from "react";

// Valeur par défaut du contexte de thème
const defaultThemeValue = {
  theme: "light",
  toggleTheme: () => {},
};

// Création du contexte de thème
export const ThemeContext = createContext(defaultThemeValue);

export const ThemeProvider = ({ children }) => {
  // Fonction pour détecter le thème système
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Utiliser un initialisateur paresseux pour lire le localStorage une seule fois au montage
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme;
      }
      // Si aucun thème sauvegardé, utiliser le thème système
      return getSystemTheme();
    } catch (error) {
      console.error(
        "Erreur lors de la lecture du thème depuis localStorage",
        error
      );
      return getSystemTheme();
    }
  });

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Ne changer automatiquement que si l'utilisateur n'a pas défini de préférence
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
      
      // Mettre à jour la meta tag pour la couleur de la barre d'état sur mobile
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#111111' : '#ffffff');
      }
    } catch (error) {
      console.error("Erreur lors de l'application du thème", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const setThemeMode = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  // Mémoïser la valeur du contexte pour éviter les rendus inutiles
  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isSystemTheme: !localStorage.getItem("theme")
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
