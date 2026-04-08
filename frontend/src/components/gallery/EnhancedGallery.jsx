import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "./Gallery.css";

import { api } from "../../utils/api";
import {
  useMasonryLayout,
  useGalleryFilters,
  useStaggeredAnimation,
  useImagePreloader,
} from "../../hooks";
import ImageCard from "./ImageCard";
import FilterInterface from "./FilterInterface";

const EnhancedGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Hooks personnalisés
  const { breakpointCols } = useMasonryLayout(images);
  const {
    filteredItems,
    filters,
    isFiltering,
    updateFilter,
    resetFilters,
    getAvailableTags,
    getAvailableCategories,
    hasActiveFilters,
  } = useGalleryFilters(images);

  const { ref: galleryRef, getItemAnimation } = useStaggeredAnimation(
    filteredItems.length,
    100
  );

  const { isLoading: imagesLoading } = useImagePreloader(
    filteredItems.map((img) => img.thumbnail_path || img.path)
  );

  // Charger les images
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = {
        sort: "featured", // Commencer par les images vedettes
        ...filters,
      };

      const res = await api.getGallery(params);
      if (Array.isArray(res.data)) {
        setImages(res.data);
      } else {
        console.error("Format de réponse inattendu:", res.data);
        setImages([]);
      }
    } catch (err) {
      setError("Erreur lors du chargement des images.");
      console.error("Erreur lors du chargement des images:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // Préparer les slides pour la lightbox
  const lightboxSlides = filteredItems.map((img) => ({
    src: img.path,
    alt: img.title,
    title: img.title,
    description: `${img.location} • ${img.views || 0} vues`,
    width: img.dimensions?.width || 1200,
    height: img.dimensions?.height || 800,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg flex items-center">
          <i className="fas fa-images mr-2 text-primary"></i>
          Chargement de la galerie premium...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-red-500 py-20"
      >
        <div className="text-6xl mb-4">
          <i className="fas fa-exclamation-triangle text-red-500"></i>
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Oups ! Une erreur s'est produite
        </h3>
        <p>{error}</p>
        <button
          onClick={fetchImages}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <i className="fas fa-redo mr-2"></i>
          Réessayer
        </button>
      </motion.div>
    );
  }

  if (!Array.isArray(images) || images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">
          <i className="fas fa-camera text-gray-400"></i>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Aucune image disponible
        </h3>
        <p className="text-gray-600">
          La galerie sera bientôt remplie de magnifiques photos !
        </p>
      </motion.div>
    );
  }

  return (
    <div className="py-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* En-tête avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary text-white rounded-full mb-6 shadow-lg">
          <i className="fas fa-images text-3xl"></i>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          Galerie Multimédia Premium
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
          Découvrez nos destinations à travers des images et vidéos immersives
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <i className="fas fa-photo-video mr-2 text-primary"></i>
            <span className="font-medium text-gray-700">
              {images.length} médias
            </span>
          </div>
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <i className="fas fa-image mr-2 text-primary"></i>
            <span className="font-medium text-gray-700">
              {
                filteredItems.filter((item) => item.media_type !== "video")
                  .length
              }{" "}
              images
            </span>
          </div>
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <i className="fas fa-video mr-2 text-primary"></i>
            <span className="font-medium text-gray-700">
              {
                filteredItems.filter((item) => item.media_type === "video")
                  .length
              }{" "}
              vidéos
            </span>
          </div>
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <i className="fas fa-eye mr-2 text-primary"></i>
            <span className="font-medium text-gray-700">
              {filteredItems.length} affichés
            </span>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center bg-gradient-to-r from-primary to-secondary text-white rounded-full px-4 py-2 shadow-sm">
              <i className="fas fa-filter mr-2"></i>
              <span className="font-medium">Filtres actifs</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Interface de filtres */}
      <FilterInterface
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        availableCategories={getAvailableCategories()}
        availableTags={getAvailableTags()}
        hasActiveFilters={hasActiveFilters}
        isFiltering={isFiltering}
      />

      {/* Galerie Masonry */}
      <div ref={galleryRef} className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          {isFiltering || imagesLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <div className="text-center">
                <div className="animate-pulse flex space-x-4 mb-6">
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 h-48 w-32"></div>
                  <div className="rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 h-64 w-32"></div>
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 h-56 w-32"></div>
                </div>
                <div className="flex items-center justify-center text-gray-600">
                  <i className="fas fa-magic mr-2 text-primary animate-pulse"></i>
                  <p>Optimisation de l'affichage...</p>
                </div>
              </div>
            </motion.div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-6">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Essayez de modifier vos critères de recherche ou explorez toute
                notre collection
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <i className="fas fa-images mr-2"></i>
                Voir toutes les images
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Masonry
                breakpointCols={breakpointCols}
                className="flex w-auto -ml-6"
                columnClassName="pl-6 bg-clip-padding"
              >
                {filteredItems.map((image, index) => (
                  <motion.div
                    key={`${image.id}-${index}`}
                    {...getItemAnimation(index)}
                    className="mb-6"
                  >
                    <ImageCard
                      image={image}
                      index={index}
                      onImageClick={openLightbox}
                      animationDelay={index * 0.1}
                      enableEffects={true}
                    />
                  </motion.div>
                ))}
              </Masonry>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox améliorée */}
      {lightboxIndex !== null && (
        <Lightbox
          open={lightboxIndex !== null}
          close={closeLightbox}
          slides={lightboxSlides}
          index={lightboxIndex}
          plugins={[Zoom, Thumbnails]}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
            doubleClickMaxStops: 2,
            keyboardMoveDistance: 50,
            wheelZoomDistanceFactor: 100,
            pinchZoomDistanceFactor: 100,
            scrollToZoom: true,
          }}
          thumbnails={{
            position: "bottom",
            width: 120,
            height: 80,
            border: 2,
            borderRadius: 8,
            padding: 4,
            gap: 16,
            imageFit: "cover",
          }}
          animation={{
            fade: 250,
            swipe: 500,
          }}
          carousel={{
            finite: false,
            preload: 2,
            padding: "16px",
            spacing: "30%",
            imageFit: "contain",
          }}
          render={{
            buttonPrev: () => (
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 hover:bg-black/70 transition-colors">
                ←
              </div>
            ),
            buttonNext: () => (
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 hover:bg-black/70 transition-colors">
                →
              </div>
            ),
          }}
        />
      )}
    </div>
  );
};

export default EnhancedGallery;
