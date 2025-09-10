/**
 * Centralized API Service for all backend communication
 * Handles authentication, error handling, and request formatting
 */

class ApiService {
  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
  }

  // Get authentication token from localStorage
  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wl_token");
    }
    return null;
  }

  // Create headers with authentication
  getHeaders(includeAuth = true, contentType = "application/json") {
    const headers = {
      "Content-Type": contentType,
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request handler with error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Handle different response types
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else if (contentType && contentType.includes("image/svg")) {
        return await response.text();
      }

      return await response.text();
    } catch (error) {
      console.error(
        `API Error [${config.method || "GET"} ${endpoint}]:`,
        error
      );
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // ========== AUTH APIs ==========

  async login(email, password) {
    return this.post("/auth/login", { email, password }, { auth: false });
  }

  async signup(userData) {
    return this.post("/auth/signup", userData, { auth: false });
  }

  // ========== ACTIVITY APIs ==========

  async getActivities() {
    return this.get("/activities", { auth: false });
  }

  async createActivity(activityData) {
    return this.post("/activities", activityData);
  }

  async updateActivity(activityId, activityData) {
    return this.put(`/activities/${activityId}`, activityData);
  }

  async deleteActivity(activityId) {
    return this.delete(`/activities/${activityId}`);
  }

  // ========== PLAN APIs (Legacy) ==========

  async getPlan() {
    return this.get("/plan");
  }

  async savePlan(planData) {
    return this.post("/plan", planData);
  }

  async deletePlanItem(itemId) {
    return this.delete(`/plan/${itemId}`);
  }

  async exportPlan() {
    return this.get("/export");
  }

  // ========== WEEKEND PLAN APIs (New Enhanced) ==========

  async getWeekendPlans(page = 1, limit = 10, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    return this.get(`/weekend-plans?${params}`);
  }

  async getCurrentWeekendPlan() {
    return this.get("/weekend-plans/current");
  }

  async getWeekendPlan(planId) {
    return this.get(`/weekend-plans/${planId}`);
  }

  async createOrUpdateWeekendPlan(planData) {
    return this.post("/weekend-plans", planData);
  }

  async updatePlanStatus(planId, status) {
    return this.put(`/weekend-plans/${planId}/status`, { status });
  }

  async completeWeekendPlan(planId, completionData) {
    return this.post(`/weekend-plans/${planId}/complete`, completionData);
  }

  async exportWeekendPlan(planId) {
    return this.get(`/weekend-plans/${planId}/export`);
  }

  async getUserHistory() {
    return this.get("/weekend-plans/history");
  }

  // ========== THEME APIs ==========

  async getThemes() {
    return this.get("/themes", { auth: false });
  }

  async getVibes() {
    return this.get("/vibes", { auth: false });
  }

  // ========== UTILITY METHODS ==========

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Clear authentication token
  clearAuth() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wl_token");
    }
  }

  // Health check
  async healthCheck() {
    return this.get("/health", { auth: false });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Named exports for specific API groups (optional, for better organization)
export const authAPI = {
  login: (email, password) => apiService.login(email, password),
  signup: (userData) => apiService.signup(userData),
};

export const activityAPI = {
  getAll: () => apiService.getActivities(),
  create: (data) => apiService.createActivity(data),
  update: (id, data) => apiService.updateActivity(id, data),
  delete: (id) => apiService.deleteActivity(id),
};

export const planAPI = {
  getCurrent: () => apiService.getCurrentWeekendPlan(),
  getAll: (page, limit, status) =>
    apiService.getWeekendPlans(page, limit, status),
  get: (id) => apiService.getWeekendPlan(id),
  save: (data) => apiService.createOrUpdateWeekendPlan(data),
  updateStatus: (id, status) => apiService.updatePlanStatus(id, status),
  complete: (id, data) => apiService.completeWeekendPlan(id, data),
  export: (id) => apiService.exportWeekendPlan(id),
  getHistory: () => apiService.getUserHistory(),

  // Legacy plan APIs
  getLegacy: () => apiService.getPlan(),
  saveLegacy: (data) => apiService.savePlan(data),
  deleteLegacyItem: (id) => apiService.deletePlanItem(id),
  exportLegacy: () => apiService.exportPlan(),
};

export const themeAPI = {
  getThemes: () => apiService.getThemes(),
  getVibes: () => apiService.getVibes(),
};
