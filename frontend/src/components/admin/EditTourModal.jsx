import React, { useState, useEffect, useContext } from "react";
import { apiUtils } from '../../utils/apiUtils';
import { AuthContext } from "../../contexts/auth";
import { toast } from "react-toastify";

const EditTourModal = ({ tour, onClose, onTourUpdated }) => {
  // Initialise l'état du formulaire avec les données du tour sélectionné.
  const [formData, setFormData] = useState({ ...tour });
  const { token } = useContext(AuthContext);

  // Cet effet s'assure que si l'utilisateur ouvre le modal pour un autre tour,
  // le formulaire se met à jour avec les nouvelles informations.
  useEffect(() => {
    setFormData({ ...tour });
  }, [tour]);

  // Gère les changements dans les champs du formulaire.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gère la soumission du formulaire.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Envoie une requête PUT au backend pour mettre à jour le tour.
      await apiUtils.admin.updateTour(tour.id, formData);
      toast.success("Tour updated successfully!");
      onTourUpdated(); // Appelle la fonction pour rafraîchir la liste des tours.
      onClose(); // Appelle la fonction pour fermer le modal.
    } catch (error) {
      toast.error("Failed to update tour.");
      console.error("Update error:", error);
    }
  };

  // Si aucun tour n'est sélectionné, ne rien afficher.
  if (!tour) return null;

  return (
    // Le fond sombre et semi-transparent du modal
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6">Edit Tour: {tour.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Tour Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="main_image_url"
              className="block text-sm font-medium text-gray-700"
            >
              Main Image URL
            </label>
            <input
              type="text"
              name="main_image_url"
              id="main_image_url"
              value={formData.main_image_url}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-900"
            >
              Active
            </label>
          </div>
          {/* L'édition de l'itinéraire (JSONB) est plus complexe et sera ajoutée plus tard */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTourModal;
