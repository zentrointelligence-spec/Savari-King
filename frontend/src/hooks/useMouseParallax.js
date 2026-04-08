import { useState, useEffect, useRef } from "react";

/**
 * Hook pour créer des effets de parallaxe 3D basés sur la position de la souris
 * @param {number} intensity - Intensité de l'effet (0-1)
 * @param {boolean} enabled - Activer/désactiver l'effet
 * @returns {object} - Ref et styles pour l'élément
 */
export const useMouseParallax = (intensity = 0.5, enabled = true) => {
  const elementRef = useRef(null);
  const [transform, setTransform] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;

      const rotateX = deltaY * intensity * 10;
      const rotateY = deltaX * intensity * -10;
      const translateZ = isHovered ? 20 : 0;

      setTransform(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${
          isHovered ? 1.05 : 1
        })`
      );
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTransform(
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)"
      );
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [intensity, enabled, isHovered]);

  return {
    ref: elementRef,
    style: {
      transform,
      transition: isHovered
        ? "transform 0.1s ease-out"
        : "transform 0.3s ease-out",
      transformStyle: "preserve-3d",
    },
  };
};
