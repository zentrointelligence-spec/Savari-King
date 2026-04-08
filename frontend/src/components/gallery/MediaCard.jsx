import React from "react";
import { motion } from "framer-motion";
import ImageCard from "./ImageCard";
import VideoCard from "./VideoCard";

/**
 * Composant unifié pour gérer les images et vidéos dans la galerie
 */
const MediaCard = ({
  media,
  index,
  onMediaClick,
  animationDelay = 0,
  enableEffects = true,
  autoPlayPreview = false,
}) => {
  // Déterminer le type de média
  const isVideo =
    media.media_type === "video" ||
    media.path?.match(/\.(mp4|webm|mov|avi|mkv)$/i) ||
    media.duration !== undefined;

  const commonProps = {
    index,
    animationDelay,
    enableEffects,
    onImageClick: onMediaClick, // Pour ImageCard
    onVideoClick: onMediaClick, // Pour VideoCard
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: animationDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="media-card-wrapper"
    >
      {isVideo ? (
        <VideoCard
          video={media}
          autoPlayPreview={autoPlayPreview}
          {...commonProps}
        />
      ) : (
        <ImageCard image={media} {...commonProps} />
      )}
    </motion.div>
  );
};

export default MediaCard;
