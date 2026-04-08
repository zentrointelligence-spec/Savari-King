import React from 'react';
import { useInView, useOptimizedAnimation, useTransition, easings, optimizeAnimationStyles } from '../../utils/animationUtils';

/**
 * Composant qui anime son contenu lors de l'entrée dans le viewport
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu à animer
 * @param {string} props.animation - Type d'animation (fade, slide, scale, etc.)
 * @param {number} props.duration - Durée de l'animation en ms
 * @param {string} props.easing - Type d'easing (voir utils/animationUtils)
 * @param {number} props.delay - Délai avant le début de l'animation en ms
 * @param {number} props.threshold - Seuil de visibilité pour déclencher l'animation
 */
export const AnimateOnScroll = ({
  children,
  animation = 'fade',
  duration = 600,
  easing = 'easeOutCubic',
  delay = 0,
  threshold = 0.1,
  className = '',
  style = {},
  ...props
}) => {
  const [ref, isVisible] = useInView({ threshold });
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const [animationStyles, setAnimationStyles] = React.useState(getInitialStyles(animation));

  React.useEffect(() => {
    if (isVisible && !hasAnimated) {
      // Appliquer le délai si nécessaire
      const timer = setTimeout(() => {
        setAnimationStyles(getFinalStyles(animation));
        setHasAnimated(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, hasAnimated, animation, delay]);

  const easingFunction = easings[easing] || easings.easeOutCubic;

  const combinedStyles = {
    ...style,
    ...animationStyles,
    transition: `all ${duration}ms ${easingFunction.toString()}`,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={optimizeAnimationStyles(combinedStyles)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Composant qui anime la transition entre deux états
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu à animer
 * @param {boolean} props.isVisible - État de visibilité
 * @param {number} props.duration - Durée de l'animation en ms
 * @param {string} props.easing - Type d'easing
 */
export const AnimatedTransition = ({
  children,
  isVisible = true,
  duration = 300,
  easing = 'easeInOutCubic',
  ...props
}) => {
  const opacity = useTransition(isVisible ? 1 : 0, {
    duration,
    easing: easings[easing] || easings.easeInOutCubic,
  });

  if (opacity === 0 && !isVisible) return null;

  return (
    <div
      style={optimizeAnimationStyles({
        opacity,
        transition: `opacity ${duration}ms`,
      })}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Composant qui anime un compteur
 * @param {Object} props - Propriétés du composant
 * @param {number} props.value - Valeur finale du compteur
 * @param {number} props.duration - Durée de l'animation en ms
 * @param {string} props.easing - Type d'easing
 */
export const AnimatedCounter = ({
  value = 0,
  duration = 1000,
  easing = 'easeOutCubic',
  formatter = (val) => Math.round(val),
  ...props
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const previousValue = React.useRef(0);

  React.useEffect(() => {
    previousValue.current = displayValue;
  }, [value, displayValue]);

  useOptimizedAnimation(
    (progress) => {
      const currentValue = previousValue.current + (value - previousValue.current) * progress;
      setDisplayValue(currentValue);
    },
    [value],
    { duration, easing: easings[easing] || easings.easeOutCubic }
  );

  return <span {...props}>{formatter(displayValue)}</span>;
};

/**
 * Composant qui anime une liste d'éléments avec un effet de cascade
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode[]} props.children - Éléments à animer
 * @param {string} props.animation - Type d'animation
 * @param {number} props.staggerDelay - Délai entre chaque élément en ms
 */
export const StaggeredList = ({
  children,
  animation = 'fade',
  staggerDelay = 100,
  duration = 500,
  easing = 'easeOutCubic',
  threshold = 0.1,
  ...props
}) => {
  const [ref, isVisible] = useInView({ threshold });

  return (
    <div ref={ref} {...props}>
      {React.Children.map(children, (child, index) => (
        <AnimateOnScroll
          key={index}
          animation={animation}
          duration={duration}
          easing={easing}
          delay={isVisible ? index * staggerDelay : 0}
          threshold={0}
        >
          {child}
        </AnimateOnScroll>
      ))}
    </div>
  );
};

/**
 * Composant qui anime un loader avec une animation optimisée
 */
export const OptimizedSpinner = ({ size = 40, color = '#3498db', thickness = 4, ...props }) => {
  const spinnerRef = React.useRef(null);
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    let animationId;
    let lastTimestamp = 0;
    const fps = 60;
    const interval = 1000 / fps;

    const animate = (timestamp) => {
      if (timestamp - lastTimestamp >= interval) {
        lastTimestamp = timestamp;
        setRotation((prev) => (prev + 6) % 360); // 6 degrés par frame à 60fps = 360 degrés par seconde
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div
      ref={spinnerRef}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${thickness}px solid rgba(0, 0, 0, 0.1)`,
        borderTopColor: color,
        transform: `rotate(${rotation}deg)`,
        willChange: 'transform',
      }}
      {...props}
    />
  );
};

// Fonctions utilitaires pour les styles d'animation
function getInitialStyles(animation) {
  switch (animation) {
    case 'fade':
      return { opacity: 0 };
    case 'slideUp':
      return { opacity: 0, transform: 'translateY(30px)' };
    case 'slideDown':
      return { opacity: 0, transform: 'translateY(-30px)' };
    case 'slideLeft':
      return { opacity: 0, transform: 'translateX(30px)' };
    case 'slideRight':
      return { opacity: 0, transform: 'translateX(-30px)' };
    case 'scale':
      return { opacity: 0, transform: 'scale(0.8)' };
    case 'rotate':
      return { opacity: 0, transform: 'rotate(90deg)' };
    default:
      return { opacity: 0 };
  }
}

function getFinalStyles(animation) {
  switch (animation) {
    case 'fade':
    case 'slideUp':
    case 'slideDown':
    case 'slideLeft':
    case 'slideRight':
    case 'scale':
    case 'rotate':
      return { opacity: 1, transform: 'none' };
    default:
      return { opacity: 1 };
  }
}