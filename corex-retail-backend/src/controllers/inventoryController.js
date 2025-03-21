const { db, storage } = require("../config/firebase");
const {
  validateInventoryItem,
  prepareInventoryItem
} = require("../models/inventorySchema");

// 📌 Add New Product
const addProduct_BE = async (req, res) => {
  try {
    const productData = prepareInventoryItem(req.body);

    const validation = validateInventoryItem(productData);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validation.errors 
      });
    }

    const images = req.files ? await uploadImages_BE(req.files) : [];
    productData.images = images;

    const productRef = db.collection("inventory").doc();
    productData.id = productRef.id;
    
    await productRef.set(productData);

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
    
    // Get the current product data
    const productRef = db.collection("inventory").doc(id);
    const docSnapshot = await productRef.get();
    
    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Get current product data
    const currentProduct = docSnapshot.data();
    
    const updates = { ...req.body };
    
    let images = currentProduct.images || [];

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImages_BE(req.files);

      if (updates.existingImages) {
        const existingImages = JSON.parse(updates.existingImages);
        images = [...existingImages, ...newImageUrls];
      } else {
        images = [...images, ...newImageUrls];
      }
    } else if (updates.imagesToDelete) {
      const imagesToDelete = JSON.parse(updates.imagesToDelete);
      await deleteImages_BE(imagesToDelete);
      images = images.filter(url => !imagesToDelete.includes(url));

      if (updates.existingImages) {
        images = JSON.parse(updates.existingImages);
      }
    } else if (updates.existingImages) {
      const newImagesList = JSON.parse(updates.existingImages);
      const imagesToDelete = images.filter(url => !newImagesList.includes(url));
      
      if (imagesToDelete.length > 0) {
        await deleteImages_BE(imagesToDelete);
      }

      images = newImagesList;
    }

    delete updates.imagesToDelete;
    delete updates.existingImages;
    
    const completeUpdates = prepareInventoryItem({
      ...currentProduct,
      ...updates,
      images
    });
    
    // Validate the updated data
    const validation = validateInventoryItem(completeUpdates);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validation.errors 
      });
    }

    // Update the product
    await productRef.update(completeUpdates);

    res.json({
      id,
      ...completeUpdates
    });
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
