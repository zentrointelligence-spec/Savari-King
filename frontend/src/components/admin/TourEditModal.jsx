import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";

const TourEditModal = ({ tour, onClose, onSave }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    main_image_url: "",
    itinerary: "[]",
    is_active: true,
    is_new: false,
    duration_days: 0,
    category: "",
    destinations: "",
    themes: "",
    rating: 0,
    review_count: 0,
  });

  useEffect(() => {
    if (tour) {
      setFormData({
        name: tour.name || "",
        slug: tour.slug || "",
        main_image_url: tour.main_image_url || "",
        itinerary: JSON.stringify(tour.itinerary || [], null, 2),
        is_active: tour.is_active || false,
        is_new: tour.is_new || false,
        duration_days: tour.duration_days || 0,
        category: tour.category || "",
        destinations: (tour.destinations || []).join(", "),
        themes: (tour.themes || []).join(", "),
        rating: tour.rating || 0,
        review_count: tour.review_count || 0,
      });
    } else {
      // Reset for new tour
      setFormData({
        name: "",
        slug: "",
        main_image_url: "",
        itinerary: "[]",
        is_active: true,
        is_new: true,
        duration_days: 0,
        category: "",
        destinations: "",
        themes: "",
        rating: 0,
        review_count: 0,
      });
    }
  }, [tour]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let parsedItinerary;
    try {
      parsedItinerary = JSON.parse(formData.itinerary);
    } catch (error) {
      toast.error("Invalid JSON format in Itinerary field.");
      return;
    }

    // Prepare data for submission
    const dataToSubmit = {
      ...formData,
      destinations: formData.destinations.split(",").map(s => s.trim()).filter(Boolean),
      themes: formData.themes.split(",").map(s => s.trim()).filter(Boolean),
      itinerary: parsedItinerary,
    };

    const apiCall = tour
      ? axios.put(
          buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.TOUR_UPDATE(tour.id)),
          dataToSubmit,
          { headers: getAuthHeaders(token) }
        )
      : axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.TOURS), dataToSubmit, {
          headers: getAuthHeaders(token),
        });

    try {
      const response = await apiCall;
      toast.success(`Tour ${tour ? "updated" : "created"} successfully!`);
      onSave(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save tour.");
      console.error("Failed to save tour:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6">
          {tour ? "Edit Tour" : "Create New Tour"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Main Image URL</label>
              <input type="text" name="main_image_url" value={formData.main_image_url} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Duration (days)</label>
              <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Destinations (comma-separated)</label>
              <input type="text" name="destinations" value={formData.destinations} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Themes (comma-separated)</label>
              <input type="text" name="themes" value={formData.themes} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Itinerary (JSON format)</label>
              <textarea name="itinerary" value={formData.itinerary} onChange={handleChange} className="w-full p-2 border rounded mt-1 font-mono" rows="10" />
            </div>
            <div>
              <label className="block text-sm font-medium">Rating</label>
              <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Review Count</label>
              <input type="number" name="review_count" value={formData.review_count} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
            </div>
          </div>
          <div className="flex items-center space-x-8 mt-4">
            <div className="flex items-center">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4" />
              <label className="ml-2">Active</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} className="h-4 w-4" />
              <label className="ml-2">New</label>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">
              {tour ? "Save Changes" : "Create Tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourEditModal;
