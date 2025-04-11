import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext";
import {
  getSalesDashboard,
  getAllSales,
  getSalesByDate,
  getSalesByDateDaily,
  getSalesByDateMonthly,
  getSalesForDate,
  getHourlySalesForDate,
  getSalesForHour,
  addSale,
  getSalesTargets,
  getSalesTargetsByRange,
  updateSalesTarget,
} from "../services/salesAPI";

const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
};

export const SalesProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [salesList, setSalesList] = useState([]);
  const [salesByDate, setSalesByDate] = useState([]);
  const [salesByDateDaily, setSalesByDateDaily] = useState([]);
  const [salesByDateMonthly, setSalesByDateMonthly] = useState([]);
  const [selectedDateSales, setSelectedDateSales] = useState(null);
  const [hourlySales, setHourlySales] = useState([]);
  const [selectedHourSales, setSelectedHourSales] = useState(null);
  const [salesTargets, setSalesTargets] = useState({});
  const [salesTargetsByRange, setSalesTargetsByRange] = useState([]);

  // Replace single loading state with loading states object
  const [loadingStates, setLoadingStates] = useState({
    dashboard: false,
    sales: false,
    salesByDate: false,
    salesByDateDaily: false,
    salesByDateMonthly: false,
    salesForDate: false,
    hourlySales: false,
    salesForHour: false,
    salesTargets: false,
    salesTargetsByRange: false,
    createSale: false,
    updateSalesTarget: false,
  });

  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Helper to update loading state for a specific operation
  const setLoadingFor = (operation, isLoading) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      [operation]: isLoading,
    }));
  };

  useEffect(() => {
    if (!token) return;

    // Initial dashboard data load
    const loadInitialData = async () => {
      try {
        setLoadingFor("dashboard", true);
        const data = await getSalesDashboard(token);
        setDashboardData(data);
      } catch (error) {
        console.error("Error loading initial dashboard data:", error.message);
        setError(error.message);
      } finally {
        setLoadingFor("dashboard", false);
      }
    };

    loadInitialData();
  }, [token]);

  const loadSales = async (filters = {}) => {
    let operationSuccess = false;

    try {
      // Set loading for this specific operation
      setLoadingFor("sales", true);
      setError(null); // Reset error state before new request

      console.log("Loading sales with filters:", filters);
      const data = await getAllSales(filters, token);

      // Check if data is valid before updating state
      if (data && data.sales) {
        setSalesList(data.sales);
        operationSuccess = true;
        return data;
      } else {
        console.warn("Received invalid data from getAllSales:", data);
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("Error loading sales data:", error.message);
      setError(error.message);
      return null;
    } finally {
      // Only update loading state for this operation
      setLoadingFor("sales", false);
      console.log("loadSales operation completed. Success:", operationSuccess);
    }
  };

  // Legacy function - keeping for backward compatibility
  const loadSalesByDate = async (dateParams = {}) => {
    let operationSuccess = false;

    try {
      setLoadingFor("salesByDate", true);
      setError(null);

      const data = await getSalesByDate(dateParams, token);

      // Check if data is valid before updating state
      if (data && Array.isArray(data)) {
        setSalesByDate(data);
        operationSuccess = true;
        return data;
      } else {
        console.warn("Received invalid data from getSalesByDate:", data);
        setSalesByDate([]); // Reset to empty array on invalid data
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("Error loading sales by date:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("salesByDate", false);
      console.log(
        "loadSalesByDate operation completed. Success:",
        operationSuccess
      );
    }
  };

  // New function for daily sales data
  const loadSalesByDateDaily = async (dateParams = {}) => {
    let operationSuccess = false;

    try {
      setLoadingFor("salesByDateDaily", true);
      setError(null);

      console.log("[Daily] Loading daily sales with params:", dateParams);
      const data = await getSalesByDateDaily(dateParams, token);

      // Check if data is valid before updating state
      if (data && Array.isArray(data)) {
        setSalesByDateDaily(data);
        operationSuccess = true;
        return data;
      } else {
        console.warn(
          "[Daily] Received invalid data from getSalesByDateDaily:",
          data
        );
        setSalesByDateDaily([]); // Reset to empty array on invalid data
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("[Daily] Error loading daily sales:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("salesByDateDaily", false);
      console.log(
        "[Daily] loadSalesByDateDaily operation completed. Success:",
        operationSuccess
      );
    }
  };

  // New function for monthly sales data
  const loadSalesByDateMonthly = async (dateParams = {}) => {
    let operationSuccess = false;

    try {
      setLoadingFor("salesByDateMonthly", true);
      setError(null);

      console.log("[Monthly] Loading monthly sales with params:", dateParams);
      const data = await getSalesByDateMonthly(dateParams, token);

      // Check if data is valid before updating state
      if (data && Array.isArray(data)) {
        setSalesByDateMonthly(data);
        operationSuccess = true;
        return data;
      } else {
        console.warn(
          "[Monthly] Received invalid data from getSalesByDateMonthly:",
          data
        );
        setSalesByDateMonthly([]); // Reset to empty array on invalid data
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("[Monthly] Error loading monthly sales:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("salesByDateMonthly", false);
      console.log(
        "[Monthly] loadSalesByDateMonthly operation completed. Success:",
        operationSuccess
      );
    }
  };

  const loadSalesForDate = async (date) => {
    let operationSuccess = false;

    try {
      setLoadingFor("salesForDate", true);
      setError(null);

      console.log("Loading sales for date:", date);
      const data = await getSalesForDate(date, token);

      if (data) {
        setSelectedDateSales(data);
        operationSuccess = true;
        return data;
      } else {
        console.warn("Received invalid data from getSalesForDate:", data);
        setSelectedDateSales(null);
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("Error loading sales for date:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("salesForDate", false);
      console.log(
        "loadSalesForDate operation completed. Success:",
        operationSuccess
      );
    }
  };

  const loadHourlySalesForDate = async (date) => {
    let operationSuccess = false;

    try {
      setLoadingFor("hourlySales", true);
      setError(null);

      console.log("Loading hourly sales for date:", date);
      const data = await getHourlySalesForDate(date, token);

      if (data && data.completeHourlySales) {
        setHourlySales(data.completeHourlySales);
        operationSuccess = true;
        return data;
      } else {
        console.warn("Received invalid data from getHourlySalesForDate:", data);
        setHourlySales([]);
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("Error loading hourly sales:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("hourlySales", false);
      console.log(
        "loadHourlySalesForDate operation completed. Success:",
        operationSuccess
      );
    }
  };

  const loadSalesForHour = async (hourKey) => {
    let operationSuccess = false;

    try {
      setLoadingFor("salesForHour", true);
      setError(null);

      console.log("Loading sales for hour:", hourKey);
      const data = await getSalesForHour(hourKey, token);

      if (data) {
        setSelectedHourSales(data);
        operationSuccess = true;
        return data;
      } else {
        console.warn("Received invalid data from getSalesForHour:", data);
        setSelectedHourSales(null);
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("Error loading sales for hour:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("salesForHour", false);
      console.log(
        "loadSalesForHour operation completed. Success:",
        operationSuccess
      );
    }
  };

  const createSale = async (saleData) => {
    let operationSuccess = false;

    try {
      setLoadingFor("createSale", true);
      setError(null);

      if (!saleData || Object.keys(saleData).length === 0) {
        console.error("Error: saleData is empty or undefined", saleData);
        setError("Sale data is missing");
        return null;
      }

      console.log("Adding New Sale: ", saleData);

      // Add current timestamp if not provided
      const saleWithTimestamp = {
        ...saleData,
        saleDatetime: saleData.saleDatetime || new Date().toISOString(),
      };

      const newSale = await addSale(saleWithTimestamp, token);

      if (newSale) {
        // Refresh dashboard data after adding a new sale
        await loadDashboardData();

        console.log("Sale added successfully:", newSale);
        operationSuccess = true;
        return newSale;
      } else {
        console.error("Error: No response received from API");
        setError("Failed to add sale");
        return null;
      }
    } catch (error) {
      console.error("Error adding sale:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("createSale", false);
      console.log("createSale operation completed. Success:", operationSuccess);
    }
  };

  const loadSalesTargets = async (params = {}) => {
    let operationSuccess = false;

    try {
      setLoadingFor("salesTargets", true);
      setError(null);

      // Ensure params has the correct format
      // Make sure both year and month are present and formatted correctly
      if (!params.year) {
        params.year = new Date().getFullYear().toString();
      }

      if (!params.month) {
        params.month = (new Date().getMonth() + 1).toString().padStart(2, "0");
      } else if (params.month.length === 1) {
        params.month = params.month.padStart(2, "0");
      }

      console.log("Loading sales targets with params:", params);

      const data = await getSalesTargets(params, token);

      if (data) {
        console.log("Sales targets data received:", data);
        setSalesTargets(data);
        operationSuccess = true;
        return data;
      } else {
        console.warn("Received invalid data from getSalesTargets");
        setSalesTargets({});
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("Error loading sales targets:", error.message);
      setError(error.message);
      setSalesTargets({}); // Reset to empty object on error
      return null;
    } finally {
      setLoadingFor("salesTargets", false);
      console.log(
        "loadSalesTargets operation completed. Success:",
        operationSuccess
      );
    }
  };

  const loadSalesTargetsByRange = async (dateParams = {}) => {
    let operationSuccess = false;

    try {
      setLoadingFor("salesTargetsByRange", true);
      setError(null);

      // Ensure date params are properly formatted
      if (!dateParams.startDate) {
        console.warn("Start date is missing from range parameters");
      }

      if (!dateParams.endDate) {
        console.warn("End date is missing from range parameters");
      }

      const data = await getSalesTargetsByRange(dateParams, token);

      if (data) {
        setSalesTargetsByRange(data);
        operationSuccess = true;
        return data;
      } else {
        console.warn("Received invalid data from getSalesTargetsByRange");
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("Error loading sales targets by range:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("salesTargetsByRange", false);
    }
  };

  const createOrUpdateSalesTarget = async (targetData) => {
    let operationSuccess = false;

    try {
      setLoadingFor("updateSalesTarget", true);
      setError(null);

      if (!targetData || Object.keys(targetData).length === 0) {
        console.error("Error: targetData is empty or undefined", targetData);
        setError("Target data is missing");
        return null;
      }

      console.log("Updating Sales Target: ", targetData);

      const updatedTarget = await updateSalesTarget(targetData, token);

      if (updatedTarget) {
        // Refresh targets data after update
        const year = new Date().getFullYear().toString();
        const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
        await loadSalesTargets({ year, month });

        console.log("Sales target updated successfully:", updatedTarget);
        operationSuccess = true;
        return updatedTarget;
      } else {
        console.error("Error: No response received from API");
        setError("Failed to update sales target");
        return null;
      }
    } catch (error) {
      console.error("Error updating sales target:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("updateSalesTarget", false);
      console.log(
        "createOrUpdateSalesTarget operation completed. Success:",
        operationSuccess
      );
    }
  };

  // Helper function to refresh dashboard data
  const loadDashboardData = async () => {
    let operationSuccess = false;

    try {
      setLoadingFor("dashboard", true);
      setError(null);

      const data = await getSalesDashboard(token);

      if (data) {
        setDashboardData(data);
        operationSuccess = true;
        return data;
      } else {
        console.warn("Received invalid data from getSalesDashboard");
        setError("Received invalid data from API");
        return null;
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error.message);
      setError(error.message);
      return null;
    } finally {
      setLoadingFor("dashboard", false);
      console.log(
        "loadDashboardData operation completed. Success:",
        operationSuccess
      );
    }
  };

  const value = {
    dashboardData,
    salesList,
    salesByDate,
    salesByDateDaily,
    salesByDateMonthly,
    selectedDateSales,
    hourlySales,
    selectedHourSales,
    salesTargets,
    salesTargetsByRange,

    loading: {
      dashboard: loadingStates.dashboard,
      sales: loadingStates.sales,
      salesByDate: loadingStates.salesByDate,
      salesByDateDaily: loadingStates.salesByDateDaily,
      salesByDateMonthly: loadingStates.salesByDateMonthly,
      salesForDate: loadingStates.salesForDate,
      hourlySales: loadingStates.hourlySales,
      salesForHour: loadingStates.salesForHour,
      salesTargets: loadingStates.salesTargets,
      salesTargetsByRange: loadingStates.salesTargetsByRange,
      createSale: loadingStates.createSale,
      updateSalesTarget: loadingStates.updateSalesTarget,
      // Add a general loading state for backwards compatibility
      any: Object.values(loadingStates).some(Boolean),
    },

    error,
    loadSales,
    loadSalesByDate,
    loadSalesByDateDaily,
    loadSalesByDateMonthly,
    loadSalesForDate,
    loadHourlySalesForDate,
    loadSalesForHour,
    createSale,
    loadSalesTargets,
    loadSalesTargetsByRange,
    createOrUpdateSalesTarget,
    refreshDashboard: loadDashboardData,
  };

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
};
