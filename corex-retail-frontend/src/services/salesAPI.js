const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get sales dashboard data
export const getSalesDashboard = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sales/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Dashboard API error response:", errorDetails);
      throw new Error(`Failed to fetch dashboard data: ${errorDetails}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getSalesDashboard:", error);
    throw error;
  }
};

// Get all sales with optional filtering
export const getAllSales = async (filters, token) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.storeLocation) queryParams.append('storeLocation', filters.storeLocation);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log(`Fetching all sales with query parameters: ${queryString}`);

    const response = await fetch(`${API_BASE_URL}/sales${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Sales API error response:", errorDetails);
      throw new Error(`Failed to fetch sales: ${errorDetails}`);
    }

    const data = await response.json();
    console.log(`Received ${data.sales?.length || 0} sales records`);
    return data;
  } catch (error) {
    console.error("Error in getAllSales:", error);
    throw error;
  }
};

// Get sales by date
export const getSalesByDate = async (dateParams, token) => {
  try {
    const queryParams = new URLSearchParams();

    if (dateParams) {
      if (dateParams.startDate) queryParams.append('startDate', dateParams.startDate);
      if (dateParams.endDate) queryParams.append('endDate', dateParams.endDate);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log(`Fetching sales by date with query parameters: ${queryString}`);

    const response = await fetch(`${API_BASE_URL}/sales/by-date${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Sales by date API error response:", errorDetails);
      throw new Error(`Failed to fetch sales by date: ${errorDetails}`);
    }

    const data = await response.json();
    console.log(`Received ${data.length || 0} daily sales records`);
    return data;
  } catch (error) {
    console.error("Error in getSalesByDate:", error);
    throw error;
  }
};

// Get sales for a specific date
export const getSalesForDate = async (date, token) => {
  try {
    console.log(`Fetching sales for date: ${date}`);

    const response = await fetch(`${API_BASE_URL}/sales/date/${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Sales for date API error response:", errorDetails);
      throw new Error(`Failed to fetch sales for date: ${errorDetails}`);
    }

    const data = await response.json();
    console.log(`Received sales data for ${date} with ${data.sales?.length || 0} transactions`);
    return data;
  } catch (error) {
    console.error("Error in getSalesForDate:", error);
    throw error;
  }
};

// Get hourly sales for a specific date
export const getHourlySalesForDate = async (date, token) => {
  try {
    console.log(`Fetching hourly sales for date: ${date}`);

    const response = await fetch(`${API_BASE_URL}/sales/date/${date}/hourly`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Hourly sales API error response:", errorDetails);
      throw new Error(`Failed to fetch hourly sales: ${errorDetails}`);
    }

    const data = await response.json();
    console.log(`Received hourly sales data for ${date}`);
    return data;
  } catch (error) {
    console.error("Error in getHourlySalesForDate:", error);
    throw error;
  }
};

// Get sales for a specific hour
export const getSalesForHour = async (hourKey, token) => {
  try {
    console.log(`Fetching sales for hour: ${hourKey}`);

    const response = await fetch(`${API_BASE_URL}/sales/hour/${hourKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Sales for hour API error response:", errorDetails);
      throw new Error(`Failed to fetch sales for hour: ${errorDetails}`);
    }

    const data = await response.json();
    console.log(`Received sales data for hour ${hourKey} with ${data.sales?.length || 0} transactions`);
    return data;
  } catch (error) {
    console.error("Error in getSalesForHour:", error);
    throw error;
  }
};

// Add a new sale
export const addSale = async (saleData, token) => {
  try {
    if (!saleData || Object.keys(saleData).length === 0) {
      console.error("🚨 Error: saleData is empty before sending to API!", saleData);
      throw new Error("Cannot send empty sale data");
    }

    console.log("✅ Sending Sale Data to API:", JSON.stringify(saleData, null, 2));

    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(saleData),
    });

    console.log("✅ API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(errorText || "Failed to add sale");
    }

    const data = await response.json();
    console.log("✅ API Response Data:", data);

    return data;
  } catch (error) {
    console.error("❌ Error in addSale:", error.message);
    throw error;
  }
};

// Get sales targets
export const getSalesTargets = async (params, token) => {
  try {
    const queryParams = new URLSearchParams();

    if (params) {
      // Ensure params.year is included
      if (params.year) {
        queryParams.append('year', params.year);
        console.log(`Adding year parameter: ${params.year}`);
      } else {
        console.warn("Year parameter is missing from getSalesTargets call");
      }

      // Ensure params.month is included and properly formatted
      if (params.month) {
        // Ensure month is formatted as a 2-digit string (e.g., "05" not "5")
        const formattedMonth = params.month.toString().padStart(2, '0');
        queryParams.append('month', formattedMonth);
        console.log(`Adding month parameter: ${formattedMonth}`);
      } else {
        console.warn("Month parameter is missing from getSalesTargets call");
      }

      // Day is optional but should be formatted if present
      if (params.day) {
        const formattedDay = params.day.toString().padStart(2, '0');
        queryParams.append('day', formattedDay);
        console.log(`Adding day parameter: ${formattedDay}`);
      }
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const apiUrl = `${API_BASE_URL}/sales/targets${queryString}`;

    console.log(`Fetching sales targets from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Sales targets API error response:", errorDetails);
      throw new Error(`Failed to fetch sales targets: ${errorDetails}`);
    }

    const data = await response.json();
    console.log("Sales targets received successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in getSalesTargets:", error);
    throw error;
  }
};

// Update sales target
export const updateSalesTarget = async (targetData, token) => {
  try {
    if (!targetData || Object.keys(targetData).length === 0) {
      console.error("🚨 Error: targetData is empty before sending to API!", targetData);
      throw new Error("Cannot send empty target data");
    }

    // Ensure targetType is valid
    if (!['daily', 'monthly', 'quarterly', 'yearly'].includes(targetData.targetType)) {
      console.error("🚨 Error: Invalid targetType in data:", targetData.targetType);
      throw new Error("targetType must be one of: daily, monthly, quarterly, yearly");
    }

    // Ensure period is formatted correctly based on targetType
    if (!targetData.period) {
      console.error("🚨 Error: Missing period in target data");
      throw new Error("period is required for target data");
    }

    // Ensure amount is present and is a number
    if (typeof targetData.amount !== 'number' || isNaN(targetData.amount)) {
      console.error("🚨 Error: Invalid or missing amount in target data");
      throw new Error("amount must be a valid number");
    }

    console.log("✅ Sending Target Data to API:", JSON.stringify(targetData, null, 2));

    const response = await fetch(`${API_BASE_URL}/sales/targets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(targetData),
    });

    console.log("✅ API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(errorText || "Failed to update sales target");
    }

    const data = await response.json();
    console.log("✅ API Response Data:", data);

    return data;
  } catch (error) {
    console.error("❌ Error in updateSalesTarget:", error.message);
    throw error;
  }
};

export const getSalesTargetsByRange = async (dateParams, token) => {
  try {
    const queryParams = new URLSearchParams();

    if (dateParams) {
      if (dateParams.startDate) queryParams.append('startDate', dateParams.startDate);
      if (dateParams.endDate) queryParams.append('endDate', dateParams.endDate);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log(`Fetching sales targets by range with query parameters: ${queryString}`);

    const response = await fetch(`${API_BASE_URL}/sales/targets/range${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Sales targets by range API error response:", errorDetails);
      throw new Error(`Failed to fetch sales targets by range: ${errorDetails}`);
    }

    const data = await response.json();
    console.log("Sales targets by range received successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in getSalesTargetsByRange:", error);
    throw error;
  }
};