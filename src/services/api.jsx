import axios from "axios";

// Vercel API URL (connects to Neon database)
const API_BASE_URL = "https://helix-preset-search.vercel.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API endpoints
export const apiService = {
  // Models
  getModels: () => api.get("/models/"),
  getModelById: (id) => api.get(`/models/${id}`),
  getModelParameters: (id) => api.get(`/models/${id}/parameters`),
  getModelDevices: (id) => api.get(`/models/${id}/devices`),
  getModelsByType: (type) => api.get(`/models/type/${type}`),
  getModelCategories: () => api.get("/models/categories/list"),
  getModelTypes: () => api.get("/models/types/list"),
  getModelStats: () => api.get("/models/stats"),

  // Presets
  searchPresets: (searchParams) => api.post("/presets/search", searchParams),
  getSearchFilters: () => api.get("/presets/search/filters"),
  getPresetById: (id) => api.get(`/presets/${id}`),
  uploadPreset: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/presets/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Downloads
  downloadPreset: (id) =>
    api.get(`/presets/download/${id}`, { responseType: "blob" }),
  downloadPresetsBulk: (presetIds) =>
    api.post(
      "/presets/download/bulk",
      presetIds,
      { responseType: "blob" }
    ),
  downloadSearchResults: (searchParams) =>
    api.post("/presets/download/search", searchParams, {
      responseType: "blob",
    }),

  // Health check
  healthCheck: () => api.get("/health"),
};

export default api;
