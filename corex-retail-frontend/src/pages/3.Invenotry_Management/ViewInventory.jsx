import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  ArrowBigLeft,
  ArrowBigRight,
  Loader2,
  Search,
  Filter,
  Settings,
  ChevronRight,
  ChevronDown,
  XIcon,
  RotateCcw,
  Edit,
  Trash2,
} from "lucide-react";
import { Upload, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../../configs/InventoryContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const ViewInventory = () => {
  const {
    product,
    loading,
    error,
    selectedInventory,
    setSelectedInventory,
    handleRowClick,
    showDetails,
    setShowDetails,
    updateInventory,
    removeProduct,
    refreshInventory,
  } = useInventory();

  const navigate = useNavigate();
  const { toast } = useToast();

  // State for component
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOption, setSortOption] = useState("Name (A-Z)");
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedInventory, setEditedInventory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    return () => {
      newImages.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [newImages]);

  useEffect(() => {
    if (selectedInventory) {
      setEditedInventory({ ...selectedInventory });
    }
  }, [selectedInventory]);

  const handleImageSelect = (e) => {
    if (!isEditing) return;

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create preview URLs for the images
    const imagesPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));

    setNewImages((prev) => [...prev, ...imagesPreviews]);
  };

  const handleRemoveImage = (index, isNewImage = false) => {
    if (!isEditing) return;

    if (isNewImage) {
      setNewImages((prev) => {
        URL.revokeObjectURL(prev[index].preview);
        return prev.filter((_, i) => i !== index);
      });
    } else {
      setEditedInventory((prev) => {
        const updatedImages = [...prev.images];
        updatedImages.splice(index, 1);
        return {
          ...prev,
          images: updatedImages,
        };
      });
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!selectedInventory) return;

    try {
      await removeProduct(selectedInventory.id);
      setDeleteConfirmOpen(false);

      toast({
        title: "Product deleted",
        description: "Product has been removed from inventory",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to delete product: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!editedInventory || !selectedInventory) return;

    try {
      setIsSubmitting(true);

      const productData = {
        productName: editedInventory.productName || editedInventory.name || "",
        category: editedInventory.category || "",
        status: editedInventory.status || "Active",
        currentStock: parseInt(editedInventory.currentStock) || 0,
        reorderPoint: parseInt(editedInventory.reorderPoint) || 0,
        reorderQuantity: parseInt(editedInventory.reorderQuantity) || 0,
        leadTimeDays: parseInt(editedInventory.leadTimeDays) || 0,
        costPrice: parseFloat(editedInventory.costPrice) || 0,
        sellingPrice: parseFloat(editedInventory.sellingPrice) || 0,
      };

      const originalImages = selectedInventory.images || [];
      const currentImages = editedInventory.images || [];

      const formData = new FormData();

      Object.keys(productData).forEach((key) => {
        formData.append(key, productData[key]);
      });

      formData.append("existingImages", JSON.stringify(currentImages));

      if (newImages.length > 0) {
        newImages.forEach((img) => {
          formData.append("images", img.file);
        });
      }

      if (imagesToDelete.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      await updateInventory(selectedInventory.id, formData);

      setNewImages([]);
      setImagesToDelete([]);
      setIsEditing(false);

      toast({
        title: "Changes saved",
        description: "Product updated successfully",
        variant: "success",
      });

      refreshInventory();
    } catch (error) {
      console.error("Error saving product:", error);

      toast({
        title: "Error",
        description: `Failed to save changes: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Discontinued", label: "Discontinued" },
    { value: "Out of Stock", label: "Out of Stock" },
  ];

  const categoryOptions = [
    { value: "Phones", label: "Phones" },
    { value: "Tabs", label: "Tabs" },
    { value: "Watches", label: "Watches" },
    { value: "Earbuds", label: "Earbuds" },
    { value: "Others", label: "Others" },
  ];

  const stockOptions = useMemo(() => {
    return [
      { value: "lessThan10", label: "Less than 10 units" },
      { value: "lessThan20", label: "Less than 20 units" },
      { value: "lessThan50", label: "Less than 50 units" },
      { value: "moreThan50", label: "More than 50 units" },
    ];
  }, []);

  // Apply filters to products
  const filteredAndSortedProducts = useMemo(() => {
    // First, filter the products
    const filteredProducts = product.filter((item) => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "" || item.category === selectedCategory;

      // Stock filter
      let matchesStock = true;
      if (selectedStock === "lessThan10")
        matchesStock = (item.currentStock || 0) < 10;
      if (selectedStock === "lessThan20")
        matchesStock = (item.currentStock || 0) < 20;
      if (selectedStock === "lessThan50")
        matchesStock = (item.currentStock || 0) < 50;
      if (selectedStock === "moreThan50")
        matchesStock = (item.currentStock || 0) >= 50;

      // Status filter
      const matchesStatus =
        selectedStatus === "" || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStock && matchesStatus;
    });

    // Then, sort the filtered products
    return [...filteredProducts].sort((a, b) => {
      switch (sortOption) {
        case "Name (A-Z)":
          return (a.productName || a.name || "").localeCompare(
            b.productName || b.name || ""
          );
        case "Name (Z-A)":
          return (b.productName || b.name || "").localeCompare(
            a.productName || a.name || ""
          );
        case "Stock (Low to High)":
          return (a.currentStock || 0) - (b.currentStock || 0);
        case "Stock (High to Low)":
          return (b.currentStock || 0) - (a.currentStock || 0);
        case "Price (Low to High)":
          return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        case "Price (High to Low)":
          return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        default:
          return 0;
      }
    });
  }, [
    product,
    searchQuery,
    selectedCategory,
    selectedStock,
    selectedStatus,
    sortOption,
  ]);

  const handleNextImage = () => {
    if (selectedInventory?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex + 1 < selectedInventory.images.length ? prevIndex + 1 : 0
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedInventory?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex - 1 >= 0 ? prevIndex - 1 : selectedInventory.images.length - 1
      );
    }
  };

  const handleProductSelect = (item) => {
    handleRowClick(item);
    setIsMobileDetailsOpen(true);
    setIsEditing(false);
    setCurrentImageIndex(0);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStock("");
    setSelectedStatus("");
    setSortOption("Name (A-Z)");
  };

  // Close product details panel
  const closeProductDetails = () => {
    setShowDetails(false);
    setIsMobileDetailsOpen(false);
    setSelectedInventory(null);
    setIsEditing(false);
    setDeleteConfirmOpen(false);
  };

  const handleRefresh = () => {
    refreshInventory();
    toast({
      title: "Refreshing",
      description: "Updating inventory data...",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (!editedInventory) {
      setEditedInventory({
        ...selectedInventory,
        [name]: value,
      });
      return;
    }

    const updatedInventory = { ...editedInventory };

    updatedInventory[name] = value;

    switch (name) {
      case "sellingPrice":
        updatedInventory.sellingPrice = value;
        updatedInventory.sellingPrice = parseFloat(value);
        break;

      case "costPrice":
        updatedInventory.costPrice = isNaN(parseFloat(value))
          ? 0
          : parseFloat(value);
        break;

      // Stock fields
      case "reorder_point":
        updatedInventory.reorderPoint = value;
        break;
      case "reorder_quantity":
        updatedInventory.reorderQuantity = value;
        break;
      case "lead_time_days":
        updatedInventory.leadTimeDays = value;
        break;

      // Location fields
      case "storage_location":
        updatedInventory.storageLocation = value;
        break;

      // Weight fields
      case "weight":
        updatedInventory.weightKg = value;
        break;

      // Any other special mappings can go here
    }

    // Update state with the modified inventory
    setEditedInventory(updatedInventory);

    console.log(`Updated ${name} to:`, value);
  };

  const getStockLevelColor = (stockLevel) => {
    if (stockLevel <= 0) return "text-red-600 font-bold";
    if (stockLevel < 10) return "text-orange-500 font-medium";
    if (stockLevel < 20) return "text-yellow-600";
    return "text-green-600";
  };

  const calculateProfit = (sellingPrice, cost) => {
    const price = parseFloat(sellingPrice);
    const costValue = parseFloat(cost);

    if (isNaN(price) || isNaN(costValue)) {
      return null;
    }
    return price - costValue;
  };

  const calculateMargin = (sellingPrice, cost) => {
    const price = parseFloat(sellingPrice);
    const costValue = parseFloat(cost);

    if (isNaN(price) || isNaN(costValue) || price === 0) {
      return null;
    }
    return ((price - costValue) / price) * 100;
  };

  const formatPrice = (price, currencyCode = "£") => {
    if (price === undefined || price === null || isNaN(parseFloat(price)))
      return "-";
    return `${currencyCode}${parseFloat(price).toFixed(2)}`;
  };

  // Loading state
  if (loading && product.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && product.length === 0) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading product data: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          <RotateCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  // Get display name for product
  const getProductName = (item) => {
    return item.productName || item.name || "Unnamed Product";
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Inventory Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {filteredAndSortedProducts.length} products found
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-1" />
              )}
              Refresh
            </Button>
            <Button
              className="text-sm whitespace-nowrap"
              onClick={() => navigate("../createProducts")}
            >
              <Plus className="w-4 h-4 mr-1" /> Add product
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or ..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick filters */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="text-sm text-gray-500 font-medium">Filters:</div>
          <select
            className="px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            className="text-sm flex items-center"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Advanced{" "}
            {isFilterOpen ? (
              <ChevronDown className="ml-1 w-4 h-4" />
            ) : (
              <ChevronRight className="ml-1 w-4 h-4" />
            )}
          </Button>

          {(searchQuery ||
            selectedCategory ||
            selectedStatus ||
            selectedStock ||
            sortOption !== "Name (A-Z)") && ( // Change the default sort option condition
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                closeProductDetails();
                resetFilters();
                setSortOption("Name (A-Z)"); // Reset to default sort
              }}
              className="text-blue-500 hover:text-blue-700"
            >
              <XIcon className="h-3 w-3 mr-1" /> Clear all
            </Button>
          )}
        </div>

        {/* Advanced filters */}
        {isFilterOpen && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Level
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                  >
                    <option value="">All Stock Levels</option>
                    {stockOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Sort By:
                  </label>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Name (A-Z)">Name (A-Z)</SelectItem>
                      <SelectItem value="Name (Z-A)">Name (Z-A)</SelectItem>
                      <SelectItem value="Stock (Low to High)">
                        Stock (Low to High)
                      </SelectItem>
                      <SelectItem value="Stock (High to Low)">
                        Stock (High to Low)
                      </SelectItem>
                      <SelectItem value="Price (Low to High)">
                        Price (Low to High)
                      </SelectItem>
                      <SelectItem value="Price (High to Low)">
                        Price (High to Low)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table Card */}
        <Card className="mb-4 border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-220px)] w-full">
              <div className="overflow-x-auto touch-pan-x scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Info
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedProducts.length > 0 ? (
                      filteredAndSortedProducts.map((item, index) => (
                        <tr
                          key={item.id || index}
                          className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedInventory &&
                            selectedInventory.id === item.id
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => handleProductSelect(item)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-12 h-12 relative rounded overflow-hidden border border-gray-200">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt={getProductName(item)}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">
                                    No img
                                  </span>
                                </div>
                              )}
                              {item.images && item.images.length > 1 && (
                                <div className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl">
                                  +{item.images.length - 1}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {getProductName(item)}
                            </div>
                            {item.sku && (
                              <div className="text-xs text-gray-500">
                                SKU: {item.sku}
                              </div>
                            )}
                            {item.status && (
                              <Badge
                                variant="outline"
                                className={`mt-1 ${
                                  item.status === "Active"
                                    ? "bg-green-50 text-green-700"
                                    : item.status === "Inactive"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-yellow-50 text-yellow-700"
                                }`}
                              >
                                {item.status}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(item.sellingPrice || item.costPrice)}
                            </div>
                            {item.costPrice && (
                              <div className="text-xs text-green-600">
                                Profit: £{" "}
                                {calculateProfit(
                                  item.sellingPrice || item.costprice,
                                  item.costPrice
                                )}{" "}
                                / Pc
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.category ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {item.category}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No category
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div
                              className={getStockLevelColor(
                                item.currentStock || 0
                              )}
                            >
                              {item.currentStock || 0} units
                            </div>
                            {(item.currentStock || 0) <
                              (item.reorder_point || 10) && (
                              <div className="text-xs text-red-500 font-medium">
                                Low stock
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center py-6">
                            <Search className="h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-gray-500 mb-2">
                              No products found matching your filters.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                resetFilters();
                              }}
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {loading && product.length > 0 && (
                      <tr className="border-t border-gray-200 bg-gray-50 h-12">
                        <td colSpan={6} className="text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Product Details Section for Mobile - Appears as a modal */}
        {showDetails && selectedInventory && isMobileDetailsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center lg:hidden">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[70vh] overflow-auto m-4">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-medium">Product Details</h2>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(true);
                        setEditedInventory({ ...selectedInventory });
                      }}
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveChanges}
                      className="flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMobileDetailsOpen(false);
                      setIsEditing(false);
                    }}
                    className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
                    disabled={isSubmitting}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                {/* Product Image */}
                <div className="mb-6">
                  <div className="w-full h-56 flex items-center justify-center rounded-lg border border-gray-200 overflow-hidden bg-gray-100 mb-2">
                    {selectedInventory.images &&
                    selectedInventory.images.length > 0 ? (
                      <img
                        src={selectedInventory.images[currentImageIndex]}
                        alt={getProductName(selectedInventory)}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="mb-2">No image available</div>
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-500 border-blue-300"
                            onClick={() =>
                              document
                                .getElementById("mobile-image-upload-input")
                                .click()
                            }
                          >
                            <Upload className="h-4 w-4 mr-1" /> Upload Image
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Image navigation */}
                  {selectedInventory.images &&
                    selectedInventory.images.length > 1 && (
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevImage}
                          disabled={isSubmitting}
                        >
                          <ArrowBigLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm text-gray-500">
                          {currentImageIndex + 1}/
                          {selectedInventory.images.length}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextImage}
                          disabled={isSubmitting}
                        >
                          <ArrowBigRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                  {/* Image upload section - only visible in edit mode */}
                  {isEditing && (
                    <div className="space-y-3 mt-3">
                      {/* Upload button */}
                      <label className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                        <Upload className="h-4 w-4" />
                        {selectedInventory.images &&
                        selectedInventory.images.length > 0
                          ? "Add more images"
                          : "Upload product images"}
                        <input
                          id="mobile-image-upload-input"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageSelect}
                          disabled={isSubmitting}
                        />
                      </label>

                      {/* New images preview */}
                      {newImages.length > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-gray-500">New Images</p>
                            <p className="text-xs text-blue-500">
                              {newImages.length} new file(s)
                            </p>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {newImages.map((img, idx) => (
                              <div
                                key={`new-${idx}`}
                                className="relative group"
                              >
                                <div className="w-full h-16 border rounded-md overflow-hidden">
                                  <img
                                    src={img.preview}
                                    alt={`New image ${idx + 1}`}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveImage(idx, true)}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Existing images management */}
                      {selectedInventory.images &&
                        selectedInventory.images.length > 0 &&
                        editedInventory?.images?.length > 0 && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-xs text-gray-500">
                                Current Images
                              </p>
                              <p className="text-xs text-gray-500">
                                {editedInventory.images.length} images
                              </p>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {editedInventory.images.map((img, idx) => (
                                <div
                                  key={`existing-${idx}`}
                                  className="relative group"
                                >
                                  <div
                                    className={`w-full h-16 border rounded-md overflow-hidden ${
                                      idx === currentImageIndex
                                        ? "ring-2 ring-blue-500"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={img}
                                      alt={`Image ${idx + 1}`}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      handleRemoveImage(idx, false)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Upload progress bar */}
                      {isUploading && (
                        <div className="mt-2">
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
                  )}
                </div>

                {/* Product Details for Mobile */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="productName"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                      value={
                        isEditing
                          ? editedInventory?.productName ||
                            editedInventory?.name ||
                            ""
                          : getProductName(selectedInventory)
                      }
                      onChange={handleEditChange}
                      readOnly={!isEditing}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={
                          isEditing
                            ? editedInventory?.category || ""
                            : selectedInventory.category || ""
                        }
                        onChange={handleEditChange}
                        disabled={!isEditing || isSubmitting}
                      >
                        <option value="">No Category</option>
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="currentStock"
                        className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm ${
                          !isEditing
                            ? getStockLevelColor(
                                selectedInventory.currentStock || 0
                              )
                            : ""
                        }`}
                        value={
                          isEditing
                            ? editedInventory?.currentStock || 0
                            : selectedInventory.currentStock || 0
                        }
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        disabled={isSubmitting}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        name="sellingPrice"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={
                          isEditing
                            ? editedInventory?.sellingPrice ||
                              editedInventory?.sellingPrice ||
                              ""
                            : selectedInventory.sellingPrice ||
                              selectedInventory.sellingPrice ||
                              ""
                        }
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        disabled={isSubmitting}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Cost
                      </label>
                      <input
                        type="number"
                        name="costPrice"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={
                          isEditing
                            ? editedInventory?.costPrice || ""
                            : selectedInventory.costPrice || ""
                        }
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        disabled={isSubmitting}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {(isEditing ||
                    (selectedInventory.sellingPrice &&
                      selectedInventory.costPrice)) && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Profit Margin
                      </label>
                      <div className="flex items-center">
                        <div
                          className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm ${
                            !isEditing ? "bg-gray-50" : ""
                          }`}
                        >
                          {isEditing
                            ? calculateMargin(
                                editedInventory?.sellingPrice ||
                                  editedInventory?.sellingPrice,
                                editedInventory?.costPrice
                              )?.toFixed(2)
                            : calculateMargin(
                                selectedInventory.sellingPrice ||
                                  selectedInventory.sellingPrice,
                                selectedInventory.costPrice
                              )?.toFixed(2)}
                          %
                        </div>
                        <span className="ml-2 text-sm text-green-600">
                          {isEditing
                            ? formatPrice(
                                calculateProfit(
                                  editedInventory?.sellingPrice ||
                                    editedInventory?.sellingPrice,
                                  editedInventory?.costPrice
                                )
                              )
                            : formatPrice(
                                calculateProfit(
                                  selectedInventory.sellingPrice ||
                                    selectedInventory.sellingPrice,
                                  selectedInventory.costPrice
                                )
                              )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={
                          isEditing
                            ? editedInventory?.status || ""
                            : selectedInventory.status || ""
                        }
                        onChange={handleEditChange}
                        disabled={!isEditing || isSubmitting}
                      >
                        <option value="">Select Status</option>
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={
                          isEditing
                            ? editedInventory?.sku || ""
                            : selectedInventory.sku || ""
                        }
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Reorder Point
                      </label>
                      <input
                        type="number"
                        name="reorder_point"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={
                          isEditing
                            ? editedInventory?.reorder_point || ""
                            : selectedInventory.reorder_point || ""
                        }
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        disabled={isSubmitting}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Reorder Quantity
                      </label>
                      <input
                        type="number"
                        name="reorder_quantity"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={
                          isEditing
                            ? editedInventory?.reorder_quantity || ""
                            : selectedInventory.reorder_quantity || ""
                        }
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        disabled={isSubmitting}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`../editProduct/${selectedInventory.id}`)
                      }
                      className="flex items-center gap-1"
                      disabled={isSubmitting}
                    >
                      <Settings className="h-4 w-4" /> Advanced edit
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedInventory({ ...selectedInventory });
                      }}
                      className="flex items-center gap-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}

                  {!isEditing && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  )}
                </div>

                {/* Delete confirmation for mobile */}
                {deleteConfirmOpen && (
                  <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
                    <h4 className="text-lg font-medium text-red-700 mb-2">
                      Confirm Deletion
                    </h4>
                    <p className="text-sm text-red-600 mb-4">
                      Are you sure you want to delete "
                      {getProductName(selectedInventory)}"? This action cannot
                      be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirmOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteProduct}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete Product
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/*  For Desktop View */}
      {showDetails && selectedInventory && (
        <div className="hidden lg:block w-96 bg-white border-l border-gray-200 overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">Product Details
              <h2 className="text-lg font-medium"></h2>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveChanges}
                    className="flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeProductDetails}
                  className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product Image */}
            <div className="mb-6">
              <div className="w-full h-56 flex items-center justify-center rounded-2xl border border-gray-200 overflow-hidden bg-gray-100 mb-2">
                {selectedInventory.images &&
                selectedInventory.images.length > 0 ? (
                  <img
                    src={selectedInventory.images[currentImageIndex]}
                    alt={getProductName(selectedInventory)}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="mb-2">No image available</div>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-500 border-blue-300"
                        onClick={() =>
                          document.getElementById("image-upload-input").click()
                        }
                      >
                        <Upload className="h-4 w-4 mr-1" /> Upload Image
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Image navigation */}
              {selectedInventory.images &&
                selectedInventory.images.length > 1 && (
                  <div className="flex justify-between items-center gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevImage}
                      disabled={isSubmitting}
                    >
                      <ArrowBigLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm text-gray-500">
                      {currentImageIndex + 1}/{selectedInventory.images.length}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextImage}
                      disabled={isSubmitting}
                    >
                      <ArrowBigRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

              {/* Image upload section - only visible in edit mode */}
              {isEditing && (
                <div className="space-y-3 mt-3">
                  {/* Upload button */}
                  <label className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                    <Upload className="h-4 w-4" />
                    {selectedInventory.images &&
                    selectedInventory.images.length > 0
                      ? "Add more images"
                      : "Upload product images"}
                    <input
                      id="image-upload-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                      disabled={isSubmitting}
                    />
                  </label>

                  {/* New images preview */}
                  {newImages.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-500">New Images</p>
                        <p className="text-xs text-blue-500">
                          {newImages.length} new file(s)
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {newImages.map((img, idx) => (
                          <div key={`new-${idx}`} className="relative group">
                            <div className="w-full h-16 border rounded-md overflow-hidden">
                              <img
                                src={img.preview}
                                alt={`New image ${idx + 1}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <button
                              type="button"
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(idx, true)}
                              disabled={isSubmitting}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing images management */}
                  {selectedInventory.images &&
                    selectedInventory.images.length > 0 &&
                    editedInventory?.images?.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs text-gray-500">
                            Current Images
                          </p>
                          <p className="text-xs text-gray-500">
                            {editedInventory.images.length} images
                          </p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {editedInventory.images.map((img, idx) => (
                            <div
                              key={`existing-${idx}`}
                              className="relative group"
                            >
                              <div
                                className={`w-full h-16 border rounded-md overflow-hidden ${
                                  idx === currentImageIndex
                                    ? "ring-2 ring-blue-500"
                                    : ""
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`Image ${idx + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <button
                                type="button"
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(idx, false)}
                                disabled={isSubmitting}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Upload progress bar */}
                  {isUploading && (
                    <div className="mt-2">
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
              )}
            </div>

            {/* Product Details - Desktop */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                  value={
                    isEditing
                      ? editedInventory?.productName ||
                        editedInventory?.name ||
                        ""
                      : getProductName(selectedInventory)
                  }
                  onChange={handleEditChange}
                  readOnly={!isEditing}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={
                      isEditing
                        ? editedInventory?.category || ""
                        : selectedInventory.category || ""
                    }
                    onChange={handleEditChange}
                    disabled={!isEditing || isSubmitting}
                  >
                    <option value="">No Category</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="currentStock"
                    className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm ${
                      !isEditing
                        ? getStockLevelColor(
                            selectedInventory.currentStock || 0
                          )
                        : ""
                    }`}
                    value={
                      isEditing
                        ? editedInventory?.currentStock || 0
                        : selectedInventory.currentStock || 0
                    }
                    onChange={handleEditChange}
                    readOnly={!isEditing}
                    disabled={isSubmitting}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={
                      isEditing
                        ? editedInventory?.sellingPrice || ""
                        : selectedInventory.sellingPrice || ""
                    }
                    onChange={handleEditChange}
                    readOnly={!isEditing}
                    disabled={isSubmitting}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Cost
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={
                      isEditing
                        ? editedInventory?.costPrice || ""
                        : selectedInventory.costPrice || ""
                    }
                    onChange={handleEditChange}
                    readOnly={!isEditing}
                    disabled={isSubmitting}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {(isEditing ||
                (selectedInventory.sellingPrice &&
                  selectedInventory.costPrice)) && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Profit Margin
                  </label>
                  <div className="flex items-center">
                    <div
                      className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm ${
                        !isEditing ? "bg-gray-50" : ""
                      }`}
                    >
                      {isEditing
                        ? calculateMargin(
                            editedInventory?.sellingPrice ||
                              editedInventory?.sellingPrice,
                            editedInventory?.costPrice
                          )?.toFixed(2)
                        : calculateMargin(
                            selectedInventory.sellingPrice ||
                              selectedInventory.sellingPrice,
                            selectedInventory.costPrice
                          )?.toFixed(2)}
                      %
                    </div>
                    <span className="ml-2 text-sm text-green-600">
                      {isEditing
                        ? formatPrice(
                            calculateProfit(
                              editedInventory?.sellingPrice ||
                                editedInventory?.sellingPrice,
                              editedInventory?.costPrice
                            )
                          )
                        : formatPrice(
                            calculateProfit(
                              selectedInventory.sellingPrice ||
                                selectedInventory.sellingPrice,
                              selectedInventory.costPrice
                            )
                          )}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={
                      isEditing
                        ? editedInventory?.status || ""
                        : selectedInventory.status || ""
                    }
                    onChange={handleEditChange}
                    disabled={!isEditing || isSubmitting}
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    name="reorder_point"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={
                      isEditing
                        ? editedInventory?.reorderPoint || ""
                        : selectedInventory.reorderPoint || ""
                    }
                    onChange={handleEditChange}
                    readOnly={!isEditing}
                    disabled={isSubmitting}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Reorder Quantity
                  </label>
                  <input
                    type="number"
                    name="reorder_quantity"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={
                      isEditing
                        ? editedInventory?.reorderQuantity || ""
                        : selectedInventory.reorderQuantity || ""
                    }
                    onChange={handleEditChange}
                    readOnly={!isEditing}
                    disabled={isSubmitting}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`../editProduct/${selectedInventory.id}`)
                  }
                  className="flex items-center gap-1"
                  disabled={isSubmitting}
                >
                  <Settings className="h-4 w-4" /> Advanced edit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedInventory({ ...selectedInventory });
                  }}
                  className="flex items-center gap-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}

              {!isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
            </div>

            {/* Delete confirmation */}
            {deleteConfirmOpen && (
              <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
                <h4 className="text-lg font-medium text-red-700 mb-2">
                  Confirm Deletion
                </h4>
                <p className="text-sm text-red-600 mb-4">
                  Are you sure you want to delete "
                  {getProductName(selectedInventory)}"? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteProduct}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete Product
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right sidebar statistics */}
      <div className="w-full lg:w-64 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 lg:p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 lg:mb-6">
          INVENTORY OVERVIEW
        </h2>

        <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-6">
          <Card className="shadow-none border border-gray-300 rounded-2xl">
            <CardContent className="p-4 text-center lg:text-left">
              <div className="text-sm text-gray-500 mb-1">Total Products</div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                {product.length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-gray-300 rounded-2xl">
            <CardContent className="p-4 text-center lg:text-left">
              <div className="text-sm text-gray-500 mb-1">Low Stock</div>
              <div className="text-2xl lg:text-3xl font-bold text-orange-500">
                {
                  product.filter(
                    (item) =>
                      (item.currentStock || 0) < (item.reorder_point || 10)
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border border-gray-300 rounded-2xl">
            <CardContent className="p-4 text-center lg:text-left">
              <div className="text-sm text-gray-500 mb-1">Out of Stock</div>
              <div className="text-2xl lg:text-3xl font-bold text-red-500">
                {product.filter((item) => (item.currentStock || 0) <= 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 shadow-none border border-gray-300 rounded-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 mt-2">
              {categoryOptions.slice(0, 5).map((category) => {
                const count = product.filter(
                  (item) => item.category === category.value
                ).length;
                const percentage =
                  Math.round((count / product.length) * 100) || 0;

                return (
                  <div key={category.value} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>{category.label}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full mt-6 text-sm"
          onClick={() => navigate("../reports")}
        >
          View Complete Reports
        </Button>
      </div>
    </div>
  );
};

export default ViewInventory;
