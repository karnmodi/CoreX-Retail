// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

const reportsService = {
  getRecentReports: async () => {
    try {
      const response = await fetch(`${API_URL}/report/recent`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch recent reports");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching recent reports:", error);
      throw error;
    }
  },

  generateSalesReport: async (options) => {
    try {
      const { dateRange, reportType, groupBy } = options;

      if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
        throw new Error("Date range is required");
      }

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: reportType || "revenue",
        groupBy: groupBy || "daily",
      });

      const response = await fetch(`${API_URL}/report/sales?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate sales report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating sales report:", error);
      throw error;
    }
  },

  generateStaffReport: async (options) => {
    try {
      const { dateRange, reportType, staffMembers } = options;

      if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
        throw new Error("Date range is required");
      }

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: reportType || "hours",
      });

      if (staffMembers && staffMembers.length > 0) {
        params.append("staffIds", staffMembers.join(","));
      }

      const response = await fetch(`${API_URL}/report/staff?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate staff report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating staff report:", error);
      throw error;
    }
  },

  generateInventoryReport: async (options) => {
    try {
      const { reportType, categories } = options;

      const params = new URLSearchParams({
        reportType: reportType || "stock",
      });

      if (categories && categories.length > 0) {
        params.append("categories", categories.join(","));
      }

      const response = await fetch(`${API_URL}/report/inventory?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate inventory report"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating inventory report:", error);
      throw error;
    }
  },

  generateFinancialReport: async (options) => {
    try {
      const { dateRange, reportType, detailLevel } = options;

      if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
        throw new Error("Date range is required");
      }

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: reportType || "pnl",
        detailLevel: detailLevel || "summary",
      });

      const response = await fetch(`${API_URL}/report/financial?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate financial report"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating financial report:", error);
      throw error;
    }
  },

  generateOperationsReport: async (options) => {
    try {
      const { dateRange, reportType, metrics } = options;

      if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
        throw new Error("Date range is required");
      }

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: reportType || "efficiency",
      });

      if (metrics && metrics.length > 0) {
        params.append("metrics", metrics.join(","));
      }

      const response = await fetch(`${API_URL}/report/operations?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate operations report"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating operations report:", error);
      throw error;
    }
  },

};


export default reportsService;