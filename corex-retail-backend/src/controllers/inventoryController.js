const { db, storage } = require("../config/firebase");

// 📌 Add New Product
const addProduct_BE = async (req, res) => {
  try {
    const {
      productName,
      category,
      status = "Active",
      currentStock,
      reorderPoint,
      reorderQuantity,
      leadTimeDays,
      costPrice,
      sellingPrice,
      margin,
      weightKg,
      dimensions,
      storageLocation,
      expirationDate,
    } = req.body;

    const images = req.files ? await uploadImages_BE(req.files) : [];

    const productRef = db.collection("inventory").doc();
    await productRef.set({
      id: productRef.id,
      productName,
      category,
      status,
      currentStock: parseInt(currentStock) || 0,
      reorderPoint: parseInt(reorderPoint) || 0,
      reorderQuantity: parseInt(reorderQuantity) || 0,
      leadTimeDays: parseInt(leadTimeDays) || 0,
      costPrice: parseFloat(costPrice) || 0.0,
      sellingPrice: parseFloat(sellingPrice) || 0.0,
      margin: parseFloat(margin) || 0.0,
      weightKg: parseFloat(weightKg) || 0.0,
      dimensions: dimensions || "",
      storageLocation: storageLocation || "",
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      images,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: "Product added successfully!", id: productRef.id });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get All Products
const getAllProducts_BE = async (req, res) => {
  try {
    const snapshot = await db.collection("inventory").get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get Product by ID
const 
getProductById_BE = async (req, res) => {
  try {
    const id = req.params.id;
    const productRef = db.collection("inventory").doc(id);
    const docSnapshot = await productRef.get();

    if (!docSnapshot.exists) return res.status(404).json({ message: "Product not found" });

    res.json({ id: docSnapshot.id, ...docSnapshot.data() });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update Product
const updateProduct_BE = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const productRef = db.collection("inventory").doc(id);
    const docSnapshot = await productRef.get();
    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get current product data
    const currentProduct = docSnapshot.data();

    // Handle images - three scenarios:
    // 1. New images uploaded (req.files exists) - potentially adding to existing
    // 2. Images to delete (updates.imagesToDelete exists) - removing some existing
    // 3. Existing images list provided (updates.existingImages exists) - explicit list

    let images = currentProduct.images || [];

    // Case 1: If new images are uploaded
    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImages_BE(req.files);

      // If existingImages is provided, use that list + new images
      if (updates.existingImages) {
        const existingImages = JSON.parse(updates.existingImages);
        images = [...existingImages, ...newImageUrls];
      } else {
        // Otherwise add new images to existing images
        images = [...images, ...newImageUrls];
      }
    }
    // Case 2: If images to delete are specified
    else if (updates.imagesToDelete) {
      const imagesToDelete = JSON.parse(updates.imagesToDelete);

      // Delete the images from storage
      await deleteImages_BE(imagesToDelete);

      // Filter out deleted images
      images = images.filter(url => !imagesToDelete.includes(url));

      // If existingImages is also provided, use that exact list
      if (updates.existingImages) {
        images = JSON.parse(updates.existingImages);
      }
    }
    // Case 3: If only existingImages is specified (explicit list with no additions/deletions)
    else if (updates.existingImages) {
      const newImagesList = JSON.parse(updates.existingImages);

      // Find images that need to be deleted
      const imagesToDelete = images.filter(url => !newImagesList.includes(url));
      if (imagesToDelete.length > 0) {
        await deleteImages_BE(imagesToDelete);
      }

      // Use the provided list
      images = newImagesList;
    }

    // Remove these fields from updates since we've handled them separately
    delete updates.imagesToDelete;
    delete updates.existingImages;

    // Update the product
    await productRef.update({
      ...updates,
      images,
      updatedAt: new Date(),
    });

    // Return the updated product
    const updatedProduct = {
      id,
      ...currentProduct,
      ...updates,
      images,
      updatedAt: new Date()
    };

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Delete Product
const deleteProduct_BE = async (req, res) => {
  try {
    const id = req.params.id;
    const productRef = db.collection("inventory").doc(id);
    const docSnapshot = await productRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete product images from Firebase Storage
    await deleteImages_BE(docSnapshot.data().images);

    // Delete product from Firestore
    await productRef.delete();

    res.json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const uploadImages_BE = async (files) => {
  if (!files || files.length === 0) {
    console.log("No images uploaded");
    return [];
  }
  const urls = [];

  for (const file of files) {
    const fileName = `inventory/${Date.now()}_${file.originalname}`;
    const fileUpload = storage.file(fileName);

    await fileUpload.save(file.buffer, { metadata: { contentType: file.mimetype } });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(fileName)}?alt=media`;
    urls.push(publicUrl);
  }

  return urls;
};

const deleteImages_BE = async (imageUrls) => {
  for (const url of imageUrls) {
    const filename = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
    await storage.file(filename).delete().catch((err) => console.error("Error deleting image:", err.message));
  }
};

module.exports = { addProduct_BE, getAllProducts_BE, getProductById_BE, updateProduct_BE, deleteProduct_BE };
