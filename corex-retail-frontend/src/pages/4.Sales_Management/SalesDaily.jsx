import React, { useEffect, useState, useCallback, useRef } from "react";
import { SalesDailyTable } from "@/components/SalesDailyTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { SalesHeader } from "../../components/SalesHeader";
import { useSales } from "../../configs/SalesContext";
import { format } from "date-fns";

function SalesDaily() {
  const {
    loadSalesForDate,
    loadSalesByDate,
    selectedDateSales,
    loading,
    error,
  } = useSales();

  // State for the current date
  const [currentDate, setCurrentDate] = useState(() => {
    return format(new Date(), "yyyy-MM-dd");
  });

  // State for search term
  const [searchTerm, setSearchTerm] = useState("");

  // State for filtered sales
  const [filteredSales, setFilteredSales] = useState([]);

  // Refs to prevent duplicate fetches
  const isMounted = useRef(false);
  const fetchedDates = useRef(new Set());
  const isDateChanging = useRef(false);

  // Load sales data for current date only once
  useEffect(() => {
    // Skip if already loading or if we've already fetched this date
    if (
      isDateChanging.current ||
      loading.salesForDate ||
      fetchedDates.current.has(currentDate)
    ) {
      return;
    }

    const fetchData = async () => {
      console.log(`Fetching sales data for ${currentDate} (first time)`);
      isDateChanging.current = true;
      fetchedDates.current.add(currentDate);

      try {
        await loadSalesForDate(currentDate);
      } catch (err) {
        console.error("Error loading sales:", err);
      } finally {
        isDateChanging.current = false;
      }
    };

    fetchData();
  }, [currentDate, loadSalesForDate, loading.salesForDate]);

  // Initial setup - run only once
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      // Initialization logic here if needed
    }

    // Cleanup function
    return () => {
      // Reset on unmount
      fetchedDates.current.clear();
    };
  }, []);

  // Handle date range selection from header
  const handleDateRangeChange = useCallback(
    (dateRange) => {
      // Don't process if already loading or changing date
      if (isDateChanging.current) return;

      console.log("Date range changed:", dateRange);

      if (dateRange.to) {
        // Only update if it's a new date we haven't fetched
        if (dateRange.to !== currentDate) {
          setCurrentDate(dateRange.to);
        }
      }

      // Optional: Load date range data if needed (for reporting)
      if (dateRange.from && dateRange.to && dateRange.from !== dateRange.to) {
        loadSalesByDate({
          startDate: dateRange.from,
          endDate: dateRange.to,
        }).catch((err) => {
          console.error("Error loading date range:", err);
        });
      }
    },
    [currentDate, loadSalesByDate]
  );

  // Handle search term changes
  const handleSearchChange = useCallback(
    (term) => {
      setSearchTerm(term);

      // Filter the sales based on search term
      if (selectedDateSales?.sales) {
        if (!term.trim()) {
          setFilteredSales(selectedDateSales.sales);
        } else {
          const lowercaseTerm = term.toLowerCase().trim();
          const filtered = selectedDateSales.sales.filter((sale) => {
            return (
              (sale.productName &&
                sale.productName.toLowerCase().includes(lowercaseTerm)) ||
              (sale.unitPrice &&
                sale.unitPrice.toString().includes(lowercaseTerm)) ||
              (sale.quantity &&
                sale.quantity.toString().includes(lowercaseTerm)) ||
              (sale.totalAmount &&
                sale.totalAmount.toString().includes(lowercaseTerm)) || 
              (sale.invoiceNumber &&
                sale.invoiceNumber.toLowerCase().includes(lowercaseTerm)) ||
              (sale.paymentMethod &&
                sale.paymentMethod.toLowerCase().includes(lowercaseTerm))
            );
          });

          setFilteredSales(filtered);
        }
      }
    },
    [selectedDateSales]
  );

  // Handle export functionality
  const handleExport = useCallback(() => {
    if (!selectedDateSales?.sales || selectedDateSales.sales.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Date", "Product", "Price", "Quantity", "Total"];
    const rows = selectedDateSales.sales.map((sale) => [
      selectedDateSales.date || "N/A",
      sale.productName || "N/A",
      sale.unitPrice || 0,
      sale.quantity || 0,
      sale.totalAmount || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_${currentDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [currentDate, selectedDateSales]);

  // Update filtered sales when selected date sales change
  useEffect(() => {
    if (selectedDateSales?.sales) {
      if (searchTerm) {
        handleSearchChange(searchTerm);
      } else {
        setFilteredSales(selectedDateSales.sales);
      }
    } else {
      setFilteredSales([]);
    }
  }, [selectedDateSales, searchTerm, handleSearchChange]);

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return format(date, "MMMM d, yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col">
      <SalesHeader
        title="Daily Sales"
        description="View and manage your daily sales records"
        onDateChange={handleDateRangeChange}
        onSearchChange={handleSearchChange}
        onExport={handleExport}
        initialDateRange={{
          from: currentDate,
          to: currentDate,
        }}
        initialSearchTerm={searchTerm}
      />

      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">
            Sales Records for {formatDisplayDate(currentDate)}
          </h2>
          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              Showing results for "{searchTerm}"
            </div>
          )}
        </div>

        {loading.salesForDate && !selectedDateSales ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today's Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £
                    {selectedDateSales?.totalAmount
                      ? selectedDateSales.totalAmount.toFixed(2)
                      : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedDateSales?.transactionCount || 0} transactions
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Units Sold Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedDateSales?.totalQuantity || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average:{" "}
                    {selectedDateSales?.totalQuantity &&
                    selectedDateSales?.transactionCount
                      ? (
                          selectedDateSales.totalQuantity /
                          selectedDateSales.transactionCount
                        ).toFixed(2)
                      : "0"}{" "}
                    per transaction
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Sold Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold line-clamp-1">
                    {selectedDateSales?.sales &&
                    selectedDateSales.sales.length > 0
                      ? selectedDateSales.sales.reduce(
                          (prev, current) => {
                            return (prev.quantity || 0) >
                              (current.quantity || 0)
                              ? prev
                              : current;
                          },
                          { quantity: 0 }
                        ).productName || "No sales"
                      : "No sales"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedDateSales?.sales &&
                    selectedDateSales.sales.length > 0
                      ? `${
                          selectedDateSales.sales.reduce(
                            (prev, current) => {
                              return (prev.quantity || 0) >
                                (current.quantity || 0)
                                ? prev
                                : current;
                            },
                            { quantity: 0 }
                          ).quantity || 0
                        } units`
                      : "0 units"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daily Sales Records</CardTitle>
                <CardDescription>
                  {searchTerm
                    ? `Filtered sales records matching "${searchTerm}" (${filteredSales.length} results)`
                    : `View and manage all sales records (${filteredSales.length})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <strong className="font-bold">Error loading data!</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div>
                ) : filteredSales.length > 0 ? (
                  <SalesDailyTable sales={filteredSales} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm
                      ? "No results match your search."
                      : "No sales records for this date."}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default SalesDaily;
