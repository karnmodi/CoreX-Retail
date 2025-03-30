const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getAllProducts = async (token) => {
  const url = `${API_BASE_URL}/inventory`;
  console.log("Fetching inventory from:", url);
  
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

export const addProduct = async (productData, token) => {
    const formData = new FormData();

    Object.keys(productData).forEach(key => {
        if (key === 'images' && Array.isArray(productData.images)) {
            productData.images.forEach(image => {
                formData.append('images', image);
            });
        }
        else if (key === 'images' && productData.images instanceof File) {
            formData.append('images', productData.images);
        }
        else if (productData[key] !== undefined && productData[key] !== null) {
            formData.append(key, productData[key]);
        }
    });

    const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) throw new Error("Failed to add Product");

    return await response.json();
};



export const updateProduct = async (id, updates, token) => {
    try {
      let body;
      let headers = {
        Authorization: `Bearer ${token}`
      };
  
      // If updates is already FormData, use it directly
      if (updates instanceof FormData) {
        body = updates;
        // For FormData, don't set Content-Type header
        // The browser will automatically set it with the correct boundary
      } else {
        // If it's a regular object, convert to JSON
        body = JSON.stringify(updates);
        headers["Content-Type"] = "application/json";
      }
  
      // Log what we're sending
      console.log(`Updating product ${id}`);
      if (updates instanceof FormData) {
        console.log("FormData fields:");
        for (let key of updates.keys()) {
          const value = updates.get(key);
          if (value instanceof File) {
            console.log(`${key}: File (${value.name}, ${value.size} bytes)`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
      } else {
        console.log("Update data:", updates);
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
  
      return await response.json();
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
