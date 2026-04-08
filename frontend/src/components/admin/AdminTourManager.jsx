import React, { useState, useEffect, useContext } from "react";
import { apiUtils } from '../../utils/apiUtils';
import { AuthContext } from "../../contexts/auth";
import { toast } from "react-toastify";
import EditTourModal from "./EditTourModal"; // Assurez-vous que ce composant existe

const AdminTourManager = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  // --- États pour le formulaire de création ---
  const [tourName, setTourName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // --- États pour le modal de modification ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  const fetchTours = async () => {
    try {
      // Note: Nous devrions créer une route admin dédiée pour voir tous les tours, y compris les inactifs.
      // Pour l'instant, on utilise la route publique.
      const response = await apiUtils.admin.getTours();
      setTours(response.data);
    } catch (error) {
      toast.error("Could not fetch tours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleAddTour = async (e) => {
    e.preventDefault();
    try {
      await apiUtils.admin.createTour({
        name: tourName,
        main_image_url: imageUrl,
        itinerary: [],
        is_active: true,
      });
      toast.success("New tour created successfully!");
      setTourName("");
      setImageUrl("");
      fetchTours(); // Rafraîchit la liste
    } catch (error) {
      toast.error("Failed to create tour.");
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this tour and all its associated data?"
      )
    ) {
      try {
        await apiUtils.admin.deleteTour(tourId);
        toast.success("Tour deleted successfully.");
        fetchTours(); // Rafraîchit la liste
      } catch (error) {
        toast.error("Failed to delete tour.");
      }
    }
  };

  // Fonctions pour gérer le modal de modification
  const handleEditClick = (tour) => {
    setSelectedTour(tour);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTour(null);
  };

  if (loading) return <p>Loading tours...</p>;

  return (
    <div className="space-y-12">
      {/* Formulaire de création */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Create a New Tour</h2>
        <form onSubmit={handleAddTour} className="space-y-4">
          <div>
            <label
              htmlFor="tourName"
              className="block text-sm font-medium text-gray-700"
            >
              Tour Name
            </label>
            <input
              type="text"
              id="tourName"
              value={tourName}
              onChange={(e) => setTourName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Main Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Tour
          </button>
        </form>
      </div>

      {/* Liste des tours existants */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Existing Tours</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tour.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tour.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tour.is_active ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <button
                      onClick={() => handleEditClick(tour)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTour(tour.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affichage conditionnel du modal de modification */}
      {isModalOpen && (
        <EditTourModal
          tour={selectedTour}
          onClose={handleCloseModal}
          onTourUpdated={fetchTours}
        />
      )}
    </div>
  );
};

export default AdminTourManager;
