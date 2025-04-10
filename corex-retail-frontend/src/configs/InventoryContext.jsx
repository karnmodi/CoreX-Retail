import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext";
import {
  getAllProducts,
  getProductByID,
  addProduct,
  deleteProduct,
  updateProduct,
  getInventoryValue,
  calculateInventoryValue,
  getLowStockProducts,
  updateProductStock,
} from "../services/inventoryAPI";
import { useToast } from "../components/ui/use-toast";

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshValueTrigger, setRefreshValueTrigger] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const { toast } = useToast();
  const [inventoryValue, setInventoryValue] = useState({
    currentValue: 0,
    previousValue: 0,
    change: 0,
    percentChange: 0,
    totalItems: 0,
    productCount: 0,
    isLoading: true,
    error: null,
  });
  const { token } = useAuth();

  // Fetch all products
  useEffect(() => {
    if (!token) return;

    const loadInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await getAllProducts(token);
        setProduct(products);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };
    loadInventory();
  }, [token, refreshTrigger]);

  // Fetch inventory value data
  useEffect(() => {
    if (!token) return;

    const loadInventoryValue = async () => {
      setInventoryValue((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Try to get data from API
        const valueData = await getInventoryValue(token);
        setInventoryValue({
          ...valueData,
          isLoading: false,
          error: null,
        });
      } catch (e) {
        console.warn(
          "Falling back to local calculation for inventory value:",
          e
        );

        // Fall back to local calculation if API fails
        if (product.length > 0) {
          const calculatedValue = calculateInventoryValue(product);
          setInventoryValue({
            ...calculatedValue,
            isLoading: false,
            error: null,
          });
        } else {
          setInventoryValue((prev) => ({
            ...prev,
            isLoading: false,
            error: e.message,
          }));
        }
      }
    };

    loadInventoryValue();
  }, [token, product, refreshTrigger, refreshValueTrigger]);

  // Fetch single product detail
  const fetchProductDetails = async (id) => {
    if (!token || !id) return null;

    try {
      const productData = await getProductByID(id, token);
      return productData;
    } catch (e) {
      setError(e.message);
      return null;
    }
  };

  const fetchLowStockProducts = async () => {
    if (!token) return;

    try {
      const response = await getLowStockProducts(token);
      setLowStockProducts(response.products || []);
      return response.products;
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      return [];
    }
  };

  const updateInventoryStock = async (id, stockData) => {
    try {
      const loadingToastId = toast({
        title: "Updating Stock",
        description: "Adjusting product stock...",
        variant: "loading",
        duration: "100",
      });

      const updatedProduct = await updateProductStock(id, stockData, token);

      // Update product in the main product list
      setProduct((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id
            ? { ...product, currentStock: updatedProduct.currentStock }
            : product
        )
      );

      const changeDescription =
        stockData.action === "add"
          ? `Added ${stockData.stockQuantity} units`
          : `Removed ${stockData.stockQuantity} units`;

      // Update toast to success
      toast({
        title: "Stock Updated",
        description: `${updatedProduct.productName}: ${changeDescription}`,
        variant: "success",
      });

      // Refresh low stock products
      await fetchLowStockProducts();

      return updatedProduct;
    } catch (error) {
      toast({
        title: "Stock Update Failed",
        description: error.message,
        variant: "error",
      });
      throw error;
    }
  };

  // Handle row click to show product details
  const handleRowClick = async (productData) => {
    if (productData && Object.keys(productData).length > 0) {
      setSelectedInventory(productData);
      setShowDetails(true);
      return;
    }

    // Otherwise try to fetch complete data if we have an ID
    if (productData && productData.id) {
      setLoading(true);
      try {
        const fullProductData = await fetchProductDetails(productData.id);
        if (fullProductData) {
          setSelectedInventory(fullProductData);
          setShowDetails(true);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Close details panel
  const closeDetails = () => {
    setShowDetails(false);
    setSelectedInventory(null);
  };

  // Add new product
  const createProduct = async (productData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Creating product with data:", productData);

      if (productData instanceof FormData) {
        console.log("FormData contents:");
        for (let [key, value] of productData.entries()) {
          console.log(`${key}: ${value}`);
        }
      } else {
        console.log("Object data:", productData);
      }

      const newProduct = await addProduct(productData, token);
      console.log("New product added:", newProduct);

      if (newProduct && newProduct.id) {
        setProduct((prevProducts) => {
          const existingIndex = prevProducts.findIndex(
            (p) => p.id === newProduct.id
          );
          if (existingIndex >= 0) {
            const updatedProducts = [...prevProducts];
            updatedProducts[existingIndex] = newProduct;
            return updatedProducts;
          } else {
            return [...prevProducts, newProduct];
          }
        });

        setRefreshTrigger((prev) => prev + 1);
      } else {
        console.warn("Product was created but no ID was returned:", newProduct);
        setRefreshTrigger((prev) => prev + 1);
      }

      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      setError(error.message || "Failed to create product");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update existing product
  const updateInventory = async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Updating product:", id);

      const updatedProduct = await updateProduct(id, updates, token);

      setProduct((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, ...updates } : product
        )
      );

      if (selectedInventory && selectedInventory.id === id) {
        if (updates instanceof FormData) {
          const refreshedProduct = await getProductByID(id, token);
          setSelectedInventory(refreshedProduct);
        } else {
          setSelectedInventory({ ...selectedInventory, ...updates });
        }
      }

      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const removeProduct = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProduct(id, token);

      // Remove from product list
      setProduct((prevProducts) =>
        prevProducts.filter((item) => item.id !== id)
      );

      // Close details panel if the deleted product was selected
      if (selectedInventory && selectedInventory.id === id) {
        closeDetails();
      }

      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh inventory data
  const refreshInventory = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const refreshInventoryValue = () => {
    setRefreshValueTrigger((prev) => prev + 1);
  };

  // Format currency for display
  const formatCurrency = (amount, currencySymbol = "£") => {
    if (typeof amount !== "number" || isNaN(amount))
      return `${currencySymbol}0.00`;
    return `${currencySymbol}${amount.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const value = {
    product,
    loading,
    error,
    selectedInventory,
    setSelectedInventory,
    closeDetails,
    handleRowClick,
    showDetails,
    setShowDetails,
    createProduct,
    updateInventory,
    removeProduct,
    refreshInventory,
    refreshInventoryValue,
    inventoryValue,
    formatCurrency,
    lowStockProducts,
    fetchLowStockProducts,
    updateInventoryStock,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
