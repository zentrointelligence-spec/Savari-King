import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUpload,
  FaImage,
  FaVideo,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaTag,
  FaStar,
  FaMapMarkerAlt,
  FaFolder,
} from "react-icons/fa";
import { api } from "../../utils/api";

const MediaUploader = ({ onUploadSuccess, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    tags: "",
    is_featured: false,
  });
  const fileInputRef = useRef(null);

  // Catégories disponibles
  const categories = [
    { value: "plage", label: "🏖️ Plage", icon: "🏖️" },
    { value: "montagne", label: "🏔️ Montagne", icon: "🏔️" },
    { value: "ville", label: "🏙️ Ville", icon: "🏙️" },
    { value: "nature", label: "🌿 Nature", icon: "🌿" },
    { value: "culture", label: "🏛️ Culture", icon: "🏛️" },
    { value: "aventure", label: "🎯 Aventure", icon: "🎯" },
    { value: "gastronomie", label: "🍽️ Gastronomie", icon: "🍽️" },
  ];

  // Gestion de la sélection de fichiers
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const processedFiles = selectedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      isVideo: file.type.startsWith("video/"),
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      status: "pending", // pending, uploading, success, error
    }));

    setFiles((prev) => [...prev, ...processedFiles]);
  };

  // Supprimer un fichier de la liste
  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Formatage de la taille de fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Extraire les métadonnées vidéo
  const extractVideoMetadata = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        resolve({
          duration: Math.round(video.duration),
          width: video.videoWidth,
          height: video.videoHeight,
          aspect_ratio: video.videoWidth / video.videoHeight,
        });
      };

      video.onerror = () => {
        resolve({
          duration: 0,
          width: 1920,
          height: 1080,
          aspect_ratio: 16 / 9,
        });
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Extraire les métadonnées image
  const extractImageMetadata = (file) => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspect_ratio: img.width / img.height,
        });
      };

      img.onerror = () => {
        resolve({
          width: 1920,
          height: 1080,
          aspect_ratio: 16 / 9,
        });
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Upload des fichiers
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results = [];

    for (const fileItem of files) {
      try {
        // Mettre à jour le statut
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "uploading" } : f
          )
        );

        // Extraire les métadonnées
        const metadata = fileItem.isVideo
          ? await extractVideoMetadata(fileItem.file)
          : await extractImageMetadata(fileItem.file);

        // Préparer les données du formulaire
        const uploadData = new FormData();
        uploadData.append(fileItem.isVideo ? "video" : "image", fileItem.file);
        uploadData.append(
          "title",
          formData.title || fileItem.name.split(".")[0]
        );
        uploadData.append("description", formData.description);
        uploadData.append("location", formData.location);
        uploadData.append("category", formData.category);
        uploadData.append("media_type", fileItem.isVideo ? "video" : "image");
        uploadData.append("is_featured", formData.is_featured);

        // Tags
        if (formData.tags) {
          const tagsArray = formData.tags.split(",").map((tag) => tag.trim());
          uploadData.append("tags", JSON.stringify(tagsArray));
        }

        // Métadonnées spécifiques
        if (fileItem.isVideo) {
          uploadData.append("duration", metadata.duration);
          uploadData.append(
            "video_quality",
            metadata.height >= 1080 ? "1080p" : "720p"
          );
          uploadData.append("has_audio", "true"); // Par défaut, à améliorer avec détection
        }

        uploadData.append(
          "dimensions",
          JSON.stringify({
            width: metadata.width,
            height: metadata.height,
          })
        );
        uploadData.append("aspect_ratio", metadata.aspect_ratio);

        // Upload via API
        const response = await api.admin.uploadMedia(uploadData);

        // Succès
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "success" } : f
          )
        );

        results.push({ success: true, file: fileItem, data: response.data });
      } catch (error) {
        console.error("Erreur upload:", error);

        // Erreur
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "error", error: error.message }
              : f
          )
        );

        results.push({ success: false, file: fileItem, error: error.message });
      }
    }

    setUploading(false);

    // Callback de succès
    if (onUploadSuccess) {
      onUploadSuccess(results);
    }

    // Auto-fermeture si tous les uploads sont réussis
    const allSuccess = results.every((r) => r.success);
    if (allSuccess) {
      setTimeout(() => {
        onClose && onClose();
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaUpload className="text-2xl" />
              <h2 className="text-2xl font-bold">Upload Médias Premium</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaTimes />
            </button>
          </div>
          <p className="mt-2 opacity-90">
            Ajoutez des images et vidéos à votre galerie premium
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Zone de drop */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFiles = Array.from(e.dataTransfer.files);
              handleFileSelect({ target: { files: droppedFiles } });
            }}
          >
            <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Glissez vos fichiers ici ou cliquez pour sélectionner
            </h3>
            <p className="text-gray-600 mb-4">
              Images: JPG, PNG, WebP • Vidéos: MP4, WebM, MOV
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FaImage /> Images jusqu'à 10MB
              </span>
              <span className="flex items-center gap-1">
                <FaVideo /> Vidéos jusqu'à 100MB
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Formulaire de métadonnées */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gray-50 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaTag /> Informations communes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Titre du média"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <FaMapMarkerAlt /> Lieu
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Lieu de prise de vue"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <FaFolder /> Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tags: e.target.value }))
                    }
                    placeholder="nature, paysage, coucher-soleil"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Séparez les tags par des virgules
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description du média"
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_featured: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <FaStar className="text-yellow-500" />
                    <span className="font-medium">Marquer comme vedette</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Liste des fichiers */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Fichiers sélectionnés ({files.length})
                </h3>

                <div className="space-y-3">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border"
                    >
                      {/* Prévisualisation */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaVideo className="text-2xl text-gray-400" />
                        )}
                      </div>

                      {/* Informations */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{file.name}</h4>
                          {file.isVideo && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Vidéo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>

                      {/* Statut */}
                      <div className="flex items-center gap-2">
                        {file.status === "pending" && (
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <FaTimes />
                          </button>
                        )}
                        {file.status === "uploading" && (
                          <FaSpinner className="text-blue-500 animate-spin" />
                        )}
                        {file.status === "success" && (
                          <FaCheck className="text-green-500" />
                        )}
                        {file.status === "error" && (
                          <FaTimes className="text-red-500" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-end gap-4"
            >
              <button
                onClick={() => setFiles([])}
                disabled={uploading}
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Effacer tout
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Uploader {files.length} fichier{files.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MediaUploader;
