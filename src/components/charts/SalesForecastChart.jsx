"use client"

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const data = [
  { name: "Jan", actual: 4000, forecast: null },
  { name: "Feb", actual: 3000, forecast: null },
  { name: "Mar", actual: 5000, forecast: null },
  { name: "Apr", actual: 2780, forecast: null },
  { name: "May", actual: 1890, forecast: null },
  { name: "Jun", actual: 2390, forecast: null },
  { name: "Jul", actual: null, forecast: 3200 },
  { name: "Aug", actual: null, forecast: 3800 },
  { name: "Sep", actual: null, forecast: 3500 },
  { name: "Oct", actual: null, forecast: 4200 },
  { name: "Nov", actual: null, forecast: 4800 },
  { name: "Dec", actual: null, forecast: 5200 },
];

export function SalesForecastChart() {
  return (
    <div className="h-[400px] w-full">
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
          <Tooltip formatter={(value) => [`$${value}`, undefined]} labelFormatter={(label) => `Month: ${label}`} />
          <Legend />
          <ReferenceLine x="Jun" stroke="#666" label="Current" />
          <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual Sales" strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#82ca9d"
            strokeDasharray="5 5"
            name="Forecasted Sales"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}