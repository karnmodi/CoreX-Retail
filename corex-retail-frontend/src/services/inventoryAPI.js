const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getAllProducts = async (token) => {
  const url = `${API_BASE_URL}/inventory`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Inventory/Orders");
  }
  return await response.json();
}

export const getProductByID = async (id, token) => {

  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Product Details");
  }
  return await response.json();
}

export const getInventoryValue = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/value`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch inventory value data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching inventory value:", error);
    throw error;
  }
};

export const calculateInventoryValue = (products) => {
  const currentValue = products.reduce((total, product) => {
    const stockValue = (product.currentStock || 0) * (product.costPrice || 0);
    return total + stockValue;
  }, 0);

  const totalItems = products.reduce((sum, product) => sum + (product.currentStock || 0), 0);

  return {
    currentValue: parseFloat(currentValue.toFixed(2)),
    previousValue: 0,
    change: 0,
    percentChange: 0,
    totalItems,
    productCount: products.length
  };
};

export const addProduct = async (productData, token) => {
  let formData;

  if (productData instanceof FormData) {
    formData = productData;
  } else {
    formData = new FormData();

    Object.keys(productData).forEach(key => {
      if (key === 'images' && Array.isArray(productData.images)) {
        productData.images.forEach(image => {
          if (image instanceof File) {
            formData.append('images', image);
          } else if (image.file instanceof File) {
            formData.append('images', image.file);
          }
        });
      }
      else if (key === 'images' && productData.images instanceof File) {
        formData.append('images', productData.images);
      }
      else if (key === 'dimensions' && typeof productData[key] === 'object') {
        formData.append(key, JSON.stringify(productData[key]));
      }
      else if (productData[key] !== undefined && productData[key] !== null) {
        formData.append(key, productData[key]);
      }
    });
  }


  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });


  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add Product: ${errorText.substring(0, 100)}`);
  }

  const result = await response.json();
  return result;
};

export const updateProduct = async (id, updates, token) => {
  try {
    let body;
    let headers = {
      Authorization: `Bearer ${token}`
    };

    if (updates instanceof FormData) {
      body = updates;
      console.log(`Updating product ${id} with FormData`);
      console.log("FormData contents:");
      for (let [key, value] of updates.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File (${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    } else {
      // If it's a regular object, convert to JSON
      body = JSON.stringify(updates);
      headers["Content-Type"] = "application/json";
      console.log(`Updating product ${id} with JSON`, updates);
    }

    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: "PUT",
      headers,
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || `Failed to update product`);
      } catch (e) {
        throw new Error(`Failed to update product: ${errorText.substring(0, 100)}`);
      }
    }

    const result = await response.json();
    console.log("Update successful:", result);
    return result;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to delete product");

    return await response.json();
  }
  catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getLowStockProducts = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/low-stock`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch low stock products");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    throw error;
  }
};

export const updateProductStock = async (id, stockData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}/update-stock`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stockData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update stock: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
};