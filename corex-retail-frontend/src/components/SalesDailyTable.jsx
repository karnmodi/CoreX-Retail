import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export function SalesDailyTable({ sales = [] }) {
  if (!sales || sales.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No sales records found for this date.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const time = sale.saleDatetime 
              ? format(new Date(sale.saleDatetime), 'HH:mm:ss')
              : 'N/A';
              
            return (
              <TableRow key={sale.id}>
                <TableCell>{time}</TableCell>
                <TableCell className="font-medium">{sale.productName}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>£{sale.unitPrice ? sale.unitPrice.toFixed(2) : "0.00"}</TableCell>
                <TableCell className="text-right">£{sale.totalAmount ? sale.totalAmount.toFixed(2) : "0.00"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}