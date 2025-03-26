"use client"

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Premium Headphones", sales: 1440 },
  { name: "Wireless Earbuds", sales: 1500 },
  { name: "Mechanical Keyboard", sales: 1200 },
  { name: "Office Chair", sales: 1250 },
  { name: "External SSD", sales: 980 },
];

export function TopProducts() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" scale="band" width={100} />
          <Tooltip formatter={(value) => [`£${value}`, "Sales"]} />
          <Bar dataKey="sales" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}