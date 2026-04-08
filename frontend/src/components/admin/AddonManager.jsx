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

const AddonManager = () => {
  const [addons, setAddons] = useState([]);
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
  const [editingAddon, setEditingAddon] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addonToDelete, setAddonToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });

  const fetchAddons = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: itemsPerPage,
          searchTerm,
        });
        const response = await axios.get(
          buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.ADDONS}?${params.toString()}`),
          {
            headers: getAuthHeaders(token),
          }
        );
        setAddons(response.data.addons);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } catch (e) {
        toast.error("Could not fetch add-ons.");
      } finally {
        setLoading(false);
      }
    },
    [token, itemsPerPage, searchTerm]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAddons(1);
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchAddons]);

  const handleOpenModal = (addon = null) => {
    setEditingAddon(addon);
    setFormData(
      addon ? { ...addon } : { name: "", price: "", description: "" }
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddon(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiCall = editingAddon
      ? axios.put(
          buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.ADDON_UPDATE(editingAddon.id)),
          formData,
          { headers: getAuthHeaders(token) }
        )
      : axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.ADDONS), formData, {
          headers: getAuthHeaders(token),
        });

    try {
      await apiCall;
      toast.success(
        `Add-on ${editingAddon ? "updated" : "created"} successfully!`
      );
      fetchAddons(currentPage);
      handleCloseModal();
    } catch (e) {
      toast.error("Failed to save add-on.");
    }
  };

  const handleDelete = (addonId) => {
    setAddonToDelete(addonId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!addonToDelete) return;
    try {
      await axios.delete(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.ADDON_DELETE(addonToDelete)),
        {
          headers: getAuthHeaders(token),
        }
      );
      toast.success("Add-on deleted successfully.");
      fetchAddons(currentPage);
    } catch (e) {
      toast.error("Failed to delete add-on.");
    } finally {
      setIsDeleteModalOpen(false);
      setAddonToDelete(null);
    }
  };

  if (loading) return <div>Loading add-ons...</div>;

  return (
    <div>
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Optional Add-ons
        </h2>
        <div className="flex items-center gap-4">
          <FilterButton
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors"
          >
            + Add New Add-on
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
            placeholder="Search add-ons..."
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
              <th className="px-6 py-3">Price (INR)</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addons.map((addon) => (
              <tr key={addon.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {addon.name}
                </td>
                <td className="px-6 py-4">
                  ₹{Number(addon.price).toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4">{addon.description}</td>
                <td className="px-6 py-4 flex space-x-4">
                  <button
                    onClick={() => handleOpenModal(addon)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id)}
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
          Showing {addons.length} add-ons
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
              onClick={() => fetchAddons(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => fetchAddons(page + 1)}
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
              onClick={() => fetchAddons(currentPage + 1)}
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
              {editingAddon ? "Edit Add-on" : "Add New Add-on"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Add-on Name (e.g., Candlelight Dinner)"
                required
                className="w-full p-2 border rounded"
              />
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price (INR)"
                required
                className="w-full p-2 border rounded"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
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

export default AddonManager;
