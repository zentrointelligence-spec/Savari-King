import React from "react";
import { useInView, optimizeAnimationStyles, easings } from "../../utils/animationUtils";
import { AnimateOnScroll, StaggeredList } from "../animations/AnimatedComponents";

// Réutilisation du hook useInView de animationUtils pour la compatibilité avec le code existant
export { useInView } from "../../utils/animationUtils";


/**
 * Composant d'animation au scroll optimisé
 * Utilise AnimateOnScroll pour une meilleure performance
 */
export const ScrollReveal = ({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 600,
  className = "",
  once = true,
  ...props
}) => {
  // Conversion des animations CSS vers les animations optimisées
  const getOptimizedAnimation = () => {
    switch (animation) {
      case "fadeInUp":
        return "slideUp";
      case "fadeInDown":
        return "slideDown";
      case "fadeInLeft":
        return "slideRight"; // Inversé car les directions sont différentes
      case "fadeInRight":
        return "slideLeft"; // Inversé car les directions sont différentes
      case "fadeIn":
        return "fade";
      case "scaleIn":
        return "scale";
      case "slideInUp":
        return "slideUp";
      case "zoomIn":
        return "scale";
      default:
        return "fade";
    }
  };

  // Utilisation du composant AnimateOnScroll optimisé
  return (
    <AnimateOnScroll
      animation={getOptimizedAnimation()}
      duration={duration}
      delay={delay}
      threshold={0.1}
      className={className}
      {...props}
    >
      {children}
    </AnimateOnScroll>
  );
};

/**
 * Composant pour animer les éléments en séquence
 * Utilise StaggeredList pour une meilleure performance
 */
export const StaggeredReveal = ({
  children,
  staggerDelay = 100,
  animation = "fadeInUp",
  className = "",
  ...props
}) => {
  // Conversion des animations CSS vers les animations optimisées
  const getOptimizedAnimation = () => {
    switch (animation) {
      case "fadeInUp":
        return "slideUp";
      case "fadeInDown":
        return "slideDown";
      case "fadeInLeft":
        return "slideRight"; // Inversé car les directions sont différentes
      case "fadeInRight":
        return "slideLeft"; // Inversé car les directions sont différentes
      case "fadeIn":
        return "fade";
      case "scaleIn":
        return "scale";
      case "slideInUp":
        return "slideUp";
      case "zoomIn":
        return "scale";
      default:
        return "fade";
    }
  };

  return (
    <StaggeredList 
      staggerDelay={staggerDelay}
      animation={getOptimizedAnimation()}
      className={className}
      {...props}
    >
      {children}
    </StaggeredList>
  );
};

/**
 * Composant pour les compteurs animés
 * Utilise requestAnimationFrame avec optimisation pour une meilleure performance
 */
export const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  className = "",
}) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const [count, setCount] = useState(0);
  const animationRef = React.useRef();
  const startTimeRef = React.useRef();

  useEffect(() => {
    // Nettoyage de l'animation précédente si elle existe
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (isInView) {
      const startCount = 0;

      const updateCount = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

        // Utilisation de l'easing de animationUtils pour une animation plus fluide
        const easeValue = easings.easeOutQuart(progress);
        const currentCount = Math.floor(
          easeValue * (end - startCount) + startCount
        );

        setCount(currentCount);

        if (progress < 1) {
          // Utilisation de limitAnimationFrameRate pour optimiser les performances
          animationRef.current = requestAnimationFrame(updateCount);
        }
      };

      animationRef.current = requestAnimationFrame(updateCount);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className} style={optimizeAnimationStyles()}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

/**
 * Composant pour les barres de progression animées
 * Utilise optimizeAnimationStyles pour une meilleure performance
 */
export const AnimatedProgressBar = ({
  percentage,
  height = "h-2",
  color = "bg-primary",
  backgroundColor = "bg-gray-200",
  className = "",
  showPercentage = false,
  duration = 1500,
}) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const [width, setWidth] = useState(0);
  const animationRef = React.useRef();

  useEffect(() => {
    if (isInView) {
      // Utilisation de requestAnimationFrame au lieu de setTimeout pour une animation plus fluide
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const startTime = performance.now();
      const startWidth = width;
      const targetWidth = percentage;
      
      const animate = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easings.easeOutQuad(progress);
        const currentWidth = startWidth + (targetWidth - startWidth) * easeProgress;
        
        setWidth(currentWidth);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isInView, percentage, duration, width]);

  return (
    <AnimateOnScroll animation="fade" className={className}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(width)}%
          </span>
        </div>
      )}
      <div
        className={`w-full ${backgroundColor} rounded-full ${height} overflow-hidden`}
        style={optimizeAnimationStyles()}
      >
        <div
          className={`${height} ${color} rounded-full`}
          style={{
            width: `${width}%`,
            ...optimizeAnimationStyles(),
          }}
        />
      </div>
    </AnimateOnScroll>
  );
};

/**
 * Composant pour les éléments qui flottent
 * Utilise optimizeAnimationStyles pour une meilleure performance
 */
export const FloatingElement = ({
  children,
  direction = "up",
  distance = 10,
  duration = 3000,
  className = "",
}) => {
  // Utilisation de motion.div de framer-motion pour une animation plus fluide
  const getAnimationProps = () => {
    const baseProps = {
      animate: {},
      transition: {
        duration: duration / 1000, // Conversion en secondes pour framer-motion
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    };
    
    switch (direction) {
      case "up":
        baseProps.animate.y = [-distance, distance];
        return baseProps;
      case "down":
        baseProps.animate.y = [distance, -distance];
        return baseProps;
      case "left":
        baseProps.animate.x = [-distance, distance];
        return baseProps;
      case "right":
        baseProps.animate.x = [distance, -distance];
        return baseProps;
      default:
        baseProps.animate.y = [-distance, distance];
        return baseProps;
    }
  };

  const animationProps = getAnimationProps();

  return (
    <AnimateOnScroll
      animation="fade"
      className={className}
      style={optimizeAnimationStyles()}
      customAnimation={animationProps}
    >
      {children}
    </AnimateOnScroll>
  );
};

/**
 * Composant pour le parallax simple
 * Utilise optimizeAnimationStyles et requestAnimationFrame pour une meilleure performance
 */
export const ParallaxElement = ({ children, speed = 0.5, className = "" }) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef();
  const scrollRef = useRef();
  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    // Utilisation de requestAnimationFrame pour optimiser les performances
    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        if (ref.current) {
          const scrolled = window.pageYOffset;
          const rate = scrolled * -speed;
          
          // Mise à jour de l'état uniquement si la valeur a changé significativement
          if (Math.abs(scrollRef.current - rate) > 0.5) {
            setOffset(rate);
            scrollRef.current = rate;
          }
        }
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        ...optimizeAnimationStyles(),
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
