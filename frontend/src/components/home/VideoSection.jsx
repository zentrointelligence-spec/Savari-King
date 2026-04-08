import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
  faExpand,
  faCompress,
  faTimes,
  faRotateLeft,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

const VideoSectionSimple = () => {
  // Video configuration - replace with your actual links
  const videos = [
    {
      id: 1,
      title: "Destination Kerala - Cochin",
      thumbnail: "/src/assets/images/Cochin.jpg",
      url: "/src/assets/videos/vid1.mp4",
      duration: "0:22",
    },
    {
      id: 2,
      title: "Backwater Cruise Experience",
      thumbnail: "/src/assets/images/CochinBackwaterCruise.jpg",
      url: "/src/assets/videos/vid2.mp4",
      duration: "0:15",
    },
    {
      id: 3,
      title: "Kanyakumari Sunrise",
      thumbnail: "/src/assets/images/KanyakumariSunriseSpectacle.jpg",
      url: "/src/assets/videos/vid3.mp4",
      duration: "0:30",
    },
    {
      id: 4,
      title: "South India Coastal Beauty",
      thumbnail: "/src/assets/images/SouthIndiaCoastalBeauty.jpeg",
      url: "/src/assets/videos/vid4.mp4",
      duration: "0:15",
    },
  ];

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [rotation, setRotation] = useState(0); // Nouvel état pour la rotation

  const videoRef = useRef(null);
  const controlsTimeout = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [selectedVideo]);

  useEffect(() => {
    if (selectedVideo) {
      document.addEventListener("keydown", handleKeyPress);
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [selectedVideo, isPlaying, isMuted, isFullscreen, rotation]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = document.querySelector(".video-modal");
    if (videoContainer) {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`
          );
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const openModal = (video) => {
    setSelectedVideo(video);
    setRotation(0); // Réinitialiser la rotation quand on ouvre une nouvelle vidéo
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
    setIsFullscreen(false);
    setRotation(0); // Réinitialiser la rotation quand on ferme la modal
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleKeyPress = (e) => {
    if (selectedVideo) {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "r":
          e.preventDefault();
          rotateVideo(90);
          break;
        case "R":
          e.preventDefault();
          rotateVideo(-90);
          break;
        case "Escape":
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            closeModal();
          }
          break;
        default:
          break;
      }
    }
  };

  const rotateVideo = (degrees) => {
    setRotation((prevRotation) => (prevRotation + degrees) % 360);
  };

  const resetRotation = () => {
    setRotation(0);
  };

  const getRotationStyle = () => {
    return {
      transform: `rotate(${rotation}deg)`,
      transition: "transform 0.3s ease",
      maxWidth: "100%",
      maxHeight: "100%",
    };
  };

  const VideoControls = () => {
    if (!showControls && isPlaying) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300">
        {/* Progress bar */}
        <div className="mb-4">
          <div
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-150"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors duration-300"
            >
              <FontAwesomeIcon
                icon={isPlaying ? faPause : faPlay}
                className="text-xl"
              />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors duration-300"
              >
                <FontAwesomeIcon
                  icon={isMuted ? faVolumeMute : faVolumeUp}
                  className="text-lg"
                />
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Time */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Middle controls - Rotation buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => rotateVideo(-90)}
              className="text-white hover:text-red-500 transition-colors duration-300 p-2"
              title="Rotation à gauche (R)"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="text-lg" />
            </button>

            <button
              onClick={resetRotation}
              className="text-white hover:text-red-500 transition-colors duration-300 text-sm px-3 py-1 border border-white/30 rounded"
              title="Réinitialiser rotation"
            >
              Reset
            </button>

            <button
              onClick={() => rotateVideo(90)}
              className="text-white hover:text-red-500 transition-colors duration-300 p-2"
              title="Rotation à droite (r)"
            >
              <FontAwesomeIcon icon={faRotateRight} className="text-lg" />
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-4">
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-500 transition-colors duration-300"
            >
              <FontAwesomeIcon
                icon={isFullscreen ? faCompress : faExpand}
                className="text-lg"
              />
            </button>

            {/* Close */}
            <button
              onClick={closeModal}
              className="text-white hover:text-red-500 transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover Our Destinations
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Explore the world through our immersive videos
            </p>
          </div>

          {/* Video grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative bg-black rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => openModal(video)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-800 relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${video.thumbnail})` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                      <FontAwesomeIcon
                        icon={faPlay}
                        className="text-white text-xl ml-1"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>

                {/* Title */}
                <div className="p-4">
                  <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors duration-300">
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center video-modal"
            onClick={() => setShowControls(true)}
            onMouseMove={showControlsTemporarily}
          >
            <div className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center p-4">
              <div className="relative" style={getRotationStyle()}>
                <video
                  ref={videoRef}
                  className="max-w-full max-h-full"
                  autoPlay
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src={selectedVideo.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <VideoControls />

              {/* Play overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={togglePlay}
                    className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <FontAwesomeIcon icon={faPlay} className="text-4xl ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default VideoSectionSimple;
