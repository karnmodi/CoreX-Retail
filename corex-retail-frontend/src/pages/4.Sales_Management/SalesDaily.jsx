import React, { useEffect, useState } from "react";
import { SalesDailyTable } from "@/components/SalesDailyTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { SalesHeader } from "../../components/SalesHeader";
import { useSales } from "../../configs/SalesContext";
import { format } from "date-fns";

function SalesDaily() {
  const { 
    loadSalesForDate, 
    selectedDateSales, 
    loading, 
    error,
    createSale
  } = useSales();
  
  const [currentDate, setCurrentDate] = useState(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });

  useEffect(() => {
    // Load sales for today when component mounts
    loadSalesForDate(currentDate);
  }, [loadSalesForDate, currentDate]);

  const handleAddSale = () => {
    // Implement modal or navigation to add sale form
    console.log("Add new sale");
    // Example:
    // setShowAddSaleModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>Error loading sales data: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <SalesHeader title="Daily Sales" description="View and manage your daily sales records" />

      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Sales Records for {currentDate}</h2>
          <Button onClick={handleAddSale}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Record
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{selectedDateSales?.totalAmount ? selectedDateSales.totalAmount.toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedDateSales?.transactionCount || 0} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Units Sold Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedDateSales?.totalQuantity || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Average: {selectedDateSales?.totalQuantity && selectedDateSales?.transactionCount ? 
                  (selectedDateSales.totalQuantity / selectedDateSales.transactionCount).toFixed(2) : 
                  "0"} per transaction
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Sold Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedDateSales?.sales && selectedDateSales.sales.length > 0 ? 
                  selectedDateSales.sales.reduce((prev, current) => {
                    return (prev.quantity > current.quantity) ? prev : current;
                  }, { quantity: 0 }).productName :
                  "No sales"
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedDateSales?.sales && selectedDateSales.sales.length > 0 ? 
                  `${selectedDateSales.sales.reduce((prev, current) => {
                    return (prev.quantity > current.quantity) ? prev : current;
                  }, { quantity: 0 }).quantity} units` :
                  "0 units"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Records</CardTitle>
            <CardDescription>View, filter, and manage all your sales records</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesDailyTable sales={selectedDateSales?.sales || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SalesDaily;