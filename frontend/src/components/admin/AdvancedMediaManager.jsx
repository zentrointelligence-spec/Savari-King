import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Image,
  Video,
  File,
  Check,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  Download,
  Share2,
  Star,
  Tag,
  Clock,
  FileText,
  Maximize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Crop,
  Filter,
  Zap,
  Grid,
  List,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

const AdvancedMediaManager = () => {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Fonction pour récupérer les médias depuis l'API
  const fetchMediaFiles = async () => {
    try {
      setIsLoadingMedia(true);
      const response = await apiUtils.getGalleryImages();
      if (response.data && response.data.success) {
        const formattedMedia = response.data.images.map(image => ({
          id: image.id,
          name: image.filename,
          type: image.file_type?.startsWith('image/') ? 'image' : 'video',
          size: (image.file_size / (1024 * 1024)).toFixed(1),
          url: image.url,
          thumbnail: image.thumbnail_url || image.url,
          uploadDate: new Date(image.created_at).toISOString().split('T')[0],
          tags: image.tags ? JSON.parse(image.tags) : [],
          featured: image.featured || false,
          views: image.views || 0,
          likes: 0,
          description: image.description || '',
          location: image.location || '',
          photographer: 'Admin User',
        }));
        setMediaFiles(formattedMedia);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setIsLoadingMedia(false);
    }
  };
  
  // Charger les médias au montage du composant
  useEffect(() => {
    fetchMediaFiles();
  }, []);

  // Configuration du dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size / (1024 * 1024), // MB
      type: file.type.startsWith("image/") ? "image" : "video",
      progress: 0,
      status: "pending", // 'pending' | 'uploading' | 'completed' | 'error'
      preview: URL.createObjectURL(file),
    }));

    setUploadQueue((prev) => [...prev, ...newFiles]);
    simulateUpload(newFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
    multiple: true,
  });

  // Upload réel via API
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('category', 'general');
    formData.append('tags', JSON.stringify([]));

    try {
      const response = await apiUtils.uploadMedia(formData, (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((100 * event.loaded) / event.total);
          setUploadQueue(prevFiles =>
            prevFiles.map(f =>
              f.id === file.id ? { ...f, progress } : f
            )
          );
        }
      });

      if (response.data && response.data.success) {
        const uploadedFile = response.data.image;
        setUploadQueue(prevFiles =>
          prevFiles.map(f =>
            f.id === file.id ? {
              ...f,
              status: 'completed',
              progress: 100,
              url: uploadedFile.url,
              thumbnail: uploadedFile.thumbnail_url || uploadedFile.url,
              id: uploadedFile.id,
              uploadedAt: new Date().toISOString()
            } : f
          )
        );
        
        // Ajouter à la liste des médias
        const newMedia = {
          id: uploadedFile.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: uploadedFile.url,
          thumbnail: uploadedFile.thumbnail_url || uploadedFile.url,
          uploadDate: new Date().toISOString().split("T")[0],
          tags: [],
          featured: false,
          views: 0,
          likes: 0,
          description: "",
          location: "",
          photographer: "Admin User",
        };

        setMediaFiles((prev) => [newMedia, ...prev]);
        toast.success(`${file.name} uploadé avec succès`);
      } else {
        throw new Error(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadQueue(prevFiles =>
        prevFiles.map(f =>
          f.id === file.id ? {
            ...f,
            status: 'error',
            error: error.response?.data?.error || error.message || 'Upload failed'
          } : f
        )
      );
      toast.error(`Échec de l'upload ${file.name}: ${error.response?.data?.error || error.message}`);
    }
  };

  const simulateUpload = async (files) => {
    setIsUploading(true);

    for (const file of files) {
      // Mettre à jour le statut à "uploading"
      setUploadQueue((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f))
      );

      await uploadFile(file);
    }

    setIsUploading(false);
    // Nettoyer la queue après 2 secondes
    setTimeout(() => {
      setUploadQueue([]);
    }, 2000);
  };

  // Filtrage et tri des médias
  const filteredAndSortedMedia = mediaFiles
    .filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesType = filterType === "all" || file.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "views":
          comparison = a.views - b.views;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const MediaCard = ({ media }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group relative"
    >
      {/* Badge featured */}
      {media.featured && (
        <div className="absolute top-2 left-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
            <Star className="w-3 h-3" />
            Featured
          </div>
        </div>
      )}

      {/* Actions overlay */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPreviewFile(media)}
            className="p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingFile(media)}
            className="p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteMedia(media.id)}
            className="p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
        <img
          src={media.thumbnail}
          alt={media.name}
          className="w-full h-full object-cover"
        />
        {media.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 bg-black/50 rounded-full">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
        {media.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            {media.duration}
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-2">
          {media.name}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span>{media.size.toFixed(1)} MB</span>
          <span>{media.uploadDate}</span>
        </div>

        {media.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {media.description}
          </p>
        )}

        {/* Tags */}
        {media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {media.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {media.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{media.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Statistiques */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              {media.views}
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4" />
              {media.likes}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const UploadQueueItem = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
    >
      <div className="flex-shrink-0">
        {item.type === "image" ? (
          <Image className="w-8 h-8 text-blue-500" />
        ) : (
          <Video className="w-8 h-8 text-purple-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {item.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {item.size.toFixed(1)} MB
        </p>
      </div>

      <div className="flex-shrink-0 w-24">
        {item.status === "pending" && (
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-xs">En attente</span>
          </div>
        )}
        {item.status === "uploading" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-600">{item.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>
        )}
        {item.status === "completed" && (
          <div className="flex items-center gap-2 text-green-500">
            <Check className="w-4 h-4" />
            <span className="text-xs">Terminé</span>
          </div>
        )}
        {item.status === "error" && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Erreur</span>
          </div>
        )}
      </div>

      {item.status === "pending" && (
        <button
          onClick={() => removeFromQueue(item.id)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </motion.div>
  );

  const handleSaveEdit = async () => {
    try {
      const updateData = {
        description: editingFile.description,
        location: editingFile.location,
        tags: JSON.stringify(editingFile.tags),
        featured: editingFile.featured
      };
      
      const response = await apiUtils.updateMedia(editingFile.id, updateData);
      
      if (response.data && response.data.success) {
        setMediaFiles(prev => 
          prev.map(file => 
            file.id === editingFile.id ? editingFile : file
          )
        );
        setEditingFile(null);
        toast.success('Modifications sauvegardées');
      } else {
        throw new Error(response.data?.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving media:', error);
      toast.error('Erreur lors de la sauvegarde: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) {
      return;
    }
    
    try {
      const response = await apiUtils.deleteMedia(mediaId);
      
      if (response.data && response.data.success) {
        setMediaFiles(prev => prev.filter(file => file.id !== mediaId));
        toast.success('Média supprimé avec succès');
      } else {
        throw new Error(response.data?.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Erreur lors de la suppression: ' + (error.response?.data?.error || error.message));
    }
  };

  const removeFromQueue = (id) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Gestionnaire de Médias Premium
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos images et vidéos avec des outils professionnels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Upload className="w-5 h-5" />
            Ajouter des médias
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => onDrop(Array.from(e.target.files))}
            className="hidden"
          />
        </div>
      </div>

      {/* Zone de drop */}
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {isDragActive
                ? "Déposez vos fichiers ici"
                : "Glissez-déposez vos médias"}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Ou cliquez pour sélectionner des fichiers (Images et vidéos
              supportées)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Queue d'upload */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload en cours ({uploadQueue.length})
              </h3>
              {!isUploading && (
                <button
                  onClick={() => setUploadQueue([])}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {uploadQueue.map((item) => (
                  <UploadQueueItem key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contrôles et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="image">Images</option>
              <option value="video">Vidéos</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="size">Taille</option>
              <option value="views">Vues</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <SortDesc className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Grid className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des médias */}
      {isLoadingMedia ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des médias...</span>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          <AnimatePresence>
            {filteredAndSortedMedia.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredAndSortedMedia.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <File className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun média trouvé
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Essayez de modifier vos critères de recherche ou ajoutez de nouveaux
            médias
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedMediaManager;
