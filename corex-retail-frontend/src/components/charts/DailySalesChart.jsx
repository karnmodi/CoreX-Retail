"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { format } from "date-fns";
import { useSales } from "../../configs/SalesContext";

const formatDate = (dateString) => {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return format(date, "MMM dd");
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: £
            {entry.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DailySalesChart() {
  const {
    loadSalesByDateDaily,
    salesByDateDaily,
    loadSalesTargetsByRange,
    salesTargetsByRange,
    loading,
  } = useSales();
  const [processedData, setProcessedData] = useState([]);
  const [maxValue, setMaxValue] = useState(10000);
  const dataFetched = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (dataFetched.current) return;
      dataFetched.current = true;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      console.log(
        `[DailySalesChart] Fetching data from ${formattedStartDate} to ${formattedEndDate}`
      );

      try {
        await Promise.all([
          loadSalesByDateDaily({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          }),
          loadSalesTargetsByRange({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          }),
        ]);
      } catch (error) {
        console.error("[DailySalesChart] Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (salesByDateDaily && salesByDateDaily.length > 0) {
      console.log(
        `[DailySalesChart] Processing ${salesByDateDaily.length} days of data`
      );
      console.log("[DailySalesChart] Target data:", salesTargetsByRange);

      // Create a map of dates to targets
      const targetsByDate = {};
      
      if (salesTargetsByRange && salesTargetsByRange.summary) {
        // Extract targets from the summary object
        Object.entries(salesTargetsByRange.summary).forEach(([key, value]) => {
          if (key.startsWith('daily-')) {
            // The key format is "daily-YYYY-MM-DD"
            const datePart = key.substring(6); // Extract the YYYY-MM-DD part
            targetsByDate[datePart] = value.target;
          }
        });
      }
      
      console.log("[DailySalesChart] Mapped targets by date:", targetsByDate);

      // Combine sales data with targets
      const chartData = salesByDateDaily.map((item) => {
        const date = item.date;
        const targetValue = targetsByDate[date] || 0;
        
        console.log(`[DailySalesChart] Date: ${date}, Sales: ${item.totalAmount}, Target: ${targetValue}`);
        
        return {
          date,
          sales: item.totalAmount || 0,
          target: targetValue,
        };
      });

      // Calculate max value for y-axis
      const maxSales = Math.max(...chartData.map((item) => item.sales || 0));
      const maxTarget = Math.max(...chartData.map((item) => item.target || 0));
      const calculatedMax =
        Math.ceil((Math.max(maxSales, maxTarget) * 1.1) / 1000) * 1000;

      setProcessedData(chartData);
      setMaxValue(calculatedMax > 0 ? calculatedMax : 10000);
    }
  }, [salesByDateDaily, salesTargetsByRange]);

  if (loading.salesByDateDaily) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Display empty state if no data
  if (!processedData.length) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No daily sales data available for the selected period.
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            domain={[0, maxValue]}
            tickFormatter={(value) => `£${value / 1000}k`}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend align="right" verticalAlign="top" height={36} />
          <ReferenceLine y={0} stroke="#cbd5e1" />
          <Line
            type="monotone"
            dataKey="sales"
            name="Daily Sales"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{
              r: 5,
              stroke: "#8884d8",
              strokeWidth: 1,
              fill: "#fff",
            }}
          />
          <Line
            type="monotone"
            dataKey="target"
            name="Daily Target"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{
              r: 5,
              stroke: "#4ade80",
              strokeWidth: 1,
              fill: "#fff",
            }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}