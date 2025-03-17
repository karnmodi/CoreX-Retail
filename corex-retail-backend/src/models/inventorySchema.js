const inventorySchema = {
  // Basic Information
  productName: "",
  category: "",
  status: "Active",

  // Inventory Metrics
  currentStock: 0,
  reorderPoint: 0,        
  reorderQuantity: 0,     
  leadTimeDays: 0,

  // Pricing
  costPrice: 0.0,
  sellingPrice: 0.0,
  margin: 0.0,          

  // Physical Attributes
  weightKg: 0.0,
  dimensions: "",         

  // Location & Dates
  storageLocation: "",
  dateAdded: new Date(),
  expirationDate: null,   

  // Images
  images: [],             

  // Timestamp
  createdAt: new Date(),
  updatedAt: new Date(),
};

module.exports = inventorySchema;
