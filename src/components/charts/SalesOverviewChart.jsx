"use client"

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", sales: 4000, target: 4400 },
  { name: "Feb", sales: 3000, target: 3500 },
  { name: "Mar", sales: 5000, target: 4800 },
  { name: "Apr", sales: 2780, target: 3000 },
  { name: "May", sales: 1890, target: 2000 },
  { name: "Jun", sales: 2390, target: 2500 },
  { name: "Jul", sales: 3490, target: 3200 },
  { name: "Aug", sales: 4000, target: 3800 },
  { name: "Sep", sales: 2780, target: 3000 },
  { name: "Oct", sales: 1890, target: 2200 },
  { name: "Nov", sales: 3578, target: 3400 },
  { name: "Dec", sales: 5000, target: 4800 },
];

export function SalesOverviewChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
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
          <Tooltip formatter={(value) => [`£${value}`, undefined]} labelFormatter={(label) => `Month: ${label}`} />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} name="Actual Sales" />
          <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target Sales" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}