import React, { useState, useEffect, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInventory } from "../../configs/InventoryContext";
import { useToast } from "@/components/ui/use-toast";
import FloatingLabelInput from "../../components/small/FloatingLabelInput";
import FloatingLabelSelect from "../../components/small/FloatingLabelSelect";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X, Save, ArrowLeft } from "lucide-react";
import { getProductByID } from "../../services/inventoryAPI";

// Form options based on the inventory schema
const FORM_OPTIONS = {
  Category: [
    { value: "Phones", label: "Phones" },
    { value: "Tabs", label: "Tabs" },
    { value: "Watches", label: "Watches" },
    { value: "Earbuds", label: "Earbuds" },
    { value: "Others", label: "Others" },
  ],
  Status: [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Discontinued", label: "Discontinued" },
    { value: "Out of Stock", label: "Out of Stock" },
  ],
};

// Initialize default state based on schema
const initialState = {
  productName: "",
  category: "Phones",
  status: "Active",
  currentStock: 0,
  reorderPoint: 0,
  reorderQuantity: 0,
  leadTimeDays: 0,
  costPrice: 0,
  sellingPrice: 0,
  margin: 0,
  weightKg: 0,
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
    unit: "cm",
  },
  storageLocation: "",
  expirationDate: null,
  images: [],
};

function inventoryReducer(state, action) {
  switch (action.type) {
    case "INIT_FORM":
      return { ...initialState, ...action.payload };
    case "UPDATE_FIELD":
      // Handle nested fields like dimensions
      if (action.field.includes(".")) {
        const [parent, child] = action.field.split(".");
        return {
          ...state,
          [parent]: {
            ...state[parent],
            [child]: action.value,
          },
        };
      }
      // Handle special case for margin calculation
      if (action.field === "sellingPrice" || action.field === "costPrice") {
        const costPrice =
          action.field === "costPrice"
            ? parseFloat(action.value)
            : parseFloat(state.costPrice);
        const sellingPrice =
          action.field === "sellingPrice"
            ? parseFloat(action.value)
            : parseFloat(state.sellingPrice);

        let margin = 0;
        if (sellingPrice > 0 && !isNaN(sellingPrice) && !isNaN(costPrice)) {
          margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
        }

        return {
          ...state,
          [action.field]: parseFloat(action.value),
          margin: isNaN(margin) ? 0 : margin.toFixed(2),
        };
      }
      return { ...state, [action.field]: action.value };
    case "ADD_IMAGES":
      return {
        ...state,
        images: [...state.images, ...action.images],
      };
    case "REMOVE_IMAGE":
      return {
        ...state,
        images: state.images.filter((_, idx) => idx !== action.index),
      };

    default:
      return state;
  }
}

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { product, createProduct, updateInventory, refreshInventory, token } =
    useInventory();

  // Basic form state
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Image management states
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setIsEditMode(true);
        setIsLoading(true);

        try {
          let productData = product.find((p) => p.id === id);

          // If not found in context, fetch it directly using the API
          if (!productData) {
            productData = await getProductByID(id, token);
          }

          if (productData) {
            // Update main form state
            dispatch({
              type: "INIT_FORM",
              payload: prepareProductForEditing(productData),
            });

            // Set up existing images
            if (productData.images && Array.isArray(productData.images)) {
              setExistingImages(
                productData.images.map((url, index) => ({
                  url,
                  id: `existing-${index}`,
                  is_primary: index === 0,
                }))
              );
            }
          } else {
            toast({
              title: "Error",
              description: "Product not found",
              variant: "destructive",
            });
            navigate("/inventory");
          }
        } catch (err) {
          console.error("Error fetching product:", err);
          toast({
            title: "Error",
            description: `Failed to load product: ${err.message}`,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    // Cleanup function to revoke object URLs
    return () => {
      newImages.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, [id, token, navigate, toast, product]);

  useEffect(() => {
    return () => {
      newImages.forEach((image) => {
        if (image.url && image.url.startsWith("blob:")) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [newImages]);

  const prepareProductForEditing = (product) => {
    return {
      productName: product.productName || product.name || "",
      category: product.category || "Phones",
      status: product.status || "Active",
      currentStock: product.currentStock || 0,
      reorderPoint: product.reorderPoint || product.reorder_point || 0,
      reorderQuantity: product.reorderQuantity || product.reorder_quantity || 0,
      leadTimeDays: product.leadTimeDays || product.lead_time_days || 0,
      costPrice: product.costPrice || 0,
      sellingPrice: product.sellingPrice || 0,
      margin: product.margin || 0,
      weightKg: product.weightKg || product.weight || 0,
      dimensions: product.dimensions || {
        length: 0,
        width: 0,
        height: 0,
        unit: "cm",
      },
      storageLocation:
        product.storageLocation || product.storage_location || "",
      expirationDate: product.expirationDate || null,
      images: product.images || [],
    };
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    console.log(`Changing field ${name} to ${value} (type: ${type})`);

    if (
      type === "number" ||
      name.includes("price") ||
      name.includes("Price") ||
      name === "currentStock" ||
      name === "reorderPoint" ||
      name === "reorderQuantity" ||
      name === "leadTimeDays" ||
      name === "weightKg"
    ) {
      dispatch({
        type: "UPDATE_FIELD",
        field: name,
        value: value === "" ? 0 : parseFloat(value),
      });
    } else if (name === "category" || name === "status") {
      dispatch({
        type: "UPDATE_FIELD",
        field: name,
        value: value || (name === "category" ? "Phones" : "Active"),
      });
    } else {
      dispatch({ type: "UPDATE_FIELD", field: name, value });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const imagesPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    setNewImages((prev) => [...prev, ...imagesPreviews]);
  };

  const handleRemoveImage = (id, isNew = false) => {
    if (isNew) {
      const imageToRemove = newImages.find((img) => img.id === id);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      setNewImages(newImages.filter((img) => img.id !== id));
    } else {
      const imageToRemove = existingImages.find((img) => img.id === id);
      setImagesToDelete((prev) => [...prev, imageToRemove.url]);
      setExistingImages(existingImages.filter((img) => img.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append("productName", state.productName);
      formData.append("category", state.category);
      formData.append("status", state.status);
      formData.append("currentStock", state.currentStock);
      formData.append("reorderPoint", state.reorderPoint);
      formData.append("reorderQuantity", state.reorderQuantity);
      formData.append("leadTimeDays", state.leadTimeDays);
      formData.append("costPrice", state.costPrice);
      formData.append("sellingPrice", state.sellingPrice);
      formData.append("margin", state.margin);
      formData.append("weightKg", state.weightKg);

      if (state.dimensions) {
        formData.append("dimensions", JSON.stringify(state.dimensions));
      }

      if (state.storageLocation) {
        formData.append("storageLocation", state.storageLocation);
      }

      if (state.expirationDate) {
        formData.append("expirationDate", state.expirationDate);
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 100);

      if (isEditMode) {
        const imagesToKeep = existingImages
          .filter((img) => !imagesToDelete.includes(img.url))
          .map((img) => img.url);

        // Add existing images to be kept
        if (imagesToKeep.length > 0) {
          formData.append("existingImages", JSON.stringify(imagesToKeep));
        }

        // Add images to be deleted
        if (imagesToDelete.length > 0) {
          formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
        }
      }

      // Add new images
      if (newImages.length > 0) {
        newImages.forEach((img) => {
          if (img.file) {
            formData.append("images", img.file);
          }
        });
      }

      let result;
      if (isEditMode) {
        result = await updateInventory(id, formData);
      } else {
        result = await createProduct(formData);
      }

      setUploadProgress(100);
      clearInterval(progressInterval);

      toast({
        title: "Success",
        description: isEditMode
          ? "Product updated successfully"
          : "Product created successfully",
        variant: "success",
      });

      setTimeout(() => {
        refreshInventory(); // Refresh inventory data
        navigate("../viewInventory");
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} product: ${
          error.message
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setImagesToDelete([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate("../viewInventory")}
          className="hidden md:flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Basic Information & Inventory */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Product Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <FloatingLabelInput
                  type="text"
                  name="productName"
                  value={state.productName}
                  onChange={handleChange}
                  label="Product Name"
                  required
                  className="w-full"
                />
                <FloatingLabelSelect
                  name="category"
                  value={state.category}
                  onChange={handleChange}
                  label="Category"
                  options={FORM_OPTIONS.Category}
                  required
                  className="w-full"
                />
                <div className="md:col-span-2">
                  <FloatingLabelSelect
                    name="status"
                    value={state.status}
                    onChange={handleChange}
                    label="Status"
                    options={FORM_OPTIONS.Status}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Inventory</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    name="currentStock"
                    value={state.currentStock}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reorder Point: {state.reorderPoint}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      name="reorderPoint"
                      value={state.reorderPoint}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                      min="0"
                      max="100"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {state.reorderPoint}
                    </span>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                    Reorder Quantity: {state.reorderQuantity}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      name="reorderQuantity"
                      value={state.reorderQuantity}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                      min="0"
                      max="1000"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {state.reorderQuantity}
                    </span>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                    Lead Time (days): {state.leadTimeDays}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      name="leadTimeDays"
                      value={state.leadTimeDays}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                      min="0"
                      max="30"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {state.leadTimeDays}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing & Additional Details */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pricing</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (£)
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={state.costPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (£)
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={state.sellingPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margin (%)
                  </label>
                  <input
                    type="number"
                    name="margin"
                    value={state.margin}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Product Images</h2>

              <div className="mb-4">
                <div className="w-full h-56 flex items-center justify-center rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                  {existingImages.length > 0 || newImages.length > 0 ? (
                    <img
                      src={
                        existingImages.find((img) => img.is_primary)?.url ||
                        newImages.find((img) => img.is_primary)?.preview ||
                        existingImages[0]?.url ||
                        newImages[0]?.preview
                      }
                      alt="Primary product image"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <p>No image available</p>
                      <p className="text-sm">Upload images below</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Image upload area */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="pt-1 text-sm tracking-wider text-gray-400">
                        {existingImages.length > 0 || newImages.length > 0
                          ? "Add more images"
                          : "Drag and drop or click to upload"}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="opacity-0"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              </div>

              {/* Image management section */}
              <div className="space-y-4">
                {/* New images preview */}
                {newImages.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700">
                        New Images
                      </h3>
                      <span className="text-xs text-blue-500 font-medium">
                        {newImages.length} new file(s)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {newImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative group aspect-square"
                        >
                          <div
                            className={`w-full h-full border rounded-md overflow-hidden ${
                              image.is_primary ? "ring-2 ring-blue-500" : ""
                            }`}
                          >
                            <img
                              src={image.preview}
                              alt={`New product image`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveImage(image.id, true)
                                }
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700">
                        Current Images
                      </h3>
                      <span className="text-xs text-gray-500">
                        {existingImages.length} existing image(s)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {existingImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative group aspect-square"
                        >
                          <div
                            className={`w-full h-full border rounded-md overflow-hidden ${
                              image.is_primary ? "ring-2 ring-blue-500" : ""
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`Product image`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveImage(image.id, false)
                                }
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deleted images */}
                {imagesToDelete.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-red-600">
                        Images to Delete
                      </h3>
                      <span className="text-xs text-red-500">
                        {imagesToDelete.length} image(s) will be deleted
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {imagesToDelete.map((url, index) => (
                        <div
                          key={`delete-${index}`}
                          className="relative aspect-square"
                        >
                          <div className="w-full h-full border border-red-200 rounded-md overflow-hidden opacity-50">
                            <img
                              src={url}
                              alt={`Image to delete`}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-40">
                              <X className="h-8 w-8 text-red-500" />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setImagesToDelete(
                                imagesToDelete.filter((img) => img !== url)
                              );
                              setExistingImages([
                                ...existingImages,
                                { url, id: `restored-${index}` },
                              ]);
                            }}
                            className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                            disabled={isSubmitting}
                          >
                            <span className="text-xs">Restore</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload progress bar */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1 flex justify-between">
                      <span>Uploading images...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Back Button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white shadow-top">
          <Button
            variant="outline"
            onClick={() => navigate("../viewInventory")}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
          </Button>
        </div>

        {/* Form Submission */}
        <div className="col-span-full flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("../viewInventory")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Product" : "Create Product"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
