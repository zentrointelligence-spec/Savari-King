import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaEye,
  FaClock,
} from "react-icons/fa";
import { useAdvancedHover, useAnimatedBadges } from "../../hooks";

const VideoCard = ({
  video,
  index,
  onVideoClick,
  animationDelay = 0,
  enableEffects = true,
  autoPlayPreview = false,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const hover = useAdvancedHover({
    enableParallax: true,
    enableGlow: true,
    enableScale: false,
    glowColor: "rgba(147, 51, 234, 0.4)", // Couleur violette pour les vidéos
  });

  const { visibleBadges, getBadgeAnimation, getBadgeStyle } = useAnimatedBadges(
    [
      ...(video.badges || []),
      "video", // Badge spécial pour identifier les vidéos
    ]
  );

  // Gestion de la lecture/pause
  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Gestion du son
  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Formatage de la durée
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Gestion des événements vidéo
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Auto-play preview au hover si activé
  useEffect(() => {
    if (autoPlayPreview && hover.isHovered && videoRef.current && !isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (
      autoPlayPreview &&
      !hover.isHovered &&
      videoRef.current &&
      isPlaying
    ) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [hover.isHovered, autoPlayPreview, isPlaying]);

  const handleClick = () => {
    onVideoClick(index);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: animationDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg"
      style={{
        ...hover.getHoverStyles(),
        transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
      ref={hover.ref}
      {...hover.handlers}
      onMouseEnter={(e) => {
        hover.handlers.onMouseEnter(e);
        setShowControls(true);
      }}
      onMouseLeave={(e) => {
        hover.handlers.onMouseLeave(e);
        setShowControls(false);
      }}
      onClick={handleClick}
    >
      {/* Vidéo ou thumbnail */}
      <div className="relative overflow-hidden">
        {isLoaded ? (
          <video
            ref={videoRef}
            className="w-full h-auto object-cover transition-all duration-500 ease-out"
            style={hover.getImageStyles()}
            poster={video.video_thumbnail_path || video.thumbnail_path}
            muted={isMuted}
            playsInline
            preload="metadata"
          >
            <source src={video.path} type="video/mp4" />
            <source
              src={video.path.replace(".mp4", ".webm")}
              type="video/webm"
            />
            Your browser does not support video playback.
          </video>
        ) : (
          <img
            src={
              video.video_thumbnail_path || video.thumbnail_path || video.path
            }
            alt={video.title}
            className="w-full h-auto object-cover transition-all duration-500 ease-out"
            style={hover.getImageStyles()}
            loading="lazy"
          />
        )}

        {/* Overlay glassmorphism avec contrôles */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Informations vidéo */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="backdrop-blur-md bg-white/10 rounded-lg p-3 border border-white/20">
              <h3 className="text-white font-semibold text-lg mb-1 truncate">
                {video.title}
              </h3>
              <p className="text-gray-200 text-sm mb-2 truncate">
                {video.location}
              </p>

              {/* Stats et durée */}
              <div className="flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <FaEye />
                    <span>{video.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>{formatTime(video.duration || duration)}</span>
                  </div>
                  {video.video_quality && (
                    <span className="px-2 py-1 bg-purple-500/80 rounded text-white font-semibold">
                      {video.video_quality}
                    </span>
                  )}
                </div>
              </div>

              {/* Barre de progression */}
              {isLoaded && (
                <div className="mt-2 w-full bg-gray-600/50 rounded-full h-1">
                  <div
                    className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contrôles vidéo centraux */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Bouton Play/Pause */}
            <button
              onClick={togglePlay}
              className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
            >
              {isPlaying ? (
                <FaPause className="text-white text-2xl" />
              ) : (
                <FaPlay className="text-white text-2xl ml-1" />
              )}
            </button>

            {/* Bouton Son (si la vidéo a de l'audio) */}
            {video.has_audio && (
              <button
                onClick={toggleMute}
                className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                {isMuted ? (
                  <FaVolumeMute className="text-white text-lg" />
                ) : (
                  <FaVolumeUp className="text-white text-lg" />
                )}
              </button>
            )}

            {/* Bouton Plein écran */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              <FaExpand className="text-white text-lg" />
            </button>
          </div>
        </div>

        {/* Badges animés */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {visibleBadges.map((badge) => (
            <motion.div
              key={badge}
              {...getBadgeAnimation(badge)}
              className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${
                badge === "video"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : getBadgeStyle(badge)
              }`}
            >
              {badge === "video" && "🎬 Video"}
              {badge === "featured" && "⭐ Featured"}
              {badge === "popular" && "🔥 Popular"}
              {badge === "new" && "✨ New"}
            </motion.div>
          ))}
        </div>

        {/* Indicateur de durée (toujours visible) */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          {formatTime(video.duration || duration)}
        </div>

        {/* Halo lumineux spécial vidéo */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${
              (hover.mousePosition.x + 1) * 50
            }% ${
              (hover.mousePosition.y + 1) * 50
            }%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Tags */}
      {video.tags && video.tags.length > 0 && (
        <div
          className={`absolute bottom-3 right-3 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-wrap gap-1 max-w-32">
            {video.tags.slice(0, 2).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full border border-white/20"
              >
                #{tag}
              </span>
            ))}
            {video.tags.length > 2 && (
              <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                +{video.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoCard;
