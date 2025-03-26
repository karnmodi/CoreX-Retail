import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext";
import {
  getAllProducts,
  getProductByID,
  addProduct,
  deleteProduct,
  updateProduct,
} from "../services/inventoryAPI";

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

  // Handle row click to show product details
  const handleRowClick = async (productData) => {
    // If we have full product data, use it directly
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
      const newProduct = await addProduct(productData, token);
      setProduct([...product, newProduct]);
      setRefreshTrigger((prev) => prev + 1);
      return newProduct;
    } catch (error) {
      setError(error.message);
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

      // Call the API to update the product
      const updatedProduct = await updateProduct(id, updates, token);

      // Update the product list after successful update
      setProduct((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, ...updates } : product
        )
      );

      // Update the selected inventory if it's being viewed
      if (selectedInventory && selectedInventory.id === id) {
        // If updates is FormData, we need to handle differently
        if (updates instanceof FormData) {
          // After update, get the full updated product
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
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
