"use client"

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Default data will be used if no real data is provided
const defaultData = [
  { name: "Q1", actual: 35000, target: 40000 },
  { name: "Q2", actual: 42000, target: 45000 },
  { name: "Q3", actual: 38000, target: 42000 },
  { name: "Q4", actual: 48000, target: 50000 },
];

export function SalesTargetProgress({ data }) {
  // Format data for the chart if needed
  const chartData = Array.isArray(data) ? data : defaultData;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`£${value.toFixed(2)}`, undefined]} 
            labelFormatter={(label) => `Quarter: ${label}`} 
          />
          <Legend />
          <Bar dataKey="actual" fill="#8884d8" name="Actual Sales" />
          <Bar dataKey="target" fill="#82ca9d" name="Target Sales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}