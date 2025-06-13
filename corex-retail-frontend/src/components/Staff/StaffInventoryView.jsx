import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Package,
  AlertTriangle,
  Search,
  Eye,
  Package2,
  TrendingDown,
  Warehouse,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useInventory } from "../../configs/InventoryContext";

const StaffInventoryView = ({ onNavigate }) => {
  const {
    product,
    lowStockProducts,
    fetchLowStockProducts,
    formatCurrency,
    loading,
    refreshInventory,
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredLowStock, setFilteredLowStock] = useState([]);

  // Update filtered products when search term or products change
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(product?.slice(0, 10) || []);
      setFilteredLowStock(lowStockProducts || []);
      return;
    }

    const searchLower = searchTerm.toLowerCase();

    const filtered =
      product
        ?.filter(
          (item) =>
            item.productName?.toLowerCase().includes(searchLower) ||
            item.category?.toLowerCase().includes(searchLower) ||
            item.barcode?.toLowerCase().includes(searchLower)
        )
        .slice(0, 10) || [];

    const filteredLow =
      lowStockProducts?.filter(
        (item) =>
          item.productName?.toLowerCase().includes(searchLower) ||
          item.category?.toLowerCase().includes(searchLower) ||
          item.barcode?.toLowerCase().includes(searchLower)
      ) || [];

    setFilteredProducts(filtered);
    setFilteredLowStock(filteredLow);
  }, [searchTerm, product, lowStockProducts]);

  // Get stock status
  const getStockStatus = (currentStock, reorderPoint) => {
    if (currentStock <= 0) {
      return { status: "out", color: "red", text: "Out of Stock" };
    } else if (currentStock <= reorderPoint) {
      return { status: "low", color: "orange", text: "Low Stock" };
    } else if (currentStock <= reorderPoint * 2) {
      return { status: "medium", color: "yellow", text: "Medium Stock" };
    } else {
      return { status: "good", color: "green", text: "Good Stock" };
    }
  };

  // Calculate inventory stats
  const inventoryStats = {
    totalProducts: product?.length || 0,
    lowStockCount: lowStockProducts?.length || 0,
    outOfStockCount: product?.filter((p) => p.currentStock <= 0).length || 0,
    totalValue:
      product?.reduce((sum, p) => sum + p.sellingPrice * p.currentStock, 0) ||
      0,
  };

  return (
    <div className="space-y-4">
      {/* Inventory Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {inventoryStats.totalProducts}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Low Stock Items
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {inventoryStats.lowStockCount}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {inventoryStats.outOfStockCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(inventoryStats.totalValue)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {filteredLowStock.length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-700">
          <CardHeader className="pb-3 bg-orange-50 dark:bg-orange-900/20">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {filteredLowStock.slice(0, 5).map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                      <Package2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.category} • Current: {item.currentStock} • Min:{" "}
                        {item.reorderPoint}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-800 border-orange-300"
                  >
                    {item.currentStock} left
                  </Badge>
                </div>
              ))}
              {filteredLowStock.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => onNavigate("./inventory/low-stock")}
                >
                  View All Low Stock Items ({filteredLowStock.length} total)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Search and List */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              Inventory Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshInventory}
                disabled={loading}
                >
                Refresh Inventory &nbsp;
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                /> 
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLowStockProducts}
                disabled={loading}
                >
                Check Low Stock &nbsp;
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                /> 
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products by name, category, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Product List */}
          {filteredProducts.length > 0 ? (
            <div className="space-y-3">
              {filteredProducts.map((item, index) => {
                const stockStatus = getStockStatus(
                  item.currentStock,
                  item.reorderPoint
                );

                return (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {item.productName}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{formatCurrency(item.sellingPrice)}</span>
                          {item.barcode && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-xs">
                                {item.barcode}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          Stock: {item.currentStock}
                        </p>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              stockStatus.color === "red"
                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
                                : stockStatus.color === "orange"
                                ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700"
                                : stockStatus.color === "yellow"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700"
                                : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                            }
                          `}
                        >
                          {stockStatus.text}
                        </Badge>
                      </div>
                      <div>
                        <p className="ml-5 font-medium text-slate-900 dark:text-slate-100">
                          Shelve: {item.storageLocation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {product && product.length > 10 && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => onNavigate("./inventory/view")}
                >
                  View All Products ({product.length} total)
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                {searchTerm ? "No products found" : "No inventory data"}
              </h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                {searchTerm
                  ? `No products match "${searchTerm}". Try a different search term.`
                  : "Inventory data is not available or still loading."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default StaffInventoryView;
