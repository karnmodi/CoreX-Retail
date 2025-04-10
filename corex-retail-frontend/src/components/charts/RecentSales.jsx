import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export function RecentSales({ data = [] }) {
  // If no data is provided, show a message
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px] text-muted-foreground">
        No recent sales to display
      </div>
    );
  }

  // Limit to 5 sales
  const displayData = data.slice(0, 5);

  return (
    <div className="space-y-8">
      {displayData.map((sale) => {
        // Generate initials for the avatar from the product name
        const productNameParts = (sale.productName || "Product").split(" ");
        const initials = productNameParts.length > 1 
          ? `${productNameParts[0][0]}${productNameParts[1][0]}` 
          : productNameParts[0].substring(0, 2);
        
        // Format date if available
        const formattedDate = sale.saleDatetime
          ? format(new Date(sale.saleDatetime), 'MMM dd, yyyy HH:mm')
          : '';

        return (
          <div key={sale.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
              <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{sale.productName || "Unknown Product"}</p>
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