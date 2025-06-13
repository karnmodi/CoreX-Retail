import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentSales({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px] text-muted-foreground">
        No recent sales to display
      </div>
    );
  }

  const displayData = data;

  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      let date;

      if (typeof dateString === "object" && dateString._seconds) {
        date = new Date(dateString._seconds * 1000);
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(date);

    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Date error";
    }
  };

  return (
    <div className="space-y-8">
      {displayData.map((sale) => {
        const productNameParts = (sale.productName || "Product").split(" ");
        const initials =
          productNameParts.length > 1
            ? `${productNameParts[0][0]}${productNameParts[1][0]}`
            : productNameParts[0].substring(0, 2);

        const formattedDate = formatDate(sale.saleDatetime);

        return (
          <div
            key={sale.id || `sale-${Math.random()}`}
            className="flex items-center"
          >
            <Avatar className="h-9 w-9 bg-gray-300">
              <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {sale.productName || "Unknown Product"}
              </p>
              <p className="text-sm text-muted-foreground">
                {sale.storeLocation || "Unknown Location"} • {formattedDate}
              </p>
            </div>
            <div className="ml-auto font-medium">
              +£{sale.totalAmount ? sale.totalAmount.toFixed(2) : "0.00"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
