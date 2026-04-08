// src/components/RouteWithTitle.jsx
import { useEffect } from "react";

export default function PageWithTitle({ title, children }) {
  useEffect(() => {
    // Met à jour le titre de l'onglet du navigateur
    document.title = title || "Ebenezer Tours"; // Met un titre par défaut si aucun n'est fourni
  }, [title]);

  // Affiche le composant de la page
  return children;
}
