import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faFilter,
  faSync,
  faTags,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";

const CategoryStatusBadge = ({ isActive }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

const CategoryRow = ({ category, onDelete, onToggleStatus, onEdit }) => {
  // Mapping des icônes FontAwesome
  const iconMapping = {
    'FaMountain': 'fa-mountain',
    'FaUmbrellaBeach': 'fa-umbrella-beach',
    'FaLandmark': 'fa-landmark',
    'FaLeaf': 'fa-leaf',
    'FaUtensils': 'fa-utensils',
    'FaHeart': 'fa-heart',
    'FaUsers': 'fa-users',
    'FaGem': 'fa-gem',
    'FaDumbbell': 'fa-dumbbell',
    'FaOm': 'fa-om',
    'FaMapMarkerAlt': 'fa-map-marker-alt',
    'FaStar': 'fa-star',
    'FaShip': 'fa-ship',
    'FaTree': 'fa-tree',
    'FaWater': 'fa-water',
    'FaCamera': 'fa-camera',
  };

  return (
    <tr
      key={category.id}
      className="border-b hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: category.color || '#6B7280' }}
          >
            <i className={`fas ${iconMapping[category.icon] || 'fa-tag'}`}></i>
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{category.name}</div>
            <div className="text-gray-500 text-sm mt-1">
              Slug: {category.slug}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-900 max-w-xs">
          {category.description || 'Aucune description'}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {category.tour_count} tours
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-gray-500 text-sm">
          {category.display_order}
        </span>
      </td>
      <td className="px-6 py-4">
        <CategoryStatusBadge isActive={category.is_active} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggleStatus(category.id, !category.is_active)}
            className={`p-2 rounded-full ${
              category.is_active
                ? "text-green-600 hover:bg-green-50"
                : "text-red-600 hover:bg-red-50"
            }`}
            title={category.is_active ? "Désactiver" : "Activer"}
          >
            <FontAwesomeIcon
              icon={category.is_active ? faToggleOn : faToggleOff}
              size="lg"
            />
          </button>

          <button
            onClick={() => onEdit(category)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title="Modifier"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>

          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            title="Supprimer"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'FaMapMarkerAlt',
    color: '#6B7280',
    display_order: 0,
    is_active: true
  });

  const iconOptions = [
    { value: 'FaMountain', label: 'Montagne', icon: 'fa-mountain' },
    { value: 'FaUmbrellaBeach', label: 'Plage', icon: 'fa-umbrella-beach' },
    { value: 'FaLandmark', label: 'Monument', icon: 'fa-landmark' },
    { value: 'FaLeaf', label: 'Nature', icon: 'fa-leaf' },
    { value: 'FaUtensils', label: 'Gastronomie', icon: 'fa-utensils' },
    { value: 'FaHeart', label: 'Spirituel', icon: 'fa-heart' },
    { value: 'FaUsers', label: 'Groupe', icon: 'fa-users' },
    { value: 'FaGem', label: 'Luxe', icon: 'fa-gem' },
    { value: 'FaDumbbell', label: 'Sport', icon: 'fa-dumbbell' },
    { value: 'FaOm', label: 'Méditation', icon: 'fa-om' },
    { value: 'FaStar', label: 'Premium', icon: 'fa-star' },
    { value: 'FaShip', label: 'Maritime', icon: 'fa-ship' },
    { value: 'FaTree', label: 'Forêt', icon: 'fa-tree' },
    { value: 'FaWater', label: 'Eau', icon: 'fa-water' },
    { value: 'FaCamera', label: 'Photo', icon: 'fa-camera' },
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        icon: category.icon || 'FaMapMarkerAlt',
        color: category.color || '#6B7280',
        display_order: category.display_order || 0,
        is_active: category.is_active !== false
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: 'FaMapMarkerAlt',
        color: '#6B7280',
        display_order: 0,
        is_active: true
      });
    }
  }, [category, isOpen]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: !category ? generateSlug(name) : prev.slug // Auto-generate slug only for new categories
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Le nom et le slug sont requis');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icône
            </label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {iconOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Catégorie active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {category ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminTourCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useContext(AuthContext);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.TOUR_CATEGORIES),
        {
          headers: getAuthHeaders(token),
        }
      );
      setCategories(response.data || []);
    } catch (error) {
      toast.error("Impossible de récupérer les catégories.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = (categoryId) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await axios.delete(
        buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.TOUR_CATEGORIES}/${categoryToDelete}`),
        {
          headers: getAuthHeaders(token),
        }
      );
      toast.success("Catégorie supprimée avec succès!");
      fetchCategories();
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Erreur lors de la suppression de la catégorie.");
      }
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleToggleStatus = async (categoryId, newStatus) => {
    try {
      await axios.patch(
        buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.TOUR_CATEGORIES}/${categoryId}/status`),
        {},
        {
          headers: getAuthHeaders(token),
        }
      );
      toast.success(`Statut de la catégorie ${newStatus ? 'activé' : 'désactivé'}!`);
      fetchCategories();
    } catch (error) {
      toast.error("Erreur lors du changement de statut.");
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedCategory) {
        // Update existing category
        await axios.put(
          buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.TOUR_CATEGORIES}/${selectedCategory.id}`),
          formData,
          {
            headers: getAuthHeaders(token),
          }
        );
        toast.success("Catégorie modifiée avec succès!");
      } else {
        // Create new category
        await axios.post(
          buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.TOUR_CATEGORIES),
          formData,
          {
            headers: getAuthHeaders(token),
          }
        );
        toast.success("Catégorie créée avec succès!");
      }
      setIsModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Erreur lors de la sauvegarde de la catégorie.");
      }
    }
  };

  // Filter categories based on search term and status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && category.is_active) ||
                         (statusFilter === "inactive" && !category.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={faTags} className="mr-3 text-primary" />
            Gestion des Catégories de Tours
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les catégories de tours et leur organisation
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>

          <button
            onClick={fetchCategories}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <FontAwesomeIcon
              icon={faSync}
              className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
          <div className="text-gray-600 text-sm">Total catégories</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {categories.filter(c => c.is_active).length}
          </div>
          <div className="text-gray-600 text-sm">Actives</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">
            {categories.filter(c => !c.is_active).length}
          </div>
          <div className="text-gray-600 text-sm">Inactives</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {categories.reduce((sum, c) => sum + parseInt(c.tour_count || 0), 0)}
          </div>
          <div className="text-gray-600 text-sm">Tours associés</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tours
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== "all" 
                      ? "Aucune catégorie ne correspond aux critères de recherche."
                      : "Aucune catégorie trouvée. Créez votre première catégorie!"}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSave={handleSave}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer la catégorie"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
      />
    </div>
  );
};

export default AdminTourCategoriesPage;