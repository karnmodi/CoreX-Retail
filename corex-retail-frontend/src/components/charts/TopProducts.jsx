"use client"

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Default data will be used if no real data is provided
const defaultData = [
  { name: "Premium Headphones", sales: 1440 },
  { name: "Wireless Earbuds", sales: 1500 },
  { name: "Mechanical Keyboard", sales: 1200 },
  { name: "Office Chair", sales: 1250 },
  { name: "External SSD", sales: 980 },
];

export function TopProducts({ data = [] }) {
  // Format the data for the chart if real data is provided
  const formatProductData = (productsData) => {
    if (!Array.isArray(productsData) || productsData.length === 0) return defaultData;

    // If the data is already in the right format, use it directly
    if (productsData[0]?.name && productsData[0]?.sales) {
      return productsData;
    }

    // Format from API data
    return productsData.map(product => ({
      name: product.productName || "Unknown Product",
      sales: product.totalAmount || 0
    })).sort((a, b) => b.sales - a.sales).slice(0, 5);
  };

  const chartData = formatProductData(data);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            scale="band" 
            width={100} 
            tick={{ fontSize: 12 }}
            // Truncate long product names
            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
          />
          <Tooltip 
            formatter={(value) => [`£${value.toFixed(2)}`, "Sales"]} 
            // Show full product name in tooltip
            labelFormatter={(label) => `Product: ${label}`}
          />
          <Bar dataKey="sales" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}