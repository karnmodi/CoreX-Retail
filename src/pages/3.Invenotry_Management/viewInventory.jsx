import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import FloatingLabelInput from "@/components/small/FloatingLabelInput";

const ViewInventory = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(false);
        // setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle row selection
  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  // Get group badge style based on group type
  const getGroupBadgeVariant = (group) => {
    switch (group) {
      case "A":
        return "success";
      case "B":
        return "info";
      case "C":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <Button className="text-sm"> + Add product</Button>
        </div>

        {/* Search and filters */}
        <div className="flex gap-3 mb-4">
          <div className="w-48">
            <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
              <option>Category: Cosmetics</option>
            </select>
          </div>
          <div className="w-48">
            <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
              <option>Brand: Elizavecca</option>
            </select>
          </div>
          <div className="flex-grow relative">
            <FloatingLabelInput
              type="text"
              label="Quick Search"
              className="w-full"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <Card className="mb-6">
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center text-gray-500 text-sm">
              <span>IN STOCK</span>
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="w-16">SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-24">Group</TableHead>
                    <TableHead className="w-28">Collection</TableHead>
                    <TableHead className="w-24">Price</TableHead>
                    <TableHead className="w-24">Stock</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading inventory...
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No products found. Add some to get started.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>

          {/* Product Details Section */}
          {showDetails && selectedProduct && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex space-x-6">
                {/* Product Image */}
                <div className="w-40">
                  <div className="w-full h-40 bg-gray-100 rounded-md border border-gray-200 overflow-hidden mb-2">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">1 of 3</div>
                  <button className="text-xs text-gray-500 flex items-center">
                    + Add image
                  </button>
                </div>

                {/* Product Details Grid */}
                <div className="flex-1 grid grid-cols-3 gap-6">
                  {/* Column 1 */}
                  <div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">
                        Display Name
                      </div>
                      <div className="text-sm border-b border-gray-200 pb-1">
                        {selectedProduct.displayName}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">SKU</div>
                      <div className="text-sm border-b border-gray-200 pb-1">
                        {selectedProduct.sku}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Brand</div>
                      <div className="text-sm border-b border-gray-200 pb-1 flex justify-between">
                        <span>{selectedProduct.brand}</span>
                        <span>▼</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Stock</div>
                      <div className="text-sm border-b border-gray-200 pb-1">
                        {selectedProduct.stock}
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Price</div>
                      <div className="text-sm border-b border-gray-200 pb-1 flex justify-between">
                        <span>{selectedProduct.price}</span>
                        <span className="text-green-500">
                          {selectedProduct.profit}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Barcode</div>
                      <div className="text-sm border-b border-gray-200 pb-1">
                        {selectedProduct.barcode}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Vendor</div>
                      <div className="text-sm border-b border-gray-200 pb-1 flex justify-between">
                        <span>{selectedProduct.vendor}</span>
                        <span>▼</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Size</div>
                      <div className="text-sm border-b border-gray-200 pb-1">
                        {selectedProduct.size}
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">
                        Collection
                      </div>
                      <div className="text-sm border-b border-gray-200 pb-1">
                        {selectedProduct.collection}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Cost</div>
                      <div className="text-sm border-b border-gray-200 pb-1">
                        {selectedProduct.cost}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Exp Date</div>
                      <div className="text-sm border-b border-gray-200 pb-1">
                        {selectedProduct.expDate}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Reserved</div>
                      <div className="text-sm border-b border-gray-200 pb-1 text-red-500">
                        {selectedProduct.reserved}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.tags &&
                    selectedProduct.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Advanced Edit Button */}
              <div className="mt-6 flex justify-between items-center">
                <button className="text-sm text-gray-500 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Advanced edit
                </button>
                <div className="text-sm text-gray-400">AUTOMATICALLY SAVED</div>
              </div>
            </div>
          )}
        </Card>

        {/* Bottom buttons */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            DELETE
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            BULK EDIT
          </Button>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
          OVERVIEW
        </h2>

        <div className="space-y-8">
          <div>
            <div className="text-sm text-gray-500 mb-1">SKU Total</div>
            <div className="text-3xl font-bold text-gray-900">12,039</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Products Reserved</div>
            <div className="text-3xl font-bold text-gray-900">234</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Stock Issues</div>
            <div className="text-3xl font-bold text-red-500">2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInventory;
