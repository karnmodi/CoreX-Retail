import { API_URL } from "../configs/constants";

export const reportsService = {
  // Get recent reports
  getRecentReports: async () => {
    const response = await fetch(`${API_URL}/api/report/recent`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch recent reports");
    }
    
    return await response.json();
  },

  // Generate sales report
  generateSalesReport: async (options) => {
    const { dateRange, reportType, groupBy, includeComparison } = options;
    
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      reportType: reportType || "revenue",
      groupBy: groupBy || "daily",
    });
    
    const response = await fetch(`${API_URL}/api/report/sales?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate sales report");
    }
    
    return await response.json();
  },

  // Generate staff report
  generateStaffReport: async (options) => {
    const { dateRange, reportType, staffMembers, includeCharts } = options;
    
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      reportType: reportType || "hours",
    });
    
    if (staffMembers && staffMembers.length > 0) {
      params.append("staffIds", staffMembers.join(","));
    }
    
    const response = await fetch(`${API_URL}/api/report/staff?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate staff report");
    }
    
    return await response.json();
  },

  // Generate inventory report
  generateInventoryReport: async (options) => {
    const { reportType, categories, includeDetails } = options;
    
    const params = new URLSearchParams({
      reportType: reportType || "stock",
    });
    
    if (categories && categories.length > 0) {
      params.append("categories", categories.join(","));
    }
    
    const response = await fetch(`${API_URL}/api/report/inventory?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate inventory report");
    }
    
    return await response.json();
  },

  // Generate financial report
  generateFinancialReport: async (options) => {
    const { dateRange, reportType, detail, includeTrends } = options;
    
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      reportType: reportType || "pnl",
      detailLevel: detail || "summary",
    });
    
    const response = await fetch(`${API_URL}/api/report/financial?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate financial report");
    }
    
    return await response.json();
  },

  // Generate operations report
  generateOperationsReport: async (options) => {
    const { dateRange, reportType, metrics } = options;
    
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      reportType: reportType || "efficiency",
    });
    
    if (metrics && metrics.length > 0) {
      params.append("metrics", metrics.join(","));
    }
    
    const response = await fetch(`${API_URL}/api/report/operations?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate operations report");
    }
    
    return await response.json();
  },

  // Generate custom report
  generateCustomReport: async (options) => {
    const { dateRange, dataSources, format, includeRawData } = options;
    
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      format: "json", // Default to JSON for API
    });
    
    if (dataSources && dataSources.length > 0) {
      params.append("dataSources", dataSources.join(","));
    }
    
    const response = await fetch(`${API_URL}/api/report/custom?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate custom report");
    }
    
    return await response.json();
  },
};