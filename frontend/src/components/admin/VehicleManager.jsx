import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  FilterButton,
  FilterPanel,
} from "../../components/admin/ReusableFilter";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const resetFilters = () => {
    setSearchTerm("");
  };
  const { token } = useContext(AuthContext);

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    price_per_day: "",
  });

  const fetchVehicles = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: itemsPerPage,
          searchTerm,
        });
        const response = await axios.get(
          buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.VEHICLES}?${params.toString()}`),
          {
            headers: getAuthHeaders(token),
          }
        );
        setVehicles(response.data.vehicles);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } catch (error) {
        toast.error("Could not fetch vehicles.");
      } finally {
        setLoading(false);
      }
    },
    [token, itemsPerPage, searchTerm]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles(1);
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  const handleOpenModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    setFormData(
      vehicle ? { ...vehicle } : { name: "", capacity: "", price_per_day: "" }
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiCall = editingVehicle
      ? axios.put(
          buildApiUrl(
            API_CONFIG.ENDPOINTS.ADMIN.VEHICLE_UPDATE(editingVehicle.id)
          ),
          formData,
          { headers: getAuthHeaders(token) }
        )
      : axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.VEHICLES), formData, {
          headers: getAuthHeaders(token),
        });

    try {
      await apiCall;
      toast.success(
        `Vehicle ${editingVehicle ? "updated" : "created"} successfully!`
      );
      fetchVehicles(currentPage);
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save vehicle.");
    }
  };

  const handleDelete = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await axios.delete(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.VEHICLE_DELETE(vehicleToDelete)),
        {
          headers: getAuthHeaders(token),
        }
      );
      toast.success("Vehicle deleted successfully.");
      fetchVehicles(currentPage);
    } catch (error) {
      toast.error("Failed to delete vehicle.");
    } finally {
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
    }
  };

  if (loading) return <div>Loading vehicles...</div>;

  return (
    <div>
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Vehicle Fleet</h2>
        <div className="flex items-center gap-4">
          <FilterButton
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors"
          >
            + Add New Vehicle
          </button>
        </div>
      </div>

      <FilterPanel show={showFilters} onResetFilters={resetFilters}>
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
        </div>
      </FilterPanel>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Capacity</th>
              <th className="px-6 py-3">Price/Day (INR)</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {vehicle.name}
                </td>
                <td className="px-6 py-4">{vehicle.capacity} passengers</td>
                <td className="px-6 py-4">
                  ₹{Number(vehicle.price_per_day).toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4 flex space-x-4">
                  <button
                    onClick={() => handleOpenModal(vehicle)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {vehicles.length} vehicles
        </div>
        <div className="flex items-center gap-4">
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-lg"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchVehicles(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => fetchVehicles(page + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page + 1
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => fetchVehicles(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6">
              {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Vehicle Name (e.g., 7 Seater SUV)"
                required
                className="w-full p-2 border rounded"
              />
              <input
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Capacity (e.g., 6)"
                required
                className="w-full p-2 border rounded"
              />
              <input
                name="price_per_day"
                type="number"
                value={formData.price_per_day}
                onChange={handleChange}
                placeholder="Price per Day (INR)"
                required
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white font-bold py-2 px-4 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManager;
