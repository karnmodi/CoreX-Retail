import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  Package,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Archive,
} from "lucide-react";
import { useInventory } from "../../configs/InventoryContext";
import { useToast } from "@/components/ui/use-toast";

const StockUpdateReminder = () => {
  const { lowStockProducts, fetchLowStockProducts, updateInventoryStock } =
    useInventory();

  const { toast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState(0);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const handleStockUpdate = async () => {
    if (!selectedProduct) return;

    try {
      const updatedProduct = await updateInventoryStock(selectedProduct.id, {
        stockQuantity: updateQuantity,
        action: "add",
      });

      setSelectedProduct(null);
      setUpdateQuantity(0);
    } catch (error) {}
  };

  const totalLowStockItems = lowStockProducts.length;
  const totalMissingStock = lowStockProducts.reduce(
    (total, product) => total + (10 - (product.currentStock || 0)),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 text-yellow-500" />
              Low Stock Reminder
            </CardTitle>
            <div className="grid grid-cols-2 md:flex md:space-x-4 gap-2 md:gap-0">
              <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-lg">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <span className="text-xs md:text-sm font-medium mr-1">
                    Low Stock
                  </span>
                  <span className="text-sm md:text-base font-bold text-blue-600">
                    {totalLowStockItems}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-lg">
                <Archive className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <span className="text-xs md:text-sm font-medium mr-1">
                    Missing Stock
                  </span>
                  <span className="text-sm md:text-base font-bold text-red-600">
                    {totalMissingStock} units
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <Package className="w-16 h-16 mb-4" />
              <p className="text-lg">No low stock products at the moment</p>
              <p className="text-sm">All products have sufficient inventory</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Product Name</th>
                    <th className="py-2 text-left">Current Stock</th>
                    <th className="py-2 text-left">Re order Point</th>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-left">Stock Trend</th>
                    <th className="py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => {
                    const stockNeeded = product.reorderPoint - (product.currentStock || 0);
                    return (
                      <tr key={product.id} className="border-b">
                        <td className="py-2">
                          {product.productName || product.name}
                        </td>
                        <td className="py-2">
                          <span
                            className={`font-bold ${
                              (product.currentStock || 0) < 5
                                ? "text-red-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {product.currentStock || 0}
                          </span>
                        </td>
                        <td className="py-2">{product.reorderPoint}</td>
                        <td className="py-2">{product.category}</td>
                        <td className="py-2">
                          <div className="flex items-center">
                            {stockNeeded > 0 ? (
                              <>
                                <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-sm text-red-500">
                                  {stockNeeded} units needed
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                                <span className="text-sm text-green-500">
                                  Sufficient
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setUpdateQuantity(stockNeeded);
                                }}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Restock
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-4xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Restock {product.productName || product.name}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Enter the quantity to add to current stock
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex items-center space-x-2 py-4">
                                <Input
                                  type="number"
                                  placeholder="Enter quantity"
                                  value={updateQuantity}
                                  onChange={(e) =>
                                    setUpdateQuantity(Number(e.target.value))
                                  }
                                  min="0"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleStockUpdate}
                                  disabled={updateQuantity <= 0}
                                >
                                  Restock
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockUpdateReminder;
