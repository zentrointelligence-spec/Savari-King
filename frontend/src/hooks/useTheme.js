import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

/**
 * Hook personnalisé pour utiliser le contexte de thème
 * @returns {Object} - Objet contenant le thème actuel et la fonction de basculement
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default useTheme;
