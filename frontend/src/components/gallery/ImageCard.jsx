import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  useMouseParallax,
  useAdvancedHover,
  useAnimatedBadges,
} from "../../hooks";
import { optimizeAnimationStyles } from "../../utils/animationUtils";

const ImageCard = memo(
  ({
    image,
    index,
    onImageClick,
    animationDelay = 0,
    enableEffects = true,
  }) => {
    const parallax = useMouseParallax(0.3, enableEffects);
    const hover = useAdvancedHover({
      enableParallax: true,
      enableGlow: true,
      enableScale: false,
      glowColor: "rgba(112, 69, 175, 0.3)",
    });

    const { visibleBadges, getBadgeAnimation, getBadgeStyle } =
      useAnimatedBadges(image.badges || []);

    const handleClick = () => {
      onImageClick(index);
    };

    // Optimisation des animations avec des styles optimisés
    const optimizedStyles = optimizeAnimationStyles();

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          delay: animationDelay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg perspective-1000"
        style={{
          ...parallax.style,
          ...hover.getHoverStyles(),
          ...optimizedStyles,
          transformStyle: "preserve-3d",
          transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
        ref={(el) => {
          parallax.ref.current = el;
          hover.ref.current = el;
        }}
        {...hover.handlers}
        onClick={handleClick}
      >
        {/* Image principale */}
        <div className="relative overflow-hidden">
          <img
            src={image.thumbnail_path || image.path}
            alt={image.title}
            className="w-full h-auto object-cover transition-all duration-500 ease-out"
            style={{ ...hover.getImageStyles(), ...optimizedStyles }}
            loading="lazy"
            decoding="async"
            fetchPriority="high"
          />

          {/* Overlay glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="violet-backdrop rounded-lg p-3">
                <h3 className="text-white font-semibold text-lg mb-1 truncate">
                  {image.title}
                </h3>
                <p className="text-gray-200 text-sm mb-2 truncate flex items-center">
                  <i className="fas fa-map-marker-alt mr-1 text-primary"></i>
                  {image.location}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <div className="flex items-center gap-1">
                    <i className="fas fa-eye text-primary"></i>
                    <span>{image.views || 0}</span>
                  </div>
                  {image.popularity_score > 0 && (
                    <div className="flex items-center gap-1">
                      <i className="fas fa-heart text-red-400"></i>
                      <span>{Math.round(image.popularity_score)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Icône de zoom */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary-gradient opacity-30 backdrop-blur-sm rounded-full p-4 border border-white/30 shadow-primary">
              <i className="fas fa-search-plus text-white text-2xl"></i>
            </div>
          </div>

          {/* Badges animés */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {visibleBadges.map((badge) => (
              <motion.div
                key={badge}
                {...getBadgeAnimation(badge)}
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeStyle(
                  badge
                )} shadow-lg`}
              >
                {badge === "featured" && (
                  <>
                    <i className="fas fa-star mr-1"></i>
                    Featured
                  </>
                )}
                {badge === "popular" && (
                  <>
                    <i className="fas fa-fire mr-1"></i>
                    Popular
                  </>
                )}
                {badge === "new" && (
                  <>
                    <i className="fas fa-sparkles mr-1"></i>
                    New
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Halo lumineux */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none halo-effect" />
        </div>

        {/* Tags */}
        {image.tags && image.tags.length > 0 && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-wrap gap-1 max-w-32">
              {image.tags.slice(0, 2).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full border border-white/20"
                >
                  #{tag}
                </span>
              ))}
              {image.tags.length > 2 && (
                <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                  +{image.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  }
);

export default ImageCard;
